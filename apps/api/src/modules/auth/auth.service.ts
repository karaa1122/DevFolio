import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '../../database/entities/user.entity';
import { EmailService } from './email.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { AuthTokens } from '@devfolio/shared';

const SALT_ROUNDS = 12;
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const emailVerificationToken = randomBytes(32).toString('hex');
    const emailVerificationTokenExpiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

    const user = this.userRepo.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
      emailVerificationToken,
      emailVerificationTokenExpiresAt,
    });
    await this.userRepo.save(user);

    this.emailService
      .sendVerificationEmail(user.email, user.name, emailVerificationToken)
      .catch((err) => this.logger.error(`Verification email failed for ${user.email}: ${err.message}`));

    return { message: 'Account created. Check your email to verify before signing in.' };
  }

  async login(dto: LoginDto): Promise<AuthTokens & { user: Partial<User> }> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isEmailVerified) {
      // Regenerate token if missing or expired, then resend
      const needsNewToken =
        !user.emailVerificationToken ||
        !user.emailVerificationTokenExpiresAt ||
        user.emailVerificationTokenExpiresAt < new Date();

      let token = user.emailVerificationToken;
      if (needsNewToken) {
        token = randomBytes(32).toString('hex');
        await this.userRepo.update(user.id, {
          emailVerificationToken: token,
          emailVerificationTokenExpiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
        });
      }

      this.emailService
        .sendVerificationEmail(user.email, user.name, token!)
        .catch(() => {});

      throw new ForbiddenException(
        'Please verify your email before signing in. A new verification link has been sent.',
      );
    }

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { ...tokens, user: this.sanitizeUser(user) };
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { emailVerificationToken: token } });

    if (!user) throw new BadRequestException('Invalid or expired verification link');

    if (!user.emailVerificationTokenExpiresAt || user.emailVerificationTokenExpiresAt < new Date()) {
      throw new BadRequestException('Verification link has expired. Please request a new one.');
    }

    await this.userRepo.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null as unknown as string,
      emailVerificationTokenExpiresAt: null as unknown as Date,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.passwordHash) return; // silently ignore — don't reveal existence

    const token = randomBytes(32).toString('hex');
    await this.userRepo.update(user.id, {
      passwordResetToken: token,
      passwordResetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    this.emailService
      .sendPasswordResetEmail(user.email, user.name, token)
      .catch((err) => this.logger.error(`Password reset email failed for ${user.email}: ${err.message}`));
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { passwordResetToken: token } });

    if (!user) throw new BadRequestException('Invalid or expired reset link');
    if (!user.passwordResetTokenExpiresAt || user.passwordResetTokenExpiresAt < new Date()) {
      throw new BadRequestException('Reset link has expired. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepo.update(user.id, {
      passwordHash,
      passwordResetToken: null as unknown as string,
      passwordResetTokenExpiresAt: null as unknown as Date,
      refreshTokenHash: null as unknown as string, // invalidate all sessions
    });
  }

  async resendVerification(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    // Always return silently — don't reveal whether the email exists
    if (!user || user.isEmailVerified) return;

    const token = randomBytes(32).toString('hex');
    await this.userRepo.update(user.id, {
      emailVerificationToken: token,
      emailVerificationTokenExpiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    });

    await this.emailService.sendVerificationEmail(user.email, user.name, token);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user?.refreshTokenHash) throw new UnauthorizedException('Session expired');

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.userRepo.update(userId, { refreshTokenHash: null as unknown as string });
  }

  async findOrCreateGithubUser(profile: {
    githubId: string;
    username: string;
    name: string;
    email: string;
    avatar?: string;
    accessToken: string;
  }): Promise<AuthTokens & { user: Partial<User> }> {
    let user = await this.userRepo.findOne({ where: { githubId: profile.githubId } });

    if (!user) {
      user = await this.userRepo.findOne({ where: { email: profile.email } });
      if (user) {
        user.githubId = profile.githubId;
        user.githubUsername = profile.username;
        user.githubAccessToken = profile.accessToken;
      } else {
        user = this.userRepo.create({
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar,
          githubId: profile.githubId,
          githubUsername: profile.username,
          githubAccessToken: profile.accessToken,
          isEmailVerified: true, // GitHub already verified their email
        });
      }
      await this.userRepo.save(user);
    } else {
      user.githubAccessToken = profile.accessToken;
      await this.userRepo.save(user);
    }

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return { ...tokens, user: this.sanitizeUser(user) };
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = { sub: user.id, email: user.email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn') ?? '7d',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn') ?? '30d',
      }),
    ]);

    return { accessToken, refreshToken, expiresIn: 604800 };
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const hash = await bcrypt.hash(token, SALT_ROUNDS);
    await this.userRepo.update(userId, { refreshTokenHash: hash });
  }

  sanitizeUser(user: User): Partial<User> {
    const {
      passwordHash: _ph,
      refreshTokenHash: _rh,
      githubAccessToken: _ga,
      emailVerificationToken: _evt,
      emailVerificationTokenExpiresAt: _evte,
      passwordResetToken: _prt,
      passwordResetTokenExpiresAt: _prte,
      ...rest
    } = user;
    return rest;
  }
}

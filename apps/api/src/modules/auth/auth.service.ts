import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities/user.entity';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { AuthTokens } from '@devfolio/shared';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens & { user: Partial<User> }> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = this.userRepo.create({ email: dto.email, name: dto.name, passwordHash });
    await this.userRepo.save(user);

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { ...tokens, user: this.sanitizeUser(user) };
  }

  async login(dto: LoginDto): Promise<AuthTokens & { user: Partial<User> }> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { ...tokens, user: this.sanitizeUser(user) };
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
          isEmailVerified: true,
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

  private sanitizeUser(user: User): Partial<User> {
    const { passwordHash: _ph, refreshTokenHash: _rh, githubAccessToken: _ga, ...rest } = user;
    return rest;
  }
}

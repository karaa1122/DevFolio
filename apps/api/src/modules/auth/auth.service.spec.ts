import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { User } from '../../database/entities/user.entity';

const mockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-uuid',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: '$2b$12$hashedpassword',
  refreshTokenHash: null as unknown as string,
  avatar: null as unknown as string,
  bio: null as unknown as string,
  githubId: null as unknown as string,
  githubUsername: null as unknown as string,
  githubAccessToken: null as unknown as string,
  googleId: null as unknown as string,
  isEmailVerified: true,
  emailVerificationToken: null as unknown as string,
  emailVerificationTokenExpiresAt: null as unknown as Date,
  passwordResetToken: null as unknown as string,
  passwordResetTokenExpiresAt: null as unknown as Date,
  failedLoginAttempts: 0,
  lockedUntil: null as unknown as Date,
  createdAt: new Date(),
  updatedAt: new Date(),
  portfolios: [],
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;

  const userRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
    verifyAsync: jest.fn(),
  };

  const configService = {
    get: jest.fn().mockReturnValue('secret'),
  };

  const emailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  };

  const encryptionService = {
    encrypt: jest.fn().mockReturnValue('encrypted'),
    decrypt: jest.fn().mockReturnValue('decrypted'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: EmailService, useValue: emailService },
        { provide: EncryptionService, useValue: encryptionService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('returns a message on success (no tokens issued — email verification required)', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const user = mockUser();
      userRepo.create.mockReturnValue(user);
      userRepo.save.mockResolvedValue(user);

      const result = await service.register({
        name: 'Test',
        email: 'test@example.com',
        password: 'pass123',
      });

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
    });

    it('throws ConflictException when email already registered', async () => {
      userRepo.findOne.mockResolvedValue(mockUser());

      await expect(
        service.register({ name: 'Test', email: 'test@example.com', password: 'pass123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns tokens on valid credentials', async () => {
      const hash = await bcrypt.hash('correctpass', 12);
      userRepo.findOne.mockResolvedValue(mockUser({ passwordHash: hash }));
      userRepo.update.mockResolvedValue({});

      const result = await service.login({ email: 'test@example.com', password: 'correctpass' });

      expect(result.accessToken).toBe('mock-token');
    });

    it('throws UnauthorizedException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException on wrong password', async () => {
      const hash = await bcrypt.hash('correctpass', 12);
      userRepo.findOne.mockResolvedValue(mockUser({ passwordHash: hash }));

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('throws UnauthorizedException when token is invalid', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

      await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when refresh token hash mismatch', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-uuid' });
      const hash = await bcrypt.hash('other-token', 12);
      userRepo.findOne.mockResolvedValue(mockUser({ refreshTokenHash: hash }));

      await expect(service.refresh('wrong-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('clears the refresh token hash', async () => {
      userRepo.update.mockResolvedValue({});
      const userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

      await service.logout(userId);

      expect(userRepo.update).toHaveBeenCalledWith(userId, { refreshTokenHash: null });
    });
  });
});

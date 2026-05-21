import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { User } from '../../database/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import type { AuthTokens } from '@devfolio/shared';

class ResendVerificationDto {
  @IsEmail()
  email: string;
}

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProd = this.configService.get<string>('app.env') === 'production';
    const base = { httpOnly: true, secure: isProd, sameSite: 'lax' as const, path: '/' };
    res.cookie('access_token', accessToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...base, maxAge: 30 * 24 * 60 * 60 * 1000 });
  }

  private clearCookies(res: Response) {
    const opts = { httpOnly: true, path: '/' };
    res.clearCookie('access_token', opts);
    res.clearCookie('refresh_token', opts);
  }

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new account' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  @Public()
  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = req.cookies as Record<string, string> | undefined;
    const body = req.body as { refreshToken?: string } | undefined;
    const token = cookies?.refresh_token ?? body?.refreshToken;
    if (!token) throw new UnauthorizedException('No refresh token provided');
    const tokens = await this.authService.refresh(token);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return {};
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async logout(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(user.id);
    this.clearCookies(res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  me(@CurrentUser() user: User) {
    return this.authService.sanitizeUser(user);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address with token' })
  async verifyEmail(@Body('token') token: string) {
    await this.authService.verifyEmail(token);
    return { message: 'Email verified successfully' };
  }

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { message: 'If that email has an account, a reset link has been sent.' };
  }

  @Public()
  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);
    return { message: 'Password updated. You can now sign in.' };
  }

  @Public()
  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification link' })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.authService.resendVerification(dto.email);
    return { message: 'If that email exists and is unverified, a new link has been sent.' };
  }

  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Initiate GitHub OAuth flow' })
  githubAuth() {
    // Handled by passport
  }

  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    const tokens = req.user as AuthTokens & { user: Partial<User> };
    const frontendUrl = this.configService.get<string>('frontend.url') ?? 'http://localhost:3000';
    const code = this.authService.createOAuthCode(tokens);
    res.redirect(`${frontendUrl}/auth/callback?code=${code}`);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  googleAuth() {
    // Handled by passport
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const tokens = req.user as AuthTokens & { user: Partial<User> };
    const frontendUrl = this.configService.get<string>('frontend.url') ?? 'http://localhost:3000';
    const code = this.authService.createOAuthCode(tokens);
    res.redirect(`${frontendUrl}/auth/callback?code=${code}`);
  }

  @Public()
  @Post('github/exchange')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Exchange a one-time OAuth code for tokens (30 s TTL)' })
  async exchangeOAuthCode(
    @Query('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = this.authService.exchangeOAuthCode(code);
    this.setCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }
}

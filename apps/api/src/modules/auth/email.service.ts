import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly enabled: boolean;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(configService.get<string>('RESEND_API_KEY', ''));
    this.fromEmail = configService.get<string>('NOTIFICATION_FROM_EMAIL', 'noreply@devfolioapp.clouda');
    this.enabled = configService.get<string>('NOTIFICATION_EMAIL_ENABLED', 'false') === 'true';
    this.frontendUrl = configService.get<string>('frontend.url') ?? 'http://localhost:3000';
  }

  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    if (!this.enabled) {
      this.logger.debug(`Email disabled — skipping verification to ${to}`);
      return;
    }

    const verifyUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;
    const year = new Date().getFullYear();

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject: 'Verify your DevFolio email',
      html: buildVerificationHtml(name, verifyUrl, year),
    });

    if (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error(`Email send failed: ${error.message}`);
    }

    this.logger.log(`Verification email sent to ${to}`);
  }

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    if (!this.enabled) {
      this.logger.debug(`Email disabled — skipping password reset to ${to}`);
      return;
    }

    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;
    const year = new Date().getFullYear();

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject: 'Reset your DevFolio password',
      html: buildPasswordResetHtml(name, resetUrl, year),
    });

    if (error) {
      this.logger.error(`Failed to send password reset email to ${to}: ${error.message}`);
      throw new Error(`Email send failed: ${error.message}`);
    }

    this.logger.log(`Password reset email sent to ${to}`);
  }
}

function buildPasswordResetHtml(name: string, resetUrl: string, year: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password — DevFolio</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <tr>
          <td style="background:#0f172a;padding:28px 40px;text-align:center;">
            <span style="font-size:20px;font-weight:800;color:#a78bfa;letter-spacing:-0.5px;">DevFolio</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3;">Reset your password</p>
            <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.7;">Hey ${name}, we received a request to reset your DevFolio password. Click the button below — this link expires in 1 hour.</p>
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-radius:10px;background:#7c3aed;">
                  <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">Reset my password</a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.7;">Button not working? Copy this link:<br/>
              <a href="${resetUrl}" style="color:#7c3aed;word-break:break-all;font-size:12px;">${resetUrl}</a>
            </p>
            <p style="margin:20px 0 0;font-size:12px;color:#cbd5e1;">If you didn't request a password reset, you can safely ignore this email. Your password won't change.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">&copy; ${year} DevFolio. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildVerificationHtml(name: string, verifyUrl: string, year: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email — DevFolio</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

        <!-- Header -->
        <tr>
          <td style="background:#0f172a;padding:28px 40px;text-align:center;">
            <span style="font-size:20px;font-weight:800;color:#a78bfa;letter-spacing:-0.5px;">DevFolio</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3;">Verify your email</p>
            <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.7;">Hey ${name}, you're almost there. One click and your portfolio is ready to build.</p>
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-radius:10px;background:#7c3aed;">
                  <a href="${verifyUrl}" target="_blank" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">Verify my email</a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.7;">Button not working? Copy this link:<br/>
              <a href="${verifyUrl}" style="color:#7c3aed;word-break:break-all;font-size:12px;">${verifyUrl}</a>
            </p>
            <p style="margin:20px 0 0;font-size:12px;color:#cbd5e1;">This link expires in 24 hours. Didn't sign up for DevFolio? You can safely ignore this.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">&copy; ${year} DevFolio. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

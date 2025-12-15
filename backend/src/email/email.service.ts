import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'onboarding@resend.dev';

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured - emails will not be sent');
      return;
    }

    this.resend = new Resend(apiKey);
  }

  // --- UI/HTML Templates ---

  private getEmailWrapper(content: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        ${content}
        <div style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center;">
          <p>This is an automated email from MDHH. Please do not reply.</p>
          <p>For support, contact us at support@mdhh.vn</p>
        </div>
      </div>
    `;
  }

  private getButtonHtml(url: string, text: string, color: string = '#386641'): string {
    return `
      <div style="margin: 25px 0; text-align: center;">
        <a href="${url}" style="display: inline-block; padding: 12px 25px; background-color: ${color}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          ${text}
        </a>
      </div>
    `;
  }

  // --- Email Sending Methods (Updated HTML content) ---

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Skipping email send - RESEND_API_KEY not configured');
      return;
    }

    const verifyUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;

    const htmlContent = this.getEmailWrapper(`
      <h2 style="color: #386641; text-align: center;">Verify Your Email Address 📧</h2>
      <p style="font-size: 16px;">Hello,</p>
      <p style="font-size: 16px;">Thank you for registering with MDHH! Please click the button below to verify your email address and activate your account.</p>
      ${this.getButtonHtml(verifyUrl, 'Verify Email Address')}
      <p style="font-size: 14px; color: #cc0000;"><strong>Important:</strong> This link is valid for **24 hours** only.</p>
      <p style="font-size: 14px;">If you didn't request this verification, you can safely ignore this email.</p>
    `);

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Verify Your Email - MDHH',
        html: htmlContent,
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Skipping email send - RESEND_API_KEY not configured');
      return;
    }

    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

    const htmlContent = this.getEmailWrapper(`
      <h2 style="color: #DDAA00; text-align: center;">Password Reset Request 🔑</h2>
      <p style="font-size: 16px;">Hello,</p>
      <p style="font-size: 16px;">You are receiving this email because we received a password reset request for your account. Click the button below to set a new password:</p>
      ${this.getButtonHtml(resetUrl, 'Reset Password', '#DDAA00')}
      <p style="font-size: 14px; color: #cc0000;"><strong>Important:</strong> This link is only valid for the next **1 hour**.</p>
      <p style="font-size: 14px;">If you did not request a password reset, please ignore this email.</p>
    `);

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Reset Your Password - MDHH',
        html: htmlContent,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send reset email to ${email}`, error);
      throw error;
    }
  }

  async sendOrderConfirmationEmail(
    email: string,
    orderId: string,
    totalAmount: number,
    items: any[],
    buyerName: string
  ): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Skipping email send - RESEND_API_KEY not configured');
      return;
    }

    try {
      const itemsList = items
        .map(
          (item) =>
            `<li style="margin-bottom: 8px;"><strong>${item.souvenirs.name}</strong> x ${item.quantity} - <span style="float: right;">${(item.quantity * Number(item.price)).toLocaleString('vi-VN')} VND</span></li>`
        )
        .join('');

      const htmlContent = this.getEmailWrapper(`
        <h2 style="color: #386641; text-align: center;">Order Confirmed! 🎉</h2>
        <p style="font-size: 16px;">Dear <strong>${buyerName}</strong>,</p>
        <p style="font-size: 16px;">Thank you for your purchase! Your order **#${orderId}** has been successfully placed and will be processed shortly.</p>
        
        <div style="background-color: #f0f8f0; padding: 15px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #386641; margin-top: 0; border-bottom: 1px solid #dcdcdc; padding-bottom: 10px;">Order Summary</h3>
          <p style="margin-bottom: 5px;"><strong>Order ID:</strong> ${orderId}</p>
          <p style="margin-bottom: 5px;"><strong>Customer Name:</strong> ${buyerName}</p>
          <p><strong>Email:</strong> ${email}</p>
        </div>

        <h3 style="color: #386641; border-bottom: 1px solid #dcdcdc; padding-bottom: 5px;">Items Ordered:</h3>
        <ul style="list-style-type: none; padding: 0;">
          ${itemsList}
        </ul>
        
        <div style="background-color: #386641; color: white; padding: 15px; border-radius: 8px; margin-top: 25px; text-align: center;">
          <h3 style="margin: 0; font-size: 20px;">Total Amount: ${totalAmount.toLocaleString('vi-VN')} VND</h3>
        </div>

        <p style="margin-top: 20px; text-align: center; font-size: 16px;">We appreciate your support!</p>
      `);

      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `Order Confirmation #${orderId} - MDHH`,
        html: htmlContent,
      });
      this.logger.log(`Order confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send order confirmation email to ${email}`, error);
      // Don't throw - email failure shouldn't break order flow
    }
  }

  async sendAccountCreationEmail(email: string, displayName: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Skipping email send - RESEND_API_KEY not configured');
      return;
    }

    const htmlContent = this.getEmailWrapper(`
      <h2 style="color: #386641; text-align: center;">Welcome to MDHH! 👋</h2>
      <p style="font-size: 16px;">Hi **${displayName}**,</p>
      <p style="font-size: 16px;">Your account has been created successfully! We're thrilled to have you join our learning community.</p>
      <p style="font-size: 16px;">You can now log in and access all the features of our educational platform.</p>
      ${this.getButtonHtml(`${this.configService.get<string>('FRONTEND_URL')}/login`, 'Go to MDHH')}
      <p style="font-size: 16px;">Start exploring and sharing educational resources today!</p>
      <p style="margin-top: 20px;">Best regards,<br>MDHH Team</p>
    `);

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Welcome to MDHH - Account Created Successfully',
        html: htmlContent,
      });
      this.logger.log(`Account creation email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send account creation email to ${email}`, error);
      // Don't throw - email failure shouldn't break registration flow
    }
  }

  async sendGoogleLoginEmail(email: string, displayName: string, isNewAccount: boolean): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Skipping email send - RESEND_API_KEY not configured');
      return;
    }

    const subject = isNewAccount
      ? 'Welcome to MDHH - Account Created via Google'
      : 'Login Notification - MDHH';

    const loginDetailsHtml = `
      <div style="background-color: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #4285F4;">
        <p style="margin-bottom: 5px;"><strong>Time:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        <p><strong>Method:</strong> Google Authentication 🌐</p>
      </div>
    `;

    const newAccountMessage = `
      <h2 style="color: #4285F4; text-align: center;">Welcome to MDHH! 🎉</h2>
      <p style="font-size: 16px;">Hi **${displayName}**,</p>
      <p style="font-size: 16px;">Your account has been successfully created and linked using **Google authentication**.</p>
      <p style="font-size: 16px;">You can now access our platform using your Google account.</p>
      ${loginDetailsHtml}
      <p style="font-size: 16px;">Start exploring and sharing educational resources today!</p>
      <p style="margin-top: 20px;">Best regards,<br>MDHH Team</p>
    `;

    const existingLoginMessage = `
      <h2 style="color: #4285F4; text-align: center;">Login Notification 🔔</h2>
      <p style="font-size: 16px;">Hi **${displayName}**,</p>
      <p style="font-size: 16px;">You have successfully logged into your MDHH account using **Google authentication**.</p>
      ${loginDetailsHtml}
      <p style="font-size: 16px;">If you did not authorize this login, please contact support immediately to secure your account.</p>
      <p style="margin-top: 20px;">Best regards,<br>MDHH Team</p>
    `;

    const htmlContent = this.getEmailWrapper(isNewAccount ? newAccountMessage : existingLoginMessage);

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: subject,
        html: htmlContent,
      });
      this.logger.log(`Google login email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send Google login email to ${email}`, error);
      // Don't throw - email failure shouldn't break login flow
    }
  }

  async sendDiscordLoginEmail(email: string, displayName: string, isNewAccount: boolean): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Skipping email send - RESEND_API_KEY not configured');
      return;
    }

    const subject = isNewAccount
      ? 'Welcome to MDHH - Account Created via Discord'
      : 'Login Notification - MDHH';

    const loginDetailsHtml = `
      <div style="background-color: #f3f4ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #5865F2;">
        <p style="margin-bottom: 5px;"><strong>Time:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        <p><strong>Method:</strong> Discord Authentication 🎮</p>
      </div>
    `;

    const newAccountMessage = `
      <h2 style="color: #5865F2; text-align: center;">Welcome to MDHH! 💙</h2>
      <p style="font-size: 16px;">Hi **${displayName}**,</p>
      <p style="font-size: 16px;">Your account has been successfully created and linked using **Discord authentication**.</p>
      <p style="font-size: 16px;">You can now access our platform using your Discord account.</p>
      ${loginDetailsHtml}
      <p style="font-size: 16px;">Start exploring and sharing educational resources today!</p>
      <p style="margin-top: 20px;">Best regards,<br>MDHH Team</p>
    `;

    const existingLoginMessage = `
      <h2 style="color: #5865F2; text-align: center;">Login Notification 🔔</h2>
      <p style="font-size: 16px;">Hi **${displayName}**,</p>
      <p style="font-size: 16px;">You have successfully logged into your MDHH account using **Discord authentication**.</p>
      ${loginDetailsHtml}
      <p style="font-size: 16px;">If you did not authorize this login, please contact support immediately to secure your account.</p>
      <p style="margin-top: 20px;">Best regards,<br>MDHH Team</p>
    `;

    const htmlContent = this.getEmailWrapper(isNewAccount ? newAccountMessage : existingLoginMessage);

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: subject,
        html: htmlContent,
      });
      this.logger.log(`Discord login email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send Discord login email to ${email}`, error);
      // Don't throw - email failure shouldn't break login flow
    }
  }

  async sendTraditionalLoginEmail(email: string, displayName: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Skipping email send - RESEND_API_KEY not configured');
      return;
    }

    const loginDetailsHtml = `
      <div style="background-color: #f0fff0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #386641;">
        <p style="margin-bottom: 5px;"><strong>Time:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        <p><strong>Method:</strong> Email & Password 🔒</p>
      </div>
    `;

    const htmlContent = this.getEmailWrapper(`
      <h2 style="color: #386641; text-align: center;">Login Notification 🔔</h2>
      <p style="font-size: 16px;">Hi **${displayName}**,</p>
      <p style="font-size: 16px;">You have successfully logged into your MDHH account using traditional **Email & Password** credentials.</p>
      ${loginDetailsHtml}
      <p style="font-size: 16px;">If you did not authorize this login, please **change your password immediately** and contact support.</p>
      <p style="margin-top: 20px;">Best regards,<br>MDHH Team</p>
    `);

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Login Notification - MDHH',
        html: htmlContent,
      });
      this.logger.log(`Traditional login email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send traditional login email to ${email}`, error);
      // Don't throw - email failure shouldn't break login flow
    }
  }
}
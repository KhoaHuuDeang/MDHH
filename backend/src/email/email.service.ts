import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verifyUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_USER'),
        to: email,
        subject: 'Verify Your Email - MDHH',
        html: `
          <h2>Email Verification</h2>
          <p>Click the link below to verify your email:</p>
          <a href="${verifyUrl}">${verifyUrl}</a>
          <p>This link expires in 24 hours.</p>
        `,
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_USER'),
        to: email,
        subject: 'Reset Your Password - MDHH',
        html: `
          <h2>Password Reset</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link expires in 1 hour.</p>
        `,
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
    try {
      const itemsList = items
        .map(
          (item) =>
            `<li><strong>${item.souvenirs.name}</strong> x ${item.quantity} - ${Number(item.price).toLocaleString('vi-VN')} VND = ${(item.quantity * Number(item.price)).toLocaleString('vi-VN')} VND</li>`
        )
        .join('');

      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_USER'),
        to: email,
        subject: 'Order Confirmation - MDHH',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #386641; text-align: center;">Order Confirmation</h2>
            <p>Dear <strong>${buyerName}</strong>,</p>
            <p>Your order has been confirmed successfully!</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #386641; margin-top: 0;">Order Details</h3>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Customer Name:</strong> ${buyerName}</p>
              <p><strong>Email:</strong> ${email}</p>
            </div>

            <h3 style="color: #386641;">Order Items:</h3>
            <ul style="list-style-type: none; padding: 0;">
              ${itemsList}
            </ul>
            
            <div style="background-color: #386641; color: white; padding: 15px; border-radius: 5px; margin-top: 20px; text-align: center;">
              <h3 style="margin: 0;">Total Amount: ${totalAmount.toLocaleString('vi-VN')} VND</h3>
            </div>

            <p style="margin-top: 20px;">Thank you for your purchase!</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
              This is an automated email. Please do not reply.<br>
              For support, contact us at support@mdhh.vn
            </p>
          </div>
        `,
      });
      this.logger.log(`Order confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send order confirmation email to ${email}`, error);
      // Don't throw - email failure shouldn't break order flow
    }
  }

  async sendAccountCreationEmail(email: string, displayName: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_USER'),
        to: email,
        subject: 'Welcome to MDHH - Account Created Successfully',
        html: `
          <h2>Welcome to MDHH!</h2>
          <p>Hi ${displayName},</p>
          <p>Your account has been created successfully!</p>
          <p>You can now access all features of our learning platform.</p>
          <p>Start exploring and sharing educational resources today!</p>
          <br>
          <p>Best regards,<br>MDHH Team</p>
        `,
      });
      this.logger.log(`Account creation email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send account creation email to ${email}`, error);
      // Don't throw - email failure shouldn't break registration flow
    }
  }
}

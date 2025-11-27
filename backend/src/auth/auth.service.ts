import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SessionService } from './session.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, LoginDto } from '../users/user.dto';

import { Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Security and Performance Constants
  private readonly BCRYPT_ROUNDS = 12;
  private readonly SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

  // Rate Limiting Configuration
  private readonly LOGIN_RATE_LIMIT = 5;
  private readonly LOGIN_RATE_WINDOW = 15 * 60 * 1000;
  private readonly REGISTER_RATE_LIMIT = 3;
  private readonly REGISTER_RATE_WINDOW = 60 * 60 * 1000;

  // Retry Logic Configuration
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_BASE = 1000;

  // In-memory rate limiting storage
  private loginAttempts = new Map<string, { count: number; windowStart: number }>();
  private registerAttempts = new Map<string, { count: number; windowStart: number }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private sessionService: SessionService,
  ) {
    setInterval(() => this.cleanupRateLimits(), 30 * 60 * 1000);
  }

  private calculateRetryDelay(attempt: number): number {
    return this.RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
  }

  private cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, entry] of this.loginAttempts.entries()) {
      if (now - entry.windowStart > this.LOGIN_RATE_WINDOW) {
        this.loginAttempts.delete(key);
      }
    }
    for (const [key, entry] of this.registerAttempts.entries()) {
      if (now - entry.windowStart > this.REGISTER_RATE_WINDOW) {
        this.registerAttempts.delete(key);
      }
    }
  }

  private checkRateLimit(
    identifier: string,
    limitsMap: Map<string, { count: number; windowStart: number }>,
    maxAttempts: number,
    windowMs: number,
    operation: string,
  ): void {
    const now = Date.now();
    const entry = limitsMap.get(identifier);

    if (!entry || now - entry.windowStart > windowMs) {
      limitsMap.set(identifier, { count: 1, windowStart: now });
      return;
    }

    if (entry.count >= maxAttempts) {
      const timeRemaining = Math.ceil((windowMs - (now - entry.windowStart)) / 1000 / 60);
      this.logger.warn(`Rate limit exceeded for ${operation}: ${identifier}`);
      throw new BadRequestException(
        `Too many ${operation} attempts. Please try again in ${timeRemaining} minutes.`,
      );
    }

    entry.count++;
  }

  async validateUser(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    try {
      const user = await this.prisma.users.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          displayname: true,
          birth: true,
          password: true,
          avatar: true,
          email_verified: true,
          is_disabled: true,
          disabled_until: true,
          roles: {
            select: {
              id: true,
              name: true,
            },
          },
          created_at: true,
          updated_at: true,
        },
      });

      if (!user) {
        this.logger.warn(`Login attempt for non-existent email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if account is disabled
      if (user.is_disabled) {
        if (user.disabled_until && new Date() < user.disabled_until) {
          const remainingTime = Math.ceil(
            (user.disabled_until.getTime() - Date.now()) / 1000 / 60,
          );
          throw new UnauthorizedException(
            `Account is temporarily disabled. Try again in ${remainingTime} minutes.`,
          );
        }
      }

      if (!user.password) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password attempt for email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Error during user validation:', error);
      throw new InternalServerErrorException(
        'An error occurred during authentication',
      );
    }
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);

    // Rate limiting check
    this.checkRateLimit(
      loginDto.email,
      this.loginAttempts,
      this.LOGIN_RATE_LIMIT,
      this.LOGIN_RATE_WINDOW,
      'login',
    );

    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const expiresAt = new Date(Date.now() + this.SESSION_DURATION_MS);
    const session = await this.sessionService.createSession(user.id, expiresAt);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.roles.name,
      displayname: user.displayname,
      sessionToken: session.session_token,
    };

    // Clear rate limit on successful login
    this.loginAttempts.delete(loginDto.email);

    this.logger.log(`User logged in successfully: ${user.email}`);

    return {
      message: 'Login successful',
      status: 200,
      result: {
        accessToken: this.jwtService.sign(payload),
        sessionToken: session.session_token,
        expires: session.expires,
        user: {
          id: user.id,
          email: user.email,
          displayname: user.displayname,
          username: user.username,
          role: user.roles.name,
          birth: user.birth,
          avatar: user.avatar,
          emailVerified: user.email_verified,
        },
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    this.logger.log(`Registration attempt for email: ${createUserDto.email}`);

    // Rate limiting
    this.checkRateLimit(
      createUserDto.email,
      this.registerAttempts,
      this.REGISTER_RATE_LIMIT,
      this.REGISTER_RATE_WINDOW,
      'registration',
    );

    // Input validation
    if (!createUserDto.username || createUserDto.username.length < 3) {
      throw new BadRequestException('Username must be at least 3 characters long');
    }
    if (!createUserDto.displayname) {
      throw new BadRequestException('Display name is required');
    }
    if (!createUserDto.password || createUserDto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const [existingEmail, existingUsername, roleCheck] = await Promise.all([
      this.prisma.users.findUnique({
        where: { email: createUserDto.email },
        select: { id: true, email: true },
      }),
      this.prisma.users.findUnique({
        where: { username: createUserDto.username },
        select: { id: true, username: true },
      }),
      this.prisma.roles.findUnique({
        where: { name: 'USER' },
        select: { id: true },
      }),
    ]);

    if (existingEmail) {
      this.logger.warn(`Email already exists: ${createUserDto.email}`);
      throw new ConflictException('Email đã được sử dụng');
    }
    if (existingUsername) {
      this.logger.warn(`Username already exists: ${createUserDto.username}`);
      throw new ConflictException('Username đã được sử dụng');
    }
    if (!roleCheck) {
      this.logger.error('USER role not found in database');
      throw new InternalServerErrorException('System configuration error');
    }

    try {
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        this.BCRYPT_ROUNDS,
      );
      const newUser = await this.prisma.users.create({
        data: {
          email: createUserDto.email,
          username: createUserDto.username,
          displayname: createUserDto.displayname,
          password: hashedPassword,
          birth: createUserDto.birth || '2000-01-01',
          email_verified: false,
          roles: { connect: { id: roleCheck.id } },
        },
        include: { roles: true },
      });

      const { password, ...result } = newUser;

      // Clear rate limit on successful registration
      this.registerAttempts.delete(createUserDto.email);

      this.logger.log(`User registered successfully: ${newUser.email}`);

      return {
        message: 'User created successfully',
        status: 201,
        result: {
          user: result,
        },
      };
    } catch (err) {
      this.logger.error('Registration error:', err);
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async sendVerificationEmail(email: string): Promise<{ message: string; status: string; result: any }> {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.email_verified) {
      return {
        message: 'Email already verified',
        status: 'success',
        result: null,
      };
    }

    const token = require('crypto').randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        verification_token: token,
        verification_expires: expires,
      },
    });

    // Email sending logic would go here
    // await this.emailService.sendVerificationEmail(email, token);

    return {
      message: 'Verification email sent',
      status: 'success',
      result: { token }, // Only for testing, remove in production
    };
  }

  async verifyEmail(token: string): Promise<{ message: string; status: string; result: any }> {
    const user = await this.prisma.users.findFirst({
      where: {
        verification_token: token,
        verification_expires: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        verification_token: null,
        verification_expires: null,
      },
    });

    return {
      message: 'Email verified successfully',
      status: 'success',
      result: { email: user.email },
    };
  }

  async forgotPassword(email: string): Promise<{ message: string; status: string; result: any }> {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return {
        message: 'If email exists, reset link sent',
        status: 'success',
        result: null,
      };
    }

    const token = require('crypto').randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        reset_token: token,
        reset_token_expires: expires,
      },
    });

    // Email sending logic would go here
    // await this.emailService.sendPasswordResetEmail(email, token);

    return {
      message: 'If email exists, reset link sent',
      status: 'success',
      result: { token }, // Only for testing, remove in production
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string; status: string; result: any }> {
    const user = await this.prisma.users.findFirst({
      where: {
        reset_token: token,
        reset_token_expires: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      },
    });

    return {
      message: 'Password reset successfully',
      status: 'success',
      result: null,
    };
  }
}

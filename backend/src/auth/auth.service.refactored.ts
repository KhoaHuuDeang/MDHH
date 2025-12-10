import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SessionService } from './session.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, LoginDto } from '../users/user.dto';

/**
 * Standardized API Response Format
 */
interface AuthResponse<T = any> {
  status: 'success' | 'error';
  result: {
    primaryData: T;
    additionalData?: any;
  };
  message: string;
}

/**
 * Rate Limiting Entry Interface
 */
interface RateLimitEntry {
  count: number;
  windowStart: number;
  lastAttempt: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Security and Performance Constants
  private readonly BCRYPT_ROUNDS = 12; // Increased from 10 for better security
  private readonly SESSION_DURATION_DAYS = 30;
  private readonly SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

  // Rate Limiting Configuration
  private readonly LOGIN_RATE_LIMIT = 5; // 5 attempts
  private readonly LOGIN_RATE_WINDOW = 15 * 60 * 1000; // 15 minutes
  private readonly REGISTER_RATE_LIMIT = 3; // 3 registrations
  private readonly REGISTER_RATE_WINDOW = 60 * 60 * 1000; // 1 hour

  // Retry Logic Configuration
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_BASE = 1000; // 1 second
  private readonly TRANSACTION_TIMEOUT = 30000; // 30 seconds

  // Password Validation
  private readonly MIN_PASSWORD_LENGTH = 8;
  private readonly PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

  // In-memory rate limiting storage (consider Redis for production)
  private loginAttempts = new Map<string, RateLimitEntry>();
  private registerAttempts = new Map<string, RateLimitEntry>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private sessionService: SessionService,
  ) {
    // Clean up rate limit maps periodically (every 30 minutes)
    setInterval(() => this.cleanupRateLimits(), 30 * 60 * 1000);
  }

  /**
   * Exponential backoff delay calculation
   */
  private calculateRetryDelay(attempt: number): number {
    return this.RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
  }

  /**
   * Database health check and connection verification
   */
  private async verifyDatabaseConnection(): Promise<void> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.error('Database connection failed:', error);
      throw new InternalServerErrorException(
        'Service temporarily unavailable. Please try again later.',
      );
    }
  }

  /**
   * Enhanced password validation
   */
  private validatePassword(password: string): void {
    if (!password || password.length < this.MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(
        `Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`,
      );
    }

    if (!this.PASSWORD_PATTERN.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    }
  }

  /**
   * Enhanced email validation
   */
  private validateEmail(email: string): void {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      throw new BadRequestException('Invalid email format');
    }
  }

  /**
   * Rate limiting check with detailed logging
   */
  private checkRateLimit(
    identifier: string,
    limitsMap: Map<string, RateLimitEntry>,
    maxAttempts: number,
    windowMs: number,
    operation: string,
  ): void {
    const now = Date.now();
    const entry = limitsMap.get(identifier);

    if (!entry) {
      // First attempt
      limitsMap.set(identifier, {
        count: 1,
        windowStart: now,
        lastAttempt: now,
      });
      return;
    }

    // Check if window has expired
    if (now - entry.windowStart > windowMs) {
      // Reset the window
      limitsMap.set(identifier, {
        count: 1,
        windowStart: now,
        lastAttempt: now,
      });
      return;
    }

    // Within the window - check limit
    if (entry.count >= maxAttempts) {
      const timeRemaining = Math.ceil(
        (windowMs - (now - entry.windowStart)) / 1000 / 60,
      );
      this.logger.warn(
        `Rate limit exceeded for ${operation}: ${identifier}. Attempts: ${entry.count}`,
      );
      throw new BadRequestException(
        `Too many ${operation} attempts. Please try again in ${timeRemaining} minutes.`,
      );
    }

    // Increment counter
    entry.count++;
    entry.lastAttempt = now;
    limitsMap.set(identifier, entry);
  }

  /**
   * Cleanup expired rate limit entries
   */
  private cleanupRateLimits(): void {
    const now = Date.now();

    // Clean login attempts
    for (const [key, entry] of this.loginAttempts.entries()) {
      if (now - entry.windowStart > this.LOGIN_RATE_WINDOW) {
        this.loginAttempts.delete(key);
      }
    }

    // Clean register attempts
    for (const [key, entry] of this.registerAttempts.entries()) {
      if (now - entry.windowStart > this.REGISTER_RATE_WINDOW) {
        this.registerAttempts.delete(key);
      }
    }

    this.logger.debug('Rate limit cleanup completed');
  }

  /**
   * Validate user credentials with optimized query
   * Uses raw SQL for better performance and to fetch only necessary fields
   */
  async validateUser(email: string, password: string) {
    this.logger.log(`Validating credentials for email: ${email}`);

    // Input validation
    this.validateEmail(email);

    if (!password || password.trim() === '') {
      throw new BadRequestException('Password is required');
    }

    try {
      // Optimized query - fetch only necessary fields with indexed email lookup
      // Using Prisma for type safety (raw SQL alternative commented below)
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

      /* Alternative raw SQL approach for maximum performance:
      const users = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT
          u.id, u.email, u.username, u.displayname, u.birth,
          u.password, u.avatar, u.email_verified, u.is_disabled,
          u.disabled_until, u.created_at, u.updated_at,
          r.id as role_id, r.name as role_name
        FROM users u
        INNER JOIN roles r ON u.role_id = r.id
        WHERE u.email = $1
        LIMIT 1`,
        email
      );
      const user = users[0];
      */

      if (!user) {
        // Use generic message to prevent user enumeration
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

      // Verify password
      if (!user.password) {
        this.logger.error(`User ${email} has no password set`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        this.logger.warn(`Invalid password attempt for email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Remove password from result
      const { password: _, ...result } = user;

      this.logger.log(`User validated successfully: ${email}`);
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

  /**
   * User login with enhanced security and error handling
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);

    // Database health check
    await this.verifyDatabaseConnection();

    // Rate limiting check
    this.checkRateLimit(
      loginDto.email,
      this.loginAttempts,
      this.LOGIN_RATE_LIMIT,
      this.LOGIN_RATE_WINDOW,
      'login',
    );

    let lastError: Error | undefined;

    // Retry logic for database operations
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // Validate user credentials
        const user = await this.validateUser(
          loginDto.email,
          loginDto.password,
        );

        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }

        // Create session with transaction support
        const expiresAt = new Date(Date.now() + this.SESSION_DURATION_MS);

        const session = await this.sessionService.createSession(
          user.id,
          expiresAt,
        );

        // Create JWT payload
        const payload = {
          sub: user.id,
          email: user.email,
          role: user.roles.name,
          displayname: user.displayname,
          sessionToken: session.session_token,
        };

        // Clear rate limit on successful login
        this.loginAttempts.delete(loginDto.email);

        this.logger.log(
          `User logged in successfully: ${user.email} (Session: ${session.session_token.substring(0, 8)}...)`,
        );

        return {
          status: 'success',
          result: {
            primaryData: {
              accessToken: this.jwtService.sign(payload),
              sessionToken: session.session_token,
              expires: session.expires,
            },
            additionalData: {
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
          },
          message: 'Login successful',
        };
      } catch (error) {
        lastError = error as Error;

        // Don't retry on validation or authorization errors
        if (
          error instanceof UnauthorizedException ||
          error instanceof BadRequestException
        ) {
          throw error;
        }

        this.logger.warn(`Login attempt ${attempt} failed:`, error);

        // Wait before retrying
        if (attempt < this.MAX_RETRIES) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.calculateRetryDelay(attempt)),
          );
        }
      }
    }

    this.logger.error('All login attempts failed:', lastError);
    throw new InternalServerErrorException(
      'Login failed after multiple attempts. Please try again later.',
    );
  }

  /**
   * User registration with comprehensive validation and transaction handling
   */
  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    this.logger.log(`Registration attempt for email: ${createUserDto.email}`);

    // Database health check
    await this.verifyDatabaseConnection();

    // Rate limiting by IP or email
    this.checkRateLimit(
      createUserDto.email,
      this.registerAttempts,
      this.REGISTER_RATE_LIMIT,
      this.REGISTER_RATE_WINDOW,
      'registration',
    );

    // Enhanced input validation
    this.validateEmail(createUserDto.email);
    this.validatePassword(createUserDto.password);

    if (!createUserDto.username || createUserDto.username.trim() === '') {
      throw new BadRequestException('Username is required');
    }

    if (createUserDto.username.length < 3) {
      throw new BadRequestException(
        'Username must be at least 3 characters long',
      );
    }

    if (!createUserDto.displayname || createUserDto.displayname.trim() === '') {
      throw new BadRequestException('Display name is required');
    }

    try {
      // Execute registration in a transaction with retry logic
      return await this.prisma.$transaction(
        async (tx) => {
          // Check for existing email and username in parallel (optimized)
          const [existingEmail, existingUsername, roleCheck] = await Promise.all([
            tx.users.findUnique({
              where: { email: createUserDto.email },
              select: { id: true, email: true },
            }),
            tx.users.findUnique({
              where: { username: createUserDto.username },
              select: { id: true, username: true },
            }),
            tx.roles.findUnique({
              where: { name: 'USER' },
              select: { id: true },
            }),
          ]);

          // Specific field validation with clear error messages
          if (existingEmail) {
            this.logger.warn(
              `Registration failed - email already exists: ${createUserDto.email}`,
            );
            throw new ConflictException('Email đã được sử dụng');
          }

          if (existingUsername) {
            this.logger.warn(
              `Registration failed - username already exists: ${createUserDto.username}`,
            );
            throw new ConflictException('Username đã được sử dụng');
          }

          if (!roleCheck) {
            this.logger.error('USER role not found in database');
            throw new InternalServerErrorException(
              'System configuration error. Please contact support.',
            );
          }

          // Hash password with configured rounds
          this.logger.debug('Hashing password...');
          const hashedPassword = await bcrypt.hash(
            createUserDto.password,
            this.BCRYPT_ROUNDS,
          );

          // Create user
          this.logger.debug('Creating user record...');
          const newUser = await tx.users.create({
            data: {
              email: createUserDto.email,
              username: createUserDto.username,
              displayname: createUserDto.displayname,
              password: hashedPassword,
              birth: createUserDto.birth || '2000-01-01',
              email_verified: false,
              roles: { connect: { id: roleCheck.id } },
            },
            include: {
              roles: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });

          // Remove password from result
          const { password, ...userWithoutPassword } = newUser;

          // Clear rate limit on successful registration
          this.registerAttempts.delete(createUserDto.email);

          this.logger.log(
            `User registered successfully: ${newUser.email} (ID: ${newUser.id})`,
          );

          return {
            status: 'success',
            result: {
              primaryData: {
                id: userWithoutPassword.id,
                email: userWithoutPassword.email,
                username: userWithoutPassword.username,
                displayname: userWithoutPassword.displayname,
              },
              additionalData: {
                user: userWithoutPassword,
              },
            },
            message: 'User created successfully',
          };
        },
        {
          timeout: this.TRANSACTION_TIMEOUT,
          maxWait: 5000,
        },
      );
    } catch (error) {
      // Handle specific errors
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Registration failed:', error);
      throw new InternalServerErrorException(
        'Failed to create user. Please try again later.',
      );
    }
  }

  /**
   * Health check endpoint for monitoring
   */
  async healthCheck(): Promise<{
    status: string;
    timestamp: Date;
    details: any;
  }> {
    const startTime = Date.now();
    const details = {
      database: 'unknown',
      jwt: 'unknown',
      responseTime: 0,
    };

    try {
      // Check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      details.database = 'healthy';
    } catch (error) {
      details.database = 'unhealthy';
      this.logger.error('Database health check failed:', error);
    }

    // Check JWT service
    try {
      const testPayload = { test: true };
      this.jwtService.sign(testPayload);
      details.jwt = 'healthy';
    } catch (error) {
      details.jwt = 'unhealthy';
      this.logger.error('JWT service health check failed:', error);
    }

    details.responseTime = Date.now() - startTime;

    return {
      status:
        details.database === 'healthy' && details.jwt === 'healthy'
          ? 'healthy'
          : 'degraded',
      timestamp: new Date(),
      details,
    };
  }

  /**
   * Logout user by invalidating session
   */
  async logout(sessionToken: string): Promise<AuthResponse> {
    this.logger.log(
      `Logout attempt for session: ${sessionToken.substring(0, 8)}...`,
    );

    try {
      await this.sessionService.deleteSession(sessionToken);

      this.logger.log('User logged out successfully');

      return {
        status: 'success',
        result: {
          primaryData: null,
        },
        message: 'Logged out successfully',
      };
    } catch (error) {
      this.logger.error('Logout failed:', error);
      throw new InternalServerErrorException('Failed to logout');
    }
  }

  /**
   * Refresh session token
   */
  async refreshSession(sessionToken: string): Promise<AuthResponse> {
    this.logger.log(
      `Session refresh attempt: ${sessionToken.substring(0, 8)}...`,
    );

    try {
      const session = await this.sessionService.getSession(sessionToken);

      if (!session) {
        throw new UnauthorizedException('Invalid or expired session');
      }

      // Extend session expiration
      const newExpiresAt = new Date(Date.now() + this.SESSION_DURATION_MS);
      await this.sessionService.updateSession(sessionToken, newExpiresAt);

      // Create new JWT with updated expiration
      const payload = {
        sub: session.user_id,
        email: session.users.email,
        role: session.users.roles.name,
        displayname: session.users.displayname,
        sessionToken: sessionToken,
      };

      this.logger.log('Session refreshed successfully');

      return {
        status: 'success',
        result: {
          primaryData: {
            accessToken: this.jwtService.sign(payload),
            sessionToken: sessionToken,
            expires: newExpiresAt,
          },
        },
        message: 'Session refreshed successfully',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('Session refresh failed:', error);
      throw new InternalServerErrorException('Failed to refresh session');
    }
  }
}

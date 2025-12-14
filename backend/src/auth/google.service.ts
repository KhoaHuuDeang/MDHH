import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleSignInDto } from 'src/users/user.dto';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from './session.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);

  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly emailService: EmailService
  ) { }

  async handleGoogleOAuth(dto: GoogleSignInDto) {
    this.validateGoogleDto(dto);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingAccount = await this.findExistingGoogleAccount(tx, dto);
        if (existingAccount) {
          this.logger.log(`Existing Google user login: ${dto.email}`);
          return await this.handleExistingGoogleUser(tx, existingAccount, dto);
        }

        const userByEmail = await this.findUserByEmail(tx, dto.email);
        if (userByEmail) {
          this.logger.log(`Linking Google to existing user: ${dto.email}`);
          return await this.linkGoogleToExistingUser(tx, userByEmail, dto);
        }

        this.logger.log(`Creating new Google user: ${dto.email}`);
        return await this.createNewGoogleUser(tx, dto);
      });
    } catch (error) {
      this.logger.error(`Google OAuth failed for ${dto.email}:`, error);
      throw new InternalServerErrorException('Google authentication failed');
    }
  }

  private validateGoogleDto(dto: GoogleSignInDto): void {
    if (!dto.googleId || !dto.provider) {
      throw new UnauthorizedException('Google ID and provider are required');
    }
    if (!dto.email) {
      throw new UnauthorizedException('Email is required for Google authentication');
    }
  }

  private async findExistingGoogleAccount(tx: any, dto: GoogleSignInDto) {
    return await tx.accounts.findUnique({
      where: {
        provider_provider_account_id: {
          provider: dto.provider,
          provider_account_id: dto.googleId,
        },
      },
      include: {
        users: {
          include: {
            roles: {
              select: {
                name: true,
                id: true
              }
            }
          }
        }
      },
    });
  }

  private async findUserByEmail(tx: any, email: string) {
    return await tx.users.findUnique({
      where: { email },
      include: {
        roles: {
          select: {
            name: true,
            id: true
          }
        }
      }
    });
  }

  private async handleExistingGoogleUser(tx: any, existingAccount: any, dto: GoogleSignInDto) {
    let user = existingAccount.users;

    if (!user) {
      throw new InternalServerErrorException('Account exists but user data is missing');
    }

    const needsUpdate = this.shouldUpdateUserProfile(user, dto);

    if (needsUpdate) {
      user = await this.updateUserProfile(tx, user.id, dto);
      this.logger.log(`Updated profile for user: ${user.email}`);
    }

    if (dto.access_token) {
      await this.updateAccountTokens(tx, existingAccount.id, dto);
    }

    // Send Google login notification email
    if (user.email) {
      try {
        await this.emailService.sendGoogleLoginEmail(
          user.email,
          user.displayname || user.username,
          false // isNewAccount
        );
      } catch (error) {
        this.logger.error('Failed to send Google login email:', error);
      }
    }

    return this._createTokensAndSession(user, tx);
  }

  private async linkGoogleToExistingUser(tx: any, userByEmail: any, dto: GoogleSignInDto) {
    const existingGoogleLink = await tx.accounts.findFirst({
      where: {
        provider: dto.provider,
        provider_account_id: dto.googleId,
      }
    });

    if (existingGoogleLink) {
      throw new ConflictException('This Google account is already linked to another user');
    }

    await tx.accounts.create({
      data: {
        user_id: userByEmail.id,
        type: dto.type || 'oauth',
        provider: dto.provider,
        provider_account_id: dto.googleId,
        access_token: dto.access_token,
        refresh_token: dto.refresh_token,
        expires_at: dto.expires_at,
        token_type: dto.token_type,
        scope: dto.scope,
      },
    });

    let updatedUser = userByEmail;
    if (this.shouldUpdateUserProfile(userByEmail, dto)) {
      updatedUser = await this.updateUserProfile(tx, userByEmail.id, dto);
    }

    return this._createTokensAndSession(updatedUser, tx);
  }

  private async createNewGoogleUser(tx: any, dto: GoogleSignInDto) {
    const userRole = await tx.roles.findUnique({
      where: { name: 'USER' },
      select: { id: true, name: true }
    });

    if (!userRole) {
      throw new InternalServerErrorException('Default user role not found');
    }

    const uniqueUsername = await this.generateUniqueUsername(tx, dto.username || dto.email.split('@')[0]);

    const newUser = await tx.users.create({
      data: {
        email: dto.email,
        displayname: dto.name || dto.given_name || dto.email.split('@')[0],
        username: uniqueUsername,
        avatar: dto.avatar,
        email_verified: true,
        role_id: userRole.id,
        accounts: {
          create: {
            type: dto.type || 'oauth',
            provider: dto.provider,
            provider_account_id: dto.googleId,
            access_token: dto.access_token,
            refresh_token: dto.refresh_token,
            expires_at: dto.expires_at,
            token_type: dto.token_type,
            scope: dto.scope,
          },
        },
      },
      include: {
        roles: {
          select: {
            name: true,
            id: true
          }
        }
      },
    });

    // Send Google account creation email
    if (newUser.email) {
      try {
        await this.emailService.sendGoogleLoginEmail(
          newUser.email,
          newUser.displayname || newUser.username,
          true // isNewAccount
        );
      } catch (error) {
        this.logger.error('Failed to send Google account creation email:', error);
      }
    }

    return this._createTokensAndSession(newUser, tx);
  }

  private shouldUpdateUserProfile(user: any, dto: GoogleSignInDto): boolean {
    return (
      user.displayname !== (dto.name || dto.given_name) ||
      user.avatar !== dto.avatar
    );
  }

  private async updateUserProfile(tx: any, userId: string, dto: GoogleSignInDto) {
    return await tx.users.update({
      where: { id: userId },
      data: {
        displayname: dto.name || dto.given_name,
        avatar: dto.avatar,
        updated_at: new Date(),
      },
      include: {
        roles: {
          select: {
            name: true,
            id: true
          }
        }
      }
    });
  }

  private async updateAccountTokens(tx: any, accountId: string, dto: GoogleSignInDto) {
    return await tx.accounts.update({
      where: { id: accountId },
      data: {
        access_token: dto.access_token,
        refresh_token: dto.refresh_token,
        expires_at: dto.expires_at,
      },
    });
  }

  private async generateUniqueUsername(tx: any, baseUsername: string): Promise<string> {
    if (!baseUsername) {
      baseUsername = 'user';
    }

    let username = baseUsername;
    let counter = 1;

    while (await tx.users.findUnique({ where: { username } })) {
      username = `${baseUsername}_${counter}`;
      counter++;
    }

    return username;
  }

  private async _createTokensAndSession(user: any, tx?: any) {
    if (!user) {
      throw new InternalServerErrorException('User data is missing');
    }

    if (!user.roles) {
      throw new InternalServerErrorException('User role information is missing');
    }

    try {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      const session = await this.sessionService.createSession(user.id, expiresAt, tx);

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.roles.name,
        displayname: user.displayname || user.username,
        sessionToken: session.session_token,
      };

      const accessToken = this.jwtService.sign(payload);
      this.logger.log('Google OAuth token created successfully');

      return {
        message: 'Google authentication successful',
        status: 200,
        result: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.roles.name,
            displayname: user.displayname,
            avatar: user.avatar,
          },
          accessToken,
          sessionToken: session.session_token,
          expires: session.expires,
        },
      };
    } catch (error) {
      this.logger.error('Token creation failed:', error);
      throw new InternalServerErrorException('Failed to create authentication tokens');
    }
  }
}

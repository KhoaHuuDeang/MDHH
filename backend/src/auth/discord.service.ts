import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiscordSignInDto } from 'src/users/user.dto';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from './session.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly emailService: EmailService,
  ) {}

  async handleDiscordOAuth(dto: DiscordSignInDto) {
    this.validateDiscordDto(dto);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingAccount = await this.findExistingDiscordAccount(tx, dto);
        if (existingAccount) {
          this.logger.log(`Existing Discord user login: ${dto.email}`);
          return await this.handleExistingDiscordUser(tx, existingAccount, dto);
        }

        const userByEmail = await this.findUserByEmail(tx, dto.email);
        if (userByEmail) {
          this.logger.log(`Linking Discord to existing user: ${dto.email}`);
          return await this.linkDiscordToExistingUser(tx, userByEmail, dto);
        }

        this.logger.log(`Creating new Discord user: ${dto.email}`);
        return await this.createNewDiscordUser(tx, dto);
      });
    } catch (error) {
      this.logger.error(`Discord OAuth failed for ${dto.email}:`, error);
      throw new InternalServerErrorException('Discord authentication failed');
    }
  }

  private validateDiscordDto(dto: DiscordSignInDto): void {
    if (!dto.discordId || !dto.provider) {
      throw new UnauthorizedException('Discord ID and provider are required');
    }
    if (!dto.email) {
      throw new UnauthorizedException(
        'Email is required for Discord authentication',
      );
    }
  }

  private async findExistingDiscordAccount(tx: any, dto: DiscordSignInDto) {
    return await tx.accounts.findUnique({
      where: {
        provider_provider_account_id: {
          provider: dto.provider,
          provider_account_id: dto.discordId,
        },
      },
      include: {
        users: {
          include: {
            roles: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
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
            id: true,
          },
        },
      },
    });
  }

  private async handleExistingDiscordUser(
    tx: any,
    existingAccount: any,
    dto: DiscordSignInDto,
  ) {
    let user = existingAccount.users;

    if (!user) {
      throw new InternalServerErrorException(
        'Account exists but user data is missing',
      );
    }

    const needsUpdate = this.shouldUpdateUserProfile(user, dto);

    if (needsUpdate) {
      user = await this.updateUserProfile(tx, user.id, dto);
      this.logger.log(`Updated profile for user: ${user.email}`);
    }

    if (dto.access_token) {
      await this.updateAccountTokens(tx, existingAccount.id, dto);
    }

    // Send Discord login notification email
    if (user.email) {
      try {
        await this.emailService.sendDiscordLoginEmail(
          user.email,
          user.displayname || user.username,
          false, // isNewAccount
        );
      } catch (error) {
        this.logger.error('Failed to send Discord login email:', error);
      }
    }

    return this._createTokensAndSession(user, tx);
  }

  private async linkDiscordToExistingUser(
    tx: any,
    userByEmail: any,
    dto: DiscordSignInDto,
  ) {
    const existingDiscordLink = await tx.accounts.findFirst({
      where: {
        provider: dto.provider,
        provider_account_id: dto.discordId,
      },
    });

    if (existingDiscordLink) {
      throw new ConflictException(
        'This Discord account is already linked to another user',
      );
    }

    await tx.accounts.create({
      data: {
        user_id: userByEmail.id,
        type: dto.type || 'oauth',
        provider: dto.provider,
        provider_account_id: dto.discordId,
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

  private async createNewDiscordUser(tx: any, dto: DiscordSignInDto) {
    const userRole = await tx.roles.findUnique({
      where: { name: 'USER' },
      select: { id: true, name: true },
    });

    if (!userRole) {
      throw new InternalServerErrorException('Default user role not found');
    }

    const uniqueUsername = await this.generateUniqueUsername(tx, dto.username);

    const newUser = await tx.users.create({
      data: {
        email: dto.email,
        displayname: dto.global_name || dto.username,
        username: uniqueUsername,
        avatar: dto.avatar,
        email_verified: true,
        role_id: userRole.id,
        accounts: {
          create: {
            type: dto.type || 'oauth',
            provider: dto.provider,
            provider_account_id: dto.discordId,
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
            id: true,
          },
        },
      },
    });

    // Send Discord account creation email
    if (newUser.email) {
      try {
        await this.emailService.sendDiscordLoginEmail(
          newUser.email,
          newUser.displayname || newUser.username,
          true, // isNewAccount
        );
      } catch (error) {
        this.logger.error(
          'Failed to send Discord account creation email:',
          error,
        );
      }
    }

    console.log('New user created aaaa:', newUser);
    return this._createTokensAndSession(newUser, tx);
  }

  private shouldUpdateUserProfile(user: any, dto: DiscordSignInDto): boolean {
    return (
      user.displayname !== (dto.global_name || dto.username) ||
      user.avatar !== dto.avatar ||
      user.username !== dto.username
    );
  }

  private async updateUserProfile(
    tx: any,
    userId: string,
    dto: DiscordSignInDto,
  ) {
    return await tx.users.update({
      where: { id: userId },
      data: {
        displayname: dto.global_name || dto.username,
        username: dto.username,
        avatar: dto.avatar,

        updated_at: new Date(),
      },
      include: {
        roles: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
  }

  private async updateAccountTokens(
    tx: any,
    accountId: string,
    dto: DiscordSignInDto,
  ) {
    return await tx.accounts.update({
      where: { id: accountId },
      data: {
        access_token: dto.access_token,
        refresh_token: dto.refresh_token,
        expires_at: dto.expires_at,
      },
    });
  }

  private async generateUniqueUsername(
    tx: any,
    baseUsername: string,
  ): Promise<string> {
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
      throw new InternalServerErrorException(
        'User role information is missing',
      );
    }

    try {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      // Truyền transaction context vào SessionService
      const session = await this.sessionService.createSession(
        user.id,
        expiresAt,
        tx,
      );

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.roles.name,
        displayname: user.displayname || user.username,
        sessionToken: session.session_token,
      };

      const accessToken = this.jwtService.sign(payload);
      this.logger.log('Discord OAuth token created successfully');

      return {
        message: 'Discord authentication successful',
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
      throw new InternalServerErrorException(
        'Failed to create authentication tokens',
      );
    }
  }

  private determineRoleFromDiscordRoles(discordRoles: string[]): string {
    const roleMapping: Record<string, string> = {
      [process.env.DISCORD_ADMIN_ROLE_ID || '']: 'ADMIN',
      [process.env.DISCORD_MOD_ROLE_ID || '']: 'MODERATOR',
      [process.env.DISCORD_PREMIUM_ROLE_ID || '']: 'PREMIUM',
    };

    const rolePriority = ['ADMIN', 'MODERATOR', 'PREMIUM'];

    for (const priority of rolePriority) {
      for (const roleId of discordRoles) {
        if (roleMapping[roleId] === priority) {
          return priority;
        }
      }
    }

    return 'USER';
  }

  async cleanupExpiredSessions(): Promise<void> {
    try {
      const result = await this.prisma.sessions.deleteMany({
        where: {
          expires: {
            lt: new Date(),
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} expired sessions`);
      }
    } catch (error) {
      this.logger.error('Failed to cleanup expired sessions:', error);
    }
  }
}
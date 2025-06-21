import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface DiscordOAuthData {
  discordId: string;
  email: string;
  username: string;
  avatar?: string;
  guilds?: any[];
  roles?: string[];
}

@Injectable()
export class DiscordService {
  constructor(private prisma: PrismaService) {}

  async handleDiscordOAuth(discordData: DiscordOAuthData) {
    try {
      // Check if user exists by Discord ID first
      let user = await this.prisma.user.findFirst({
        where: {
          accounts: {
            some: {
              provider: 'discord',
              providerAccountId: discordData.discordId,
            },
          },
        },
        include: { role: true, accounts: true },
      });

      if (user) {
        // Update existing Discord user
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            username: discordData.username,
            avatar: discordData.avatar,
          },
          include: { role: true, accounts: true },
        });

        // Update account metadata with Discord guild/role info
        await this.prisma.account.updateMany({
          where: {
            userId: user.id,
            provider: 'discord',
          },
          data: {
            metadata: {
              guilds: discordData.guilds,
              roles: discordData.roles,
              lastSync: new Date().toISOString(),
            },
          },
        });

        return { user };
      }

      // Check if email is already used by another user
      const existingUser = await this.prisma.user.findUnique({
        where: { email: discordData.email },
        include: { accounts: true },
      });

      if (existingUser) {
        // Email exists - link Discord account to existing user
        await this.prisma.account.create({
          data: {
            userId: existingUser.id,
            type: 'oauth',
            provider: 'discord',
            providerAccountId: discordData.discordId,
            metadata: {
              guilds: discordData.guilds,
              roles: discordData.roles,
              lastSync: new Date().toISOString(),
            },
          },
        });

        // Update user with Discord info
        const updatedUser = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            username: discordData.username,
            avatar: discordData.avatar,
          },
          include: { role: true },
        });

        return { user: updatedUser };
      }

      // Create new user with Discord account
      const userRole = await this.prisma.role.findUnique({
        where: { name: 'user' },
      });

      if (!userRole) {
        throw new InternalServerErrorException('User role not found');
      }

      // Determine role based on Discord roles
      const appRole = this.determineRoleFromDiscordRoles(discordData.roles || []);
      const targetRole = await this.prisma.role.findUnique({
        where: { name: appRole },
      }) || userRole;

      const newUser = await this.prisma.user.create({
        data: {
          email: discordData.email,
          displayname: discordData.username,
          username: discordData.username,
          avatar: discordData.avatar,
          emailVerified: true, // Discord emails are verified
          roleId: targetRole.id,
          accounts: {
            create: {
              type: 'oauth',
              provider: 'discord',
              providerAccountId: discordData.discordId,
              metadata: {
                guilds: discordData.guilds,
                roles: discordData.roles,
                lastSync: new Date().toISOString(),
              },
            },
          },
        },
        include: { role: true },
      });

      return { user: newUser };
    } catch (error) {
      console.error('Discord OAuth error:', error);
      throw new InternalServerErrorException('Failed to process Discord OAuth');
    }
  }

  private determineRoleFromDiscordRoles(discordRoles: string[]): string {
    // Define your Discord role ID to app role mapping
    const roleMapping: Record<string, string> = {
      // Example: Replace with your actual Discord role IDs
      '123456789012345678': 'admin',     // Discord Admin role ID
      '987654321098765432': 'moderator', // Discord Mod role ID
      // Add more mappings as needed
    };

    // Check for admin role first (highest priority)
    for (const roleId of discordRoles) {
      if (roleMapping[roleId] === 'admin') return 'admin';
    }

    // Check for other roles
    for (const roleId of discordRoles) {
      if (roleMapping[roleId]) return roleMapping[roleId];
    }

    // Default role
    return 'user';
  }
}

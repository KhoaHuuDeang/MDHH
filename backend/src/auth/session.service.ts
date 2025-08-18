import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { randomBytes } from 'crypto';
import { session } from 'passport';
import { SessionUser } from 'src/users/user.dto';

@Injectable()
export class SessionService {
  constructor(public prisma: PrismaService) { }

  async createSession(userId: string, expiresAt: Date, tx?: any) {
    const sessionToken = randomBytes(32).toString('hex');

    const session = await (tx || this.prisma).sessions.create({
      data: {
        session_token: sessionToken,
        expires: expiresAt,
        user_id: userId
      },
    });

    return session;
  }

  async getSession(sessionToken: string): Promise<SessionUser | null> {
    try {
      const session = await this.findSessionWithUserAndRoles(sessionToken);
      if (!session) {
        return null
      }

      // Validate required fields exist
      if (!session.user_id || !session.expires) {
        console.error('Session validation failed: Missing required fields', {
          sessionToken: sessionToken.substring(0, 8) + '...',
          hasUserId: !!session.user_id,
          hasExpires: !!session.expires
        });
        await this.deleteSession(sessionToken); // Clean up invalid session
        return null;
      }

      // Check expiration
      if (this.isSessionExpired(session.expires)) {
        await this.deleteSession(sessionToken);
        return null;
      }

      // Validate user data completeness
      const { users } = session;
      if (!users || !users.email || !users.username || !users.displayname || !users.roles?.name) {
        console.error('User data incomplete in session', {
          hasUsers: !!users,
          hasEmail: !!users?.email,
          hasUsername: !!users?.username,
          hasDisplayname: !!users?.displayname,
          hasRoles: !!users?.roles,
          hasRoleName: !!users?.roles?.name
        });
        return null;
      }

      // Type-safe return with explicit casting after validation
      return {
        session_token: session.session_token,
        user_id: session.user_id,
        expires: session.expires,
        users: {
          email: users.email,
          username: users.username,
          displayname: users.displayname,
          birth: users.birth || '',
          avatar: users.avatar || '',
          email_verified: users.email_verified ?? false,
          roles: {
            name: users.roles.name
          }
        }
      } ;

    } catch (err) {
      console.error('Session not found:', err);
      return null;
    }
  }


  private async findSessionWithUserAndRoles(sessionToken: string) {
    return this.prisma.sessions.findUnique({
      where: {
        session_token: sessionToken,
      },
      include: {
        users: {
          include: {
            roles: true
          }
        }
      },
    });
  }


  private isSessionExpired(expires: Date): boolean {
    return expires < new Date();
  }


  async updateSession(sessionToken: string, expiresAt: Date) {
    return this.prisma.sessions.update({
      where: { session_token: sessionToken },
      data: { expires: expiresAt },
    });
  }

  async deleteSession(sessionToken: string) {
    return this.prisma.sessions.delete({
      where: { session_token: sessionToken },
    });
  }

  async deleteUserSessions(userId: string) {
    return this.prisma.sessions.deleteMany({
      where: { user_id: userId },
    });
  }
}

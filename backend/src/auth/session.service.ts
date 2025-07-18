import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { randomBytes } from 'crypto';
import { session } from 'passport';
import { SessionUser } from 'src/users/user.dto';

@Injectable()
export class SessionService {
  constructor(public prisma: PrismaService) { }

  async createSession(userId: string, expiresAt: Date) {
    const sessionToken = randomBytes(32).toString('hex');

    const session = await this.prisma.sessions.create({
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
      if (session.expires && this.isSessionExpired(session.expires)) {
        await this.deleteSession(sessionToken);
        return null;
      }
      return session;
    } catch (err) {
      console.error('Session not found:', err);
      return null;
    }
  }


  private async findSessionWithUserAndRoles(sessionToken: string) {
    return this.prisma.sessions.findUnique({
      where: { session_token: sessionToken },
      include: {
        users: {
          select: {
            email: true,
            username: true,
            displayname: true,
            avatar: true,
            birth: true,
            email_verified: true,
            role_name :  true
          },
          include: {
            roles: {
              select: {
                name: true
              }
            }
          }
        },
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

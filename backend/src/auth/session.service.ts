import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class SessionService {
  constructor(public prisma: PrismaService) {}

  async createSession(userId: string, expiresAt: Date) {
    const sessionToken = randomBytes(32).toString('hex');
    
    const session = await this.prisma.session.create({
      data: {
        sessionToken,
        expires: expiresAt,
        userId
      },
    });

    return session;
  }

  async getSession(sessionToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!session || session.expires < new Date()) {
      if (session) {
        await this.deleteSession(sessionToken);
      }
      return null;
    }

    return session;
  }

  async updateSession(sessionToken: string, expiresAt: Date) {
    return this.prisma.session.update({
      where: { sessionToken },
      data: { expires: expiresAt },
    });
  }

  async deleteSession(sessionToken: string) {
    return this.prisma.session.delete({
      where: { sessionToken },
    });
  }

  async deleteUserSessions(userId: string) {
    return this.prisma.session.deleteMany({
      where: { userId },
    });
  }
}

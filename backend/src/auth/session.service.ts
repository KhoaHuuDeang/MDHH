import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class SessionService {
  constructor(public prisma: PrismaService) {}

  async createSession(userId: bigint, expiresAt: Date) {
    const sessionToken = randomBytes(32).toString('hex');
    
    const session = await this.prisma.session.create({
      data: {
        session_token: sessionToken,
        expires: expiresAt,
        user_id: userId
      },
    });

    return session;
  }

  async getSession(sessionToken: string) {
    try{
      const session = await this.prisma.session.findUnique({
        where: { session_token : sessionToken },
        include: {
          users: {
            include: {
              roles: true,
            },
          },
        },
      });

    if ( session?.expires < new Date()) {
        await this.deleteSession(sessionToken);
      return null;
    }

    return session;
  }catch(error){
    console.error('Session doesnt exist:', error);
    return null;
  }
  }
  async updateSession(sessionToken: string, expiresAt: Date) {
    return this.prisma.session.update({
      where: { session_token: sessionToken },
      data: { expires: expiresAt },
    });
  }

  async deleteSession(sessionToken: string) {
    return this.prisma.session.delete({
      where: { session_token : sessionToken },
    });
  }

  async deleteUserSessions(userId: bigint) {
    return this.prisma.session.deleteMany({
      where: { user_id : userId },
    });
  }
}

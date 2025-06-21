import { Controller, Post, Get, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SessionService } from './session.service';

@ApiTags('NextAuth API')
@Controller('api/auth')
export class NextAuthController {
  constructor(private sessionService: SessionService) {}

  @Post('session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create session' })
  async createSession(@Body() body: { userId: string; expires: string }) {
    const expiresAt = new Date(body.expires);
    const session = await this.sessionService.createSession(body.userId, expiresAt);
    
    return {
      sessionToken: session.sessionToken,
      userId: session.userId,
      expires: session.expires,
    };
  }

  @Get('session/:sessionToken')
  @ApiOperation({ summary: 'Get session' })
  async getSession(@Param('sessionToken') sessionToken: string) {
    const session = await this.sessionService.getSession(sessionToken);
    
    if (!session) {
      return null;
    }
    return {
      sessionToken: session.sessionToken,
      userId: session.userId,
      expires: session.expires,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.displayname,
        username: session.user.username,
        role: session.user.role.name,
        birth: session.user.birth,
        avatar: session.user.avatar,
        emailVerified: session.user.emailVerified,
      },
    };
  }

  @Post('session/update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update session' })
  async updateSession(@Body() body: { sessionToken: string; expires: string }) {
    const expiresAt = new Date(body.expires);
    await this.sessionService.updateSession(body.sessionToken, expiresAt);
    return { success: true };
  }

  @Delete('session/:sessionToken')
  @ApiOperation({ summary: 'Delete session' })
  async deleteSession(@Param('sessionToken') sessionToken: string) {
    await this.sessionService.deleteSession(sessionToken);
    return { success: true };
  }

  @Post('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user by ID' })
  async getUser(@Param('userId') userId: string) {
    // This will be used by NextAuth to get user data
    const user = await this.sessionService.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.displayname,
      username: user.username,
      role: user.role.name,
      birth: user.birth,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
    };
  }
}

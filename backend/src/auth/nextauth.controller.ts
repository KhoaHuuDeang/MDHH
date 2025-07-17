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
      sessionToken: session.session_token,
      userId: session.user_id,
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
      sessionToken: session.session_token,
      userId: session.user_id,
      expires: session.expires,
      user: {
        id: session.users.id,
        email: session.users.email,
        name: session.users.displayname,
        username: session.users.username,
        role: session.users.role.name,
        birth: session.users.birth,
        avatar: session.users.avatar,
        emailVerified: session.users.emailVerified,
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
  async getUser(@Param('userId') userId: bigint) {
    // This will be used by NextAuth to get user data
    const user = await this.sessionService.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.displayname,
      username: user.username,
      role: user.roles.name,
      birth: user.birth,
      avatar: user.avatar,
      emailVerified: user.email_verified,
    };
  }
}

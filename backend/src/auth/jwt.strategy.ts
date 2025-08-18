import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { SessionService } from './session.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private sessionService: SessionService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

    // decoded jwt accesstoken -> payload 
  async validate(payload: any) {
    const sessionToken = payload.sessionToken;
    if (!sessionToken) {
      throw new UnauthorizedException('Invalid session token format');
    }
    const sessionUser = await this.sessionService.getSession(sessionToken);
    if (!sessionUser) {
      throw new UnauthorizedException('Session not found or expired');
    }
    return sessionUser
  }
}
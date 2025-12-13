import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { NextAuthController } from './nextauth.controller';
import { SessionService } from './session.service';
import { DiscordService } from './discord.service';
import { GoogleService } from './google.service';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { EmailModule } from 'src/email/email.module';
@Module({
  imports: [
    PassportModule,
    ConfigModule,
    EmailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN')
        },
      }),
    }),
  ],  controllers: [AuthController, NextAuthController],
  providers: [AuthService, SessionService, DiscordService, GoogleService, JwtStrategy, UsersService],
  exports: [AuthService, SessionService, DiscordService, GoogleService],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { NextAuthController } from './nextauth.controller';
import { SessionService } from './session.service';
import { DiscordService } from './discord.service';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
@Module({
  imports: [
    PassportModule,
    ConfigModule,
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
  providers: [AuthService, SessionService, DiscordService, JwtStrategy, UsersService],
  exports: [AuthService, SessionService, DiscordService],
})
export class AuthModule {}

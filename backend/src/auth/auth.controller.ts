import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { DiscordService } from './discord.service';
import { GoogleService } from './google.service';
import { LoginDto, CreateUserDto, DiscordSignInDto, GoogleSignInDto } from '../users/user.dto';
import { SendVerificationDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto } from './auth-email.dto';
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private discordService: DiscordService,
    private googleService: GoogleService,
  ) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 200, description: "Registration successful" })
  @ApiResponse({ status: 401, description: "Registration failed" })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto)
  }

  @Post('discord/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Discord OAuth handler' })
  @ApiResponse({ status: 200, description: 'Discord OAuth successful' })
  @ApiResponse({ status: 400, description: 'Discord OAuth failed' })
  async handleDiscordOAuth(@Body() discordData: DiscordSignInDto) {
    return this.discordService.handleDiscordOAuth(discordData);
  }

  @Post('google/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google OAuth handler' })
  @ApiResponse({ status: 200, description: 'Google OAuth successful' })
  @ApiResponse({ status: 400, description: 'Google OAuth failed' })
  async handleGoogleOAuth(@Body() googleData: GoogleSignInDto) {
    return this.googleService.handleGoogleOAuth(googleData);
  }

  @Post('send-verification')
  @ApiOperation({ summary: 'Send verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async sendVerificationEmail(@Body() dto: SendVerificationDto) {
    return this.authService.sendVerificationEmail(dto.email);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset email sent if user exists' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

}

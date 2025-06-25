import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { DiscordService } from './discord.service';
import { LoginDto, CreateUserDto } from '../users/user.dto';
import { DiscordSignInDto } from '../users/user.dto';
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private discordService: DiscordService,
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

}

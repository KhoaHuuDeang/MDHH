import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional, isString, isNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  displayname: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  birth?: string;
}

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  displayname?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  birth?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  banner?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  role_id?: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}


export class DiscordSignInDto {
  @IsString()
  @IsNotEmpty()
  discordId: string; //tồn tại trong cả ba user,account,profile của discord resposne 

  @IsString()
  @IsOptional()
  username: string; // là name của người dùng, không public 

  @IsEmail()
  @IsNotEmpty()
  email: string; //email của người dùng 

  @IsString()
  @IsOptional()
  avatar: string; //avatar của người dùng

  @IsString()
  @IsOptional()
  provider: string;// tên provider, ví dụ: 'discord'

  @IsString()
  @IsOptional()
  type: string; // loại tài khoản, ví dụ: 'oauth'

  @IsString()
  @IsOptional()
  token_type: string; // loại token

  @IsString()
  @IsOptional()
  access_token: string; // access token từ discord

  @IsOptional()
  expires_at: number; // thời gian hết hạn của access token

  @IsString()
  @IsOptional()
  refresh_token: string; // refresh token từ discord

  @IsString()
  @IsOptional()
  scope: string; // phạm vi quyền truy cập của token

  @IsString()
  @IsOptional()
  global_name: string; // Tên này sẽ hiện cho người khác thấy 
}


//session_token can be null, user can delete accessToken -> cant access sessionToken after decoded 
export type SessionUser = {
  session_token: string | null;
  user_id: string;
  expires: Date;
  users: {
    email: string ;
    username: string ;
    displayname: string ;
    birth: string ;
    avatar: string ;
    email_verified: boolean ;
    roles: {
      name: RoleType ;
    } 
  } ;
};






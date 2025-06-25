import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DiscordSignInDto } from 'src/users/user.dto';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class DiscordService {
  constructor(private prisma: PrismaService,  
              private authService: AuthService,
              private readonly jwtService : JwtService
              
  ) {}


  /**
   * Xử lý đăng nhập/đăng ký qua Discord OAuth
   * - Nếu đã có account liên kết Discord, trả về token đăng nhập
   * - Nếu chưa, tìm user theo email để liên kết hoặc tạo mới
   * - Nếu user đã tồn tại (đăng ký bằng phương thức khác), tạo account Discord cho user đó
   * - Nếu user chưa tồn tại, tạo mới cả user và account
   * - Trả về token đăng nhập cho user
   */
  async handleDiscordOAuth(discordData: DiscordSignInDto) {
    const {provider, discordId, email, name, avatar, ...accountToken } = discordData;

    // 1. Kiểm tra account đã liên kết Discord chưa (provider + providerAccountId)
    const existingAccount = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: discordId,
        },
      },
      include: { user: true },
    });

    if (existingAccount) {
      // Đã liên kết, trả về token đăng nhập cho user
      // Đảm bảo password là string (không null)
      const safeUser = { ...existingAccount.user, password: existingAccount.user.password || '' };
      return this.authService.login(safeUser);
    }

    // 2. Nếu chưa có account, tìm user theo email
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      // User đã tồn tại (đăng ký bằng phương thức khác), tạo mới account Discord cho user này
      await this.prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider,
          providerAccountId: discordId,
          access_token: accountToken.access_token || null,
          refresh_token: accountToken.refresh_token || null,
          expires_at: accountToken.expires_at || null,
          scope: accountToken.scope || null,
          token_type: accountToken.token_type || null,
        },
      });
    } else {
      // 3. Nếu user chưa tồn tại, tạo mới user và account
      user = await this.prisma.user.create({
        data: {
          email,
          displayname: name || email, // fallback nếu name không có
          avatar: avatar || null,
          role: { connect: { name: 'user' } }, // Kết nối với role mặc định 'user'
          accounts: {
            create: [{
              type: 'oauth',
              provider,
              providerAccountId: discordId,
              access_token: accountToken.access_token || null,
              refresh_token: accountToken.refresh_token || null,
              expires_at: accountToken.expires_at || null,
              scope: accountToken.scope || null,
              token_type: accountToken.token_type || null,
            }],
          },
        },
      });
    }

    // 4. Đăng nhập và trả về token cho user
    const safeUser = { ...user, password: user.password || '' };
    return this.authService.login(safeUser);
  }

  private determineRoleFromDiscordRoles(discordRoles: string[]): string {
    // Define your Discord role ID to app role mapping
    const roleMapping: Record<string, string> = {
      // Example: Replace with your actual Discord role IDs
      '123456789012345678': 'admin',     // Discord Admin role ID
      '987654321098765432': 'moderator', // Discord Mod role ID
      // Add more mappings as needed
    };

    // Check for admin role first (highest priority)
    for (const roleId of discordRoles) {
      if (roleMapping[roleId] === 'admin') return 'admin';
    }

    // Check for other roles
    for (const roleId of discordRoles) {
      if (roleMapping[roleId]) return roleMapping[roleId];
    }

    // Default role
    return 'user';
  }
}

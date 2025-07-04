import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DiscordSignInDto } from 'src/users/user.dto';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from './session.service';
@Injectable()
export class DiscordService {
  constructor(private prisma: PrismaService,
    private authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService

  ) { }


  private async _createTokensAndSession(user: any & { role: any }) {
    if (!user || !user.role) {
      throw new InternalServerErrorException('User data is incomplete for token creation.');
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 ngày
    const session = await this.sessionService.createSession(user.id, expiresAt);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      displayname: user.displayname,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      sessionToken: session.sessionToken,
      expires: session.expires,
      user: {
        id: user.id,
        email: user.email,
        displayname: user.displayname,
        username: user.username,
        role: user.role.name,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
      },
    };
  }



  /**
   * Xử lý đăng nhập/đăng ký qua Discord OAuth
   * - Nếu đã có account liên kết Discord, trả về token đăng nhập
   * - Nếu chưa, tìm user theo email để liên kết hoặc tạo mới
   * - Nếu user đã tồn tại (đăng ký bằng phương thức khác), tạo account Discord cho user đó
   * - Nếu user chưa tồn tại, tạo mới cả user và account
   * - Trả về token đăng nhập cho user
   */
  async handleDiscordOAuth(dto: DiscordSignInDto) {
    console.log('HÀM NÀY ĐƯỢC CHẠY');
    console.log('Discord SignIn DTO:', dto);
    if (!dto.discordId || !dto.provider) {
      throw new UnauthorizedException('Provider ID is missing. Cannot authenticate.');
    }

    // --- KỊCH BẢN 1: USER CŨ QUAY LẠI ---
    // Tìm tài khoản liên kết (account) bằng provider và discordId

    const existingAccount = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: dto.provider,
          providerAccountId: dto.discordId,
        },
      },
      include: { user: { include: { role: true } } }, // Lấy kèm thông tin user và role
    });

    if (existingAccount) {
       console.log('TỒN TẠI USER ACCOUNT');
      // Nếu tìm thấy, user đã tồn tại. Cập nhật thông tin mới nếu cần và đăng nhập
      const updatedUser = await this.prisma.user.update({
        where: { id: existingAccount.userId },
        data: {
          displayname: dto.global_name, // Cập nhật tên
          avatar: dto.avatar, // Cập nhật avatar
        },
        include: { role: true },
      });
      console.log('Existing Discord user logged in:', updatedUser.email);
      return this._createTokensAndSession(updatedUser);
    }

    // --- KỊCH BẢN 2: USER ĐÃ CÓ TÀI KHOẢN EMAIL, NAY LIÊN KẾT DISCORD ---
    // Nếu không có account, tìm user bằng email
    const userByEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true }
    });

    if (userByEmail) {
      console.log('TỒN TẠI USER EMAIL ');
      // Nếu có user với email này, tạo một 'account' mới và liên kết nó
      await this.prisma.account.create({
        data: {
          userId: userByEmail.id,
          type: dto.type || 'oauth',
          provider: dto.provider,
          providerAccountId: dto.discordId,
          access_token: dto.access_token,
          refresh_token: dto.refresh_token,
          expires_at: dto.expires_at,
          token_type: dto.token_type,
          scope: dto.scope,
        },
      });
      console.log('Linked Discord to existing user:', userByEmail.email);
      // Trả về token cho user đã tồn tại này
      return this._createTokensAndSession(userByEmail);
    }

    // --- KỊCH BẢN 3: USER HOÀN TOÀN MỚI ---
    // Nếu không có cả account và user, tạo mới hoàn toàn
    const userRole = await this.prisma.role.findUnique({ where: { name: 'user' } });
    if (!userRole) {
      throw new InternalServerErrorException('Default user role not found.');
    }
    console.log('TẠO USER MỚI ');
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        displayname: dto.global_name, 
        username: dto.username, 
        avatar: dto.avatar,
        emailVerified: true, 
        roleId: userRole.id,
        accounts: {
          create: {
            type: dto.type || 'oauth',
            provider: dto.provider,
            providerAccountId: dto.discordId,
            access_token: dto.access_token,
            refresh_token: dto.refresh_token,
            expires_at: dto.expires_at,
            token_type: dto.token_type,
            scope: dto.scope,
          },
        },
      },
      include: { role: true }, // Luôn include role để trả về cho hàm tạo token
    });
    console.log('Created new user via Discord:', newUser.email);
    return this._createTokensAndSession(newUser);
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

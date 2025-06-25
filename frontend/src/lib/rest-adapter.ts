import type { Adapter, AdapterAccount, AdapterSession, AdapterUser, VerificationToken } from "next-auth/adapters"

const BACKEND_URL = process.env.NEXTAUTH_BACKEND_URL
/**
 * Custom REST Adapter for NextAuth
 * Thay vì NextAuth kết nối trực tiếp với database, adapter này sẽ gọi API backend
 * để thực hiện các thao tác liên quan đến user, session, account
 */
export function RestAdapter(): Adapter {
  return {
    /**
     * Tạo user mới trong hệ thống
     * Được gọi khi user đăng ký lần đầu hoặc OAuth provider tạo user mới
     * @param user - Thông tin user (không có id vì sẽ được backend tạo)
     */
    // frontend/src/lib/rest-adapter.ts
    async createUser(user: Omit<AdapterUser, "id">): Promise<AdapterUser> {
      console.log("Creating user with data:", user);
      const payload = {
        email: user.email,
        name: user.name,
        image: user.image,
      }

      const response = await fetch(`${BACKEND_URL}/auth/discord/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Gửi cái payload đã được làm sạch này đi
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Để debug tốt hơn, hãy log lỗi từ backend
        const errorBody = await response.text();
        console.error("Backend Error:", response.status, errorBody);
        throw new Error('Failed to create user');
      }

      return response.json();
    },    /**
     * Lấy thông tin user theo ID
     * Được gọi trong quá trình xác thực để lấy thông tin user
     */
    async getUser(id: string): Promise<AdapterUser | null> {
      const response = await fetch(`${BACKEND_URL}/api/auth/users/${id}`)

      if (!response.ok) {
        return null
      }

      return response.json()
    },

    /**
     * Tìm user theo email
     * Được gọi khi cần kiểm tra email đã tồn tại hay chưa
     */
    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      const response = await fetch(`${BACKEND_URL}/api/auth/users/email/${email}`)

      if (!response.ok) {
        return null
      }

      return response.json()
    },

    /**
     * Tìm user theo thông tin account (OAuth)
     * Được gọi khi user đăng nhập bằng OAuth provider (Discord, Google, etc.)
     * @param providerAccountId - ID của user tại OAuth provider
     * @param provider - Tên provider (discord, google, github, etc.)
     */
    async getUserByAccount({ providerAccountId, provider }): Promise<AdapterUser | null> {
      const response = await fetch(`${BACKEND_URL}/api/auth/users/account?provider=${provider}&providerAccountId=${providerAccountId}`)

      if (!response.ok) {
        return null
      }

      return response.json()
    },    /**
     * Cập nhật thông tin user
     * Được gọi khi cần cập nhật profile hoặc thông tin khác
     */
    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">): Promise<AdapterUser> {
      const response = await fetch(`${BACKEND_URL}/api/auth/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      return response.json()
    },

    /**
     * Xóa user khỏi hệ thống
     * Được gọi khi user xóa tài khoản
     */
    async deleteUser(userId: string): Promise<void> {
      const response = await fetch(`${BACKEND_URL}/api/auth/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }
    },    /**
     * Liên kết account OAuth với user
     * Được gọi khi user đăng nhập bằng OAuth provider lần đầu
     * hoặc khi muốn thêm provider mới vào account hiện tại
     * @param account - Thông tin account từ OAuth provider
     */
    async linkAccount(account: AdapterAccount): Promise<AdapterAccount> {
      const response = await fetch(`${BACKEND_URL}/api/auth/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      })

      if (!response.ok) {
        throw new Error('Failed to link account')
      }

      return response.json()
    },

    /**
     * Hủy liên kết account OAuth
     * Được gọi khi user muốn ngắt kết nối với OAuth provider
     */
    async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }): Promise<void> {
      const response = await fetch(`${BACKEND_URL}/api/auth/accounts?provider=${provider}&providerAccountId=${providerAccountId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to unlink account')
      }
    },    /**
     * Tạo session mới cho user
     * Được gọi khi user đăng nhập thành công
     * @param session - Thông tin session (sessionToken, userId, expires)
     */
    async createSession(session: { sessionToken: string; userId: string; expires: Date }): Promise<AdapterSession> {
      const response = await fetch(`${BACKEND_URL}/api/auth/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...session,
          expires: session.expires.toISOString(), // Convert Date to ISO string for JSON
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create session')
      }

      return response.json()
    },

    /**
     * Lấy thông tin session và user tương ứng
     * Được gọi mỗi khi cần validate session (mỗi request)
     * @param sessionToken - Token của session cần kiểm tra
     * @returns Object chứa cả session và user info, hoặc null nếu session không hợp lệ
     */
    async getSessionAndUser(sessionToken: string): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
      const response = await fetch(`${BACKEND_URL}/api/auth/sessions/${sessionToken}`)

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      // Transform the response to match NextAuth format
      // Backend có thể trả về format khác, cần map lại cho đúng
      return {
        session: {
          sessionToken: data.session.sessionToken,
          userId: data.session.userId,
          expires: new Date(data.session.expires), // Convert ISO string back to Date
        }, user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          username: data.user.username,
          role: data.user.role,
          birth: data.user.birth,
          emailVerified: data.user.emailVerified ? new Date(data.user.emailVerified) : null,
          image: data.user.image,
        } as AdapterUser
      }
    },    /**
     * Cập nhật thông tin session (thường là thời gian hết hạn)
     * Được gọi để gia hạn session khi user còn hoạt động
     */
    async updateSession(session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">): Promise<AdapterSession | null | undefined> {
      const response = await fetch(`${BACKEND_URL}/api/auth/sessions/${session.sessionToken}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      })

      if (!response.ok) {
        return null
      }

      return response.json()
    },

    /**
     * Xóa session (đăng xuất)
     * Được gọi khi user đăng xuất hoặc session hết hạn
     */
    async deleteSession(sessionToken: string): Promise<void> {
      const response = await fetch(`${BACKEND_URL}/api/auth/sessions/${sessionToken}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete session')
      }
    },    /**
     * Tạo verification token (cho email verification, password reset, etc.)
     * Được gọi khi cần gửi email xác thực hoặc reset password
     */
    async createVerificationToken(token: VerificationToken): Promise<VerificationToken> {
      const response = await fetch(`${BACKEND_URL}/api/auth/verification-tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...token,
          expires: token.expires.toISOString(), // Convert Date to ISO string
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create verification token')
      }

      return response.json()
    },

    /**
     * Sử dụng verification token (đánh dấu đã dùng và xóa)
     * Được gọi khi user click vào link trong email verification
     * @param identifier - Email hoặc identifier khác
     * @param token - Token cần validate
     * @returns Token info nếu hợp lệ, null nếu không hợp lệ/đã hết hạn
     */
    async useVerificationToken({ identifier, token }): Promise<VerificationToken | null> {
      const response = await fetch(`${BACKEND_URL}/api/auth/verification-tokens/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, token }),
      })

      if (!response.ok) {
        return null
      }

      return response.json()
    },
  }
}

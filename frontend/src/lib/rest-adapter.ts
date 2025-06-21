import type { Adapter, AdapterAccount, AdapterSession, AdapterUser, VerificationToken } from "next-auth/adapters"

const BACKEND_URL = process.env.NEXTAUTH_BACKEND_URL || "http://localhost:3001"

export function RestAdapter(): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, "id">): Promise<AdapterUser> {
      const response = await fetch(`${BACKEND_URL}/api/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create user')
      }
      
      return response.json()
    },

    async getUser(id: string): Promise<AdapterUser | null> {
      const response = await fetch(`${BACKEND_URL}/api/auth/users/${id}`)
      
      if (!response.ok) {
        return null
      }
      
      return response.json()
    },

    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      const response = await fetch(`${BACKEND_URL}/api/auth/users/email/${email}`)
      
      if (!response.ok) {
        return null
      }
      
      return response.json()
    },

    async getUserByAccount({ providerAccountId, provider }): Promise<AdapterUser | null> {
      const response = await fetch(`${BACKEND_URL}/api/auth/users/account?provider=${provider}&providerAccountId=${providerAccountId}`)
      
      if (!response.ok) {
        return null
      }
      
      return response.json()
    },

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

    async deleteUser(userId: string): Promise<void> {
      const response = await fetch(`${BACKEND_URL}/api/auth/users/${userId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete user')
      }
    },

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

    async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }): Promise<void> {
      const response = await fetch(`${BACKEND_URL}/api/auth/accounts?provider=${provider}&providerAccountId=${providerAccountId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to unlink account')
      }
    },

    async createSession(session: { sessionToken: string; userId: string; expires: Date }): Promise<AdapterSession> {
      const response = await fetch(`${BACKEND_URL}/api/auth/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...session,
          expires: session.expires.toISOString(),
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create session')
      }
      
      return response.json()
    },

    async getSessionAndUser(sessionToken: string): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
      const response = await fetch(`${BACKEND_URL}/api/auth/sessions/${sessionToken}`)
      
      if (!response.ok) {
        return null
      }
      
      const data = await response.json()
      
      // Transform the response to match NextAuth format
      return {
        session: {
          sessionToken: data.session.sessionToken,
          userId: data.session.userId,
          expires: new Date(data.session.expires),
        },        user: {
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
    },

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

    async deleteSession(sessionToken: string): Promise<void> {
      const response = await fetch(`${BACKEND_URL}/api/auth/sessions/${sessionToken}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete session')
      }
    },

    async createVerificationToken(token: VerificationToken): Promise<VerificationToken> {
      const response = await fetch(`${BACKEND_URL}/api/auth/verification-tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...token,
          expires: token.expires.toISOString(),
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create verification token')
      }
      
      return response.json()
    },

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

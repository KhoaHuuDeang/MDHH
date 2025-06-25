import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    username: string
    role: string
    birth?: string
    avatar?: string
    emailVerified?: boolean
    accessToken: string
    sessionToken?: string
  }
  interface Session {
    user: {
      id: string
      email: string
      username: string
      name: string
      role: string
      birth?: string
      avatar?: string
      emailVerified?: boolean
      // Discord-specific fields
      discordId?: string
      discordGuilds?: any[]
      discordRoles?: string[]
      provider?: string
    }
    accessToken: string
    sessionToken?: string
  }
  interface Profile {
    id: string;
    username: string;
    email: string;
    avatar?: string | null;
    global_name?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string
    role: string
    username: string
    birth?: string
    sessionToken?: string
    // Discord-specific fields
    discordId?: string
    discordGuilds?: any[]
    discordRoles?: string[]
    provider?: string
  }
}

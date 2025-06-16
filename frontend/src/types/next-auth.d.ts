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
    accessToken: string
  }

  interface Session {
    user: {
      id: string
      email: string
      username: string
      name : string
      role: string
      birth?: string
    }
    accessToken: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string
    role: string
    username: string
    birth?: string
  }
}

import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const BACKEND_URL = process.env.NEXTAUTH_BACKEND_URL || "http://localhost:3001"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const res = await fetch(`${BACKEND_URL}/auth/login`, {
                        method: 'POST',
                        body: JSON.stringify({
                            email: credentials?.email,
                            password: credentials?.password,
                        }),
                        headers: { "Content-Type": "application/json" }
                    })

                    const data = await res.json()

                    if (res.ok && data.user) {
                        return {
                            id: data.user.id,
                            email: data.user.email,
                            name: data.user.fullname,
                            username: data.user.username,
                            role: data.user.role.name,
                            accessToken: data.accessToken,
                        }
                    }
                    return null
                } catch (error) {
                    console.error('Auth error:', error)
                    return null
                }
            }
        })

    ], callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.accessToken
                token.role = user.role
                token.username = user.username
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub || ''
                session.user.role = token.role || ''
                session.user.username = token.username || ''
            }
            session.accessToken = token.accessToken || ''
            return session
        },
    },
    pages: { 
        signIn: '/auth/signin',
    },
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
}

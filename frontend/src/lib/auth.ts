import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import DiscordProvider from "next-auth/providers/discord"
import { RestAdapter } from "./rest-adapter"

const BACKEND_URL = process.env.NEXTAUTH_BACKEND_URL

// Helper function to map Discord roles to app roles
function mapDiscordRolesToAppRole(discordRoles: string[]): string {
    // Define your Discord role ID to app role mapping
    const roleMapping: Record<string, string> = {
        // Example: Replace with your actual Discord role IDs
        '123456789012345678': 'admin',     // Discord Admin role ID -> app admin
        '987654321098765432': 'moderator', // Discord Mod role ID -> app moderator
        // Add more mappings as needed
    }
    
    // Check for admin role first (highest priority)
    for (const roleId of discordRoles) {
        if (roleMapping[roleId] === 'admin') return 'admin'
    }
    
    // Check for other roles
    for (const roleId of discordRoles) {
        if (roleMapping[roleId]) return roleMapping[roleId]
    }
    
    // Default role if no special roles found
    return 'user'
}

export const authOptions: NextAuthOptions = {
    adapter : RestAdapter(),
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
                    console.log('Auth response:', data)
                    if (res.ok && data.user) {
                        return {
                             id: data.user.id,
                            email: data.user.email,
                            name: data.user.displayname,
                            username: data.user.username,
                            role: data.user.role,
                            birth: data.user.birth,
                            accessToken: data.accessToken,
                            sessionToken: data.sessionToken,
                        }
                    }
                    return null
                } catch (error) {
                    console.error('Auth error:', error)
                    return null
                }
            }
        }),
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "identify email guilds guilds.members.read"
                }
            }
        })
    ],    callbacks: {
        async jwt({ token, user, account, profile }) {
            console.log('JWT callback:', { token, user, account, profile })
            
            // Handle credentials login
            if (user && account?.provider === "credentials") {
                token.id = user.id
                token.role = user.role
                token.username = user.username
                token.birth = user.birth
                token.accessToken = user.accessToken
                token.provider = "credentials"
            }
            
            // Handle Discord OAuth
            if (user && account?.provider === "discord") {
                token.id = user.id
                token.username = user.name
                token.discordId = user.id
                token.provider = "discord"
                token.accessToken = account.access_token || ''
                
                // Fetch Discord guild roles
                if (account.access_token) {
                    try {
                        // Get user's guilds
                        const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
                            headers: {
                                Authorization: `Bearer ${account.access_token}`,
                            },
                        })
                        
                        if (guildsResponse.ok) {
                            const guilds = await guildsResponse.json()
                            console.log('Discord guilds:', guilds)
                            
                            // Get guild members info for specific guild (you can configure this)
                            const targetGuildId = process.env.DISCORD_GUILD_ID
                            
                            if (targetGuildId) {
                                const memberResponse = await fetch(`https://discord.com/api/guilds/${targetGuildId}/members/${user.id}`, {
                                    headers: {
                                        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                                    },
                                })
                                
                                if (memberResponse.ok) {
                                    const member = await memberResponse.json()
                                    console.log('Discord member roles:', member.roles)
                                    
                                    token.discordGuilds = guilds
                                    token.discordRoles = member.roles
                                      // Map Discord roles to app roles (customize this logic)
                                    token.role = mapDiscordRolesToAppRole(member.roles)
                                }
                            }
                        }
                        
                        // Send Discord data to backend for processing
                        const backendResponse = await fetch(`${BACKEND_URL}/auth/discord`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                discordId: user.id,
                                email: user.email,
                                username: user.name,
                                avatar: user.image,
                                guilds: token.discordGuilds,
                                roles: token.discordRoles,
                            }),
                        })
                        
                        if (backendResponse.ok) {
                            const backendData = await backendResponse.json()
                            token.id = backendData.user.id // Use backend user ID
                            token.role = backendData.user.role.name
                            token.birth = backendData.user.birth
                        }
                        
                    } catch (error) {
                        console.error('Discord API error:', error)
                    }
                }
            }
            
            return token
        },        async session({ session, token }) {
            // Send properties from token to the client
            if (session.user) {
                session.user.id = token.sub || token.id as string || ""
                session.user.role = token.role as string || ""
                session.user.username = token.username as string || ""
                session.user.birth = token.birth as string || ""
                
                // Add Discord-specific data
                if (token.provider === "discord") {
                    session.user.discordId = token.discordId as string
                    session.user.discordGuilds = token.discordGuilds as any[]
                    session.user.discordRoles = token.discordRoles as string[]
                    session.user.provider = "discord"
                } else {
                    session.user.provider = "credentials"
                }
            }
            session.accessToken = token.accessToken as string || ""
            return session
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
}

import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import DiscordProvider from "next-auth/providers/discord"

const BACKEND_URL = process.env.NEXTAUTH_BACKEND_URL

// Helper function to map Discord roles to app roles
// function mapDiscordRolesToAppRole(discordRoles: string[]): string {
//     // Define your Discord role ID to app role mapping
//     const roleMapping: Record<string, string> = {
//         'cmc34h3j80000tm24mt9fdslv': 'user',
//         'cmc34h3ma0001tm242g6ff0is': 'admin',
//     }

//     // Check for admin role first (highest priority)
//     for (const roleId of discordRoles) {
//         if (roleMapping[roleId] === 'admin') return 'admin'
//     }

//     // Check for other roles
//     for (const roleId of discordRoles) {
//         if (roleMapping[roleId]) return roleMapping[roleId]
//     }

//     // Default role if no special roles found
//     return 'unknown'
// }
// Thêm hàm này vào đầu file, sau phần import
async function fetchUserRolesFromDiscord(accessToken: string, userId: string, guildId: string): Promise<string[]> {
    try {
        // Fetch user's guild member info from Discord API
        const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`, // Sử dụng bot token
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch Discord guild member:', response.status);
            return [];
        }

        const memberData = await response.json();
        return memberData.roles || []; // Trả về array các role IDs
    } catch (error) {
        console.error('Error fetching Discord roles:', error);
        return [];
    }
}
export const authOptions: NextAuthOptions = {
    // adapter: RestAdapter(),
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
                            name: data.user.displayname,
                            username: data.user.username,
                            role: data.user.role,
                            birth: data.user.birth,
                            accessToken: data.accessToken,
                            sessionToken: data.sessionToken,
                            is_disabled: data.user.is_disabled || false,
                            disabled_until: data.user.disabled_until,
                            disabled_reason: data.user.disabled_reason,
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
                    scope: "identify email guilds"
                }
            }
        })
    ], callbacks: {
        async signIn({ user, account, profile }) {
            // Handle credentials login
            if (account?.provider === "credentials") {
                return true
            }
            // Handle Discord OAuth
            if (account?.provider === 'discord' && profile) {
                try {
                    // Fetch user's roles from Discord server
                    const discordRoles = await fetchUserRolesFromDiscord(
                        account.access_token!,
                        profile.id,
                        process.env.DISCORD_GUILD_ID! // ID của server Discord
                    );
                    console.log("Fetched Discord roles:", discordRoles);

                    const payload = {
                        discordId: profile.id,
                        username: profile.username,
                        email: profile.email,
                        avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
                        provider: account.provider,
                        type: account.type,
                        token_type: account.token_type,
                        access_token: account.access_token,
                        expires_at: account.expires_at,
                        refresh_token: account.refresh_token,
                        scope: account.scope,
                        global_name: profile.global_name,
                        discordRoles: discordRoles,
                    };

                    const res = await fetch(`${BACKEND_URL}/auth/discord/signin`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });

                    if (!res.ok) {
                        console.error("Backend sign-in failed:", await res.json());
                        return false;
                    }
                    const data = await res.json();
                    user.id = data.user.id;
                    user.role = data.user.role;
                    user.username = data.user.username;
                    user.birth = data.user.birth;
                    user.is_disabled = data.user.is_disabled || false;
                    user.disabled_until = data.user.disabled_until;
                    user.disabled_reason = data.user.disabled_reason;
                    user.accessToken = account.access_token!;
                    user.backendToken = data.accessToken!;
                    return true;
                } catch (error) {
                    console.error("SignIn callback error:", error);
                    return false;
                }
            }
            return false
        },
        async jwt({ token, user, account }) {
            // Handle credentials login

            if (user && account?.provider === "credentials") {
                token.id = user.id
                token.role = user.role
                token.username = user.username
                token.birth = user.birth
                token.is_disabled = user.is_disabled
                token.disabled_until = user.disabled_until
                token.disabled_reason = user.disabled_reason
                //accessToken ở đây là dúng vì backend tạo
                token.accessToken = user.accessToken!
                token.provider = "credentials"
            }

            // Handle Discord OAuth
            if (user && account?.provider === "discord") {
                // Sử dụng thông tin đã được lưu từ signIn callback
                token.id = user.id
                token.username = user.username
                token.discordId = user.id
                token.provider = "discord"
                token.role = user.role
                token.birth = user.birth
                token.image = user.avatar
                token.is_disabled = user.is_disabled
                token.disabled_until = user.disabled_until
                token.disabled_reason = user.disabled_reason
                // @ts-ignore
                //accessToken ở đây là của accessToken, nên ta cần phải 
                //rạch ròi giữa 2 cái (1 của app 1 của discord)
                token.accessToken = user.backendToken!
            }

            return token
        },
        async session({ session, token }) {
            // Send properties from token to the client
            if (session.user) {
                session.user.id = token.sub || token.id as string || ""
                session.user.role = token.role as string || ""
                session.user.username = token.username as string || ""
                session.user.birth = token.birth as string || ""
                session.user.displayname = token.name as string || ""

                // Add disabled status from token (primary source)
                session.user.is_disabled = token.is_disabled as boolean || false;
                session.user.disabled_until = token.disabled_until as Date;
                session.user.disabled_reason = token.disabled_reason as string;

                // Optionally refresh disabled status from backend for real-time updates
                // (This is useful if admin disables user while they're logged in)
                try {
                    const userStatusRes = await fetch(`${BACKEND_URL}/users/${session.user.id}/status`, {
                        headers: {
                            'Authorization': `Bearer ${token.accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (userStatusRes.ok) {
                        const statusData = await userStatusRes.json();
                        // Override with fresh backend data
                        session.user.is_disabled = statusData.is_disabled;
                        session.user.disabled_until = statusData.disabled_until;
                        session.user.disabled_reason = statusData.disabled_reason;
                    }
                } catch (error) {
                    console.error('Error refreshing user status from backend:', error);
                    // Continue with token data if backend fails
                }

                // Add Discord-specific data
                if (token.provider === "discord") {
                    session.user.discordId = token.discordId as string
                    session.user.discordGuilds = token.discordGuilds as any[]
                    session.user.discordRoles = token.discordRoles as string[]
                    session.user.provider = "discord"
                    session.user.avatar = token.image as string
                } else {
                    session.user.provider = "credentials"
                }
            }
            session.accessToken = token.accessToken!;
            return session
        },
    },
    pages: {
        signIn: '/auth',
    },
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
}

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

export const authOptions = {
    session: {
        strategy: "jwt" as const,
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                })

                if (!user) {
                    return null
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                )

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.role,
                    role: user.role,
                    balance: user.balance,
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.email = token.email
                session.user.id = token.id
                session.user.role = token.role

                // Fetch fresh data from DB to ensure it's always up-to-date
                const freshUser = await prisma.user.findUnique({
                    where: { id: token.id },
                    select: {
                        balance: true,
                        username: true,
                        image: true
                    }
                })

                session.user.balance = freshUser?.balance ?? token.balance
                session.user.username = freshUser?.username
                session.user.image = freshUser?.image
            }
            return session
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.balance = user.balance
            }
            return token
        },
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

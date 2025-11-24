import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const bets = await prisma.bet.findMany({
            where: {
                user: {
                    email: session.user.email!
                }
            },
            include: {
                game: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50 // Limit to last 50 bets
        })

        return NextResponse.json(bets)
    } catch (error) {
        console.error("[BETS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

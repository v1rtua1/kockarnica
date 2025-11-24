import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { action, amount, game } = body

        if (!action || amount === undefined || amount < 0) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email! }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        let newBalance = user.balance

        if (action === "BET") {
            if (user.balance < amount) {
                return NextResponse.json({ error: "Insufficient funds" }, { status: 400 })
            }
            newBalance -= amount
        } else if (action === "WIN") {
            newBalance += amount
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        // Update user balance
        await prisma.user.update({
            where: { email: session.user.email! },
            data: { balance: newBalance }
        })

        // Record transaction
        await prisma.transaction.create({
            data: {
                userId: user.id,
                amount: amount,
                type: action === "BET" ? "GAME_BET" : "GAME_WIN",
                status: "COMPLETED"
            }
        })

        return NextResponse.json({ balance: newBalance })

    } catch (error) {
        console.error("[GAME_TRANSACTION]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

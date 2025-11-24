import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { handleGamePlay } from "@/lib/games"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { gameId, bet, params } = body

        if (!gameId || bet === undefined || bet < 0) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email! }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        if (user.balance < bet) {
            return NextResponse.json({ error: "Insufficient funds" }, { status: 400 })
        }

        // Execute Game Logic
        const result = await handleGamePlay(gameId, bet, params)

        // Calculate new balance
        const newBalance = user.balance - bet + result.payout

        // Update User Balance
        await prisma.user.update({
            where: { email: session.user.email! },
            data: { balance: newBalance }
        })

        // Record Transaction
        await prisma.transaction.create({
            data: {
                userId: user.id,
                amount: bet,
                type: "GAME_BET",
                status: "COMPLETED"
            }
        })

        // Record Bet (Best Effort)
        try {
            const gameRecord = await prisma.game.findUnique({ where: { slug: gameId } })
            if (gameRecord) {
                await prisma.bet.create({
                    data: {
                        userId: user.id,
                        gameId: gameRecord.id,
                        amount: bet,
                        payout: result.payout,
                        result: result.payout > 0 ? "WIN" : "LOSS"
                    }
                })
            } else {
                console.warn(`[GAME_PLAY] Game record not found for slug: ${gameId}`)
            }
        } catch (betError) {
            console.error("[GAME_PLAY] Failed to record bet:", betError)
            // Do not fail the transaction if logging fails
        }

        if (result.payout > 0) {
            await prisma.transaction.create({
                data: {
                    userId: user.id,
                    amount: result.payout,
                    type: "GAME_WIN",
                    status: "COMPLETED"
                }
            })
        }

        return NextResponse.json({
            balance: newBalance,
            ...result
        })

    } catch (error) {
        console.error("[GAME_PLAY]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

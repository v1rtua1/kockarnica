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

        // Handle Bet History for Classic Slots (which uses this endpoint)
        try {
            if (game) {
                // Try to find by slug, default to classic-slots if not found or if generic
                let gameRecord = await prisma.game.findUnique({
                    where: { slug: "classic-slots" }
                })

                if (gameRecord) {
                    if (action === "BET") {
                        // Create a new Bet record (assume LOSS initially)
                        await prisma.bet.create({
                            data: {
                                userId: user.id,
                                gameId: gameRecord.id,
                                amount: amount,
                                payout: 0,
                                result: "LOSS"
                            }
                        })
                    } else if (action === "WIN") {
                        // Find the most recent LOSS bet for this user and game to update it
                        const lastBet = await prisma.bet.findFirst({
                            where: {
                                userId: user.id,
                                gameId: gameRecord.id,
                                result: "LOSS"
                            },
                            orderBy: { createdAt: "desc" }
                        })

                        if (lastBet) {
                            await prisma.bet.update({
                                where: { id: lastBet.id },
                                data: {
                                    payout: amount,
                                    result: "WIN"
                                }
                            })
                        }
                    }
                }
            }
        } catch (error) {
            console.error("[GAME_TRANSACTION] Failed to record bet history:", error)
            // Continue without failing the main transaction
        }

        return NextResponse.json({ balance: newBalance })
    } catch (error) {
        console.error("[GAME_TRANSACTION] Error processing transaction:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

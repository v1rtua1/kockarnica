import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const transactions = await prisma.transaction.findMany({
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(transactions)
    } catch (error) {
        console.error("[ADMIN_TRANSACTIONS]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

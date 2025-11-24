import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                email: true,
                role: true,
                balance: true,
                createdAt: true
            }
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error("Admin users error:", error)
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        )
    }
}

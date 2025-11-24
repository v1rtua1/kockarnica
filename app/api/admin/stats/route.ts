import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const totalUsers = await prisma.user.count()

        const balanceResult = await prisma.user.aggregate({
            _sum: {
                balance: true
            }
        })
        const totalBalance = balanceResult._sum.balance || 0

        // Active users (users created in last 24h as proxy)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        const activeUsers = await prisma.user.count({
            where: {
                updatedAt: {
                    gte: yesterday
                }
            }
        })

        const recentActivity = await prisma.user.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                email: true,
                createdAt: true
            }
        })

        return NextResponse.json({
            totalUsers,
            totalBalance,
            activeUsers,
            recentActivity
        })
    } catch (error) {
        console.error("Admin stats error:", error)
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        )
    }
}

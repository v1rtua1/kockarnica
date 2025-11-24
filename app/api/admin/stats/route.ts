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

        // Calculate last 7 days registrations
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
        sevenDaysAgo.setHours(0, 0, 0, 0)

        const dailyStats = await Promise.all(
            Array.from({ length: 7 }).map(async (_, i) => {
                const date = new Date(sevenDaysAgo)
                date.setDate(date.getDate() + i)

                const nextDate = new Date(date)
                nextDate.setDate(date.getDate() + 1)

                const count = await prisma.user.count({
                    where: {
                        createdAt: {
                            gte: date,
                            lt: nextDate
                        }
                    }
                })

                return {
                    date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    count
                }
            })
        )

        return NextResponse.json({
            totalUsers,
            totalBalance,
            activeUsers,
            recentActivity,
            dailyStats
        })
    } catch (error) {
        console.error("Admin stats error:", error)
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        )
    }
}

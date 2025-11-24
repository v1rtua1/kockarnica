import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    return NextResponse.json({
        totalUsers: 0,
        totalBalance: 0,
        activeUsers: 0,
        recentActivity: []
    })
}

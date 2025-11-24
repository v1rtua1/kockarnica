import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: {
                id: true,
                username: true,
                email: true,
                image: true,
                bio: true,
                phoneNumber: true,
                role: true,
                balance: true,
                createdAt: true,
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error("[PROFILE_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { username, email, bio, phoneNumber } = body

        // Check if username is taken (if changing)
        if (username) {
            const existingUser = await prisma.user.findUnique({
                where: { username }
            })
            if (existingUser && existingUser.email !== session.user.email) {
                return NextResponse.json({ error: "Username already taken" }, { status: 400 })
            }
        }

        const user = await prisma.user.update({
            where: { email: session.user.email! },
            data: {
                username,
                email, // Note: Changing email might require re-verification in a real app
                bio,
                phoneNumber,
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error("[PROFILE_UPDATE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

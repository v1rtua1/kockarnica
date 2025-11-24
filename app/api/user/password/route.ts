import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { currentPassword, newPassword } = body

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email! }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid current password" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { email: session.user.email! },
            data: {
                passwordHash: hashedPassword
            }
        })

        return NextResponse.json({ message: "Password updated successfully" })
    } catch (error) {
        console.error("[PASSWORD_UPDATE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

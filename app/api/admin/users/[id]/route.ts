import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await req.json()
        const { balance, role } = body

        // Prepare update data
        const updateData: any = {}
        if (balance !== undefined) updateData.balance = balance
        if (role !== undefined) updateData.role = role

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error("Update user error:", error)
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        )
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await prisma.user.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete user error:", error)
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        )
    }
}

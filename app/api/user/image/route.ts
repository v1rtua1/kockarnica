import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import path from "path"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const formData = await req.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create unique filename
        const filename = `${session.user.id}-${Date.now()}${path.extname(file.name)}`
        const uploadDir = path.join(process.cwd(), "public/uploads")
        const filepath = path.join(uploadDir, filename)

        // Ensure directory exists (basic check, might need fs.mkdir if not exists, but usually public exists)
        // For robustness we could add mkdir here but assuming public/uploads might need creation manually or via script
        // Let's try to write directly, if it fails we might need to create dir.
        // Actually, let's use a simple approach: save to public/uploads.

        // We need to make sure public/uploads exists.
        const fs = require('fs')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        await writeFile(filepath, buffer)

        const imageUrl = `/uploads/${filename}`

        await prisma.user.update({
            where: { email: session.user.email! },
            data: {
                image: imageUrl
            }
        })

        return NextResponse.json({ imageUrl })
    } catch (error) {
        console.error("[IMAGE_UPLOAD]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

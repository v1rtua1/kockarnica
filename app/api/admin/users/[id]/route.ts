import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request) {
    return NextResponse.json({})
}

export async function DELETE(req: Request) {
    return NextResponse.json({})
}

import { PrismaClient } from '@prisma/client'

console.log("DEBUG: DATABASE_URL seen by Prisma:", process.env.DATABASE_URL);

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

let prismaBase: PrismaClient

try {
    prismaBase = globalForPrisma.prisma ?? new PrismaClient()
} catch (e) {
    console.warn("Prisma init failed (likely build time)", e)
    prismaBase = {} as PrismaClient
}

export const prisma = prismaBase

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

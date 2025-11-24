const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_KHTuNLA7o8Ih@ep-fragrant-base-agzipnr7-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
        },
    },
})

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: {
                email: true,
                role: true,
                id: true
            }
        })
        console.log('Users in DB:', users)
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()

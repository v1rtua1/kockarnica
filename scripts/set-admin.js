const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_KHTuNLA7o8Ih@ep-fragrant-base-agzipnr7-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
        },
    },
})

const email = process.argv[2]

if (!email) {
    console.error("Please provide an email address")
    process.exit(1)
}

async function main() {
    try {
        const user = await prisma.user.update({
            where: { email: email },
            data: { role: 'ADMIN' }
        })
        console.log(`User ${user.email} is now ADMIN!`)
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()

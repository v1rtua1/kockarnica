const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
    const email = 'laki@admin.com'
    const password = 'laki123'
    const role = 'ADMIN'

    try {
        const passwordHash = await bcrypt.hash(password, 10)

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                passwordHash,
                role,
            },
            create: {
                email,
                passwordHash,
                role,
                balance: 10000,
            },
        })

        console.log(`Admin user created/updated:`)
        console.log(`Email: ${user.email}`)
        console.log(`Password: ${password}`)
        console.log(`Role: ${user.role}`)
    } catch (error) {
        console.error('Error creating admin user:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
    const email = 'testuser@example.com'
    const password = 'password123'

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            console.log('User already exists, deleting...')
            await prisma.user.delete({ where: { email } })
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                balance: 1000,
            },
        })

        console.log('User created successfully:', user.email)

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash)
        console.log('Password verification:', isValid ? 'SUCCESS' : 'FAILED')

    } catch (error) {
        console.error('Registration test failed:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()

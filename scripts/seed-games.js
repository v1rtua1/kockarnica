const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Checking games...")

    const games = [
        { slug: 'keno', name: 'Keno', type: 'LOTTERY' },
        { slug: 'classic-slots', name: 'Classic Slots', type: 'SLOT' },
        { slug: 'roulette', name: 'European Roulette', type: 'TABLE' },
        { slug: 'blackjack', name: 'Blackjack', type: 'CARD' },
        { slug: 'book-of-ra', name: 'Book of Ra', type: 'SLOT' },
        { slug: 'starburst', name: 'Starburst', type: 'SLOT' },
        { slug: 'lucky-lady', name: 'Lucky Lady', type: 'SLOT' },
    ]

    for (const game of games) {
        const existing = await prisma.game.findUnique({
            where: { slug: game.slug }
        })

        if (!existing) {
            console.log(`Creating game: ${game.name}`)
            await prisma.game.create({
                data: {
                    slug: game.slug,
                    name: game.name,
                    type: game.type,
                    isActive: true
                }
            })
        } else {
            console.log(`Game exists: ${game.name}`)
        }
    }

    console.log("Done.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

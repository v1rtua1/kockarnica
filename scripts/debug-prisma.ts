import { prisma } from '../lib/prisma';

async function main() {
    console.log('Script running...');
    console.log('DATABASE_URL from process.env:', process.env.DATABASE_URL);
    try {
        await prisma.$connect();
        console.log('Successfully connected to database via lib/prisma');
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

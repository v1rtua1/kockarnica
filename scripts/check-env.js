require('dotenv').config()

console.log('Checking environment variables...')
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing')
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? 'Set' : 'Missing')
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Missing')

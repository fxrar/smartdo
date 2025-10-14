import { prisma } from '../lib/prisma'

async function testConnection() {
    try {
        console.log('Testing database connection...')
        await prisma.$connect()
        console.log('✅ Database connection successful!')

        // Test a simple query
        const result = await prisma.$queryRaw`SELECT 1 as test`
        console.log('✅ Query execution successful!', result)

        await prisma.$disconnect()
        console.log('✅ Disconnected from database')
    } catch (error) {
        console.error('❌ Database connection failed:', error)
        process.exit(1)
    }
}

testConnection()
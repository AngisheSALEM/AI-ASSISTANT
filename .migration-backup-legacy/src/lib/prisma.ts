import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL

// Sanitize connection string to replace deprecated SSL modes
let sanitizedConnectionString = connectionString
if (connectionString && connectionString.startsWith('postgres')) {
  try {
    const url = new URL(connectionString)
    const sslmode = url.searchParams.get('sslmode')
    if (sslmode === 'prefer' || sslmode === 'require' || sslmode === 'verify-ca') {
      url.searchParams.set('sslmode', 'verify-full')
      sanitizedConnectionString = url.toString()
      // Overwrite the env variable to ensure all dependencies use the sanitized version
      process.env.DATABASE_URL = sanitizedConnectionString
    }
  } catch (e) {
    console.error('Error sanitizing DATABASE_URL:', e)
  }
}

// Global variable for singleton pattern
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
  pool: pg.Pool | undefined
}

// Ensure the pool is also a singleton in development/serverless
if (!globalForPrisma.pool) {
  globalForPrisma.pool = new pg.Pool({
    connectionString: sanitizedConnectionString,
    max: 10, // Max number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })
}

const adapter = new PrismaPg(globalForPrisma.pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

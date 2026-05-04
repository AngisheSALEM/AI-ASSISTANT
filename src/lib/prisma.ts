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

const pool = new pg.Pool({ connectionString: sanitizedConnectionString })
const adapter = new PrismaPg(pool)

// L'erreur venait souvent d'un manque de mise à jour du moteur Prisma 
// qui ne reconnaissait pas l'objet adapter correctement
export const prisma = new PrismaClient({ adapter })

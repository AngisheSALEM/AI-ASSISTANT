import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL

const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)

// L'erreur venait souvent d'un manque de mise à jour du moteur Prisma 
// qui ne reconnaissait pas l'objet adapter correctement
export const prisma = new PrismaClient({ adapter })
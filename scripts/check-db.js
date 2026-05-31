import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Parse .env.vercel manually
const envPath = path.resolve('.env.vercel');
if (fs.existsSync(envPath)) {
  console.log("Loading environment from .env.vercel...");
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      let value = parts.slice(1).join('=').trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
} else {
  console.log(".env.vercel does not exist, falling back to .env");
  // Try fallback to .env
  const envFallbackPath = path.resolve('.env');
  if (fs.existsSync(envFallbackPath)) {
    const envContent = fs.readFileSync(envFallbackPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        const key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  }
}

const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set in env or .env file');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: connectionString,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Checking DB Connection with URL (safe print):", connectionString.substring(0, 45) + "...");
  const orgs = await prisma.organization.findMany();
  console.log("Organizations count:", orgs.length);
  if (orgs.length > 0) {
    console.log("First organization sample:", { id: orgs[0].id, name: orgs[0].name });
  }

  const templates = await prisma.agentTemplate.findMany();
  console.log("Templates count:", templates.length);
  console.log("Templates in database:", templates.map(t => ({ id: t.id, name: t.name, category: t.category })));

  const agents = await prisma.agent.findMany();
  console.log("Agents count:", agents.length);
  console.log("Agents in database:", agents.map(a => ({ id: a.id, name: a.name, role: a.role, templateId: a.templateId, organizationId: a.organizationId })));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

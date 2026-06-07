import { defineConfig } from '@prisma/config';
import fs from 'fs';
import path from 'path';

const loadEnv = () => {
  const envPath = path.resolve('.env.vercel');
  const targetPath = fs.existsSync(envPath) ? envPath : path.resolve('.env');
  if (fs.existsSync(targetPath)) {
    const envContent = fs.readFileSync(targetPath, 'utf-8');
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
};

loadEnv();

export default defineConfig({
  datasource: {
    url: (process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL) as string,
  },
});
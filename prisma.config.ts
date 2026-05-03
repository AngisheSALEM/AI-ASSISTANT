import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    // On ajoute un fallback ou on s'assure que la variable est présente
    url: process.env.DATABASE_URL as string,
  },
});
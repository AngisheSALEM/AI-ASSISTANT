import prisma from "@/lib/prisma";
import { generateEmbedding } from "./embeddings";
import { Prisma } from "@prisma/client";

export interface SearchResult {
  content: string;
  title: string;
  similarity: number;
}

/**
 * Effectue une recherche par similarité cosinus dans la base de connaissances.
 * On utilise 1 - (embedding <=> query_vector) pour obtenir le score de similarité.
 */
export async function similaritySearch(
  query: string,
  organizationId: string,
  limit: number = 3
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query);
  const vectorString = `[${queryEmbedding.join(",")}]`;

  // Utilisation de $queryRaw avec template literals pour une sécurité maximale (Injection SQL)
  // On utilise Prisma.sql pour caster le vecteur correctement
  const results = await prisma.$queryRaw<SearchResult[]>`
    SELECT
      content,
      title,
      1 - (embedding <=> ${vectorString}::vector) as similarity
    FROM "KnowledgeBase"
    WHERE "organizationId" = ${organizationId}
    ORDER BY similarity DESC
    LIMIT ${limit};
  `;

  return results;
}

import { prisma } from "@/lib/prisma"; // Notez les accolades {}
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
  console.log('--- similaritySearch Started ---', { organizationId, limit });
  const queryEmbedding = await generateEmbedding(query);
  const vectorString = `[${queryEmbedding.join(",")}]`;

  console.log('Embedding generated, performing vector search...');
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

  console.log('Vector search results count:', results.length);
  return results;
}

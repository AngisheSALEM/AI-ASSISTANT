import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { generateEmbedding } from '@/lib/ai/embeddings';

const ingestSchema = z.object({
  organizationId: z.string(),
  title: z.string(),
  content: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organizationId, title, content } = ingestSchema.parse(body);

    console.log(`Ingesting document: ${title} for org: ${organizationId}`);

    // 1. Chunking intelligent
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitText(content);

    // 2. Génération des embeddings et stockage pour chaque morceau
    // Note: Dans une app de production, on ferait ça en parallèle ou via une file d'attente
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);

      // Conversion de l'embedding en format compatible PostgreSQL [1,2,3...]
      const vectorString = `[${embedding.join(',')}]`;

      // 3. Insertion avec SQL Brut pour le champ vector
      await prisma.$executeRaw`
        INSERT INTO "KnowledgeBase" (
          id,
          title,
          content,
          "organizationId",
          embedding,
          metadata,
          "updatedAt"
        )
        VALUES (
          ${crypto.randomUUID()},
          ${title},
          ${chunk},
          ${organizationId},
          ${vectorString}::vector,
          ${JSON.stringify({ source: 'upload', timestamp: new Date().toISOString() })}::jsonb,
          NOW()
        )
      `;
    }

    return NextResponse.json({
      success: true,
      message: `${chunks.length} morceaux de document ingérés avec succès`,
    });

  } catch (error) {
    console.error('Ingestion error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

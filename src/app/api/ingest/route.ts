import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const ingestSchema = z.object({
  organizationId: z.string(),
  title: z.string(),
  content: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organizationId, title, content } = ingestSchema.parse(body);

    // Simulation de l'extraction de texte et génération d'embeddings
    console.log(`Ingesting document: ${title} for org: ${organizationId}`);

    // Dans une implémentation réelle, on utiliserait OpenAI Embeddings ici
    // et on stockerait le vecteur avec prisma.$executeRaw ou une extension pgvector.

    const knowledge = await prisma.knowledgeBase.create({
      data: {
        title,
        content,
        organizationId,
        metadata: {
          source: 'upload',
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Document ingéré avec succès",
      data: knowledge
    });

  } catch (error) {
    console.error('Ingestion error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

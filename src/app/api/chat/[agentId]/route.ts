import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { similaritySearch } from "@/lib/ai/vector-store";
import { getAgentModel } from "@/lib/ai/agent-engine";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

// On retire runtime = "edge" car Prisma Client ne le supporte pas nativement sans proxy
// export const runtime = "edge";

export async function POST(
  req: Request,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params;
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Récupérer l'agent et son organisation
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { organization: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // 2. Recherche RAG : Trouver le contexte pertinent
    const contextResults = await similaritySearch(message, agent.organizationId);
    const contextText = contextResults
      .map((r) => `[Source: ${r.title}]\n${r.content}`)
      .join("\n\n");

    // 3. Préparer le System Prompt augmenté
    const augmentedSystemPrompt = `
      ${agent.systemPrompt}

      CONTEXTE RELEVANT DE LA BASE DE CONNAISSANCES:
      ${contextText || "Aucun contexte spécifique trouvé."}

      INSTRUCTIONS:
      Réponds à l'utilisateur en utilisant le contexte ci-dessus si pertinent.
      Si tu ne connais pas la réponse, dis-le poliment.
    `;

    // 4. Initialiser le modèle et streamer la réponse
    const model = getAgentModel(agent.temperature);

    const parser = new StringOutputParser();

    const stream = await model.pipe(parser).stream([
      new SystemMessage(augmentedSystemPrompt),
      new HumanMessage(message),
    ]);

    // Conversion du stream pour qu'il soit compatible avec le format Response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });

  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

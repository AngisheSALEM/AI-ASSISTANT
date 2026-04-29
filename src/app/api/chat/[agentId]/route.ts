import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hasEnoughCredits, deductCredits } from "@/lib/auth/check-credits";
import { similaritySearch } from "@/lib/ai/vector-store";
import { getModelForOrganization } from "@/lib/ai/model-router";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function POST(
  req: Request,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params;
    const body = await req.json();
    const { message, conversationId } = body;

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

    // 1b. Get model and check credits
    const { model, cost } = await getModelForOrganization(agent.organizationId, agent.temperature);
    const canProceed = await hasEnoughCredits(agent.organizationId, cost);
    if (!canProceed) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }

    // 2. Gérer la conversation
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const newConversation = await prisma.conversation.create({
        data: { agentId },
      });
      currentConversationId = newConversation.id;
    }

    // 3. Enregistrer le message de l'utilisateur
    await prisma.message.create({
      data: {
        content: message,
        role: "USER",
        conversationId: currentConversationId,
      },
    });

    // 4. Récupérer l'historique (5 derniers messages)
    const history = await prisma.message.findMany({
      where: { conversationId: currentConversationId },
      orderBy: { createdAt: "desc" },
      take: 6, // Les 5 derniers + le message actuel qu'on vient d'ajouter
    });

    // On inverse pour avoir l'ordre chronologique et on exclut le dernier (le message actuel est géré séparément dans HumanMessage)
    const pastMessages = history
      .slice(1)
      .reverse()
      .map((msg) => {
        if (msg.role === "USER") return new HumanMessage(msg.content);
        return new AIMessage(msg.content);
      });

    // 5. Recherche RAG : Trouver le contexte pertinent
    const contextResults = await similaritySearch(message, agent.organizationId);
    const contextText = contextResults
      .map((r) => `[Source: ${r.title}]\n${r.content}`)
      .join("\n\n");

    // 6. Préparer le System Prompt augmenté
    const augmentedSystemPrompt = `
      ${agent.systemPrompt}

      CONTEXTE RELEVANT DE LA BASE DE CONNAISSANCES:
      ${contextText || "Aucun contexte spécifique trouvé."}

      INSTRUCTIONS:
      Réponds à l'utilisateur en utilisant le contexte ci-dessus si pertinent.
      Si tu ne connais pas la réponse, dis-le poliment.
    `;

    // 7. Streamer la réponse
    const parser = new StringOutputParser();

    const stream = await model.pipe(parser).stream([
      new SystemMessage(augmentedSystemPrompt),
      ...pastMessages,
      new HumanMessage(message),
    ]);

    // Conversion du stream pour qu'il soit compatible avec le format Response
    const encoder = new TextEncoder();
    let fullResponse = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          fullResponse += chunk;
          controller.enqueue(encoder.encode(chunk));
        }

        controller.close();

        // 8. Enregistrer la réponse de l'IA une fois le stream terminé
        // On le fait après controller.close() pour ne pas bloquer la fin du stream pour l'utilisateur.
        // NOTE: Dans certains environnements Edge (Vercel), il est recommandé d'utiliser
        // une Promise qui est attendue si on veut être 100% sûr, mais ici on suit
        // l'architecture demandée pour ne pas ralentir l'affichage.
        const saveMessage = async () => {
          try {
            await prisma.message.create({
              data: {
                content: fullResponse,
                role: "ASSISTANT",
                conversationId: currentConversationId,
              },
            });
          } catch (dbError) {
            console.error("Error saving assistant message:", dbError);
          }
        };

        // Exécution "en arrière-plan"
        await saveMessage();

        // Deduct credits after successful message processing
        try {
          await deductCredits(agent.organizationId, cost);
        } catch (creditError) {
          console.error("Error deducting credits:", creditError);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Conversation-Id": currentConversationId,
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

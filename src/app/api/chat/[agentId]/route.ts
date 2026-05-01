import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hasEnoughCredits, deductCredits } from "@/lib/auth/check-credits";
import { similaritySearch } from "@/lib/ai/vector-store";
import { getModelForOrganization } from "@/lib/ai/model-router";
import { getAvailableTools } from "@/lib/integrations/toolRegistry";
import { SystemMessage, HumanMessage, AIMessage, BaseMessage, ToolMessage } from "@langchain/core/messages";
import { Runnable } from "@langchain/core/runnables";

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
    const pastMessages: BaseMessage[] = history
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

    // 6. Récupérer les outils dynamiques basés sur les intégrations actives
    const tools = await getAvailableTools(agent.organizationId);

    // 7. Préparer le System Prompt augmenté
    const augmentedSystemPrompt = `
      ${agent.systemPrompt}

      CONTEXTE RELEVANT DE LA BASE DE CONNAISSANCES:
      ${contextText || "Aucun contexte spécifique trouvé."}

      INSTRUCTIONS:
      Réponds à l'utilisateur en utilisant le contexte ci-dessus si pertinent.
      Si tu ne connais pas la réponse, dis-le poliment.
      ${tools.length > 0 ? "Tu as accès à des outils pour effectuer des actions. Utilise-les si nécessaire." : ""}
    `;

    // 8. Préparer le modèle avec les outils
    let modelWithTools: Runnable = model;
    if (tools.length > 0) {
        // @ts-ignore - bindTools is available on ChatOpenAI and ChatGroq
        modelWithTools = model.bindTools(tools);
    }

    const messages: BaseMessage[] = [
        new SystemMessage(augmentedSystemPrompt),
        ...pastMessages,
        new HumanMessage(message),
    ];

    // Conversion du stream pour qu'il soit compatible avec le format Response
    const encoder = new TextEncoder();
    let fullResponse = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
            // Première invocation du modèle
            let result = await modelWithTools.invoke(messages);

            // Boucle de gestion des appels d'outils (limité à 5 itérations pour éviter les boucles infinies)
            let iterations = 0;
            while (result.tool_calls && result.tool_calls.length > 0 && iterations < 5) {
                iterations++;
                messages.push(result);

                for (const toolCall of result.tool_calls) {
                    const tool = tools.find((t) => t.name === toolCall.name);
                    if (tool) {
                        const toolResult = await tool.invoke(toolCall.args);
                        messages.push(new ToolMessage({
                            tool_call_id: toolCall.id!,
                            content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
                        }));
                    } else {
                        messages.push(new ToolMessage({
                            tool_call_id: toolCall.id!,
                            content: `Tool ${toolCall.name} not found.`,
                        }));
                    }
                }
                // Ré-invocation du modèle après l'exécution des outils
                result = await modelWithTools.invoke(messages);
            }

            // Une fois que l'IA a fini d'appeler des outils, on streame sa réponse finale
            // Pour simplifier ici car on a déjà fait l'invoke final, on streame le contenu de 'result'
            // Dans une vraie implémentation de streaming bout-en-bout avec outils,
            // on utiliserait des outils comme LangGraph ou on gérerait le stream manuellement de façon plus complexe.
            const content = result.content as string;
            fullResponse = content;
            controller.enqueue(encoder.encode(content));

            controller.close();

            // 9. Enregistrer la réponse de l'IA
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

            await saveMessage();

            // Deduct credits after successful message processing
            try {
              await deductCredits(agent.organizationId, cost);
            } catch (creditError) {
              console.error("Error deducting credits:", creditError);
            }
        } catch (streamError) {
            console.error("Stream error:", streamError);
            controller.error(streamError);
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

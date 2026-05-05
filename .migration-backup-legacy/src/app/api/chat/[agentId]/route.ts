import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Fail fast if no AI API keys are configured
if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
  console.error("Warning: Missing AI API Keys at module load");
}
import { hasEnoughCredits, deductCredits } from "@/lib/auth/check-credits";
import { similaritySearch } from "@/lib/ai/vector-store";
import { getModelForOrganization } from "@/lib/ai/model-router";
import { getAvailableTools } from "@/lib/integrations/toolRegistry";
import { SystemMessage, HumanMessage, AIMessage, BaseMessage, ToolMessage } from "@langchain/core/messages";
import { Runnable } from "@langchain/core/runnables";

export const maxDuration = 60; // Allow time for AI inference + cold starts

export async function POST(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  console.log('--- Agent Chat API POST Request Started ---');
  try {
    // In Next.js 14+, params must be awaited
    const { agentId } = await params;
    console.log('Agent ID from params:', agentId);
    console.log('Parsing request body...');
    const body = await req.json();
    const { message, conversationId: requestedConversationId } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Récupérer l'agent et son organisation
    console.log('Fetching agent from Prisma...');
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { organization: true },
    });
    console.log('Agent fetch result:', agent ? { id: agent.id, orgId: agent.organizationId } : 'Not found');

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // 1b. Get model and check credits
    console.log('Checking model and credits for org:', agent.organizationId);
    const { model, cost } = await getModelForOrganization(agent.organizationId, agent.temperature);
    console.log('Model details:', { cost });
    const canProceed = await hasEnoughCredits(agent.organizationId, cost);
    console.log('Can proceed with chat:', canProceed);
    if (!canProceed) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }

    // 2. Gérer la conversation - Ensure existence
    let currentConversationId = requestedConversationId;
    console.log('Checking conversation status for ID:', currentConversationId);
    if (currentConversationId) {
      const existingConversation = await prisma.conversation.findUnique({
        where: { id: currentConversationId }
      });
      console.log('Existing conversation query result:', existingConversation ? 'Found' : 'Not found');
      if (!existingConversation) {
        currentConversationId = null;
      }
    }

    if (!currentConversationId) {
      console.log('Creating new conversation for agent:', agentId);
      const newConversation = await prisma.conversation.create({
        data: { agentId },
      });
      currentConversationId = newConversation.id;
      console.log('New conversation created:', currentConversationId);
    }

    // 3. Enregistrer le message de l'utilisateur
    console.log('Saving user message to DB...');
    await prisma.message.create({
      data: {
        content: message,
        role: "user",
        conversationId: currentConversationId,
      },
    });
    console.log('User message saved');

    // 4. Récupérer l'historique (5 derniers messages)
    console.log('Fetching message history for conversation:', currentConversationId);
    const history = await prisma.message.findMany({
      where: { conversationId: currentConversationId },
      orderBy: { createdAt: "desc" },
      take: 6, // Les 5 derniers + le message actuel qu'on vient d'ajouter
    });
    console.log('History fetched, count:', history.length);

    // On inverse pour avoir l'ordre chronologique et on exclut le dernier (le message actuel est géré séparément dans HumanMessage)
    const pastMessages: BaseMessage[] = history
      .slice(1)
      .reverse()
      .map((msg) => {
        if (msg.role?.toLowerCase() === "user") return new HumanMessage(msg.content || "");
        return new AIMessage(msg.content || "");
      });

    // 5. Recherche RAG : Trouver le contexte pertinent
    console.log('Performing RAG similarity search for org:', agent.organizationId);
    const contextResults = await similaritySearch(message, agent.organizationId);
    console.log('RAG search results count:', contextResults.length);
    const contextText = contextResults
      .map((r) => `[Source: ${r.title}]\n${r.content}`)
      .join("\n\n");

    // 6. Récupérer les outils dynamiques basés sur les intégrations actives
    console.log('Fetching available tools for org:', agent.organizationId);
    const tools = await getAvailableTools(agent.organizationId);
    console.log('Tools found:', tools.length);

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
            console.log('Invoking model with tools...');
            let result = await modelWithTools.invoke(messages);

            // Boucle de gestion des appels d'outils (limité à 5 itérations pour éviter les boucles infinies)
            let iterations = 0;
            while (result.tool_calls && result.tool_calls.length > 0 && iterations < 5) {
                iterations++;
                console.log(`Tool call iteration ${iterations}, calls:`, result.tool_calls.length);
                messages.push(result);

                for (const toolCall of result.tool_calls) {
                    console.log(`Executing tool: ${toolCall.name}`);
                    const tool = tools.find((t) => t.name === toolCall.name);
                    if (tool) {
                        const toolResult = await tool.invoke(toolCall.args);
                        console.log(`Tool ${toolCall.name} result:`, toolResult);
                        messages.push(new ToolMessage({
                            tool_call_id: toolCall.id!,
                            content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
                        }));
                    } else {
                        console.error(`Tool ${toolCall.name} not found.`);
                        messages.push(new ToolMessage({
                            tool_call_id: toolCall.id!,
                            content: `Tool ${toolCall.name} not found.`,
                        }));
                    }
                }
                // Ré-invocation du modèle après l'exécution des outils
                console.log('Re-invoking model after tool calls...');
                result = await modelWithTools.invoke(messages);
            }

            // Une fois que l'IA a fini d'appeler des outils, on streame sa réponse finale
            const content = result.content as string;
            fullResponse = content;
            controller.enqueue(encoder.encode(content));

            controller.close();

            // 9. Enregistrer la réponse de l'IA
            const saveMessage = async () => {
              try {
                console.log('Saving assistant response to DB...');
                await prisma.message.create({
                  data: {
                    content: fullResponse,
                    role: "assistant",
                    conversationId: currentConversationId,
                  },
                });
                console.log('Assistant response saved');
              } catch (dbError) {
                console.error("Error saving assistant message:", dbError);
              }
            };

            await saveMessage();

            // Deduct credits after successful message processing
            try {
              console.log('Deducting credits for org:', agent.organizationId);
              await deductCredits(agent.organizationId, cost);
              console.log('Credits deducted successfully');
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

  } catch (error: any) {
    console.error("--- Agent Chat Error ---");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

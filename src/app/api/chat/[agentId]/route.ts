import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasEnoughCredits, deductCredits } from "@/lib/auth/check-credits";
import { similaritySearch } from "@/lib/ai/vector-store";
import { getPreferredGeminiModel } from "@/lib/ai/google-models";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, tool, convertToCoreMessages } from "ai";
import { z } from "zod";
import { inngest } from "@/lib/inngest/client";

export const maxDuration = 60; // Allow time for AI inference + cold starts
export const runtime = 'nodejs';

const FREE_GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  console.log('--- Agent Chat API POST Request Started (Streaming Refactor) ---');
  try {
    const { agentId } = await params;
    const body = await req.json();
    const { message, conversationId: requestedConversationId, messages: historyMessages = [] } = body;

    if (!message && historyMessages.length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Fetch agent and organization
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { organization: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // 1b. Check credits (simplified for streaming - we'll deduct at the end)
    const cost = 0; // Gemini is free in this implementation
    const canProceed = await hasEnoughCredits(agent.organizationId, cost);
    if (!canProceed) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }

    // 2. Handle conversation
    let currentConversationId = requestedConversationId;
    if (currentConversationId) {
      const existingConversation = await prisma.conversation.findUnique({
        where: { id: currentConversationId }
      });
      if (!existingConversation) {
        currentConversationId = null;
      }
    }

    if (!currentConversationId) {
      const newConversation = await prisma.conversation.create({
        data: { agentId },
      });
      currentConversationId = newConversation.id;
    }

    // 3. Save user message to Inngest in background
    try {
        await inngest.send({
            name: "chat/message.save",
            data: {
                content: message || historyMessages[historyMessages.length - 1]?.content || "",
                role: "user",
                conversationId: currentConversationId,
            },
        });
    } catch (e) {
        console.error("Error sending user message to Inngest:", e);
    }

    // 4. Perform RAG search
    const contextResults = await similaritySearch(message || historyMessages[historyMessages.length - 1]?.content || "", agent.organizationId);
    const contextText = contextResults
      .map((r) => `[Source: ${r.title}]\n${r.content}`)
      .join("\n\n");

    // 5. Prepare Model
    const googleProvider = createGoogleGenerativeAI({
      apiKey: FREE_GEMINI_KEY || 'dummy-key',
    });
    const preferredGeminiModel = getPreferredGeminiModel();
    const model = googleProvider(preferredGeminiModel);

    // 6. Define dynamic tools (Simplified for AI SDK compatibility)
    // In a full implementation, we'd map getAvailableTools output to AI SDK tools
    const activeIntegrations = await prisma.integration.findMany({
        where: { organizationId: agent.organizationId, isActive: true }
    });

    const tools: Record<string, any> = {};

    activeIntegrations.forEach(integration => {
        if (integration.type === 'TELEGRAM') {
            tools.send_telegram_notification = tool({
                description: "Envoie une notification à un utilisateur ou un canal Telegram.",
                parameters: z.object({
                    chatId: z.string().describe("L'ID du chat Telegram ou le nom d'utilisateur."),
                    message: z.string().describe("Le message à envoyer."),
                }),
                execute: async ({ chatId, message }) => {
                    console.log(`[Tool] Telegram to ${chatId}: ${message}`);
                    return `Message envoyé à Telegram.`;
                }
            });
        }
        if (integration.type === 'WHATSAPP') {
            tools.send_whatsapp_message = tool({
                description: "Envoie un message WhatsApp à un numéro spécifié.",
                parameters: z.object({
                    phoneNumber: z.string().describe("Le numéro de téléphone au format international."),
                    text: z.string().describe("Le contenu du message."),
                }),
                execute: async ({ phoneNumber, text }) => {
                    console.log(`[Tool] WhatsApp to ${phoneNumber}: ${text}`);
                    return `Message envoyé à WhatsApp.`;
                }
            });
        }
    });

    const augmentedSystemPrompt = `
      ${agent.systemPrompt}

      CONTEXTE RELEVANT DE LA BASE DE CONNAISSANCES:
      ${contextText || "Aucun contexte spécifique trouvé."}

      INSTRUCTIONS:
      Réponds à l'utilisateur en utilisant le contexte ci-dessus si pertinent.
      Si tu ne connais pas la réponse, dis-le poliment.
    `;

    // 7. Generate Text
    const cleanHistoryMessages = historyMessages.map(({ role, content }: any) => ({ role, content }));
    const { text, toolResults } = await generateText({
      model: model as any,
      messages: cleanHistoryMessages.length > 0
        ? convertToCoreMessages(cleanHistoryMessages)
        : [{ role: 'user', content: message }],
      system: augmentedSystemPrompt,
      tools,
    });

    // Save assistant response via Inngest
    try {
      await inngest.send({
        name: "chat/message.save",
        data: {
          content: text,
          role: "assistant",
          conversationId: currentConversationId,
        },
      });
      await deductCredits(agent.organizationId, cost);
    } catch (e) {
      console.error("Error sending assistant message to Inngest:", e);
    }

    return NextResponse.json({
      text,
      toolResults,
      conversationId: currentConversationId,
    }, {
      headers: {
        "X-Conversation-Id": String(currentConversationId),
      },
    });

  } catch (error: any) {
    console.error("--- Agent Chat Error (Streaming) ---");
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

import { openai } from '@ai-sdk/openai';
import { groq } from '@ai-sdk/groq';
import { streamText, tool, convertToCoreMessages } from 'ai';
import { z } from 'zod';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Notez les accolades {}
import { Plan } from "@prisma/client";

export const maxDuration = 60; // Increased for AI inference + cold starts

interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role: string;
  organizationId?: string | null;
}

export async function POST(req: Request) {
  try {
    // Check for API Keys early - FAIL FAST instead of proceeding
    if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
      console.error("Missing AI API Keys (OPENAI_API_KEY or GROQ_API_KEY)");
      return new Response(JSON.stringify({
        error: 'Service Unavailable',
        details: 'AI service is not configured. Please set OPENAI_API_KEY or GROQ_API_KEY.'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const orgId = user.organizationId;

    // Get organization plan for model selection if orgId exists
    let plan: Plan = Plan.FREE;
    if (orgId) {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { plan: true },
      });
      if (org) {
        plan = org.plan;
      }
    }

    const body = await req.json();
    const { messages: rawMessages, conversationId: requestedConversationId } = body;

    if (!rawMessages || !Array.isArray(rawMessages) || rawMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ensure messages are properly formatted for the AI SDK
    // We normalize the role to lowercase to avoid issues with some providers
    // and then use convertToCoreMessages to handle the rest.
    const normalizedMessages = rawMessages.map((m: any) => ({
      ...m,
      role: (m.role?.toLowerCase() ?? 'user') as 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool',
    }));

    // For database persistence, we want a simple format
    const lastRawMessage = normalizedMessages[normalizedMessages.length - 1];

    // 1. Ensure conversation exists and is valid
    let conversationId = requestedConversationId;
    if (conversationId) {
      const existingConversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      });
      if (!existingConversation) {
        conversationId = null;
      }
    }

    if (!conversationId) {
      const newConversation = await prisma.conversation.create({
        data: {
          // Copilot conversations are not tied to a specific agent initially
        }
      });
      conversationId = newConversation.id;
    }

    // 2. Save User Message
    if (lastRawMessage && lastRawMessage.role === 'user') {
      await prisma.message.create({
        data: {
          role: 'user',
          content: typeof lastRawMessage.content === 'string' ? lastRawMessage.content : JSON.stringify(lastRawMessage.content),
          conversationId,
        }
      });
    }

    // Model selection based on plan
    const model = plan === Plan.PREMIUM
      ? openai('gpt-4o')
      : groq('llama-3.3-70b-versatile');

    const result = await streamText({
      model: model as any,
      messages: convertToCoreMessages(normalizedMessages),
      system: `Tu es "Opere Copilot", un assistant intelligent pour les entreprises.
      Ton rôle est d'aider l'utilisateur à configurer et gérer ses agents IA.

      Tu peux utiliser des outils pour afficher des interfaces spécifiques :
      - Utilisez request_agent_selection pour permettre à l'utilisateur de choisir un type d'agent (Support, Vente, etc.).
      - Utilisez request_whatsapp_credentials quand l'utilisateur veut configurer son intégration WhatsApp.
      - Utilisez show_insight_report pour afficher un rapport d'activité avec les KPIs.

      Réponds de manière professionnelle et concise.`,
      tools: {
        request_agent_selection: tool({
          description: 'Affiche l\'interface de sélection du type d\'agent.',
          parameters: z.object({
            message: z.string().optional().describe('Un message optionnel à afficher au-dessus de la sélection.'),
          }),
          execute: async ({ message }) => {
            return { status: 'success', ui: 'AGENT_SELECTION', message };
          },
        }),
        request_whatsapp_credentials: tool({
          description: 'Affiche le formulaire de configuration des identifiants WhatsApp (Access Token et Phone ID).',
          parameters: z.object({
            message: z.string().optional().describe('Un message optionnel à afficher au-dessus du formulaire.'),
          }),
          execute: async ({ message }) => {
            return { status: 'success', ui: 'WHATSAPP_INPUT', message };
          },
        }),
        show_insight_report: tool({
          description: 'Affiche un rapport d\'activité avec les KPIs (Interactions, Taux de résolution, Utilisateurs actifs).',
          parameters: z.object({
            interactions: z.number().describe('Le nombre total d\'interactions.'),
            resolutionRate: z.number().describe('Le taux de résolution en pourcentage.'),
            activeUsers: z.number().describe('Le nombre d\'utilisateurs actifs.'),
            date: z.string().describe('La date du rapport (ex: "Aujourd\'hui", "24 Mai 2024").'),
          }),
          execute: async (data) => {
            return { status: 'success', ui: 'INSIGHT_REPORT', ...data };
          },
        }),
      },
      onFinish: async ({ text, toolCalls, toolResults }) => {
        try {
          // Mapping tool results to uiType and uiData for persistence
          const uiToolResult = toolResults?.find(r =>
            ['request_agent_selection', 'request_whatsapp_credentials', 'show_insight_report'].includes(r.toolName)
          );

          await prisma.message.create({
            data: {
              role: 'assistant',
              content: text || null,
              conversationId,
              uiType: uiToolResult ? (uiToolResult.result as { ui: string }).ui : null,
              uiData: uiToolResult ? (uiToolResult.result as any) : null,
            }
          });
        } catch (error) {
          console.error('Failed to save assistant message:', error);
        }
      },
    });

    return result.toDataStreamResponse({
      headers: {
        'x-conversation-id': String(conversationId),
      }
    });
  } catch (error: any) {
    console.error('Chat Copilot Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

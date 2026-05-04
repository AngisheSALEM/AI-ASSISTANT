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
  console.log('--- Chat API POST Request Started ---');
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

    console.log('Fetching session...');
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    console.log('Session user:', user ? { id: user.id, orgId: user.organizationId } : 'No user');

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const orgId = user.organizationId;

    // Get organization plan for model selection if orgId exists
    let plan: Plan = Plan.FREE;
    if (orgId) {
      console.log('Fetching organization plan for orgId:', orgId);
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { plan: true },
      });
      if (org) {
        plan = org.plan;
        console.log('Organization plan found:', plan);
      } else {
        console.log('Organization not found for orgId:', orgId);
      }
    }

    console.log('Parsing request body...');
    const body = await req.json();
    const { messages: rawMessages, conversationId: requestedConversationId } = body;
    console.log('Request parameters:', {
      messageCount: rawMessages?.length,
      requestedConversationId
    });

    if (!rawMessages || !Array.isArray(rawMessages) || rawMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Normalizing messages...');
    // Ensure messages are properly formatted for the AI SDK
    // We normalize the role to lowercase to avoid issues with some providers
    // and then use convertToCoreMessages to handle the rest.
    const normalizedMessages = rawMessages.map((m: any) => ({
      ...m,
      role: (m.role?.toLowerCase() ?? 'user') as 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool',
      content: m.content ?? "", // Handle null content safely
    }));
    console.log('Normalized messages count:', normalizedMessages.length);

    // For database persistence, we want a simple format
    const lastRawMessage = normalizedMessages[normalizedMessages.length - 1];

    // 1. Ensure conversation exists and is valid
    let conversationId = requestedConversationId;
    if (conversationId) {
      console.log('Checking existing conversation:', conversationId);
      const existingConversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      });
      if (!existingConversation) {
        console.log('Conversation not found, will create new one');
        conversationId = null;
      } else {
        console.log('Existing conversation found');
      }
    }

    if (!conversationId) {
      console.log('Creating new conversation...');
      const newConversation = await prisma.conversation.create({
        data: {
          // Copilot conversations are not tied to a specific agent initially
        }
      });
      conversationId = newConversation.id;
      console.log('New conversation created:', conversationId);
    }

    // 2. Save User Message
    if (lastRawMessage && lastRawMessage.role === 'user') {
      console.log('Saving user message to DB...');
      await prisma.message.create({
        data: {
          role: 'user',
          content: typeof lastRawMessage.content === 'string' ? lastRawMessage.content : JSON.stringify(lastRawMessage.content),
          conversationId,
        }
      });
      console.log('User message saved');
    }

    // Model selection based on plan
    const model = plan === Plan.PREMIUM
      ? openai('gpt-4o')
      : groq('llama-3.3-70b-versatile');

    console.log('Starting streamText with model:', plan === Plan.PREMIUM ? 'gpt-4o' : 'llama-3.3-70b-versatile');
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
        console.log('streamText finished');
        try {
          // Mapping tool results to uiType and uiData for persistence
          const uiToolResult = toolResults?.find(r =>
            ['request_agent_selection', 'request_whatsapp_credentials', 'show_insight_report'].includes(r.toolName)
          );

          console.log('Saving assistant message to DB...');
          await prisma.message.create({
            data: {
              role: 'assistant',
              content: text || null,
              conversationId,
              uiType: uiToolResult ? (uiToolResult.result as { ui: string }).ui : null,
              uiData: uiToolResult ? (uiToolResult.result as any) : null,
            }
          });
          console.log('Assistant message saved');
        } catch (error) {
          console.error('Failed to save assistant message:', error);
        }
      },
    });

    return result.toAIStreamResponse({
      headers: {
        'x-conversation-id': String(conversationId),
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error: any) {
    console.error('--- Chat Copilot Error ---');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Return more descriptive error for debugging
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

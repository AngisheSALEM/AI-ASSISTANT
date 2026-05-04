import { openai } from '@ai-sdk/openai';
import { groq } from '@ai-sdk/groq';
import { streamText, tool, convertToCoreMessages } from 'ai';
import { z } from 'zod';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";

export const maxDuration = 60;

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

    console.log('Parsing request body...');
    const body = await req.json();
    const { messages: rawMessages, conversationId: requestedConversationId } = body;
    console.log('Request parameters:', {
      messageCount: rawMessages?.length,
      requestedConversationId
    });

    console.log('Fetching session...');
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    console.log('Session user:', user ? { id: user.id, orgId: user.organizationId } : 'No user');

    if (!user) {
      console.error('Unauthorized access attempt');
      return new Response('Unauthorized', { status: 401 });
    }

    const orgId = user.organizationId;
    console.log('Initializing plan variable with Plan.FREE');
    let plan: Plan = Plan.FREE;
    if (orgId) {
      console.log('Fetching organization plan for orgId:', orgId);
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { plan: true },
      });
      console.log('Organization query result:', org);
      if (org) {
        plan = org.plan;
        console.log('Organization plan updated to:', plan);
      } else {
        console.log('Organization not found for orgId:', orgId);
      }
    }

    if (!rawMessages || !Array.isArray(rawMessages) || rawMessages.length === 0) {
      console.error('Messages are missing or invalid');
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Normalizing messages...');
    const normalizedMessages = rawMessages.map((m: any) => ({
      ...m,
      role: (m.role?.toLowerCase() ?? 'user') as 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool',
      content: m.content ?? "",
    }));
    console.log('Normalized messages count:', normalizedMessages.length);

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
        data: {}
      });
      conversationId = newConversation.id;
      console.log('New conversation created:', conversationId);
    }

    const lastRawMessage = normalizedMessages[normalizedMessages.length - 1];
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

    // Model selection: Prioritize Groq (Llama) as requested by the user
    const model = process.env.GROQ_API_KEY
      ? groq('llama-3.3-70b-versatile')
      : openai('gpt-4o-mini');

    console.log('Starting streamText with model:', process.env.GROQ_API_KEY ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini');

    console.log('Calling streamText...');
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
            console.log('Executing tool: request_agent_selection', { message });
            return { status: 'success', ui: 'AGENT_SELECTION', message };
          },
        }),
        request_whatsapp_credentials: tool({
          description: 'Affiche le formulaire de configuration des identifiants WhatsApp.',
          parameters: z.object({
            message: z.string().optional().describe('Un message optionnel à afficher au-dessus du formulaire.'),
          }),
          execute: async ({ message }) => {
            console.log('Executing tool: request_whatsapp_credentials', { message });
            return { status: 'success', ui: 'WHATSAPP_INPUT', message };
          },
        }),
        show_insight_report: tool({
          description: 'Affiche un rapport d\'activité avec les KPIs.',
          parameters: z.object({
            interactions: z.number(),
            resolutionRate: z.number(),
            activeUsers: z.number(),
            date: z.string(),
          }),
          execute: async (data) => {
            console.log('Executing tool: show_insight_report', data);
            return { status: 'success', ui: 'INSIGHT_REPORT', ...data };
          },
        }),
      },
      onFinish: async ({ text, toolResults }) => {
        console.log('streamText onFinish triggered', {
          textLength: text?.length,
          toolResultsCount: toolResults?.length
        });
        try {
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

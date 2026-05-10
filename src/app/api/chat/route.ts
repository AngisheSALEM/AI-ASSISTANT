import { openai } from '@ai-sdk/openai';
import { groq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool, convertToCoreMessages } from 'ai';
import { z } from 'zod';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";

export const maxDuration = 60;

// Free Gemini API key for testing (limited usage)
const FREE_GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

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
    console.log('Parsing request body...');
    const body = await req.json();
    const { messages: rawMessages, conversationId: requestedConversationId, provider = 'gemini' } = body;
    console.log('Request parameters:', {
      messageCount: rawMessages?.length,
      requestedConversationId,
      provider
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

    // Model selection based on provider preference
    let model;
    let modelName = '';
    
    const hasGeminiKey = !!FREE_GEMINI_KEY && FREE_GEMINI_KEY !== 'AIza...';
    const hasGroqKey = !!process.env.GROQ_API_KEY;
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

    const googleProvider = createGoogleGenerativeAI({
      apiKey: FREE_GEMINI_KEY || 'dummy-key',
    });

    // Always prefer Gemini (free) as requested - Temporary solution, but only if key is present
    const forceGemini = hasGeminiKey;

    if (forceGemini) {
      model = googleProvider('gemini-1.5-flash');
      modelName = 'gemini-1.5-flash (forced)';
    } else if (hasGeminiKey && provider === 'gemini') {
      model = googleProvider('gemini-1.5-flash');
      modelName = 'gemini-1.5-flash';
    } else if (hasGroqKey && (provider === 'groq' || !hasOpenAIKey)) {
      model = groq('llama-3.3-70b-versatile');
      modelName = 'llama-3.3-70b-versatile';
    } else if (hasOpenAIKey) {
      model = openai('gpt-4o-mini');
      modelName = 'gpt-4o-mini';
    } else {
      // Last resort fallback to Gemini if requested, even if key might be missing (to trigger proper provider error if still fails)
      // but better to throw a clear error here if we know no keys are available
      if (!hasGeminiKey && !hasGroqKey && !hasOpenAIKey) {
        throw new Error("No AI API keys configured. Please set GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY.");
      }

      model = googleProvider('gemini-1.5-flash');
      modelName = 'gemini-1.5-flash (final fallback)';
    }


    console.log('Starting streamText with model:', modelName);

    console.log('Calling streamText...');
    const result = await streamText({
      model: model as any,
      messages: convertToCoreMessages(normalizedMessages),
      system: `Tu es "Opere Copilot", un assistant intelligent pour les entreprises.
      Ton role est d'aider l'utilisateur a configurer et gerer ses agents IA.

      Tu peux utiliser des outils pour afficher des interfaces specifiques :
      - Utilisez request_agent_selection pour permettre a l'utilisateur de choisir un type d'agent (Support, Vente, etc.).
      - Utilisez request_whatsapp_credentials quand l'utilisateur veut configurer son integration WhatsApp.
      - Utilisez show_insight_report pour afficher un rapport d'activite avec les KPIs.

      Reponds de maniere professionnelle et concise. Sois amical et serviable.`,
      tools: {
        request_agent_selection: tool({
          description: 'Affiche l\'interface de selection du type d\'agent.',
          parameters: z.object({
            message: z.string().optional().describe('Un message optionnel a afficher au-dessus de la selection.'),
          }),
          execute: async ({ message }) => {
            console.log('Executing tool: request_agent_selection', { message });
            const templates = await prisma.agentTemplate.findMany();
            return {
              status: 'success',
              ui: 'AGENT_SELECTION',
              message,
              templates: templates.map(t => ({
                id: t.id,
                name: t.name,
                description: t.description,
                category: t.category,
                pricePerMonth: t.pricePerMonth,
                icon: t.icon
              }))
            };
          },
        }),
        request_whatsapp_credentials: tool({
          description: 'Affiche le formulaire de configuration des identifiants WhatsApp.',
          parameters: z.object({
            message: z.string().optional().describe('Un message optionnel a afficher au-dessus du formulaire.'),
          }),
          execute: async ({ message }) => {
            console.log('Executing tool: request_whatsapp_credentials', { message });
            return { status: 'success', ui: 'WHATSAPP_INPUT', message };
          },
        }),
        show_insight_report: tool({
          description: 'Affiche un rapport d\'activite avec les KPIs.',
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
        'x-model': modelName,
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

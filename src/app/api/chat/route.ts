import { openai } from '@ai-sdk/openai';
import { groq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, tool, convertToCoreMessages } from 'ai';
import { getPreferredGeminiModel } from '@/lib/ai/google-models';
import { z } from 'zod';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";
import { inngest } from "@/lib/inngest/client";
import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const runtime = 'nodejs';

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
      toolInvocations: m.toolInvocations,
    }));
    console.log('Normalized messages count:', normalizedMessages.length);
    console.log('FULL MESSAGES PAYLOAD:', JSON.stringify(normalizedMessages, null, 2));

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
      console.log('Sending user message to Inngest for background saving...');
      await inngest.send({
        name: 'chat/message.save',
        data: {
          role: 'user',
          content: typeof lastRawMessage.content === 'string' ? lastRawMessage.content : JSON.stringify(lastRawMessage.content),
          conversationId,
        }
      });
      console.log('User message event sent to Inngest');
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

    // Always prefer Gemini (free) as requested - Temporary solution
    // We prioritize Gemini to avoid falling back to paid providers like OpenAI
    const forceGemini = true;
    const preferredGeminiModel = getPreferredGeminiModel();

    if (forceGemini) {
      if (!FREE_GEMINI_KEY || FREE_GEMINI_KEY === '') {
        throw new Error("Gemini API key is missing. Please set GOOGLE_GENERATIVE_AI_API_KEY.");
      }
      if (FREE_GEMINI_KEY === 'AIza...') {
        throw new Error("Placeholder Gemini API key detected ('AIza...'). Please provide a valid GOOGLE_GENERATIVE_AI_API_KEY.");
      }
      model = googleProvider(preferredGeminiModel);
      modelName = `${preferredGeminiModel} (forced)`;
    } else if (hasGeminiKey && provider === 'gemini') {
      model = googleProvider(preferredGeminiModel);
      modelName = preferredGeminiModel;
    } else if (hasGroqKey && (provider === 'groq' || !hasOpenAIKey)) {
      model = groq('llama-3.3-70b-versatile');
      modelName = 'llama-3.3-70b-versatile';
    } else if (hasOpenAIKey) {
      model = openai('gpt-4o-mini');
      modelName = 'gpt-4o-mini';
    } else {
      model = googleProvider(preferredGeminiModel);
      modelName = `${preferredGeminiModel} (final fallback)`;
    }


    console.log('Starting generateText with model:', modelName);

    console.log('Calling generateText...');
    const { text, toolResults, finishReason, usage } = await generateText({
      model: model as any,
      messages: convertToCoreMessages(normalizedMessages),
      system: `Tu es "Opere Copilot", l'expert d'onboarding d'Opere. Ton objectif est d'aider l'utilisateur à créer son premier agent IA.

      CONTEXTE DE FLUX :
      L'onboarding suit ces étapes :
      1. CHOIX AGENT (Etape actuelle si aucun agent n'est choisi) -> Tu dois appeler 'request_agent_selection'.
      2. CONFIGURATION -> Une fois l'agent choisi, demande les détails (nom, ton, etc.).
      3. CONNEXION -> Propose de connecter WhatsApp via 'request_whatsapp_credentials'.

      INSTRUCTIONS CRITIQUES :
      - Si l'utilisateur exprime le souhait de créer ou configurer un agent, appelle IMMÉDIATEMENT 'request_agent_selection'.
      - Ne te contente pas de dire que tu es là pour aider. AGIS en appelant les outils appropriés.
      - TOUJOURS fournir un texte d'accompagnement explicatif avec chaque appel d'outil.
      - Tu dois TOUJOURS fournir une réponse textuelle non vide. Si tu appelles un outil, fournis aussi un résumé ou du contexte en texte.
      - Ne jamais renvoyer une réponse vide.
      - Si l'utilisateur semble perdu, guide-le vers l'étape suivante du flux.`,
      tools: {
        request_agent_selection: tool({
          description: "Affiche l'interface de selection du type d'agent.",
          parameters: z.object({
            message: z.string().optional().describe('Un message optionnel a afficher au-dessus de la selection.'),
          }),
          execute: async ({ message }) => {
            console.log('Executing tool: request_agent_selection', { message });
            try {
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
            } catch (error) {
              console.error('Error in request_agent_selection tool:', error);
              return { status: 'error', message: 'Failed to fetch templates' };
            }
          },
        }),
        request_whatsapp_credentials: tool({
          description: "Affiche le formulaire de configuration des identifiants WhatsApp.",
          parameters: z.object({
            message: z.string().optional().describe('Un message optionnel a afficher au-dessus du formulaire.'),
          }),
          execute: async ({ message }) => {
            console.log('Executing tool: request_whatsapp_credentials', { message });
            return { status: 'success', ui: 'WHATSAPP_INPUT', message };
          },
        }),
        show_insight_report: tool({
          description: "Affiche un rapport d'activite avec les KPIs.",
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
    });

    console.log('RAW AI RESPONSE:', { text, toolResults, finishReason });
    console.log('generateText completed', {
      text: text || '(empty)',
      textLength: text?.length,
      toolResultsCount: toolResults?.length,
      finishReason,
      usage
    });

    let finalAssistantText = text;
    if (!finalAssistantText && (!toolResults || toolResults.length === 0)) {
        console.warn('Empty response from AI and no tools called. Using fallback response.', {
          model: modelName,
          finishReason,
          usage: usage ? { ...usage } : 'none'
        });
        finalAssistantText = "Je suis là pour vous aider. Comment puis-je vous assister aujourd'hui ?";
    }

    const uiToolResult = toolResults?.find(r =>
      ['request_agent_selection', 'request_whatsapp_credentials', 'show_insight_report'].includes(r.toolName)
    );

    try {
      console.log('Sending assistant message to Inngest for background saving...');
      await inngest.send({
        name: 'chat/message.save',
        data: {
          role: 'assistant',
          content: finalAssistantText || null,
          conversationId,
          uiType: uiToolResult ? (uiToolResult.result as { ui: string }).ui : null,
          uiData: uiToolResult ? (uiToolResult.result as any) : null,
        }
      });
      console.log('Assistant message event sent to Inngest');
    } catch (error) {
      console.error('Failed to send assistant message event to Inngest:', error);
    }

    return NextResponse.json({
      text: finalAssistantText,
      toolResults,
      conversationId,
      uiType: uiToolResult ? (uiToolResult.result as { ui: string }).ui : null,
      uiData: uiToolResult ? (uiToolResult.result as any) : null,
    }, {
      headers: {
        'x-conversation-id': String(conversationId),
        'x-model': modelName,
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

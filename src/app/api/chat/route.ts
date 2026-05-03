import { openai } from '@ai-sdk/openai';
import { groq } from '@ai-sdk/groq';
import { streamText, tool, type CoreMessage } from 'ai';
import { z } from 'zod';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Plan } from "@prisma/client";

export const maxDuration = 30;

interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role: string;
  organizationId?: string | null;
}

export async function POST(req: Request) {
  try {
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

    const { messages, conversationId: requestedConversationId } = await req.json();
    const lastMessage = messages[messages.length - 1];

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
    if (lastMessage && lastMessage.role === 'user') {
      await prisma.message.create({
        data: {
          role: 'user',
          content: lastMessage.content,
          conversationId,
        }
      });
    }

    // Model selection based on plan
    const model = plan === Plan.PREMIUM
      ? openai('gpt-4o')
      : groq('llama3-70b-8192');

    const result = await streamText({
      model: model as any,
      messages: messages as CoreMessage[],
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
              uiData: uiToolResult ? (uiToolResult.result as any) : undefined,
            }
          });
        } catch (error) {
          console.error('Failed to save assistant message:', error);
        }
      },
    });

    return result.toDataStreamResponse({
      headers: {
        'x-conversation-id': conversationId,
      }
    });
  } catch (error) {
    console.error('Chat Copilot Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

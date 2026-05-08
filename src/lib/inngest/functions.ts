import { inngest } from "./client";
import { prisma } from "@/lib/prisma";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { getAgentModel } from "@/lib/ai/agent-engine";
import { SystemMessage, HumanMessage, AIMessage, BaseMessage, ToolMessage } from "@langchain/core/messages";
import { similaritySearch } from "@/lib/ai/vector-store";
import { getAvailableTools } from "@/lib/integrations/toolRegistry";
import { Runnable } from "@langchain/core/runnables";
import crypto from "crypto";

/**
 * Hermes Background Thinking:
 * Handles complex/long-running tasks for agents with full capabilities.
 */
export const hermesThinking = inngest.createFunction(
  { id: "hermes-thinking", name: "Hermes Thinking", triggers: [{ event: "agent/task.requested" as any }] },
  async ({ event, step }: any) => {
    const { agentId, organizationId, text, from, phoneId } = event.data;

    return await step.run("process-task", async () => {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        include: { organization: true },
      });

      if (!agent) throw new Error("Agent not found");

      // 1. RAG Context
      const contextResults = await similaritySearch(text, agent.organizationId);
      const contextText = contextResults
        .map((r) => `[Source: ${r.title}]\n${r.content}`)
        .join("\n\n");

      // 2. Tools
      const tools = await getAvailableTools(agent.organizationId);

      // 3. System Prompt
      const hermesPrompt = `Tu es un Computer Agent autonome intégré à la plateforme Opere. Ta mission est d'agir comme un employé virtuel proactif pour l'organisation.

Capacités :
1. Action (Outils) : Tu ne te contentes pas de parler. Utilise les fonctions (tools) à ta disposition.
2. Auto-Apprentissage (Skills) : Génère un Skill (JSON) via save_skill après une réussite.
3. Gestion de l'Asynchronisme : Tu travailles actuellement en arrière-plan.
4. Mémoire : Consulte la KnowledgeBase pour les préférences client.

${agent.systemPrompt}

CONTEXTE RELEVANT:
${contextText || "Aucun contexte spécifique."}`;

      const model = getAgentModel(agent.temperature);
      let modelWithTools: Runnable = model;
      if (tools.length > 0) {
          // @ts-ignore
          modelWithTools = model.bindTools(tools);
      }

      const messages: BaseMessage[] = [
        new SystemMessage(hermesPrompt),
        new HumanMessage(text),
      ];

      // Handle iterations
      let result = await modelWithTools.invoke(messages);
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
              }
          }
          result = await modelWithTools.invoke(messages);
      }

      const responseText = result.content as string;

      // Send WhatsApp response
      await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${agent.organization.whatsappAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: from,
          type: "text",
          text: { body: responseText },
        }),
      });

      return { responseText };
    });
  }
);

/**
 * Dream Memory Consolidation:
 * Runs daily at 02h00 to consolidate conversations into KnowledgeBase.
 */
export const dreamMemoryConsolidation = inngest.createFunction(
  { id: "dream-memory-consolidation", name: "Dream Memory Consolidation", triggers: [{ cron: "0 2 * * *" as any }] },
  async ({ step }: any) => {
    await step.run("consolidate-memories", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const conversations = await prisma.conversation.findMany({
        where: {
          updatedAt: {
            gte: yesterday,
          },
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
          agent: true,
        },
      });

      for (const conv of conversations) {
        if (!conv.agent || conv.messages.length < 2) continue;

        const summary = conv.messages
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n");

        const embedding = await generateEmbedding(summary);
        const vectorString = `[${embedding.join(",")}]`;

        await prisma.$executeRaw`
          INSERT INTO "KnowledgeBase" (
            id,
            title,
            content,
            "organizationId",
            embedding,
            metadata,
            "updatedAt"
          )
          VALUES (
            ${crypto.randomUUID()},
            ${`Memory: ${conv.agent.name} - ${conv.id}`},
            ${summary},
            ${conv.agent.organizationId},
            ${vectorString}::vector,
            ${JSON.stringify({ source: 'dream-memory', conversationId: conv.id })}::jsonb,
            NOW()
          )
        `;
      }
    });
  }
);

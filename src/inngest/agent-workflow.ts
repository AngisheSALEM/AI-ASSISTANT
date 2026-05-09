import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/prisma";
import { similaritySearch } from "@/lib/ai/vector-store";
import { getAgentModel } from "@/lib/ai/agent-engine";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { SKILL_GENERATION_PROMPT } from "@/lib/ai/prompts";

export const agentWorkflow = inngest.createFunction(
  {
    id: "agent-workflow",
    name: "Agent Workflow",
  },
  { event: "app/agent.message.received" as any },
  // @ts-ignore
  async ({ event, step }: any) => {
    const { message, organizationId, phoneId, from, agentId, whatsappAccessToken } = event.data;

    // 1. RAG Search
    const context = await step.run("rag-search", async () => {
      const results = await similaritySearch(message, organizationId);
      return results
        .map((r) => `[Source: ${r.title}]\n${r.content}`)
        .join("\n\n");
    });

    // 2. AI Reasoning
    const responseText = await step.run("ai-reasoning", async () => {
      const agent = await prisma.agent.findUnique({ where: { id: agentId } });
      if (!agent) throw new Error("Agent not found");

      const model = getAgentModel(agent.temperature);
      const parser = new StringOutputParser();

      return await model.pipe(parser).invoke([
        new SystemMessage(`${agent.systemPrompt}\n\nCONTEXTE:\n${context}`),
        new HumanMessage(message),
      ]);
    });

    // 3. Send WhatsApp Response
    await step.run("send-whatsapp", async () => {
      await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${whatsappAccessToken}`,
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
    });

    // 4. Persistence
    await step.run("save-conversation", async () => {
      const conversation = await prisma.conversation.create({
        data: { agentId },
      });

      await prisma.message.createMany({
        data: [
          { content: message, role: "user", conversationId: conversation.id },
          { content: responseText, role: "assistant", conversationId: conversation.id },
        ],
      });
    });

    // 5. Skill Generation (Learning loop)
    // Here we simulate checking if a tool was used successfully.
    // In a real scenario, we would check the message metadata or history.
    await step.run("skill-generation", async () => {
      // Mock condition: if the response mentions a specific action (e.g., "facture", "email")
      const shouldGenerateSkill = responseText.toLowerCase().includes("facture") ||
                                   responseText.toLowerCase().includes("envoi");

      if (shouldGenerateSkill) {
        const model = getAgentModel(0); // Low temperature for extraction
        const parser = new StringOutputParser();

        const skillJson = await model.pipe(parser).invoke([
          new SystemMessage(SKILL_GENERATION_PROMPT),
          new HumanMessage(`Interaction: User: ${message} \n Agent: ${responseText}`),
        ]);

        try {
          const skillData = JSON.parse(skillJson);
          await prisma.skill.create({
            data: {
              name: skillData.name,
              description: skillData.description,
              toolName: skillData.toolName,
              schema: skillData.schema,
              organizationId: organizationId,
            },
          });
        } catch (e) {
          console.error("Failed to parse or save skill:", e);
        }
      }
    });

    return { status: "processed", responseText };
  }
);

import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/prisma";

export const chatPersistenceWorkflow = inngest.createFunction(
  {
    id: "chat-persistence",
    triggers: [{ event: "chat/message.save" }],
  },
  // @ts-ignore
  async ({ event, step }) => {
    const { role, content, conversationId, uiType, uiData } = event.data;

    await step.run("save-to-db", async () => {
      return await prisma.message.create({
        data: {
          role,
          content,
          conversationId,
          uiType: uiType || null,
          uiData: uiData || null,
        },
      });
    });

    return { status: "saved" };
  }
);

import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { agentWorkflow } from "@/inngest/agent-workflow";
import { chatPersistenceWorkflow } from "@/inngest/chat-persistence";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    agentWorkflow,
    chatPersistenceWorkflow,
  ],
});

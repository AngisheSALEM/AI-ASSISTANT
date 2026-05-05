import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";

export const CREDIT_COSTS = {
  GROQ_TEXT: 1,
  OPENAI_TEXT: 5,
  VOICE: 10,
};

export async function getModelForOrganization(organizationId: string, temperature: number = 0.7) {
  console.log(`[model-router] Fetching model for org: ${organizationId}`);

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, plan: true },
  });

  if (!org) {
    console.error(`[model-router] Organization not found: ${organizationId}`);
    throw new Error("Organization not found");
  }

  console.log(`[model-router] Org plan: ${org.plan}`);

  // User requested Llama (Groq) for debugging/cost reasons
  if (process.env.GROQ_API_KEY) {
    console.log(`[model-router] Using Groq Llama for org ${organizationId}`);
    return {
      model: new ChatGroq({
        model: "llama-3.3-70b-versatile",
        temperature,
        apiKey: process.env.GROQ_API_KEY,
        streaming: true,
      }),
      cost: CREDIT_COSTS.GROQ_TEXT,
      plan: org.plan,
    };
  }

  // Fallback to OpenAI if Groq is not configured
  if (process.env.OPENAI_API_KEY) {
    console.warn(`[model-router] GROQ_API_KEY missing, falling back to OpenAI for org ${organizationId}`);
    return {
      model: new ChatOpenAI({
        modelName: org.plan === Plan.PREMIUM ? "gpt-4o" : "gpt-4o-mini",
        temperature,
        streaming: true,
      }),
      cost: CREDIT_COSTS.OPENAI_TEXT,
      plan: org.plan,
    };
  }

  console.error(`[model-router] No AI API key configured`);
  throw new Error("No AI API key configured. Set GROQ_API_KEY or OPENAI_API_KEY.");
}

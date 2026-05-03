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
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { plan: true },
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  if (org.plan === Plan.PREMIUM) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required for premium plan");
    }
    return {
      model: new ChatOpenAI({
        modelName: "gpt-4o",
        temperature,
        streaming: true,
      }),
      cost: CREDIT_COSTS.OPENAI_TEXT,
      plan: org.plan,
    };
  }

  // Plan FREE or STANDARD - prefer Groq, fallback to OpenAI
  if (process.env.GROQ_API_KEY) {
    return {
      model: new ChatGroq({
        model: "llama3-70b-8192",
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
    return {
      model: new ChatOpenAI({
        modelName: "gpt-4o-mini",
        temperature,
        streaming: true,
      }),
      cost: CREDIT_COSTS.OPENAI_TEXT,
      plan: org.plan,
    };
  }

  throw new Error("No AI API key configured. Set GROQ_API_KEY or OPENAI_API_KEY.");
}

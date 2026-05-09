import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";

export const CREDIT_COSTS = {
  GEMINI_TEXT: 0, // Free for testing
  GROQ_TEXT: 1,
  OPENAI_TEXT: 5,
  VOICE: 10,
};

// Free Gemini API key for testing
const FREE_GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export async function getModelForOrganization(organizationId: string, temperature: number = 0.7, provider: string = 'gemini') {
  console.log(`[model-router] Fetching model for org: ${organizationId}, provider: ${provider}`);

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, plan: true },
  });

  if (!org) {
    console.error(`[model-router] Organization not found: ${organizationId}`);
    throw new Error("Organization not found");
  }

  console.log(`[model-router] Org plan: ${org.plan}`);

  // Default to Gemini (free) for testing
  if (provider === 'gemini' || (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY)) {
    console.log(`[model-router] Using Gemini (free) for org ${organizationId}`);
    return {
      model: new ChatGoogleGenerativeAI({
        model: "gemini-1.5-flash",
        temperature,
        apiKey: FREE_GEMINI_KEY,
      }),
      provider: 'gemini',
      cost: CREDIT_COSTS.GEMINI_TEXT,
      plan: org.plan,
    };
  }

  // Use Groq if requested and available
  if (provider === 'groq' && process.env.GROQ_API_KEY) {
    console.log(`[model-router] Using Groq Llama for org ${organizationId}`);
    return {
      model: new ChatGroq({
        model: "llama-3.3-70b-versatile",
        temperature,
        apiKey: process.env.GROQ_API_KEY,
        streaming: true,
      }),
      provider: 'groq',
      cost: CREDIT_COSTS.GROQ_TEXT,
      plan: org.plan,
    };
  }

  // Use OpenAI if requested and available
  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    console.log(`[model-router] Using OpenAI for org ${organizationId}`);
    return {
      model: new ChatOpenAI({
        modelName: org.plan === Plan.PREMIUM ? "gpt-4o" : "gpt-4o-mini",
        temperature,
        streaming: true,
      }),
      provider: 'openai',
      cost: CREDIT_COSTS.OPENAI_TEXT,
      plan: org.plan,
    };
  }

  // Fallback to Gemini
  console.log(`[model-router] Falling back to Gemini for org ${organizationId}`);
  return {
    model: new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature,
      apiKey: FREE_GEMINI_KEY,
    }),
    provider: 'gemini',
    cost: CREDIT_COSTS.GEMINI_TEXT,
    plan: org.plan,
  };
}

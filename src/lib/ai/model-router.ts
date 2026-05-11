import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getPreferredGeminiModel } from "./google-models";
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

  const hasGeminiKey = !!FREE_GEMINI_KEY && FREE_GEMINI_KEY !== 'AIza...';
  const hasGroqKey = !!process.env.GROQ_API_KEY;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

  // Always prefer Gemini (free) as requested - Temporary solution
  const forceGemini = true;
  const preferredGeminiModel = getPreferredGeminiModel();

  if (forceGemini || (provider === 'gemini' && hasGeminiKey)) {
    if (!hasGeminiKey) {
      console.error(`[model-router] Gemini API key is missing for org ${organizationId}`);
      throw new Error("Gemini API key is missing. Please set GOOGLE_GENERATIVE_AI_API_KEY.");
    }
    console.log(`[model-router] Using Gemini (${preferredGeminiModel}) for org ${organizationId} (Force: ${forceGemini})`);
    return {
      model: new ChatGoogleGenerativeAI({
        model: preferredGeminiModel,
        temperature,
        apiKey: FREE_GEMINI_KEY,
      }),
      provider: 'gemini',
      cost: CREDIT_COSTS.GEMINI_TEXT,
      plan: org.plan,
    };
  }

  // Fallback hierarchy if Gemini is not forced/available
  if (hasGroqKey && (provider === 'groq' || !hasOpenAIKey)) {
    console.log(`[model-router] Using Groq Llama for org ${organizationId}`);
    return {
      model: new ChatGroq({
        model: "llama-3.3-70b-versatile",
        temperature,
        apiKey: process.env.GROQ_API_KEY,
      }),
      provider: 'groq',
      cost: CREDIT_COSTS.GROQ_TEXT,
      plan: org.plan,
    };
  }

  if (hasOpenAIKey) {
    console.log(`[model-router] Using OpenAI for org ${organizationId}`);
    return {
      model: new ChatOpenAI({
        modelName: org.plan === Plan.PREMIUM ? "gpt-4o" : "gpt-4o-mini",
        temperature,
      }),
      provider: 'openai',
      cost: CREDIT_COSTS.OPENAI_TEXT,
      plan: org.plan,
    };
  }

  // Final attempt: Fallback to Gemini even if key seems missing, to let the provider throw a descriptive error if it really is
  console.log(`[model-router] Falling back to Gemini for org ${organizationId} (last resort)`);
  if (!hasGeminiKey && !hasGroqKey && !hasOpenAIKey) {
     console.warn(`[model-router] No API keys found for org ${organizationId}`);
  }

  return {
    model: new ChatGoogleGenerativeAI({
      model: preferredGeminiModel,
      temperature,
      apiKey: FREE_GEMINI_KEY || 'dummy-key',
    }),
    provider: 'gemini',
    cost: CREDIT_COSTS.GEMINI_TEXT,
    plan: org.plan,
  };
}

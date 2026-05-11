import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getPreferredGeminiModel } from "./google-models";

export interface AgentConfig {
  name: string;
  role: string;
  systemPrompt: string;
  temperature: number;
  tools: any[];
}

export function getAgentModel(temperature: number = 0.7) {
  const FREE_GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const hasGeminiKey = !!FREE_GEMINI_KEY && FREE_GEMINI_KEY !== 'AIza...';
  const hasGroqKey = !!process.env.GROQ_API_KEY;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

  // Always prefer Gemini (free) as requested - Temporary solution
  const forceGemini = true;
  const preferredGeminiModel = getPreferredGeminiModel();

  if (forceGemini) {
    if (!hasGeminiKey) {
      throw new Error("Gemini API key is missing. Please set GOOGLE_GENERATIVE_AI_API_KEY.");
    }
    return new ChatGoogleGenerativeAI({
      model: preferredGeminiModel,
      temperature,
      apiKey: FREE_GEMINI_KEY,
    });
  }

  // Use Groq Llama if possible
  if (hasGroqKey) {
    return new ChatGroq({
      model: "llama-3.3-70b-versatile",
      temperature,
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  if (hasOpenAIKey) {
    return new ChatOpenAI({
      modelName: "gpt-4o",
      temperature,
    });
  }

  // Fallback to Gemini (free) for testing (last resort)
  return new ChatGoogleGenerativeAI({
    model: preferredGeminiModel,
    temperature,
    apiKey: FREE_GEMINI_KEY || 'dummy-key',
  });
}

/**
 * Cette configuration centralise la manière dont les agents sont instanciés.
 * Pour l'instant, on prépare le terrain pour le "Tool Calling".
 */
export const defaultAgentConfig: Partial<AgentConfig> = {
  temperature: 0.7,
  tools: [], // Prêt pour la Phase 4
};

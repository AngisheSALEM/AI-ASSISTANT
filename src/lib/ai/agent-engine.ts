import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export interface AgentConfig {
  name: string;
  role: string;
  systemPrompt: string;
  temperature: number;
  tools: any[];
}

export function getAgentModel(temperature: number = 0.7) {
  const FREE_GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  // Always prefer Gemini (free) as requested - Temporary solution
  const forceGemini = true;

  if (forceGemini || (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY)) {
    return new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature,
      apiKey: FREE_GEMINI_KEY,
    });
  }

  // Use Groq Llama if possible
  if (process.env.GROQ_API_KEY) {
    return new ChatGroq({
      model: "llama-3.3-70b-versatile",
      temperature,
      apiKey: process.env.GROQ_API_KEY,
      streaming: true,
    });
  }

  if (process.env.OPENAI_API_KEY) {
    return new ChatOpenAI({
      modelName: "gpt-4o",
      temperature,
      streaming: true,
    });
  }

  // Fallback to Gemini (free) for testing
  return new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature,
    apiKey: FREE_GEMINI_KEY,
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

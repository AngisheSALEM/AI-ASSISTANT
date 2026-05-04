import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";

export interface AgentConfig {
  name: string;
  role: string;
  systemPrompt: string;
  temperature: number;
  tools: any[];
}

export function getAgentModel(temperature: number = 0.7) {
  // Use Groq Llama if possible as requested
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

  throw new Error("No AI API key configured (GROQ_API_KEY or OPENAI_API_KEY)");
}

/**
 * Cette configuration centralise la manière dont les agents sont instanciés.
 * Pour l'instant, on prépare le terrain pour le "Tool Calling".
 */
export const defaultAgentConfig: Partial<AgentConfig> = {
  temperature: 0.7,
  tools: [], // Prêt pour la Phase 4
};

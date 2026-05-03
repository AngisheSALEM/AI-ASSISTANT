import { ChatOpenAI } from "@langchain/openai";

export interface AgentConfig {
  name: string;
  role: string;
  systemPrompt: string;
  temperature: number;
  tools: any[];
}

export function getAgentModel(temperature: number = 0.7) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required for agent model");
  }
  return new ChatOpenAI({
    modelName: "gpt-4o",
    temperature,
    streaming: true,
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

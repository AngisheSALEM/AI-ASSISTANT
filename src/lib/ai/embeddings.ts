import { OpenAIEmbeddings } from "@langchain/openai";

const apiKey = process.env.OPENAI_API_KEY || "dummy-key";

export const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
  openAIApiKey: apiKey,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }
  return await embeddings.embedQuery(text);
}

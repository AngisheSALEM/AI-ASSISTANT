import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Always prefer Gemini as requested - Temporary solution
const forceGemini = true;

const openAIApiKey = process.env.OPENAI_API_KEY || "dummy-key";
const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export const openAIEmbeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
  openAIApiKey: openAIApiKey,
});

// Initialize embeddings lazily or with a dummy key for build time
export const getGoogleEmbeddings = () => new GoogleGenerativeAIEmbeddings({
  modelName: "embedding-001", // Default Google embedding model
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "dummy-key",
});

export const embeddings = (forceGemini || !process.env.OPENAI_API_KEY) ? getGoogleEmbeddings() : openAIEmbeddings;

export async function generateEmbedding(text: string): Promise<number[]> {
  // If OpenAI key is available, use it for embeddings to avoid dimension mismatch (1536 vs 768)
  // with existing data in the vector database.
  if (process.env.OPENAI_API_KEY) {
    return await openAIEmbeddings.embedQuery(text);
  }

  if (forceGemini || !process.env.OPENAI_API_KEY) {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
       throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable for Gemini embeddings");
    }
    return await getGoogleEmbeddings().embedQuery(text);
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }
  return await openAIEmbeddings.embedQuery(text);
}

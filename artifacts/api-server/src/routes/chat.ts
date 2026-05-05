import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable, agentsTable, organizationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type JwtPayload } from "../lib/auth.js";
import { z } from "zod";

const router = Router();

const COPILOT_SYSTEM_PROMPT = `Tu es "Opere Copilot", un assistant intelligent pour les entreprises.
Ton rôle est d'aider l'utilisateur à configurer et gérer ses agents IA.
Tu guides les utilisateurs dans :
- Le choix et la configuration des agents IA
- La connexion des intégrations (WhatsApp, Email)
- L'analyse des performances
- La gestion de la base de connaissances

Réponds de manière professionnelle et concise. Utilise toujours le français.`;

async function callGroqOrFallback(messages: { role: string; content: string }[], systemPrompt: string): Promise<string> {
  const GROQ_API_KEY = process.env["GROQ_API_KEY"];
  const OPENAI_API_KEY = process.env["OPENAI_API_KEY"];

  if (!GROQ_API_KEY && !OPENAI_API_KEY) {
    return "Je suis l'assistant Opere. Vos clés API IA ne sont pas encore configurées. Pour activer le Copilot, ajoutez GROQ_API_KEY ou OPENAI_API_KEY dans vos variables d'environnement.";
  }

  const apiKey = GROQ_API_KEY || OPENAI_API_KEY;
  const baseURL = GROQ_API_KEY
    ? "https://api.groq.com/openai/v1"
    : "https://api.openai.com/v1";
  const model = GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4o-mini";

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI API error ${response.status}: ${err}`);
  }

  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content || "";
}

router.post("/chat", requireAuth, async (req, res) => {
  const user = (req as any).user as JwtPayload;
  try {
    const { messages: rawMessages, conversationId: reqConvId } = z.object({
      messages: z.array(z.object({ role: z.string(), content: z.string() })),
      conversationId: z.string().optional(),
    }).parse(req.body);

    let conversationId = reqConvId;
    if (conversationId) {
      const existing = await db.select({ id: conversationsTable.id, userId: conversationsTable.userId })
        .from(conversationsTable)
        .where(and(eq(conversationsTable.id, conversationId), eq(conversationsTable.userId, user.userId)))
        .limit(1);
      if (!existing.length) conversationId = undefined;
    }
    if (!conversationId) {
      const [conv] = await db.insert(conversationsTable).values({ userId: user.userId }).returning();
      conversationId = conv.id;
    }

    const lastMsg = rawMessages[rawMessages.length - 1];
    if (lastMsg?.role === "user") {
      await db.insert(messagesTable).values({
        role: "user",
        content: lastMsg.content,
        conversationId,
      });
    }

    const aiText = await callGroqOrFallback(rawMessages, COPILOT_SYSTEM_PROMPT);

    await db.insert(messagesTable).values({
      role: "assistant",
      content: aiText,
      conversationId,
    });

    res.setHeader("x-conversation-id", conversationId);
    res.json({ text: aiText, conversationId });
  } catch (err: any) {
    console.error("Copilot chat error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/chat/history", requireAuth, async (req, res) => {
  const user = (req as any).user as JwtPayload;
  try {
    const { conversationId } = req.query;
    if (!conversationId || typeof conversationId !== "string") {
      res.json({ messages: [] });
      return;
    }

    const [conv] = await db.select({ id: conversationsTable.id, userId: conversationsTable.userId })
      .from(conversationsTable)
      .where(and(eq(conversationsTable.id, conversationId), eq(conversationsTable.userId, user.userId)))
      .limit(1);

    if (!conv) {
      res.status(403).json({ error: "Accès refusé" });
      return;
    }

    const messages = await db.select().from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(messagesTable.createdAt);
    res.json({ messages });
  } catch (err) {
    console.error("Chat history error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/chat/:agentId", requireAuth, async (req, res) => {
  const user = (req as any).user as JwtPayload;
  try {
    const { agentId } = req.params;
    const { message, conversationId: reqConvId } = z.object({
      message: z.string().min(1),
      conversationId: z.string().optional(),
    }).parse(req.body);

    const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, agentId)).limit(1);
    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }

    if (user.organizationId !== agent.organizationId) {
      res.status(403).json({ error: "Accès refusé" });
      return;
    }

    const [org] = await db.select({ credits: organizationsTable.credits })
      .from(organizationsTable).where(eq(organizationsTable.id, agent.organizationId)).limit(1);

    if (!org || org.credits <= 0) {
      res.status(403).json({ error: "Insufficient credits" });
      return;
    }

    let conversationId = reqConvId;
    if (conversationId) {
      const existing = await db.select({ id: conversationsTable.id, agentId: conversationsTable.agentId })
        .from(conversationsTable)
        .where(and(eq(conversationsTable.id, conversationId), eq(conversationsTable.agentId, agentId)))
        .limit(1);
      if (!existing.length) conversationId = undefined;
    }
    if (!conversationId) {
      const [conv] = await db.insert(conversationsTable).values({ agentId }).returning();
      conversationId = conv.id;
    }

    await db.insert(messagesTable).values({ role: "user", content: message, conversationId });

    const history = await db.select().from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(messagesTable.createdAt);

    const msgHistory = history.slice(-5).map(m => ({ role: m.role, content: m.content || "" }));

    const aiText = await callGroqOrFallback(msgHistory, agent.systemPrompt);

    await db.insert(messagesTable).values({ role: "assistant", content: aiText, conversationId });

    await db.update(organizationsTable)
      .set({ credits: org.credits - 1 })
      .where(eq(organizationsTable.id, agent.organizationId));

    res.setHeader("X-Conversation-Id", conversationId);
    res.json({ response: aiText, conversationId });
  } catch (err: any) {
    console.error("Agent chat error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

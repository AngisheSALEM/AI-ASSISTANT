import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma"; // Notez les accolades {}
import { hasEnoughCredits, deductCredits } from "@/lib/auth/check-credits";
import { similaritySearch } from "@/lib/ai/vector-store";
import { getAgentModel } from "@/lib/ai/agent-engine";
import { SystemMessage, HumanMessage, AIMessage, BaseMessage, ToolMessage } from "@langchain/core/messages";
import { inngest } from "@/lib/inngest/client";
import { getAvailableTools } from "@/lib/integrations/toolRegistry";
import { Runnable } from "@langchain/core/runnables";
import { redis } from "@/lib/redis";

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET;

function verifySignature(payload: string, signature: string) {
  if (!WHATSAPP_APP_SECRET) return true; // En dev, si pas de secret on skip
  const hash = crypto
    .createHmac("sha256", WHATSAPP_APP_SECRET)
    .update(payload)
    .digest("hex");
  return `sha256=${hash}` === signature;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode && token) {
    if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    }
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");

    if (WHATSAPP_APP_SECRET && (!signature || !verifySignature(rawBody, signature))) {
      return new Response("Invalid signature", { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // Vérifier s'il s'agit d'un message WhatsApp
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== "text") {
      return NextResponse.json({ status: "ignored" });
    }

    const from = message.from;
    const text = message.text.body;
    const phoneId = value?.metadata?.phone_number_id;

    // 1. Identification de l'organisation et de l'agent
    const organization = await prisma.organization.findFirst({
      where: { whatsappPhoneNumberId: phoneId },
    });

    if (!organization || !organization.whatsappAccessToken) {
      return NextResponse.json({ error: "Organization not configured" }, { status: 404 });
    }

    const agent = await prisma.agent.findFirst({
      where: { organizationId: organization.id, status: "ACTIVE" },
    });

    if (!agent) {
      return NextResponse.json({ error: "No agent configured" }, { status: 404 });
    }

    // 2. Gestion des Crédits
    const creditCost = 1;
    const canProceed = await hasEnoughCredits(agent.organizationId, creditCost);
    if (!canProceed) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }

    // 3. Récupération de la Mémoire Vive (Upstash Redis)
    const sessionId = `wa_session_${from}`;
    const sessionHistory: any[] = (await redis.get(sessionId)) || [];

    // 4. Recherche RAG (Mémoire Longue)
    const contextResults = await similaritySearch(text, agent.organizationId);
    const contextText = contextResults
      .map((r) => `[Source: ${r.title}]\n${r.content}`)
      .join("\n\n");

    // 5. Préparer le System Prompt Hermes
    const hermesPrompt = `Tu es un Computer Agent autonome intégré à la plateforme Opere. Ta mission est d'agir comme un employé virtuel proactif pour l'organisation.

Capacités :
1. Action (Outils) : Tu ne te contentes pas de parler. Utilise les fonctions (tools) à ta disposition.
2. Auto-Apprentissage (Skills) : Génère un Skill (JSON) via save_skill après une réussite.
3. Gestion de l'Asynchronisme : Pour les tâches longues (> 15s), informe : 'Je m'en occupe en arrière-plan'.
4. Mémoire : Consulte la KnowledgeBase pour les préférences client.

Règle d'or : Si l'outil manque, suggère de configurer le connecteur API. Sois concis et pro.

${agent.systemPrompt}

CONTEXTE RELEVANT:
${contextText || "Aucun contexte spécifique."}`;

    // 6. Récupérer les outils
    const tools = await getAvailableTools(agent.organizationId);

    // 7. Initialiser le modèle
    const model = getAgentModel(agent.temperature);
    let modelWithTools: Runnable = model;
    if (tools.length > 0) {
        // @ts-ignore
        modelWithTools = model.bindTools(tools);
    }

    const messages: BaseMessage[] = [
      new SystemMessage(hermesPrompt),
      ...sessionHistory.map(m => m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)),
      new HumanMessage(text),
    ];

    let responseText = "";

    // 8. Exécution avec Timeout (12s pour Vercel)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 12000)
    );

    try {
        const result = await Promise.race([
            (async () => {
                let currentResult = await modelWithTools.invoke(messages);
                let iterations = 0;
                while (currentResult.tool_calls && currentResult.tool_calls.length > 0 && iterations < 3) {
                    iterations++;
                    messages.push(currentResult);
                    for (const toolCall of currentResult.tool_calls) {
                        const tool = tools.find((t) => t.name === toolCall.name);
                        if (tool) {
                            const toolResult = await tool.invoke(toolCall.args);
                            messages.push(new ToolMessage({
                                tool_call_id: toolCall.id!,
                                content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
                            }));
                        }
                    }
                    currentResult = await modelWithTools.invoke(messages);
                }
                return currentResult;
            })(),
            timeoutPromise
        ]);

        responseText = (result as AIMessage).content as string;

        // Sauvegarder la session dans Redis
        sessionHistory.push({ role: 'user', content: text });
        sessionHistory.push({ role: 'assistant', content: responseText });
        await redis.set(sessionId, sessionHistory.slice(-10), { ex: 3600 }); // Garde 5 échanges, expire en 1h

        // Déduire les crédits
        await deductCredits(agent.organizationId, creditCost);

    } catch (error: any) {
        if (error.message === "Timeout") {
            console.log("Delegating long task to Inngest...");
            await inngest.send({
                name: "agent/task.requested",
                data: {
                    agentId: agent.id,
                    organizationId: agent.organizationId,
                    text,
                    from,
                    phoneId
                }
            });
            responseText = "Je m'occupe de votre demande en arrière-plan. Je vous tiens au courant dès que c'est terminé !";
        } else {
            throw error;
        }
    }

    // 9. Réponse WhatsApp Finale
    await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${organization.whatsappAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: from,
        type: "text",
        text: { body: responseText },
      }),
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

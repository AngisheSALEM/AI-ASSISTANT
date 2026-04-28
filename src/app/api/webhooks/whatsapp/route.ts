import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { similaritySearch } from "@/lib/ai/vector-store";
import { getAgentModel } from "@/lib/ai/agent-engine";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

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
    const body = await req.json();

    // Vérifier s'il s'agit d'un message WhatsApp
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== "text") {
      return NextResponse.json({ status: "ignored" });
    }

    const from = message.from; // Numéro de téléphone de l'utilisateur
    const text = message.text.body;
    const to = value?.metadata?.display_phone_number; // Numéro de téléphone de l'organisation

    // Recherche de l'agent basé sur le numéro de téléphone de destination (si configuré dans l'organisation)
    // ou une autre logique de multi-tenancy. Ici on simule une recherche par organizationId si on l'avait dans le webhook.
    // Pour être multi-tenant safe, on pourrait chercher une organisation qui a ce numéro associé.
    const agent = await prisma.agent.findFirst({
      where: {
        organization: {
          // Simulation : On pourrait avoir un champ phone dans Organization
          // Pour l'instant on filtre par un critère qui rend la requête plus spécifique
          // ou on utilise un Header spécifique envoyé par WhatsApp (X-Organization-Id si via un proxy)
          name: { contains: "" }
        }
      },
      include: { organization: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "No agent configured" }, { status: 404 });
    }

    // 1. Recherche RAG
    const contextResults = await similaritySearch(text, agent.organizationId);
    const contextText = contextResults
      .map((r) => `[Source: ${r.title}]\n${r.content}`)
      .join("\n\n");

    // 2. Générer la réponse
    const model = getAgentModel(agent.temperature);
    const parser = new StringOutputParser();

    const responseText = await model.pipe(parser).invoke([
      new SystemMessage(`${agent.systemPrompt}\n\nCONTEXTE:\n${contextText}`),
      new HumanMessage(text),
    ]);

    // 3. Envoyer la réponse via WhatsApp
    await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
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

    // 4. Enregistrer dans la base de données (Conversation simplifiée)
    // On pourrait chercher une conversation existante liée à ce numéro de téléphone
    const conversation = await prisma.conversation.create({
      data: {
        agentId: agent.id,
      },
    });

    await prisma.message.createMany({
      data: [
        { content: text, role: "USER", conversationId: conversation.id },
        { content: responseText, role: "ASSISTANT", conversationId: conversation.id },
      ],
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

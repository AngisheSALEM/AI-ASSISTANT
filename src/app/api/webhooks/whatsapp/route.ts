import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { hasEnoughCredits, deductCredits } from "@/lib/auth/check-credits";
import { similaritySearch } from "@/lib/ai/vector-store";
import { getAgentModel } from "@/lib/ai/agent-engine";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

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

    const from = message.from; // Numéro de téléphone de l'utilisateur
    const text = message.text.body;
    const phoneId = value?.metadata?.phone_number_id; // ID du numéro WhatsApp de destination

    // Recherche de l'organisation liée à ce whatsappPhoneNumberId
    const organization = await prisma.organization.findFirst({
      where: {
        whatsappPhoneNumberId: phoneId,
      },
    });

    if (!organization || !organization.whatsappAccessToken) {
      return NextResponse.json({ error: "Organization not configured for this phone number" }, { status: 404 });
    }

    // Trouver l'agent actif pour cette organisation
    // S'il y en a plusieurs, on pourrait avoir une logique plus complexe
    // Ici on prend le premier agent actif.
    const agent = await prisma.agent.findFirst({
      where: {
        organizationId: organization.id,
        status: "ACTIVE",
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "No agent configured" }, { status: 404 });
    }

    // Déterminer le coût (1 pour texte, 5 pour audio)
    const isAudio = message.type === "audio" || message.type === "voice";
    const creditCost = isAudio ? 5 : 1;

    // Check credits
    const canProceed = await hasEnoughCredits(agent.organizationId, creditCost);
    if (!canProceed) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
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

    // Déduire les crédits
    await deductCredits(agent.organizationId, creditCost);

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

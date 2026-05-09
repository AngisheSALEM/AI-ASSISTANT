import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/lib/inngest/client";

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

    // Déléguer à Inngest pour éviter le timeout Vercel
    await inngest.send({
      name: "app/agent.message.received",
      data: {
        message: text,
        organizationId: organization.id,
        phoneId: phoneId,
        from: from,
        agentId: agent.id,
        whatsappAccessToken: organization.whatsappAccessToken,
      },
    });

    return NextResponse.json({ status: "accepted" });
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

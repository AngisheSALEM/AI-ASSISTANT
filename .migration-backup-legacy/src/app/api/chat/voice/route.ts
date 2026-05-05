import { NextResponse } from "next/server";
import { transcribeAudio, synthesizeSpeech } from "@/lib/ai/voice-engine";
import { prisma } from "@/lib/prisma"; // Notez les accolades {}
import { hasEnoughCredits, deductCredits } from "@/lib/auth/check-credits";
import { similaritySearch } from "@/lib/ai/vector-store";
import { getModelForOrganization, CREDIT_COSTS } from "@/lib/ai/model-router";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const agentId = formData.get("agentId") as string;
    const conversationId = formData.get("conversationId") as string;

    if (!audioFile || !agentId) {
      return NextResponse.json({ error: "Audio and agentId are required" }, { status: 400 });
    }

    // Récupérer l'agent en premier pour vérifier les crédits
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Check credits (10 credits for voice)
    const canProceed = await hasEnoughCredits(agent.organizationId, CREDIT_COSTS.VOICE);
    if (!canProceed) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }

    // 1. Transcription
    const transcription = await transcribeAudio(audioFile);

    // 3. RAG & LLM Response (simplified for voice - no full history for now)
    const contextResults = await similaritySearch(transcription, agent.organizationId);
    const contextText = contextResults
      .map((r) => `[Source: ${r.title}]\n${r.content}`)
      .join("\n\n");

    const { model } = await getModelForOrganization(agent.organizationId, agent.temperature);
    const parser = new StringOutputParser();

    const responseText = await model.pipe(parser).invoke([
      new SystemMessage(`${agent.systemPrompt}\n\nCONTEXTE:\n${contextText}`),
      new HumanMessage(transcription),
    ]);

    // 4. Synthèse Vocale
    const audioBuffer = await synthesizeSpeech(responseText);

    // 5. Sauvegarde en DB (optionnel mais recommandé)
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const conv = await prisma.conversation.create({ data: { agentId } });
      currentConversationId = conv.id;
    }

    await prisma.message.createMany({
      data: [
        { content: transcription, role: "user", conversationId: currentConversationId },
        { content: responseText, role: "assistant", conversationId: currentConversationId },
      ],
    });

    // Déduire les crédits
    await deductCredits(agent.organizationId, CREDIT_COSTS.VOICE);

    // Retourner l'audio et la transcription
    return new Response(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "X-Transcription": encodeURIComponent(transcription),
        "X-Response-Text": encodeURIComponent(responseText),
        "X-Conversation-Id": currentConversationId,
      },
    });

  } catch (error) {
    console.error("Voice Chat Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

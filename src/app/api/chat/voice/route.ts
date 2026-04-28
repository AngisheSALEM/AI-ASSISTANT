import { NextResponse } from "next/server";
import { transcribeAudio, synthesizeSpeech } from "@/lib/ai/voice-engine";
import prisma from "@/lib/prisma";
import { similaritySearch } from "@/lib/ai/vector-store";
import { getAgentModel } from "@/lib/ai/agent-engine";
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

    // 1. Transcription
    const transcription = await transcribeAudio(audioFile);

    // 2. Récupérer l'agent
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // 3. RAG & LLM Response (simplified for voice - no full history for now)
    const contextResults = await similaritySearch(transcription, agent.organizationId);
    const contextText = contextResults
      .map((r) => `[Source: ${r.title}]\n${r.content}`)
      .join("\n\n");

    const model = getAgentModel(agent.temperature);
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
        { content: transcription, role: "USER", conversationId: currentConversationId },
        { content: responseText, role: "ASSISTANT", conversationId: currentConversationId },
      ],
    });

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

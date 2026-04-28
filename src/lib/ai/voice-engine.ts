import OpenAI from "openai";

// On initialise OpenAI à l'intérieur des fonctions ou de manière paresseuse
// pour éviter des erreurs lors du build si la variable d'environnement est absente.
let openai: OpenAI;

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Rachel default

export async function transcribeAudio(audioFile: File): Promise<string> {
  // OpenAI Whisper limit is 25MB
  const MAX_SIZE = 25 * 1024 * 1024;
  if (audioFile.size > MAX_SIZE) {
    throw new Error("Audio file is too large (max 25MB)");
  }

  try {
    const transcription = await getOpenAI().audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });
    return transcription.text;
  } catch (error: any) {
    console.error("Transcription Error:", error);
    throw new Error(`Failed to transcribe audio: ${error.message || "Unknown error"}`);
  }
}

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2", // Supporte FR, Lingala, Swahili
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

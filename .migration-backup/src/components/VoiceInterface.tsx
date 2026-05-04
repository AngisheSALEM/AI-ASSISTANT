"use client";

import { useState, useRef } from "react";
import { Mic, Square, Loader2, Volume2 } from "lucide-react";

interface VoiceInterfaceProps {
  agentId: string;
  onResponse?: (text: string) => void;
}

export default function VoiceInterface({ agentId, onResponse }: VoiceInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        await sendAudioToAPI(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Impossible d'accéder au micro.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const sendAudioToAPI = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.wav");
      formData.append("agentId", agentId);

      const response = await fetch("/api/chat/voice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("API response not ok");

      const audioBlob = await response.blob();
      const transcription = decodeURIComponent(response.headers.get("X-Transcription") || "");
      const responseText = decodeURIComponent(response.headers.get("X-Response-Text") || "");

      if (onResponse) onResponse(responseText);

      // Play the response
      const audioUrl = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Error processing voice chat:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8 bg-white rounded-2xl border border-gray-200 shadow-xl">
      <div className="relative">
        {/* Visualizer Simulation */}
        <div className={`absolute -inset-4 rounded-full opacity-20 bg-blue-500 animate-ping ${isRecording ? "block" : "hidden"}`} />
        <div className={`absolute -inset-8 rounded-full opacity-10 bg-blue-400 animate-pulse ${isPlaying ? "block" : "hidden"}`} />

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 scale-110"
              : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
          } text-white shadow-lg disabled:opacity-50`}
        >
          {isProcessing ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : isRecording ? (
            <Square className="w-10 h-10" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
      </div>

      <div className="text-center space-y-2">
        <h3 className="font-semibold text-lg text-gray-900">
          {isRecording ? "L'agent vous écoute..." : isProcessing ? "L'agent réfléchit..." : isPlaying ? "L'agent parle..." : "Appuyez pour parler"}
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Posez vos questions à haute voix, l'IA vous répondra vocalement.
        </p>
      </div>

      {isPlaying && (
        <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full animate-bounce">
          <Volume2 size={18} />
          <span className="text-xs font-medium">Lecture en cours</span>
        </div>
      )}

      <audio
        ref={audioRef}
        className="hidden"
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}

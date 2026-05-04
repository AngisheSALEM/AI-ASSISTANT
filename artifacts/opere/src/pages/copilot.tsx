import { useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Settings, Send, Headphones, TrendingUp, MessageSquare, Bot, Stethoscope, Building2, User
} from "lucide-react";

const STEPS = [
  { id: "choice", label: "Choix Agent" },
  { id: "config", label: "Configuration" },
  { id: "connection", label: "Connexion" },
  { id: "ready", label: "Prêt" },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function ConversationProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2 px-6 pb-4 overflow-x-auto">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2 shrink-0">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
            i <= currentStep ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-white/5 text-white/20 border border-white/5"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${i <= currentStep ? "bg-cyan-400" : "bg-white/20"}`} />
            {step.label}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px w-8 ${i < currentStep ? "bg-cyan-500/50" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Bien sûr ! Je vais vous aider à configurer votre agent IA. Pour commencer, quel type d'agent souhaitez-vous déployer ? Support client, secrétaire médical, ou commercial immobilier ?"
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1200);
  };

  const getCurrentStep = () => {
    if (messages.length > 6) return 3;
    if (messages.length > 4) return 2;
    if (messages.length > 2) return 1;
    return 0;
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white">
      <header className="flex flex-col border-b border-white/10 backdrop-blur-md bg-black/20 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-xl">
              <Zap className="h-5 w-5 text-cyan-400" />
            </div>
            <h1 className="font-bold tracking-tight">Opere Copilot</h1>
          </div>
          <Link href="/demo-org">
            <button className="relative group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-sm font-medium overflow-hidden">
              <Settings className="h-4 w-4 relative z-10" />
              <span className="relative z-10">Ouvrir le Centre de Contrôle</span>
            </button>
          </Link>
        </div>
        <ConversationProgress currentStep={getCurrentStep()} />
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
              <div className="p-4 bg-white/5 rounded-full border border-white/10 mb-4">
                <Bot className="h-12 w-12 text-white/20" />
              </div>
              <h2 className="text-2xl font-bold font-fraunces">Comment puis-je vous aider ?</h2>
              <p className="text-white/40 max-w-md">
                Je peux vous aider à configurer vos agents, analyser vos performances ou connecter vos outils.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 w-full max-w-lg">
                {[
                  "Configurer un agent Support Client",
                  "Analyser mes performances",
                  "Connecter WhatsApp"
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(s)}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 hover:text-white transition-all text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} mb-6`}
              >
                <div className={`flex gap-4 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                    m.role === "user" ? "bg-white border-white" : "bg-white/10 border-white/10"
                  }`}>
                    {m.role === "user" ? <MessageSquare className="h-4 w-4 text-black" /> : <Bot className="h-4 w-4 text-white" />}
                  </div>
                  <div className={`p-4 rounded-2xl ${
                    m.role === "user"
                      ? "bg-white text-black rounded-tr-none"
                      : "bg-white/5 border border-white/10 text-white rounded-tl-none"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-6">
                <div className="flex gap-4">
                  <div className="mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border bg-white/10 border-white/10">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white rounded-tl-none">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez une question ou demandez une action..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-16 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-2xl"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white text-black rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        <p className="text-center text-[10px] text-white/20 mt-4 uppercase tracking-[0.2em] font-bold">
          Propulsé par Opere IA Intelligence
        </p>
      </div>
    </div>
  );
}

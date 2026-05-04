"use client";

import { useChat, type Message } from "ai/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Settings,
  Send,
  Headphones,
  TrendingUp,
  MessageSquare,
  Bot,
  Stethoscope,
  Building2,
  User
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Headphones,
  TrendingUp,
  Stethoscope,
  Building2,
  User
};
import { useRef, useEffect, useState } from "react";
import { AgentSelectionCard } from "@/components/copilot/ui/AgentSelectionCard";
import { WhatsAppSetupInput } from "@/components/copilot/ui/WhatsAppSetupInput";
import { InsightReportCard } from "@/components/copilot/ui/InsightReportCard";
import { ConversationProgress } from "@/components/copilot/ui/ConversationProgress";
import { CopilotSkeleton } from "@/components/copilot/ui/CopilotSkeleton";
import { ToolInvocation } from "ai";

const STEPS = [
  { id: "choice", label: "Choix Agent" },
  { id: "config", label: "Configuration" },
  { id: "connection", label: "Connexion" },
  { id: "ready", label: "Prêt" },
];

interface UIMessage extends Message {
  uiType?: string;
  uiData?: any;
}

export default function CopilotPage() {
  const { data: session } = useSession();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { messages, input, handleInputChange, handleSubmit, append, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: { conversationId },
    onResponse: (response) => {
      const id = response.headers.get('x-conversation-id');
      if (id && !conversationId) {
        setConversationId(id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('copilot_conversation_id', id);
        }
      }
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('copilot_conversation_id');
      if (savedId) {
        setConversationId(savedId);
        fetch(`/api/chat/history?conversationId=${savedId}`)
          .then(res => res.json())
          .then(data => {
          if (data && data.messages) {
            setMessages(data.messages);
          }
        })
        .catch(err => {
          console.error("Failed to load history", err);
        })
        .finally(() => {
          setIsInitialLoad(false);
        });
      } else {
        setIsInitialLoad(false);
      }
    }
  }, [setMessages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const getCurrentStep = () => {
    if (messages.some(m => m.content?.includes("WhatsApp Connecté") || (m as UIMessage).uiType === "WHATSAPP_INPUT" && (m as UIMessage).uiData?.status === "success")) return 3;
    if (messages.some(m => (m as UIMessage).uiType === "WHATSAPP_INPUT")) return 2;
    if (messages.some(m => (m as UIMessage).uiType === "AGENT_SELECTION")) return 1;
    return 0;
  };

  const renderToolInvocation = (toolInvocation: ToolInvocation | { state: 'result', toolName?: string }, message: UIMessage) => {
    const toolCallId = 'toolCallId' in toolInvocation ? toolInvocation.toolCallId : `saved-${message.id}`;
    const toolName = 'toolName' in toolInvocation ? toolInvocation.toolName : message.uiType;
    const isResult = toolInvocation.state === 'result' || !!message.uiData;
    const resultData = ('result' in toolInvocation ? toolInvocation.result : null) || message.uiData;

    if (toolName === 'request_agent_selection' || toolName === 'AGENT_SELECTION') {
      const msgIndex = messages.indexOf(message);
      const selectedType = msgIndex !== -1
        ? messages.find((m, i) => i > msgIndex && m.role === 'user')?.content
        : undefined;

      const templates = resultData?.templates || [];

      if (templates.length > 0) {
        return (
          <div key={toolCallId} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl my-4">
            {templates.map((t: any) => {
              const Icon = (t.icon && ICON_MAP[t.icon]) ? ICON_MAP[t.icon] : ICON_MAP.User;
              return (
                <AgentSelectionCard
                  key={t.id}
                  title={t.name}
                  description={t.description}
                  icon={Icon}
                  selected={selectedType?.toLowerCase().includes(t.name.toLowerCase())}
                  onSelect={() => append({ role: 'user', content: `Je choisis l'agent ${t.name}` })}
                />
              );
            })}
          </div>
        );
      }

      // Fallback if no templates in result
      return (
        <div key={toolCallId} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl my-4">
          <AgentSelectionCard
            title="Support Client"
            description="Idéal pour répondre aux questions fréquentes et résoudre les problèmes."
            icon={Headphones}
            selected={selectedType?.includes("Support")}
            onSelect={() => append({ role: 'user', content: 'Je choisis l\'agent Support Client' })}
          />
          <AgentSelectionCard
            title="Ventes"
            description="Optimisé pour la conversion et la présentation de produits."
            icon={TrendingUp}
            selected={selectedType?.includes("Ventes")}
            onSelect={() => append({ role: 'user', content: 'Je choisis l\'agent Ventes' })}
          />
        </div>
      );
    }

    if (toolName === 'request_whatsapp_credentials' || toolName === 'WHATSAPP_INPUT') {
      return (
        <div key={toolCallId} className="my-4 w-full">
          <WhatsAppSetupInput
            result={isResult ? resultData : undefined}
            onEdit={() => append({ role: 'user', content: 'Je souhaite modifier mes identifiants WhatsApp' })}
            onSubmit={(data) => {
              append({
                role: 'user',
                content: `Voici mes identifiants WhatsApp : Phone ID ${data.phoneId}`
              });
            }}
          />
        </div>
      );
    }

    if (toolName === 'show_insight_report' || toolName === 'INSIGHT_REPORT') {
      const data = resultData || ('args' in toolInvocation ? toolInvocation.args : {});
      return (
        <div key={toolCallId} className="my-4 w-full">
          <InsightReportCard
            interactions={data.interactions}
            resolutionRate={data.resolutionRate}
            activeUsers={data.activeUsers}
            date={data.date}
          />
        </div>
      );
    }

    return null;
  };

  const orgId = (session?.user as any)?.organizationId;

  if (isInitialLoad) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050505] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="flex flex-col border-b border-white/10 backdrop-blur-md bg-black/20 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-xl">
              <Zap className="h-5 w-5 text-cyan-400" />
            </div>
            <h1 className="font-bold tracking-tight">Opere Copilot</h1>
          </div>

          <Link href={orgId ? `/${orgId}` : "#"}>
            <button className="relative group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-sm font-medium overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <Settings className="h-4 w-4 relative z-10" />
              <span className="relative z-10">Ouvrir le Centre de Contrôle</span>
            </button>
          </Link>
        </div>

        <ConversationProgress currentStep={getCurrentStep()} steps={STEPS} />
      </header>

      {/* Chat Area */}
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
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
              >
                <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                    m.role === 'user' ? 'bg-white border-white' : 'bg-white/10 border-white/10'
                  }`}>
                    {m.role === 'user' ? (
                      <MessageSquare className="h-4 w-4 text-black" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    {m.content && (
                      <div className={`p-4 rounded-2xl ${
                        m.role === 'user'
                        ? 'bg-white text-black rounded-tr-none'
                        : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
                      </div>
                    )}

                    {m.toolInvocations?.map((toolInvocation) => renderToolInvocation(toolInvocation, m as UIMessage))}

                    {/* Render saved UI components from persistence */}
                    {(m as UIMessage).uiType && !m.toolInvocations && renderToolInvocation({ state: 'result' }, m as UIMessage)}
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start mb-6"
              >
                <CopilotSkeleton />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Posez une question ou demandez une action..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-16 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-2xl"
          />
          <button
            type="submit"
            disabled={!input?.trim() || isLoading}
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

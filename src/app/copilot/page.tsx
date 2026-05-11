"use client";

import { type Message } from "ai";
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
  User,
  Sparkles,
  Key,
  ChevronDown,
  Check,
  X
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
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";

const STEPS = [
  { id: "choice", label: "Choix Agent" },
  { id: "config", label: "Configuration" },
  { id: "connection", label: "Connexion" },
  { id: "ready", label: "Pret" },
];

const AI_PROVIDERS = [
  { id: "gemini", name: "Gemini", description: "Google AI - Gratuit", free: true },
  { id: "groq", name: "Groq", description: "Llama 3.3 - Rapide", free: false },
  { id: "openai", name: "OpenAI", description: "GPT-4 - Premium", free: false },
];

interface UIMessage extends Message {
  uiType?: string;
  uiData?: any;
}

export default function CopilotPage() {
  const { data: session } = useSession();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const append = async (message: Message | { role: string; content: string }) => {
    const userMessage: UIMessage = {
      id: Date.now().toString(),
      role: message.role as any,
      content: message.content,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          conversationId,
          provider: selectedProvider
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();

      const id = response.headers.get('x-conversation-id');
      if (id && !conversationId) {
        setConversationId(id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('copilot_conversation_id', id);
        }
      }

      const assistantMessage: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || "",
        uiType: data.uiType,
        uiData: data.uiData,
        toolInvocations: data.toolResults?.map((tr: any) => ({
          state: 'result',
          toolCallId: tr.toolCallId,
          toolName: tr.toolName,
          args: tr.args,
          result: tr.result
        }))
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const content = input;
    setInput("");
    append({ role: 'user', content });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load saved provider preference
      const savedProvider = localStorage.getItem('copilot_ai_provider');
      if (savedProvider) setSelectedProvider(savedProvider);
      
      // Check which API keys are configured
      const keys: Record<string, boolean> = {};
      ['gemini', 'groq', 'openai'].forEach(p => {
        keys[p] = !!localStorage.getItem(`copilot_${p}_configured`);
      });
      setSavedKeys(keys);

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

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem(`copilot_${selectedProvider}_key`, apiKey);
      localStorage.setItem(`copilot_${selectedProvider}_configured`, 'true');
      localStorage.setItem('copilot_ai_provider', selectedProvider);
      setSavedKeys(prev => ({ ...prev, [selectedProvider]: true }));
      setApiKey("");
      setShowApiConfig(false);
    }
  };

  const handleSelectProvider = (providerId: string) => {
    setSelectedProvider(providerId);
    localStorage.setItem('copilot_ai_provider', providerId);
  };

  const getCurrentStep = () => {
    if (messages.some(m => m.content?.includes("WhatsApp Connecte") || (m as UIMessage).uiType === "WHATSAPP_INPUT" && (m as UIMessage).uiData?.status === "success")) return 3;
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
          <div key={toolCallId} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl my-4">
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

      return (
        <div key={toolCallId} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl my-4">
          <AgentSelectionCard
            title="Support Client"
            description="Ideal pour repondre aux questions frequentes et resoudre les problemes."
            icon={Headphones}
            selected={selectedType?.includes("Support")}
            onSelect={() => append({ role: 'user', content: 'Je choisis l\'agent Support Client' })}
          />
          <AgentSelectionCard
            title="Ventes"
            description="Optimise pour la conversion et la presentation de produits."
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
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-foreground/20 border-t-cyan-500" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex flex-col border-b border-border backdrop-blur-md bg-background/80 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-cyan-500/10 rounded-lg sm:rounded-xl border border-cyan-500/20">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight">Opere Copilot</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Assistant IA Intelligent</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Provider Selector */}
            <div className="relative">
              <button 
                onClick={() => setShowApiConfig(!showApiConfig)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-foreground/5 hover:bg-foreground/10 border border-border rounded-lg sm:rounded-full transition-all text-xs sm:text-sm font-medium"
              >
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-500" />
                <span className="hidden sm:inline">{AI_PROVIDERS.find(p => p.id === selectedProvider)?.name}</span>
                <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${showApiConfig ? 'rotate-180' : ''}`} />
              </button>
              
              {/* API Config Dropdown */}
              <AnimatePresence>
                {showApiConfig && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-72 sm:w-80 p-4 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-sm">Configuration IA</h3>
                      <button onClick={() => setShowApiConfig(false)} className="p-1 hover:bg-foreground/10 rounded-lg">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {AI_PROVIDERS.map(provider => (
                        <button
                          key={provider.id}
                          onClick={() => handleSelectProvider(provider.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                            selectedProvider === provider.id 
                              ? 'border-cyan-500/50 bg-cyan-500/5' 
                              : 'border-border hover:border-foreground/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              savedKeys[provider.id] ? 'bg-emerald-500' : provider.free ? 'bg-cyan-500' : 'bg-muted-foreground'
                            }`} />
                            <div className="text-left">
                              <p className="font-medium text-sm">{provider.name}</p>
                              <p className="text-xs text-muted-foreground">{provider.description}</p>
                            </div>
                          </div>
                          {selectedProvider === provider.id && (
                            <Check className="h-4 w-4 text-cyan-500" />
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {!AI_PROVIDERS.find(p => p.id === selectedProvider)?.free && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Cle API (optionnelle)</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            className="flex-1 px-3 py-2 bg-foreground/5 border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50"
                          />
                          <button
                            onClick={handleSaveApiKey}
                            disabled={!apiKey.trim()}
                            className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-foreground/90 transition-all"
                          >
                            Sauver
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-[10px] text-muted-foreground mt-4 text-center">
                      Gemini est gratuit et pre-configure pour tester
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href={orgId ? `/${orgId}` : "#"}>
              <button className="relative group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-foreground/5 hover:bg-foreground/10 border border-border rounded-lg sm:rounded-full transition-all text-xs sm:text-sm font-medium overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 relative z-10" />
                <span className="relative z-10 hidden sm:inline">Centre de Controle</span>
              </button>
            </Link>
          </div>
        </div>

        <ConversationProgress currentStep={getCurrentStep()} steps={STEPS} />
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:py-8 space-y-4 sm:space-y-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 px-4">
              <div className="p-4 bg-foreground/5 rounded-2xl border border-border mb-2 sm:mb-4">
                <Bot className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Comment puis-je vous aider ?</h2>
              <p className="text-muted-foreground max-w-md text-sm sm:text-base">
                Je peux vous aider a configurer vos agents, analyser vos performances ou connecter vos outils.
              </p>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 sm:mt-6 w-full max-w-lg">
                {[
                  { icon: Headphones, text: "Configurer un agent support", action: "Je veux configurer un agent de support client" },
                  { icon: TrendingUp, text: "Creer un agent de vente", action: "Je veux creer un agent commercial" },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => append({ role: 'user', content: item.action })}
                    className="flex items-center gap-3 p-3 sm:p-4 bg-foreground/5 hover:bg-foreground/10 border border-border rounded-xl transition-all text-left group"
                  >
                    <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-500" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium">{item.text}</span>
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
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 sm:mb-6`}
              >
                <div className={`flex gap-2 sm:gap-4 max-w-[90%] sm:max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`mt-1 h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shrink-0 border ${
                    m.role === 'user' 
                      ? 'bg-foreground border-foreground' 
                      : 'bg-foreground/5 dark:bg-white/10 border-border'
                  }`}>
                    {m.role === 'user' ? (
                      <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-background" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    {m.content && (
                      <div className={`p-3 sm:p-4 rounded-2xl ${
                        m.role === 'user'
                        ? 'bg-foreground text-background rounded-tr-md'
                        : 'bg-foreground/5 dark:bg-white/5 border border-border rounded-tl-md'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
                      </div>
                    )}

                    {m.toolInvocations?.map((toolInvocation) => renderToolInvocation(toolInvocation, m as UIMessage))}

                    {(m as UIMessage).uiType && !m.toolInvocations && renderToolInvocation({ state: 'result' }, m as UIMessage)}
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start mb-4 sm:mb-6"
              >
                <CopilotSkeleton />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 border-t border-border bg-background/80 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Posez une question ou demandez une action..."
            className="w-full bg-foreground/5 border border-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 pr-14 sm:pr-16 text-sm sm:text-base placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={!input?.trim() || isLoading}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-foreground text-background rounded-lg sm:rounded-xl hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </form>
        <p className="text-center text-[9px] sm:text-[10px] text-muted-foreground mt-3 sm:mt-4 uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium">
          Propulse par Opere IA Intelligence
        </p>
      </div>
    </div>
  );
}

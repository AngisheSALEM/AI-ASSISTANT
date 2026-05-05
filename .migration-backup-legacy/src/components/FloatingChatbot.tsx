"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! Je suis l'assistant d'Opere. Comment puis-je vous aider à configurer votre entreprise ?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "C'est une excellente question ! Une fois que vous aurez créé votre organisation, vous pourrez choisir parmi une douzaine d'agents spécialisés dans notre marketplace."
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[380px] h-[500px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-gray-900 dark:bg-white/5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-xl">
                  <Bot size={20} />
                </div>
                <div>
                   <p className="font-bold text-sm">Agentia Support</p>
                   <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">En ligne</span>
                   </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                 <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-black/20">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white dark:bg-white/5 dark:text-white border border-gray-100 dark:border-white/5 rounded-tl-none shadow-sm"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-white/10">
               <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg">
                    <Send size={16} />
                  </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500",
          isOpen ? "bg-gray-900 dark:bg-white text-white dark:text-black" : "bg-blue-600 text-white"
        )}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-zinc-900">
            1
          </div>
        )}
      </motion.button>
    </div>
  );
}

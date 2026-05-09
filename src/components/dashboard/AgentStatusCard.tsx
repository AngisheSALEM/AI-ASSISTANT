"use client";

import { cn } from "@/lib/utils";
import { Bot, Zap, MessageSquare } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Agent {
  id: string;
  name: string;
  role: string;
  status: "ACTIVE" | "SUSPENDED";
  template?: {
    icon?: string | null;
  } | null;
  _count: {
    conversations: number;
  };
}

interface AgentStatusCardProps {
  agent: Agent;
  orgId: string;
}

export function AgentStatusCard({ agent, orgId }: AgentStatusCardProps) {
  const isActive = agent.status === "ACTIVE";

  return (
    <Link href={`/${orgId}/agents?selected=${agent.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative overflow-hidden rounded-xl p-4 transition-all duration-300 cursor-pointer group",
          "bg-black/[0.02] dark:bg-white/[0.02]",
          "border border-transparent",
          "hover:bg-black/[0.04] dark:hover:bg-white/[0.04]",
          "hover:border-cyan-500/20 dark:hover:border-cyan-500/30"
        )}
      >
        {/* Status Indicator Line */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all",
            isActive 
              ? "bg-gradient-to-b from-emerald-400 to-cyan-500" 
              : "bg-gray-300 dark:bg-gray-700"
          )}
        />

        <div className="flex items-start gap-3 pl-2">
          {/* Agent Icon */}
          <div
            className={cn(
              "p-2.5 rounded-xl transition-all group-hover:scale-110",
              isActive
                ? "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20"
                : "bg-gray-100 dark:bg-gray-800"
            )}
          >
            {agent.template?.icon ? (
              <span className="text-xl">{agent.template.icon}</span>
            ) : (
              <Bot
                size={20}
                className={cn(
                  isActive ? "text-cyan-500" : "text-gray-400"
                )}
              />
            )}
          </div>

          {/* Agent Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-bold text-text-primary dark:text-white truncate">
                {agent.name}
              </h4>
              {isActive && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap size={12} className="text-cyan-500" fill="currentColor" />
                </motion.div>
              )}
            </div>
            <p className="text-xs text-text-secondary dark:text-white/50 truncate mb-2">
              {agent.role}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[10px] text-text-secondary dark:text-white/40">
                <MessageSquare size={10} />
                <span>{agent._count.conversations} conv.</span>
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                )}
              >
                {isActive ? "Actif" : "Suspendu"}
              </span>
            </div>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-xl" />
        </div>
      </motion.div>
    </Link>
  );
}

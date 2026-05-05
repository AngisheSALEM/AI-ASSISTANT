"use client";

import React from "react";
import { motion } from "framer-motion";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { type LucideIcon, CheckCircle2, Edit2 } from "lucide-react";

interface AgentSelectionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onSelect: () => void;
  selected?: boolean;
  onEdit?: () => void;
}

export function AgentSelectionCard({
  title,
  description,
  icon: Icon,
  onSelect,
  selected,
  onEdit
}: AgentSelectionCardProps) {
  return (
    <motion.div
      whileHover={selected ? {} : { scale: 1.02 }}
      whileTap={selected ? {} : { scale: 0.98 }}
      onClick={selected ? undefined : onSelect}
      className={`${selected ? "cursor-default" : "cursor-pointer"} relative group`}
    >
      {selected && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-30 animate-pulse"></div>
      )}
      <PremiumGlassCard
        className={`p-6 border-2 transition-all relative ${
          selected ? "border-cyan-500 bg-cyan-500/5" : "border-white/10 hover:border-white/20"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl transition-colors ${selected ? "bg-cyan-500/20" : "bg-white/10"}`}>
            <Icon className={`h-6 w-6 ${selected ? "text-cyan-400" : "text-white"}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
              {selected && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-white"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-white/50">{description}</p>
          </div>
        </div>
      </PremiumGlassCard>
    </motion.div>
  );
}

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
        className={`p-4 sm:p-6 border-2 transition-all relative ${
          selected ? "border-cyan-500 bg-cyan-500/5" : "border-border hover:border-foreground/20"
        }`}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-colors ${selected ? "bg-cyan-500/20" : "bg-foreground/5"}`}>
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${selected ? "text-cyan-500" : "text-foreground"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h5 className="text-foreground mb-1 truncate">{title}</h5>
              {selected && (
                <div className="flex items-center gap-2 shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                      className="p-1 hover:bg-foreground/10 rounded transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
        </div>
      </PremiumGlassCard>
    </motion.div>
  );
}

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CreditGaugeProps {
  value: number;
  max: number;
  className?: string;
}

export function CreditGauge({ value, max, className }: CreditGaugeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const isLow = percentage < 10;

  return (
    <div
      className={cn("w-full space-y-2 relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-end">
        <span className="text-xs font-medium text-white/50 uppercase tracking-widest">Crédits</span>
        <span className="text-sm font-bold text-white">{value} / {max}</span>
      </div>

      <div className="relative h-2 w-full bg-white/10 rounded-full overflow-visible">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-cyan-400 to-white relative",
            isLow && "animate-pulse-glow"
          )}
        />

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: -40, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            >
              <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 whitespace-nowrap shadow-2xl">
                <p className="text-[10px] text-white/70 uppercase tracking-wider font-medium mb-1">Capacité restante</p>
                <div className="flex gap-4 items-center">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-cyan-400">~{value * 100}</span>
                    <span className="text-[8px] text-white/40 uppercase">mots</span>
                  </div>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">~{Math.floor(value / 10)}</span>
                    <span className="text-[8px] text-white/40 uppercase">min audio</span>
                  </div>
                </div>
                {/* Petit triangle indicateur */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-r border-b border-white/10 rotate-45" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isLow && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] text-cyan-400 font-bold uppercase tracking-tighter"
        >
          Crédits faibles - Rechargez bientôt
        </motion.p>
      )}
    </div>
  );
}

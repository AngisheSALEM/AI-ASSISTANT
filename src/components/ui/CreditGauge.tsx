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
  const isLow = percentage < 15;

  return (
    <div
      className={cn("w-full space-y-2 relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold text-text-secondary dark:text-white/40 uppercase tracking-widest">
          Credits
        </span>
        <span className="text-sm font-bold text-text-primary dark:text-white">
          {value} / {max}
        </span>
      </div>

      <div className="relative h-2 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-visible">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full relative",
            isLow
              ? "bg-gradient-to-r from-amber-400 to-orange-500"
              : "bg-gradient-to-r from-cyan-400 to-blue-500"
          )}
        >
          {/* Glow effect */}
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-sm opacity-50",
              isLow
                ? "bg-gradient-to-r from-amber-400 to-orange-500"
                : "bg-gradient-to-r from-cyan-400 to-blue-500"
            )}
          />
        </motion.div>

        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: -45, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            >
              <div className="bg-zinc-900 dark:bg-white backdrop-blur-xl border border-white/10 dark:border-black/10 rounded-xl px-3 py-2 whitespace-nowrap shadow-2xl">
                <p className="text-[9px] text-white/60 dark:text-black/60 uppercase tracking-wider font-bold mb-1">
                  Capacite restante
                </p>
                <div className="flex gap-3 items-center">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-cyan-400 dark:text-cyan-600">
                      ~{value * 100}
                    </span>
                    <span className="text-[8px] text-white/40 dark:text-black/40 uppercase">
                      mots
                    </span>
                  </div>
                  <div className="w-px h-4 bg-white/10 dark:bg-black/10" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white dark:text-black">
                      ~{Math.floor(value / 10)}
                    </span>
                    <span className="text-[8px] text-white/40 dark:text-black/40 uppercase">
                      min audio
                    </span>
                  </div>
                </div>
                {/* Triangle */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 dark:bg-white border-r border-b border-white/10 dark:border-black/10 rotate-45" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isLow && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] text-amber-500 font-bold uppercase tracking-tight"
        >
          Credits faibles - Rechargez bientot
        </motion.p>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
}

interface ConversationProgressProps {
  currentStep: number;
  steps: Step[];
}

export function ConversationProgress({ currentStep, steps }: ConversationProgressProps) {
  return (
    <div className="w-full px-4 sm:px-6 py-2 bg-foreground/[0.02] dark:bg-black/40 border-b border-border backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border -translate-y-1/2 z-0" />
        <motion.div
          className="absolute top-1/2 left-0 h-[1px] bg-cyan-500 -translate-y-1/2 z-0"
          initial={{ width: "0%" }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted || isActive ? "#06b6d4" : "var(--background)",
                  scale: isActive ? 1.2 : 1,
                }}
                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center border-2 ${
                  isCompleted || isActive ? "border-cyan-500" : "border-border"
                }`}
              >
                {isCompleted && <Check className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-white" />}
              </motion.div>
              <span className={`absolute top-5 sm:top-6 text-[8px] sm:text-[10px] font-bold uppercase tracking-tight sm:tracking-tighter whitespace-nowrap transition-colors ${
                isActive ? "text-cyan-500" : "text-muted-foreground"
              }`}>
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{index + 1}</span>
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-5 sm:h-6" />
    </div>
  );
}

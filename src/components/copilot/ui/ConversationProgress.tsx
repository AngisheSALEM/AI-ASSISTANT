"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
}

interface ConversationProgressProps {
  currentStep: number; // 0 to 3
  steps: Step[];
}

export function ConversationProgress({ currentStep, steps }: ConversationProgressProps) {
  return (
    <div className="w-full px-6 py-2 bg-black/40 border-b border-white/5 backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 z-0" />
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
                  backgroundColor: isCompleted || isActive ? "#06b6d4" : "#1f2937",
                  scale: isActive ? 1.2 : 1,
                }}
                className={`w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                  isCompleted || isActive ? "border-cyan-500" : "border-gray-700"
                }`}
              >
                {isCompleted && <Check className="h-2.5 w-2.5 text-white" />}
              </motion.div>
              <span className={`absolute top-6 text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap transition-colors ${
                isActive ? "text-cyan-400" : "text-white/20"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-6" /> {/* Spacer for labels */}
    </div>
  );
}

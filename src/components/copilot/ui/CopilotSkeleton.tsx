"use client";

import React from "react";
import { motion } from "framer-motion";

export function CopilotSkeleton() {
  return (
    <div className="flex gap-4 w-full max-w-[85%]">
      <div className="mt-1 h-8 w-8 rounded-full bg-white/10 shrink-0 animate-pulse" />
      <div className="space-y-3 w-full">
        <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse" />
        <div className="h-4 bg-white/10 rounded-full w-1/2 animate-pulse" />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="h-32 bg-white/5 rounded-2xl animate-pulse border border-white/10" />
          <div className="h-32 bg-white/5 rounded-2xl animate-pulse border border-white/10" />
        </div>
      </div>
    </div>
  );
}

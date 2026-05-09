"use client";

import React from "react";

export function CopilotSkeleton() {
  return (
    <div className="flex gap-2 sm:gap-4 w-full max-w-[90%] sm:max-w-[85%]">
      <div className="mt-1 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-foreground/10 shrink-0 animate-pulse" />
      <div className="space-y-2 sm:space-y-3 w-full">
        <div className="h-3 sm:h-4 bg-foreground/10 rounded-full w-3/4 animate-pulse" />
        <div className="h-3 sm:h-4 bg-foreground/10 rounded-full w-1/2 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
          <div className="h-24 sm:h-32 bg-foreground/5 rounded-xl sm:rounded-2xl animate-pulse border border-border" />
          <div className="h-24 sm:h-32 bg-foreground/5 rounded-xl sm:rounded-2xl animate-pulse border border-border hidden sm:block" />
        </div>
      </div>
    </div>
  );
}

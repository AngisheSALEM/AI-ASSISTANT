"use client";

import React from "react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { BarChart3, TrendingUp, Users, CheckCircle2 } from "lucide-react";

interface InsightReportCardProps {
  interactions: number;
  resolutionRate: number;
  activeUsers: number;
  date: string;
}

export function InsightReportCard({
  interactions,
  resolutionRate,
  activeUsers,
  date,
}: InsightReportCardProps) {
  return (
    <PremiumGlassCard className="p-4 sm:p-6 max-w-md w-full">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <BarChart3 className="h-5 w-5 text-cyan-500" />
          </div>
          <h5 className="text-foreground">{"Rapport d'activite"}</h5>
        </div>
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {date}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 bg-foreground/5 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight">Interactions</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{interactions}</p>
        </div>

        <div className="p-3 sm:p-4 bg-foreground/5 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight">Resolution</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{resolutionRate}%</p>
        </div>

        <div className="p-3 sm:p-4 bg-foreground/5 rounded-xl border border-border col-span-2">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight">Utilisateurs Actifs</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{activeUsers}</p>
        </div>
      </div>
    </PremiumGlassCard>
  );
}

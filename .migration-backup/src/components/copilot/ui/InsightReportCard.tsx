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
    <PremiumGlassCard className="p-6 max-w-md w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
          </div>
          <h3 className="font-bold text-white">Rapport d'activité</h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
          {date}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-white/40">
            <TrendingUp className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Interactions</span>
          </div>
          <p className="text-2xl font-bold text-white">{interactions}</p>
        </div>

        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-white/40">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Résolution</span>
          </div>
          <p className="text-2xl font-bold text-white">{resolutionRate}%</p>
        </div>

        <div className="p-4 bg-white/5 rounded-xl border border-white/5 col-span-2">
          <div className="flex items-center gap-2 mb-2 text-white/40">
            <Users className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Utilisateurs Actifs</span>
          </div>
          <p className="text-2xl font-bold text-white">{activeUsers}</p>
        </div>
      </div>
    </PremiumGlassCard>
  );
}

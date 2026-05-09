"use client";

import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";

// Simulated live feed data - In production, this would come from real-time subscriptions
const liveFeedData = [
  { action: "RDV pris", user: "Jean Dupont", agent: "Alpha", time: "2 min", type: "success" },
  { action: "Message gere", user: "Marie Kone", agent: "SAV", time: "5 min", type: "info" },
  { action: "Document appris", user: "Guide_Tarif.pdf", agent: "System", time: "12 min", type: "system" },
  { action: "Nouveau lead", user: "Pierre Martin", agent: "Sales", time: "18 min", type: "success" },
];

interface LiveFeedProps {
  orgId: string;
}

export function LiveFeed({ orgId }: LiveFeedProps) {
  return (
    <GlassCard className="lg:col-span-2 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary dark:text-white">
          Flux Live
        </h3>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
            En direct
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {liveFeedData.map((log, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors group"
          >
            {/* Status Dot */}
            <div className="pt-1">
              <span
                className={`block w-2 h-2 rounded-full ${
                  log.type === "success"
                    ? "bg-emerald-500"
                    : log.type === "info"
                    ? "bg-cyan-500"
                    : "bg-blue-500"
                }`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary dark:text-white/90">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">
                  {log.agent}
                </span>
                {" : "}
                {log.action} pour{" "}
                <span className="font-medium">{log.user}</span>
              </p>
              <p className="text-[10px] text-text-secondary dark:text-white/40 mt-0.5">
                Il y a {log.time}
              </p>
            </div>

            {/* Time Badge */}
            <span className="text-[10px] px-2 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.05] text-text-secondary dark:text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
              {log.time}
            </span>
          </motion.div>
        ))}
      </div>

      {/* See More Link */}
      <div className="mt-4 pt-4 border-t border-black/[0.05] dark:border-white/[0.05] text-center">
        <span className="text-xs text-text-secondary dark:text-white/40">
          Affichage des 4 dernieres activites
        </span>
      </div>
    </GlassCard>
  );
}

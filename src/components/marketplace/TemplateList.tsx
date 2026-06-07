"use client";

import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import { RentButton } from "./rent-button";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { AgentTemplate } from "@/lib/types";

// Composant d'avatar premium généré dynamiquement selon la catégorie
const AgentAvatar = ({ id, category, name }: { id: string; category: string; name: string }) => {
  const cat = (category || "").toLowerCase();
  const gradientId = `grad-${id}`;
  let primaryColor = "#6366F1"; // Indigo par défaut
  let secondaryColor = "#4F46E5";
  let pattern = null;

  if (cat.includes("support")) {
    primaryColor = "#06B6D4"; // Cyan
    secondaryColor = "#0891B2";
    pattern = (
      <>
        <circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-20 animate-pulse" />
        <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" className="opacity-30" />
        <path d="M28,40 Q40,28 52,40" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60" />
      </>
    );
  } else if (cat.includes("marketing")) {
    primaryColor = "#F59E0B"; // Amber
    secondaryColor = "#D97706";
    pattern = (
      <>
        <line x1="25" y1="55" x2="35" y2="40" stroke="currentColor" strokeWidth="2" className="opacity-60" />
        <line x1="35" y1="40" x2="48" y2="48" stroke="currentColor" strokeWidth="2" className="opacity-60" />
        <line x1="48" y1="48" x2="60" y2="25" stroke="currentColor" strokeWidth="2" className="opacity-60" />
        <circle cx="60" cy="25" r="3" fill="currentColor" className="opacity-80" />
      </>
    );
  } else if (cat.includes("data")) {
    primaryColor = "#EC4899"; // Pink
    secondaryColor = "#DB2777";
    pattern = (
      <>
        <rect x="25" y="25" width="30" height="30" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40" />
        <circle cx="33" cy="35" r="2" fill="currentColor" />
        <circle cx="47" cy="35" r="2" fill="currentColor" />
        <circle cx="40" cy="48" r="3" fill="currentColor" />
      </>
    );
  } else if (cat.includes("legal")) {
    primaryColor = "#D97706"; // Gold
    secondaryColor = "#92400E";
    pattern = (
      <>
        <path d="M25,30 H55 M40,30 V55 M30,55 H50" stroke="currentColor" strokeWidth="2" className="opacity-50" />
        <circle cx="30" cy="42" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="42" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </>
    );
  } else if (cat.includes("sales") || cat.includes("sdr")) {
    primaryColor = "#3B82F6"; // Blue
    secondaryColor = "#2563EB";
    pattern = (
      <>
        <path d="M22,35 L58,22 L45,45 Z" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-50" />
        <path d="M45,45 L35,55 L38,42" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-50" />
      </>
    );
  } else if (cat.includes("product")) {
    primaryColor = "#8B5CF6"; // Purple
    secondaryColor = "#7C3AED";
    pattern = (
      <>
        <circle cx="40" cy="40" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40" />
        <path d="M40,22 V40 L52,40" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60" />
      </>
    );
  } else if (cat.includes("software") || cat.includes("development") || cat.includes("code")) {
    primaryColor = "#10B981"; // Emerald
    secondaryColor = "#059669";
    pattern = (
      <>
        <path d="M28,32 L20,40 L28,48 M52,32 L60,40 L52,48" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60" />
        <line x1="43" y1="28" x2="37" y2="52" stroke="currentColor" strokeWidth="2" className="opacity-60" />
      </>
    );
  } else if (cat.includes("knowledge")) {
    primaryColor = "#84CC16"; // Lime
    secondaryColor = "#65A30D";
    pattern = (
      <>
        <path d="M25,50 Q40,40 55,50 V28 Q40,18 25,28 Z" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-50" />
        <line x1="40" y1="23" x2="40" y2="45" stroke="currentColor" strokeWidth="1.5" className="opacity-40" />
      </>
    );
  } else if (cat.includes("finance")) {
    primaryColor = "#10B981"; // Green
    secondaryColor = "#047857";
    pattern = (
      <>
        <circle cx="40" cy="40" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40" />
        <path d="M36,32 H44 A4,4 0 0 1 44,40 H36 A4,4 0 0 0 36,48 H44" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60" />
        <line x1="40" y1="28" x2="40" y2="52" stroke="currentColor" strokeWidth="2" className="opacity-60" />
      </>
    );
  } else if (cat.includes("hr")) {
    primaryColor = "#EC4899"; // Pink
    secondaryColor = "#D946EF";
    pattern = (
      <>
        <circle cx="40" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60" />
        <path d="M25,52 C25,43 32,40 40,40 C48,40 55,43 55,52" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60" />
      </>
    );
  } else if (cat.includes("security")) {
    primaryColor = "#EF4444"; // Red
    secondaryColor = "#DC2626";
    pattern = (
      <>
        <path d="M40,22 L55,27 V40 C55,50 40,56 40,56 C40,56 25,50 25,40 V27 Z" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60" />
        <circle cx="40" cy="37" r="3" fill="currentColor" />
      </>
    );
  } else {
    primaryColor = "#6366F1"; // Indigo
    secondaryColor = "#4F46E5";
    pattern = (
      <>
        <circle cx="40" cy="40" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40" />
        <circle cx="40" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-20" />
      </>
    );
  }

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "IA";

  return (
    <div className="relative w-full h-32 rounded-2xl mb-6 overflow-hidden border border-white/5 flex items-center justify-center bg-zinc-950/40 group/avatar">
      {/* Background Glow */}
      <div 
        className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover/avatar:opacity-60" 
        style={{
          background: `radial-gradient(circle at center, ${primaryColor}50 0%, ${secondaryColor}10 70%, transparent 100%)`
        }} 
      />
      
      {/* Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:8px_8px]" />
      
      {/* Profile Ring */}
      <div 
        className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center relative shadow-lg overflow-hidden backdrop-blur-md"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}30 0%, ${secondaryColor}10 100%)`,
          boxShadow: `0 0 20px ${primaryColor}20`
        }}
      >
        <svg 
          width="80" 
          height="80" 
          viewBox="0 0 80 80" 
          className="absolute inset-0"
          style={{ color: primaryColor }}
        >
          {pattern}
        </svg>

        {/* Initials */}
        <span className="text-white text-base font-black tracking-wider z-10 font-fraunces">
          {initials}
        </span>
      </div>
      
      <div className="absolute top-2 left-3 text-[8px] font-black tracking-widest text-white/20 uppercase">
        SYS_ID // {id.slice(0, 8)}
      </div>
      <div className="absolute bottom-2 right-3 text-[8px] font-black tracking-widest text-white/20 uppercase">
        VIRTUAL_CORE
      </div>
    </div>
  );
};

interface TemplateListProps {
  templates: Pick<AgentTemplate, 'id' | 'name' | 'description' | 'category' | 'pricePerMonth' | 'icon' | 'uiData'>[];
  orgId: string;
}

export function TemplateList({ templates, orgId }: TemplateListProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {templates.map((template) => {
        return (
          <motion.div key={template.id} variants={item}>
            <PremiumGlassCard className="flex flex-col h-full p-8">
              {/* Illustration d'avatar dédiée */}
              <AgentAvatar id={template.id} category={template.category} name={template.name} />

              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-white/40">
                  {template.category}
                </span>
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">
                  Cortex IA
                </span>
              </div>

              <h3 className="text-2xl font-bold font-fraunces tracking-tight text-text-primary dark:text-white mb-3">
                {template.name}
              </h3>

              <p className="text-text-secondary dark:text-white/50 text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
                {template.description}
              </p>

              {template.uiData?.features && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {template.uiData.features.map((feature: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-500/10 dark:bg-cyan-500/10 text-[10px] font-bold text-blue-600 dark:text-cyan-400 rounded-md border border-blue-500/20 dark:border-cyan-500/20"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mb-8 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                <Cpu size={16} className="text-blue-500 dark:text-cyan-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary dark:text-white/60">
                  Cerveau: <span className="text-text-primary dark:text-white">GPT-4o / Claude 3.5</span>
                </span>
              </div>

              <div className="pt-6 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-white/30 mb-1">Location</p>
                  <p className="text-xl font-bold text-text-primary dark:text-white font-fraunces">
                    {template.pricePerMonth} <span className="text-sm font-normal text-text-secondary dark:text-white/40">crédits/mois</span>
                  </p>
                </div>
                <RentButton
                  orgId={orgId}
                  templateId={template.id}
                  templateName={template.name}
                  price={template.pricePerMonth}
                />
              </div>
            </PremiumGlassCard>
          </motion.div>
        );
      })}

      {templates.length === 0 && (
        <div className="col-span-full py-24 text-center border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl">
           <p className="text-text-secondary dark:text-white/30 font-medium">Aucun template disponible pour le moment.</p>
        </div>
      )}
    </motion.div>
  );
}

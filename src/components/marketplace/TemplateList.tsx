"use client";

import { motion } from "framer-motion";
import { User, Cpu, Headphones, Stethoscope, Building2 } from "lucide-react";
import { RentButton } from "./rent-button";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";

const iconMap: Record<string, any> = {
  Headphones,
  Stethoscope,
  Building2,
};

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  pricePerMonth: number;
  icon: string | null;
}

interface TemplateListProps {
  templates: Template[];
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
        const Icon = template.icon && iconMap[template.icon] ? iconMap[template.icon] : User;
        return (
          <motion.div key={template.id} variants={item}>
            <PremiumGlassCard className="flex flex-col h-full p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl border border-black/5 dark:border-white/10">
                  <Icon className="h-6 w-6 text-text-primary dark:text-white" />
                </div>
                <span className="px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-white/40">
                  {template.category}
                </span>
              </div>

              <h3 className="text-2xl font-bold font-fraunces tracking-tight text-text-primary dark:text-white mb-3">
                {template.name}
              </h3>

              <p className="text-text-secondary dark:text-white/50 text-sm leading-relaxed mb-8 flex-grow line-clamp-3">
                {template.description}
              </p>

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

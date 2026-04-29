import prisma from "@/lib/prisma";
import { Headphones, Stethoscope, Building2, User, Cpu } from "lucide-react";
import { RentButton } from "@/components/marketplace/rent-button";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import * as motion from "framer-motion/client";

const iconMap: Record<string, any> = {
  Headphones,
  Stethoscope,
  Building2,
};

export default async function MarketplacePage({ params }: { params: { orgId: string } }) {
  const templates = await prisma.agentTemplate.findMany();

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
    <div className="p-10 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold font-fraunces tracking-tighter text-white mb-2">
          Marketplace des Employés IA
        </h1>
        <p className="text-white/50 text-lg">
          Louez des agents spécialisés pour renforcer votre équipe en quelques secondes.
        </p>
      </header>

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
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40">
                    {template.category}
                  </span>
                </div>

                <h3 className="text-2xl font-bold font-fraunces tracking-tight text-white mb-3">
                  {template.name}
                </h3>

                <p className="text-white/50 text-sm leading-relaxed mb-8 flex-grow line-clamp-3">
                  {template.description}
                </p>

                <div className="flex items-center gap-2 mb-8 p-3 bg-white/5 rounded-xl border border-white/5">
                  <Cpu size={16} className="text-cyan-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                    Cerveau: <span className="text-white">GPT-4o / Claude 3.5</span>
                  </span>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Location</p>
                    <p className="text-xl font-bold text-white font-fraunces">
                      {template.pricePerMonth} <span className="text-sm font-normal text-white/40">crédits/mois</span>
                    </p>
                  </div>
                  <RentButton
                    orgId={params.orgId}
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
          <div className="col-span-full py-24 text-center border-2 border-dashed border-white/10 rounded-3xl">
             <p className="text-white/30 font-medium">Aucun template disponible pour le moment.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Headphones, Stethoscope, Building2, TrendingUp, Cpu, Search, Filter } from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";

const ICON_MAP: Record<string, any> = { Headphones, Stethoscope, Building2, TrendingUp, User };

const templates = [
  { id: "t1", name: "Support Client", description: "Agent spécialisé dans la réponse aux questions fréquentes et la résolution des problèmes clients en temps réel.", category: "Support", pricePerMonth: 50, icon: "Headphones" },
  { id: "t2", name: "Secrétaire Médical", description: "Gère les rendez-vous médicaux et répond aux questions administratives des patients avec professionnalisme.", category: "Santé", pricePerMonth: 70, icon: "Stethoscope" },
  { id: "t3", name: "Commercial Immobilier", description: "Qualifie vos prospects et présente votre catalogue de biens 24h/24, 7j/7 sur WhatsApp.", category: "Immobilier", pricePerMonth: 100, icon: "Building2" },
  { id: "t4", name: "Agent Commercial", description: "Optimisé pour la conversion et la présentation de produits. Suit vos leads et relance automatiquement.", category: "Ventes", pricePerMonth: 80, icon: "TrendingUp" },
  { id: "t5", name: "Assistant RH", description: "Répond aux questions des employés sur les congés, avantages, et procédures internes de l'entreprise.", category: "RH", pricePerMonth: 60, icon: "User" },
  { id: "t6", name: "Conseiller Financier", description: "Guide vos clients dans leurs décisions financières, calcule des projections et explique vos produits.", category: "Finance", pricePerMonth: 120, icon: "TrendingUp" },
];

const categories = ["Tous", "Support", "Santé", "Immobilier", "Ventes", "RH", "Finance"];

export default function MarketplacePage({ orgId }: { orgId: string }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "Tous" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (id: string) => {
    setLoadingId(id);
    setTimeout(() => setLoadingId(null), 1500);
  };

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold font-fraunces tracking-tighter text-[--text-primary] dark:text-white mb-2">
          Marketplace des Employés IA
        </h1>
        <p className="text-[--text-secondary] dark:text-white/50 text-lg">
          Louez des agents spécialisés pour renforcer votre équipe en quelques secondes.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un agent..."
            className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:text-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-black/5 dark:bg-white/5 text-[--text-secondary] dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {filtered.map((template) => {
          const Icon = template.icon && ICON_MAP[template.icon] ? ICON_MAP[template.icon] : User;
          const isLoading = loadingId === template.id;
          return (
            <motion.div key={template.id} variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
              <PremiumGlassCard className="flex flex-col h-full p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl border border-black/5 dark:border-white/10">
                    <Icon className="h-6 w-6 text-[--text-primary] dark:text-white" />
                  </div>
                  <span className="px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-[--text-secondary] dark:text-white/40">
                    {template.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold font-fraunces tracking-tight text-[--text-primary] dark:text-white mb-3">{template.name}</h3>
                <p className="text-[--text-secondary] dark:text-white/50 text-sm leading-relaxed mb-8 flex-grow">{template.description}</p>
                <div className="flex items-center gap-2 mb-8 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                  <Cpu size={16} className="text-blue-500 dark:text-cyan-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[--text-secondary] dark:text-white/60">
                    Cerveau: <span className="text-[--text-primary] dark:text-white">Opere-70B-Versatile</span>
                  </span>
                </div>
                <div className="pt-6 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[--text-secondary] dark:text-white/30 mb-1">Coût Initial</p>
                    <p className="text-xl font-bold text-[--text-primary] dark:text-white font-fraunces">
                      {template.pricePerMonth} <span className="text-sm font-normal text-[--text-secondary] dark:text-white/40">crédits</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelect(template.id)}
                    disabled={!!loadingId}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors"
                  >
                    {isLoading ? "Création..." : "Sélectionner"}
                  </button>
                </div>
              </PremiumGlassCard>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl">
            <p className="text-[--text-secondary] dark:text-white/30 font-medium">Aucun template trouvé pour cette recherche.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

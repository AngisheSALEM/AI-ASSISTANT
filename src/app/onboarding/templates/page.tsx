"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Headphones,
  TrendingUp,
  BarChart3,
  Gavel,
  Mail,
  Loader2,
  Rocket,
  Search,
  CheckCircle2,
  Cpu,
  ArrowRight
} from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { FloatingChatbot } from "@/components/FloatingChatbot";
import { AgentTemplate } from "@/lib/types";

const iconMap: Record<string, any> = {
  Headphones,
  TrendingUp,
  BarChart3,
  Gavel,
  Mail,
};

const TemplateSkeleton = () => (
  <div className="h-[400px] rounded-3xl bg-white/5 border border-white/10 animate-pulse p-8 flex flex-col">
    <div className="flex justify-between mb-6">
      <div className="w-14 h-14 bg-white/10 rounded-2xl" />
      <div className="w-20 h-6 bg-white/10 rounded-full" />
    </div>
    <div className="w-3/4 h-8 bg-white/10 rounded-lg mb-4" />
    <div className="w-full h-20 bg-white/10 rounded-lg mb-8" />
    <div className="mt-auto w-full h-12 bg-white/10 rounded-xl" />
  </div>
);

export default function OnboardingTemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Tous");
  const [isPending, startTransition] = useTransition();
  const [creatingId, setCreatingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/templates");
        if (res.ok) {
          const data = await res.json();
          setTemplates(data);
        } else {
          setError("Erreur lors du chargement des modèles");
        }
      } catch (err) {
        setError("Erreur de connexion");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleSelectTemplate = async (templateId: string) => {
    setCreatingId(templateId);
    setError("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/agents/create-from-template", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId }),
        });

        if (res.ok) {
          router.push("/copilot");
        } else {
          const data = await res.json();
          setError(data.error || "Erreur lors de la création de l'agent");
          setCreatingId(null);
        }
      } catch (err) {
        setError("Erreur de connexion lors de la création");
        setCreatingId(null);
      }
    });
  };

  const categories = ["Tous", ...Array.from(new Set(templates.map(t => t.category)))];
  const filteredTemplates = filter === "Tous"
    ? templates
    : templates.filter(t => t.category === filter);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-6"
          >
            <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400">Étape 2 : Choisissez votre premier agent</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold font-fraunces mb-4 leading-tight"
          >
            Quelle mission voulez-vous <br /> confier à votre IA ?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-xl max-w-2xl"
          >
            Sélectionnez un modèle d'agent adapté à vos besoins. Vous pourrez le personnaliser entièrement par la suite.
          </motion.p>
        </header>

        {/* Filters */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-4 mb-12"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full border transition-all ${
                  filter === cat
                  ? "bg-white text-black border-white"
                  : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                } font-medium text-sm`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <TemplateSkeleton key={i} />)
          ) : (
            filteredTemplates.map((template, idx) => {
              const Icon = template.icon && iconMap[template.icon] ? iconMap[template.icon] : Cpu;
              const isCreating = creatingId === template.id;

              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <PremiumGlassCard className="h-full flex flex-col p-8 group hover:border-white/20 transition-all duration-500">
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                        <Icon className="h-6 w-6 text-cyan-400" />
                      </div>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40">
                        {template.category}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold font-fraunces mb-3 group-hover:text-cyan-400 transition-colors">
                      {template.name}
                    </h3>

                    <p className="text-white/50 text-sm leading-relaxed mb-8 flex-grow">
                      {template.description}
                    </p>

                    {/* Features from uiData */}
                    {template.uiData?.features && (
                      <div className="space-y-2 mb-8">
                        {template.uiData.features.slice(0, 3).map((feature: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] font-medium text-white/70">
                            <CheckCircle2 size={14} className="text-cyan-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleSelectTemplate(template.id)}
                      disabled={creatingId !== null}
                      className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all ${
                        isCreating
                        ? "bg-cyan-500 text-white"
                        : "bg-white text-black hover:bg-cyan-50"
                      } disabled:opacity-50`}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Instanciation...
                        </>
                      ) : (
                        <>
                          Choisir ce modèle
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </PremiumGlassCard>
                </motion.div>
              );
            })
          )}
        </div>

        {filteredTemplates.length === 0 && !loading && (
          <div className="py-24 text-center border-2 border-dashed border-white/10 rounded-3xl">
            <Search className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/30 font-medium">Aucun template ne correspond à cette catégorie.</p>
          </div>
        )}
      </div>

      <FloatingChatbot />
    </div>
  );
}

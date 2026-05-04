import { Brain, Sparkles, Play, Pause, ChevronRight, Cpu, Network, Layers } from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const thoughts = [
  { id: 1, agent: "Support Alpha", step: "Analyse de la requête", detail: "Le client demande des informations sur les tarifs de livraison express.", status: "done", time: "0.2s" },
  { id: 2, agent: "Support Alpha", step: "Recherche dans la base de connaissances", detail: "Recherche dans 42 documents indexés... Trouvé: Tarifs_Livraison_2024.pdf", status: "done", time: "0.8s" },
  { id: 3, agent: "Support Alpha", step: "Génération de la réponse", detail: "Construction d'une réponse précise avec les tarifs actualisés...", status: "active", time: "1.2s" },
  { id: 4, agent: "Support Alpha", step: "Validation finale", detail: "Vérification de la conformité avec les règles d'exception...", status: "pending", time: "-" },
];

export default function ThinkingPage() {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[--text-primary] dark:text-white font-fraunces">Thinking Studio</h1>
          <p className="text-[--text-secondary] dark:text-white/50 mt-1">Observez le raisonnement interne de vos agents en temps réel.</p>
        </div>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          {isPlaying ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Reprendre</>}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <PremiumGlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Brain className="text-blue-500" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[--text-primary] dark:text-white">Flux de Raisonnement — Support Alpha</h3>
                <p className="text-xs text-[--text-secondary] dark:text-white/40">Session #4821 • Démarrée il y a 2.1s</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs text-green-500 font-bold uppercase tracking-widest">Live</span>
              </div>
            </div>

            <div className="space-y-3">
              {thoughts.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex gap-4 p-4 rounded-xl border transition-all ${
                    t.status === "active"
                      ? "bg-blue-500/10 border-blue-500/30"
                      : t.status === "done"
                      ? "bg-black/5 dark:bg-white/5 border-transparent"
                      : "bg-black/5 dark:bg-white/5 border-transparent opacity-40"
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    t.status === "active" ? "bg-blue-500 animate-pulse" : t.status === "done" ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20"
                  }`}>
                    {t.status === "done" && <span className="text-white text-[10px] font-bold">✓</span>}
                    {t.status === "active" && <span className="text-white text-[10px] font-bold">→</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-[--text-primary] dark:text-white text-sm">{t.step}</p>
                      <span className="text-[10px] text-[--text-secondary] dark:text-white/30 font-mono">{t.time}</span>
                    </div>
                    <p className="text-xs text-[--text-secondary] dark:text-white/60 leading-relaxed">{t.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </PremiumGlassCard>
        </div>

        <div className="space-y-6">
          <PremiumGlassCard className="p-6">
            <h3 className="font-bold text-[--text-primary] dark:text-white mb-4">Métriques de Performance</h3>
            <div className="space-y-4">
              {[
                { label: "Tokens utilisés", value: "1,247", icon: Cpu, color: "text-blue-500" },
                { label: "Sources consultées", value: "3 docs", icon: Layers, color: "text-violet-500" },
                { label: "Connexions RAG", value: "12 chunks", icon: Network, color: "text-cyan-500" },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <m.icon size={16} className={m.color} />
                    <span className="text-sm text-[--text-secondary] dark:text-white/60">{m.label}</span>
                  </div>
                  <span className="text-sm font-bold text-[--text-primary] dark:text-white">{m.value}</span>
                </div>
              ))}
            </div>
          </PremiumGlassCard>

          <PremiumGlassCard className="p-6">
            <h3 className="font-bold text-[--text-primary] dark:text-white mb-4">Sessions Récentes</h3>
            <div className="space-y-3">
              {[
                { id: "#4821", agent: "Support Alpha", duration: "2.1s", status: "En cours" },
                { id: "#4820", agent: "Commercial Beta", duration: "1.4s", status: "Terminé" },
                { id: "#4819", agent: "Support Alpha", duration: "0.9s", status: "Terminé" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-blue-500 font-bold">{s.id}</span>
                      <ChevronRight size={12} className="text-[--text-secondary] dark:text-white/30" />
                    </div>
                    <p className="text-xs text-[--text-secondary] dark:text-white/60">{s.agent} • {s.duration}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${s.status === "En cours" ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </PremiumGlassCard>

          <PremiumGlassCard className="p-6 bg-gradient-to-br from-violet-600/20 to-blue-600/20 border-violet-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-violet-400" />
              <h3 className="font-bold text-[--text-primary] dark:text-white">Conseil IA</h3>
            </div>
            <p className="text-sm text-[--text-secondary] dark:text-white/60 leading-relaxed">
              Votre agent Support Alpha cherche souvent dans les mêmes sections. Envisagez d'ajouter un FAQ dédié aux questions sur les tarifs.
            </p>
          </PremiumGlassCard>
        </div>
      </div>
    </div>
  );
}

import { TrendingUp, MessageSquare, Clock, FileText, Download, TrendingDown } from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";

const chartdata = [
  { date: "Jan 23", Interactions: 2890, Résolutions: 2338 },
  { date: "Feb 23", Interactions: 2756, Résolutions: 2103 },
  { date: "Mar 23", Interactions: 3322, Résolutions: 2194 },
  { date: "Apr 23", Interactions: 3470, Résolutions: 2108 },
  { date: "May 23", Interactions: 3475, Résolutions: 1812 },
  { date: "Jun 23", Interactions: 3129, Résolutions: 1726 },
];

const donutData = [
  { name: "Support Client", amount: 4890, color: "bg-blue-500" },
  { name: "Ventes", amount: 2103, color: "bg-cyan-500" },
  { name: "Prise de RDV", amount: 1405, color: "bg-indigo-500" },
  { name: "RH / Interne", amount: 1200, color: "bg-violet-500" },
];

const total = donutData.reduce((a, b) => a + b.amount, 0);

export default function AnalyticsPage() {
  const maxInteractions = Math.max(...chartdata.map(d => d.Interactions));

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[--text-primary] dark:text-white font-fraunces">Insights & Reports</h1>
          <p className="text-[--text-secondary] dark:text-white/50 mt-1">Analyse détaillée de la performance de vos agents IA.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95">
          <Download size={18} /> Export CSV
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Volume Total", value: "14,723", sub: "Messages gérés ce mois", trend: "up" },
          { label: "Taux de Satisfaction", value: "94.2%", sub: "Basé sur les retours clients", trend: "up" },
          { label: "Temps Moyen de Réponse", value: "1.2s", sub: "Vs 4.5m pour un humain", trend: "down-good" },
          { label: "Coût par Résolution", value: "0.08 $", sub: "Crédits convertis en USD", trend: "down-good" },
        ].map((stat, i) => (
          <PremiumGlassCard key={i} className="p-6">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm text-[--text-secondary] dark:text-white/70">{stat.label}</p>
              {stat.trend === "up" ? (
                <span className="text-emerald-500 text-xs font-bold flex items-center gap-1"><TrendingUp size={14} /> +12%</span>
              ) : (
                <span className="text-blue-500 text-xs font-bold flex items-center gap-1"><TrendingDown size={14} /> -8%</span>
              )}
            </div>
            <p className="text-3xl font-bold text-[--text-primary] dark:text-white font-fraunces">{stat.value}</p>
            <p className="mt-2 text-xs text-[--text-secondary] dark:text-white/40">{stat.sub}</p>
          </PremiumGlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PremiumGlassCard className="p-6">
          <h3 className="text-xl font-bold text-[--text-primary] dark:text-white mb-6">Évolution des Conversations</h3>
          <div className="h-72 flex items-end gap-3 px-2">
            {chartdata.map((d, i) => {
              const iPct = (d.Interactions / maxInteractions) * 100;
              const rPct = (d.Résolutions / maxInteractions) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end gap-0.5 justify-center" style={{ height: "220px" }}>
                    <div className="flex-1 bg-blue-500/70 rounded-t-sm" style={{ height: `${iPct}%` }} title={`Interactions: ${d.Interactions}`} />
                    <div className="flex-1 bg-emerald-500/70 rounded-t-sm" style={{ height: `${rPct}%` }} title={`Résolutions: ${d.Résolutions}`} />
                  </div>
                  <span className="text-[9px] text-[--text-secondary] dark:text-white/30">{d.date}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 justify-center">
            <div className="flex items-center gap-2 text-xs text-[--text-secondary] dark:text-white/60"><div className="w-3 h-3 rounded-sm bg-blue-500/70" /> Interactions</div>
            <div className="flex items-center gap-2 text-xs text-[--text-secondary] dark:text-white/60"><div className="w-3 h-3 rounded-sm bg-emerald-500/70" /> Résolutions</div>
          </div>
        </PremiumGlassCard>

        <PremiumGlassCard className="p-6">
          <h3 className="text-xl font-bold text-[--text-primary] dark:text-white mb-6">Répartition par Catégorie</h3>
          <div className="flex items-center gap-8">
            <div className="relative w-40 h-40 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {(() => {
                  let offset = 0;
                  return donutData.map((d, i) => {
                    const pct = (d.amount / total) * 100;
                    const colors = ["#3b82f6", "#06b6d4", "#6366f1", "#8b5cf6"];
                    const el = (
                      <circle
                        key={i}
                        cx="18" cy="18" r="15.915"
                        fill="none"
                        stroke={colors[i]}
                        strokeWidth="3"
                        strokeDasharray={`${pct} ${100 - pct}`}
                        strokeDashoffset={-offset}
                      />
                    );
                    offset += pct;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[--text-primary] dark:text-white font-fraunces">{total.toLocaleString()}</p>
                  <p className="text-[10px] text-[--text-secondary] dark:text-white/40 uppercase tracking-widest">Total</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {donutData.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${d.color}`} />
                    <span className="text-sm text-[--text-secondary] dark:text-white/70">{d.name}</span>
                  </div>
                  <span className="text-sm font-bold text-[--text-primary] dark:text-white">{d.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </PremiumGlassCard>
      </div>

      <PremiumGlassCard className="p-6">
        <h3 className="text-xl font-bold text-[--text-primary] dark:text-white mb-6">Historique des Rapports Quotidiens</h3>
        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 transition-all hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-bold text-[--text-primary] dark:text-white text-sm">Rapport du {15 - i} Octobre 2024</p>
                  <p className="text-xs text-[--text-secondary] dark:text-white/40">Résumé généré par IA • 128 conversations analysées</p>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">Premium</span>
            </div>
          ))}
        </div>
      </PremiumGlassCard>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  MessageSquare, TrendingUp, Clock, Coins, AlertTriangle, Plus, Globe, Mail, MessageCircle, FileText
} from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

const chartData = [
  { date: "27 avr", Messages: 12 },
  { date: "28 avr", Messages: 28 },
  { date: "29 avr", Messages: 19 },
  { date: "30 avr", Messages: 45 },
  { date: "01 mai", Messages: 33 },
  { date: "02 mai", Messages: 61 },
  { date: "03 mai", Messages: 49 },
];

const liveLog = [
  { action: "RDV pris", user: "Jean Dupont", agent: "Alpha", time: "2 min" },
  { action: "Message géré", user: "Marie Koné", agent: "SAV", time: "5 min" },
  { action: "Document appris", user: "Guide_Tarif.pdf", agent: "System", time: "12 min" },
];

export default function DashboardPage({ orgId }: { orgId: string }) {
  const { user } = useAuth();
  const [orgData, setOrgData] = useState<{ name: string; credits: number; plan: string } | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [org, agentList] = await Promise.all([
          api.org.get(orgId),
          api.agents.list(orgId),
        ]);
        setOrgData(org);
        setAgents(agentList);
      } catch {
        setOrgData({ name: "Votre Organisation", credits: 85, plan: "STANDARD" });
      } finally {
        setLoading(false);
      }
    };
    if (orgId) fetchData();
  }, [orgId]);

  const handleRecharge = async () => {
    try {
      await api.org.recharge(orgId, 100);
      const updated = await api.org.get(orgId);
      setOrgData(updated);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const showAlert = orgData && orgData.credits < 20;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {showAlert && (
        <div className="bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-400 p-4 rounded-md flex items-center space-x-3">
          <AlertTriangle className="text-orange-400" size={20} />
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Alerte : Vos crédits sont faibles ({orgData?.credits}). Pensez à recharger.
          </p>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[--text-primary] dark:text-white font-fraunces">Tableau de bord</h1>
          {orgData && (
            <p className="text-[--text-secondary] dark:text-white/50 mt-1">
              Organisation : <span className="font-medium text-[--text-primary] dark:text-white">{orgData.name}</span>
            </p>
          )}
        </div>
        <button
          onClick={handleRecharge}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          <span>Recharger 100 crédits</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Interactions", value: loading ? "..." : "247", sub: "Messages gérés par l'IA", badge: "+12%", badgeColor: "blue", icon: MessageSquare, iconColor: "text-blue-500" },
          { label: "Taux de Résolution", value: "88%", sub: "Sans intervention humaine", icon: TrendingUp, iconColor: "text-emerald-500", progress: 88 },
          { label: "Économie Réalisée", value: "37h", sub: "Temps humain gagné", badge: "Premium", badgeColor: "violet", icon: Clock, iconColor: "text-violet-500" },
          { label: "Crédits Restants", value: loading ? "..." : String(orgData?.credits ?? 0), sub: "Capacité actuelle", icon: Coins, iconColor: "text-orange-500", link: `/${orgId}/billing` },
        ].map((stat, i) => (
          <PremiumGlassCard key={i} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[--text-secondary] dark:text-white/60">{stat.label}</p>
                <h4 className="text-2xl font-bold mt-1 text-[--text-primary] dark:text-white">{stat.value}</h4>
              </div>
              <stat.icon className={stat.iconColor} size={20} />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="truncate text-[--text-secondary] dark:text-white/40 text-xs">{stat.sub}</p>
              {stat.badge && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold bg-${stat.badgeColor}-100 dark:bg-${stat.badgeColor}-500/20 text-${stat.badgeColor}-600 dark:text-${stat.badgeColor}-400`}>
                  {stat.badge}
                </span>
              )}
              {stat.link && (
                <Link href={stat.link} className="text-xs text-orange-500 hover:underline">Recharger</Link>
              )}
            </div>
            {stat.progress !== undefined && (
              <div className="mt-2 h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stat.progress}%` }} />
              </div>
            )}
          </PremiumGlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <PremiumGlassCard className="lg:col-span-2 p-6">
          <h3 className="text-xl font-bold text-[--text-primary] dark:text-white">Volume de messages (7 derniers jours)</h3>
          <div className="h-72 mt-6 flex items-end gap-2 px-2">
            {chartData.map((d, i) => {
              const max = Math.max(...chartData.map(x => x.Messages));
              const pct = (d.Messages / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center" style={{ height: "200px" }}>
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-cyan-600 hover:to-cyan-400"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-[--text-secondary] dark:text-white/30 font-medium">{d.date}</span>
                  <span className="text-xs font-bold text-[--text-primary] dark:text-white/70">{d.Messages}</span>
                </div>
              );
            })}
          </div>
        </PremiumGlassCard>

        <div className="space-y-8">
          <PremiumGlassCard className="p-6">
            <h3 className="text-xl font-bold text-[--text-primary] dark:text-white mb-4">État des Connexions</h3>
            <div className="space-y-4">
              {[
                { icon: MessageCircle, label: "WhatsApp Business", status: "Connecté ✅", color: "green" },
                { icon: Mail, label: "Email Automation", status: "Connecté ✅", color: "green" },
                { icon: Globe, label: "Website Widget", status: "En attente", color: "gray" },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${c.color === "green" ? "bg-green-100 dark:bg-green-500/20 text-green-600" : "bg-gray-100 dark:bg-white/10 text-gray-500"}`}>
                      <c.icon size={18} />
                    </div>
                    <p className="text-sm font-medium text-[--text-primary] dark:text-white">{c.label}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${c.color === "green" ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40"}`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </PremiumGlassCard>

          <PremiumGlassCard className="p-6">
            <h3 className="text-xl font-bold text-[--text-primary] dark:text-white mb-4">Agents actifs</h3>
            {loading ? (
              <p className="text-sm text-[--text-secondary] dark:text-white/40">Chargement...</p>
            ) : agents.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-[--text-secondary] dark:text-white/40">Aucun agent. <Link href={`/${orgId}/marketplace`} className="text-blue-500 hover:underline">Recruter →</Link></p>
              </div>
            ) : (
              <div className="space-y-2">
                {agents.slice(0, 3).map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span className="text-sm font-medium text-[--text-primary] dark:text-white">{a.name}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full font-bold">{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </PremiumGlassCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <PremiumGlassCard className="lg:col-span-2 p-6">
          <h3 className="text-xl font-bold text-[--text-primary] dark:text-white mb-4">Conversations Récentes</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-4 text-[10px] font-bold uppercase tracking-widest text-[--text-secondary] dark:text-white/30 pb-2 border-b border-black/5 dark:border-white/5">
              <span>Agent</span><span>Message</span><span>Date</span><span>Statut</span>
            </div>
            {[
              { agent: "Support Alpha", msg: "Bonjour, j'ai un problème...", date: "03/05 14:32", status: "Terminé" },
              { agent: "Commercial Beta", msg: "Quels biens disponibles ?", date: "03/05 11:18", status: "Terminé" },
              { agent: "Secrétaire", msg: "Je voudrais prendre RDV", date: "02/05 09:05", status: "Terminé" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-4 text-sm py-3 border-b border-black/5 dark:border-white/5 last:border-0">
                <span className="font-medium text-[--text-primary] dark:text-white truncate">{row.agent}</span>
                <span className="text-[--text-secondary] dark:text-white/60 truncate pr-2">{row.msg}</span>
                <span className="text-[--text-secondary] dark:text-white/60">{row.date}</span>
                <span className="text-xs px-2 py-0.5 h-fit rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 font-bold">{row.status}</span>
              </div>
            ))}
          </div>
        </PremiumGlassCard>

        <PremiumGlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[--text-primary] dark:text-white">Flux Live</h3>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
          <div className="space-y-4">
            {liveLog.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl text-xs">
                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-[--text-primary] dark:text-white/80"><span className="font-bold">{log.agent}</span> : {log.action} pour <span className="font-medium">{log.user}</span></p>
                  <p className="text-[--text-secondary] dark:text-white/30 mt-1">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </PremiumGlassCard>
      </div>
    </div>
  );
}

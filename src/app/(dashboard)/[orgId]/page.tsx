"use client";

import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  TrendingUp,
  Clock,
  Coins,
  AlertTriangle,
  Bot,
  Sparkles,
  Activity,
  ArrowUpRight,
  FileText,
  Mail,
  MessageCircle,
  Globe,
  Cpu,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/TremorComponents";
import Link from "next/link";
import { DashboardAreaChart } from "@/components/dashboard/DashboardCharts";
import { AgentStatusCard } from "@/components/dashboard/AgentStatusCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { LiveFeed } from "@/components/dashboard/LiveFeed";
import { WhatsAppFloatingButton } from "@/components/dashboard/WhatsAppFloatingButton";

export default function DashboardPage({
  params,
}: {
  params: { orgId: string };
}) {
  const { orgId } = params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExpertMode, setIsExpertMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kin_opere_expert_mode");
    setIsExpertMode(saved === "true");

    const handleSync = () => {
      const updated = localStorage.getItem("kin_opere_expert_mode");
      setIsExpertMode(updated === "true");
    };
    window.addEventListener("kin_opere_expert_mode_changed", handleSync);
    return () => {
      window.removeEventListener("kin_opere_expert_mode_changed", handleSync);
    };
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch(`/api/dashboard/${orgId}`);
        if (res.ok) {
          const dashboardData = await res.json();
          setData(dashboardData);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [orgId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500" size={20} />
        </div>
      </div>
    );
  }

  if (!data || !data.organization) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-text-primary dark:text-white">Organisation non trouvée</h2>
        <p className="text-text-secondary dark:text-white/50 mt-2">Désolé, nous n'avons pas pu charger les données.</p>
        <Link href="/" className="mt-6 inline-block text-cyan-500 hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  const {
    organization,
    agentCount,
    totalMessages,
    agents,
    skillsCount,
    chartData,
    dailyReports,
    resolutionRate,
    hoursSaved
  } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Low Credits Alert */}
      {organization.credits < 20 && (
        <div className="glass-card p-4 border-l-4 border-amber-500 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <AlertTriangle className="text-amber-500" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary dark:text-white">
              Credits faibles ({organization.credits} restants)
            </p>
            <p className="text-xs text-text-secondary dark:text-white/50">
              Rechargez pour eviter toute interruption de service.
            </p>
          </div>
          <Link 
            href={`/${orgId}/billing`}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Recharger
          </Link>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-text-primary dark:text-white tracking-tight font-fraunces">
            Bonjour, {organization.name}
          </h2>
          <p className="text-text-secondary dark:text-white/50">
            Voici un aperçu de la performance de vos agents aujourd&apos;hui.
          </p>
        </div>

        <div className="flex items-center gap-3 p-1 bg-black/5 dark:bg-white/5 rounded-xl self-start md:self-auto">
          <div className="px-4 py-2 bg-white dark:bg-white/10 rounded-lg shadow-sm border border-black/5 dark:border-white/10">
            <span className="text-xs font-bold text-text-primary dark:text-white">7 derniers jours</span>
          </div>
          <div className="px-4 py-2 text-xs font-medium text-text-secondary dark:text-white/40 cursor-not-allowed">
            Mois
          </div>
        </div>
      </div>

      {/* Capacité Inexploitée Widget (uniquement pour Standard / Free) */}
      {organization.plan !== "PREMIUM" && (
        <div className="glass-card p-6 border-l-4 border-cyan-500 bg-cyan-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500 shrink-0">
              <TrendingUp size={24} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-white font-fraunces">Capacité Inexploitée Détectée</h4>
                <Badge color="cyan">Recommandation IA</Badge>
              </div>
              <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
                Les dépôts de matériaux à Kinshasa perdent en moyenne <strong>15 heures par semaine</strong> sur la réconciliation manuelle des paiements et la facturation. Automatisez cela et économisez <strong>120 USD par mois</strong> de coûts indirects.
              </p>
            </div>
          </div>
          <Link
            href={`/${orgId}/blueprint`}
            className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-600 hover:to-blue-700 transition-all active:scale-95 whitespace-nowrap"
          >
            Lancer l'audit PDA
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Messages Total"
          value={totalMessages}
          icon={MessageSquare}
          trend="+12%"
          trendLabel="vs hier"
        />
        <StatsCard
          title="Taux de Resolution"
          value={`${resolutionRate}%`}
          icon={TrendingUp}
          iconColor="text-emerald-500"
          progress={resolutionRate}
        />
        <StatsCard
          title="Temps Gagne"
          value={`${hoursSaved}h`}
          icon={Clock}
          iconColor="text-blue-500"
          subtitle="Approx. 9 min / msg"
        />
        <StatsCard
          title="Credits Restants"
          value={organization.credits}
          icon={Coins}
          iconColor="text-amber-500"
          linkHref={`/${orgId}/billing`}
          linkLabel="Recharger"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary dark:text-white">
                Volume de messages
              </h3>
              <p className="text-xs text-text-secondary dark:text-white/40">
                7 derniers jours
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20">
              <Activity size={14} className="text-cyan-500" />
              <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
                Live
              </span>
            </div>
          </div>
          
          {totalMessages === 0 ? (
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-xl">
              <div className="text-center space-y-2">
                <div className="p-3 rounded-full bg-black/5 dark:bg-white/5 mx-auto w-fit">
                  <MessageSquare className="text-gray-400 dark:text-white/20" size={24} />
                </div>
                <p className="text-text-secondary dark:text-white/40 text-sm">
                  Pas encore de donnees
                </p>
                <Link 
                  href={`/${orgId}/agents`}
                  className="text-xs text-cyan-500 hover:underline inline-flex items-center gap-1"
                >
                  Configurer un agent <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>
          ) : (
            <DashboardAreaChart className="h-64" data={chartData} />
          )}
        </GlassCard>

        {/* Connection Status */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-text-primary dark:text-white mb-4">
            Connexions
          </h3>
          <div className="space-y-3">
            {[
              { name: "WhatsApp Business", icon: MessageCircle, color: "emerald", status: "connected" },
              { name: "Email Automation", icon: Mail, color: "blue", status: "connected" },
              { name: "Website Widget", icon: Globe, color: "gray", status: "pending" },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-500/20`}>
                    <item.icon 
                      size={16} 
                      className={item.status === "connected" ? `text-${item.color}-600 dark:text-${item.color}-400` : "text-gray-400"} 
                    />
                  </div>
                  <span className="text-sm font-medium text-text-primary dark:text-white">
                    {item.name}
                  </span>
                </div>
                <Badge color={item.status === "connected" ? "emerald" : "gray"}>
                  {item.status === "connected" ? "Actif" : "En attente"}
                </Badge>
              </div>
            ))}
          </div>
          
          <Link
            href={`/${orgId}/integrations`}
            className="mt-4 block text-center text-xs text-cyan-500 hover:underline"
          >
            Gerer les integrations
          </Link>
        </GlassCard>
      </div>

      {/* Agents & Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Agents / Custom Enterprise Integration (Premium) */}
        {organization.plan === "PREMIUM" ? (
          <GlassCard className="lg:col-span-2 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-text-primary dark:text-white font-fraunces">
                  🛡️ Architecture d'Intégration Entreprise
                </h3>
                <p className="text-xs text-text-secondary dark:text-white/40">
                  Canaux sur-mesure déployés avec monitoring et contrôle de code isolé.
                </p>
              </div>
              <Badge color="emerald">SLA 99.9% Actif</Badge>
            </div>

            {/* Visual representation of the custom pipeline */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {[
                  { name: "WhatsApp Gateway", status: "ONLINE", desc: "Instance Baileys dédiée" },
                  { name: "PII NER Filter", status: "SECURE", desc: "Anonymisation locale" },
                  { name: "n8n Processing", status: "ACTIVE", desc: "Workflows sur-mesure" },
                  { name: "2FA Manager Link", status: "CONNECTED", desc: "Copilote Papa Kabeya" },
                  { name: "M-Pesa API", status: "LIVE", desc: "Règles d'idempotence" },
                ].map((step, idx, arr) => (
                  <React.Fragment key={step.name}>
                    <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/5 border border-white/5 w-full md:w-36">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">{step.status}</span>
                      </div>
                      <span className="text-xs font-bold text-white mb-0.5">{step.name}</span>
                      <span className="text-[9px] text-zinc-400">{step.desc}</span>
                    </div>
                    {idx < arr.length - 1 && (
                      <span className="text-cyan-500 text-lg hidden md:inline">➔</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Enterprise stats details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Coûts API Réels</span>
                <p className="text-lg font-bold text-white">0.32 USD</p>
                <span className="text-[9px] text-zinc-500">Facturation mensuelle</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Latence moyenne</span>
                <p className="text-lg font-bold text-white">1.8s</p>
                <span className="text-[9px] text-zinc-500">Mise en cache Redis</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Support Dédié</span>
                <p className="text-lg font-bold text-emerald-400">WhatsApp Privé</p>
                <span className="text-[9px] text-zinc-500">Ingénieur : Winston</span>
              </div>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary dark:text-white">
                Agents Actifs
              </h3>
              <p className="text-xs text-text-secondary dark:text-white/40">
                {agentCount} agents deployes
              </p>
            </div>
            <Link
              href={`/${orgId}/agents`}
              className="text-xs font-medium text-cyan-500 hover:underline inline-flex items-center gap-1"
            >
              Voir tout <ArrowUpRight size={12} />
            </Link>
          </div>

          {agents.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-xl">
              <div className="p-4 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 mx-auto w-fit mb-4">
                <Bot size={32} className="text-cyan-500" />
              </div>
              <p className="text-text-primary dark:text-white font-medium mb-1">
                Aucun agent configure
              </p>
              <p className="text-text-secondary dark:text-white/40 text-sm mb-4">
                Creez votre premier agent IA pour commencer.
              </p>
              <Link
                href={`/${orgId}/marketplace`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
              >
                <Sparkles size={16} />
                Creer un agent
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent: any) => (
                <AgentStatusCard
                  key={agent.id}
                  agent={agent}
                  orgId={orgId}
                />
              ))}
            </div>
          )}
        </GlassCard>
        )}

        {/* Daily Reports Widget */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary dark:text-white">
              Rapports
            </h3>
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <FileText size={14} className="text-blue-500" />
            </div>
          </div>

          {dailyReports.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-text-secondary dark:text-white/40">
                Aucun rapport disponible.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dailyReports.map((report: any) => (
                <div
                  key={report.id}
                  className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                      {report.agent.name}
                    </span>
                    <span className="text-[10px] text-text-secondary dark:text-white/40">
                      {new Date(report.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary dark:text-white/60 line-clamp-2 italic">
                    &quot;{report.summaryText}&quot;
                  </p>
                </div>
              ))}
            </div>
          )}

          <Link
            href={`/${orgId}/analytics`}
            className="mt-4 block text-center text-xs text-cyan-500 hover:underline"
          >
            Voir tous les rapports
          </Link>
        </GlassCard>
      </div>

      {/* Skills & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills Overview */}
        {isExpertMode && (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary dark:text-white">
                Skills
              </h3>
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <Cpu size={14} className="text-emerald-500" />
              </div>
            </div>

            <div className="text-center py-6">
              <p className="text-4xl font-bold text-text-primary dark:text-white mb-1">
                {skillsCount}
              </p>
              <p className="text-xs text-text-secondary dark:text-white/40">
                Skills configures
              </p>
            </div>

            <div className="space-y-2">
              {[
                { name: "Prise de RDV", active: true },
                { name: "FAQ Automatique", active: true },
                { name: "Suivi Commande", active: false },
              ].map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.02]"
                >
                  <span className="text-xs font-medium text-text-primary dark:text-white/80">
                    {skill.name}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ${skill.active ? "bg-emerald-500" : "bg-gray-400"}`} />
                </div>
              ))}
            </div>

            <Link
              href={`/${orgId}/thinking`}
              className="mt-4 block text-center text-xs text-cyan-500 hover:underline"
            >
              Gerer les skills
            </Link>
          </GlassCard>
        )}

        {/* Live Feed */}
        <div className={isExpertMode ? "lg:col-span-2" : "col-span-full lg:col-span-3"}>
          <LiveFeed orgId={orgId} />
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <WhatsAppFloatingButton orgId={orgId} />
    </div>
  );
}

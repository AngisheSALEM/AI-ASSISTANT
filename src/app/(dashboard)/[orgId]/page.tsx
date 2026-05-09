import { prisma } from "@/lib/prisma";
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
import { Badge, Flex, ProgressBar, Text } from "@/components/ui/TremorComponents";
import Link from "next/link";
import { DashboardAreaChart } from "@/components/dashboard/DashboardCharts";
import { AgentStatusCard } from "@/components/dashboard/AgentStatusCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { LiveFeed } from "@/components/dashboard/LiveFeed";
import { WhatsAppFloatingButton } from "@/components/dashboard/WhatsAppFloatingButton";

export default async function DashboardPage({
  params,
}: {
  params: { orgId: string };
}) {
  const { orgId } = params;

  // Fetch Organization details
  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
  });

  if (!organization) {
    return <div>Organisation non trouvee</div>;
  }

  // Fetch real stats
  const agentCount = await prisma.agent.count({
    where: { organizationId: orgId },
  });

  const totalMessages = await prisma.message.count({
    where: {
      conversation: {
        agent: {
          organizationId: orgId,
        },
      },
    },
  });

  // Fetch active agents with their stats
  const agents = await prisma.agent.findMany({
    where: { organizationId: orgId },
    include: {
      _count: {
        select: {
          conversations: true,
        },
      },
      template: true,
    },
    take: 4,
  });

  // Fetch skills count
  const skillsCount = await prisma.skill.count({
    where: { organizationId: orgId },
  });

  // Simulated metrics
  const resolutionRate = totalMessages > 0 ? 88 : 0;
  const hoursSaved = Math.round(totalMessages * 0.15);

  // Data for AreaChart
  const chartData = await Promise.all(
    Array.from({ length: 7 }).map(async (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const count = await prisma.message.count({
        where: {
          conversation: {
            agent: {
              organizationId: orgId,
            },
          },
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      return {
        date: date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
        }),
        "Messages": count,
      };
    })
  );

  // Fetch Daily Reports
  const dailyReports = await prisma.dailyReport.findMany({
    where: {
      agent: {
        organizationId: orgId
      }
    },
    orderBy: { date: 'desc' },
    include: { agent: true },
    take: 3
  });

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

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary dark:text-white/40">
            Dashboard
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary dark:text-white font-fraunces">
            Bienvenue, {organization.name}
          </h1>
          <p className="text-text-secondary dark:text-white/50 text-sm">
            Voici un apercu de vos agents IA et de leurs performances.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 glass-card">
            <div className="relative">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-30" />
              <span className="relative block w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs font-medium text-text-secondary dark:text-white/60">
              {agentCount} agents actifs
            </span>
          </div>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Interactions"
          value={totalMessages}
          icon="MessageSquare"
          iconColor="text-cyan-500"
          trend="+12%"
          trendLabel="ce mois"
        />
        <StatsCard
          title="Taux Resolution"
          value={`${resolutionRate}%`}
          icon="TrendingUp"
          iconColor="text-emerald-500"
          progress={resolutionRate}
          subtitle="Sans intervention humaine"
        />
        <StatsCard
          title="Temps Economise"
          value={`${hoursSaved}h`}
          icon="Clock"
          iconColor="text-blue-500"
          subtitle="Ce mois-ci"
        />
        <StatsCard
          title="Credits Restants"
          value={organization.credits}
          icon="Coins"
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
        {/* Active Agents */}
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
              {agents.map((agent) => (
                <AgentStatusCard
                  key={agent.id}
                  agent={agent}
                  orgId={orgId}
                />
              ))}
            </div>
          )}
        </GlassCard>

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
              {dailyReports.map((report) => (
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

        {/* Live Feed */}
        <LiveFeed orgId={orgId} />
      </div>

      {/* WhatsApp Floating Button */}
      <WhatsAppFloatingButton orgId={orgId} />
    </div>
  );
}

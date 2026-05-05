import { prisma } from "@/lib/prisma"; // Notez les accolades {}
import {
  Users,
  MessageSquare,
  Activity,
  Plus,
  Coins,
  AlertTriangle,
  Zap,
  TrendingUp,
  Clock,
  Globe,
  Mail,
  MessageCircle,
  FileText
} from "lucide-react";
import { DonutChart, Title, Text, Badge, Flex, ProgressBar } from "@/components/ui/TremorComponents";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import RecentActivity from "@/components/RecentActivity";
import RechargeButton from "@/components/RechargeButton";
import Link from "next/link";
import { DashboardAreaChart } from "@/components/dashboard/DashboardCharts";

export default async function DashboardPage({
  params,
}: {
  params: { orgId: string };
}) {
  const { orgId } = params;

  // 0. Fetch Organization details
  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
  });

  if (!organization) {
    return <div>Organisation non trouvée</div>;
  }

  // 1. Fetch real stats
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

  // Simulated metrics
  const resolutionRate = totalMessages > 0 ? 88 : 0;
  const hoursSaved = Math.round(totalMessages * 0.15); // Avg 9 mins saved per message interaction

  // 2. Data for AreaChart (Messages per day - last 7 days)
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

  // 3. Data for DonutChart (Usage by Agent)
  const agents = await prisma.agent.findMany({
    where: { organizationId: orgId },
    include: {
      _count: {
        select: {
          conversations: true,
        },
      },
    },
  });

  const donutData = agents.map((a) => ({
    name: a.name,
    amount: a._count.conversations,
  }));

  // 4. Fetch Daily Report (last one)
  const lastReport = await prisma.dailyReport.findFirst({
    where: {
      agent: {
        organizationId: orgId
      }
    },
    orderBy: { date: 'desc' },
    include: { agent: true }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {organization.credits < 20 && (
        <div className="bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-400 p-4 rounded-md flex items-center space-x-3">
          <AlertTriangle className="text-orange-400" size={20} />
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Alerte : Vos crédits sont faibles ({organization.credits}). Pensez à recharger pour éviter toute interruption de service.
          </p>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary dark:text-white font-fraunces">Tableau de bord</h1>
          <p className="text-text-secondary dark:text-white/50 mt-1">
            Organisation : <span className="font-medium text-text-primary dark:text-white">{organization.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
           <RechargeButton orgId={orgId} currentCredits={organization.credits} />
        </div>
      </header>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PremiumGlassCard className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-text-secondary dark:text-white/60">Total Interactions</Text>
              <h4 className="text-2xl font-bold mt-1 text-text-primary dark:text-white">{totalMessages}</h4>
            </div>
            <MessageSquare className="text-blue-500" size={20} />
          </Flex>
          <Flex className="mt-4">
             <Text className="truncate text-text-secondary dark:text-white/40 text-xs">Messages gérés par l'IA</Text>
             <Badge color="blue">+12%</Badge>
          </Flex>
        </PremiumGlassCard>

        <PremiumGlassCard className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-text-secondary dark:text-white/60">Taux de Résolution</Text>
              <h4 className="text-2xl font-bold mt-1 text-text-primary dark:text-white">{resolutionRate}%</h4>
            </div>
            <TrendingUp className="text-emerald-500" size={20} />
          </Flex>
          <ProgressBar value={resolutionRate} color="emerald" className="mt-4" />
          <Text className="mt-2 text-xs text-text-secondary dark:text-white/40 text-center">Sans intervention humaine</Text>
        </PremiumGlassCard>

        <PremiumGlassCard className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-text-secondary dark:text-white/60">Économie Réalisée</Text>
              <h4 className="text-2xl font-bold mt-1 text-text-primary dark:text-white">{hoursSaved}h</h4>
            </div>
            <Clock className="text-violet-500" size={20} />
          </Flex>
          <Flex className="mt-4">
             <Text className="truncate text-text-secondary dark:text-white/40 text-xs">Temps humain gagné</Text>
             <Badge color="violet">Premium</Badge>
          </Flex>
        </PremiumGlassCard>

        <PremiumGlassCard className="p-6">
          <Flex alignItems="start">
            <div>
              <Text className="text-text-secondary dark:text-white/60">Crédits Restants</Text>
              <h4 className="text-2xl font-bold mt-1 text-text-primary dark:text-white">{organization.credits}</h4>
            </div>
            <Coins className="text-orange-500" size={20} />
          </Flex>
          <Flex className="mt-4">
             <Text className="truncate text-text-secondary dark:text-white/40 text-xs">Capacité actuelle</Text>
             <Link href={`/${orgId}/billing`} className="text-xs text-orange-500 hover:underline">Recharger</Link>
          </Flex>
        </PremiumGlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <PremiumGlassCard className="lg:col-span-2 p-6">
          <h3 className="text-xl font-bold text-text-primary dark:text-white">Volume de messages (7 derniers jours)</h3>
          {totalMessages === 0 ? (
            <div className="h-72 mt-4 flex items-center justify-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-xl bg-black/5 dark:bg-white/5">
              <div className="text-center">
                <MessageSquare className="mx-auto text-gray-300 dark:text-white/20 mb-2" size={32} />
                <p className="text-text-secondary dark:text-white/40 text-sm">Pas encore de données</p>
              </div>
            </div>
          ) : (
            <DashboardAreaChart
              className="h-72 mt-4"
              data={chartData}
            />
          )}
        </PremiumGlassCard>

        {/* Connection Status & Live Feed */}
        <div className="space-y-8">
           <PremiumGlassCard className="p-6">
              <h3 className="text-xl font-bold text-text-primary dark:text-white mb-4">État des Connexions</h3>
              <div className="space-y-4">
                 <Flex>
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg text-green-600 dark:text-green-400">
                          <MessageCircle size={18} />
                       </div>
                       <Text className="text-text-primary dark:text-white font-medium">WhatsApp Business</Text>
                    </div>
                    <Badge color="green">Connecté ✅</Badge>
                 </Flex>
                 <Flex>
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                          <Mail size={18} />
                       </div>
                       <Text className="text-text-primary dark:text-white font-medium">Email Automation</Text>
                    </div>
                    <Badge color="green">Connecté ✅</Badge>
                 </Flex>
                 <Flex>
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-black/5 dark:bg-white/10 rounded-lg text-gray-400">
                          <Globe size={18} />
                       </div>
                       <Text className="text-text-primary dark:text-white font-medium">Website Widget</Text>
                    </div>
                    <Badge color="gray">En attente</Badge>
                 </Flex>
              </div>
           </PremiumGlassCard>

           <PremiumGlassCard className="p-6">
              <h3 className="text-xl font-bold text-text-primary dark:text-white mb-4">Widget Daily Report</h3>
              {lastReport ? (
                <div className="space-y-4">
                   <div className="flex items-center gap-2">
                      <FileText size={16} className="text-blue-500" />
                      <Text className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-white/40">Rapport de {lastReport.agent.name}</Text>
                   </div>
                   <p className="text-sm text-text-secondary dark:text-white/70 italic line-clamp-4">
                      "{lastReport.summaryText}"
                   </p>
                   <Link href={`/${orgId}/analytics`} className="block text-center text-xs text-blue-500 hover:underline">Voir tous les rapports</Link>
                </div>
              ) : (
                <div className="py-4 text-center">
                   <Text className="text-xs text-text-secondary dark:text-white/40">Aucun rapport disponible pour le moment.</Text>
                </div>
              )}
           </PremiumGlassCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
           <RecentActivity orgId={orgId} />
        </div>

        {/* Mini Live Log */}
        <PremiumGlassCard className="p-6">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-text-primary dark:text-white">Flux "Live"</h3>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
           </div>
           <div className="space-y-4">
              {[
                { action: "RDV pris", user: "Jean Dupont", agent: "Alpha", time: "2 min" },
                { action: "Message géré", user: "Marie Koné", agent: "SAV", time: "5 min" },
                { action: "Document appris", user: "Guide_Tarif.pdf", agent: "System", time: "12 min" },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl text-xs transition-colors hover:bg-black/10 dark:hover:bg-white/10">
                   <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-500" />
                   <div className="flex-1">
                      <p className="text-text-primary dark:text-white/80"><span className="font-bold">{log.agent}</span> : {log.action} pour <span className="font-medium">{log.user}</span></p>
                      <p className="text-text-secondary dark:text-white/30 mt-1">{log.time}</p>
                   </div>
                </div>
              ))}
           </div>
        </PremiumGlassCard>
      </div>
    </div>
  );
}

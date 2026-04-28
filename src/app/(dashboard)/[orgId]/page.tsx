import prisma from "@/lib/prisma";
import {
  Users,
  MessageSquare,
  Activity,
  Upload,
  FileText,
  Plus,
  Coins,
  AlertTriangle,
} from "lucide-react";
import { AreaChart, DonutChart, Card, Title, Text } from "@tremor/react";
import RecentActivity from "@/components/RecentActivity";
import RechargeButton from "@/components/RechargeButton";

export default async function DashboardPage({
  params,
}: {
  params: { orgId: string };
}) {
  const { orgId } = params;

  // 0. Fetch Organization details (including credits)
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

  // 2. Data for AreaChart (Messages per day - last 7 days)
  // Utilisation de prisma.message.count() avec filtres where pour la performance
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

  // 4. Fetch Knowledge Base
  const knowledgeBase = await prisma.knowledgeBase.findMany({
    where: { organizationId: orgId },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {organization.credits < 20 && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md flex items-center space-x-3">
          <AlertTriangle className="text-orange-400" size={20} />
          <p className="text-sm text-orange-700">
            Alerte : Vos crédits sont faibles ({organization.credits}). Pensez à recharger pour éviter toute interruption de service.
          </p>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-gray-500 mt-2">
            Organisation : <span className="font-medium text-gray-900">{organization.name}</span>
          </p>
        </div>
        <RechargeButton orgId={orgId} currentCredits={organization.credits} />
      </header>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card decoration="top" decorationColor="orange">
          <div className="flex items-center justify-between">
            <Text>Crédits Restants</Text>
            <Coins className="text-orange-500" size={20} />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-semibold">{organization.credits}</span>
          </div>
        </Card>

        <Card decoration="top" decorationColor="blue">
          <div className="flex items-center justify-between">
            <Text>Agents Actifs</Text>
            <Users className="text-blue-500" size={20} />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-semibold">{agentCount}</span>
          </div>
        </Card>

        <Card decoration="top" decorationColor="blue">
          <div className="flex items-center justify-between">
            <Text>Messages Envoyés</Text>
            <MessageSquare className="text-blue-500" size={20} />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-semibold">{totalMessages}</span>
          </div>
        </Card>

        <Card decoration="top" decorationColor="blue">
          <div className="flex items-center justify-between">
            <Text>Statut Système</Text>
            <Activity className="text-green-500" size={20} />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-semibold">Opérationnel</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <Title>Volume de messages (7 derniers jours)</Title>
          {totalMessages === 0 ? (
            <div className="h-72 mt-4 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
              <div className="text-center">
                <MessageSquare className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-gray-500 text-sm">Pas encore de données, commencez à discuter avec un agent</p>
              </div>
            </div>
          ) : (
            <AreaChart
              className="h-72 mt-4"
              data={chartData}
              index="date"
              categories={["Messages"]}
              colors={["blue"]}
              valueFormatter={(number: number) =>
                Intl.NumberFormat("us").format(number).toString()
              }
            />
          )}
        </Card>

        {/* Donut Chart */}
        <Card>
          <Title>Répartition par Agent</Title>
          {totalMessages === 0 ? (
            <div className="h-72 mt-4 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
              <p className="text-gray-500 text-sm text-center px-4">Aucune activité enregistrée</p>
            </div>
          ) : (
            <DonutChart
              className="h-72 mt-4"
              data={donutData}
              category="amount"
              index="name"
              colors={["blue", "cyan", "indigo", "violet", "slate"]}
            />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Knowledge Base Section */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Base de Connaissances</h2>
            <button className="flex items-center space-x-1 text-sm text-blue-600 hover:underline">
              <Plus size={16} />
              <span>Ajouter</span>
            </button>
          </div>

          {knowledgeBase.length === 0 ? (
             <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-center space-y-3">
             <Upload className="text-gray-400" size={32} />
             <div>
               <p className="font-medium text-gray-700">Glissez vos fichiers ici</p>
               <p className="text-xs text-gray-500">PDF, TXT ou CSV (max 10MB)</p>
             </div>
             <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm transition-colors">
               Parcourir les fichiers
             </button>
           </div>
          ) : (
            <div className="space-y-3">
              {knowledgeBase.map((kb) => (
                <div key={kb.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="text-blue-500" size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{kb.title}</p>
                    <p className="text-xs text-gray-500">
                      Indexé le {kb.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Activity Table */}
        <div className="lg:col-span-2">
          <RecentActivity orgId={orgId} />
        </div>
      </div>
    </div>
  );
}

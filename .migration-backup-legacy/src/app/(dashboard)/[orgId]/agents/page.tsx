import { prisma } from "@/lib/prisma";
import { AgentsTable } from "@/components/agents/AgentsTable";
import { AgentsHeader } from "@/components/agents/AgentsHeader";
import { TemplatesGrid } from "@/components/agents/TemplatesGrid";

export default async function AgentsPage({ params }: { params: { orgId: string } }) {
  const { orgId } = params;

  const agents = await prisma.agent.findMany({
    where: { organizationId: orgId },
    include: { template: true }
  });

  const templates = await prisma.agentTemplate.findMany();

  const hasAgents = agents.length > 0;

  return (
    <div className="p-6">
      <AgentsHeader orgId={orgId} />

      {hasAgents ? (
        <AgentsTable agents={agents.map(a => ({
          id: a.id,
          name: a.name,
          role: a.role,
          status: a.status,
          createdAt: a.createdAt
        }))} />
      ) : (
        <div className="space-y-8">
          <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-text-primary dark:text-white mb-2">Bienvenue ! 👋</h2>
            <p className="text-text-secondary dark:text-white/60">
              Pour commencer, veuillez sélectionner un template pour votre premier agent IA.
            </p>
          </div>
          <TemplatesGrid templates={templates} orgId={orgId} />
        </div>
      )}
    </div>
  );
}

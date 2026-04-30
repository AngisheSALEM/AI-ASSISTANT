import prisma from "@/lib/prisma";
import { AgentsTable } from "@/components/agents/AgentsTable";
import { AgentsHeader } from "@/components/agents/AgentsHeader";

export default async function AgentsPage({ params }: { params: { orgId: string } }) {
  const agents = await prisma.agent.findMany({
    where: { organizationId: params.orgId },
    include: { template: true }
  });

  return (
    <div className="p-6">
      <AgentsHeader orgId={params.orgId} />

      <AgentsTable agents={agents.map(a => ({
        id: a.id,
        name: a.name,
        role: a.role,
        status: a.status,
        createdAt: a.createdAt
      }))} />
    </div>
  );
}

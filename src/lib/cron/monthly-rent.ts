import prisma from "@/lib/prisma";

/**
 * Script à exécuter mensuellement pour déduire le coût de location des agents.
 * Dans un environnement Vercel, cela serait une API protégée appelée par Vercel Cron.
 */
export async function processMonthlySubscriptions() {
  const agents = await prisma.agent.findMany({
    where: {
      status: "ACTIVE",
      templateId: { not: null },
    },
    include: {
      template: true,
    },
  });

  for (const agent of agents) {
    if (agent.template) {
      try {
        await prisma.organization.update({
          where: { id: agent.organizationId },
          data: {
            credits: {
              decrement: agent.template.pricePerMonth,
            },
          },
        });
        console.log(`Deducted ${agent.template.pricePerMonth} credits from Org ${agent.organizationId} for Agent ${agent.id}`);
      } catch (error) {
        console.error(`Failed to deduct credits for Org ${agent.organizationId}:`, error);
        // On pourrait suspendre l'agent si les crédits tombent trop bas
        await prisma.agent.update({
          where: { id: agent.id },
          data: { status: "SUSPENDED" }
        });
      }
    }
  }
}

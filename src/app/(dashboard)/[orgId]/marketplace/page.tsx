import prisma from "@/lib/prisma";
import { TemplateList } from "@/components/marketplace/TemplateList";

export default async function MarketplacePage({ params }: { params: { orgId: string } }) {
  const templates = await prisma.agentTemplate.findMany();

  // On s'assure de ne passer que des données simples (JSON sérialisables)
  const plainTemplates = templates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    pricePerMonth: t.pricePerMonth,
    icon: t.icon
  }));

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold font-fraunces tracking-tighter text-text-primary dark:text-white mb-2">
          Marketplace des Employés IA
        </h1>
        <p className="text-text-secondary dark:text-white/50 text-lg">
          Louez des agents spécialisés pour renforcer votre équipe en quelques secondes.
        </p>
      </header>

      <TemplateList
        templates={plainTemplates}
        orgId={params.orgId}
      />
    </div>
  );
}

import prisma from "@/lib/prisma";
import { Card, Title, Text, Grid, Badge } from "@tremor/react";
import { Headphones, Stethoscope, Building2, User } from "lucide-react";
import { RentButton } from "@/components/marketplace/rent-button";

const iconMap: Record<string, any> = {
  Headphones,
  Stethoscope,
  Building2,
};

export default async function MarketplacePage({ params }: { params: { orgId: string } }) {
  const templates = await prisma.agentTemplate.findMany();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title>Marketplace des Employés IA</Title>
          <Text>Louez des agents spécialisés pour renforcer votre équipe en quelques secondes.</Text>
        </div>
      </div>

      <Grid numItemsMd={2} numItemsLg={3} className="gap-6">
        {templates.map((template) => {
          const Icon = template.icon && iconMap[template.icon] ? iconMap[template.icon] : User;
          return (
            <Card key={template.id} className="flex flex-col">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <Badge color="blue">{template.category}</Badge>
              </div>
              <Title className="mt-4">{template.name}</Title>
              <Text className="mt-2 line-clamp-3 flex-grow">
                {template.description}
              </Text>
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <div>
                  <Text>Coût mensuel</Text>
                  <Title>{template.pricePerMonth} crédits</Title>
                </div>
                <RentButton
                  orgId={params.orgId}
                  templateId={template.id}
                  price={template.pricePerMonth}
                />
              </div>
            </Card>
          );
        })}

        {templates.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
             <Text>Aucun template disponible pour le moment.</Text>
          </div>
        )}
      </Grid>
    </div>
  );
}

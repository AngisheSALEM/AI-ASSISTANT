import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const templates = [
    {
      name: "Expert Support Client",
      description: "Un agent capable de gérer les réclamations, les questions techniques et d'orienter vos clients vers les bonnes ressources.",
      basePrompt: "Tu es un expert en support client. Ton but est d'être empathique, rapide et efficace.",
      category: "Support",
      pricePerMonth: 50,
      icon: "Headphones"
    },
    {
      name: "Secrétaire Médical IA",
      description: "Spécialisé dans la prise de rendez-vous, l'explication des protocoles et le suivi administratif des patients.",
      basePrompt: "Tu es un secrétaire médical professionnel. Tu respectes la confidentialité et tu es très organisé.",
      category: "Santé",
      pricePerMonth: 70,
      icon: "Stethoscope"
    },
    {
      name: "Agent Immobilier Virtuel",
      description: "Qualifie vos prospects, présente vos biens et organise des visites virtuelles via WhatsApp.",
      basePrompt: "Tu es un agent immobilier dynamique. Tu connais parfaitement ton catalogue et tu cherches à conclure des ventes.",
      category: "Immobilier",
      pricePerMonth: 100,
      icon: "Building2"
    }
  ];

  for (const t of templates) {
    await prisma.agentTemplate.upsert({
      where: { id: t.name.toLowerCase().replace(/ /g, '-') },
      update: t,
      create: {
        id: t.name.toLowerCase().replace(/ /g, '-'),
        ...t
      }
    });
  }

  console.log("Templates seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

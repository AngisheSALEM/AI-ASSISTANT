import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const templates = [
    {
      id: "support-client",
      name: "Support Client",
      description: "Expert en gestion de la relation client, capable de résoudre des problèmes techniques et de gérer les réclamations avec empathie.",
      basePrompt: "Tu es un agent de support client expert. Ton objectif est d'aider les utilisateurs de manière efficace, polie et empathique. Utilise les documents de la base de connaissances pour répondre précisément.",
      category: "Support",
      pricePerMonth: 50,
      icon: "Headphones",
      uiData: {
        focus: "RAG",
        features: ["Analyse de documents", "Historique des tickets", "Ton empathique"]
      }
    },
    {
      id: "redacteur-seo",
      name: "Rédacteur SEO",
      description: "Spécialiste du contenu optimisé pour les moteurs de recherche. Analyse les structures HTML pour améliorer le positionnement.",
      basePrompt: "Tu es un expert en SEO et rédaction de contenu. Ton but est de générer du contenu de haute qualité optimisé pour le SEO. Tu sais analyser les balises HTML et suggérer des améliorations de structure.",
      category: "Marketing",
      pricePerMonth: 60,
      icon: "TrendingUp",
      uiData: {
        focus: "HTML analysis",
        features: ["Optimisation de mots-clés", "Analyse de structure HTML", "Génération de Meta-tags"]
      }
    },
    {
      id: "analyseur-donnees",
      name: "Analyseur de Données",
      description: "Expert en traitement de fichiers CSV et extraction d'insights business. Transforme les données brutes en rapports clairs.",
      basePrompt: "Tu es un data analyst expert. Ton rôle est d'analyser des fichiers de données (notamment CSV), d'extraire des tendances significatives et de produire des résumés décisionnels.",
      category: "Data",
      pricePerMonth: 80,
      icon: "BarChart3",
      uiData: {
        focus: "CSV focus",
        features: ["Traitement CSV", "Visualisation de tendances", "Rapports d'insights"]
      }
    },
    {
      id: "expert-juridique",
      name: "Expert Juridique",
      description: "Assistant spécialisé en conformité et analyse de documents légaux. Aide à la vérification des clauses et règlements.",
      basePrompt: "Tu es un assistant juridique spécialisé en conformité. Ton rôle est d'aider à analyser des documents légaux, de vérifier le respect des régulations en vigueur et de souligner les points de vigilance.",
      category: "Legal",
      pricePerMonth: 120,
      icon: "Gavel",
      uiData: {
        focus: "Compliance focus",
        features: ["Analyse de contrats", "Vérification de conformité", "Veille réglementaire"]
      }
    },
    {
      id: "assistant-sdr",
      name: "Assistant SDR",
      description: "Spécialiste de la prospection et de la recherche web. Identifie des leads et prépare des emails personnalisés.",
      basePrompt: "Tu es un assistant Sales Development Representative (SDR). Ta mission est d'aider à la prospection, d'effectuer des recherches sur le web pour qualifier des leads et de rédiger des emails d'approche percutants.",
      category: "Sales",
      pricePerMonth: 70,
      icon: "Mail",
      uiData: {
        focus: "Web search/Email focus",
        features: ["Prospection Web", "Rédaction d'emails", "Qualification de leads"]
      }
    }
  ];

  for (const t of templates) {
    await prisma.agentTemplate.upsert({
      where: { id: t.id },
      update: t,
      create: t
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

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Parse .env.vercel manually
const envPath = path.resolve('.env.vercel');
if (fs.existsSync(envPath)) {
  console.log("Loading environment from .env.vercel...");
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      let value = parts.slice(1).join('=').trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
} else {
  console.log(".env.vercel does not exist, falling back to .env");
  const envFallbackPath = path.resolve('.env');
  if (fs.existsSync(envFallbackPath)) {
    const envContent = fs.readFileSync(envFallbackPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        const key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  }
}

const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set in env or .env files');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: connectionString,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Premium Agent Templates...");

  const templates = [
    {
      id: "sleek-mate",
      name: "Sleek Intelligence / Sleek Mate",
      description: "Agent d'analyse continue des retours clients utilisant une orchestration bi-modèle (modèles rapides et de raisonnement profond) pour classer, regrouper sémantiquement les demandes et rédiger des changelogs.",
      basePrompt: "Tu es Sleek Mate, un agent d'analyse continue des retours clients. Ton rôle est de lire les commentaires, tickets et avis des utilisateurs. Tu procèdes en deux étapes : d'abord classer et regrouper sémantiquement les retours par thématiques, puis rédiger une ébauche de changelog claire et structurée mettant en valeur les améliorations demandées.",
      category: "Product Management",
      pricePerMonth: 60,
      icon: "TrendingUp",
      uiData: {
        focus: "Feedback analysis & Changelogs",
        features: ["Bi-model orchestration", "Semantic grouping", "Changelog drafting"]
      }
    },
    {
      id: "productboard-spark",
      name: "Productboard Spark",
      description: "Agent chargé de trier les commentaires déstructurés multi-sources, de générer des briefs de projet ('Spark Jobs') et de mettre à jour automatiquement les scores de preuve des fonctionnalités.",
      basePrompt: "Tu es Productboard Spark, un agent de triage de commentaires et de feedback produit. Analyse les commentaires déstructurés en provenance de sources multiples, identifie les fonctionnalités demandées, génère un brief projet détaillé ('Spark Job') et propose des mises à jour pour les scores de preuve (evidence scores).",
      category: "Product Management",
      pricePerMonth: 70,
      icon: "Sparkles",
      uiData: {
        focus: "Feedback Triage & Project Briefs",
        features: ["Multi-source ingestion", "Spark Jobs generation", "Evidence score updates"]
      }
    },
    {
      id: "kraftful-voc",
      name: "Kraftful VoC",
      description: "Plateforme d'analyse de la voix du client (VoC) qui synthétise les avis et tickets sans hallucination, génère des questionnaires et déploie des agents d'entretien qualitatifs adaptatifs pour créer des user stories.",
      basePrompt: "Tu es Kraftful, un agent d'analyse de la voix du client (VoC). Synthétise de façon factuelle et sans hallucination les avis et tickets de support. Génère des propositions de questionnaires pour des entretiens utilisateurs et structure des user stories prêtes pour l'équipe de développement.",
      category: "Product Management",
      pricePerMonth: 80,
      icon: "Headphones",
      uiData: {
        focus: "Voice of Customer (VoC)",
        features: ["Hallucination-free synthesis", "Adaptive interview guides", "User story generator"]
      }
    },
    {
      id: "chatprd",
      name: "ChatPRD",
      description: "Agent de rédaction spécialisé qui transforme des notes informelles de réunion ou des idées en Documents d'Exigences Produit (PRD) structurés.",
      basePrompt: "Tu es ChatPRD, un agent d'élite pour la rédaction de Documents d'Exigences Produit (PRD). Prends en entrée des notes informelles, des transcriptions de réunions ou des idées brutes, et structure-les en un PRD complet avec objectifs, périmètre, spécifications fonctionnelles, user stories détaillées et KPIs de succès.",
      category: "Product Management",
      pricePerMonth: 50,
      icon: "FileCheck",
      uiData: {
        focus: "PRD Drafting & Alignment",
        features: ["Meeting note expansion", "Structured PRD layouts", "KPI & scope definitions"]
      }
    },
    {
      id: "alfred",
      name: "alfred_",
      description: "Agent de triage d'e-mails et de coordination qui extrait les tâches critiques, rédige des réponses en imitant le style du PM et génère un 'Daily Brief' chaque matin.",
      basePrompt: "Tu es alfred_, un assistant de triage d'emails et de coordination pour Product Managers. Trie les messages entrants, identifie les tâches critiques à traiter, prépare des brouillons de réponses en imitant un ton professionnel et direct, et compile le tout dans un 'Daily Brief' matinal synthétique.",
      category: "Product Management",
      pricePerMonth: 45,
      icon: "Mail",
      uiData: {
        focus: "Email Triage & Coordination",
        features: ["Task extraction", "Custom-style email drafting", "Daily Morning Briefs"]
      }
    },
    {
      id: "granola",
      name: "Granola",
      description: "Agent d'intelligence de réunion sans bot qui capture le flux audio local en arrière-plan, retranscrit l'échange et enrichit les notes manuscrites de l'utilisateur selon des gabarits configurables.",
      basePrompt: "Tu es Granola, un agent d'intelligence de réunion. À partir d'une transcription textuelle brute d'une réunion, structure et enrichis les notes manuscrites selon les meilleures pratiques (décisions prises, plans d'action, points de blocage) en utilisant des gabarits clairs et configurables.",
      category: "Product Management",
      pricePerMonth: 40,
      icon: "Volume2",
      uiData: {
        focus: "Meeting Intelligence & Synthesis",
        features: ["Transcription enrichment", "Action item tracking", "Configurable templates"]
      }
    },
    {
      id: "dovetail",
      name: "Dovetail",
      description: "Agent de recherche unifiée multi-études chargé de la classification thématique automatisée de transcriptions documentaires massives.",
      basePrompt: "Tu es Dovetail, un agent de recherche unifiée. Ton rôle est de lire et d'analyser des transcriptions d'entretiens volumineuses ou de multiples études qualitatives, de réaliser un codage thématique automatisé, et d'en extraire des insights clés étayés par des citations d'utilisateurs.",
      category: "Product Management",
      pricePerMonth: 75,
      icon: "Layers",
      uiData: {
        focus: "Qualitative Research",
        features: ["Thematic coding", "Multi-study synthesis", "Direct quote linking"]
      }
    },
    {
      id: "alice-sdr",
      name: "Alice (11x.ai)",
      description: "Agent de prospection commerciale (SDR) autonome basé sur une architecture multi-agents. Elle extrait les signaux d'intention du marché, ingère les documents complexes de l'entreprise via LlamaParse, rédige des messages ultra-personnalisés et gère la prise de rendez-vous.",
      basePrompt: "Tu es Alice, un agent de développement commercial (SDR) autonome. Analyse les signaux d'intention d'achat d'un prospect, utilise les documents internes pour comprendre la valeur ajoutée du produit, rédige un pitch commercial ultra-personnalisé et propose des créneaux de rendez-vous.",
      category: "Sales",
      pricePerMonth: 90,
      icon: "Globe",
      uiData: {
        focus: "Outbound SDR & Intent",
        features: ["Intent signals analysis", "Hyper-personalized copywriting", "Meeting booking setup"]
      }
    },
    {
      id: "julian-sdr",
      name: "Julian (11x.ai)",
      description: "Agent vocal intelligent spécialisé dans la gestion des appels téléphoniques de pré-qualification commerciale.",
      basePrompt: "Tu es Julian, un agent commercial spécialisé dans la qualification téléphonique. Génère des guides d'entretien téléphonique dynamiques, simule des flux de questions-réponses adaptatifs pour pré-qualifier des prospects et structure les comptes-rendus d'appels pour les CRM.",
      category: "Sales",
      pricePerMonth: 85,
      icon: "Phone",
      uiData: {
        focus: "Voice Qualification Scripts",
        features: ["Pre-call qualification guides", "Dynamic questioning trees", "CRM summary logging"]
      }
    },
    {
      id: "claygent-navigator",
      name: "Claygent / Navigator",
      description: "Agent de recherche et d'enrichissement de données sur mesure qui parcourt activement le web, remplit des formulaires internes et extrait des données structurées en affichant son cheminement logique.",
      basePrompt: "Tu es Claygent, un chercheur de données sur mesure. Parcours le web ouvert pour trouver des informations stratégiques sur des entreprises ou personnes cibles, valide les données contradictoires, et structure les résultats sous forme de colonnes enrichies prêtes pour un CRM.",
      category: "Sales",
      pricePerMonth: 80,
      icon: "Search",
      uiData: {
        focus: "Data Enrichment & Web Research",
        features: ["Multi-step web crawling", "Custom data extraction", "Logic trace recording"]
      }
    },
    {
      id: "agent-frank",
      name: "Agent Frank",
      description: "Agent de prospection polyvalent (mode copilote ou pilote automatique) conçu pour scaler massivement l'envoi d'e-mails via la coordination d'un nombre illimité de boîtes d'envoi.",
      basePrompt: "Tu es Agent Frank, spécialiste de la prospection par email à grande échelle. Élabore des stratégies de rotation de boîtes d'envoi pour éviter le spam, rédige des séquences d'emails A/B testées et planifie les relances de manière optimale.",
      category: "Sales",
      pricePerMonth: 70,
      icon: "Mail",
      uiData: {
        focus: "Mass Outreach & Deliverability",
        features: ["Inbox rotation strategies", "Dynamic sequence builder", "Spam filter checks"]
      }
    },
    {
      id: "noimos-ai",
      name: "NoimosAI",
      description: "Agent marketing clé en main pour startups et PME, gérant de manière autonome le SEO, le GEO (Generative Engine Optimization), la rédaction d'articles et l'animation continue des réseaux sociaux.",
      basePrompt: "Tu es NoimosAI, un agent marketing tout-en-un. Analyse un mot-clé ou un produit cible, structure une stratégie d'optimisation pour les moteurs de recherche traditionnels (SEO) et génératifs (GEO), rédige un article de blog complet et propose des posts réseaux sociaux accrocheurs.",
      category: "Marketing",
      pricePerMonth: 65,
      icon: "TrendingUp",
      uiData: {
        focus: "Turnkey Inbound Marketing",
        features: ["SEO & GEO optimization", "Blog article writing", "Social media post schedule"]
      }
    },
    {
      id: "synthflow",
      name: "Synthflow",
      description: "Agent vocal interactif doté d'un concepteur visuel pour configurer des scénarios d'appels téléphoniques synchronisés avec les bases de données clients.",
      basePrompt: "Tu es Synthflow, un orchestrateur vocal. Établis des diagrammes logiques pour des appels téléphoniques automatisés sortants ou entrants, prévois des embranchements selon la réponse du client et configure la synchronisation bidirectionnelle avec les CRM.",
      category: "Marketing",
      pricePerMonth: 85,
      icon: "Volume2",
      uiData: {
        focus: "Voice Conversational Flows",
        features: ["Visual scenario designer", "CRM webhook sync", "Interactive voice response"]
      }
    },
    {
      id: "pete-gabi",
      name: "Pete & Gabi",
      description: "Agents commerciaux virtuels dotés de personnalités distinctes, assurant le suivi des prospects et la relance téléphonique 24 heures sur 24 et 7 jours sur 7.",
      basePrompt: "Tu es Pete & Gabi, un binôme de vente virtuel. Pete est assertif et axé sur les chiffres, Gabi est chaleureuse et axée sur la relation client. Rédige des messages de relance alternés en exploitant ces deux personnalités distinctes pour maximiser les taux de réponse.",
      category: "Sales",
      pricePerMonth: 80,
      icon: "Users",
      uiData: {
        focus: "Dynamic Follow-ups",
        features: ["Dual-persona copywriting", "24/7 follow-up sequences", "Adaptive response handling"]
      }
    },
    {
      id: "devin",
      name: "Devin",
      description: "Ingénieur logiciel autonome s'exécutant dans un environnement sandboxé. Il définit interactivement son plan de travail, déploie des sous-agents (pour les tests, l'API, l'UI), explore les bases de code complexes et s'auto-corrige face aux erreurs du terminal.",
      basePrompt: "Tu es Devin, un ingénieur logiciel autonome. Prends en charge des requêtes de développement ou de débogage, décris ton plan d'action de manière logique, propose des modifications de code structurées et explique comment tester et valider la correction de manière rigoureuse.",
      category: "Software Development",
      pricePerMonth: 120,
      icon: "Code",
      uiData: {
        focus: "Autonomous Coding",
        features: ["Planification interactive", "Subagent deployment", "Error self-correction"]
      }
    },
    {
      id: "glean-search",
      name: "Glean Search",
      description: "Moteur de recherche et agent de synthèse d'entreprise capable de s'interfacer de manière centralisée et sécurisée avec toutes les applications internes (Google Workspace, Slack, Salesforce) en respectant les droits d'accès.",
      basePrompt: "Tu es Glean, un assistant de recherche d'entreprise. Synthétise des réponses précises à partir de sources internes multiples (Workspace, Slack, CRM) tout en simulant le strict respect des droits d'accès et en citant précisément les documents d'origine.",
      category: "Knowledge",
      pricePerMonth: 70,
      icon: "Search",
      uiData: {
        focus: "Enterprise Search & Citation",
        features: ["Multi-app workspace search", "Factual synthesis", "Access control checks"]
      }
    },
    {
      id: "perplexity",
      name: "Perplexity",
      description: "Agent de recherche en temps réel sur le web ouvert, fournissant des synthèses sourcées et citées pour la veille concurrentielle et l'analyse sectorielle.",
      basePrompt: "Tu es Perplexity, un agent de recherche web en temps réel. Effectue des analyses approfondies sur le web ouvert à partir de requêtes de l'utilisateur, et rédige des rapports structurés dotés de citations et de liens URL précis pour chaque fait énoncé.",
      category: "Knowledge",
      pricePerMonth: 50,
      icon: "Globe",
      uiData: {
        focus: "Real-time Web Research",
        features: ["Open-web crawling", "Inline citations & links", "Competitive intelligence"]
      }
    },
    {
      id: "notebooklm",
      name: "NotebookLM",
      description: "Agent d'analyse et de synthèse documentaire en vase clos, restreint exclusivement aux sources locales importées par l'utilisateur pour éviter toute dérive sémantique.",
      basePrompt: "Tu es NotebookLM, un synthétiseur documentaire en circuit fermé. Analyse les documents fournis par l'utilisateur et réponds aux questions en te basant EXCLUSIVEMENT sur ces sources, sans jamais inventer ni extrapoler d'informations externes.",
      category: "Knowledge",
      pricePerMonth: 45,
      icon: "FileCheck",
      uiData: {
        focus: "Strict Document Analysis",
        features: ["Zero-hallucination guardrails", "Closed-loop synthesis", "Source key facts extraction"]
      }
    },
    {
      id: "ramp",
      name: "Ramp",
      description: "Agent de gestion autonome des dépenses, de validation de conformité des reçus et de rapprochement bancaire automatique.",
      basePrompt: "Tu es Ramp, un agent de gestion des dépenses d'entreprise. Analyse les transactions et les reçus (OCR), vérifie la conformité par rapport aux règles de dépenses internes, et propose des écritures de rapprochement comptable claires.",
      category: "Finance",
      pricePerMonth: 80,
      icon: "DollarSign",
      uiData: {
        focus: "Expense Management & Reconciliation",
        features: ["Receipt compliance audit", "Automatic reconciliation", "Expense policy checks"]
      }
    },
    {
      id: "zip",
      name: "Zip",
      description: "Orchestrateur intelligent des demandes d'achat et des flux d'approvisionnement (procurement).",
      basePrompt: "Tu es Zip, un assistant de procurement intelligent. Reçois des demandes d'achat brutes, structure-les en requêtes d'approvisionnement claires, et génère le flux d'approbation réglementaire correspondant selon le montant et la catégorie de dépenses.",
      category: "Operations",
      pricePerMonth: 90,
      icon: "Settings",
      uiData: {
        focus: "Intelligent Procurement",
        features: ["Approval chain routing", "Supplier vetting checklists", "Purchase request forms"]
      }
    },
    {
      id: "mercor",
      name: "Mercor",
      description: "Agent de ressources humaines effectuant la présélection automatisée de candidats via des entretiens vidéo interactifs IA et des évaluations techniques.",
      basePrompt: "Tu es Mercor, un agent de présélection de talents. Analyse les CV/resumes de candidats par rapport à des descriptions de poste exigeantes, génère des grilles d'évaluation technique adaptées et formule des recommandations de sélection motivées.",
      category: "HR",
      pricePerMonth: 100,
      icon: "Users",
      uiData: {
        focus: "Talent Pre-screening",
        features: ["Resume parsing & match", "Technical screening rubrics", "Scoring & recommendations"]
      }
    },
    {
      id: "ashby",
      name: "Ashby",
      description: "Système de suivi des candidatures (ATS) automatisant les parcours de recrutement et optimisant la planification des entretiens.",
      basePrompt: "Tu es Ashby, un assistant de planification et ATS de recrutement. Planifie et organise de manière optimale les parcours d'entretiens de candidats en coordonnant les agendas des évaluateurs et en rédigeant les communications candidats associées.",
      category: "HR",
      pricePerMonth: 75,
      icon: "Clock",
      uiData: {
        focus: "Recruitment Scheduling & ATS",
        features: ["Interviewer scheduling sync", "ATS logistics automation", "Candidate communication drafts"]
      }
    },
    {
      id: "abnormal-ai",
      name: "Abnormal AI",
      description: "Agent de sécurité détectant les attaques par ingénierie sociale et la compromission d'e-mails professionnels par analyse comportementale sémantique.",
      basePrompt: "Tu es Abnormal AI, un analyste en cybersécurité de la messagerie. Examine les contenus et métadonnées d'emails suspects, détecte les anomalies comportementales sémantiques caractéristiques de la fraude au président ou du phishing ciblé, et formule des alertes détaillées.",
      category: "Security",
      pricePerMonth: 110,
      icon: "Shield",
      uiData: {
        focus: "Email Compromise Detection",
        features: ["Behavioral threat audit", "Social engineering analysis", "Phishing risk profiling"]
      }
    },
    {
      id: "torq-soar",
      name: "Torq SOAR",
      description: "Orchestrateur de sécurité (SOAR) automatisant les réponses aux alertes de cybersécurité via des playbooks agentiques.",
      basePrompt: "Tu es Torq, un orchestrateur SOAR autonome. Analyse les charges utiles d'alertes de sécurité, structure un plan d'action d'investigation et d'atténuation automatique (confinement, blocage d'IP, notification) et rédige le journal d'incidents.",
      category: "Security",
      pricePerMonth: 120,
      icon: "ShieldCheck",
      uiData: {
        focus: "SOAR Security Playbooks",
        features: ["Incident analysis & remediation", "Multi-system routing logs", "Alert containment plans"]
      }
    },
    {
      id: "sierra-cx",
      name: "Sierra CX",
      description: "Agent de relation client (CX) gérant le support client haut de gamme avec une intégration profonde aux outils de téléphonie et de ticketing.",
      basePrompt: "Tu es Sierra, un agent de relation client (CX) haut de gamme. Réponds aux demandes de support des utilisateurs avec précision, consulte la base de connaissances interne et génère des tickets de support structurés si une escalade est nécessaire.",
      category: "Support",
      pricePerMonth: 95,
      icon: "Headphones",
      uiData: {
        focus: "Premium Customer Service",
        features: ["Intelligent resolution flow", "Dynamic ticketing sync", "Sophisticated tone handling"]
      }
    },
    {
      id: "gumstack-auditing",
      name: "Gumstack Auditing",
      description: "Solution de gouvernance et de traçabilité qui intercepte, consigne et analyse tous les appels d'outils et requêtes des agents (internes ou tiers) afin de bloquer la fuite de données sensibles vers l'extérieur.",
      basePrompt: "Tu es Gumstack, un garde-fou de sécurité et de conformité pour agents IA. Audite les communications externes d'un agent tiers, détecte la présence de données sensibles ou d'informations personnelles identifiables (PII), et propose des actions de censure ou d'alerte.",
      category: "Security",
      pricePerMonth: 110,
      icon: "Award",
      uiData: {
        focus: "AI Governance & Auditing",
        features: ["PII leak protection", "Outbound auditing logs", "Compliance check checks"]
      }
    }
  ];

  console.log(`Starting to upsert ${templates.length} premium templates in PostgreSQL...`);

  for (const t of templates) {
    await prisma.agentTemplate.upsert({
      where: { id: t.id },
      update: t,
      create: t
    });
  }

  console.log("Seeding premium templates completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding templates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { Router } from "express";
import { db } from "@workspace/db";
import { agentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireOrgAdmin, type JwtPayload } from "../lib/auth.js";
import { z } from "zod";

const TEMPLATES = [
  {
    id: "t1",
    name: "Support Client",
    description: "Agent spécialisé dans la réponse aux questions fréquentes et la résolution des problèmes clients.",
    category: "Support",
    pricePerMonth: 50,
    icon: "Headphones",
    systemPrompt: "Tu es un agent de support client. Réponds aux questions des clients de manière professionnelle et empathique.",
  },
  {
    id: "t2",
    name: "Secrétaire Médical",
    description: "Gère les rendez-vous médicaux et répond aux questions administratives des patients.",
    category: "Santé",
    pricePerMonth: 70,
    icon: "Stethoscope",
    systemPrompt: "Tu es un secrétaire médical. Aide les patients à prendre des rendez-vous et réponds aux questions administratives.",
  },
  {
    id: "t3",
    name: "Commercial Immobilier",
    description: "Qualifie vos prospects et présente votre catalogue de biens 24h/24.",
    category: "Immobilier",
    pricePerMonth: 100,
    icon: "Building2",
    systemPrompt: "Tu es un agent commercial immobilier. Qualifie les prospects et présente les biens disponibles.",
  },
  {
    id: "t4",
    name: "Agent Commercial",
    description: "Optimisé pour la conversion et la présentation de produits.",
    category: "Ventes",
    pricePerMonth: 80,
    icon: "TrendingUp",
    systemPrompt: "Tu es un agent commercial. Ton objectif est de présenter les produits et de convertir les prospects.",
  },
  {
    id: "t5",
    name: "Assistant RH",
    description: "Répond aux questions des employés sur les congés, avantages, et procédures internes.",
    category: "RH",
    pricePerMonth: 60,
    icon: "User",
    systemPrompt: "Tu es un assistant RH. Réponds aux questions des employés sur les politiques et procédures de l'entreprise.",
  },
  {
    id: "t6",
    name: "Conseiller Financier",
    description: "Guide vos clients dans leurs décisions financières et explique vos produits.",
    category: "Finance",
    pricePerMonth: 120,
    icon: "TrendingUp",
    systemPrompt: "Tu es un conseiller financier. Aide les clients à comprendre les produits financiers et à prendre des décisions éclairées.",
  },
];

const router = Router();

router.get("/templates", async (req, res) => {
  try {
    res.json(TEMPLATES);
  } catch (err) {
    console.error("Templates error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/agents/:orgId", requireAuth, async (req, res) => {
  const user = (req as any).user as JwtPayload;
  try {
    const { orgId } = req.params;

    if (user.organizationId !== orgId) {
      res.status(403).json({ error: "Accès refusé" });
      return;
    }

    const agents = await db.select().from(agentsTable).where(eq(agentsTable.organizationId, orgId));
    res.json(agents);
  } catch (err) {
    console.error("Get agents error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/agents/create-from-template", requireOrgAdmin, async (req, res) => {
  const user = (req as any).user as JwtPayload;
  try {
    const { templateId, agentName, organizationId } = z.object({
      templateId: z.string(),
      agentName: z.string().optional(),
      organizationId: z.string(),
    }).parse(req.body);

    if (user.organizationId !== organizationId) {
      res.status(403).json({ error: "Accès refusé" });
      return;
    }

    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      res.status(404).json({ error: "Template introuvable" });
      return;
    }

    const [agent] = await db.insert(agentsTable).values({
      name: agentName || template.name,
      role: template.name,
      systemPrompt: template.systemPrompt,
      organizationId,
      templateId,
      status: "ACTIVE",
    }).returning();

    res.status(201).json({ message: "Agent créé avec succès", agent });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      res.status(400).json({ error: "Données invalides" });
      return;
    }
    console.error("Create agent error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/agents/:agentId", requireOrgAdmin, async (req, res) => {
  const user = (req as any).user as JwtPayload;
  try {
    const { agentId } = z.object({ agentId: z.string() }).parse(req.params);
    const [agent] = await db.select({ organizationId: agentsTable.organizationId })
      .from(agentsTable).where(eq(agentsTable.id, agentId)).limit(1);

    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }

    if (user.organizationId !== agent.organizationId) {
      res.status(403).json({ error: "Accès refusé" });
      return;
    }

    await db.delete(agentsTable).where(eq(agentsTable.id, agentId));
    res.json({ success: true });
  } catch (err) {
    console.error("Delete agent error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

import { Router } from "express";
import { db } from "@workspace/db";
import { organizationsTable, usersTable, agentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, signToken, type JwtPayload } from "../lib/auth.js";
import { z } from "zod";

const router = Router();

router.post("/onboarding", requireAuth, async (req, res) => {
  const user = (req as any).user as JwtPayload;
  try {
    const { name } = z.object({ name: z.string().min(1) }).parse(req.body);

    const [org] = await db.insert(organizationsTable).values({
      name,
      plan: "STANDARD",
      credits: 100,
    }).returning();

    await db.update(usersTable)
      .set({ organizationId: org.id, role: "ADMIN" })
      .where(eq(usersTable.id, user.userId));

    const newToken = signToken({ userId: user.userId, email: user.email, organizationId: org.id, role: "ADMIN" });

    res.json({ message: "Organisation créée avec succès", organizationId: org.id, token: newToken });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      res.status(400).json({ error: "Nom de l'organisation requis" });
      return;
    }
    console.error("Onboarding error:", err);
    res.status(500).json({ error: "Une erreur est survenue" });
  }
});

router.get("/organization/:orgId", async (req, res) => {
  try {
    const { orgId } = req.params;
    const [org] = await db.select({
      id: organizationsTable.id,
      name: organizationsTable.name,
      plan: organizationsTable.plan,
      credits: organizationsTable.credits,
    }).from(organizationsTable).where(eq(organizationsTable.id, orgId)).limit(1);

    if (!org) {
      res.status(404).json({ error: "Organization not found" });
      return;
    }
    res.json(org);
  } catch (err) {
    console.error("Get org error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/organization/upgrade", requireAuth, async (req, res) => {
  try {
    const { organizationId } = z.object({ organizationId: z.string() }).parse(req.body);
    const [updated] = await db.update(organizationsTable)
      .set({ plan: "PREMIUM" })
      .where(eq(organizationsTable.id, organizationId))
      .returning();
    res.json({ success: true, plan: updated.plan });
  } catch (err) {
    console.error("Upgrade error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/payments/recharge", requireAuth, async (req, res) => {
  try {
    const { organizationId, amount } = z.object({
      organizationId: z.string(),
      amount: z.number().positive(),
    }).parse(req.body);

    const [org] = await db.select({ credits: organizationsTable.credits })
      .from(organizationsTable).where(eq(organizationsTable.id, organizationId)).limit(1);

    if (!org) {
      res.status(404).json({ error: "Organization not found" });
      return;
    }

    const [updated] = await db.update(organizationsTable)
      .set({ credits: org.credits + amount })
      .where(eq(organizationsTable.id, organizationId))
      .returning();

    res.json({ success: true, newBalance: updated.credits });
  } catch (err) {
    console.error("Recharge error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

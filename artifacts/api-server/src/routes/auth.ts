import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, hashPassword, comparePassword } from "../lib/auth.js";
import { z } from "zod";

const router = Router();

const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/register", async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, body.email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Cet email est déjà utilisé" });
      return;
    }
    const hashedPassword = await hashPassword(body.password);
    const [user] = await db.insert(usersTable).values({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: "USER",
    }).returning();
    const token = signToken({
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    });
    res.status(201).json({ message: "Utilisateur créé avec succès", token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      res.status(400).json({ error: "Données invalides", details: err.errors });
      return;
    }
    console.error("Register error:", err);
    res.status(500).json({ error: "Une erreur est survenue lors de l'inscription" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, body.email)).limit(1);
    if (!user || !user.password) {
      res.status(401).json({ error: "Email ou mot de passe incorrect" });
      return;
    }
    const valid = await comparePassword(body.password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Email ou mot de passe incorrect" });
      return;
    }
    const token = signToken({
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, organizationId: user.organizationId } });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      res.status(400).json({ error: "Données invalides", details: err.errors });
      return;
    }
    console.error("Login error:", err);
    res.status(500).json({ error: "Une erreur est survenue lors de la connexion" });
  }
});

export default router;

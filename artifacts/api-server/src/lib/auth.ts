import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";

function getJwtSecret(): string {
  const secret = process.env["JWT_SECRET"];
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is required but was not set. " +
      "Set it to a long random string before starting the server."
    );
  }
  return secret;
}

export interface JwtPayload {
  userId: string;
  email: string;
  organizationId?: string | null;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Non autorisé" });
    return;
  }
  try {
    const token = auth.slice(7);
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token invalide" });
  }
}

export function requireOrgAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Non autorisé" });
    return;
  }
  try {
    const token = auth.slice(7);
    const payload = verifyToken(token);
    (req as any).user = payload;
    if (payload.role !== "ADMIN") {
      res.status(403).json({ error: "Accès réservé aux administrateurs" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: "Token invalide" });
  }
}

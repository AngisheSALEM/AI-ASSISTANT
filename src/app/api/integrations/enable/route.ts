import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Notez les accolades {}
import { z } from "zod";

const enableIntegrationSchema = z.object({
  type: z.enum(["TELEGRAM", "WHATSAPP", "GOOGLE_CALENDAR"]),
  credentials: z.record(z.unknown()),
  organizationId: z.string(),
});

interface ExtendedUserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  organizationId?: string | null;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userSession = session?.user as ExtendedUserSession | undefined;

    if (!userSession?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = enableIntegrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { type, credentials, organizationId } = validation.data;

    // Vérifier que l'utilisateur appartient à l'organisation
    const user = await prisma.user.findUnique({
      where: { id: userSession.id },
      select: { organizationId: true, role: true },
    });

    if (!user || user.organizationId !== organizationId) {
      return NextResponse.json(
        { error: "Forbidden: You don't have access to this organization" },
        { status: 403 }
      );
    }

    // Mock de validation de token selon le type
    const isTokenValid = await mockVerifyToken(type, credentials);
    if (!isTokenValid) {
      return NextResponse.json(
        { error: `Invalid credentials for ${type}` },
        { status: 400 }
      );
    }

    // Sauvegarder ou mettre à jour l'intégration
    // Note: On pourrait utiliser upsert si on avait un index unique sur [type, organizationId]
    // Pour rester robuste sans changer les index du schéma, on utilise findFirst + update/create
    const existingIntegration = await prisma.integration.findFirst({
      where: {
        type,
        organizationId,
      },
      select: { id: true }
    });

    const data = {
      type,
      credentials: credentials as any, // Prisma accepts any for Json fields
      organizationId,
      isActive: true,
    };

    const result = existingIntegration
      ? await prisma.integration.update({
          where: { id: existingIntegration.id },
          data: { credentials: data.credentials, isActive: true },
        })
      : await prisma.integration.create({ data });

    return NextResponse.json({
      success: true,
      integration: result,
    });
  } catch (error) {
    console.error("Integration enable error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Simule la vérification d'un token auprès d'un service tiers.
 */
async function mockVerifyToken(type: string, _credentials: unknown): Promise<boolean> {
  console.log(`Verifying ${type} credentials...`);
  // Dans une vraie implémentation, on ferait un fetch() ici vers l'API concernée
  return true;
}

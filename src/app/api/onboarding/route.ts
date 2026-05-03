import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Notez les accolades {}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Nom de l'entreprise requis" }, { status: 400 });
    }

    // Créer l'organisation
    const organization = await prisma.organization.create({
      data: {
        name,
        users: {
          connect: { id: (session.user as any).id }
        }
      }
    });

    // Mettre à jour l'utilisateur pour qu'il soit ADMIN par défaut de son organisation
    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        role: "ADMIN",
        organizationId: organization.id
      }
    });

    return NextResponse.json({
      message: "Organisation créée avec succès",
      organizationId: organization.id
    });
  } catch (error) {
    console.error("Erreur onboarding:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Notez les accolades {}

export async function POST(req: Request) {
  try {
    const { organizationId, amount, method } = await req.json();

    if (!organizationId || !amount || !method) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    // Simulation d'appel API FlexPay / M-Pesa
    console.log(`Processing payment of ${amount} for org ${organizationId} via ${method}`);

    // On simule une réussite immédiate pour cette version
    const updatedOrg = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        credits: {
          increment: amount,
        },
      },
    });

    return NextResponse.json({
      success: true,
      newBalance: updatedOrg.credits,
      message: `Votre solde a été rechargé de ${amount} crédits.`
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Erreur lors du paiement" }, { status: 500 });
  }
}

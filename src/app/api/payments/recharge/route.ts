import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { organizationId, amount } = await req.json();

    if (!organizationId || !amount) {
      return NextResponse.json({ error: "Missing organizationId or amount" }, { status: 400 });
    }

    // Simulation de validation de paiement locale (FlexPay/M-Pesa)
    // En production, on vérifierait ici le statut du paiement via un webhook de la passerelle.
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
    });
  } catch (error) {
    console.error("Payment recharge error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Route Cron pour la réconciliation automatique des paiements.
 * Analyse les transactions récentes pour détecter d'éventuels doublons
 * causés par des micro-coupures réseau à Kinshasa et déclenche des
 * remboursements automatiques.
 */
export async function GET(req: Request) {
  try {
    // Vérification de sécurité optionnelle pour Vercel Cron
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer toutes les transactions réussies des dernières 2 heures
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    const successfulIntents = await prisma.paymentIntent.findMany({
      where: {
        status: "SUCCESS",
        createdAt: {
          gte: twoHoursAgo,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const reconciled: any[] = [];
    const processedKeys = new Set<string>();

    for (let i = 0; i < successfulIntents.length; i++) {
      const current = successfulIntents[i];
      if (processedKeys.has(current.id)) continue;

      // Chercher des doublons potentiels : même organisation, même montant, et écart < 5 minutes
      const duplicates = successfulIntents.filter((other) => {
        if (other.id === current.id) return false;
        if (other.organizationId !== current.organizationId) return false;
        if (other.amount !== current.amount) return false;

        const timeDiff = Math.abs(other.createdAt.getTime() - current.createdAt.getTime());
        const minutesDiff = timeDiff / (1000 * 60);
        return minutesDiff <= 5; // moins de 5 minutes d'écart
      });

      if (duplicates.length > 0) {
        // Le premier intent (current) est conservé comme valide.
        // Les autres sont marqués comme doublons à rembourser.
        for (const dup of duplicates) {
          processedKeys.add(dup.id);

          await prisma.$transaction(async (tx) => {
            // 1. Mettre à jour le statut du doublon à REFUNDED
            await tx.paymentIntent.update({
              where: { id: dup.id },
              data: {
                status: "REFUNDED",
              },
            });

            // 2. Déduire les crédits indûment ajoutés de l'organisation
            await tx.organization.update({
              where: { id: dup.organizationId },
              data: {
                credits: {
                  decrement: dup.amount,
                },
              },
            });
          });

          // 3. Simuler l'appel à l'API de remboursement Mobile Money de l'opérateur (M-Pesa/Orange)
          console.log(`[RECONCILIATION] Auto-refund triggered for duplicate transaction ${dup.id} of ${dup.amount} credits for organization ${dup.organizationId}.`);

          // 4. Simuler l'envoi d'une notification WhatsApp de service
          const organization = await prisma.organization.findUnique({
            where: { id: dup.organizationId },
          });

          if (organization && organization.whatsappPhoneNumberId) {
            console.log(`[WHATSAPP NOTIFICATION] Sent to organization ${organization.name} (+243...):
              "Un double paiement a été détecté et remboursé automatiquement. Montant : ${dup.amount} CDF. ID Transaction : ${dup.id}."`);
          }

          reconciled.push({
            originalId: current.id,
            duplicateId: dup.id,
            organizationId: dup.organizationId,
            amount: dup.amount,
          });
        }
      }
      processedKeys.add(current.id);
    }

    return NextResponse.json({
      success: true,
      processedCount: successfulIntents.length,
      reconciledCount: reconciled.length,
      reconciled,
    });
  } catch (error: any) {
    console.error("Critical error in cron payment reconciliation:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

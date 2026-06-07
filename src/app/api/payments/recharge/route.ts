import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint de recharge de crédits pour les organisations (Standard/Free).
 * Implémente un système d'idempotence strict basé sur PostgreSQL pour
 * empêcher les doublons de facturation Mobile Money dus à des clics répétés.
 */
export async function POST(req: Request) {
  try {
    const idempotencyKey = req.headers.get("idempotency-key") || req.headers.get("Idempotency-Key");
    const { organizationId, amount } = await req.json();

    if (!organizationId || !amount) {
      return NextResponse.json({ error: "Missing organizationId or amount" }, { status: 400 });
    }

    // A. Gestion de l'Idempotence (si la clé est fournie)
    if (idempotencyKey) {
      // Rechercher un intent de paiement existant
      const existingIntent = await prisma.paymentIntent.findUnique({
        where: { idempotencyKey },
      });

      if (existingIntent) {
        if (existingIntent.status === "PROCESSING") {
          console.warn(`Duplicate request rejected for idempotencyKey: ${idempotencyKey} (PROCESSING)`);
          return NextResponse.json(
            { error: "La transaction est déjà en cours de traitement. Veuillez patienter." },
            { status: 409 } // Conflict
          );
        }

        if (existingIntent.status === "SUCCESS") {
          console.log(`Idempotent response served for idempotencyKey: ${idempotencyKey} (SUCCESS)`);
          // Renvoyer la réponse stockée précédemment
          return NextResponse.json(
            existingIntent.responseBody || { success: true, message: "Transaction déjà validée." }
          );
        }
      }

      // Enregistrer une nouvelle intention avec état PROCESSING
      // Grâce à la contrainte unique de idempotencyKey, deux requêtes simultanées
      // vont provoquer une exception de base de données à ce niveau sur l'une d'elles.
      try {
        await prisma.paymentIntent.create({
          data: {
            idempotencyKey,
            amount: Number(amount),
            status: "PROCESSING",
            organizationId,
          },
        });
      } catch (dbError: any) {
        // En cas de conflit d'écriture unique (P2002)
        if (dbError.code === "P2002") {
          console.warn(`Concurrent request collision caught for idempotencyKey: ${idempotencyKey}`);
          return NextResponse.json(
            { error: "Transaction concurrente bloquée. Veuillez rafraîchir." },
            { status: 409 }
          );
        }
        throw dbError;
      }
    }

    // B. Exécution de la transaction de crédit
    try {
      let finalResult = null;

      await prisma.$transaction(async (tx) => {
        // Mettre à jour le solde de l'organisation
        const updatedOrg = await tx.organization.update({
          where: { id: organizationId },
          data: {
            credits: {
              increment: Number(amount),
            },
          },
        });

        finalResult = {
          success: true,
          newBalance: updatedOrg.credits,
          message: `Recharge réussie de ${amount} crédits.`,
        };

        // Si idempotence active, mettre à jour le statut à SUCCESS et stocker le résultat
        if (idempotencyKey) {
          await tx.paymentIntent.update({
            where: { idempotencyKey },
            data: {
              status: "SUCCESS",
              responseBody: finalResult,
            },
          });
        }
      });

      return NextResponse.json(finalResult);
    } catch (transactionError: any) {
      console.error("Failed to process transaction credits:", transactionError);

      // Si échec, passer l'intention en FAILED pour permettre de réessayer plus tard
      if (idempotencyKey) {
        await prisma.paymentIntent.update({
          where: { idempotencyKey },
          data: {
            status: "FAILED",
          },
        }).catch((err) => console.error("Failed to mark intent as FAILED:", err));
      }

      return NextResponse.json(
        { error: "Échec du traitement financier. Veuillez réessayer." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Payment recharge error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

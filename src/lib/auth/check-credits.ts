import prisma from "@/lib/prisma";

/**
 * Vérifie si une organisation a suffisamment de crédits.
 */
export async function hasEnoughCredits(organizationId: string, requiredCredits: number = 1): Promise<boolean> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { credits: true },
  });

  return (org?.credits ?? 0) >= requiredCredits;
}

/**
 * Déduit des crédits d'une organisation en utilisant une transaction pour éviter les accès concurrents.
 */
export async function deductCredits(organizationId: string, amount: number) {
  return await prisma.$transaction(async (tx) => {
    const org = await tx.organization.findUnique({
      where: { id: organizationId },
      select: { credits: true },
    });

    if (!org || org.credits < amount) {
      throw new Error("Crédits insuffisants");
    }

    return await tx.organization.update({
      where: { id: organizationId },
      data: {
        credits: {
          decrement: amount,
        },
      },
    });
  });
}

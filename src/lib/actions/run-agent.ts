"use server";

import { prisma } from "@/lib/prisma";
import { deductCredits } from "@/lib/auth/check-credits";
import { revalidatePath } from "next/cache";

interface RunAgentParams {
  organizationId: string;
  agentId: string;
  inputData: Record<string, any>;
  isAutomation?: boolean;
}

/**
 * Rembourse les crédits en cas d'échec réseau ou d'erreur système de n8n.
 */
async function refundCredits(organizationId: string, amount: number) {
  try {
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        credits: {
          increment: amount,
        },
      },
    });
  } catch (error) {
    console.error("Critical error refunding credits for organization:", organizationId, error);
  }
}

/**
 * Lance l'agent IA ou le workflow d'automatisation via le webhook n8n
 * en déduisant les crédits correspondants de manière transactionnelle.
 */
export async function runAgent({
  organizationId,
  agentId,
  inputData,
  isAutomation = false,
}: RunAgentParams) {
  // Déterminer le coût : Automatisation = 1 crédit, Agent IA Expert = 20 crédits
  const requiredCredits = isAutomation ? 1 : 20;

  try {
    // Étape A & B : Déduire les crédits (géré de manière sécurisée par transaction Prisma)
    await deductCredits(organizationId, requiredCredits);
    
    // Revalider le chemin du dashboard pour rafraîchir l'affichage des crédits
    revalidatePath(`/(dashboard)/${organizationId}`);
    revalidatePath(`/(dashboard)/${organizationId}/agents`);
  } catch (error: any) {
    console.error("Failed to deduct credits:", error.message);
    return {
      success: false,
      error: error.message || "Crédits insuffisants ou erreur de transaction.",
    };
  }

  // Étape C : Appel fetch vers n8n
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!n8nWebhookUrl) {
    // Si la variable d'env n'est pas définie, on rembourse
    console.error("N8N_WEBHOOK_URL is not defined in environment variables.");
    await refundCredits(organizationId, requiredCredits);
    return {
      success: false,
      error: "Le serveur d'exécution n8n n'est pas configuré. Crédits remboursés.",
    };
  }

  try {
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/webhook/n8n-callback`;

    // Appel à l'instance dynamique de n8n
    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agencyId: organizationId,
        agentId,
        inputData,
        isAutomation,
        callbackUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n returned status code: ${response.status}`);
    }

    // Étape D : Gérer proprement la réponse JSON ou texte dynamique de n8n
    const contentType = response.headers.get("content-type");
    let resultData: any = null;

    if (contentType && contentType.includes("application/json")) {
      resultData = await response.json();
    } else {
      const text = await response.text();
      try {
        resultData = JSON.parse(text);
      } catch {
        resultData = { message: text };
      }
    }

    return {
      success: true,
      data: resultData,
    };
  } catch (error: any) {
    console.error("Network or execution error triggering n8n webhook:", error);
    
    // Remboursement en cas d'erreur réseau
    await refundCredits(organizationId, requiredCredits);
    revalidatePath(`/(dashboard)/${organizationId}`);
    
    return {
      success: false,
      error: `Erreur d'exécution de l'agent. Les crédits ont été remboursés. Détails : ${error.message || "Échec réseau n8n"}`,
    };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CreatePdaRequestParams {
  organizationId: string;
  nodeId: string;
  nodeName: string;
  description: string;
}

/**
 * Enregistre une demande de Plan Directeur d'Automatisation (PDA)
 * initiée depuis le Blueprint par un client.
 */
export async function createPdaRequest({
  organizationId,
  nodeId,
  nodeName,
  description,
}: CreatePdaRequestParams) {
  try {
    if (!organizationId || !nodeId || !nodeName) {
      throw new Error("Missing required parameters: organizationId, nodeId, or nodeName.");
    }

    // Enregistrer en base de données
    const request = await prisma.auditRequest.create({
      data: {
        nodeId,
        nodeName,
        description: description || "Aucune description fournie.",
        organizationId,
        status: "PENDING",
      },
    });

    console.log(`PDA Audit Request created successfully: ${request.id} for organization: ${organizationId}`);

    // Optionnel : Notification à n8n pour avertir les équipes de Kin-Opere
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      try {
        fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "PDA_AUDIT_REQUESTED",
            agencyId: organizationId,
            data: {
              requestId: request.id,
              nodeId,
              nodeName,
              description,
            },
          }),
        }).catch((err) => console.error("Async trigger to n8n failed for PDA request:", err));
      } catch (err) {
        console.error("Failed to notify n8n about PDA audit request:", err);
      }
    }

    revalidatePath(`/(dashboard)/${organizationId}/blueprint`);
    return {
      success: true,
      requestId: request.id,
    };
  } catch (error: any) {
    console.error("Error creating PDA audit request:", error);
    return {
      success: false,
      error: error.message || "Une erreur est survenue lors de l'enregistrement de votre demande.",
    };
  }
}

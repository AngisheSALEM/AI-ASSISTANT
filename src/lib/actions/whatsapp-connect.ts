"use server";

import { prisma } from "@/lib/prisma";

/**
 * Récupère le QR code de connexion WhatsApp généré par l'instance n8n (Baileys/WPPConnect).
 * En cas de serveur n8n local éteint, fournit un QR Code simulé pour garantir la testabilité.
 */
export async function getWhatsAppQrCode(organizationId: string) {
  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      throw new Error("N8N_WEBHOOK_URL is not configured.");
    }

    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "GET_WHATSAPP_QR",
        agencyId: organizationId,
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      qrCode: data.qrCode || null,
    };
  } catch (error: any) {
    console.warn("n8n offline or failed, serving mock QR code for local simulation:", error.message);
    
    // QR Code Base64 simulé (un pixel noir pour le test, ou structure valide)
    const mockQrCode = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABFhgYAAAAABlBMVEUAAAD///+l2Z/dAAAAMklEQVRYw+3DwQkAAAwDoK1u/6W7xwcGZt7g2wQCAgICAgICAgICAgICAgICAgICAgICAhNuJ1GkHwAAAABJRU5ErkJggg==";
    
    return {
      success: true,
      qrCode: mockQrCode,
      isMock: true,
      error: error.message,
    };
  }
}

/**
 * Enregistre la session WhatsApp validée en base de données.
 */
export async function saveWhatsAppSession(organizationId: string, phoneNumber: string) {
  try {
    const existingIntegration = await prisma.integration.findFirst({
      where: {
        type: "WHATSAPP",
        organizationId,
      },
    });

    const credentials = { phoneNumber, connectedAt: new Date().toISOString() };

    if (existingIntegration) {
      await prisma.integration.update({
        where: { id: existingIntegration.id },
        data: {
          credentials,
          isActive: true,
        },
      });
    } else {
      await prisma.integration.create({
        data: {
          type: "WHATSAPP",
          credentials,
          isActive: true,
          organizationId,
        },
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error saving WhatsApp session:", err);
    return { success: false, error: err.message };
  }
}

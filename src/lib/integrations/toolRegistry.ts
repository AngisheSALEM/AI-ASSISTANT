import { prisma } from "@/lib/prisma"; // Notez les accolades {}
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";

/**
 * Cette fonction interroge Prisma pour récupérer toutes les intégrations actives de l'organisation.
 * Elle retourne un tableau d'outils compatibles avec LangChain (utilisé par le projet).
 */
export async function getAvailableTools(organizationId: string): Promise<DynamicStructuredTool[]> {
  const activeIntegrations = await prisma.integration.findMany({
    where: {
      organizationId,
      isActive: true,
    },
  });

  const tools: DynamicStructuredTool[] = [];

  for (const integration of activeIntegrations) {
    if (integration.type === "TELEGRAM") {
      tools.push(
        new DynamicStructuredTool({
          name: "send_telegram_notification",
          description: "Envoie une notification à un utilisateur ou un canal Telegram.",
          schema: z.object({
            chatId: z.string().describe("L'ID du chat Telegram ou le nom d'utilisateur."),
            message: z.string().describe("Le message à envoyer."),
          }),
          func: async ({ chatId, message }) => {
            // Logique fictive pour l'exemple
            console.log(`Envoi Telegram à ${chatId}: ${message}`);
            return `Message envoyé avec succès à ${chatId} via Telegram.`;
          },
        })
      );
    }

    if (integration.type === "WHATSAPP") {
        tools.push(
            new DynamicStructuredTool({
              name: "send_whatsapp_message",
              description: "Envoie un message WhatsApp à un numéro spécifié.",
              schema: z.object({
                phoneNumber: z.string().describe("Le numéro de téléphone au format international."),
                text: z.string().describe("Le contenu du message."),
              }),
              func: async ({ phoneNumber, text }) => {
                console.log(`Envoi WhatsApp à ${phoneNumber}: ${text}`);
                return `Message WhatsApp envoyé à ${phoneNumber}.`;
              },
            })
          );
    }

    if (integration.type === "GOOGLE_CALENDAR") {
        tools.push(
            new DynamicStructuredTool({
              name: "book_meeting",
              description: "Planifie un rendez-vous dans l'agenda Google.",
              schema: z.object({
                title: z.string().describe("Le titre du rendez-vous."),
                startDateTime: z.string().describe("La date et l'heure de début au format ISO."),
                durationMinutes: z.number().default(30).describe("La durée en minutes."),
              }),
              func: async ({ title, startDateTime, durationMinutes }) => {
                console.log(`Rendez-vous '${title}' planifié le ${startDateTime} pour ${durationMinutes}min.`);
                return `Rendez-vous '${title}' ajouté à Google Calendar.`;
              },
            })
          );
    }
  }

  return tools;
}

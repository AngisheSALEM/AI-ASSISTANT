import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Route d'API sécurisée pour recevoir les callbacks asynchrones depuis n8n.
 * Permet à n8n d'enregistrer des messages, générer des rapports de performance,
 * ajouter des compétences IA (learning loop) ou rembourser des crédits.
 */
export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-api-key");
    const callbackSecret = process.env.N8N_CALLBACK_SECRET;

    // Validation de sécurité si la clé secrète est configurée
    if (callbackSecret && signature !== callbackSecret) {
      console.warn("Unauthorized webhook access attempt with invalid x-api-key");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const { action, agencyId, agentId, data } = payload;

    if (!action || !agencyId) {
      return NextResponse.json(
        { error: "action and agencyId are required fields" },
        { status: 400 }
      );
    }

    console.log(`n8n-callback received action: ${action} for agency: ${agencyId}`);

    // Résolution de l'identifiant d'organisation (compatibilité agencyId / organizationId)
    const organizationId = agencyId;

    switch (action) {
      case "SAVE_MESSAGE": {
        const { content, role = "assistant", uiType, uiData, conversationId } = data || {};

        if (!content && !uiData) {
          return NextResponse.json({ error: "Message content or uiData is required" }, { status: 400 });
        }

        // Trouver ou créer une conversation s'il n'y en a pas d'active
        let activeConversationId = conversationId;
        if (!activeConversationId && agentId) {
          const lastConversation = await prisma.conversation.findFirst({
            where: { agentId },
            orderBy: { updatedAt: "desc" },
          });

          if (lastConversation) {
            activeConversationId = lastConversation.id;
          } else {
            const newConv = await prisma.conversation.create({
              data: { agentId },
            });
            activeConversationId = newConv.id;
          }
        }

        if (!activeConversationId) {
          // Création d'une conversation générique de secours
          const newConv = await prisma.conversation.create({
            data: {},
          });
          activeConversationId = newConv.id;
        }

        // Créer le message en base de données via Prisma
        const message = await prisma.message.create({
          data: {
            role,
            content: content || null,
            uiType: uiType || null,
            uiData: uiData || null,
            conversationId: activeConversationId,
          },
        });

        // Mettre à jour la date de rafraîchissement de la conversation
        await prisma.conversation.update({
          where: { id: activeConversationId },
          data: { updatedAt: new Date() },
        });

        return NextResponse.json({
          success: true,
          messageId: message.id,
          conversationId: activeConversationId,
        });
      }

      case "CREATE_DAILY_REPORT": {
        const { summaryText, date } = data || {};

        if (!agentId || !summaryText) {
          return NextResponse.json(
            { error: "agentId and summaryText are required for daily report" },
            { status: 400 }
          );
        }

        const report = await prisma.dailyReport.create({
          data: {
            agentId,
            date: date ? new Date(date) : new Date(),
            summaryText,
          },
        });

        return NextResponse.json({ success: true, reportId: report.id });
      }

      case "REFUND_CREDITS": {
        const { amount = 20, reason = "Remboursement suite à échec d'exécution n8n" } = data || {};

        // Créditer l'organisation de manière transactionnelle
        const updatedOrg = await prisma.organization.update({
          where: { id: organizationId },
          data: {
            credits: {
              increment: amount,
            },
          },
        });

        console.log(`Refunded ${amount} credits to org: ${organizationId}. Reason: ${reason}`);

        return NextResponse.json({
          success: true,
          creditsRemaining: updatedOrg.credits,
        });
      }

      case "CREATE_SKILL": {
        const { name, description, toolName, schema } = data || {};

        if (!name || !description || !toolName || !schema) {
          return NextResponse.json({ error: "Missing required fields for creating a skill" }, { status: 400 });
        }

        const newSkill = await prisma.skill.create({
          data: {
            name,
            description,
            toolName,
            schema,
            organizationId,
          },
        });

        return NextResponse.json({ success: true, skillId: newSkill.id });
      }

      default:
        return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Critical error in n8n-callback webhook endpoint:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

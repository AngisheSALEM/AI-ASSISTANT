"use server";

import { prisma } from "@/lib/prisma";
import { deductCredits } from "@/lib/auth/check-credits";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function instantiateAgent(organizationId: string, templateId: string) {
  let newAgentId: string | null = null;

  try {
    const template = await prisma.agentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error("Template non trouvé");
    }

    // On déduit les crédits pour le premier mois
    await deductCredits(organizationId, template.pricePerMonth);

    // On clone le template pour créer un agent
    const newAgent = await prisma.agent.create({
      data: {
        name: template.name,
        role: template.category,
        systemPrompt: template.basePrompt,
        organizationId: organizationId,
        templateId: template.id,
        status: "ACTIVE",
      },
    });

    newAgentId = newAgent.id;

    revalidatePath(`/(dashboard)/${organizationId}/agents`);
    revalidatePath(`/(dashboard)/${organizationId}/marketplace`);
  } catch (error: any) {
    console.error("Error instantiating agent:", error);
    return { success: false, error: error.message };
  }

  if (newAgentId) {
    redirect(`/copilot?agentId=${newAgentId}`);
  }
}

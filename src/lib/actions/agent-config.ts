"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addKnowledge(organizationId: string, title: string, content: string) {
  try {
    const kb = await prisma.knowledgeBase.create({
      data: {
        title,
        content,
        organizationId
      }
    });
    revalidatePath(`/(dashboard)/${organizationId}/knowledge`);
    return { success: true, id: kb.id };
  } catch (error: any) {
    console.error("Error adding knowledge:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAgentLogic(agentId: string, systemPrompt: string, temperature: number) {
  try {
    const agent = await prisma.agent.update({
      where: { id: agentId },
      data: {
        systemPrompt,
        temperature: temperature / 100 // assuming UI sends 0-100
      }
    });
    revalidatePath(`/(dashboard)/${agent.organizationId}/thinking`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating agent logic:", error);
    return { success: false, error: error.message };
  }
}

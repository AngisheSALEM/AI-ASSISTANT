import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const createFromTemplateSchema = z.object({
  templateId: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const organizationId = (session.user as any).organizationId;

    if (!organizationId) {
      return NextResponse.json({ error: "Organization not found for user" }, { status: 400 });
    }

    const body = await req.json();
    const result = createFromTemplateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { templateId } = result.data;

    // Fetch template
    const template = await prisma.agentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Create agent from template
    const agent = await prisma.agent.create({
      data: {
        name: template.name,
        role: template.name, // Using name as role or could be template.category
        systemPrompt: template.basePrompt,
        uiData: template.uiData || {},
        templateId: template.id,
        organizationId: organizationId,
        status: "ACTIVE",
        temperature: 0.7,
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Error creating agent from template:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

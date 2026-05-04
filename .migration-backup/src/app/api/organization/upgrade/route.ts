import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Notez les accolades {}
import { Plan } from "@prisma/client";

export async function POST(req: Request) {
  // NOTE: In a production environment, this route must be protected
  // by authentication and authorization checks.
  try {
    const { organizationId } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: "Missing organizationId" }, { status: 400 });
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        plan: Plan.PREMIUM,
      },
    });

    return NextResponse.json({
      success: true,
      plan: updatedOrg.plan,
    });
  } catch (error) {
    console.error("Upgrade error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

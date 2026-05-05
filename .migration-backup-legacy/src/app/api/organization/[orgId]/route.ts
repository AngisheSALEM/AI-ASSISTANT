import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Notez les accolades {}

export async function GET(
  req: Request,
  { params }: { params: { orgId: string } }
) {
  // NOTE: In a production environment, this route must be protected
  // by authentication and authorization checks.
  try {
    const { orgId } = params;

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        plan: true,
        credits: true,
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Fetch organization error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

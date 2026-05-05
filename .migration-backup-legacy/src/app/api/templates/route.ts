import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const templates = await prisma.agentTemplate.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

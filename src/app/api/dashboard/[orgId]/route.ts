import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { orgId: string } }
) {
  try {
    const { orgId } = params;

    // Fetch Organization details
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Fetch real stats
    const agentCount = await prisma.agent.count({
      where: { organizationId: orgId },
    });

    const totalMessages = await prisma.message.count({
      where: {
        conversation: {
          agent: {
            organizationId: orgId,
          },
        },
      },
    });

    // Fetch active agents with their stats
    const agents = await prisma.agent.findMany({
      where: { organizationId: orgId },
      include: {
        _count: {
          select: {
            conversations: true,
          },
        },
        template: true,
      },
      take: 4,
    });

    // Fetch skills count
    const skillsCount = await prisma.skill.count({
      where: { organizationId: orgId },
    });

    // Data for AreaChart
    const chartData = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const count = await prisma.message.count({
          where: {
            conversation: {
              agent: {
                organizationId: orgId,
              },
            },
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });

        return {
          date: date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
          }),
          "Messages": count,
        };
      })
    );

    // Fetch Daily Reports
    const dailyReports = await prisma.dailyReport.findMany({
      where: {
        agent: {
          organizationId: orgId
        }
      },
      orderBy: { date: 'desc' },
      include: { agent: true },
      take: 3
    });

    return NextResponse.json({
      organization,
      agentCount,
      totalMessages,
      agents,
      skillsCount,
      chartData,
      dailyReports,
      resolutionRate: totalMessages > 0 ? 88 : 0,
      hoursSaved: Math.round(totalMessages * 0.15),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

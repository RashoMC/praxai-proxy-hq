import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const averageDealValue = 2000;

    const [totalLeads, leadsThisWeek, messagesSent, closedLeads] =
      await Promise.all([
        prisma.lead.count(),
        prisma.lead.count({
          where: { createdAt: { gte: weekAgo } },
        }),
        prisma.lead.count({ where: { messageSent: true } }),
        prisma.lead.count({ where: { status: "CLOSE" } }),
      ]);

    const conversionRate =
      totalLeads > 0
        ? Math.round((closedLeads / totalLeads) * 100)
        : 0;

    const pipelineLeads = totalLeads - closedLeads;
    const pipelineValue = pipelineLeads * averageDealValue;

    return NextResponse.json({
      totalLeads,
      leadsThisWeek,
      messagesSent,
      conversionRate,
      closedLeads,
      pipelineLeads,
      pipelineValue,
    });
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    return NextResponse.json({ error: "Failed to fetch KPIs" }, { status: 500 });
  }
}

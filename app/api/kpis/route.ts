import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const averageDealValue = 2000;
    const closedStatuses = ["CLOSED", "CLOSE"];
    const inactiveStatuses = [...closedStatuses, "REJECTED"];

    const [totalLeads, leadsThisWeek, messagesSent, closedLeads, pipelineLeads] =
      await Promise.all([
        prisma.lead.count(),
        prisma.lead.count({
          where: { createdAt: { gte: weekAgo } },
        }),
        prisma.lead.count({ where: { messageSent: true } }),
        prisma.lead.count({ where: { status: { in: closedStatuses } } }),
        prisma.lead.count({ where: { status: { notIn: inactiveStatuses } } }),
      ]);

    const conversionRate =
      totalLeads > 0
        ? Math.round((closedLeads / totalLeads) * 100)
        : 0;
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

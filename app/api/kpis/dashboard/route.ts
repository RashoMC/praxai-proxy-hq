import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTodoDateWhereClause, parseTodoDateFilter } from "@/lib/todo-dates";

type CustomKpiValue = string | number | boolean | null | Record<string, unknown> | Array<unknown>;

function normalizeKpiValue(value: unknown): CustomKpiValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    Array.isArray(value) ||
    (typeof value === "object" && value !== null)
  ) {
    return value as CustomKpiValue;
  }

  return String(value);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFilter = parseTodoDateFilter(searchParams.get("date"));
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const averageDealValue = 2000;
    const closedStatuses = ["CLOSED", "CLOSE"];
    const inactiveStatuses = [...closedStatuses, "REJECTED"];

    const [
      totalLeads,
      leadsThisWeek,
      messagesSent,
      closedLeads,
      pipelineLeads,
      todos,
      customKpis,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.lead.count({ where: { messageSent: true } }),
      prisma.lead.count({ where: { status: { in: closedStatuses } } }),
      prisma.lead.count({ where: { status: { notIn: inactiveStatuses } } }),
      prisma.todo.findMany({
        where: getTodoDateWhereClause(dateFilter),
        orderBy: [{ status: "asc" }, { dueDate: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
      }),
      prisma.customKpi.findMany({ orderBy: [{ timestamp: "desc" }, { createdAt: "desc" }] }),
    ]);

    const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;
    const pipelineValue = pipelineLeads * averageDealValue;

    const customKpisByAgent = Array.from(
      customKpis.reduce((map, kpi) => {
        const existing = map.get(kpi.agent) ?? [];
        const alreadyIncluded = existing.some((item) => item.name === kpi.name);

        if (!alreadyIncluded) {
          existing.push({
            id: kpi.id,
            name: kpi.name,
            value: normalizeKpiValue(kpi.value),
            change: kpi.change,
            timestamp: kpi.timestamp,
          });
        }

        map.set(kpi.agent, existing);
        return map;
      }, new Map<string, Array<{ id: string; name: string; value: CustomKpiValue; change: string | null; timestamp: Date }>>())
    ).map(([agent, items]) => ({ agent, items }));

    return NextResponse.json({
      overview: {
        totalLeads,
        leadsThisWeek,
        messagesSent,
        conversionRate,
        closedLeads,
        pipelineLeads,
        pipelineValue,
      },
      todos,
      todoSummary: {
        total: todos.length,
        pending: todos.filter((todo) => todo.status === "PENDING").length,
        done: todos.filter((todo) => todo.status === "DONE").length,
      },
      todoDateFilter: dateFilter,
      customKpisByAgent,
    });
  } catch (error) {
    console.error("Error fetching dashboard KPIs:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard KPIs" }, { status: 500 });
  }
}

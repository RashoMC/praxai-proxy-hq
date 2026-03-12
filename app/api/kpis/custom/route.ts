import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agent = searchParams.get("agent");

    const where: Prisma.CustomKpiWhereInput = {};
    if (agent) {
      where.agent = agent;
    }

    const customKpis = await prisma.customKpi.findMany({
      where,
      orderBy: [
        { timestamp: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(customKpis);
  } catch (error) {
    console.error("Error fetching custom KPIs:", error);
    return NextResponse.json({ error: "Failed to fetch custom KPIs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (body.value === undefined) {
      return NextResponse.json({ error: "Value is required" }, { status: 400 });
    }

    if (typeof body.agent !== "string" || body.agent.trim().length === 0) {
      return NextResponse.json({ error: "Agent is required" }, { status: 400 });
    }

    if (typeof body.timestamp !== "string" || Number.isNaN(Date.parse(body.timestamp))) {
      return NextResponse.json({ error: "Timestamp must be a valid ISO date string" }, { status: 400 });
    }

    const customKpi = await prisma.customKpi.create({
      data: {
        name: body.name.trim(),
        value: body.value as Prisma.InputJsonValue,
        change: typeof body.change === "string" && body.change.trim().length > 0
          ? body.change.trim()
          : null,
        agent: body.agent.trim(),
        timestamp: new Date(body.timestamp),
      },
    });

    return NextResponse.json(customKpi, { status: 201 });
  } catch (error) {
    console.error("Error creating custom KPI:", error);
    return NextResponse.json({ error: "Failed to create custom KPI" }, { status: 500 });
  }
}

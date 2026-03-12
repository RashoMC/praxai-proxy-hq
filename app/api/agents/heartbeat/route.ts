import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/agents/heartbeat
// Agents call this to announce themselves and update their status
// Body: { name, status, task?, queueSize?, emoji?, color? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, status, task, queueSize, emoji, color } = body;

    if (!name || !status) {
      return NextResponse.json(
        { error: "name and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["IDLE", "WORKING", "PAUSED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Upsert agent by name — creates if not exists, updates if found
    const agent = await prisma.agent.upsert({
      where: { name },
      update: {
        status,
        task: task ?? null,
        queueSize: queueSize ?? 0,
        lastSeen: new Date(),
      },
      create: {
        name,
        emoji: emoji ?? "🤖",
        color: color ?? "#6366f1",
        status,
        task: task ?? null,
        queueSize: queueSize ?? 0,
        lastSeen: new Date(),
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json(
      { error: "Failed to process heartbeat" },
      { status: 500 }
    );
  }
}

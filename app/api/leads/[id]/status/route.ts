import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, oldStatus } = body;

    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
    });

    // Log the status change as activity
    await prisma.activity.create({
      data: {
        leadId: id,
        type: "STATUS_CHANGE",
        note: `Status changed from ${oldStatus || "unknown"} to ${status}`,
        metadata: { from: oldStatus, to: status },
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error updating lead status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

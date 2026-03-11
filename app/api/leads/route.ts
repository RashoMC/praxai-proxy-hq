import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lead = await prisma.lead.create({
      data: {
        company: body.company,
        contact: body.contact || null,
        email: body.email || null,
        linkedin: body.linkedin || null,
        phone: body.phone || null,
        priority: body.priority || "MEDIUM",
        status: body.status || "LEAD",
        source: body.source || null,
        notes: body.notes || null,
        messageDraft: body.messageDraft || null,
        followUpAt: body.followUpAt ? new Date(body.followUpAt) : null,
      },
    });
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      where: {
        followUpAt: { not: null },
        status: { not: "CLOSE" },
      },
      orderBy: { followUpAt: "asc" },
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching follow-ups:", error);
    return NextResponse.json({ error: "Failed to fetch follow-ups" }, { status: 500 });
  }
}

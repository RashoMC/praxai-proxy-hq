import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const leads = await prisma.lead.findMany({
      where: {
        followUpAt: {
          lte: in24h,
        },
        status: {
          not: "CLOSE",
        },
      },
      orderBy: { followUpAt: "asc" },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching follow-ups:", error);
    return NextResponse.json({ error: "Failed to fetch follow-ups" }, { status: 500 });
  }
}

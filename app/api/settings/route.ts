import { NextRequest, NextResponse } from "next/server";

// Simple in-memory + env-based settings for now
// In production this would be a database-backed settings table
let cachedSettings: Record<string, string> = {
  instantlyApiKey: process.env.INSTANTLY_API_KEY || "ZTU0MzA4YjYtYmFmMi00YWU4LTk0MTctMzdkNjI1ZTMwMTFlOkhJRFhBTExsY3VDRA==",
};

export async function GET() {
  return NextResponse.json(cachedSettings);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.instantlyApiKey !== undefined) {
      cachedSettings.instantlyApiKey = body.instantlyApiKey;
    }
    return NextResponse.json({ success: true, settings: cachedSettings });
  } catch {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

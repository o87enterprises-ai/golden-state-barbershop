import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/lib/booking";

// GET /api/availability?date=2026-10-21&serviceId=xxx
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  const serviceId = req.nextUrl.searchParams.get("serviceId");
  if (!date || !serviceId)
    return NextResponse.json({ error: "date and serviceId required" }, { status: 400 });

  const slots = await getAvailability(date, serviceId);
  return NextResponse.json({ slots });
}

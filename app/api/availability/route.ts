import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/lib/booking";
import { parseDateOnly } from "@/lib/time";

export const dynamic = "force-dynamic";

// GET /api/availability?date=2026-10-21&serviceId=xxx[&barberId=yyy]
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const date = p.get("date");
  const serviceId = p.get("serviceId");
  if (!date || !serviceId || !parseDateOnly(date))
    return NextResponse.json({ error: "Valid date (YYYY-MM-DD) and serviceId required" }, { status: 400 });

  const slots = await getAvailability(date, serviceId, p.get("barberId") ?? undefined);
  return NextResponse.json({ slots });
}

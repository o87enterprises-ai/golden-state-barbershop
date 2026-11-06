import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/server";

// POST /api/auth/logout — delete the session row and clear the cookie.
export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}

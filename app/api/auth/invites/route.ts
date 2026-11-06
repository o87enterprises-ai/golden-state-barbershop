import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { newInviteCode, requireUser, toPublicInvite } from "@/lib/auth/server";

// POST /api/auth/invites — owner-only one-time barber invite.
export async function POST(req: Request) {
  const { user, error, status } = await requireUser(["admin"]);
  if (!user) return NextResponse.json({ error }, { status });

  const parsed = z
    .object({ name: z.string().trim().max(80).optional() })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid invite." }, { status: 400 });

  const invite = await db.invite.create({
    data: { code: newInviteCode(), name: parsed.data.name || "New barber" },
  });
  return NextResponse.json({ invite: toPublicInvite(invite) }, { status: 201 });
}

// DELETE /api/auth/invites?code=ABC123 — owner-only revoke.
export async function DELETE(req: Request) {
  const { user, error, status } = await requireUser(["admin"]);
  if (!user) return NextResponse.json({ error }, { status });

  const code = new URL(req.url).searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  await db.invite.deleteMany({ where: { code, usedBy: null } });
  return NextResponse.json({ ok: true });
}

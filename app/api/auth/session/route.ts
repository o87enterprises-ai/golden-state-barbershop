import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, toPublicInvite, toPublicUser } from "@/lib/auth/server";

// GET /api/auth/session — the account layer the client hydrates from.
// Emails are only returned to the owner (or to the account itself); everyone
// else gets the public roster needed to show barbers.
export async function GET() {
  const me = await getSessionUser();
  const all = await db.user.findMany({ orderBy: { createdAt: "asc" } });
  const isAdmin = me?.role === "ADMIN";

  const visible = isAdmin
    ? all
    : all.filter((u) => u.role !== "CUSTOMER" || u.id === me?.id);

  const users = visible.map((u) => toPublicUser(u, isAdmin || u.id === me?.id));
  const invites = isAdmin
    ? (await db.invite.findMany({ orderBy: { createdAt: "desc" } })).map(toPublicInvite)
    : [];

  return NextResponse.json({
    user: me ? toPublicUser(me) : null,
    users,
    invites,
    hasAdmin: all.some((u) => u.role === "ADMIN"),
  });
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/server";

// DELETE /api/auth/users/[id] — owner removes a barber from the team.
// Sessions cascade with the user row, so access ends immediately.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error, status } = await requireUser(["admin"]);
  if (!user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  if (id === user.id) {
    return NextResponse.json({ error: "You can't remove your own account." }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id } });
  if (!target || target.role !== "BARBER") {
    return NextResponse.json({ error: "Not a barber on this team." }, { status: 404 });
  }

  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

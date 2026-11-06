import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, toPublicUser } from "@/lib/auth/server";

const schema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().trim().optional(),
  onboarded: z.boolean().optional(),
  cutsHair: z.boolean().optional(),
  profile: z
    .object({
      specialties: z.string().trim().optional(),
      bio: z.string().trim().optional(),
      privateRate: z.number().min(0).optional(),
    })
    .optional(),
});

// PATCH /api/auth/profile — a signed-in user can only edit their own account.
export async function PATCH(req: Request) {
  const { user, error, status } = await requireUser();
  if (!user) return NextResponse.json({ error }, { status });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  const p = parsed.data;

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      ...(p.name !== undefined ? { name: p.name } : {}),
      ...(p.phone !== undefined ? { phone: p.phone || null } : {}),
      ...(p.onboarded !== undefined ? { onboarded: p.onboarded } : {}),
      ...(p.cutsHair !== undefined ? { cutsHair: p.cutsHair } : {}),
      ...(p.profile?.specialties !== undefined ? { specialties: p.profile.specialties } : {}),
      ...(p.profile?.bio !== undefined ? { bio: p.profile.bio } : {}),
      ...(p.profile?.privateRate !== undefined ? { privateRate: p.profile.privateRate } : {}),
    },
  });

  return NextResponse.json({ user: toPublicUser(updated) });
}

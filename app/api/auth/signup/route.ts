import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/server";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/[A-Za-z]/, "Include at least one letter.")
    .regex(/\d/, "Include at least one number."),
  phone: z.string().trim().optional(),
  role: z.enum(["customer", "barber", "admin"]),
  inviteCode: z.string().trim().toUpperCase().optional(),
});

// POST /api/auth/signup — create an account and sign in.
// Only the first owner account can be created; barbers need an unused invite.
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check your details." },
      { status: 400 }
    );
  }
  const { name, email, password, phone, role, inviteCode } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  if (role === "admin") {
    const owner = await db.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
    if (owner) {
      return NextResponse.json({ error: "This shop already has an owner account." }, { status: 409 });
    }
  }

  const passwordHash = await hashPassword(password);

  try {
    if (role === "barber") {
      const code = inviteCode ?? "";
      const created = await db.$transaction(async (tx) => {
        const invite = await tx.invite.findUnique({ where: { code } });
        if (!invite || invite.usedBy) throw new Error("INVALID_INVITE");
        await tx.invite.update({ where: { code }, data: { usedBy: email } });
        return tx.user.create({
          data: { name, email, phone: phone || null, role: "BARBER", passwordHash },
        });
      });
      await createSession(created.id);
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const created = await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: role === "admin" ? "ADMIN" : "CUSTOMER",
        passwordHash,
      },
    });
    await createSession(created.id);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_INVITE") {
      return NextResponse.json(
        { error: "That invite code is invalid or already used." },
        { status: 400 }
      );
    }
    // Unique constraint (email or invite) raced with another request.
    if (typeof err === "object" && err && "code" in err && (err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not create the account." }, { status: 500 });
  }
}

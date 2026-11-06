import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { DUMMY_HASH, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/server";

const schema = z.object({
  email: z.string().trim().toLowerCase().min(1),
  password: z.string().min(1),
});

// Best-effort throttle. Serverless instances don't share memory, so this slows
// casual guessing rather than replacing a real rate limiter at the edge.
const attempts = new Map<string, { n: number; until: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60_000;

// POST /api/auth/login
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const rec = attempts.get(email);
  if (rec && rec.until > Date.now()) {
    const secs = Math.ceil((rec.until - Date.now()) / 1000);
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${secs}s.` },
      { status: 429 }
    );
  }

  const user = await db.user.findUnique({ where: { email } });
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !ok) {
    const n = (rec?.n ?? 0) + 1;
    attempts.set(email, n >= MAX_ATTEMPTS ? { n: 0, until: Date.now() + LOCK_MS } : { n, until: 0 });
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  attempts.delete(email);
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}

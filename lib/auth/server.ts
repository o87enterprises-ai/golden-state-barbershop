import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import type { Role } from "@/lib/mock/data";
import type { Invite, User } from "./types";

// Session handling. The cookie holds a 256-bit random token; the database only
// stores its SHA-256, so a database leak can't be replayed as a session.
const SESSION_COOKIE = "gsb_session";
const SESSION_DAYS = 30;
const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "BARBER" | "ADMIN";
  onboarded: boolean;
  cutsHair: boolean;
  specialties: string | null;
  bio: string | null;
  privateRate: number | null;
  createdAt: Date;
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export function toPublicUser(u: UserRow, includeEmail = true): User {
  return {
    id: u.id,
    name: u.name,
    email: includeEmail ? u.email : "",
    phone: u.phone ?? undefined,
    role: u.role.toLowerCase() as Role,
    createdAt: u.createdAt.toISOString(),
    onboarded: u.onboarded,
    cutsHair: u.cutsHair,
    profile: {
      specialties: u.specialties ?? undefined,
      bio: u.bio ?? undefined,
      privateRate: u.privateRate ?? undefined,
    },
  };
}

export const toPublicInvite = (i: {
  code: string;
  name: string;
  createdAt: Date;
  usedBy: string | null;
}): Invite => ({
  code: i.code,
  name: i.name,
  createdAt: i.createdAt.toISOString(),
  usedBy: i.usedBy ?? undefined,
});

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  await db.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } }).catch(() => {});
  }
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<UserRow | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const row = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!row) return null;
  if (row.expiresAt < new Date()) {
    await db.session.delete({ where: { id: row.id } }).catch(() => {});
    return null;
  }
  return row.user;
}

// Server-side authorization. Every route that touches shop data must call this;
// the client-side <RequireRole> gate is only for UX.
export async function requireUser(roles?: Array<"customer" | "barber" | "admin">) {
  const user = await getSessionUser();
  if (!user) return { user: null, error: "Not signed in", status: 401 as const };
  const role = user.role.toLowerCase() as "customer" | "barber" | "admin";
  if (roles && !roles.includes(role)) {
    return { user: null, error: "Not allowed", status: 403 as const };
  }
  return { user, error: null, status: 200 as const };
}

const INVITE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function newInviteCode(): string {
  const bytes = randomBytes(8);
  return Array.from(bytes, (b) => INVITE_ALPHABET[b % INVITE_ALPHABET.length]).join("");
}

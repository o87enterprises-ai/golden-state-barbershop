"use client";

// Account layer: owner / barber / customer accounts with salted PBKDF2 password
// hashes, persisted on this device. This is a front-end implementation behind a
// small API (signup/login/logout/…) so it can later be swapped for server
// endpoints without touching any page. Browser storage is NOT a security
// boundary — see README "Production notes".

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Role, uid } from "@/lib/mock/data";

export type Profile = {
  specialties?: string;
  bio?: string;
  privateRate?: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  createdAt: string;
  onboarded: boolean;
  cutsHair?: boolean; // owner who also works the floor
  profile?: Profile;
};

type StoredUser = User & { salt: string; hash: string };

export type Invite = { code: string; name: string; createdAt: string; usedBy?: string };

type Result = { ok: true } | { ok: false; error: string };

type SignupInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  inviteCode?: string;
};

type AuthContextValue = {
  ready: boolean;
  user: User | null;
  users: User[];
  invites: Invite[];
  hasAdmin: boolean;
  signup: (i: SignupInput) => Promise<Result>;
  login: (email: string, password: string) => Promise<Result>;
  logout: () => void;
  updateUser: (patch: Partial<Pick<User, "name" | "phone" | "onboarded" | "cutsHair" | "profile">>) => void;
  createInvite: (name: string) => string | null;
  revokeInvite: (code: string) => void;
  removeBarber: (userId: string) => void;
};

const AUTH_KEY = "gsb-auth-v1";
const SESSION_KEY = "gsb-session-v1";
const ITERATIONS = 150_000;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60_000;

const AuthContext = createContext<AuthContextValue | null>(null);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthStore>");
  return ctx;
};

// ---- crypto helpers ----
const toHex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
const fromHex = (h: string) => new Uint8Array((h.match(/.{2}/g) ?? []).map((x) => parseInt(x, 16)));

async function derive(password: string, saltHex: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error("Secure context required");
  const key = await subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await subtle.deriveBits(
    { name: "PBKDF2", salt: fromHex(saltHex), iterations: ITERATIONS, hash: "SHA-256" },
    key,
    256
  );
  return toHex(new Uint8Array(bits));
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const INVITE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function newInviteCode() {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => INVITE_ALPHABET[b % INVITE_ALPHABET.length]).join("");
}

const strip = ({ salt: _s, hash: _h, ...u }: StoredUser): User => u;
const normEmail = (e: string) => e.trim().toLowerCase();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Include at least one letter and one number.";
  return null;
}

export function homeFor(user: User | null): string {
  if (!user) return "/login";
  if (!user.onboarded) return "/onboarding";
  if (user.role === "admin") return "/admin";
  if (user.role === "barber") return "/admin/clock";
  return "/portal";
}

export default function AuthStore({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const attempts = useRef<Map<string, { n: number; until: number }>>(new Map());

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setUsers(Array.isArray(s.users) ? s.users : []);
        setInvites(Array.isArray(s.invites) ? s.invites : []);
      }
      setSessionId(localStorage.getItem(SESSION_KEY));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_KEY || e.key === SESSION_KEY) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [load]);

  const persist = useCallback((nextUsers: StoredUser[], nextInvites: Invite[]) => {
    setUsers(nextUsers);
    setInvites(nextInvites);
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ users: nextUsers, invites: nextInvites }));
    } catch {
      /* ignore */
    }
  }, []);

  const setSession = useCallback((id: string | null) => {
    setSessionId(id);
    try {
      if (id) localStorage.setItem(SESSION_KEY, id);
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const hasAdmin = users.some((u) => u.role === "admin");
  const current = useMemo(() => users.find((u) => u.id === sessionId) ?? null, [users, sessionId]);
  const user = current ? strip(current) : null;

  const signup = useCallback(
    async (i: SignupInput): Promise<Result> => {
      const email = normEmail(i.email);
      const name = i.name.trim();
      if (name.length < 2) return { ok: false, error: "Enter your full name." };
      if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
      const pwProblem = passwordProblem(i.password);
      if (pwProblem) return { ok: false, error: pwProblem };
      if (users.some((u) => u.email === email)) return { ok: false, error: "An account with that email already exists." };

      let nextInvites = invites;
      if (i.role === "admin") {
        if (hasAdmin) return { ok: false, error: "This shop already has an owner account." };
      } else if (i.role === "barber") {
        const code = (i.inviteCode ?? "").trim().toUpperCase();
        const inv = invites.find((v) => v.code === code && !v.usedBy);
        if (!inv) return { ok: false, error: "That invite code is invalid or already used." };
        nextInvites = invites.map((v) => (v.code === code ? { ...v, usedBy: email } : v));
      }

      let salt: string, hash: string;
      try {
        salt = toHex(globalThis.crypto.getRandomValues(new Uint8Array(16)));
        hash = await derive(i.password, salt);
      } catch {
        return { ok: false, error: "Your browser can't create secure accounts here. Use HTTPS." };
      }

      const created: StoredUser = {
        id: uid(),
        name,
        email,
        phone: i.phone?.trim() || undefined,
        role: i.role,
        createdAt: new Date().toISOString(),
        onboarded: false,
        salt,
        hash,
      };
      persist([...users, created], nextInvites);
      setSession(created.id);
      return { ok: true };
    },
    [users, invites, hasAdmin, persist, setSession]
  );

  const login = useCallback(
    async (emailIn: string, password: string): Promise<Result> => {
      const email = normEmail(emailIn);
      const rec = attempts.current.get(email);
      if (rec && rec.until > Date.now()) {
        const secs = Math.ceil((rec.until - Date.now()) / 1000);
        return { ok: false, error: `Too many attempts. Try again in ${secs}s.` };
      }
      const found = users.find((u) => u.email === email);
      let good = false;
      try {
        // Derive even for unknown emails so timing doesn't reveal which exist.
        const hash = await derive(password, found?.salt ?? "00".repeat(16));
        good = !!found && safeEqual(hash, found.hash);
      } catch {
        return { ok: false, error: "Your browser can't sign in securely here. Use HTTPS." };
      }
      if (!good) {
        const n = (rec?.n ?? 0) + 1;
        attempts.current.set(
          email,
          n >= MAX_ATTEMPTS ? { n: 0, until: Date.now() + LOCK_MS } : { n, until: 0 }
        );
        return { ok: false, error: "Incorrect email or password." };
      }
      attempts.current.delete(email);
      setSession(found!.id);
      return { ok: true };
    },
    [users, setSession]
  );

  const logout = useCallback(() => setSession(null), [setSession]);

  const updateUser = useCallback<AuthContextValue["updateUser"]>(
    (patch) => {
      if (!current) return;
      persist(
        users.map((u) => (u.id === current.id ? { ...u, ...patch, profile: { ...u.profile, ...patch.profile } } : u)),
        invites
      );
    },
    [current, users, invites, persist]
  );

  const createInvite = useCallback(
    (name: string) => {
      if (current?.role !== "admin") return null;
      const code = newInviteCode();
      persist(users, [{ code, name: name.trim() || "New barber", createdAt: new Date().toISOString() }, ...invites]);
      return code;
    },
    [current, users, invites, persist]
  );

  const revokeInvite = useCallback(
    (code: string) => {
      if (current?.role !== "admin") return;
      persist(users, invites.filter((v) => v.code !== code));
    },
    [current, users, invites, persist]
  );

  const removeBarber = useCallback(
    (userId: string) => {
      if (current?.role !== "admin") return;
      persist(users.filter((u) => !(u.id === userId && u.role === "barber")), invites);
    },
    [current, users, invites, persist]
  );

  const value: AuthContextValue = {
    ready,
    user,
    users: users.map(strip),
    invites,
    hasAdmin,
    signup,
    login,
    logout,
    updateUser,
    createInvite,
    revokeInvite,
    removeBarber,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

"use client";

// Account layer: talks to /api/auth/*. Passwords and sessions never touch
// browser storage any more — the httpOnly cookie is set by the server, and
// every mutation is authorized there (lib/auth/server.ts).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Role } from "@/lib/mock/data";
import type { Invite, Profile, User } from "./types";

export type { Invite, Profile, User };
export type { Role } from "@/lib/mock/data";

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
  createInvite: (name: string) => void;
  revokeInvite: (code: string) => void;
  removeBarber: (userId: string) => void;
};

type Snapshot = {
  ready: boolean;
  user: User | null;
  users: User[];
  invites: Invite[];
  hasAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthStore>");
  return ctx;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normEmail = (e: string) => e.trim().toLowerCase();

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

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export default function AuthStore({ children }: { children: React.ReactNode }) {
  const [snap, setSnap] = useState<Snapshot>({
    ready: false,
    user: null,
    users: [],
    invites: [],
    hasAdmin: false,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (!res.ok) throw new Error("session unavailable");
      const d = (await res.json()) as Omit<Snapshot, "ready">;
      setSnap({
        ready: true,
        user: d.user ?? null,
        users: d.users ?? [],
        invites: d.invites ?? [],
        hasAdmin: !!d.hasAdmin,
      });
    } catch {
      setSnap((s) => ({ ...s, ready: true }));
    }
  }, []);

  useEffect(() => {
    refresh();
    // Re-check when a tab regains focus so a logout elsewhere takes effect.
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  const signup = useCallback(
    async (i: SignupInput): Promise<Result> => {
      const name = i.name.trim();
      const email = normEmail(i.email);
      if (name.length < 2) return { ok: false, error: "Enter your full name." };
      if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
      const pwProblem = passwordProblem(i.password);
      if (pwProblem) return { ok: false, error: pwProblem };
      if (i.role === "barber" && !i.inviteCode?.trim()) {
        return { ok: false, error: "That invite code is invalid or already used." };
      }

      try {
        const res = await fetch("/api/auth/signup", json({ ...i, name, email }));
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) return { ok: false, error: d.error ?? "Could not create the account." };
        await refresh();
        return { ok: true };
      } catch {
        return { ok: false, error: "Network error — check your connection and try again." };
      }
    },
    [refresh]
  );

  const login = useCallback(
    async (emailIn: string, password: string): Promise<Result> => {
      try {
        const res = await fetch("/api/auth/login", json({ email: normEmail(emailIn), password }));
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) return { ok: false, error: d.error ?? "Incorrect email or password." };
        await refresh();
        return { ok: true };
      } catch {
        return { ok: false, error: "Network error — check your connection and try again." };
      }
    },
    [refresh]
  );

  const logout = useCallback(() => {
    setSnap((s) => ({ ...s, user: null, invites: [] }));
    fetch("/api/auth/logout", { method: "POST" })
      .catch(() => {})
      .finally(() => refresh());
  }, [refresh]);

  const updateUser = useCallback<AuthContextValue["updateUser"]>(
    (patch) => {
      // Optimistic: pages read the new values immediately, then the server is truth.
      setSnap((s) => {
        if (!s.user) return s;
        const user = { ...s.user, ...patch, profile: { ...s.user.profile, ...patch.profile } };
        return {
          ...s,
          user,
          users: s.users.map((u) => (u.id === user.id ? { ...u, ...user } : u)),
        };
      });
      fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      })
        .then((res) => (res.ok ? refresh() : undefined))
        .catch(() => {});
    },
    [refresh]
  );

  const createInvite = useCallback(
    (name: string) => {
      fetch("/api/auth/invites", json({ name }))
        .then((res) => (res.ok ? refresh() : undefined))
        .catch(() => {});
    },
    [refresh]
  );

  const revokeInvite = useCallback(
    (code: string) => {
      fetch(`/api/auth/invites?code=${encodeURIComponent(code)}`, { method: "DELETE" })
        .then((res) => (res.ok ? refresh() : undefined))
        .catch(() => {});
    },
    [refresh]
  );

  const removeBarber = useCallback(
    (userId: string) => {
      fetch(`/api/auth/users/${encodeURIComponent(userId)}`, { method: "DELETE" })
        .then((res) => (res.ok ? refresh() : undefined))
        .catch(() => {});
    },
    [refresh]
  );

  const value: AuthContextValue = useMemo(
    () => ({
      ready: snap.ready,
      user: snap.user,
      users: snap.users,
      invites: snap.invites,
      hasAdmin: snap.hasAdmin,
      signup,
      login,
      logout,
      updateUser,
      createInvite,
      revokeInvite,
      removeBarber,
    }),
    [snap, signup, login, logout, updateUser, createInvite, revokeInvite, removeBarber]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

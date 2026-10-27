"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { homeFor, passwordProblem, useAuth } from "@/lib/auth/AuthStore";
import { AuthShell, ErrorNote, GoldButton, Label, inputCls } from "@/components/auth/ui";
import { Role } from "@/lib/mock/data";

const TABS: { role: Role; label: string }[] = [
  { role: "customer", label: "Customer" },
  { role: "barber", label: "Barber" },
  { role: "admin", label: "Owner" },
];

function SignupForm() {
  const { ready, user, signup, hasAdmin } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const initialRole = (params.get("role") as Role) || "customer";
  const [role, setRole] = useState<Role>(TABS.some((t) => t.role === initialRole) ? initialRole : "customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [invite, setInvite] = useState(params.get("code") ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace(homeFor(user));
  }, [ready, user, router]);

  // The owner tab only exists until the shop has an owner.
  const tabs = TABS.filter((t) => t.role !== "admin" || (ready && !hasAdmin));
  const pwHint = password ? passwordProblem(password) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords don't match.");
    setBusy(true);
    const res = await signup({ name, email, password, phone, role, inviteCode: invite });
    setBusy(false);
    if (!res.ok) setError(res.error);
  };

  const copy: Record<Role, { title: string; sub: string }> = {
    customer: { title: "Create Account", sub: "Save your style, rebook in a tap, and get a buzz when your chair is ready." },
    barber: { title: "Join the Team", sub: "Use the invite code your shop owner gave you." },
    admin: { title: "Owner Setup", sub: "Create the owner account that runs the shop. Only one owner account is allowed." },
  };

  return (
    <AuthShell eyebrow={role === "customer" ? "Customer" : role === "barber" ? "Barber" : "Owner"} title={copy[role].title} subtitle={copy[role].sub}>
      {tabs.length > 1 && (
        <div className="mb-5 flex gap-1 rounded-full border border-white/10 bg-brand-dark p-1" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.role}
              type="button"
              role="tab"
              aria-selected={role === t.role}
              onClick={() => {
                setRole(t.role);
                setError("");
              }}
              className={`flex-1 rounded-full px-3 py-1.5 font-sans text-[11px] uppercase tracking-wider transition-colors ${
                role === t.role ? "bg-brand-gold text-black" : "text-white/60 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        {role === "barber" && (
          <div>
            <Label htmlFor="invite">Invite code</Label>
            <input id="invite" value={invite} onChange={(e) => setInvite(e.target.value.toUpperCase())} placeholder="ABCD2345" className={`${inputCls} uppercase tracking-widest`} autoComplete="off" />
          </div>
        )}
        <div>
          <Label htmlFor="name">Full name</Label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Jane Doe" className={inputCls} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" className={inputCls} />
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="(209) 555-0100" className={inputCls} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pw">Password</Label>
            <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className={inputCls} />
          </div>
          <div>
            <Label htmlFor="pw2">Confirm</Label>
            <input id="pw2" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className={inputCls} />
          </div>
        </div>
        <p className={`font-sans text-xs ${pwHint ? "text-amber-300" : "text-white/40"}`}>
          {pwHint ?? "At least 8 characters with a letter and a number."}
        </p>
        <ErrorNote>{error}</ErrorNote>
        <GoldButton type="submit" loading={busy} disabled={!name || !email || !password || !confirm || (role === "barber" && !invite)}>
          {role === "admin" ? "Create Owner Account" : "Create Account"}
        </GoldButton>
      </form>

      <p className="mt-6 border-t border-white/10 pt-5 text-center font-sans text-sm text-white/50">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-gold hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

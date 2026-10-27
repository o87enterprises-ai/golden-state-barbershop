"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { homeFor, useAuth } from "@/lib/auth/AuthStore";
import { AuthShell, ErrorNote, GoldButton, Label, inputCls, safeNext } from "@/components/auth/ui";

function LoginForm() {
  const { ready, user, login, hasAdmin } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // once signed in (here or in another tab), go where this role belongs
  useEffect(() => {
    if (ready && user) router.replace(user.onboarded && next ? next : homeFor(user));
  }, [ready, user, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await login(email, password);
    setBusy(false);
    if (!res.ok) setError(res.error);
  };

  const signupHref = next ? `/signup?next=${encodeURIComponent(next)}` : "/signup";

  return (
    <AuthShell eyebrow="Welcome back" title="Log In" subtitle="Sign in to manage your bookings, or open the shop app if you're on the team.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email">Email</Label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <input id="password" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputCls} pr-11`} required />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <ErrorNote>{error}</ErrorNote>
        <GoldButton type="submit" loading={busy} disabled={!email || !password}>
          Log In
        </GoldButton>
      </form>

      <div className="mt-6 space-y-2 border-t border-white/10 pt-5 text-center font-sans text-sm text-white/50">
        <p>
          New here?{" "}
          <Link href={signupHref} className="text-brand-gold hover:underline">
            Create an account
          </Link>
        </p>
        <p>
          Barber with an invite?{" "}
          <Link href="/signup?role=barber" className="text-brand-gold hover:underline">
            Join the team
          </Link>
        </p>
        {ready && !hasAdmin && (
          <p>
            Setting up the shop?{" "}
            <Link href="/signup?role=admin" className="text-brand-gold hover:underline">
              Owner setup
            </Link>
          </p>
        )}
        <p className="pt-2 text-xs text-white/30">
          Just need a cut?{" "}
          <Link href="/book" className="text-white/50 underline-offset-4 hover:text-brand-gold hover:underline">
            Book as a guest
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

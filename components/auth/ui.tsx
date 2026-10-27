"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export const inputCls =
  "w-full rounded-lg border border-white/15 bg-brand-dark px-4 py-3 font-sans text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-brand-gold";

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block font-sans text-xs uppercase tracking-wider text-white/50">
      {children}
    </label>
  );
}

export function GoldButton({
  children,
  loading,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={`flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gold px-6 py-3 font-display text-xl tracking-widest text-black transition-all hover:bg-brand-gold/90 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
}

export function ErrorNote({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-lg border border-brand-red/40 bg-brand-red/10 px-3 py-2 font-sans text-xs text-red-200">
      {children}
    </p>
  );
}

// Centered card used by login, signup, and onboarding.
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  wide,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-dark p-4">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-brand-gold/10 blur-[120px]" />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`relative my-8 w-full rounded-2xl border border-brand-gold/25 bg-brand-charcoal/95 p-8 shadow-[0_0_60px_rgba(212,175,55,0.08)] ${
          wide ? "max-w-xl" : "max-w-md"
        }`}
      >
        <Link href="/" className="font-display text-xl tracking-widest text-brand-gold/80 hover:text-brand-gold">
          ← Golden State
        </Link>
        <p className="mt-6 font-sans text-[11px] uppercase tracking-[0.2em] text-brand-gold/70">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-brand-gold">{title}</h1>
        {subtitle && <p className="mt-2 font-sans text-sm leading-relaxed text-white/60">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </motion.div>
    </main>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-white/50">
      <Loader2 className="animate-spin text-brand-gold" />
      <p className="font-sans text-xs uppercase tracking-widest">{label}</p>
    </div>
  );
}

// Only allow same-site relative redirects.
export const safeNext = (n: string | null | undefined) =>
  n && n.startsWith("/") && !n.startsWith("//") ? n : null;

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OWNER, NDA_VERSION, ndaClauses } from "@/lib/legal";

const STORAGE_KEY = "gsb-nda-accepted";

type Acceptance = {
  name: string;
  email: string;
  acceptedAt: string;
  version: string;
};

export default function NdaGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");

  // Check for a stored acceptance on mount (client only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Acceptance;
        if (parsed?.version === NDA_VERSION && parsed.email) {
          setAccepted(true);
        }
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  // Lock background scroll while the gate is open.
  useEffect(() => {
    if (!ready) return;
    document.body.style.overflow = accepted ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [accepted, ready]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = name.trim().length >= 2 && emailValid && agree;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setError("Please enter your full name, a valid email, and check the box.");
      return;
    }
    const record: Acceptance = {
      name: name.trim(),
      email: email.trim(),
      acceptedAt: new Date().toISOString(),
      version: NDA_VERSION,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      /* ignore */
    }
    setAccepted(true);
  };

  return (
    <>
      {children}

      <AnimatePresence>
        {ready && !accepted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex justify-center overflow-y-auto overscroll-contain bg-brand-dark/95 p-4 backdrop-blur-md"
          >
            {/* ambient gold glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-brand-gold/10 blur-[120px]" />

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative my-auto w-full max-w-lg rounded-2xl border border-brand-gold/25 bg-brand-charcoal/95 p-6 sm:p-8 shadow-[0_0_60px_rgba(212,175,55,0.08)]"
            >
              <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-brand-gold/70">
                Confidential Preview · NDA Required
              </p>
              <h2 className="mt-3 font-display text-4xl tracking-wide text-brand-gold">
                Golden State Barbershop
              </h2>
              <p className="mt-2 font-sans text-sm leading-relaxed text-white/60">
                This is a private, non-functional mock built by{" "}
                <span className="text-white/90">{OWNER}</span>. To view it, please
                read and agree to the non-use agreement below.
              </p>

              <div className="mt-6 max-h-52 space-y-4 overflow-y-auto rounded-lg border border-white/10 bg-brand-dark/60 p-4 pr-3 font-sans text-xs leading-relaxed text-white/70">
                {ndaClauses.map((c) => (
                  <div key={c.heading}>
                    <p className="font-semibold text-brand-gold/90">{c.heading}</p>
                    <p className="mt-1 text-white/60">{c.body}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block font-sans text-xs uppercase tracking-wider text-white/50">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-lg border border-white/15 bg-brand-dark px-4 py-3 font-sans text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-sans text-xs uppercase tracking-wider text-white/50">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-white/15 bg-brand-dark px-4 py-3 font-sans text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-brand-gold"
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-3 font-sans text-xs text-white/70">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-brand-gold"
                  />
                  <span>
                    I have read and agree to the non-use agreement. I understand
                    this preview and all of its contents are the property of{" "}
                    <span className="text-white/90">{OWNER}</span> until a service
                    agreement is signed.
                  </span>
                </label>

                {error && (
                  <p className="font-sans text-xs text-brand-red">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full rounded-lg bg-brand-gold px-6 py-3 font-display text-xl tracking-widest text-black transition-all hover:bg-brand-gold/90 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Agree &amp; Enter Preview
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import { OWNER, NDA_VERSION, ndaClauses } from "@/lib/legal";

export default function NdaPage() {
  return (
    <main className="min-h-screen bg-brand-dark">
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-brand-gold/60">
            Confidential · Version {NDA_VERSION}
          </p>
          <h1 className="mt-3 font-display text-5xl tracking-widest text-brand-gold">
            Non-Use Agreement
          </h1>
          <p className="mt-4 text-white/60">
            This preview of the Golden State Barbershop website is provided by{" "}
            <span className="text-white/90">{OWNER}</span> for review and approval
            only.
          </p>
        </motion.div>

        <div className="mt-10 space-y-8">
          {ndaClauses.map((c) => (
            <div key={c.heading}>
              <h2 className="font-display text-2xl tracking-wider text-white">
                {c.heading}
              </h2>
              <p className="mt-2 leading-relaxed text-white/60">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-brand-gold/25 bg-brand-charcoal p-6 text-sm text-white/60">
          By entering this preview you confirmed your full name and email and
          agreed to the terms above. To revoke your agreement, clear this site&apos;s
          data in your browser and the agreement gate will appear again.
        </div>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-block rounded-sm border border-brand-gold/40 px-8 py-3 font-display text-lg tracking-widest text-brand-gold transition-all hover:bg-brand-gold hover:text-black"
          >
            Back to Preview
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Armchair } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";

// Public floor status. Walk-in names never appear here and incognito chairs
// show only as "Reserved" — no barber, no client.
export default function LiveLineup() {
  const { chairs, queue, barberById, hydrated } = useDemo();
  if (!hydrated) return null;

  const open = chairs.filter((c) => c.barberId && !c.incognito && c.state === "IDLE").length;
  const waiting = queue.filter((q) => q.status === "WAITING").length;
  const staffed = chairs.filter((c) => c.barberId && !c.incognito).length;

  const status = (c: (typeof chairs)[number]) => {
    if (!c.barberId) return { label: "Closed", tone: "text-white/30 border-white/10", who: "No barber" };
    if (c.incognito) return { label: "Reserved", tone: "text-white/50 border-white/20", who: "Private" };
    const who = barberById(c.barberId)?.name ?? "Barber";
    if (c.state === "IDLE") return { label: "Open", tone: "text-emerald-400 border-emerald-400/40", who };
    if (c.state === "ALMOST_READY") return { label: "Almost ready", tone: "text-amber-300 border-amber-400/40", who };
    return { label: "In service", tone: "text-brand-gold border-brand-gold/40", who };
  };

  return (
    <section id="live-lineup" className="relative z-20 scroll-mt-24 bg-brand-dark py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.3em] text-brand-gold/60">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-red opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-red" />
              </span>
              Live Now
            </p>
            <h2 className="mt-2 font-display text-4xl tracking-widest text-brand-gold md:text-5xl">The Floor</h2>
          </div>
          <div className="text-right">
            <p className="font-display text-5xl text-white">{open}</p>
            <p className="font-sans text-xs uppercase tracking-wider text-white/40">
              Open {open === 1 ? "chair" : "chairs"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {chairs.map((c, i) => {
            const s = status(c);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-white/10 bg-brand-charcoal p-5"
              >
                <div className="flex items-center justify-between">
                  <Armchair size={20} className="text-brand-gold/60" aria-hidden="true" />
                  <span className={`rounded-full border px-2 py-0.5 font-sans text-[10px] uppercase tracking-wider ${s.tone}`}>{s.label}</span>
                </div>
                <p className="mt-4 font-display text-xl tracking-wider text-white">{c.name}</p>
                <p className="font-sans text-sm text-white/50">{s.who}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/book" className="rounded-sm bg-brand-red px-10 py-4 font-display text-2xl tracking-widest text-white transition-all hover:scale-105 hover:bg-red-700">
            Book a Cut
          </Link>
          <span className="font-sans text-xs uppercase tracking-widest text-white/40">
            {staffed === 0 ? "Chairs open when barbers clock in" : waiting === 0 ? "No wait right now" : `${waiting} waiting`}
          </span>
        </div>
      </div>
    </section>
  );
}

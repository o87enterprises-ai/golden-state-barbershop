"use client";

import { motion } from "framer-motion";
import { Radio, Clock, Scissors } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";
import { barberById } from "@/lib/mock/data";

export default function LiveLineup() {
  const { queue, chairs, openOverlay } = useDemo();

  const inChair = queue.filter((q) => q.status === "IN_CHAIR");
  const waiting = queue.filter((q) => q.status === "WAITING");
  const openSeats = chairs.filter((c) => c.state === "IDLE").length;

  return (
    <section id="live-lineup" className="relative z-20 bg-brand-charcoal py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.3em] text-brand-gold/60">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-red opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-red" />
              </span>
              Live Now
            </p>
            <h2 className="mt-2 font-display text-4xl tracking-widest text-brand-gold md:text-5xl">
              The Lineup
            </h2>
          </div>
          <div className="text-right">
            <p className="font-display text-5xl text-white">{openSeats}</p>
            <p className="font-sans text-xs uppercase tracking-wider text-white/40">Open seats</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* in chair */}
          <div className="rounded-2xl border border-white/10 bg-brand-dark p-6">
            <h3 className="mb-4 flex items-center gap-2 font-sans text-sm uppercase tracking-wider text-white/50">
              <Scissors size={16} className="text-brand-gold" /> In the Chair
            </h3>
            <div className="space-y-3">
              {inChair.length === 0 && <p className="text-sm text-white/40">All chairs open.</p>}
              {inChair.map((q) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between rounded-lg bg-brand-charcoal px-4 py-3"
                >
                  <span className="font-sans text-sm text-white">{q.name}</span>
                  <span className="font-sans text-xs text-brand-gold">
                    with {barberById(q.barberId)?.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* waiting */}
          <div className="rounded-2xl border border-white/10 bg-brand-dark p-6">
            <h3 className="mb-4 flex items-center gap-2 font-sans text-sm uppercase tracking-wider text-white/50">
              <Clock size={16} className="text-brand-gold" /> Waiting
            </h3>
            <div className="space-y-3">
              {waiting.length === 0 && <p className="text-sm text-white/40">No wait — walk right in.</p>}
              {waiting.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between rounded-lg bg-brand-charcoal px-4 py-3"
                >
                  <span className="flex items-center gap-3 font-sans text-sm text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-gold/20 text-xs text-brand-gold">
                      {i + 1}
                    </span>
                    {q.name}
                  </span>
                  <span className="font-sans text-xs text-white/50">~{q.estimatedWait}m</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={() => openOverlay({ type: "book" })}
            className="rounded-sm bg-brand-red px-10 py-4 font-display text-2xl tracking-widest text-white transition-all hover:scale-105 hover:bg-red-700"
          >
            Get in Line
          </button>
          <span className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-white/30">
            <Radio size={14} /> updates live across tabs
          </span>
        </div>
      </div>
    </section>
  );
}

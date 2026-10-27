"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Scissors, Sparkles, Baby, UserRound, Wind, Crown } from "lucide-react";
import { fmt, services } from "@/lib/mock/data";

const icons: Record<string, typeof Scissors> = {
  classic: Scissors,
  "classic-beard": Crown,
  kids: Baby,
  senior: UserRound,
  "beard-lineup": Sparkles,
  "lineup-edge": Wind,
};

export default function Services() {
  return (
    <section className="relative z-20 bg-brand-dark py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-20 text-center"
        >
          <h2 className="mb-4 font-display text-5xl tracking-widest text-brand-gold md:text-6xl">The Menu</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">Our service menu. Choose your experience.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {services.map((service, index) => {
            const Icon = icons[service.id] ?? Scissors;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: (index % 2) * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                className="group relative overflow-hidden rounded-xl border border-white/5 bg-brand-charcoal p-8 transition-colors hover:border-brand-gold/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/0 to-brand-gold/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex items-start gap-6">
                    <div className="rounded-lg bg-brand-dark p-4 text-brand-gold transition-transform duration-300 group-hover:scale-110">
                      <Icon size={28} />
                    </div>
                    <div>
                      <h3 className="mb-2 font-display text-2xl tracking-wider text-white">{service.name}</h3>
                      <p className="max-w-xs text-gray-400">{service.desc}</p>
                    </div>
                  </div>
                  <div className="font-display text-3xl text-brand-gold">{fmt(service.price)}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link
            href="/book"
            className="inline-block rounded-sm border border-brand-gold bg-transparent px-12 py-4 font-display text-2xl tracking-widest text-brand-gold transition-all hover:bg-brand-gold hover:text-black"
          >
            Book Your Experience
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

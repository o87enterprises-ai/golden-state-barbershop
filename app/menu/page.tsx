"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/Footer";
import { fmt, serviceCategories, services } from "@/lib/mock/data";

const easing = [0.16, 1, 0.3, 1] as const;

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-brand-dark">
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-36">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easing }}
          className="text-center"
        >
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-brand-gold/60">Styling Guide</p>
          <h1 className="mt-3 font-display text-6xl tracking-widest text-brand-gold">The Menu</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/50">
            Every service includes a consultation so your cut fits your style and your week. Walk-ins welcome,
            appointments preferred.
          </p>
        </motion.div>

        <div className="mt-16 space-y-16">
          {serviceCategories.map((cat, ci) => (
            <div key={cat}>
              <h2 className="mb-6 font-display text-3xl tracking-widest text-white">{cat}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {services
                  .filter((s) => s.category === cat)
                  .map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: (ci * 4 + i) * 0.04, ease: easing }}
                      className="group flex items-start justify-between rounded-xl border border-white/5 bg-brand-charcoal p-6 transition-colors hover:border-brand-gold/40"
                    >
                      <div className="pr-4">
                        <h3 className="font-display text-xl tracking-wider text-white">{item.name}</h3>
                        <p className="mt-1 text-sm text-white/50">{item.desc}</p>
                      </div>
                      <span className="font-display text-2xl text-brand-gold">{fmt(item.price)}</span>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/book"
            className="inline-block rounded-sm bg-brand-red px-12 py-4 font-display text-2xl tracking-widest text-white transition-all hover:scale-105 hover:bg-red-700"
          >
            Book Your Experience
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

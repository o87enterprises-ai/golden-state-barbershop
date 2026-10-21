"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/Footer";

const categories = [
  {
    title: "Cuts",
    items: [
      { name: "Classic Cut", price: "$35", desc: "Precision scissor cut, wash, and style." },
      { name: "Skin Fade", price: "$40", desc: "Zero to skin fade with detailed lineup." },
      { name: "Kids Cut (12 & under)", price: "$25", desc: "Clean, quick, and comfortable." },
      { name: "Senior Cut", price: "$28", desc: "Classic grooming, relaxed pace." },
    ],
  },
  {
    title: "Beard & Face",
    items: [
      { name: "Beard Trim", price: "$25", desc: "Sculpting, razor outline, and hot towel." },
      { name: "Hot Towel Shave", price: "$35", desc: "Traditional straight-razor shave." },
      { name: "Line-up / Edge", price: "$15", desc: "Crisp edges between cuts." },
    ],
  },
  {
    title: "Signature",
    items: [
      { name: "The Full Service", price: "$60", desc: "Haircut, beard trim, hot towel, and facial." },
      { name: "Father & Son", price: "$55", desc: "Two cuts, one great experience." },
    ],
  },
];

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
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-brand-gold/60">
            Styling Guide
          </p>
          <h1 className="mt-3 font-display text-6xl tracking-widest text-brand-gold">
            The Menu
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/50">
            Every service includes a consultation so your cut fits your style and
            your week. Walk-ins welcome, appointments preferred.
          </p>
        </motion.div>

        <div className="mt-16 space-y-16">
          {categories.map((cat, ci) => (
            <div key={cat.title}>
              <h2 className="mb-6 font-display text-3xl tracking-widest text-white">
                {cat.title}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {cat.items.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: (ci * 4 + i) * 0.04, ease: easing }}
                    className="group flex items-start justify-between rounded-xl border border-white/5 bg-brand-charcoal p-6 transition-colors hover:border-brand-gold/40"
                  >
                    <div className="pr-4">
                      <h3 className="font-display text-xl tracking-wider text-white">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-white/50">{item.desc}</p>
                    </div>
                    <span className="font-display text-2xl text-brand-gold">
                      {item.price}
                    </span>
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
          <p className="mt-4 font-sans text-xs uppercase tracking-widest text-white/30">
            Mock menu · prices for preview only
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

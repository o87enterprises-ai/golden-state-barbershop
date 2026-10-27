"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Package } from "lucide-react";
import Footer from "@/components/Footer";
import { amazonUrl, productCategories, products, ProductCategory } from "@/lib/mock/data";

export default function ShopPage() {
  const [cat, setCat] = useState<ProductCategory | "All">("All");
  const list = cat === "All" ? products : products.filter((p) => p.category === cat);

  return (
    <main className="min-h-screen bg-brand-dark">
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-36">
        <p className="font-sans text-xs uppercase tracking-[0.3em] text-brand-gold/60">Grooming Goods</p>
        <h1 className="mt-3 font-display text-6xl tracking-widest text-brand-gold">The Shop</h1>
        <p className="mt-4 max-w-2xl text-white/50">
          The products our barbers actually use and recommend — pomades, gels, sprays, oils, and tools for every
          texture. Tap a product to see current pricing and buy on Amazon.
        </p>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Product categories">
          {(["All", ...productCategories] as const).map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-1.5 font-sans text-xs uppercase tracking-wider transition-colors ${
                cat === c ? "bg-brand-gold text-black" : "border border-white/15 text-white/60 hover:border-brand-gold/50 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
              className="group flex flex-col overflow-hidden rounded-xl border border-white/5 bg-brand-charcoal transition-colors hover:border-brand-gold/40"
            >
              <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-black to-brand-charcoal">
                <Package size={40} className="text-brand-gold/40" aria-hidden="true" />
                <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 font-sans text-[10px] uppercase tracking-wider text-brand-gold/80">
                  {p.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="font-sans text-[11px] uppercase tracking-widest text-white/40">{p.brand}</p>
                <h2 className="mt-1 font-display text-xl tracking-wider text-white">{p.name}</h2>
                <p className="mt-2 flex-1 text-sm text-white/50">{p.blurb}</p>
                <a
                  href={amazonUrl(p)}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 rounded-sm border border-brand-gold/40 px-4 py-2.5 font-sans text-xs uppercase tracking-wider text-brand-gold transition-all hover:bg-brand-gold hover:text-black"
                >
                  View on Amazon <ExternalLink size={14} />
                </a>
              </div>
            </motion.article>
          ))}
        </div>

        <p className="mt-12 text-center font-sans text-xs text-white/40">
          As an Amazon Associate, Golden State Barbershop earns from qualifying purchases. Prices and availability are
          set by Amazon.
        </p>
      </section>

      <Footer />
    </main>
  );
}

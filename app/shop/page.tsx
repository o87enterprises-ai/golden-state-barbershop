"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import Footer from "@/components/Footer";
import { useDemo } from "@/lib/mock/DemoStore";
import { products, fmt } from "@/lib/mock/data";

export default function ShopPage() {
  const { addToCart, cartCount, openOverlay } = useDemo();
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const handleAdd = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (p) addToCart(p);
    setAdded((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [id]: false })), 1400);
  };

  return (
    <main className="min-h-screen bg-brand-dark">
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-36">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-brand-gold/60">Grooming Goods</p>
            <h1 className="mt-3 font-display text-6xl tracking-widest text-brand-gold">The Shop</h1>
          </div>
          <button
            onClick={() => openOverlay({ type: "shop" })}
            className="flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-charcoal px-4 py-2 text-brand-gold transition-colors hover:border-brand-gold"
          >
            <ShoppingBag size={18} />
            <span className="font-display text-xl">{cartCount}</span>
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group flex flex-col overflow-hidden rounded-xl border border-white/5 bg-brand-charcoal transition-colors hover:border-brand-gold/40"
            >
              <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-black to-brand-charcoal">
                <div className="h-20 w-16 rounded-md bg-gradient-to-b from-brand-gold/30 to-brand-red/20 shadow-[0_0_30px_rgba(212,175,55,0.15)]" />
                <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 font-sans text-[10px] uppercase tracking-wider text-brand-gold/80">
                  {p.tag}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-xl tracking-wider text-white">{p.name}</h3>
                <p className="mt-1 flex-1 text-sm text-white/50">{p.blurb}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-2xl text-brand-gold">{fmt(p.price)}</span>
                  <button
                    onClick={() => handleAdd(p.id)}
                    className={`flex items-center gap-2 rounded-sm px-4 py-2 font-sans text-xs uppercase tracking-wider transition-all ${
                      added[p.id] ? "bg-brand-gold text-black" : "border border-brand-gold/40 text-brand-gold hover:bg-brand-gold hover:text-black"
                    }`}
                  >
                    {added[p.id] ? (<><Check size={14} /> Added</>) : "Add to Cart"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-12 text-center font-sans text-xs uppercase tracking-widest text-white/30">
          Mock shop · products &amp; cart are a non-functional demo
        </p>
      </section>

      <Footer />
    </main>
  );
}

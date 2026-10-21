"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import Footer from "@/components/Footer";
import { brand } from "@/lib/branding";

export default function SuccessPage() {
  const [type, setType] = useState<"booking" | "shop" | "tap">("booking");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("type");
    if (t === "shop" || t === "tap") setType(t);
  }, []);

  const copy = {
    booking: {
      title: "You're Booked",
      body: "Your appointment is confirmed. A confirmation has been sent to your email.",
      primary: { href: "/book", label: "Book Again" },
    },
    shop: {
      title: "Order Placed",
      body: "Thank you! A shipping confirmation has been sent to your email.",
      primary: { href: "/shop", label: "Back to Shop" },
    },
    tap: {
      title: "Payment Received",
      body: "Your in-store payment was successful. Thank you for visiting!",
      primary: { href: "/", label: "Back Home" },
    },
  }[type];

  return (
    <main className="min-h-screen bg-brand-dark">
      <section className="mx-auto flex max-w-xl flex-col items-center px-6 pb-24 pt-40 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 12 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-gold text-black shadow-[0_0_40px_rgba(212,175,55,0.4)]"
        >
          <Check size={48} strokeWidth={3} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 font-display text-5xl tracking-widest text-brand-gold"
        >
          {copy.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-4 text-white/60"
        >
          {copy.body}
        </motion.p>

        {/* Google review prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10 w-full rounded-2xl border border-brand-gold/25 bg-brand-charcoal p-6"
        >
          <div className="flex justify-center gap-1 text-brand-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={22} fill="currentColor" />
            ))}
          </div>
          <h3 className="mt-3 font-display text-2xl tracking-wider text-white">
            How was your experience?
          </h3>
          <p className="mt-1 text-sm text-white/50">
            A quick review means the world to a local shop.
          </p>
          <a
            href="#"
            className="mt-4 inline-block rounded-sm bg-brand-gold px-8 py-3 font-display text-lg tracking-widest text-black transition-all hover:bg-brand-gold/90"
          >
            Leave a Google Review
          </a>
        </motion.div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={copy.primary.href}
            className="rounded-sm border border-brand-gold/40 px-6 py-3 font-display text-lg tracking-widest text-brand-gold transition-all hover:bg-brand-gold hover:text-black"
          >
            {copy.primary.label}
          </Link>
          <a
            href={brand.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm uppercase tracking-wider text-white/50 transition-colors hover:text-brand-gold"
          >
            Follow us on Instagram
          </a>
        </div>

        <p className="mt-10 font-sans text-xs uppercase tracking-widest text-white/30">
          Mock confirmation · demo only
        </p>
      </section>

      <Footer />
    </main>
  );
}

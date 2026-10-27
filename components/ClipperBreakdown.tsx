"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import Link from "next/link";

// MOCK of the "3D Clipper Breakdown" scrollytelling section.
// This is a CSS/layered placeholder that demonstrates the exploded-view
// choreography. The final version will swap in a free high-res 3D render
// (per-part PNG layers) — the scroll logic below is ready for it.

type Part = {
  label: string;
  sub: string;
  // resting -> exploded transform targets
  x: number;
  y: number;
  rotate: number;
  // scroll window in which this part separates
  range: [number, number];
};

const PARTS: Part[] = [
  { label: "Japanese Steel Blade", sub: "Precision cutting", x: 220, y: -150, rotate: 8, range: [0.25, 0.45] },
  { label: "Precision Guard", sub: "Consistent length", x: -230, y: -60, rotate: -12, range: [0.35, 0.55] },
  { label: "Aircraft Aluminum Housing", sub: "Lightweight shell", x: 240, y: 110, rotate: 6, range: [0.45, 0.65] },
  { label: "Brushless Motor", sub: "Zero-drag torque", x: -220, y: 150, rotate: -6, range: [0.55, 0.75] },
];

function PartChip({
  part,
  progress,
}: {
  part: Part;
  progress: MotionValue<number>;
}) {
  const x = useTransform(progress, part.range, [0, part.x]);
  const y = useTransform(progress, part.range, [0, part.y]);
  const rotate = useTransform(progress, part.range, [0, part.rotate]);
  const opacity = useTransform(progress, [part.range[0], part.range[0] + 0.05], [0, 1]);

  return (
    <motion.div
      style={{ x, y, rotate, opacity }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <div className="flex items-center gap-3 rounded-xl border border-brand-gold/40 bg-brand-charcoal/90 px-4 py-3 shadow-[0_0_30px_rgba(212,175,55,0.15)] backdrop-blur-sm">
        <span className="h-2 w-2 shrink-0 rounded-full bg-brand-gold shadow-[0_0_10px_#d4af37]" />
        <div className="text-left">
          <p className="font-display text-lg tracking-widest text-brand-gold">
            {part.label}
          </p>
          <p className="font-sans text-[11px] uppercase tracking-wider text-white/50">
            {part.sub}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ClipperBreakdown() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Centerpiece reacts to scroll: fades, scales, slow-rotates, then settles.
  const coreScale = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0.9, 1, 1, 1.05]);
  const coreRotate = useTransform(scrollYProgress, [0, 1], [-4, 6]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.8], [0.15, 0.35, 0.2]);

  const headerOpacity = useTransform(scrollYProgress, [0.08, 0.18, 0.78, 0.9], [0, 1, 1, 0]);
  const outroOpacity = useTransform(scrollYProgress, [0.85, 0.95], [0, 1]);

  return (
    <section ref={ref} className="relative h-[400vh] bg-brand-dark">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {/* vignette */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_200px_60px_rgba(0,0,0,0.9)]" />

        {/* volumetric gold glow */}
        <motion.div
          style={{ opacity: glowOpacity }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold blur-[140px]"
        />

        {/* drifting gold dust (cheap, CSS-only) */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute h-[3px] w-[3px] rounded-full bg-brand-gold/40"
            style={{ left: `${(i * 83) % 100}%`, top: `${(i * 47) % 100}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 6 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          />
        ))}

        {/* header */}
        <motion.div
          style={{ opacity: headerOpacity }}
          className="absolute top-[12%] z-20 w-full px-6 text-center"
        >
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-brand-gold/60">
            Anatomy of a Perfect Cut
          </p>
          <h2 className="mt-3 font-display text-5xl tracking-widest text-brand-gold md:text-7xl">
            Engineered to the Detail
          </h2>
        </motion.div>

        {/* exploded assembly */}
        <div className="relative z-10 h-[360px] w-[360px] md:h-[440px] md:w-[440px]">
          {/* centerpiece (placeholder for the 3D clipper render) */}
          <motion.div
            style={{ scale: coreScale, rotate: coreRotate }}
            className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border border-brand-gold/30 bg-gradient-to-br from-brand-charcoal to-black shadow-[0_0_60px_rgba(212,175,55,0.2)] md:h-48 md:w-48"
          >
            <div className="text-center">
              <div className="mx-auto mb-2 h-10 w-24 rounded-md bg-gradient-to-r from-brand-red via-brand-gold to-brand-red opacity-80" />
              <p className="font-display text-xl tracking-widest text-brand-gold">
                Clipper
              </p>
              <p className="font-sans text-[9px] uppercase tracking-wider text-white/40">
                3D render placeholder
              </p>
            </div>
          </motion.div>

          {PARTS.map((part) => (
            <PartChip key={part.label} part={part} progress={scrollYProgress} />
          ))}
        </div>

        {/* outro + CTA */}
        <motion.div
          style={{ opacity: outroOpacity }}
          className="absolute bottom-[12%] z-20 w-full px-6 text-center"
        >
          <h3 className="font-display text-4xl tracking-widest text-white md:text-5xl">
            Built for the Golden State
          </h3>
          <Link
            href="/book"
            className="mt-6 inline-block rounded-sm bg-brand-red px-10 py-4 font-display text-2xl tracking-widest text-white shadow-[0_0_20px_rgba(185,28,28,0.4)] transition-all hover:scale-105 hover:bg-red-700"
          >
            Book Your Cut
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

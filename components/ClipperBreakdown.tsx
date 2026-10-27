'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { clipperParts, STAGE_ASPECT } from '@/lib/clipperParts';

// Left: headline. Right: the clipper's parts slowly spin and orbit while the
// section is on screen. Pure CSS-transform animation (no WebGL, no scroll
// pinning), so it works on every browser and phone.

// Circular drift as x/y keyframes, rotated by `phase` so parts aren't in lockstep.
function orbit(r: number, phase: number) {
  const xs = [0, r, 0, -r];
  const ys = [-r, 0, r, 0];
  const x = Array.from({ length: 5 }, (_, i) => xs[(i + phase) % 4]);
  const y = Array.from({ length: 5 }, (_, i) => ys[(i + phase) % 4]);
  return { x, y };
}

function Part({ i, run }: { i: number; run: boolean }) {
  const p = clipperParts[i];
  const r = p.small ? 18 : 7;
  const { x, y } = orbit(r, i % 4);
  const loop = { repeat: Infinity, ease: 'linear' as const };

  return (
    <motion.div
      className="absolute"
      style={{ left: `${p.left}%`, top: `${p.top}%`, width: `${p.width}%`, height: `${p.height}%` }}
      animate={run ? { x, y, rotate: p.small ? [0, 360] : [-2, 2, -2] } : { x: 0, y: 0, rotate: 0 }}
      transition={
        run
          ? {
              x: { ...loop, duration: 16 + (i % 5) * 3 },
              y: { ...loop, duration: 16 + (i % 5) * 3 },
              rotate: p.small
                ? { ...loop, duration: 24 + (i % 3) * 8 }
                : { repeat: Infinity, ease: 'easeInOut', duration: 9 + (i % 4) * 2 },
            }
          : { duration: 0.6 }
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/clipper/${p.id}.webp`}
        alt={p.label}
        draggable={false}
        className="h-full w-full select-none object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.6)]"
      />
    </motion.div>
  );
}

export default function ClipperBreakdown() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, initial: true });
  const reduced = useReducedMotion();
  const run = inView && !reduced;

  return (
    <section
      ref={ref}
      aria-label="Precision engineered"
      className="relative flex min-h-screen w-full items-center overflow-hidden bg-[#0a0a0a]"
    >
      {/* backdrop: looping video on larger screens, soft gold glow elsewhere */}
      {!reduced && (
        <video
          src="/clippers.mp4"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 hidden h-full w-full object-cover opacity-40 md:block"
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_45%,rgba(212,175,55,0.16),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-8 px-6 pb-12 pt-28 md:grid-cols-2 md:px-12 md:py-0">
        {/* left: text */}
        <div className="text-center md:text-left">
          <h2 className="text-5xl font-black uppercase leading-none tracking-tighter text-white md:text-8xl">
            Precision<br />
            <span className="text-[#facc15]">Engineered</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-gray-300 md:mx-0 md:text-xl">
            Experience the absolute best grooming in Tracy, California. Dissecting the details of a perfect cut.
          </p>
        </div>

        {/* right: orbiting clipper */}
        <div className="flex justify-center md:justify-end" style={{ perspective: 1400 }}>
          <motion.div
            className="relative"
            style={{ height: 'min(72vh, 640px)', aspectRatio: STAGE_ASPECT, transformStyle: 'preserve-3d' }}
            animate={run ? { rotateY: [-24, 24, -24], x: orbit(14, 0).x, y: orbit(14, 0).y } : { rotateY: 0, x: 0, y: 0 }}
            transition={
              run
                ? {
                    rotateY: { repeat: Infinity, ease: 'easeInOut', duration: 18 },
                    x: { repeat: Infinity, ease: 'linear', duration: 26 },
                    y: { repeat: Infinity, ease: 'linear', duration: 26 },
                  }
                : { duration: 0.6 }
            }
          >
            {clipperParts.map((_, i) => (
              <Part key={clipperParts[i].id} i={i} run={run} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

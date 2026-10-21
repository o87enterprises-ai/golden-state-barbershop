"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  assembled,
  clipperLabels,
  clipperParts,
  STAGE_ASPECT,
  type ClipperPart,
} from "@/lib/clipperParts";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Scroll timeline (0..1): assembled clipper -> parts separate -> labels -> outro.
const T = {
  swapStart: 0.16, // assembled clipper starts fading out, parts fade in
  swapEnd: 0.26,
  moveStart: 0.28, // parts begin separating (staggered by `order`)
  moveEnd: 0.78,
  smallFadeStart: 0.34, // screws / trim pop into view while the parts spread
  smallFadeEnd: 0.5,
  labelsStart: 0.78,
  labelsEnd: 0.88,
  outroStart: 0.88, // product dims so the closing text reads
  outroEnd: 0.97,
};

function PartLayer({ part, progress }: { part: ClipperPart; progress: MotionValue<number> }) {
  const start = T.moveStart + part.order * 0.012;
  const y = useTransform(progress, [start, T.moveEnd], [part.dy, 0], { ease: easeOutCubic });
  const x = useTransform(progress, [start, T.moveEnd], [part.dx, 0], { ease: easeOutCubic });
  const yPct = useMotionTemplate`${y}%`;
  const xPct = useMotionTemplate`${x}%`;
  const opacity = useTransform(
    progress,
    part.small ? [T.smallFadeStart, T.smallFadeEnd] : [T.swapStart + 0.02, T.swapEnd],
    [0, 1],
  );

  return (
    // The wrapper spans the whole stage so % translations are relative to the stage.
    <motion.div className="pointer-events-none absolute inset-0" style={{ x: xPct, y: yPct, opacity }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/clipper/${part.id}.webp`}
        alt=""
        draggable={false}
        className="absolute select-none"
        style={{
          left: `${part.left}%`,
          top: `${part.top}%`,
          width: `${part.width}%`,
          height: `${part.height}%`,
        }}
      />
    </motion.div>
  );
}

function Label({
  part,
  side,
  progress,
}: {
  part: ClipperPart;
  side: "left" | "right";
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, [T.labelsStart, T.labelsEnd, T.outroStart, T.outroEnd], [0, 1, 1, 0]);
  const cy = part.top + part.height / 2;
  const right = side === "right";
  return (
    <motion.div
      style={{ opacity, top: `${cy}%` }}
      className={`pointer-events-none absolute hidden -translate-y-1/2 items-center gap-3 md:flex ${
        right ? "left-full ml-6 flex-row" : "right-full mr-6 flex-row-reverse"
      }`}
    >
      <span className="h-px w-10 bg-brand-gold" />
      <span className="whitespace-nowrap font-sans text-xs uppercase tracking-[0.25em] text-brand-gold">
        {part.label}
      </span>
    </motion.div>
  );
}

export default function ScrollExplode({ heightClass = "h-[400vh]" }: { heightClass?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const assembledOpacity = useTransform(scrollYProgress, [T.swapStart, T.swapEnd], [1, 0]);
  const stageDim = useTransform(scrollYProgress, [T.outroStart, T.outroEnd], [1, 0.22]);

  const textOpacity1 = useTransform(scrollYProgress, [0, 0.12, 0.2], [1, 1, 0]);
  const textOpacity2 = useTransform(scrollYProgress, [0.24, 0.34, 0.74, 0.82], [0, 1, 1, 0]);
  const textOpacity3 = useTransform(scrollYProgress, [T.outroStart, 0.95], [0, 1]);

  return (
    <section ref={containerRef} className={`relative bg-black ${heightClass}`}>
      <div className="sticky top-0 flex h-[100svh] w-full flex-col items-center overflow-hidden">
        {/* soft gold glow behind the product */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/10 blur-[120px]" />

        {/* headline area */}
        <div className="relative z-10 mt-28 h-20 w-full px-4 text-center">
          <motion.h2
            style={{ opacity: textOpacity1 }}
            className="absolute inset-x-0 top-0 font-display text-4xl tracking-widest text-brand-gold sm:text-5xl md:text-7xl"
          >
            Precision Engineered
          </motion.h2>
          <motion.h2
            style={{ opacity: textOpacity2 }}
            className="absolute inset-x-0 top-0 font-display text-4xl tracking-widest text-white sm:text-5xl md:text-7xl"
          >
            The Golden Standard
          </motion.h2>
        </div>

        {/* product stage */}
        <motion.div
          style={{ opacity: stageDim, aspectRatio: STAGE_ASPECT, height: "calc(100svh - 15.5rem)" }}
          className="relative z-0 mb-6 max-w-full shrink-0"
        >
          {/* assembled clipper */}
          <motion.div className="absolute inset-0" style={{ opacity: assembledOpacity }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/clipper/assembled.webp"
              alt="Golden State pro clipper"
              draggable={false}
              className="absolute select-none"
              style={{
                left: `${assembled.left}%`,
                top: `${assembled.top}%`,
                width: `${assembled.width}%`,
                height: `${assembled.height}%`,
              }}
            />
          </motion.div>

          {/* exploded parts */}
          {clipperParts.map((p) => (
            <PartLayer key={p.id} part={p} progress={scrollYProgress} />
          ))}

          {/* callouts (wide screens only) */}
          {clipperLabels.map((l) => {
            const part = clipperParts.find((p) => p.id === l.id);
            return part ? <Label key={l.id} part={part} side={l.side} progress={scrollYProgress} /> : null;
          })}
        </motion.div>

        {/* closing message */}
        <motion.div
          style={{ opacity: textOpacity3 }}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6 text-center"
        >
          <h2 className="font-display text-5xl tracking-widest text-brand-gold md:text-7xl">Experience the Craft</h2>
          <p className="mx-auto max-w-xl text-lg text-gray-300 md:text-xl">
            Every cut is a masterpiece. Step into the chair and let our master barbers elevate your style.
          </p>
        </motion.div>

        {/* blend into neighbouring sections */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-brand-dark to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-brand-dark to-transparent" />
      </div>
    </section>
  );
}

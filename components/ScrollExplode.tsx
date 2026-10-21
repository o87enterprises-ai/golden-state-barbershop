"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useLenis } from "lenis/react";
import {
  assembled,
  clipperLabels,
  clipperParts,
  STAGE_ASPECT,
  type ClipperPart,
} from "@/lib/clipperParts";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// ---- Segmented scrolling -------------------------------------------------
// The sequence is split into SEGMENTS equal slices. One scroll gesture glides
// to the next stop, so every step lands on a clean slice of the animation.
const SEGMENTS = 4;
const STRETCH = 1.15; // whole sequence is 15% longer than the first version
const STEP_MS = 1400 * STRETCH; // time to glide between two stops
// Section height = 100vh sticky stage + 300vh * STRETCH of travel. Keep this a
// literal class so Tailwind generates it.
const DEFAULT_HEIGHT = "h-[445vh]";
const WHEEL_GAP_MS = 140; // silence that separates two wheel gestures

// ---- Timeline (0..1 across the whole section) ----------------------------
// Segment 1 (0 - .25)  assembled clipper dissolves into parts
// Segment 2 (.25 - .5) the big parts separate
// Segment 3 (.5 - .75) small parts spread out, callouts appear
// Segment 4 (.75 - 1)  small parts fly off screen, closing message
const T = {
  swapStart: 0.03,
  swapEnd: 0.2,
  bigFadeStart: 0.06,
  bigMoveStart: 0.25,
  bigMoveEnd: 0.5,
  bigStagger: 0.02,
  smallFadeStart: 0.5,
  smallFadeEnd: 0.56,
  smallMoveStart: 0.5,
  smallMoveEnd: 0.74,
  smallStagger: 0.01,
  labelsIn: 0.54,
  labelsFull: 0.72,
  labelsOutStart: 0.76,
  labelsOutEnd: 0.86,
  flyStart: 0.76,
  flyEnd: 0.97,
  dimStart: 0.8,
  dimEnd: 1,
  outroStart: 0.82,
  outroEnd: 0.95,
};

function useSegmentedScroll(sectionRef: RefObject<HTMLElement | null>, enabled: boolean) {
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useEffect(() => {
    const el = sectionRef.current;
    if (!enabled || !el) return;

    let animating = false;
    let raf = 0;
    let idleTimer = 0;
    let lastWheel = 0;
    let wheelConsumed = false;
    let touching = false;
    let touchStartY = 0;
    let touchDecided = false;

    const metrics = () => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, el.offsetHeight - window.innerHeight);
      return { top, travel };
    };
    // f = position in segment units (0..SEGMENTS) while the sticky stage is on screen.
    const state = () => {
      const { top, travel } = metrics();
      const f = ((window.scrollY - top) / travel) * SEGMENTS;
      return { top, travel, f, inRange: f >= -0.001 && f <= SEGMENTS + 0.001 };
    };
    const setY = (y: number) => {
      const l = lenisRef.current;
      if (l) l.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    };

    const goTo = (stop: number) => {
      const { top, travel } = metrics();
      const from = window.scrollY;
      const to = top + (travel * stop) / SEGMENTS;
      if (Math.abs(to - from) < 1) return;
      cancelAnimationFrame(raf);
      animating = true;
      const segPx = travel / SEGMENTS;
      // full-length glide for a whole segment, shorter for small corrections
      const dur = STEP_MS * Math.max(0.35, Math.min(1, Math.abs(to - from) / segPx));
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        setY(from + (to - from) * easeInOutCubic(t));
        if (t < 1) raf = requestAnimationFrame(tick);
        else animating = false;
      };
      raf = requestAnimationFrame(tick);
    };

    // Returns true if the gesture was used to step between segments.
    const step = (dir: 1 | -1) => {
      const { f, inRange } = state();
      if (!inRange) return false;
      const EPS = 0.02;
      if (dir > 0) {
        if (f >= SEGMENTS - EPS) return false; // last stop: let the page scroll on
        goTo(Math.floor(f + EPS) + 1);
        return true;
      }
      if (f <= EPS) return false; // first stop: let the page scroll back up
      goTo(Math.ceil(f - EPS) - 1);
      return true;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      const now = performance.now();
      if (now - lastWheel >= WHEEL_GAP_MS) wheelConsumed = false;
      lastWheel = now;
      if (animating || wheelConsumed) {
        // swallow the rest of this gesture (incl. trackpad inertia)
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      if (Math.abs(e.deltaY) < 2) return;
      if (step(e.deltaY > 0 ? 1 : -1)) {
        wheelConsumed = true;
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touching = true;
      touchDecided = false;
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (animating) {
        // keep swallowing the rest of this finger gesture while a step plays
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (touchDecided) return;
      const dy = touchStartY - e.touches[0].clientY;
      if (Math.abs(dy) < 8) return;
      touchDecided = true; // one decision per gesture
      if (step(dy > 0 ? 1 : -1) && e.cancelable) e.preventDefault();
    };
    const onTouchEnd = () => {
      touching = false;
      onScroll();
    };

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      let dir: 1 | -1 | 0 = 0;
      if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) dir = 1;
      if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) dir = -1;
      if (!dir) return;
      if (animating) {
        e.preventDefault();
        return;
      }
      if (step(dir)) e.preventDefault();
    };

    // If the user ends up between stops (scrollbar drag, fast fling, arriving
    // from another section) settle onto the nearest one.
    const settle = () => {
      if (animating || touching) return;
      if (performance.now() - lastWheel < 200) {
        idleTimer = window.setTimeout(settle, 160);
        return;
      }
      const { f, inRange, travel } = state();
      if (!inRange) return;
      const n = Math.round(f);
      if ((Math.abs(f - n) * travel) / SEGMENTS > 2) goTo(n);
    };
    function onScroll() {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(settle, 160);
    }

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(idleTimer);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled, sectionRef]);
}

function PartLayer({ part, progress }: { part: ClipperPart; progress: MotionValue<number> }) {
  const start = part.small
    ? T.smallMoveStart + (part.order - 3) * T.smallStagger
    : T.bigMoveStart + part.order * T.bigStagger;
  const end = part.small ? T.smallMoveEnd : T.bigMoveEnd;

  // 1) collapsed -> exploded position (relative to the stage)
  const y = useTransform(progress, [start, end], [part.dy, 0], { ease: easeOutCubic });
  const x = useTransform(progress, [start, end], [part.dx, 0], { ease: easeOutCubic });
  const yPct = useMotionTemplate`${y}%`;
  const xPct = useMotionTemplate`${x}%`;
  const opacity = useTransform(
    progress,
    part.small ? [T.smallFadeStart, T.smallFadeEnd] : [T.bigFadeStart, T.swapEnd],
    [0, 1],
  );

  // 2) small parts fly off the screen at the very end (viewport units)
  const fly = part.fly ?? { x: 0, y: 0, rot: 0 };
  const fx = useTransform(progress, [T.flyStart, T.flyEnd], [0, fly.x], { ease: easeInCubic });
  const fy = useTransform(progress, [T.flyStart, T.flyEnd], [0, fly.y], { ease: easeInCubic });
  const rot = useTransform(progress, [T.flyStart, T.flyEnd], [0, fly.rot], { ease: easeInCubic });
  const flyX = useMotionTemplate`${fx}vw`;
  const flyY = useMotionTemplate`${fy}vh`;

  return (
    // The wrapper spans the whole stage so % translations are relative to the stage.
    <motion.div className="pointer-events-none absolute inset-0" style={{ x: xPct, y: yPct, opacity }}>
      <motion.div
        className="absolute"
        style={{
          left: `${part.left}%`,
          top: `${part.top}%`,
          width: `${part.width}%`,
          height: `${part.height}%`,
          x: flyX,
          y: flyY,
          rotate: rot,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/clipper/${part.id}.webp`} alt="" draggable={false} className="h-full w-full select-none" />
      </motion.div>
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
  const opacity = useTransform(
    progress,
    [T.labelsIn, T.labelsFull, T.labelsOutStart, T.labelsOutEnd],
    [0, 1, 1, 0],
  );
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

export default function ScrollExplode({ heightClass = DEFAULT_HEIGHT }: { heightClass?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  useSegmentedScroll(containerRef, !reduceMotion);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  // Ease the raw scroll value so the animation never looks steppy.
  const smooth = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.6, restDelta: 0.0004 });
  const progress = reduceMotion ? scrollYProgress : smooth;

  const assembledOpacity = useTransform(progress, [T.swapStart, T.swapEnd], [1, 0]);
  const stageDim = useTransform(progress, [T.dimStart, T.dimEnd], [1, 0.22]);

  const textOpacity1 = useTransform(progress, [0, 0.07, 0.15], [1, 1, 0]);
  const textOpacity2 = useTransform(progress, [0.1, 0.22, 0.77, 0.87], [0, 1, 1, 0]);
  const textOpacity3 = useTransform(progress, [T.outroStart, T.outroEnd], [0, 1]);

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
            <PartLayer key={p.id} part={p} progress={progress} />
          ))}

          {/* callouts (wide screens only) */}
          {clipperLabels.map((l) => {
            const part = clipperParts.find((p) => p.id === l.id);
            return part ? <Label key={l.id} part={part} side={l.side} progress={progress} /> : null;
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

'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { useAnimationFrame, useInView, useReducedMotion } from 'framer-motion';
import { clipperParts } from '@/lib/clipperParts';

// Left: headline. Right: the assembled clipper lies on a tilted plane and turns
// slowly like a turntable while smaller pieces orbit it at different distances,
// depths, directions and speeds, with mouse parallax. CSS transforms only (no
// WebGL, no scroll pinning), driven by one animation-frame loop that pauses
// when the section is off screen.

const SPIN_DEG_PER_SEC = 4; // one slow turn of the clipper every 90s
const PLANE_TILT = 60; // degrees the plane leans back from the viewer
const PLANE_YAW = -7; // slight sideways axis tilt

type Orbiter = {
  id: string;
  size: number; // width as a fraction of the stage
  rx: number; // orbit half-width as a fraction of the stage
  flat: number; // ellipse flattening (smaller = flatter orbit, more depth cue)
  phi: number; // orbit rotation in degrees (different trajectories)
  speed: number; // degrees per second, sign = direction
  start: number; // starting angle in degrees
  spin: number; // own rotation, degrees per second
  layer: number; // parallax strength 0..1 (bigger = closer to the viewer)
};

const ORBITERS: Orbiter[] = [
  // medium pieces
  { id: 'grip', size: 0.2, rx: 0.5, flat: 0.34, phi: -14, speed: 7, start: 20, spin: 9, layer: 0.9 },
  { id: 'core', size: 0.17, rx: 0.62, flat: 0.5, phi: 24, speed: -5, start: 150, spin: -12, layer: 0.7 },
  { id: 'blade', size: 0.22, rx: 0.42, flat: 0.28, phi: 6, speed: -9, start: 250, spin: 14, layer: 1 },
  { id: 'half-l', size: 0.13, rx: 0.72, flat: 0.42, phi: -32, speed: 4, start: 80, spin: -8, layer: 0.5 },
  { id: 'cap', size: 0.15, rx: 0.56, flat: 0.62, phi: 40, speed: 6, start: 310, spin: 16, layer: 0.6 },
  // small pieces
  { id: 'rod', size: 0.17, rx: 0.8, flat: 0.3, phi: 12, speed: -3.5, start: 200, spin: 18, layer: 0.25 },
  { id: 'screw-tl', size: 0.07, rx: 0.36, flat: 0.55, phi: -50, speed: 13, start: 60, spin: 90, layer: 1 },
  { id: 'screw-r', size: 0.06, rx: 0.66, flat: 0.7, phi: 70, speed: -11, start: 330, spin: -120, layer: 0.8 },
  { id: 'trim-l', size: 0.15, rx: 0.88, flat: 0.4, phi: -20, speed: 3, start: 120, spin: 10, layer: 0.2 },
  { id: 'screw-l', size: 0.055, rx: 0.5, flat: 0.8, phi: 20, speed: -15, start: 10, spin: 150, layer: 0.95 },
  { id: 'trim-r', size: 0.12, rx: 0.76, flat: 0.55, phi: 55, speed: -4.5, start: 280, spin: -14, layer: 0.35 },
];

const partById = (id: string) => clipperParts.find((p) => p.id === id)!;
const rad = (d: number) => (d * Math.PI) / 180;

export default function ClipperBreakdown() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const time = useRef(0);

  const inView = useInView(sectionRef, { amount: 0.15, initial: true });
  const reduced = useReducedMotion();

  const render = (t: number, dt: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const S = stage.clientWidth;

    // ease the pointer toward its target so parallax glides
    const p = pointer.current;
    const k = dt > 0 ? 1 - Math.exp(-dt * 4) : 1;
    p.sx += (p.x - p.sx) * k;
    p.sy += (p.y - p.sy) * k;

    if (planeRef.current) {
      planeRef.current.style.transform = `translate(-50%, -50%) rotateX(${PLANE_TILT + p.sy * -4}deg) rotateY(${PLANE_YAW + p.sx * 5}deg) rotateZ(${t * SPIN_DEG_PER_SEC}deg)`;
    }

    ORBITERS.forEach((o, i) => {
      const el = itemRefs.current[i];
      if (!el) return;
      const th = rad(o.start + o.speed * t);
      const R = o.rx * S * 0.7; // keeps the widest orbit inside the column
      const ex = R * Math.cos(th);
      const ey = R * o.flat * Math.sin(th);
      const ph = rad(o.phi);
      const x = ex * Math.cos(ph) - ey * Math.sin(ph);
      const y = ex * Math.sin(ph) + ey * Math.cos(ph) - S * 0.06;

      // depth: sin(theta) > 0 means the piece is on the near side of its orbit
      const d = (Math.sin(th) + 1) / 2; // 0 far .. 1 near
      const scale = 0.7 + 0.5 * d;
      const blur = (1 - d) * 2.5 * (1.2 - o.layer * 0.5);
      const par = 8 + o.layer * 26;

      el.style.transform = `translate(-50%, -50%) translate(${x + p.sx * par}px, ${y + p.sy * par * 0.7}px) scale(${scale}) rotate(${o.spin * t}deg)`;
      el.style.opacity = String(0.55 + 0.45 * d);
      el.style.filter = blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : 'none';
      el.style.zIndex = d > 0.5 ? '30' : '5'; // near pieces pass in front of the clipper, far ones behind
    });
  };

  // paint a first frame before any animation runs (and for reduced motion)
  useLayoutEffect(() => {
    render(0, 0);
  });

  useAnimationFrame((_, delta) => {
    if (!inView || reduced) return;
    const dt = delta / 1000;
    time.current += dt;
    render(time.current, dt);
  });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      pointer.current.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.current.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
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
          className="absolute inset-0 hidden h-full w-full object-cover opacity-30 md:block"
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_55%,rgba(212,175,55,0.16),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-4 px-6 pb-12 pt-28 md:grid-cols-2 md:px-12 md:py-0">
        {/* left: text */}
        <div className="text-center md:text-left">
          <h2 className="text-5xl font-black uppercase leading-none tracking-tighter text-white md:text-6xl lg:text-8xl">
            Precision<br />
            <span className="text-[#facc15]">Engineered</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-gray-300 md:mx-0 md:text-xl">
            Experience the absolute best grooming in Tracy, California. Dissecting the details of a perfect cut.
          </p>
        </div>

        {/* right: turntable stage */}
        <div className="flex justify-center">
          <div
            ref={stageRef}
            className="relative aspect-square w-[min(88vw,64vh,600px)]"
            style={{ perspective: 1100 }}
          >
            {/* plane shadow / glow */}
            <div className="pointer-events-none absolute left-1/2 top-[56%] h-[26%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.28),rgba(0,0,0,0)_70%)] blur-xl" />

            {/* the assembled clipper, lying on the plane and turning slowly */}
            <div
              ref={planeRef}
              className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ height: '78%', aspectRatio: '370 / 760', transformStyle: 'preserve-3d', willChange: 'transform' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/clipper/assembled.webp"
                alt="Golden State professional clipper"
                draggable={false}
                className="h-full w-full select-none object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.7)]"
              />
            </div>

            {/* orbiting pieces */}
            {ORBITERS.map((o, i) => {
              const part = partById(o.id);
              const aspect = (part.width * 370) / (part.height * 760);
              return (
                <div
                  key={o.id}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  className="pointer-events-none absolute left-1/2 top-1/2"
                  style={{ width: `${o.size * 100}%`, aspectRatio: String(aspect), willChange: 'transform, filter, opacity' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/clipper/${o.id}.webp`}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="h-full w-full select-none object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

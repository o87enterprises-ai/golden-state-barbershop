'use client';

import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useInView, useReducedMotion } from 'framer-motion';
import ClipperOrbit2D from './ClipperOrbit2D';

const SolarScene = dynamic(() => import('./3d/SolarScene'), { ssr: false });

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

// If the 3D scene throws (bad model, lost context), swap to the 2D version.
class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// Hero: headline on the left over a full-bleed 3D "spaceship window" — clippers
// as the sun, brush as the earth, bottle as the moon. Browsers without WebGL
// get the 2D spin-and-orbit version instead.
export default function ClipperBreakdown() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.1, initial: true });
  const reduced = useReducedMotion();
  const [gl, setGl] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => setGl(webglAvailable()), []);

  if (gl === false || failed) return <ClipperOrbit2D />;

  return (
    <section
      ref={ref}
      aria-label="Precision engineered"
      className="relative flex min-h-screen w-full items-start overflow-hidden bg-[#05060a] md:items-center"
    >
      {gl && (
        <Boundary fallback={<ClipperOrbit2D />}>
          <SolarScene active={inView} motion={!reduced} onFail={() => setFailed(true)} />
        </Boundary>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#05060a]/90 via-[#05060a]/35 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#05060a]/70 via-transparent to-[#05060a]/80" />

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-7xl px-6 pb-12 pt-28 md:px-12 md:py-0">
        <div className="max-w-xl text-center md:text-left">
          <h2 className="text-5xl font-black uppercase leading-none tracking-tighter text-white md:text-6xl lg:text-8xl">
            Precision<br />
            <span className="text-[#facc15]">Engineered</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-gray-300 md:mx-0 md:text-xl">
            Experience the absolute best grooming in Tracy, California. Dissecting the details of a perfect cut.
          </p>
        </div>
      </div>
    </section>
  );
}

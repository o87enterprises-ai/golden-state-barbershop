'use client';

import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useInView, useReducedMotion } from 'framer-motion';

const SolarScene = dynamic(() => import('./3d/SolarScene'), { ssr: false });

// True only for GPU-accelerated WebGL. Software renderers (SwiftShader, llvmpipe,
// Microsoft Basic Render Driver) technically work but crawl, so they get the video.
function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ||
      c.getContext('webgl', { failIfMajorPerformanceCaveat: true })) as WebGLRenderingContext | null;
    if (!gl) return false;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    return !/swiftshader|llvmpipe|software|basic render|warp|microsoft basic/i.test(name);
  } catch {
    return false;
  }
}

// Pre-rendered loop of the same scene, for browsers that can't run WebGL.
function LoopVideo({ playing }: { playing: boolean }) {
  const v = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = v.current;
    if (!el) return;
    if (playing) el.play().catch(() => {});
    else el.pause();
  }, [playing]);
  return (
    <video
      ref={v}
      src="/media/hero-loop.mp4"
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      className="absolute inset-0 z-0 h-full w-full object-cover object-[72%_center]"
    />
  );
}

// If the 3D scene throws (bad model, lost context), swap to the video.
class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// Hero: headline on the left over a full-bleed 3D "spaceship window" — scissors
// as the sun, brush as the earth, bottle as the moon. Browsers without WebGL
// (and anyone who prefers reduced motion) get the pre-rendered video loop.
export default function ClipperBreakdown() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.1, initial: true });
  const reduced = useReducedMotion();
  const [gl, setGl] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => setGl(webglAvailable()), []);

  const video = <LoopVideo playing={inView && !reduced} />;

  return (
    <section
      ref={ref}
      aria-label="Precision engineered"
      className="relative flex min-h-screen w-full items-start overflow-hidden bg-[#05060a] md:items-center"
    >
      {gl === true && !failed && (
        <Boundary fallback={video}>
          <SolarScene active={inView} motion={!reduced} onFail={() => setFailed(true)} />
        </Boundary>
      )}
      {(gl === false || failed) && video}

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

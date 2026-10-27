'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import dynamic from 'next/dynamic';

const ClipperScene = dynamic(
  () => import('./3d/ClipperScene').then((m) => m.ClipperScene),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 z-0 flex items-center justify-center text-white">
        Loading 3D Scene…
      </div>
    ),
  }
);

// 'use client' components are still pre-rendered on the server — guard the plugin registration.
if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

export default function ClipperBreakdown() {
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<THREE.Group>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready) return;

    const container = containerRef.current;
    const group = groupRef.current;
    const video = videoRef.current;
    if (!container || !group || !video) return;

    const parts = group.children;
    if (parts.length < 3) return; // model not populated yet

    const mm = gsap.matchMedia();

    mm.add(
      {
        ok: '(prefers-reduced-motion: no-preference)',
        reduced: '(prefers-reduced-motion: reduce)',
      },
      (ctx) => {
        const { reduced } = ctx.conditions as { ok: boolean; reduced: boolean };
        if (reduced) return; // static, no pin — text stays readable

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: '+=4000', // Increased scroll distance to accommodate the video and 3D
            scrub: 1.2,
            pin: true,
            anticipatePin: 1,
          },
        });

        // Phase 1 — Video Scrub & Dissection
        // We scrub the video's currentTime from 0 to 15 (assuming a 15s video) alongside the 3D parts
        tl.to(video, { currentTime: 15, duration: 2, ease: 'none' }, 0)
          .to(parts[0].position, { y: 4, z: -2, duration: 1 }, 0)
          .to(parts[0].rotation, { z: 0.5, duration: 1 }, 0)
          .to(parts[1].position, { y: 0, z: 0, duration: 1 }, 0)
          .to(parts[2].position, { y: -4, z: 2, duration: 1 }, 0)
          .to(parts[2].rotation, { z: 1, duration: 1 }, 0)
          
          // Phase 2 — Camera tilt
          .to(group.rotation, { x: 0.6, y: -0.4, duration: 1 }, 1)
          
          // Phase 3 — Orbital
          .to(group.rotation, { y: Math.PI * 2, duration: 2, ease: 'none' }, 2)
          .to(parts[2].position, { x: 3, y: 0, z: 3, duration: 2, ease: 'power1.inOut' }, 2)
          .to(parts[2].rotation, { z: Math.PI * 2, duration: 2, ease: 'power1.inOut' }, 2);
      }
    );

    ScrollTrigger.refresh();

    return () => mm.revert(); // ✅ kills timeline + ScrollTrigger + pin
  }, [ready]);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-[#0a0a0a]"
    >
      {/* 1. The Video Background Layer */}
      <video
        ref={videoRef}
        src="/clippers.mp4"
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      
      {/* 2. Gradient Overlays to ensure text and 3D pop */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent pointer-events-none" />

      {/* 3. The 3D Canvas Layer */}
      <ClipperScene ref={groupRef} onReady={() => setReady(true)} />

      {/* 4. The Text Layer */}
      <div className="pointer-events-none relative z-10 flex h-full w-full flex-col justify-center px-8 md:px-24">
        <div className="max-w-xl">
          <h1 className="text-5xl font-black uppercase leading-none tracking-tighter text-white md:text-8xl">
            Precision<br />
            <span className="text-[#facc15]">Engineered</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-gray-300 md:text-xl">
            Experience the absolute best grooming in Tracy, California. Dissecting the details of a perfect cut.
          </p>
        </div>
      </div>
    </div>
  );
}
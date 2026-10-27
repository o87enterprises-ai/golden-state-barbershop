'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import dynamic from 'next/dynamic';

const ClipperScene = dynamic(
  () => import('./3d/ClipperScene').then((m) => m.ClipperScene),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 z-0 flex items-center justify-center text-white/40">
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

  const [sceneReady, setSceneReady] = useState(false);
  const [sceneBlocked, setSceneBlocked] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  // Scrubbing an mp4 stutters on phones and costs battery, so small screens and
  // reduced-motion users get a static backdrop instead of the video.
  const [useVideo, setUseVideo] = useState<boolean | null>(null);

  const onReady = useCallback(() => setSceneReady(true), []);
  const onUnavailable = useCallback(() => setSceneBlocked(true), []);

  useEffect(() => {
    const small = window.matchMedia('(max-width: 767px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setUseVideo(!small.matches && !reduced.matches);
    update();
    small.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => {
      small.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!sceneReady || sceneBlocked || useVideo === null) return;
    if (useVideo && !videoReady) return;

    const container = containerRef.current;
    const group = groupRef.current;
    if (!container || !group) return;

    const blade = group.getObjectByName('Blade');
    const motor = group.getObjectByName('Motor');
    const coil = group.getObjectByName('Coil');
    if (!blade || !motor || !coil) return; // model without the expected part names: stay static

    const video = videoRef.current;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=4000',
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Phase 1 — video scrub + dissection
      if (video && Number.isFinite(video.duration)) {
        tl.to(video, { currentTime: video.duration, duration: 2, ease: 'none' }, 0);
      }
      tl.to(blade.position, { y: 4, z: -2, duration: 1 }, 0)
        .to(blade.rotation, { z: 0.5, duration: 1 }, 0)
        .to(motor.position, { y: 0, z: 0, duration: 1 }, 0)
        .to(coil.position, { y: -4, z: 2, duration: 1 }, 0)
        .to(coil.rotation, { z: 1, duration: 1 }, 0)

        // Phase 2 — camera tilt
        .to(group.rotation, { x: 0.6, y: -0.4, duration: 1 }, 1)

        // Phase 3 — orbital
        .to(group.rotation, { y: Math.PI * 2, duration: 2, ease: 'none' }, 2)
        .to(coil.position, { x: 3, y: 0, z: 3, duration: 2, ease: 'power1.inOut' }, 2)
        .to(coil.rotation, { z: Math.PI * 2, duration: 2, ease: 'power1.inOut' }, 2);
    });

    ScrollTrigger.refresh();

    return () => mm.revert(); // kills timeline + ScrollTrigger + pin
  }, [sceneReady, sceneBlocked, useVideo, videoReady]);

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#0a0a0a]">
      {/* 1. Backdrop: scrubbed video on capable screens, static gradient elsewhere */}
      {useVideo ? (
        <video
          ref={videoRef}
          src="/clippers.mp4"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onLoadedMetadata={() => setVideoReady(true)}
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(212,175,55,0.18),transparent_60%)]" />
      )}

      {/* 2. Gradient overlays to keep text and the model readable */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />

      {/* 3. 3D canvas */}
      <ClipperScene ref={groupRef} onReady={onReady} onUnavailable={onUnavailable} />

      {/* 4. Headline */}
      <div className="pointer-events-none relative z-10 flex h-full w-full flex-col justify-start px-6 pt-24 md:justify-center md:px-24 md:pt-0">
        <div className="max-w-xl text-center md:text-left">
          <h2 className="text-5xl font-black uppercase leading-none tracking-tighter text-white md:text-8xl">
            Precision<br />
            <span className="text-[#facc15]">Engineered</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-gray-300 md:mx-0 md:text-xl">
            Experience the absolute best grooming in Tracy, California. Dissecting the details of a perfect cut.
          </p>
        </div>
      </div>
    </div>
  );
}

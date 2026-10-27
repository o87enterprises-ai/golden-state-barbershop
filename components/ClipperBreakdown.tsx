'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import dynamic from 'next/dynamic';

const ClipperScene = dynamic(
  () => import('./3d/ClipperScene').then((mod) => mod.ClipperScene),
  { 
    ssr: false,
    loading: () => <div className="absolute inset-0 flex items-center justify-center text-white z-0">Loading 3D Scene...</div>
  }
);

gsap.registerPlugin(ScrollTrigger);

export default function ClipperBreakdown() {
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    // We use a slight timeout to ensure the dynamically imported Canvas is fully mounted
    const timeout = setTimeout(() => {
      if (!containerRef.current || !groupRef.current) {
        console.log("Refs not ready yet:", { container: !!containerRef.current, group: !!groupRef.current });
        return;
      }

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: '+=3000',
            scrub: 1.2,
            pin: true,
          },
        });

        const parts = groupRef.current.children;

        tl.to(parts[0].position, { y: 4, z: -2, rotation: 0.5, duration: 1 }, 0)
          .to(parts[1].position, { y: 0, z: 0, duration: 1 }, 0)
          .to(parts[2].position, { y: -4, z: 2, rotation: 1, duration: 1 }, 0)
          .to(groupRef.current.rotation, { x: 0.6, y: -0.4, duration: 1 }, 1)
          .to(groupRef.current.rotation, { y: Math.PI * 2, duration: 2, ease: "none" }, 2)
          .to(parts[2].position, { x: 3, y: 0, z: 3, rotation: Math.PI * 2, duration: 2, ease: "power1.inOut" }, 2);

      }, containerRef);

      return () => ctx.revert();
    }, 500); // 500ms delay to allow dynamic component to mount

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#0a0a0a]">
      
      {/* 3D Canvas Layer */}
      <ClipperScene ref={groupRef} />

      {/* Scrolling UI Overlay Layer */}
      <div className="relative z-10 h-full w-full pointer-events-none flex flex-col justify-center px-8 md:px-24">
        <div className="max-w-xl">
          <div className="section-text">
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none">
              Precision<br />
              <span className="text-[#facc15]">Engineered</span>
            </h1>
            <p className="mt-6 text-xl text-gray-400 max-w-md">
              Experience the absolute best grooming in Tracy, California. Dissecting the details of a perfect cut.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { forwardRef, type ReactNode } from 'react';
import * as THREE from 'three';

type Props = { onReady?: () => void; children?: ReactNode };

function ResponsiveGroup({
  groupRef,
  children,
}: {
  groupRef: React.Ref<THREE.Group>;
  children: ReactNode;
}) {
  const { viewport } = useThree();
  // 0.3 of half-viewport keeps the model visible from 320px up to ultrawide,
  // clamped so it never drifts off screen on very wide canvases.
  const x = Math.min(viewport.width * 0.3, 3.5);
  return (
    <group ref={groupRef} position={[x, 0, 0]}>
      {children}
    </group>
  );
}

export const ClipperScene = forwardRef<THREE.Group, Props>(
  ({ onReady, children }, ref) => (
    <div className="absolute inset-0 z-0 h-full w-full">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={() => onReady?.()}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[-10, 5, -5]} intensity={3} color="#facc15" />
        <pointLight position={[5, -5, -5]} intensity={2} color="#dc2626" />

        <ResponsiveGroup groupRef={ref}>
          {/* Placeholder: Top Blade */}
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[1, 0.2, 4]} />
            <meshStandardMaterial color="#d4d4d8" metalness={1} roughness={0.1} />
          </mesh>

          {/* Placeholder: Motor Body */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 3, 32]} />
            <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.4} />
          </mesh>

          {/* Placeholder: Copper Coil */}
          <mesh position={[0, -1.5, 0]}>
            <torusGeometry args={[0.6, 0.2, 16, 32]} />
            <meshStandardMaterial color="#b87333" metalness={1} roughness={0.2} />
          </mesh>

          {children}
        </ResponsiveGroup>
      </Canvas>
    </div>
  )
);

ClipperScene.displayName = 'ClipperScene';
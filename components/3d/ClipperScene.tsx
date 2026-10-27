'use client';

import { Canvas } from '@react-three/fiber';
import { forwardRef } from 'react';
import * as THREE from 'three';

export const ClipperScene = forwardRef<THREE.Group>((props, ref) => {
  return (
    <div className="w-full h-full absolute inset-0 z-0">
      {/* Removed Environment, added simple lights */}
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} gl={{ alpha: true, antialias: true }}>
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[-10, 5, -5]} intensity={3} color="#facc15" /> {/* Gold Rim */}
        <pointLight position={[5, -5, -5]} intensity={2} color="#dc2626" /> {/* Red Rim */}
        
        <group ref={ref} position={[3.5, 0, 0]}>
          
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
          
        </group>
      </Canvas>
    </div>
  );
});

ClipperScene.displayName = 'ClipperScene';
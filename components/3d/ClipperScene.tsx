'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Component, Suspense, forwardRef, useEffect, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import WebGLFallback, { webglAvailable } from './WebGLFallback';

type Props = {
  /** Fires once the clipper's named parts (Blade / Motor / Coil) are in the scene. */
  onReady?: () => void;
  /** Fires when WebGL can't run, so the parent can skip the scroll animation. */
  onUnavailable?: () => void;
};

const MODEL_URL = '/clipper.glb';

function ResponsiveGroup({
  groupRef,
  children,
}: {
  groupRef: React.Ref<THREE.Group>;
  children: ReactNode;
}) {
  const { viewport } = useThree();
  // Centered on phones, nudged right on desktop where the headline sits left.
  const x = viewport.width < 5 ? 0 : Math.min(viewport.width * 0.3, 3.5);
  return (
    <group ref={groupRef} position={[x, 0, 0]}>
      {children}
    </group>
  );
}

// Used until the artist-provided public/clipper.glb exists. Parts carry the same
// names the animation looks up, so both versions animate identically.
function PlaceholderClipper({ onReady }: { onReady?: () => void }) {
  useEffect(() => onReady?.(), [onReady]);
  return (
    <>
      <mesh name="Blade" position={[0, 1.5, 0]}>
        <boxGeometry args={[1, 0.2, 4]} />
        <meshStandardMaterial color="#d4d4d8" metalness={1} roughness={0.1} />
      </mesh>
      <mesh name="Motor" position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 3, 32]} />
        <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh name="Coil" position={[0, -1.5, 0]}>
        <torusGeometry args={[0.6, 0.2, 16, 32]} />
        <meshStandardMaterial color="#b87333" metalness={1} roughness={0.2} />
      </mesh>
    </>
  );
}

function GlbClipper({ onReady }: { onReady?: () => void }) {
  const { scene } = useGLTF(MODEL_URL);
  useEffect(() => onReady?.(), [scene, onReady]);
  return <primitive object={scene} />;
}

// A bad or truncated .glb must never take the page down — fall back to the placeholder.
class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Clipper({ onReady }: { onReady?: () => void }) {
  const [hasModel, setHasModel] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(MODEL_URL, { method: 'HEAD' })
      .then((r) => alive && setHasModel(r.ok && !(r.headers.get('content-type') ?? '').includes('text/html')))
      .catch(() => alive && setHasModel(false));
    return () => {
      alive = false;
    };
  }, []);

  if (hasModel === null) return null;
  if (!hasModel) return <PlaceholderClipper onReady={onReady} />;
  return (
    <ModelBoundary fallback={<PlaceholderClipper onReady={onReady} />}>
      <Suspense fallback={null}>
        <GlbClipper onReady={onReady} />
      </Suspense>
    </ModelBoundary>
  );
}

export const ClipperScene = forwardRef<THREE.Group, Props>(({ onReady, onUnavailable }, ref) => {
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    const ok = webglAvailable();
    setWebgl(ok);
    if (!ok) onUnavailable?.();
  }, [onUnavailable]);

  if (webgl === null) return null;
  if (!webgl) return <WebGLFallback />;

  return (
    <div className="absolute inset-0 z-0 h-full w-full">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 45 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[-10, 5, -5]} intensity={3} color="#facc15" />
        <pointLight position={[5, -5, -5]} intensity={2} color="#dc2626" />

        <ResponsiveGroup groupRef={ref}>
          <Clipper onReady={onReady} />
        </ResponsiveGroup>
      </Canvas>
    </div>
  );
});

ClipperScene.displayName = 'ClipperScene';

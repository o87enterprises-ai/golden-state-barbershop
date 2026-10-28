'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, Stars, useGLTF } from '@react-three/drei';
import { DepthOfField, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';

// The hero "solar system", seen through a spaceship window:
//   clippers = the sun   (huge, slowly spinning)
//   brush    = the earth (1/3 the clippers' size, orbiting the clippers)
//   bottle   = the moon  (1/22 the brush's size, orbiting the brush)
// Orbits are wide enough to leave the frame and swing close to the camera.
// Depth of field + pointer parallax sell the depth.

const URLS = {
  clippers: '/models/clippers.glb',
  brush: '/models/brush.glb',
  bottle: '/models/bottle.glb',
};
Object.values(URLS).forEach((u) => useGLTF.preload(u));

// Sizes in "sun units": the clippers' longest dimension is 1.
const SUN = 1;
const EARTH = SUN / 3;
const MOON = EARTH / 22;

// Orbit speeds in radians per second (all deliberately slow).
const EARTH_SPEED = 0.085; // ~74s per lap
const MOON_SPEED = 0.42; // ~15s per lap around the brush
const SUN_SPIN = 0.05;

// Orbit radii in sun units. The earth's orbit is wider than the frame.
const EARTH_RADIUS = 1.65;
const MOON_RADIUS = 0.34;

// Loads a model, centres it, and scales its longest side to `size`.
function Model({ url, size }: { url: string; size: number }) {
  const { scene } = useGLTF(url);
  const obj = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const dims = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    const wrap = new THREE.Group();
    wrap.add(clone);
    wrap.scale.setScalar(size / Math.max(dims.x, dims.y, dims.z));
    return wrap;
  }, [scene, size]);
  return <primitive object={obj} />;
}

// Offline recording: time is driven externally and every speed is a whole number of
// laps per loop, so the captured video repeats seamlessly.
export type Recorder = {
  loop: number; // seconds
  time: { current: number };
  onReady: (api: { advance: (t: number) => void; canvas: HTMLCanvasElement }) => void;
};

function Bridge({ rec }: { rec: Recorder }) {
  const { advance, gl } = useThree();
  useEffect(() => {
    rec.onReady({ advance: (t) => advance(t), canvas: gl.domElement });
  }, [advance, gl, rec]);
  return null;
}

function System({ motion, rec }: { motion: boolean; rec?: Recorder }) {
  const { viewport, camera, pointer } = useThree();

  const sun = useRef<THREE.Group>(null);
  const earthOrbit = useRef<THREE.Group>(null);
  const earth = useRef<THREE.Group>(null);
  const moonOrbit = useRef<THREE.Group>(null);
  const moon = useRef<THREE.Group>(null);
  const t0 = useRef(0);

  // Fit to the window: sun fills most of the height; on wide screens it sits right of the headline.
  const wide = viewport.width / viewport.height > 1.15;
  const scale = Math.min(viewport.height * 1.12, viewport.width * (wide ? 0.62 : 1.05));
  const cx = wide ? viewport.width * 0.2 : 0;
  const cy = wide ? 0 : -viewport.height * 0.2;

  const aim = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    if (motion && !rec) t0.current += dt;
    const t = rec ? rec.time.current : t0.current;
    const w = rec ? (Math.PI * 2) / rec.loop : 0; // radians/sec for one lap per loop

    // sun: slow turn about its flat axis, with a gentle wobble
    if (sun.current) {
      sun.current.rotation.y = rec ? w * t : t * SUN_SPIN;
      sun.current.rotation.z = rec ? Math.sin(w * t) * 0.06 : Math.sin(t * 0.07) * 0.06;
    }

    // earth: tilted elliptical orbit around the sun, passing close to the camera
    if (earthOrbit.current) {
      const a = (rec ? w : EARTH_SPEED) * t + 0.5;
      earthOrbit.current.position.set(
        Math.cos(a) * EARTH_RADIUS,
        Math.sin(a) * EARTH_RADIUS * 0.28,
        Math.sin(a) * EARTH_RADIUS * 0.4
      );
    }
    if (earth.current) {
      earth.current.rotation.y = rec ? w * t * 2 : t * 0.18;
      earth.current.rotation.x = rec ? w * t : t * 0.07;
    }

    // moon: faster, differently tilted orbit around the earth
    if (moonOrbit.current) {
      const a = (rec ? w * 4 : MOON_SPEED) * t;
      moonOrbit.current.position.set(
        Math.cos(a) * MOON_RADIUS,
        Math.sin(a) * MOON_RADIUS * 0.6,
        Math.sin(a * 1.0) * MOON_RADIUS * 0.8
      );
    }
    if (moon.current) {
      moon.current.rotation.x = rec ? w * t * 9 : t * 0.9;
      moon.current.rotation.z = rec ? w * t * 5 : t * 0.5;
    }

    // pointer parallax: nudge the camera, keep looking at the sun
    camera.position.x += (pointer.x * 1.4 - camera.position.x) * Math.min(1, dt * 2.5);
    camera.position.y += (pointer.y * 0.9 - camera.position.y) * Math.min(1, dt * 2.5);
    aim.set(0, 0, 0);
    camera.lookAt(aim);
  });

  return (
    <group position={[cx, cy, 0]} scale={scale}>
      {/* sun: model lies flat, so tip it face-on to the viewer */}
      <group rotation={[1.12, 0, 0]}>
        <group ref={sun}>
          <Model url={URLS.clippers} size={SUN} />
        </group>
      </group>

      {/* earth orbit: tilted plane (rotation of this group is the orbit's tilt) */}
      <group rotation={[0.5, 0, -0.18]}>
        <group ref={earthOrbit}>
          <group ref={earth}>
            <Model url={URLS.brush} size={EARTH} />
          </group>

          {/* moon orbits the earth, in its own tilted plane */}
          <group rotation={[-0.6, 0.3, 0.5]}>
            <group ref={moonOrbit}>
              <group ref={moon} rotation={[-Math.PI / 2, 0, 0]}>
                <Model url={URLS.bottle} size={MOON} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

export default function SolarScene({ active, motion, onFail, recorder }: { active: boolean; motion: boolean; onFail?: () => void; recorder?: Recorder }) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        dpr={recorder ? 1 : [1, 1.75]}
        camera={{ position: [0, 0, 16], fov: 38, near: 0.1, far: 200 }}
        frameloop={recorder ? 'never' : active ? 'always' : 'never'}
        gl={{ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!recorder }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
        // if the context is lost or can't be made, let the page fall back
        onError={onFail}
      >
        <color attach="background" args={['#05060a']} />
        <fog attach="fog" args={['#05060a', 40, 120]} />

        <ambientLight intensity={0.9} />
        <directionalLight position={[-8, 10, 12]} intensity={5} color="#fff3dc" />
        <pointLight position={[14, -4, -10]} intensity={260} color="#facc15" />
        <pointLight position={[-14, -8, 6]} intensity={90} color="#dc2626" />

        <Suspense fallback={null}>
          <Environment resolution={256} environmentIntensity={1.4}>
            <Lightformer form="rect" intensity={4} position={[-6, 6, 4]} scale={[10, 4, 1]} color="#fff6e5" />
            <Lightformer form="rect" intensity={3} position={[8, -2, -6]} scale={[10, 6, 1]} color="#facc15" />
            <Lightformer form="ring" intensity={2} position={[0, 8, -8]} scale={6} color="#ffffff" />
          </Environment>
          <Stars radius={90} depth={60} count={2500} factor={5} saturation={0} fade speed={recorder ? 0 : 0.4} />
          <System motion={motion} rec={recorder} />
          {recorder && <Bridge rec={recorder} />}
        </Suspense>

        <EffectComposer multisampling={0}>
          <DepthOfField worldFocusDistance={16} worldFocusRange={9} bokehScale={3} height={480} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

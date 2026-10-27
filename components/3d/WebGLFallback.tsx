"use client";

// Shown in place of the 3D canvas when the browser can't create a WebGL
// context (blocked GPU, old driver, some Firefox setups). The headline and the
// rest of the page render normally around it.
export default function WebGLFallback() {
  return (
    <div
      role="img"
      aria-label="3D clipper preview unavailable"
      className="absolute inset-0 z-0 flex items-end justify-end p-6 md:items-center md:justify-center"
    >
      <p className="max-w-xs rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-right font-sans text-xs text-white/50 backdrop-blur-sm md:text-center">
        Enable hardware acceleration in your browser to see the 3D clipper.
      </p>
    </div>
  );
}

export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

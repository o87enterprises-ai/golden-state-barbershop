// Generated from the exploded / assembled clipper renders (public/clipper/*.webp).
// Positions are percentages of the stage (370x760 source px).
// dx / dy: offset (in % of stage) from the final exploded position back to the
// collapsed "assembled" position the part starts from.
export type ClipperPart = {
  id: string;
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  dx: number;
  dy: number;
  order: number;
  small: boolean;
  // Where a small part flies to at the end (vw / vh / degrees), well past the screen edge.
  fly?: { x: number; y: number; rot: number };
};

export const STAGE_ASPECT = 370 / 760;

export const assembled = { left: 13.514, top: 12.368, width: 60.27, height: 82.105 };

export const clipperParts: ClipperPart[] = [
  { id: "blade", label: "Precision blade", left: 21.081, top: 1.711, width: 56.216, height: 8.947, dx: 0, dy: 7.82, order: 0, small: false },
  { id: "shell", label: "Top shell", left: 16.757, top: 11.974, width: 64.324, height: 6.711, dx: 0, dy: 5.67, order: 1, small: false },
  { id: "frame", label: "Casing", left: 14.324, top: 20.263, width: 68.378, height: 10.0, dx: 0, dy: 3.74, order: 2, small: false },
  { id: "rod", label: "Drive rod", left: 30.27, top: 31.184, width: 36.486, height: 3.421, dx: -0.01, dy: 3.1, order: 3, small: true, fly: { x: 40, y: -110, rot: 200 } },
  { id: "screw-tl", label: "", left: 13.243, top: 31.974, width: 10.0, height: 4.474, dx: 30.26, dy: 3.79, order: 4, small: true, fly: { x: -110, y: -45, rot: -540 } },
  { id: "screw-tr", label: "", left: 73.784, top: 32.895, width: 9.73, height: 4.474, dx: -30.15, dy: 2.87, order: 4, small: true, fly: { x: 110, y: -55, rot: 540 } },
  { id: "half-l", label: "Housing", left: 12.973, top: 37.237, width: 21.351, height: 17.237, dx: 16.35, dy: -1.85, order: 6, small: false },
  { id: "core", label: "Motor core", left: 34.324, top: 35.0, width: 29.459, height: 22.632, dx: 0, dy: -4.32, order: 6, small: false },
  { id: "half-r", label: "Housing", left: 63.784, top: 37.5, width: 19.73, height: 17.368, dx: -15.65, dy: -2.18, order: 6, small: false },
  { id: "screw-l", label: "", left: 1.622, top: 45.921, width: 7.297, height: 4.737, dx: 43.23, dy: -4.29, order: 5, small: true, fly: { x: -120, y: 10, rot: -720 } },
  { id: "screw-r", label: "", left: 86.486, top: 48.289, width: 7.297, height: 4.474, dx: -41.64, dy: -6.53, order: 5, small: true, fly: { x: 120, y: 25, rot: 720 } },
  { id: "trim-l", label: "Gold trim", left: 11.351, top: 55.921, width: 24.324, height: 4.079, dx: 20.49, dy: -14.96, order: 7, small: true, fly: { x: -110, y: 35, rot: -300 } },
  { id: "trim-r", label: "Gold trim", left: 59.73, top: 56.711, width: 24.054, height: 3.947, dx: -18.76, dy: -15.68, order: 7, small: true, fly: { x: 110, y: 25, rot: 300 } },
  { id: "grip", label: "Ergonomic grip", left: 29.459, top: 60.0, width: 35.405, height: 24.737, dx: 0, dy: -6.37, order: 8, small: false },
  { id: "cap", label: "Battery cap", left: 27.568, top: 86.184, width: 37.838, height: 11.579, dx: 0, dy: -1.97, order: 9, small: false },
];

// Labels shown beside the stage on wide screens (part id, side).
export const clipperLabels: { id: string; side: "left" | "right" }[] = [
  { id: "blade", side: "right" },
  { id: "frame", side: "left" },
  { id: "core", side: "right" },
  { id: "grip", side: "left" },
  { id: "cap", side: "right" },
];

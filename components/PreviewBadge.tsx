"use client";

import { OWNER } from "@/lib/legal";

// Small persistent watermark making it unmistakable this is a preview
// owned by o87 Enterprises.
export default function PreviewBadge() {
  return (
    <div className="pointer-events-none fixed bottom-3 left-3 z-[90] select-none">
      <div className="rounded-full border border-brand-gold/30 bg-black/70 px-3 py-1.5 font-sans text-[10px] uppercase tracking-widest text-brand-gold/80 backdrop-blur-sm">
        Mock Preview · Property of {OWNER}
      </div>
    </div>
  );
}

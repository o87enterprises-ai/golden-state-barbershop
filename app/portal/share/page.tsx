"use client";

import { useEffect } from "react";
import { Share2 } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";

export default function SharePage() {
  const { openOverlay } = useDemo();

  useEffect(() => {
    openOverlay({ type: "share" });
  }, [openOverlay]);

  return (
    <div>
      <h2 className="mb-2 font-display text-3xl tracking-widest text-brand-gold">Share Your Look</h2>
      <p className="mb-8 text-sm text-white/50">
        Generate a branded post card and share it to your socials. Opens in a modal.
      </p>
      <button
        onClick={() => openOverlay({ type: "share" })}
        className="flex items-center gap-3 rounded-sm bg-brand-gold px-8 py-3 font-display text-lg tracking-widest text-black transition-colors hover:bg-brand-gold/90"
      >
        <Share2 size={18} /> Open Share Card
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import ScrollExplode from "@/components/ScrollExplode";
import ScrollVideo from "@/components/ScrollVideo";

// Private comparison page for the "Precision Engineered" scroll animation.
// Not linked from the site. Drop the AI clip at public/clippers-ai.mp4 (and set
// its length below) to compare it against the coded version.
const AI_CLIP = { src: "/clippers-ai.mp4", seconds: 5 };

type View = "code" | "video" | "both";

export default function ClipperLab() {
  const [view, setView] = useState<View>("code");
  const tabs: { id: View; label: string }[] = [
    { id: "code", label: "Code" },
    { id: "video", label: "AI video" },
    { id: "both", label: "Side by side" },
  ];
  const H = "h-[400vh]";

  return (
    <main className="min-h-screen bg-black">
      <div className="fixed inset-x-0 bottom-20 z-50 flex justify-center gap-2 px-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={`rounded-sm border px-4 py-1.5 font-display text-sm tracking-widest transition-colors ${
              view === t.id ? "border-brand-gold bg-brand-gold text-black" : "border-white/20 bg-black/80 text-white/70 backdrop-blur"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {view === "code" && <ScrollExplode key="code" heightClass={H} />}
      {view === "video" && <ScrollVideo key="video" {...AI_CLIP} heightClass={H} />}
      {view === "both" && (
        <div className="grid grid-cols-2">
          <div className="border-r border-white/10">
            <ScrollExplode key="both-code" heightClass={H} />
          </div>
          <div>
            <ScrollVideo key="both-video" {...AI_CLIP} heightClass={H} />
          </div>
        </div>
      )}

      <p className="py-10 text-center font-sans text-xs uppercase tracking-widest text-white/30">
        End of comparison
      </p>
    </main>
  );
}

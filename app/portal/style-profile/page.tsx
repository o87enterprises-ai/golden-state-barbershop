"use client";

import { useState } from "react";
import { useDemo } from "@/lib/mock/DemoStore";
import { StyleProfile } from "@/lib/mock/data";

const fields: { key: keyof StyleProfile; label: string; hint: string }[] = [
  { key: "fadeType", label: "Fade Type", hint: "e.g. mid skin fade, taper, blowout" },
  { key: "clipperGuard", label: "Clipper Guards", hint: "guard numbers for sides/top" },
  { key: "lineup", label: "Line-up Preference", hint: "natural, sharp, pushed back" },
  { key: "beard", label: "Beard", hint: "length, cheek line, neckline" },
  { key: "allergies", label: "Allergies / Sensitivities", hint: "fragrances, products, skin" },
  { key: "conversation", label: "Conversation", hint: "chatty or quiet" },
  { key: "products", label: "Product Preferences", hint: "matte, shine, hold" },
  { key: "notes", label: "Notes for your barber", hint: "cowlicks, scars, anything else" },
];

export default function StyleProfilePage() {
  const { styleProfile, updateStyleProfile } = useDemo();
  const [draft, setDraft] = useState<StyleProfile>(styleProfile);

  return (
    <div>
      <h2 className="mb-2 font-display text-3xl tracking-widest text-brand-gold">Custom Styling Guide</h2>
      <p className="mb-8 text-sm text-white/50">
        Your barber sees this before every service — so you get the same great cut every time.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={f.key === "notes" ? "md:col-span-2" : ""}>
            <label className="mb-1 block font-sans text-xs uppercase tracking-wider text-white/50">{f.label}</label>
            {f.key === "notes" ? (
              <textarea
                rows={3}
                value={draft[f.key]}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-brand-charcoal px-4 py-3 text-sm text-white outline-none focus:border-brand-gold"
              />
            ) : (
              <input
                value={draft[f.key]}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                placeholder={f.hint}
                className="w-full rounded-lg border border-white/15 bg-brand-charcoal px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-gold"
              />
            )}
            <p className="mt-1 text-[11px] text-white/30">{f.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={() => updateStyleProfile(draft)}
          className="rounded-sm bg-brand-gold px-8 py-3 font-display text-lg tracking-widest text-black transition-colors hover:bg-brand-gold/90"
        >
          Save Profile
        </button>
        <span className="font-sans text-xs uppercase tracking-widest text-white/30">
          Reference photos — upload coming in production
        </span>
      </div>
    </div>
  );
}

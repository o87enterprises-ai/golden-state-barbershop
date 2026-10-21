"use client";

import { useEffect } from "react";
import { CalendarPlus } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";
import { services, fmt } from "@/lib/mock/data";

export default function PortalBookPage() {
  const { openOverlay } = useDemo();

  // open the shared booking modal immediately for a one-tap flow
  useEffect(() => {
    openOverlay({ type: "book" });
  }, [openOverlay]);

  return (
    <div>
      <h2 className="mb-2 font-display text-3xl tracking-widest text-brand-gold">Book a Cut</h2>
      <p className="mb-8 text-sm text-white/50">
        The booking menu opens in a modal so you never lose your place. Pick a service below to start.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => openOverlay({ type: "book" })}
            className="group flex items-center justify-between rounded-xl border border-white/10 bg-brand-charcoal p-5 text-left transition-colors hover:border-brand-gold/40"
          >
            <div>
              <p className="font-display text-xl tracking-wider text-white">{s.name}</p>
              <p className="mt-1 text-sm text-white/50">{s.minutes} min · {s.category}</p>
            </div>
            <span className="flex items-center gap-2 font-display text-xl text-brand-gold">
              {fmt(s.price)} <CalendarPlus size={18} className="opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

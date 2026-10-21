"use client";

import { Bell, Armchair } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";
import { barberById, ChairState } from "@/lib/mock/data";

const stateMeta: Record<ChairState, { label: string; color: string }> = {
  IDLE: { label: "Idle", color: "text-emerald-400 border-emerald-400/30" },
  IN_SERVICE: { label: "In Service", color: "text-brand-gold border-brand-gold/40" },
  ALMOST_READY: { label: "Almost Ready", color: "text-amber-300 border-amber-400/40" },
};

const states: ChairState[] = ["IDLE", "IN_SERVICE", "ALMOST_READY"];

export default function ChairsPage() {
  const { chairs, setChairState, buzzChair } = useDemo();

  return (
    <div>
      <h2 className="mb-2 font-display text-3xl tracking-widest text-brand-gold">Chair Status</h2>
      <p className="mb-6 text-sm text-white/50">
        Set a chair&apos;s state, then buzz the customer when it&apos;s ready. Open the site in a second tab
        as a <span className="text-brand-gold">Customer</span> to receive the buzz live.
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {chairs.map((c) => {
          const meta = stateMeta[c.state];
          return (
            <div key={c.barberId} className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold/40 to-brand-red/30 font-display text-xl text-black">
                    {barberById(c.barberId)?.initials}
                  </div>
                  <div>
                    <p className="font-display text-xl tracking-wider text-white">{barberById(c.barberId)?.name}</p>
                    <span className={`inline-block rounded-full border px-2 py-0.5 font-sans text-[10px] uppercase tracking-wider ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>
                </div>
                <Armchair className="text-white/20" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {states.map((s) => (
                  <button
                    key={s}
                    onClick={() => setChairState(c.barberId, s)}
                    className={`rounded-full px-3 py-1 font-sans text-[11px] uppercase tracking-wider transition-colors ${
                      c.state === s ? "bg-brand-gold text-black" : "border border-white/15 text-white/50"
                    }`}
                  >
                    {stateMeta[s].label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => buzzChair(c.barberId)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-sm bg-brand-red py-2.5 font-display text-lg tracking-widest text-white transition-colors hover:bg-red-700"
              >
                <Bell size={16} /> Buzz Customer
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

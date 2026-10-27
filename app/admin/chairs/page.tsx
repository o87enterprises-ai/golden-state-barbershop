"use client";

import { Armchair, Bell, EyeOff, Minus, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthStore";
import { useDemo } from "@/lib/mock/DemoStore";
import { ChairState } from "@/lib/mock/data";

const stateMeta: Record<ChairState, { label: string; color: string }> = {
  IDLE: { label: "Idle", color: "text-emerald-400 border-emerald-400/30" },
  IN_SERVICE: { label: "In Service", color: "text-brand-gold border-brand-gold/40" },
  ALMOST_READY: { label: "Almost Ready", color: "text-amber-300 border-amber-400/40" },
};

const states: ChairState[] = ["IDLE", "IN_SERVICE", "ALMOST_READY"];

export default function ChairsPage() {
  const { user } = useAuth();
  const { chairs, barberById, setChairState, buzzChair, addChair, removeChair, clockOut, pushToast } = useDemo();
  const isOwner = user?.role === "admin";

  const release = (barberId: string) => {
    const err = clockOut(barberId);
    pushToast(err ? { title: err } : { kind: "success", title: "Barber clocked out" });
  };

  const remove = (id: string) => {
    const err = removeChair(id);
    if (err) pushToast({ title: err });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-widest text-brand-gold">Chairs</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/50">
            Barbers claim a chair when they clock in. Set a chair&apos;s state, then buzz the customer when it&apos;s ready.
          </p>
        </div>
        {isOwner && (
          <button onClick={addChair} className="flex items-center gap-2 rounded-lg border border-brand-gold/40 px-4 py-2 font-sans text-sm text-brand-gold hover:bg-brand-gold hover:text-black">
            <Plus size={16} /> Add chair
          </button>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {chairs.map((c) => {
          const meta = stateMeta[c.state];
          const occupied = !!c.barberId;
          const mine = user?.id === c.barberId;
          return (
            <div key={c.id} className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-2xl tracking-wider text-white">{c.name}</p>
                  {occupied ? (
                    <p className="mt-0.5 flex items-center gap-1.5 font-sans text-sm text-white/60">
                      {c.incognito && <EyeOff size={13} className="text-brand-gold" />}
                      {barberById(c.barberId!)?.name ?? "Barber"}{c.incognito ? " · incognito" : ""}
                    </p>
                  ) : (
                    <p className="mt-0.5 font-sans text-sm text-white/30">Nobody clocked in</p>
                  )}
                </div>
                <Armchair className={occupied ? "text-brand-gold/50" : "text-white/15"} />
              </div>

              {occupied ? (
                <>
                  <span className={`mt-3 inline-block rounded-full border px-2 py-0.5 font-sans text-[10px] uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {states.map((s) => (
                      <button key={s} onClick={() => setChairState(c.id, s)} className={`rounded-full px-3 py-1 font-sans text-[11px] uppercase tracking-wider transition-colors ${c.state === s ? "bg-brand-gold text-black" : "border border-white/15 text-white/50"}`}>
                        {stateMeta[s].label}
                      </button>
                    ))}
                  </div>
                  {!c.incognito && (
                    <button onClick={() => buzzChair(c.id)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-sm bg-brand-red py-2.5 font-display text-lg tracking-widest text-white transition-colors hover:bg-red-700">
                      <Bell size={16} /> Buzz Customer
                    </button>
                  )}
                  {(isOwner || mine) && (
                    <button onClick={() => release(c.barberId!)} className="mt-2 w-full rounded-sm border border-white/15 py-2 font-sans text-xs uppercase tracking-wider text-white/50 hover:border-brand-red hover:text-brand-red">
                      Clock out {mine ? "" : "barber"}
                    </button>
                  )}
                </>
              ) : (
                isOwner && (
                  <button onClick={() => remove(c.id)} className="mt-5 flex items-center gap-1 font-sans text-xs text-white/30 hover:text-brand-red">
                    <Minus size={13} /> Remove chair
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

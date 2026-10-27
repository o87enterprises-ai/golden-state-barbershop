"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";
import { floorBarbers } from "@/lib/availability";

const statusStyle: Record<string, string> = {
  WAITING: "border-amber-400/40 text-amber-300",
  IN_CHAIR: "border-brand-gold/50 text-brand-gold",
  DONE: "border-white/20 text-white/40",
};

export default function QueuePage() {
  const { queue, barbers, chairs, barberById, setQueueStatus, callNext, addWalkIn, pushToast } = useDemo();
  const floor = floorBarbers({ barbers, chairs });
  const [name, setName] = useState("");
  const [bar, setBar] = useState("");
  const target = floor.some((b) => b.id === bar) ? bar : floor[0]?.id ?? "";

  const add = () => {
    if (!name.trim() || !target) return;
    addWalkIn(name.trim(), target);
    pushToast({ kind: "success", title: "Walk-in added", body: `${name} → ${barberById(target)?.name}` });
    setName("");
  };

  const columns: { key: "WAITING" | "IN_CHAIR" | "DONE"; label: string }[] = [
    { key: "WAITING", label: "Waiting" },
    { key: "IN_CHAIR", label: "In Chair" },
    { key: "DONE", label: "Done" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl tracking-widest text-brand-gold">Live Queue</h1>
        {floor.length > 0 ? (
          <div className="flex items-end gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Walk-in name" aria-label="Walk-in name" className="rounded-lg border border-white/15 bg-brand-charcoal px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-gold" />
            <select value={target} onChange={(e) => setBar(e.target.value)} aria-label="Barber" className="rounded-lg border border-white/15 bg-brand-charcoal px-3 py-2 text-sm text-white outline-none focus:border-brand-gold">
              {floor.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <button onClick={add} className="flex items-center gap-2 rounded-lg bg-brand-gold px-4 py-2 font-sans text-sm font-semibold text-black"><UserPlus size={16} /> Add</button>
          </div>
        ) : (
          <p className="font-sans text-sm text-white/40">Walk-ins open once a barber clocks in.</p>
        )}
      </div>

      {floor.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {floor.map((b) => (
            <button key={b.id} onClick={() => callNext(b.id)} className="rounded-full border border-brand-gold/40 px-4 py-1.5 font-sans text-xs uppercase tracking-wider text-brand-gold transition-colors hover:bg-brand-gold hover:text-black">
              Call next · {b.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => (
          <div key={col.key} className="rounded-2xl border border-white/10 bg-brand-charcoal p-4">
            <h2 className="mb-3 font-sans text-xs uppercase tracking-widest text-white/50">{col.label}</h2>
            <div className="space-y-2">
              {queue.filter((q) => q.status === col.key).map((q) => (
                <div key={q.id} className={`rounded-lg border bg-brand-dark p-3 ${statusStyle[q.status]}`}>
                  <p className="font-sans text-sm text-white">{q.name}</p>
                  <p className="mt-0.5 text-xs text-white/40">{barberById(q.barberId)?.name ?? "Unassigned"}{q.status === "WAITING" ? ` · ~${q.estimatedWait}m` : ""}</p>
                  <div className="mt-2 flex gap-2">
                    {q.status === "WAITING" && <button onClick={() => setQueueStatus(q.id, "IN_CHAIR")} className="rounded bg-brand-gold/20 px-2 py-1 text-[11px] text-brand-gold">Seat</button>}
                    {q.status === "IN_CHAIR" && <button onClick={() => setQueueStatus(q.id, "DONE")} className="rounded bg-white/10 px-2 py-1 text-[11px] text-white/70">Finish</button>}
                  </div>
                </div>
              ))}
              {queue.filter((q) => q.status === col.key).length === 0 && <p className="text-xs text-white/25">Empty</p>}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 font-sans text-xs text-white/30">Seating and finishing a client updates chair status on the public site.</p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";
import { barbers, barberById } from "@/lib/mock/data";

const statusStyle: Record<string, string> = {
  WAITING: "border-amber-400/40 text-amber-300",
  IN_CHAIR: "border-brand-gold/50 text-brand-gold",
  DONE: "border-white/20 text-white/40",
};

export default function QueuePage() {
  const { queue, setQueueStatus, callNext, addWalkIn, pushToast } = useDemo();
  const [name, setName] = useState("");
  const [bar, setBar] = useState(barbers[0].id);

  const add = () => {
    if (!name.trim()) return;
    addWalkIn(name.trim(), bar);
    pushToast({ kind: "success", title: "Walk-in added", body: `${name} → ${barberById(bar)?.name}` });
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
        <h2 className="font-display text-3xl tracking-widest text-brand-gold">Live Queue</h2>
        <div className="flex items-end gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Walk-in name" className="rounded-lg border border-white/15 bg-brand-charcoal px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-gold" />
          <select value={bar} onChange={(e) => setBar(e.target.value)} className="rounded-lg border border-white/15 bg-brand-charcoal px-3 py-2 text-sm text-white outline-none focus:border-brand-gold">
            {barbers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button onClick={add} className="flex items-center gap-2 rounded-lg bg-brand-gold px-4 py-2 font-sans text-sm font-semibold text-black"><UserPlus size={16} /> Add</button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {barbers.map((b) => (
          <button key={b.id} onClick={() => callNext(b.id)} className="rounded-full border border-brand-gold/40 px-4 py-1.5 font-sans text-xs uppercase tracking-wider text-brand-gold transition-colors hover:bg-brand-gold hover:text-black">
            Call next · {b.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => (
          <div key={col.key} className="rounded-2xl border border-white/10 bg-brand-charcoal p-4">
            <h3 className="mb-3 font-sans text-xs uppercase tracking-widest text-white/50">{col.label}</h3>
            <div className="space-y-2">
              {queue.filter((q) => q.status === col.key).map((q) => (
                <div key={q.id} className={`rounded-lg border bg-brand-dark p-3 ${statusStyle[q.status]}`}>
                  <p className="font-sans text-sm text-white">{q.name}</p>
                  <p className="mt-0.5 text-xs text-white/40">{barberById(q.barberId)?.name}{q.status === "WAITING" ? ` · ~${q.estimatedWait}m` : ""}</p>
                  <div className="mt-2 flex gap-2">
                    {q.status === "WAITING" && <button onClick={() => setQueueStatus(q.id, "IN_CHAIR")} className="rounded bg-brand-gold/20 px-2 py-1 text-[11px] text-brand-gold">Seat</button>}
                    {q.status === "IN_CHAIR" && <button onClick={() => setQueueStatus(q.id, "DONE")} className="rounded bg-white/10 px-2 py-1 text-[11px] text-white/70">Finish</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 font-sans text-xs uppercase tracking-widest text-white/30">Changes sync to the homepage lineup in other tabs</p>
    </div>
  );
}

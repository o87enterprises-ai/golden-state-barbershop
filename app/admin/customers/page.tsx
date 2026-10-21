"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { customers, defaultStyleProfile } from "@/lib/mock/data";

export default function CustomersPage() {
  const [open, setOpen] = useState<string | null>(null);
  const selected = customers.find((c) => c.id === open);

  return (
    <div>
      <h2 className="mb-6 font-display text-3xl tracking-widest text-brand-gold">Customers</h2>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-brand-charcoal">
        {customers.map((c) => (
          <button
            key={c.id}
            onClick={() => setOpen(c.id)}
            className="flex w-full items-center justify-between border-b border-white/5 px-5 py-4 text-left transition-colors last:border-none hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold/40 to-brand-red/30 font-display text-black">
                {c.name[0]}
              </div>
              <div>
                <p className="font-sans text-sm text-white">{c.name}</p>
                <p className="text-xs text-white/40">{c.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-xl text-brand-gold">{c.visits}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/40">visits · {c.lastVisit}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-brand-charcoal p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl tracking-widest text-brand-gold">{selected.name}</h3>
              <button onClick={() => setOpen(null)} className="text-white/50 hover:text-white"><X size={20} /></button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-white/40">Email</dt><dd className="text-white/80">{selected.email}</dd></div>
              <div className="flex justify-between"><dt className="text-white/40">Phone</dt><dd className="text-white/80">{selected.phone}</dd></div>
              <div className="flex justify-between"><dt className="text-white/40">Visits</dt><dd className="text-white/80">{selected.visits}</dd></div>
              <div className="flex justify-between"><dt className="text-white/40">Last visit</dt><dd className="text-white/80">{selected.lastVisit}</dd></div>
            </dl>
            <h4 className="mt-5 font-sans text-xs uppercase tracking-widest text-brand-gold/60">Style Profile</h4>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-white/40">Fade</dt><dd className="text-white/80">{defaultStyleProfile.fadeType}</dd></div>
              <div className="flex justify-between"><dt className="text-white/40">Guard</dt><dd className="text-white/80">{defaultStyleProfile.clipperGuard}</dd></div>
              <div className="flex justify-between"><dt className="text-white/40">Allergies</dt><dd className="text-white/80">{defaultStyleProfile.allergies}</dd></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthStore";
import { useDemo } from "@/lib/mock/DemoStore";
import { StyleProfile, emptyStyleProfile, fmt, isoDate, serviceById } from "@/lib/mock/data";

type Row = { key: string; id?: string; name: string; email: string; phone?: string; visits: number; last?: string; account: boolean };

export default function CustomersPage() {
  const { users } = useAuth();
  const { appointments, styleProfiles } = useDemo();
  const [open, setOpen] = useState<string | null>(null);

  // everyone who has an account or has booked — guests are grouped by email
  const rows = useMemo<Row[]>(() => {
    const map = new Map<string, Row>();
    users
      .filter((u) => u.role === "customer")
      .forEach((u) => map.set(u.email, { key: u.email, id: u.id, name: u.name, email: u.email, phone: u.phone, visits: 0, account: true }));
    appointments
      .filter((a) => a.status !== "Cancelled")
      .forEach((a) => {
        const key = a.customerEmail?.toLowerCase() ?? a.customerId;
        const r = map.get(key) ?? { key, name: a.customerName, email: a.customerEmail ?? "—", visits: 0, account: false };
        if (a.status === "Completed" || a.date <= isoDate()) r.visits += 1;
        if (!r.last || a.date > r.last) r.last = a.date;
        map.set(key, r);
      });
    return [...map.values()].sort((a, b) => (b.last ?? "").localeCompare(a.last ?? ""));
  }, [users, appointments]);

  const selected = rows.find((r) => r.key === open);
  const profile: StyleProfile = (selected?.id && styleProfiles[selected.id]) || emptyStyleProfile;
  const history = selected
    ? appointments.filter((a) => (a.customerEmail?.toLowerCase() ?? a.customerId) === selected.key || a.customerId === selected.id).slice(0, 5)
    : [];

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl tracking-widest text-brand-gold">Customers</h1>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-brand-charcoal p-8 text-center text-sm text-white/50">Customers appear here after they book or create an account.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-brand-charcoal">
          {rows.map((c) => (
            <button key={c.key} onClick={() => setOpen(c.key)} className="flex w-full items-center justify-between border-b border-white/5 px-5 py-4 text-left transition-colors last:border-none hover:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold/40 to-brand-red/30 font-display text-black">{c.name[0]}</div>
                <div>
                  <p className="font-sans text-sm text-white">{c.name} {!c.account && <span className="ml-1 rounded-full border border-white/15 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white/40">Guest</span>}</p>
                  <p className="text-xs text-white/40">{c.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-xl text-brand-gold">{c.visits}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/40">visits{c.last ? ` · ${c.last}` : ""}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-brand-charcoal p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl tracking-widest text-brand-gold">{selected.name}</h2>
              <button onClick={() => setOpen(null)} aria-label="Close" className="text-white/50 hover:text-white"><X size={20} /></button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-white/40">Email</dt><dd className="text-white/80">{selected.email}</dd></div>
              <div className="flex justify-between"><dt className="text-white/40">Phone</dt><dd className="text-white/80">{selected.phone ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-white/40">Visits</dt><dd className="text-white/80">{selected.visits}</dd></div>
            </dl>
            <h3 className="mt-5 font-sans text-xs uppercase tracking-widest text-brand-gold/60">Style Profile</h3>
            <dl className="mt-2 space-y-1 text-sm">
              {([["Fade", profile.fadeType], ["Guard", profile.clipperGuard], ["Allergies", profile.allergies]] as const).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4"><dt className="text-white/40">{k}</dt><dd className="text-right text-white/80">{v || "—"}</dd></div>
              ))}
            </dl>
            {history.length > 0 && (
              <>
                <h3 className="mt-5 font-sans text-xs uppercase tracking-widest text-brand-gold/60">Recent bookings</h3>
                <ul className="mt-2 space-y-1 text-sm text-white/70">
                  {history.map((a) => (
                    <li key={a.id} className="flex justify-between"><span>{a.date} · {serviceById(a.serviceId)?.name}</span><span className="text-brand-gold">{fmt(a.price)}</span></li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

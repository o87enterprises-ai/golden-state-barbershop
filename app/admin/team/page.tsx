"use client";

import { useState } from "react";
import { Copy, Trash2, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthStore";
import { useDemo } from "@/lib/mock/DemoStore";
import { fmtDuration, useNow } from "@/lib/useNow";

export default function TeamPage() {
  const { user, users, invites, createInvite, revokeInvite, removeBarber, updateUser } = useAuth();
  const { barbers, chairOf, timeEntries, clockOut, pushToast } = useDemo();
  const now = useNow(30_000);
  const [name, setName] = useState("");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const copy = (code: string) =>
    navigator.clipboard
      ?.writeText(`${origin}/signup?role=barber&code=${code}`)
      .then(() => pushToast({ kind: "success", title: "Invite link copied" }))
      .catch(() => pushToast({ title: "Could not copy", body: `Code: ${code}` }));

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const hoursToday = (id: string) =>
    timeEntries
      .filter((e) => e.barberId === id)
      .reduce((sum, e) => {
        const start = Math.max(new Date(e.clockIn).getTime(), todayStart.getTime());
        const end = e.clockOut ? new Date(e.clockOut).getTime() : now;
        return sum + Math.max(0, end - start);
      }, 0);

  const remove = (id: string, label: string) => {
    if (!window.confirm(`Remove ${label} from the team? They'll lose access.`)) return;
    clockOut(id);
    removeBarber(id);
  };

  const pending = invites.filter((i) => !i.usedBy);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-sans text-xs uppercase tracking-widest text-brand-gold/60">Owner</p>
        <h1 className="font-display text-3xl tracking-widest text-white">Team</h1>
      </div>

      <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
        <h2 className="mb-4 font-sans text-sm uppercase tracking-wider text-white/50">Roster</h2>
        {barbers.length === 0 ? (
          <p className="text-sm text-white/40">No barbers yet. Create an invite below.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {barbers.map((b) => {
              const chair = chairOf(b.id);
              const account = users.find((u) => u.id === b.id);
              return (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold/40 to-brand-red/30 font-display text-black">{b.initials}</div>
                    <div>
                      <p className="font-sans text-sm text-white">{account?.name ?? b.name}{account?.role === "admin" && " (you)"}</p>
                      <p className="text-xs text-white/40">{account?.email ?? "Sample barber"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={chair ? "text-emerald-400" : "text-white/30"}>{chair ? `${chair.name}${chair.incognito ? " · incognito" : ""}` : "Off floor"}</span>
                    <span className="w-16 text-right text-brand-gold">{fmtDuration(hoursToday(b.id))}</span>
                    {account?.role === "barber" && (
                      <button onClick={() => remove(b.id, account.name)} aria-label={`Remove ${account.name}`} className="text-white/30 hover:text-brand-red"><Trash2 size={16} /></button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <label className="mt-4 flex cursor-pointer items-center gap-3 font-sans text-sm text-white/60">
          <input type="checkbox" checked={!!user?.cutsHair} onChange={(e) => updateUser({ cutsHair: e.target.checked })} className="h-4 w-4 accent-brand-gold" />
          I also cut hair (show me on the roster and time clock)
        </label>
      </div>

      <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
        <h2 className="mb-1 font-sans text-sm uppercase tracking-wider text-white/50">Invite a barber</h2>
        <p className="mb-4 text-sm text-white/40">Each code works once. Send the link — they set their own password.</p>
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { createInvite(name); setName(""); } }} placeholder="Barber's name" aria-label="Barber's name" className="flex-1 rounded-lg border border-white/15 bg-brand-dark px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-gold" />
          <button onClick={() => { createInvite(name); setName(""); }} className="flex items-center gap-2 rounded-lg bg-brand-gold px-4 font-sans text-sm font-semibold text-black"><UserPlus size={16} /> Create</button>
        </div>
        {pending.length > 0 && (
          <ul className="mt-4 space-y-2">
            {pending.map((i) => (
              <li key={i.code} className="flex items-center justify-between gap-2 rounded-lg bg-brand-dark p-3 font-sans text-sm">
                <span><span className="text-white">{i.name}</span> · <span className="tracking-widest text-brand-gold">{i.code}</span></span>
                <span className="flex gap-1">
                  <button onClick={() => copy(i.code)} aria-label="Copy invite link" className="rounded p-1.5 text-white/50 hover:text-brand-gold"><Copy size={16} /></button>
                  <button onClick={() => revokeInvite(i.code)} aria-label="Revoke invite" className="rounded p-1.5 text-white/50 hover:text-brand-red"><Trash2 size={16} /></button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

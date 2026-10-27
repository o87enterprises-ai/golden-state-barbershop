"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, EyeOff, Ghost, ShieldCheck, X } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthStore";
import { useDemo } from "@/lib/mock/DemoStore";
import { fmtMoney } from "@/lib/mock/data";
import { fmtDuration, useNow } from "@/lib/useNow";

const inputCls =
  "w-full rounded-lg border border-white/15 bg-brand-dark px-4 py-3 font-sans text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-gold";

export default function IncognitoPage() {
  const { user } = useAuth();
  const { privateSessions, chairOf, openEntryFor, setIncognito, startPrivateSession, completePrivateSession, cancelPrivateSession, openOverlay, pushToast } = useDemo();
  const now = useNow(15_000);

  const [client, setClient] = useState("");
  const [note, setNote] = useState("");
  const [price, setPrice] = useState(user?.profile?.privateRate ? String(user.profile.privateRate) : "");
  const [error, setError] = useState("");

  if (!user) return null;
  const me = user.id;
  const chair = chairOf(me);
  const clockedIn = !!openEntryFor(me);
  const mine = privateSessions.filter((s) => s.barberId === me);
  const active = mine.find((s) => s.status === "ACTIVE");
  const done = mine.filter((s) => s.status === "DONE");
  const earned = done.reduce((n, s) => n + s.price, 0);

  const toggle = (on: boolean) => {
    const err = setIncognito(me, on);
    setError(err ?? "");
    if (!err) pushToast({ kind: "success", title: on ? "Incognito on" : "Back to public", body: on ? "Your chair is reserved and hidden from the public." : "Your chair is bookable again." });
  };

  const start = () => {
    const amount = Number(price);
    if (!price || !(amount >= 0)) return setError("Set a price for this client.");
    const err = startPrivateSession(me, { client, note, price: amount });
    if (err) return setError(err);
    setError("");
    setClient("");
    setNote("");
  };

  const collect = () => {
    if (!active) return;
    openOverlay({
      type: "tap",
      amount: active.price,
      context: "private",
      onDone: () => completePrivateSession(active.id),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-sans text-xs uppercase tracking-widest text-brand-gold/60">Incognito mode</p>
        <h1 className="font-display text-3xl tracking-widest text-white">Ghost Chair</h1>
        <p className="mt-2 max-w-2xl font-sans text-sm text-white/50">
          Reserve your chair for private and VIP clients or impromptu cuts that aren&apos;t on the schedule. The public
          sees an unavailable chair — no name, no client — and you set your own price for every session.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-brand-red/40 bg-brand-red/10 px-3 py-2 font-sans text-sm text-red-200">{error}</p>
      )}

      {!clockedIn ? (
        <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
          <p className="font-sans text-sm text-white/60">Clock in and pick a chair first, then you can go incognito.</p>
          <Link href="/admin/clock" className="mt-4 inline-block rounded-lg bg-brand-gold px-6 py-3 font-display text-lg tracking-widest text-black">Open Time Clock</Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-brand-gold/25 bg-brand-charcoal p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${chair?.incognito ? "bg-brand-gold text-black" : "bg-white/5 text-white/40"}`}>
                <Ghost size={26} />
              </div>
              <div>
                <p className="font-display text-2xl tracking-wider text-white">{chair?.name}</p>
                <p className="font-sans text-sm text-white/50">
                  {chair?.incognito ? "Reserved — hidden from the public" : "Public — taking bookings and walk-ins"}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggle(!chair?.incognito)}
              role="switch"
              aria-checked={!!chair?.incognito}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-sm font-semibold transition-colors ${chair?.incognito ? "bg-brand-gold text-black" : "border border-white/20 text-white/80 hover:border-brand-gold"}`}
            >
              <EyeOff size={16} /> {chair?.incognito ? "Incognito on" : "Go incognito"}
            </button>
          </div>
        </div>
      )}

      {clockedIn && chair?.incognito && (
        <div className="grid gap-6 lg:grid-cols-2">
          {active ? (
            <div className="rounded-2xl border border-brand-gold/40 bg-brand-charcoal p-6 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
              <p className="font-sans text-xs uppercase tracking-widest text-brand-gold/70">Session in progress</p>
              <p className="mt-2 font-display text-3xl tracking-wider text-white">{active.client}</p>
              {active.note && <p className="mt-1 font-sans text-sm text-white/50">{active.note}</p>}
              <div className="mt-4 flex items-end justify-between">
                <p className="font-display text-5xl text-brand-gold">{fmtMoney(active.price)}</p>
                <p className="font-sans text-sm text-white/50">{fmtDuration(now - new Date(active.startedAt).getTime())} in chair</p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                <button onClick={collect} className="flex items-center justify-center gap-2 rounded-lg bg-brand-gold py-3 font-display text-lg tracking-widest text-black hover:bg-brand-gold/90">
                  <CreditCard size={18} /> Collect &amp; Finish
                </button>
                <button onClick={() => cancelPrivateSession(active.id)} className="flex items-center justify-center gap-1 rounded-lg border border-white/15 px-4 py-3 font-sans text-sm text-white/60 hover:border-brand-red hover:text-brand-red">
                  <X size={14} /> Void
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
              <h2 className="mb-4 font-sans text-sm uppercase tracking-wider text-white/50">New private session</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="client" className="mb-1 block font-sans text-xs uppercase tracking-wider text-white/50">Client (alias is fine)</label>
                  <input id="client" value={client} onChange={(e) => setClient(e.target.value)} placeholder="VIP · Mr. J" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="pnote" className="mb-1 block font-sans text-xs uppercase tracking-wider text-white/50">Service note</label>
                  <input id="pnote" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Full cut + beard, after hours" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="pprice" className="mb-1 block font-sans text-xs uppercase tracking-wider text-white/50">Your price ($)</label>
                  <input id="pprice" type="number" inputMode="decimal" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="100" className={inputCls} />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[60, 80, 100, 150, 200].map((n) => (
                      <button key={n} type="button" onClick={() => setPrice(String(n))} className={`rounded-full border px-3 py-1 font-sans text-xs transition-colors ${price === String(n) ? "border-brand-gold bg-brand-gold/10 text-brand-gold" : "border-white/15 text-white/60 hover:border-brand-gold/50"}`}>${n}</button>
                    ))}
                  </div>
                </div>
                <button onClick={start} className="w-full rounded-lg bg-brand-gold py-3 font-display text-lg tracking-widest text-black hover:bg-brand-gold/90">Start Session</button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
            <h2 className="mb-1 flex items-center gap-2 font-sans text-sm uppercase tracking-wider text-white/50"><ShieldCheck size={16} className="text-brand-gold" /> What stays private</h2>
            <ul className="mt-3 space-y-2 font-sans text-sm text-white/60">
              <li>• The chair shows as &quot;Reserved&quot; on the public site, with no barber or client.</li>
              <li>• Private clients never appear on the public lineup or booking calendar.</li>
              <li>• The shop owner sees private sales in Revenue under your name.</li>
            </ul>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-sans text-sm uppercase tracking-wider text-white/50">Private sessions</h2>
          <p className="font-display text-2xl text-brand-gold">{fmtMoney(earned)}</p>
        </div>
        {done.length === 0 ? (
          <p className="text-sm text-white/40">No completed private sessions yet.</p>
        ) : (
          <div className="space-y-2">
            {done.slice(0, 10).map((s) => (
              <div key={s.id} className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
                <span className="text-white/80">{s.client} <span className="text-white/30">· {new Date(s.startedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></span>
                <span className="text-brand-gold">{fmtMoney(s.price)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

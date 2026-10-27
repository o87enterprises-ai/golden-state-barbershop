"use client";

import { useState } from "react";
import Link from "next/link";
import { Armchair, EyeOff, LogIn, LogOut, Timer } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthStore";
import { useDemo } from "@/lib/mock/DemoStore";
import { fmtDuration, useNow } from "@/lib/useNow";

export default function TimeClockPage() {
  const { user } = useAuth();
  const { chairs, timeEntries, barberById, openEntryFor, chairOf, clockIn, clockOut, setIncognito, pushToast } = useDemo();
  const now = useNow(15_000);

  const [pick, setPick] = useState<string | null>(null);
  const [ghost, setGhost] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;
  const me = user.id;
  const entry = openEntryFor(me);
  const myChair = chairOf(me);
  const mine = timeEntries.filter((e) => e.barberId === me);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = mine.reduce((sum, e) => {
    const start = Math.max(new Date(e.clockIn).getTime(), todayStart.getTime());
    const end = e.clockOut ? new Date(e.clockOut).getTime() : now;
    return end > todayStart.getTime() ? sum + Math.max(0, end - start) : sum;
  }, 0);

  const doClockIn = () => {
    if (!pick) return;
    const err = clockIn(me, pick, ghost);
    if (err) return setError(err);
    setError("");
    setPick(null);
    pushToast({ kind: "success", title: "Clocked in", body: ghost ? "Incognito — your chair is reserved." : "Your chair is live for bookings." });
  };

  const doClockOut = () => {
    const err = clockOut(me);
    if (err) return setError(err);
    setError("");
    pushToast({ kind: "success", title: "Clocked out", body: "Your chair is open for the next barber." });
  };

  const toggleGhost = () => {
    const err = setIncognito(me, !myChair?.incognito);
    setError(err ?? "");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-sans text-xs uppercase tracking-widest text-brand-gold/60">Time Clock</p>
        <h1 className="font-display text-3xl tracking-widest text-white">
          {entry ? "You're on the floor" : "Start your shift"}
        </h1>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-brand-red/40 bg-brand-red/10 px-3 py-2 font-sans text-sm text-red-200">
          {error}
        </p>
      )}

      {entry && myChair ? (
        <div className="rounded-2xl border border-brand-gold/30 bg-brand-charcoal p-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                <Armchair size={30} />
              </div>
              <div>
                <p className="font-display text-3xl tracking-wider text-white">{myChair.name}</p>
                <p className="font-sans text-sm text-white/50">
                  Since {new Date(entry.clockIn).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} ·{" "}
                  <span className="text-brand-gold">{fmtDuration(now - new Date(entry.clockIn).getTime())}</span>
                </p>
              </div>
            </div>
            <span className={`rounded-full border px-3 py-1 font-sans text-[11px] uppercase tracking-wider ${myChair.incognito ? "border-white/30 text-white/70" : "border-emerald-400/40 text-emerald-400"}`}>
              {myChair.incognito ? "Incognito · reserved" : "Public · bookable"}
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button onClick={toggleGhost} className="flex items-center justify-center gap-2 rounded-lg border border-white/15 py-3 font-sans text-sm text-white/80 transition-colors hover:border-brand-gold/50">
              <EyeOff size={16} className="text-brand-gold" />
              {myChair.incognito ? "Go public" : "Go incognito"}
            </button>
            <button onClick={doClockOut} className="flex items-center justify-center gap-2 rounded-lg bg-brand-red py-3 font-display text-lg tracking-widest text-white transition-colors hover:bg-red-700">
              <LogOut size={16} /> Clock Out
            </button>
          </div>
          {myChair.incognito && (
            <Link href="/admin/incognito" className="mt-4 inline-block font-sans text-sm text-brand-gold hover:underline">
              Open private sessions →
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
          <h2 className="font-sans text-sm uppercase tracking-wider text-white/50">Pick your chair</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="radiogroup" aria-label="Chairs">
            {chairs.map((c) => {
              const taken = !!c.barberId;
              const who = c.incognito ? "In use" : barberById(c.barberId ?? "")?.name ?? "In use";
              return (
                <button
                  key={c.id}
                  role="radio"
                  aria-checked={pick === c.id}
                  disabled={taken}
                  onClick={() => setPick(c.id)}
                  className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors ${
                    pick === c.id
                      ? "border-brand-gold bg-brand-gold/10"
                      : taken
                      ? "cursor-not-allowed border-white/5 bg-brand-dark opacity-50"
                      : "border-white/10 bg-brand-dark hover:border-brand-gold/40"
                  }`}
                >
                  <Armchair size={20} className={pick === c.id ? "text-brand-gold" : "text-white/40"} />
                  <span className="font-display text-lg tracking-wider text-white">{c.name}</span>
                  <span className={`font-sans text-[11px] uppercase tracking-wider ${taken ? "text-white/40" : "text-emerald-400"}`}>
                    {taken ? who : "Open"}
                  </span>
                </button>
              );
            })}
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-brand-dark p-3 font-sans text-sm text-white/70">
            <input type="checkbox" checked={ghost} onChange={(e) => setGhost(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-gold" />
            <span>
              <span className="flex items-center gap-1.5 font-semibold text-white"><EyeOff size={14} className="text-brand-gold" /> Clock in incognito</span>
              Reserve this chair for private clients. It shows as unavailable to the public.
            </span>
          </label>

          <button onClick={doClockIn} disabled={!pick} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gold py-3.5 font-display text-xl tracking-widest text-black transition-colors hover:bg-brand-gold/90 disabled:opacity-30">
            <LogIn size={18} /> Clock In
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-brand-charcoal p-5">
          <p className="font-display text-4xl text-brand-gold">{fmtDuration(todayMs)}</p>
          <p className="mt-1 font-sans text-xs uppercase tracking-wider text-white/50">Hours today</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-brand-charcoal p-5">
          <p className="font-display text-4xl text-brand-gold">{mine.length}</p>
          <p className="mt-1 font-sans text-xs uppercase tracking-wider text-white/50">Shifts logged</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
        <h2 className="mb-4 flex items-center gap-2 font-sans text-sm uppercase tracking-wider text-white/50">
          <Timer size={16} className="text-brand-gold" /> Recent shifts
        </h2>
        {mine.length === 0 ? (
          <p className="text-sm text-white/40">No shifts yet. Clock in to start your first one.</p>
        ) : (
          <div className="space-y-2">
            {mine.slice(0, 8).map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
                <span className="text-white/80">
                  {new Date(e.clockIn).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} ·{" "}
                  {new Date(e.clockIn).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  {e.clockOut ? ` – ${new Date(e.clockOut).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : " – now"}
                </span>
                <span className="text-white/40">
                  {chairs.find((c) => c.id === e.chairId)?.name ?? "Chair"} ·{" "}
                  <span className="text-brand-gold">{fmtDuration((e.clockOut ? new Date(e.clockOut).getTime() : now) - new Date(e.clockIn).getTime())}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

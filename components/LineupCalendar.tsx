"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";
import { fmtTime, isoDate } from "@/lib/mock/data";
import { shopOpen, slotInPast, slotOpen, slotTimes } from "@/lib/availability";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function LineupCalendar() {
  const { barbers, chairs, timeEntries, appointments, hydrated } = useDemo();
  const ctx = useMemo(
    () => ({ barbers, chairs, timeEntries, appointments }),
    [barbers, chairs, timeEntries, appointments]
  );

  const todayIso = isoDate();
  const [view, setView] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selected, setSelected] = useState(todayIso);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(isoDate(new Date(year, month, d)));

  const slots = slotTimes(selected).map((t) => ({
    time: t,
    open: hydrated && slotOpen(selected, t, ctx),
    past: slotInPast(selected, t),
  }));

  const changeMonth = (delta: number) => setView(new Date(year, month + delta, 1));
  const selectedDate = new Date(`${selected}T12:00:00`);

  return (
    <section id="schedule" className="relative z-20 scroll-mt-24 bg-brand-charcoal py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-10">
          <p className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.3em] text-brand-gold/60">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-red opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-red" />
            </span>
            Schedule
          </p>
          <h2 className="mt-2 font-display text-4xl tracking-widest text-brand-gold md:text-5xl">Book a Time</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="rounded-2xl border border-brand-gold/20 bg-brand-dark p-5">
            <div className="mb-4 flex items-center justify-between">
              <button onClick={() => changeMonth(-1)} aria-label="Previous month" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-brand-gold hover:text-brand-gold">
                <ChevronLeft size={18} />
              </button>
              <p className="font-display text-xl tracking-widest text-white">
                {MONTHS[month]} {year}
              </p>
              <button onClick={() => changeMonth(1)} aria-label="Next month" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-brand-gold hover:text-brand-gold">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1 text-center font-sans text-xs uppercase tracking-wider text-white/30">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((iso, i) => {
                if (!iso) return <div key={i} />;
                const disabled = iso < todayIso || !shopOpen(iso);
                const isSelected = iso === selected;
                return (
                  <button
                    key={iso}
                    disabled={disabled}
                    onClick={() => setSelected(iso)}
                    aria-pressed={isSelected}
                    className={`aspect-square rounded-lg font-sans text-sm transition-colors ${
                      isSelected
                        ? "bg-brand-gold font-semibold text-black"
                        : disabled
                        ? "text-white/15"
                        : "text-white/70 hover:bg-brand-gold/15 hover:text-brand-gold"
                    }`}
                  >
                    {Number(iso.slice(8))}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-brand-gold/20 bg-brand-dark p-5">
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-brand-gold">
              {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </h3>
            {slots.length === 0 ? (
              <p className="py-8 text-center font-sans text-sm text-white/40">Closed this day.</p>
            ) : (
              <div className="flex flex-col divide-y divide-white/5">
                {slots.map((s) =>
                  s.open ? (
                    <Link
                      key={s.time}
                      href={`/book?date=${selected}&time=${s.time}`}
                      className="flex items-center justify-between py-2.5 text-sm text-white/80 transition-colors hover:text-brand-gold"
                    >
                      <span>{fmtTime(s.time)}</span>
                      <span className="font-sans text-xs uppercase tracking-wider text-emerald-400">Open</span>
                    </Link>
                  ) : (
                    <div key={s.time} className="flex items-center justify-between py-2.5 text-sm text-white/25 line-through">
                      <span>{fmtTime(s.time)}</span>
                      <span className="font-sans text-xs uppercase tracking-wider text-brand-red/70 no-underline">
                        {s.past ? "Passed" : "Booked"}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/book"
            className="inline-block rounded-sm bg-brand-red px-10 py-4 font-display text-2xl tracking-widest text-white transition-all hover:scale-105 hover:bg-red-700"
          >
            Book a Cut
          </Link>
        </div>
      </div>
    </section>
  );
}

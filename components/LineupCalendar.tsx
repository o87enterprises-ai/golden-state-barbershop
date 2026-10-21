"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";

// Shop hours by weekday (0=Sun … 6=Sat). Closed Sun/Mon.
const DAY_HOURS: Record<number, { start: number; end: number } | null> = {
  0: null,
  1: null,
  2: { start: 10.5, end: 18.5 },
  3: { start: 10.5, end: 18.5 },
  4: { start: 10.5, end: 18.5 },
  5: { start: 10.5, end: 19.5 },
  6: { start: 9.5, end: 15.5 },
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function fmtHour(decimal: number) {
  const h = Math.floor(decimal);
  const m = decimal % 1 === 0.5 ? "30" : "00";
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h;
  return `${h12}:${m} ${ampm}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function LineupCalendar() {
  const { openOverlay } = useDemo();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(new Date(today));

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const hoursRange = DAY_HOURS[selected.getDay()];
  const slots: { time: string; booked: boolean }[] = [];
  if (hoursRange) {
    for (let t = hoursRange.start; t < hoursRange.end; t += 1) {
      // deterministic mock availability
      const booked = (selected.getDate() * Math.floor(t)) % 3 === 0;
      slots.push({ time: fmtHour(t), booked });
    }
  }

  const changeMonth = (delta: number) => setView(new Date(year, month + delta, 1));

  return (
    <section id="live-lineup" className="relative z-20 bg-brand-charcoal py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-10">
          <p className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.3em] text-brand-gold/60">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-red opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-red" />
            </span>
            Schedule
          </p>
          <h2 className="mt-2 font-display text-4xl tracking-widest text-brand-gold md:text-5xl">
            Book a Time
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px]">
          {/* calendar */}
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
              {cells.map((date, i) => {
                if (!date) return <div key={i} />;
                const past = date < today;
                const closed = DAY_HOURS[date.getDay()] === null;
                const isSelected = sameDay(date, selected);
                const disabled = past || closed;
                return (
                  <button
                    key={i}
                    disabled={disabled}
                    onClick={() => setSelected(date)}
                    className={`aspect-square rounded-lg font-sans text-sm transition-colors ${
                      isSelected
                        ? "bg-brand-gold font-semibold text-black"
                        : disabled
                        ? "text-white/15"
                        : "text-white/70 hover:bg-brand-gold/15 hover:text-brand-gold"
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* hourly schedule */}
          <div className="rounded-2xl border border-brand-gold/20 bg-brand-dark p-5">
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-brand-gold">
              {selected.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </h3>
            {slots.length === 0 ? (
              <p className="py-8 text-center font-sans text-sm text-white/40">Closed this day.</p>
            ) : (
              <div className="flex flex-col divide-y divide-white/5">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    disabled={s.booked}
                    onClick={() => openOverlay({ type: "book" })}
                    className={`flex items-center justify-between py-2.5 text-sm transition-colors ${
                      s.booked ? "cursor-not-allowed text-white/25 line-through" : "text-white/80 hover:text-brand-gold"
                    }`}
                  >
                    <span>{s.time}</span>
                    <span className={`font-sans text-xs uppercase tracking-wider ${s.booked ? "text-brand-red/70" : "text-emerald-400"}`}>
                      {s.booked ? "Booked" : "Open"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => openOverlay({ type: "book" })}
            className="rounded-sm bg-brand-red px-10 py-4 font-display text-2xl tracking-widest text-white transition-all hover:scale-105 hover:bg-red-700"
          >
            Book This Time
          </button>
        </div>
      </div>
    </section>
  );
}

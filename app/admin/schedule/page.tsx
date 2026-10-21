"use client";

import { useState } from "react";
import { useDemo } from "@/lib/mock/DemoStore";
import { barbers, serviceById } from "@/lib/mock/data";

type Day = "Today" | "Tomorrow";
const DAYS: Day[] = ["Today", "Tomorrow"];

// half-hour rows across the shop day
const SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00",
];

// bucket a real time ("11:15") to its half-hour slot ("11:00")
function slotKey(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${String(h).padStart(2, "0")}:${m < 30 ? "00" : "30"}`;
}

export default function SchedulePage() {
  const { appointments } = useDemo();
  const [day, setDay] = useState<Day>("Today");

  const dayAppts = appointments.filter((a) => a.day === day);
  const cell = (barberId: string, slot: string) =>
    dayAppts.find((a) => a.barberId === barberId && slotKey(a.time) === slot);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl tracking-widest text-brand-gold">Schedule</h2>
          <p className="mt-1 font-sans text-sm text-white/50">
            Full-shop overview · {dayAppts.length} appointments {day.toLowerCase()}
          </p>
        </div>
        <div className="flex gap-2">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`rounded-full px-5 py-1.5 font-sans text-xs uppercase tracking-wider transition-colors ${
                day === d ? "bg-brand-gold text-black" : "border border-white/15 text-white/60"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-brand-charcoal">
        <div className="min-w-[640px]">
          {/* barber header */}
          <div
            className="grid border-b border-white/10"
            style={{ gridTemplateColumns: `72px repeat(${barbers.length}, 1fr)` }}
          >
            <div className="p-3" />
            {barbers.map((b) => (
              <div key={b.id} className="flex items-center gap-2 border-l border-white/5 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold/40 to-brand-red/30 font-display text-sm text-black">
                  {b.initials}
                </div>
                <span className="font-display text-lg tracking-wider text-white">{b.name}</span>
              </div>
            ))}
          </div>

          {/* time rows */}
          {SLOTS.map((slot) => (
            <div
              key={slot}
              className="grid border-b border-white/5 last:border-none"
              style={{ gridTemplateColumns: `72px repeat(${barbers.length}, 1fr)` }}
            >
              <div className="p-2 text-right font-sans text-[11px] text-white/30">{slot}</div>
              {barbers.map((b) => {
                const appt = cell(b.id, slot);
                return (
                  <div key={b.id} className="min-h-[52px] border-l border-white/5 p-1.5">
                    {appt && (
                      <div className="h-full rounded-lg border border-brand-gold/30 bg-brand-gold/10 p-2">
                        <p className="font-sans text-xs font-semibold text-white">{appt.customerName}</p>
                        <p className="mt-0.5 font-sans text-[11px] text-brand-gold">
                          {serviceById(appt.serviceId)?.name}
                        </p>
                        <p className="font-sans text-[10px] text-white/40">{appt.time}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 font-sans text-xs uppercase tracking-widest text-white/30">
        Demo schedule · mock barbers &amp; customers · drag-to-move coming in production
      </p>
    </div>
  );
}

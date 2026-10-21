"use client";

import { useState } from "react";
import { useDemo } from "@/lib/mock/DemoStore";
import { barbers, serviceById, barberById } from "@/lib/mock/data";

const hours = ["10:30", "11:00", "11:15", "12:00", "13:30", "14:15", "15:00", "16:30", "17:15"];

export default function SchedulePage() {
  const { appointments } = useDemo();
  const [barberFilter, setBarberFilter] = useState<string>("all");

  const todays = appointments.filter((a) => a.day === "Today" || a.day === "Tomorrow");
  const filtered = barberFilter === "all" ? todays : todays.filter((a) => a.barberId === barberFilter);

  const at = (time: string) => filtered.find((a) => a.time === time);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl tracking-widest text-brand-gold">Schedule</h2>
        <div className="flex gap-2">
          <button onClick={() => setBarberFilter("all")} className={`rounded-full px-4 py-1.5 font-sans text-xs uppercase tracking-wider transition-colors ${barberFilter === "all" ? "bg-brand-gold text-black" : "border border-white/15 text-white/60"}`}>All</button>
          {barbers.map((b) => (
            <button key={b.id} onClick={() => setBarberFilter(b.id)} className={`rounded-full px-4 py-1.5 font-sans text-xs uppercase tracking-wider transition-colors ${barberFilter === b.id ? "bg-brand-gold text-black" : "border border-white/15 text-white/60"}`}>{b.name}</button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-brand-charcoal">
        {hours.map((h) => {
          const appt = at(h);
          return (
            <div key={h} className="flex items-center gap-4 border-b border-white/5 px-5 py-3 last:border-none">
              <span className="w-16 shrink-0 font-sans text-sm text-white/40">{h}</span>
              {appt ? (
                <div className="flex flex-1 items-center justify-between rounded-lg bg-brand-gold/10 px-4 py-2">
                  <span className="font-sans text-sm text-white">{appt.customerName}</span>
                  <span className="font-sans text-xs text-brand-gold">{serviceById(appt.serviceId)?.name} · {barberById(appt.barberId)?.name}</span>
                </div>
              ) : (
                <span className="flex-1 font-sans text-sm text-white/25">Open</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 font-sans text-xs uppercase tracking-widest text-white/30">Demo schedule · drag-to-move coming in production</p>
    </div>
  );
}

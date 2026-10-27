"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Ghost } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthStore";
import { useDemo } from "@/lib/mock/DemoStore";
import { addDays, dayLabel, fmtTime, isoDate, serviceById } from "@/lib/mock/data";

// half-hour rows across the shop day
const SLOTS = [
  "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00",
];

// bucket a real time ("11:15") to its half-hour slot ("11:00")
function slotKey(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${String(h).padStart(2, "0")}:${m < 30 ? "00" : "30"}`;
}

export default function SchedulePage() {
  const { user } = useAuth();
  const { appointments, barbers, chairs, privateSessions } = useDemo();
  const [day, setDay] = useState(isoDate());

  const dayAppts = appointments.filter((a) => a.date === day && a.status !== "Cancelled");
  const cell = (barberId: string, slot: string) =>
    dayAppts.filter((a) => a.barberId === barberId && slotKey(a.time) === slot);

  // Private sessions are only visible to the owner and the barber who ran them.
  const privateAt = (barberId: string, slot: string) => {
    if (!user || (user.role !== "admin" && user.id !== barberId)) return [];
    return privateSessions.filter((p) => p.barberId === barberId && isoDate(new Date(p.startedAt)) === day && slotKey(new Date(p.startedAt).toTimeString().slice(0, 5)) === slot);
  };

  const cols = `64px repeat(${Math.max(barbers.length, 1)}, minmax(140px, 1fr))`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-widest text-brand-gold">Schedule</h1>
          <p className="mt-1 font-sans text-sm text-white/50">
            {dayAppts.length} appointment{dayAppts.length === 1 ? "" : "s"} · {dayLabel(day)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDay(addDays(day, -1))} aria-label="Previous day" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 hover:border-brand-gold hover:text-brand-gold"><ChevronLeft size={16} /></button>
          <button onClick={() => setDay(isoDate())} className={`rounded-full px-4 py-1.5 font-sans text-xs uppercase tracking-wider ${day === isoDate() ? "bg-brand-gold text-black" : "border border-white/15 text-white/60"}`}>Today</button>
          <button onClick={() => setDay(addDays(day, 1))} aria-label="Next day" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 hover:border-brand-gold hover:text-brand-gold"><ChevronRight size={16} /></button>
        </div>
      </div>

      {barbers.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-brand-charcoal p-8 text-center text-sm text-white/50">
          No barbers on the roster yet. Invite your team from the Team page.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-brand-charcoal">
          <div className="min-w-[560px]">
            <div className="grid border-b border-white/10" style={{ gridTemplateColumns: cols }}>
              <div className="p-3" />
              {barbers.map((b) => {
                const chair = chairs.find((c) => c.barberId === b.id);
                return (
                  <div key={b.id} className="flex items-center gap-2 border-l border-white/5 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold/40 to-brand-red/30 font-display text-sm text-black">{b.initials}</div>
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg tracking-wider text-white">{b.name}</p>
                      <p className={`font-sans text-[10px] uppercase tracking-wider ${chair ? "text-emerald-400" : "text-white/30"}`}>
                        {chair ? `${chair.name}${chair.incognito && (user?.role === "admin" || user?.id === b.id) ? " · incognito" : ""}` : "Off floor"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {SLOTS.map((slot) => (
              <div key={slot} className="grid border-b border-white/5 last:border-none" style={{ gridTemplateColumns: cols }}>
                <div className="p-2 text-right font-sans text-[11px] text-white/30">{fmtTime(slot).replace(" ", "")}</div>
                {barbers.map((b) => (
                  <div key={b.id} className="min-h-[52px] space-y-1 border-l border-white/5 p-1.5">
                    {cell(b.id, slot).map((appt) => (
                      <div key={appt.id} className="rounded-lg border border-brand-gold/30 bg-brand-gold/10 p-2">
                        <p className="font-sans text-xs font-semibold text-white">{appt.customerName}</p>
                        <p className="mt-0.5 font-sans text-[11px] text-brand-gold">{serviceById(appt.serviceId)?.name}</p>
                        <p className="font-sans text-[10px] text-white/40">{fmtTime(appt.time)}</p>
                      </div>
                    ))}
                    {privateAt(b.id, slot).map((p) => (
                      <div key={p.id} className="rounded-lg border border-dashed border-white/30 bg-white/5 p-2">
                        <p className="flex items-center gap-1 font-sans text-xs font-semibold text-white"><Ghost size={12} /> Private</p>
                        <p className="font-sans text-[10px] text-white/40">{p.client}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

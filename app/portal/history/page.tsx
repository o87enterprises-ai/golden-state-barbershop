"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthStore";
import { useDemo } from "@/lib/mock/DemoStore";
import { dayLabel, fmt, fmtTime, serviceById } from "@/lib/mock/data";
import { mineOf } from "../mine";

const statusColor: Record<string, string> = {
  Upcoming: "text-brand-gold border-brand-gold/40",
  Completed: "text-emerald-400 border-emerald-400/30",
  Cancelled: "text-white/40 border-white/20",
};

export default function HistoryPage() {
  const { user } = useAuth();
  const { appointments, barberById, cancelAppointment } = useDemo();
  if (!user) return null;
  const mine = mineOf(appointments, user).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl tracking-widest text-brand-gold">Appointment History</h1>
      {mine.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-brand-charcoal p-8 text-center">
          <p className="text-white/50">No appointments yet.</p>
          <Link href="/portal/book" className="mt-4 inline-block rounded-sm bg-brand-gold px-6 py-2 font-display text-lg tracking-widest text-black">Book a cut</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {mine.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-brand-charcoal p-5">
              <div>
                <p className="font-display text-xl tracking-wider text-white">{serviceById(a.serviceId)?.name}</p>
                <p className="mt-1 text-sm text-white/50">{dayLabel(a.date)} · {fmtTime(a.time)} · with {barberById(a.barberId)?.name ?? "—"}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display text-xl text-brand-gold">{fmt(a.price)}</span>
                <span className={`rounded-full border px-3 py-1 font-sans text-[11px] uppercase tracking-wider ${statusColor[a.status]}`}>{a.status}</span>
                {a.status === "Upcoming" && (
                  <button
                    onClick={() => window.confirm("Cancel this appointment? Contact the shop about a refund.") && cancelAppointment(a.id)}
                    className="font-sans text-xs text-white/40 underline-offset-4 hover:text-brand-red hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

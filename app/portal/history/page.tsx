"use client";

import { useDemo } from "@/lib/mock/DemoStore";
import { serviceById, barberById, fmt } from "@/lib/mock/data";

const statusColor: Record<string, string> = {
  Upcoming: "text-brand-gold border-brand-gold/40",
  Completed: "text-emerald-400 border-emerald-400/30",
  Cancelled: "text-white/40 border-white/20",
};

export default function HistoryPage() {
  const { appointments } = useDemo();
  const mine = appointments.filter((a) => a.customerId === "me");

  return (
    <div>
      <h2 className="mb-6 font-display text-3xl tracking-widest text-brand-gold">Appointment History</h2>
      <div className="space-y-3">
        {mine.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-brand-charcoal p-5">
            <div>
              <p className="font-display text-xl tracking-wider text-white">{serviceById(a.serviceId)?.name}</p>
              <p className="mt-1 text-sm text-white/50">{a.day} · {a.time} · with {barberById(a.barberId)?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-display text-xl text-brand-gold">{fmt(a.price)}</span>
              <span className={`rounded-full border px-3 py-1 font-sans text-[11px] uppercase tracking-wider ${statusColor[a.status]}`}>
                {a.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

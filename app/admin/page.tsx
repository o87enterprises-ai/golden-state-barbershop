"use client";

import Link from "next/link";
import { useDemo } from "@/lib/mock/DemoStore";
import { revenueSeed, barberById, serviceById, fmt } from "@/lib/mock/data";

export default function AdminDashboard() {
  const { appointments, queue, messages, chairs } = useDemo();
  const today = appointments.filter((a) => a.day === "Today");
  const waiting = queue.filter((q) => q.status === "WAITING").length;
  const unread = messages.filter((m) => m.unread).length;
  const openChairs = chairs.filter((c) => c.state === "IDLE").length;

  const stats = [
    { label: "Today's Revenue", value: fmt(revenueSeed.today), href: "/admin/revenue" },
    { label: "Appointments Today", value: today.length, href: "/admin/schedule" },
    { label: "In Queue", value: waiting, href: "/admin/queue" },
    { label: "Unread Messages", value: unread, href: "/admin/messages" },
    { label: "Open Chairs", value: openChairs, href: "/admin/chairs" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-xl border border-white/10 bg-brand-charcoal p-5 transition-colors hover:border-brand-gold/40">
            <p className="font-display text-4xl text-brand-gold">{s.value}</p>
            <p className="mt-1 font-sans text-xs uppercase tracking-wider text-white/50">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
          <h3 className="mb-4 font-sans text-sm uppercase tracking-wider text-white/50">Today&apos;s Schedule</h3>
          <div className="space-y-3">
            {today.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
                <span className="text-white/80">{a.time} · {a.customerName}</span>
                <span className="text-white/40">{serviceById(a.serviceId)?.name} · {barberById(a.barberId)?.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
          <h3 className="mb-4 font-sans text-sm uppercase tracking-wider text-white/50">Revenue · Last 7 Days</h3>
          <div className="flex h-40 items-end gap-2">
            {revenueSeed.trend.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t bg-gradient-to-t from-brand-red to-brand-gold" style={{ height: `${(v / Math.max(...revenueSeed.trend)) * 100}%` }} />
                <span className="font-sans text-[10px] text-white/30">{fmt(v)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

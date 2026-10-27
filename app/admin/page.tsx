"use client";

import Link from "next/link";
import { EyeOff } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";
import { fmt, fmtTime, isoDate, serviceById } from "@/lib/mock/data";

export default function AdminDashboard() {
  const { appointments, queue, messages, chairs, sales, barberById, privateSessions } = useDemo();
  const today = isoDate();

  const todays = appointments
    .filter((a) => a.date === today && a.status !== "Cancelled")
    .sort((a, b) => a.time.localeCompare(b.time));
  const waiting = queue.filter((q) => q.status === "WAITING").length;
  const unread = messages.filter((m) => m.unread).length;
  const onFloor = chairs.filter((c) => c.barberId);
  const openChairs = onFloor.filter((c) => !c.incognito && c.state === "IDLE").length;
  const revenueToday = sales.filter((s) => isoDate(new Date(s.at)) === today).reduce((n, s) => n + s.amount, 0);
  const privateToday = privateSessions.filter((p) => p.status === "ACTIVE").length;

  const stats = [
    { label: "Today's Revenue", value: fmt(revenueToday), href: "/admin/revenue" },
    { label: "Appointments Today", value: todays.length, href: "/admin/schedule" },
    { label: "In Queue", value: waiting, href: "/admin/queue" },
    { label: "Unread Messages", value: unread, href: "/admin/messages" },
    { label: "Open Chairs", value: openChairs, href: "/admin/chairs" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-sans text-xs uppercase tracking-widest text-brand-gold/60">Owner view</p>
        <h1 className="font-display text-3xl tracking-widest text-white">Dashboard</h1>
      </div>

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
          <h2 className="mb-4 font-sans text-sm uppercase tracking-wider text-white/50">On the floor</h2>
          {onFloor.length === 0 ? (
            <p className="text-sm text-white/40">Nobody is clocked in yet.</p>
          ) : (
            <div className="space-y-3">
              {onFloor.map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
                  <span className="text-white/80">{barberById(c.barberId!)?.name ?? "Barber"} · {c.name}</span>
                  <span className={`flex items-center gap-1 ${c.incognito ? "text-white/60" : "text-brand-gold"}`}>
                    {c.incognito && <EyeOff size={13} />} {c.incognito ? (privateToday ? "Private session" : "Incognito") : c.state.replace("_", " ").toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
          <h2 className="mb-4 font-sans text-sm uppercase tracking-wider text-white/50">Today&apos;s schedule</h2>
          {todays.length === 0 ? (
            <p className="text-sm text-white/40">No appointments today.</p>
          ) : (
            <div className="space-y-3">
              {todays.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2 text-sm">
                  <span className="text-white/80">{fmtTime(a.time)} · {a.customerName}</span>
                  <span className="text-right text-white/40">{serviceById(a.serviceId)?.name} · {barberById(a.barberId)?.name ?? "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

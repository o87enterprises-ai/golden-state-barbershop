"use client";

import Link from "next/link";
import { CalendarPlus, Scissors, Clock, Bell } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";
import { ME, serviceById, barberById, fmt } from "@/lib/mock/data";

export default function PortalDashboard() {
  const { appointments, styleProfile, openOverlay, enableNotifications } = useDemo();
  const mine = appointments.filter((a) => a.customerId === "me");
  const next = mine.find((a) => a.status === "Upcoming");
  const recent = mine.filter((a) => a.status === "Completed").slice(0, 3);

  return (
    <div className="space-y-6">
      {/* next appointment */}
      <div className="rounded-2xl border border-brand-gold/25 bg-brand-charcoal p-6">
        <p className="font-sans text-xs uppercase tracking-widest text-brand-gold/60">Next Appointment</p>
        {next ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-display text-3xl tracking-wider text-white">
                {serviceById(next.serviceId)?.name}
              </p>
              <p className="mt-1 text-sm text-white/60">
                {next.day} · {next.time} · with {barberById(next.barberId)?.name}
              </p>
            </div>
            <span className="font-display text-3xl text-brand-gold">{fmt(next.price)}</span>
          </div>
        ) : (
          <p className="mt-3 text-white/50">No upcoming appointments.</p>
        )}
      </div>

      {/* quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <button onClick={() => openOverlay({ type: "book" })} className="flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-brand-charcoal p-5 text-left transition-colors hover:border-brand-gold/40">
          <CalendarPlus className="text-brand-gold" />
          <span className="font-display text-lg tracking-wider text-white">Quick Book</span>
          <span className="text-xs text-white/50">Open the booking modal</span>
        </button>
        <Link href="/portal/style-profile" className="flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-brand-charcoal p-5 transition-colors hover:border-brand-gold/40">
          <Scissors className="text-brand-gold" />
          <span className="font-display text-lg tracking-wider text-white">Style Profile</span>
          <span className="text-xs text-white/50">Your cut preferences</span>
        </Link>
        <button onClick={enableNotifications} className="flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-brand-charcoal p-5 text-left transition-colors hover:border-brand-gold/40">
          <Bell className="text-brand-gold" />
          <span className="font-display text-lg tracking-wider text-white">Enable Alerts</span>
          <span className="text-xs text-white/50">Chair-ready notifications</span>
        </button>
      </div>

      {/* recent history + style summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
          <h3 className="mb-4 flex items-center gap-2 font-sans text-sm uppercase tracking-wider text-white/50">
            <Clock size={16} className="text-brand-gold" /> Recent Visits
          </h3>
          <div className="space-y-3">
            {recent.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
                <span className="text-white/80">{serviceById(a.serviceId)?.name}</span>
                <span className="text-white/40">with {barberById(a.barberId)?.name}</span>
              </div>
            ))}
            <Link href="/portal/history" className="inline-block pt-2 font-sans text-xs uppercase tracking-wider text-brand-gold">View all →</Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
          <h3 className="mb-4 flex items-center gap-2 font-sans text-sm uppercase tracking-wider text-white/50">
            <Scissors size={16} className="text-brand-gold" /> Style Summary
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-white/40">Fade</dt><dd className="text-white/80">{styleProfile.fadeType}</dd></div>
            <div className="flex justify-between"><dt className="text-white/40">Guard</dt><dd className="text-white/80">{styleProfile.clipperGuard}</dd></div>
            <div className="flex justify-between"><dt className="text-white/40">Products</dt><dd className="text-white/80">{styleProfile.products}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-white/40">Member since {ME.lastVisit} · {ME.visits} visits</p>
        </div>
      </div>
    </div>
  );
}

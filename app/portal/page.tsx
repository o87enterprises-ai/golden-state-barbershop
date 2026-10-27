"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus, Scissors, Clock, Bell, Send } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthStore";
import { useDemo } from "@/lib/mock/DemoStore";
import { dayLabel, fmt, fmtTime, isoDate, serviceById } from "@/lib/mock/data";
import { mineOf } from "./mine";

export default function PortalDashboard() {
  const { user } = useAuth();
  const { appointments, styleProfile, barberById, enableNotifications, sendMessage, pushToast } = useDemo();
  const [msg, setMsg] = useState("");
  if (!user) return null;

  const mine = mineOf(appointments, user);
  const upcoming = mine.filter((a) => a.status === "Upcoming").sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const next = upcoming[0];
  const recent = mine.filter((a) => a.status === "Completed" || (a.status === "Upcoming" && a.date < isoDate())).slice(0, 3);

  const send = () => {
    if (!msg.trim()) return;
    sendMessage({ customerName: user.name, customerEmail: user.email, body: msg });
    pushToast({ kind: "success", title: "Message sent", body: "The shop will get back to you." });
    setMsg("");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-sans text-xs uppercase tracking-widest text-brand-gold/60">Welcome back</p>
        <h1 className="font-display text-3xl tracking-widest text-white">{user.name.split(" ")[0]}</h1>
      </div>

      <div className="rounded-2xl border border-brand-gold/25 bg-brand-charcoal p-6">
        <p className="font-sans text-xs uppercase tracking-widest text-brand-gold/60">Next Appointment</p>
        {next ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-display text-3xl tracking-wider text-white">{serviceById(next.serviceId)?.name}</p>
              <p className="mt-1 text-sm text-white/60">
                {dayLabel(next.date)} · {fmtTime(next.time)} · with {barberById(next.barberId)?.name ?? "your barber"}
              </p>
            </div>
            <span className="font-display text-3xl text-brand-gold">{fmt(next.price)}</span>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <p className="text-white/50">No upcoming appointments.</p>
            <Link href="/portal/book" className="rounded-sm bg-brand-gold px-5 py-2 font-display text-lg tracking-widest text-black">Book a cut</Link>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/portal/book" className="flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-brand-charcoal p-5 text-left transition-colors hover:border-brand-gold/40">
          <CalendarPlus className="text-brand-gold" />
          <span className="font-display text-lg tracking-wider text-white">Quick Book</span>
          <span className="text-xs text-white/50">Pick a time and pay</span>
        </Link>
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

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
          <h2 className="mb-4 flex items-center gap-2 font-sans text-sm uppercase tracking-wider text-white/50">
            <Clock size={16} className="text-brand-gold" /> Recent Visits
          </h2>
          <div className="space-y-3">
            {recent.length === 0 && <p className="text-sm text-white/40">No visits yet.</p>}
            {recent.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
                <span className="text-white/80">{serviceById(a.serviceId)?.name}</span>
                <span className="text-white/40">with {barberById(a.barberId)?.name ?? "—"}</span>
              </div>
            ))}
            <Link href="/portal/history" className="inline-block pt-2 font-sans text-xs uppercase tracking-wider text-brand-gold">View all →</Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
          <h2 className="mb-4 flex items-center gap-2 font-sans text-sm uppercase tracking-wider text-white/50">
            <Scissors size={16} className="text-brand-gold" /> Style Summary
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-white/40">Fade</dt><dd className="text-right text-white/80">{styleProfile.fadeType || "Not set"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/40">Guard</dt><dd className="text-right text-white/80">{styleProfile.clipperGuard || "Not set"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/40">Products</dt><dd className="text-right text-white/80">{styleProfile.products || "Not set"}</dd></div>
          </dl>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
        <h2 className="mb-3 font-sans text-sm uppercase tracking-wider text-white/50">Message the shop</h2>
        <div className="flex gap-2">
          <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Need to move an appointment? Ask here…" aria-label="Message the shop" className="flex-1 rounded-lg border border-white/15 bg-brand-dark px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-gold" />
          <button onClick={send} aria-label="Send message" className="flex items-center rounded-lg bg-brand-gold px-5 text-black"><Send size={16} /></button>
        </div>
      </div>
    </div>
  );
}

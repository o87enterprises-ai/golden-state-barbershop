"use client";

import { revenueSeed, fmt } from "@/lib/mock/data";

function BarList({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
      <h3 className="mb-4 font-sans text-sm uppercase tracking-wider text-white/50">{title}</h3>
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.label}>
            <div className="mb-1 flex justify-between font-sans text-sm">
              <span className="text-white/70">{d.label}</span>
              <span className="text-brand-gold">{fmt(d.value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-red to-brand-gold" style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RevenuePage() {
  const totals = [
    { label: "Today", value: revenueSeed.today },
    { label: "This Week", value: revenueSeed.week },
    { label: "This Month", value: revenueSeed.month },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl tracking-widest text-brand-gold">Revenue</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        {totals.map((t) => (
          <div key={t.label} className="rounded-xl border border-white/10 bg-brand-charcoal p-5">
            <p className="font-display text-4xl text-brand-gold">{fmt(t.value)}</p>
            <p className="mt-1 font-sans text-xs uppercase tracking-wider text-white/50">{t.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BarList title="By Service" data={revenueSeed.byService} />
        <BarList title="By Barber" data={revenueSeed.byBarber} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
        <h3 className="mb-4 font-sans text-sm uppercase tracking-wider text-white/50">Daily Trend</h3>
        <div className="flex h-44 items-end gap-3">
          {revenueSeed.trend.map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t bg-gradient-to-t from-brand-red to-brand-gold" style={{ height: `${(v / Math.max(...revenueSeed.trend)) * 100}%` }} />
              <span className="font-sans text-[10px] text-white/30">{fmt(v)}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="font-sans text-xs uppercase tracking-widest text-white/30">Demo figures · for preview only</p>
    </div>
  );
}

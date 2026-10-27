"use client";

import { useMemo } from "react";
import { useDemo } from "@/lib/mock/DemoStore";
import { fmt, fmtMoney, addDays, isoDate } from "@/lib/mock/data";

function BarList({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
      <h2 className="mb-4 font-sans text-sm uppercase tracking-wider text-white/50">{title}</h2>
      {data.length === 0 ? (
        <p className="text-sm text-white/30">No sales yet.</p>
      ) : (
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
      )}
    </div>
  );
}

const group = (rows: { key: string; amount: number }[]) => {
  const m = new Map<string, number>();
  rows.forEach((r) => m.set(r.key, (m.get(r.key) ?? 0) + r.amount));
  return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
};

export default function RevenuePage() {
  const { sales, barberById } = useDemo();

  const t = useMemo(() => {
    const today = isoDate();
    const weekStart = addDays(today, -6);
    const monthStart = `${today.slice(0, 8)}01`;
    const day = (s: { at: string }) => isoDate(new Date(s.at));
    const sum = (f: (s: (typeof sales)[number]) => boolean) => sales.filter(f).reduce((n, s) => n + s.amount, 0);
    const trend = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i - 6);
      return { d, v: sum((s) => day(s) === d) };
    });
    return {
      today: sum((s) => day(s) === today),
      week: sum((s) => day(s) >= weekStart),
      month: sum((s) => day(s) >= monthStart),
      privateTotal: sum((s) => s.kind === "private"),
      byService: group(sales.map((s) => ({ key: s.kind === "private" ? "Private sessions" : s.label.replace(/ ×\d+$/, ""), amount: s.amount }))),
      byBarber: group(sales.map((s) => ({ key: s.barberId ? barberById(s.barberId)?.name ?? "Former barber" : "Unassigned", amount: s.amount }))),
      trend,
    };
  }, [sales, barberById]);

  const totals = [
    { label: "Today", value: t.today },
    { label: "Last 7 days", value: t.week },
    { label: "This month", value: t.month },
  ];
  const maxTrend = Math.max(1, ...t.trend.map((x) => x.v));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl tracking-widest text-brand-gold">Revenue</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {totals.map((x) => (
          <div key={x.label} className="rounded-xl border border-white/10 bg-brand-charcoal p-5">
            <p className="font-display text-4xl text-brand-gold">{fmt(x.value)}</p>
            <p className="mt-1 font-sans text-xs uppercase tracking-wider text-white/50">{x.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BarList title="By Service" data={t.byService} />
        <BarList title="By Barber" data={t.byBarber} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
        <h2 className="mb-4 font-sans text-sm uppercase tracking-wider text-white/50">Daily Trend</h2>
        <div className="flex h-44 items-end gap-3">
          {t.trend.map((x) => (
            <div key={x.d} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t bg-gradient-to-t from-brand-red to-brand-gold" style={{ height: `${Math.max(2, (x.v / maxTrend) * 100)}%` }} />
              <span className="font-sans text-[10px] text-white/30">{fmt(x.v)}</span>
              <span className="font-sans text-[10px] uppercase text-white/20">{new Date(`${x.d}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" })}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="font-sans text-xs text-white/40">
        Includes {fmtMoney(t.privateTotal)} from private (incognito) sessions. Online bookings count when paid; walk-ins count at the register.
      </p>
    </div>
  );
}

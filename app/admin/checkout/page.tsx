"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, CreditCard, PenLine } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthStore";
import { useDemo } from "@/lib/mock/DemoStore";
import { fmt, fmtMoney, serviceCategories, services } from "@/lib/mock/data";

type Line = { id: string; name: string; price: number; qty: number; serviceId?: string };

const TIPS = [0, 0.15, 0.18, 0.2];
// Haircut and grooming services aren't taxable in California, so the register adds no sales tax.

export default function CheckoutPage() {
  const { user } = useAuth();
  const { openOverlay, recordSale, barbers, chairOf } = useDemo();
  const [lines, setLines] = useState<Line[]>([]);
  const [tip, setTip] = useState(0.18);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  // who gets credit for the sale: whoever is signed in, if they work a chair
  const me = user && barbers.some((b) => b.id === user.id) ? user.id : (barbers[0]?.id ?? "");
  const [barber, setBarber] = useState(me);
  const credited = barbers.some((b) => b.id === barber) ? barber : me;
  const creditedChair = credited ? chairOf(credited) : undefined;

  const add = (t: { id: string; name: string; price: number; serviceId?: string }) =>
    setLines((prev) => {
      const found = prev.find((l) => l.id === t.id);
      if (found) return prev.map((l) => (l.id === t.id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { ...t, qty: 1 }];
    });
  const setQty = (id: string, qty: number) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty } : l)).filter((l) => l.qty > 0));

  const addCustom = () => {
    const price = Number(customPrice);
    if (!customName.trim() || !(price > 0)) return;
    add({ id: `custom-${Date.now()}`, name: customName.trim(), price });
    setCustomName("");
    setCustomPrice("");
  };

  const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
  const tipAmt = subtotal * tip;
  const total = subtotal + tipAmt;

  const charge = () => {
    if (total <= 0) return;
    const snapshot = lines;
    openOverlay({
      type: "tap",
      amount: total,
      context: "pos",
      onDone: () => {
        const base = snapshot.reduce((n, l) => n + l.price * l.qty, 0);
        snapshot.forEach((l) =>
          recordSale({
            amount: l.price * l.qty * (base > 0 ? total / base : 1), // tip is spread pro rata
            kind: "walk-in",
            label: l.qty > 1 ? `${l.name} ×${l.qty}` : l.name,
            barberId: credited || undefined,
            serviceId: l.serviceId,
          })
        );
        setLines([]);
      },
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl tracking-widest text-brand-gold">Register · Checkout</h1>
        {barbers.length > 0 && (
          <label className="flex items-center gap-2 font-sans text-xs uppercase tracking-wider text-white/40">
            Credit to
            <select value={credited} onChange={(e) => setBarber(e.target.value)} className="rounded-lg border border-white/15 bg-brand-charcoal px-3 py-1.5 text-sm normal-case tracking-normal text-white outline-none focus:border-brand-gold">
              {barbers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            {creditedChair && <span className="normal-case tracking-normal text-white/30">· {creditedChair.name}</span>}
          </label>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {serviceCategories.map((cat) => (
            <div key={cat}>
              <h2 className="mb-3 font-sans text-xs uppercase tracking-widest text-brand-gold/60">{cat}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {services.filter((s) => s.category === cat).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => add({ id: s.id, name: s.name, price: s.price, serviceId: s.id })}
                    className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-white/10 bg-brand-charcoal p-4 text-left transition-all hover:border-brand-gold/50 hover:bg-brand-gold/5 active:scale-95"
                  >
                    <span className="font-display text-lg leading-tight tracking-wider text-white">{s.name}</span>
                    <span>
                      <span className="block font-display text-2xl text-brand-gold">{fmt(s.price)}</span>
                      <span className="font-sans text-[11px] uppercase tracking-wider text-white/40">{s.minutes} min</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h2 className="mb-3 flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-brand-gold/60"><PenLine size={13} /> Custom charge</h2>
            <div className="flex flex-wrap gap-2">
              <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Description" aria-label="Custom charge description" className="min-w-[10rem] flex-1 rounded-lg border border-white/15 bg-brand-charcoal px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-gold" />
              <input value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} type="number" inputMode="decimal" min="0" placeholder="$" aria-label="Custom charge amount" className="w-24 rounded-lg border border-white/15 bg-brand-charcoal px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-gold" />
              <button onClick={addCustom} className="rounded-lg border border-brand-gold/40 px-4 font-sans text-sm text-brand-gold hover:bg-brand-gold hover:text-black">Add</button>
            </div>
          </div>
        </div>

        <div className="flex h-fit flex-col rounded-2xl border border-brand-gold/25 bg-brand-charcoal p-5 lg:sticky lg:top-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl tracking-widest text-white">Order</h2>
            {lines.length > 0 && (
              <button onClick={() => setLines([])} className="flex items-center gap-1 font-sans text-xs text-white/40 hover:text-brand-red">
                <Trash2 size={14} /> Clear
              </button>
            )}
          </div>

          <div className="min-h-[120px] space-y-2">
            {lines.length === 0 ? (
              <p className="py-8 text-center font-sans text-sm text-white/30">Tap items to build the order.</p>
            ) : (
              lines.map((l) => (
                <div key={l.id} className="flex items-center gap-2 rounded-lg bg-brand-dark p-2.5">
                  <div className="flex-1">
                    <p className="font-sans text-sm text-white">{l.name}</p>
                    <p className="text-xs text-brand-gold">{fmt(l.price)}</p>
                  </div>
                  <button onClick={() => setQty(l.id, l.qty - 1)} aria-label={`Remove one ${l.name}`} className="flex h-7 w-7 items-center justify-center rounded border border-white/15 text-white/70"><Minus size={13} /></button>
                  <span className="w-5 text-center text-sm text-white">{l.qty}</span>
                  <button onClick={() => setQty(l.id, l.qty + 1)} aria-label={`Add one ${l.name}`} className="flex h-7 w-7 items-center justify-center rounded border border-white/15 text-white/70"><Plus size={13} /></button>
                </div>
              ))
            )}
          </div>

          <div className="mt-4">
            <p className="mb-2 font-sans text-xs uppercase tracking-wider text-white/40">Tip</p>
            <div className="grid grid-cols-4 gap-2">
              {TIPS.map((t) => (
                <button key={t} onClick={() => setTip(t)} className={`rounded-lg border py-2 font-sans text-sm transition-colors ${tip === t ? "border-brand-gold bg-brand-gold/10 text-brand-gold" : "border-white/10 text-white/60"}`}>
                  {t === 0 ? "None" : `${t * 100}%`}
                </button>
              ))}
            </div>
          </div>

          <dl className="mt-4 space-y-1.5 border-t border-white/10 pt-4 font-sans text-sm">
            <div className="flex justify-between"><dt className="text-white/50">Subtotal</dt><dd className="text-white/80">{fmtMoney(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-white/50">Tip</dt><dd className="text-white/80">{fmtMoney(tipAmt)}</dd></div>
            <div className="flex justify-between border-t border-white/10 pt-2 text-lg">
              <dt className="font-display tracking-widest text-white">Total</dt>
              <dd className="font-display text-brand-gold">{fmtMoney(total)}</dd>
            </div>
          </dl>

          <button onClick={charge} disabled={lines.length === 0} className="mt-4 flex w-full items-center justify-center gap-2 rounded-sm bg-brand-gold py-4 font-display text-xl tracking-widest text-black transition-colors hover:bg-brand-gold/90 disabled:opacity-30">
            <CreditCard size={20} /> Charge {fmtMoney(total)}
          </button>
        </div>
      </div>
    </div>
  );
}

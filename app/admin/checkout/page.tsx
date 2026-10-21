"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, CreditCard, Scissors, Store } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";
import { services, products, fmt } from "@/lib/mock/data";

type Tab = "services" | "products";
type Line = { id: string; name: string; price: number; qty: number };

const TAX_RATE = 0.0825;
const TIPS = [0, 0.15, 0.18, 0.2];

export default function CheckoutPage() {
  const { openOverlay } = useDemo();
  const [tab, setTab] = useState<Tab>("services");
  const [lines, setLines] = useState<Line[]>([]);
  const [tip, setTip] = useState(0.18);

  const tiles =
    tab === "services"
      ? services.map((s) => ({ id: s.id, name: s.name, price: s.price, sub: `${s.minutes} min` }))
      : products.map((p) => ({ id: p.id, name: p.name, price: p.price, sub: p.tag }));

  const add = (t: { id: string; name: string; price: number }) => {
    setLines((prev) => {
      const found = prev.find((l) => l.id === t.id);
      if (found) return prev.map((l) => (l.id === t.id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { id: t.id, name: t.name, price: t.price, qty: 1 }];
    });
  };
  const setQty = (id: string, qty: number) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty } : l)).filter((l) => l.qty > 0));

  const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
  const tax = subtotal * TAX_RATE;
  const tipAmt = subtotal * tip;
  const total = subtotal + tax + tipAmt;

  const charge = () => {
    if (total <= 0) return;
    openOverlay({
      type: "tap",
      amount: total,
      context: "pos",
      onDone: () => setLines([]),
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-3xl tracking-widest text-brand-gold">Register · Checkout</h2>
        <span className="font-sans text-xs uppercase tracking-widest text-white/30">Touchscreen POS · demo</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* touchscreen menu */}
        <div>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setTab("services")}
              className={`flex items-center gap-2 rounded-full px-5 py-2 font-sans text-sm uppercase tracking-wider transition-colors ${
                tab === "services" ? "bg-brand-gold text-black" : "border border-white/15 text-white/60"
              }`}
            >
              <Scissors size={16} /> Services
            </button>
            <button
              onClick={() => setTab("products")}
              className={`flex items-center gap-2 rounded-full px-5 py-2 font-sans text-sm uppercase tracking-wider transition-colors ${
                tab === "products" ? "bg-brand-gold text-black" : "border border-white/15 text-white/60"
              }`}
            >
              <Store size={16} /> Products
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {tiles.map((t) => (
              <button
                key={t.id}
                onClick={() => add(t)}
                className="flex aspect-square flex-col justify-between rounded-2xl border border-white/10 bg-brand-charcoal p-4 text-left transition-all hover:border-brand-gold/50 hover:bg-brand-gold/5 active:scale-95"
              >
                <span className="font-display text-lg leading-tight tracking-wider text-white">{t.name}</span>
                <span>
                  <span className="block font-display text-2xl text-brand-gold">{fmt(t.price)}</span>
                  <span className="font-sans text-[11px] uppercase tracking-wider text-white/40">{t.sub}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* order ticket */}
        <div className="flex h-fit flex-col rounded-2xl border border-brand-gold/25 bg-brand-charcoal p-5 lg:sticky lg:top-[100px]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-xl tracking-widest text-white">Order</h3>
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
                  <button onClick={() => setQty(l.id, l.qty - 1)} className="flex h-7 w-7 items-center justify-center rounded border border-white/15 text-white/70"><Minus size={13} /></button>
                  <span className="w-5 text-center text-sm text-white">{l.qty}</span>
                  <button onClick={() => setQty(l.id, l.qty + 1)} className="flex h-7 w-7 items-center justify-center rounded border border-white/15 text-white/70"><Plus size={13} /></button>
                </div>
              ))
            )}
          </div>

          {/* tip */}
          <div className="mt-4">
            <p className="mb-2 font-sans text-xs uppercase tracking-wider text-white/40">Tip</p>
            <div className="grid grid-cols-4 gap-2">
              {TIPS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTip(t)}
                  className={`rounded-lg border py-2 font-sans text-sm transition-colors ${
                    tip === t ? "border-brand-gold bg-brand-gold/10 text-brand-gold" : "border-white/10 text-white/60"
                  }`}
                >
                  {t === 0 ? "None" : `${t * 100}%`}
                </button>
              ))}
            </div>
          </div>

          <dl className="mt-4 space-y-1.5 border-t border-white/10 pt-4 font-sans text-sm">
            <div className="flex justify-between"><dt className="text-white/50">Subtotal</dt><dd className="text-white/80">{fmt(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-white/50">Tax (8.25%)</dt><dd className="text-white/80">{fmt(tax)}</dd></div>
            <div className="flex justify-between"><dt className="text-white/50">Tip</dt><dd className="text-white/80">{fmt(tipAmt)}</dd></div>
            <div className="flex justify-between border-t border-white/10 pt-2 text-lg">
              <dt className="font-display tracking-widest text-white">Total</dt>
              <dd className="font-display text-brand-gold">{fmt(total)}</dd>
            </div>
          </dl>

          <button
            onClick={charge}
            disabled={lines.length === 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-sm bg-brand-gold py-4 font-display text-xl tracking-widest text-black transition-colors hover:bg-brand-gold/90 disabled:opacity-30"
          >
            <CreditCard size={20} /> Charge {fmt(total)}
          </button>
          <p className="mt-3 text-center font-sans text-[11px] uppercase tracking-widest text-white/30">
            Tap to Pay · demo — no real charge
          </p>
        </div>
      </div>
    </div>
  );
}

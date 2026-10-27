"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Info } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";
import { useAuth } from "@/lib/auth/AuthStore";
import {
  addDays,
  fmt,
  fmtTime,
  isoDate,
  parseIsoDate,
  serviceById,
  serviceCategories,
  services,
} from "@/lib/mock/data";
import { freeBarbersFor, shopOpen, slotInPast, slotTimes, slotOpen } from "@/lib/availability";
import { PAYMENTS_SIMULATED } from "@/lib/config";

const FADES = ["Skin fade", "Taper fade", "Low fade", "Mid fade", "High fade", "Scissor cut", "Not sure — ask me"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const field =
  "w-full rounded-lg border border-white/15 bg-brand-charcoal px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-gold";
const lbl = "mb-1 block font-sans text-xs uppercase tracking-wider text-white/50";

// First open day on/after `from` that still has a bookable slot.
function nextBookableDate(from: string, hasSlot: (iso: string) => boolean): string {
  let d = from;
  for (let i = 0; i < 21; i++) {
    if (shopOpen(d) && hasSlot(d)) return d;
    d = addDays(d, 1);
  }
  return from;
}

function Flow({ embedded }: { embedded?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const demo = useDemo();
  const { barbers, chairs, timeEntries, appointments, hydrated } = demo;

  const ctx = useMemo(
    () => ({ barbers, chairs, timeEntries, appointments }),
    [barbers, chairs, timeEntries, appointments]
  );

  const isCustomer = user?.role === "customer";
  const STEPS = isCustomer
    ? ["Service", "Date & Time", "Barber", "Style", "Pay"]
    : ["Service", "Date & Time", "Barber", "Style", "Details", "Pay"];
  const label = STEPS;

  const [step, setStep] = useState(0);
  const [service, setService] = useState<string | null>(params.get("service"));
  const [date, setDate] = useState<string>(params.get("date") ?? "");
  const [time, setTime] = useState<string | null>(params.get("time"));
  const [barber, setBarber] = useState<string | null>(null); // barber id or "any"
  const [style, setStyle] = useState({ fade: FADES[0], notes: "" });
  const [guest, setGuest] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");

  // default the date to the first day that actually has an open slot
  useEffect(() => {
    if (!hydrated || date) return;
    const hasSlot = (iso: string) => slotTimes(iso).some((t) => slotOpen(iso, t, ctx));
    setDate(nextBookableDate(isoDate(), hasSlot));
  }, [hydrated, date, ctx]);

  const today = isoDate();
  const chosenService = service ? serviceById(service) : undefined;
  const times = date ? slotTimes(date) : [];
  const freeAtSlot = date && time ? freeBarbersFor(date, time, ctx) : [];

  const name = isCustomer ? user!.name : guest.name.trim();
  const email = isCustomer ? user!.email : guest.email.trim();
  const stepName = STEPS[step];

  const canProceed =
    (stepName === "Service" && !!service) ||
    (stepName === "Date & Time" && !!date && !!time && shopOpen(date) && !slotInPast(date, time)) ||
    (stepName === "Barber" && !!barber) ||
    stepName === "Style" ||
    (stepName === "Details" && name.length >= 2 && EMAIL_RE.test(email)) ||
    stepName === "Pay";

  const pay = () => {
    if (!chosenService || !date || !time) return;
    setError("");
    // Re-check at the moment of payment: another tab or the floor may have taken it.
    const stillFree = freeBarbersFor(date, time, ctx, barber && barber !== "any" ? barber : undefined);
    if (stillFree.length === 0) {
      setError("That time was just taken. Pick another time.");
      setTime(null);
      setStep(STEPS.indexOf("Date & Time"));
      return;
    }
    const assigned = stillFree[0];
    demo.openOverlay({
      type: "tap",
      amount: chosenService.price,
      context: "booking",
      onDone: () => {
        demo.addAppointment({
          customerId: user ? user.id : `guest:${email.toLowerCase()}`,
          customerName: name,
          customerEmail: email,
          serviceId: chosenService.id,
          barberId: assigned.id,
          date,
          time,
          status: "Upcoming",
          price: chosenService.price,
        });
        demo.recordSale({
          amount: chosenService.price,
          kind: "booking",
          label: chosenService.name,
          barberId: assigned.id,
          serviceId: chosenService.id,
        });
        router.push("/success?type=booking");
      },
    });
  };

  const body = (
    <section className={`mx-auto max-w-2xl px-6 pb-24 ${embedded ? "pt-2" : "pt-36"}`}>
      <h1 className="text-center font-display text-5xl tracking-widest text-brand-gold">
        {embedded ? "Book a Cut" : "Book Your Cut"}
      </h1>
      {!user && (
        <p className="mt-3 text-center font-sans text-sm text-white/50">
          No account needed — pay to confirm.{" "}
          <Link href="/login?next=/portal/book" className="text-brand-gold hover:underline">Log in</Link> to use your saved details.
        </p>
      )}

      <ol className="mt-8 flex items-center justify-center gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2" aria-current={i === step ? "step" : undefined}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full font-display text-sm transition-colors ${i <= step ? "bg-brand-gold text-black" : "border border-white/20 text-white/40"}`}>
              {i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`h-px w-4 ${i < step ? "bg-brand-gold" : "bg-white/15"}`} />}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-center font-sans text-xs uppercase tracking-widest text-white/40">{label[step]}</p>

      <div className="mt-10 min-h-[320px]">
        <AnimatePresence mode="wait">
          <motion.div key={stepName} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            {stepName === "Service" && (
              <div className="space-y-8">
                {serviceCategories.map((cat) => (
                  <div key={cat}>
                    <h3 className="mb-3 font-sans text-xs uppercase tracking-widest text-brand-gold/60">{cat}</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {services.filter((s) => s.category === cat).map((s) => (
                        <button key={s.id} onClick={() => setService(s.id)} className={`rounded-xl border p-5 text-left transition-colors ${service === s.id ? "border-brand-gold bg-brand-gold/10" : "border-white/10 bg-brand-charcoal hover:border-brand-gold/40"}`}>
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-display text-xl tracking-wider text-white">{s.name}</span>
                            <span className="font-display text-xl text-brand-gold">{fmt(s.price)}</span>
                          </div>
                          <span className="mt-1 block text-sm text-white/40">{s.minutes} min</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {stepName === "Date & Time" && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="bdate" className={lbl}>Date</label>
                  <input id="bdate" type="date" min={today} value={date} onChange={(e) => { setDate(e.target.value); setTime(null); }} className={`${field} [color-scheme:dark]`} />
                </div>
                <div>
                  <p className={lbl}>Available times</p>
                  {!date ? null : !shopOpen(date) ? (
                    <p className="rounded-lg bg-brand-charcoal p-4 text-sm text-white/50">We&apos;re closed {parseIsoDate(date).toLocaleDateString(undefined, { weekday: "long" })}s. Pick another day.</p>
                  ) : barbers.length === 0 ? (
                    <p className="rounded-lg bg-brand-charcoal p-4 text-sm text-white/50">Online booking opens once barbers are on the schedule. Call the shop to book.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {times.map((t) => {
                        const open = slotOpen(date, t, ctx);
                        return (
                          <button key={t} disabled={!open} onClick={() => setTime(t)} className={`rounded-lg border py-2 font-sans text-sm transition-colors ${time === t ? "border-brand-gold bg-brand-gold/10 text-brand-gold" : open ? "border-white/10 bg-brand-charcoal text-white/70 hover:border-brand-gold/40" : "cursor-not-allowed border-white/5 text-white/20 line-through"}`}>
                            {fmtTime(t)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {date === today && shopOpen(date) && barbers.length > 0 && times.every((t) => !slotOpen(date, t, ctx)) && (
                    <p className="mt-3 text-sm text-white/50">No open times left today. Try tomorrow.</p>
                  )}
                </div>
              </div>
            )}

            {stepName === "Barber" && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[{ id: "any", name: "Any available" }, ...freeAtSlot].map((b) => (
                  <button key={b.id} onClick={() => setBarber(b.id)} className={`flex flex-col items-center gap-3 rounded-xl border p-5 transition-colors ${barber === b.id ? "border-brand-gold bg-brand-gold/10" : "border-white/10 bg-brand-charcoal hover:border-brand-gold/40"}`}>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold/40 to-brand-red/30 font-display text-xl text-black">{b.id === "any" ? "★" : b.name[0]}</div>
                    <span className="text-center font-sans text-sm text-white/80">{b.name}</span>
                  </button>
                ))}
              </div>
            )}

            {stepName === "Style" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-display text-2xl tracking-widest text-brand-gold">How do you like your cut?</h3>
                  <p className="mt-1 text-sm text-white/50">This helps your barber get it right.</p>
                </div>
                <div>
                  <label htmlFor="fade" className={lbl}>Fade type</label>
                  <select id="fade" value={style.fade} onChange={(e) => setStyle({ ...style, fade: e.target.value })} className={field}>
                    {FADES.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="notes" className={lbl}>Anything else?</label>
                  <textarea id="notes" rows={2} value={style.notes} onChange={(e) => setStyle({ ...style, notes: e.target.value })} placeholder="Guards, lineup, allergies…" className={field} />
                </div>
              </div>
            )}

            {stepName === "Details" && (
              <div className="space-y-4">
                {[
                  { k: "name", label: "Full name", type: "text", ph: "Jane Doe", ac: "name" },
                  { k: "email", label: "Email (for your confirmation)", type: "email", ph: "you@example.com", ac: "email" },
                  { k: "phone", label: "Phone (optional)", type: "tel", ph: "(209) 555-0100", ac: "tel" },
                ].map((f) => (
                  <div key={f.k}>
                    <label htmlFor={`g-${f.k}`} className={lbl}>{f.label}</label>
                    <input id={`g-${f.k}`} type={f.type} autoComplete={f.ac} placeholder={f.ph} value={guest[f.k as keyof typeof guest]} onChange={(e) => setGuest((g) => ({ ...g, [f.k]: e.target.value }))} className={field} />
                  </div>
                ))}
              </div>
            )}

            {stepName === "Pay" && (
              <div className="rounded-xl border border-brand-gold/30 bg-brand-charcoal p-6">
                <h3 className="font-display text-2xl tracking-widest text-brand-gold">Review &amp; Pay</h3>
                <dl className="mt-4 space-y-3 font-sans text-sm">
                  {[
                    ["Service", `${chosenService?.name} · ${fmt(chosenService?.price ?? 0)}`],
                    ["When", date && time ? `${parseIsoDate(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · ${fmtTime(time)}` : "—"],
                    ["Barber", barber === "any" || !barber ? "Any available" : barbers.find((b) => b.id === barber)?.name ?? "—"],
                    ["Style", style.fade],
                    ["Name", name || "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-white/5 pb-2">
                      <dt className="text-white/50">{k}</dt>
                      <dd className="text-right text-white/90">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 flex gap-2 rounded-lg bg-brand-dark p-3 font-sans text-xs text-white/50">
                  <Info size={14} className="mt-0.5 shrink-0 text-brand-gold" />
                  Online bookings are paid in full. Your appointment is confirmed once payment is received.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {error && <p role="alert" className="mt-4 rounded-lg border border-brand-red/40 bg-brand-red/10 px-3 py-2 font-sans text-xs text-red-200">{error}</p>}

      <div className="mt-8 flex items-center justify-between">
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="font-sans text-sm uppercase tracking-wider text-white/50 transition-colors hover:text-white disabled:opacity-20">
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => { setError(""); setStep((s) => s + 1); }} disabled={!canProceed} className="rounded-sm bg-brand-gold px-8 py-3 font-display text-xl tracking-widest text-black transition-all hover:bg-brand-gold/90 disabled:cursor-not-allowed disabled:opacity-30">
            Continue
          </button>
        ) : (
          <button onClick={pay} disabled={!chosenService || !time} className="flex items-center gap-2 rounded-sm bg-brand-gold px-8 py-3 font-display text-xl tracking-widest text-black transition-all hover:bg-brand-gold/90 disabled:opacity-30">
            <CreditCard size={18} /> Pay {fmt(chosenService?.price ?? 0)} &amp; Confirm
          </button>
        )}
      </div>

      {PAYMENTS_SIMULATED && (
        <p className="mt-8 text-center font-sans text-xs uppercase tracking-widest text-white/30">
          Payments are simulated until a card processor is connected
        </p>
      )}
    </section>
  );

  return embedded ? body : <main className="min-h-screen bg-brand-dark">{body}</main>;
}

export default function BookingFlow({ embedded }: { embedded?: boolean }) {
  return (
    <Suspense fallback={null}>
      <Flow embedded={embedded} />
    </Suspense>
  );
}

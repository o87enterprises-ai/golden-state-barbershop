"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard } from "lucide-react";
import Footer from "@/components/Footer";
import { useDemo } from "@/lib/mock/DemoStore";

const services = [
  { id: "classic", name: "Classic Cut", price: 35, minutes: 45 },
  { id: "fade", name: "Skin Fade", price: 40, minutes: 60 },
  { id: "beard", name: "Beard Trim", price: 25, minutes: 30 },
  { id: "full", name: "The Full Service", price: 60, minutes: 90 },
];

const barbers = [
  { id: "any", name: "Any Available" },
  { id: "marcus", name: "Marcus" },
  { id: "deon", name: "Deon" },
  { id: "tony", name: "Tony" },
];

const times = ["10:30", "11:15", "12:00", "13:30", "14:15", "15:00", "16:30", "17:15"];
const fades = ["Skin fade", "Taper fade", "Low fade", "Mid fade", "High fade", "Scissor cut"];

const STEPS = ["Service", "Barber", "Date & Time", "Style", "Details", "Payment"];

export default function BookPage() {
  const { addAppointment, openOverlay } = useDemo();
  const [step, setStep] = useState(0);

  const [service, setService] = useState<string | null>(null);
  const [barber, setBarber] = useState<string | null>(null);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string | null>(null);
  const [style, setStyle] = useState({ fade: fades[0], guard: "", lineup: "", notes: "" });
  const [details, setDetails] = useState({ name: "", email: "", phone: "" });

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canProceed =
    (step === 0 && service) ||
    (step === 1 && barber) ||
    (step === 2 && date && time) ||
    step === 3 ||
    (step === 4 && details.name && details.email) ||
    step === 5;

  const chosenService = services.find((s) => s.id === service);
  const chosenBarber = barbers.find((b) => b.id === barber);
  const todayIso = new Date().toISOString().slice(0, 10);

  // Payment in full confirms the booking.
  const payInFull = () => {
    if (!chosenService) return;
    addAppointment({
      customerId: "me",
      customerName: details.name || "Alex Morgan",
      serviceId: chosenService.id,
      barberId: barber === "any" || !barber ? "marcus" : barber,
      day: "Tomorrow",
      time: time ?? "",
      status: "Upcoming",
      price: chosenService.price,
    });
    openOverlay({ type: "tap", amount: chosenService.price, context: "booking" });
  };

  return (
    <main className="min-h-screen bg-brand-dark">
      <section className="mx-auto max-w-2xl px-6 pb-24 pt-36">
        <h1 className="text-center font-display text-5xl tracking-widest text-brand-gold">
          Book Your Cut
        </h1>

        {/* progress */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full font-display text-sm transition-colors ${
                  i <= step ? "bg-brand-gold text-black" : "border border-white/20 text-white/40"
                }`}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-4 ${i < step ? "bg-brand-gold" : "bg-white/15"}`} />
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-center font-sans text-xs uppercase tracking-widest text-white/40">
          {STEPS[step]}
        </p>

        <div className="mt-10 min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
            >
              {step === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setService(s.id)}
                      className={`rounded-xl border p-5 text-left transition-colors ${
                        service === s.id ? "border-brand-gold bg-brand-gold/10" : "border-white/10 bg-brand-charcoal hover:border-brand-gold/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-xl tracking-wider text-white">{s.name}</span>
                        <span className="font-display text-xl text-brand-gold">${s.price}</span>
                      </div>
                      <span className="mt-1 block text-sm text-white/40">{s.minutes} min</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {barbers.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBarber(b.id)}
                      className={`flex flex-col items-center gap-3 rounded-xl border p-5 transition-colors ${
                        barber === b.id ? "border-brand-gold bg-brand-gold/10" : "border-white/10 bg-brand-charcoal hover:border-brand-gold/40"
                      }`}
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold/40 to-brand-red/30 font-display text-xl text-black">
                        {b.name[0]}
                      </div>
                      <span className="text-center font-sans text-sm text-white/80">{b.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block font-sans text-xs uppercase tracking-wider text-white/50">Date</label>
                    <input type="date" min={todayIso} value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-white/15 bg-brand-charcoal px-4 py-3 text-white outline-none focus:border-brand-gold [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="mb-2 block font-sans text-xs uppercase tracking-wider text-white/50">Available Times</label>
                    <div className="grid grid-cols-4 gap-3">
                      {times.map((t) => (
                        <button key={t} onClick={() => setTime(t)} className={`rounded-lg border py-2 font-sans text-sm transition-colors ${time === t ? "border-brand-gold bg-brand-gold/10 text-brand-gold" : "border-white/10 bg-brand-charcoal text-white/70 hover:border-brand-gold/40"}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-display text-2xl tracking-widest text-brand-gold">How do you like your cut?</h3>
                    <p className="mt-1 text-sm text-white/50">This helps your barber get it right. You can update it later in your portal.</p>
                  </div>
                  <div>
                    <label className="mb-1 block font-sans text-xs uppercase tracking-wider text-white/50">Fade type</label>
                    <select value={style.fade} onChange={(e) => setStyle({ ...style, fade: e.target.value })} className="w-full rounded-lg border border-white/15 bg-brand-charcoal px-4 py-3 text-sm text-white outline-none focus:border-brand-gold">
                      {fades.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-sans text-xs uppercase tracking-wider text-white/50">Clipper guard / length</label>
                      <input value={style.guard} onChange={(e) => setStyle({ ...style, guard: e.target.value })} placeholder="#1 sides, scissor top" className="w-full rounded-lg border border-white/15 bg-brand-charcoal px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-gold" />
                    </div>
                    <div>
                      <label className="mb-1 block font-sans text-xs uppercase tracking-wider text-white/50">Lineup preference</label>
                      <input value={style.lineup} onChange={(e) => setStyle({ ...style, lineup: e.target.value })} placeholder="Sharp, natural…" className="w-full rounded-lg border border-white/15 bg-brand-charcoal px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-gold" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block font-sans text-xs uppercase tracking-wider text-white/50">Anything else?</label>
                    <textarea rows={2} value={style.notes} onChange={(e) => setStyle({ ...style, notes: e.target.value })} placeholder="Allergies, sensitive areas, conversation preferences…" className="w-full rounded-lg border border-white/15 bg-brand-charcoal px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-gold" />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  {[
                    { k: "name", label: "Full Name", type: "text", ph: "Jane Doe" },
                    { k: "email", label: "Email", type: "email", ph: "you@example.com" },
                    { k: "phone", label: "Phone (optional)", type: "tel", ph: "(209) 555-0100" },
                  ].map((f) => (
                    <div key={f.k}>
                      <label className="mb-1 block font-sans text-xs uppercase tracking-wider text-white/50">{f.label}</label>
                      <input type={f.type} placeholder={f.ph} value={details[f.k as keyof typeof details]} onChange={(e) => setDetails((d) => ({ ...d, [f.k]: e.target.value }))} className="w-full rounded-lg border border-white/15 bg-brand-charcoal px-4 py-3 text-white placeholder:text-white/25 outline-none focus:border-brand-gold" />
                    </div>
                  ))}
                </div>
              )}

              {step === 5 && (
                <div className="rounded-xl border border-brand-gold/30 bg-brand-charcoal p-6">
                  <h3 className="font-display text-2xl tracking-widest text-brand-gold">Review &amp; Pay</h3>
                  <dl className="mt-4 space-y-3 font-sans text-sm">
                    {[
                      ["Service", `${chosenService?.name} · $${chosenService?.price}`],
                      ["Barber", chosenBarber?.name ?? "—"],
                      ["Date", date || "—"],
                      ["Time", time ?? "—"],
                      ["Fade", style.fade],
                      ["Name", details.name || "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-white/5 pb-2">
                        <dt className="text-white/50">{k}</dt>
                        <dd className="text-white/90">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 rounded-lg bg-brand-dark p-3 font-sans text-xs text-white/50">
                    Online bookings require payment in full. Your appointment is confirmed once payment is received.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* nav buttons */}
        <div className="mt-8 flex items-center justify-between">
          <button onClick={back} disabled={step === 0} className="font-sans text-sm uppercase tracking-wider text-white/50 transition-colors hover:text-white disabled:opacity-20">
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={next} disabled={!canProceed} className="rounded-sm bg-brand-gold px-8 py-3 font-display text-xl tracking-widest text-black transition-all hover:bg-brand-gold/90 disabled:cursor-not-allowed disabled:opacity-30">
              Continue
            </button>
          ) : (
            <button onClick={payInFull} className="flex items-center gap-2 rounded-sm bg-brand-gold px-8 py-3 font-display text-xl tracking-widest text-black transition-all hover:bg-brand-gold/90">
              <CreditCard size={18} /> Pay ${chosenService?.price ?? 0} &amp; Confirm
            </button>
          )}
        </div>

        <p className="mt-8 text-center font-sans text-xs uppercase tracking-widest text-white/30">
          Demo booking · payment is simulated, no real charge
        </p>
      </section>

      <Footer />
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, CreditCard, Minus, Plus, Share2, Copy, Download } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";
import { services, barbers, products, serviceById, barberById, fmt } from "@/lib/mock/data";

const times = ["10:30", "11:15", "12:00", "13:30", "14:15", "15:00", "16:30", "17:15"];

function Shell({ children, onClose, side }: { children: React.ReactNode; onClose: () => void; side?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className={`fixed inset-0 z-[110] flex bg-black/70 backdrop-blur-sm ${
        side ? "justify-end" : "items-center justify-center p-4"
      }`}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={side ? { x: 420 } : { y: 30, opacity: 0, scale: 0.97 }}
        animate={side ? { x: 0 } : { y: 0, opacity: 1, scale: 1 }}
        exit={side ? { x: 420 } : { y: 30, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={
          side
            ? "flex h-full w-full max-w-md flex-col border-l border-white/10 bg-brand-charcoal"
            : "max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-brand-charcoal p-6"
        }
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Header({ title, onClose, pad }: { title: string; onClose: () => void; pad?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${pad ? "border-b border-white/10 p-5" : "mb-4"}`}>
      <h2 className="font-display text-2xl tracking-widest text-brand-gold">{title}</h2>
      <button onClick={onClose} className="text-white/50 hover:text-white" aria-label="Close">
        <X size={22} />
      </button>
    </div>
  );
}

const FADES = ["Skin fade", "Taper fade", "Low fade", "Mid fade", "High fade", "Scissor cut"];

function BookingModal() {
  const { closeOverlay, addAppointment, openOverlay } = useDemo();
  const [svc, setSvc] = useState(services[1].id);
  const [bar, setBar] = useState(barbers[0].id);
  const [time, setTime] = useState(times[2]);
  const [fade, setFade] = useState(FADES[0]);
  const [notes, setNotes] = useState("");
  const service = serviceById(svc)!;

  // Payment in full is required to confirm — this adds the appointment and
  // hands off to the Tap-to-Pay step for the full service price.
  const payInFull = () => {
    addAppointment({
      customerId: "me",
      customerName: "Alex Morgan",
      serviceId: svc,
      barberId: bar,
      day: "Tomorrow",
      time,
      status: "Upcoming",
      price: service.price,
    });
    openOverlay({ type: "stripe", amount: service.price, context: "booking" });
  };

  return (
    <Shell onClose={closeOverlay}>
      <Header title="Book a Cut" onClose={closeOverlay} />
      <label className="mb-1 block font-sans text-xs uppercase tracking-wider text-white/50">Service</label>
      <select value={svc} onChange={(e) => setSvc(e.target.value)} className="mb-4 w-full rounded-lg border border-white/15 bg-brand-dark px-3 py-2.5 text-sm text-white outline-none focus:border-brand-gold">
        {services.map((s) => (
          <option key={s.id} value={s.id}>{s.name} — {fmt(s.price)} · {s.minutes}m</option>
        ))}
      </select>

      <label className="mb-1 block font-sans text-xs uppercase tracking-wider text-white/50">Barber</label>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {barbers.map((b) => (
          <button key={b.id} onClick={() => setBar(b.id)} className={`rounded-lg border py-2 text-sm transition-colors ${bar === b.id ? "border-brand-gold bg-brand-gold/10 text-brand-gold" : "border-white/10 text-white/70"}`}>{b.name}</button>
        ))}
      </div>

      <label className="mb-1 block font-sans text-xs uppercase tracking-wider text-white/50">Time (tomorrow)</label>
      <div className="mb-5 grid grid-cols-4 gap-2">
        {times.map((t) => (
          <button key={t} onClick={() => setTime(t)} className={`rounded-lg border py-2 text-xs transition-colors ${time === t ? "border-brand-gold bg-brand-gold/10 text-brand-gold" : "border-white/10 text-white/70"}`}>{t}</button>
        ))}
      </div>

      {/* Style guide — captured before payment */}
      <div className="mb-6 rounded-lg border border-brand-gold/20 bg-brand-dark p-4">
        <p className="mb-3 font-sans text-xs uppercase tracking-widest text-brand-gold/70">How do you like your cut?</p>
        <label className="mb-1 block font-sans text-xs text-white/50">Fade type</label>
        <select value={fade} onChange={(e) => setFade(e.target.value)} className="mb-3 w-full rounded-lg border border-white/15 bg-brand-charcoal px-3 py-2 text-sm text-white outline-none focus:border-brand-gold">
          {FADES.map((f) => <option key={f}>{f}</option>)}
        </select>
        <label className="mb-1 block font-sans text-xs text-white/50">Notes for your barber</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Guards, lineup, allergies…" className="w-full rounded-lg border border-white/15 bg-brand-charcoal px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-gold" />
      </div>

      <button onClick={payInFull} className="flex w-full items-center justify-center gap-2 rounded-sm bg-brand-gold py-3 font-display text-xl tracking-widest text-black transition-colors hover:bg-brand-gold/90">
        <CreditCard size={18} /> Pay {fmt(service.price)} &amp; Confirm
      </button>
      <p className="mt-4 text-center font-sans text-[11px] uppercase tracking-widest text-white/30">Payment in full confirms your booking · demo — no charge</p>
    </Shell>
  );
}

function ShopDrawer() {
  const { closeOverlay, cart, addToCart, setQty, cartTotal, openOverlay } = useDemo();
  return (
    <Shell onClose={closeOverlay} side>
      <Header title="Your Cart" onClose={closeOverlay} pad />
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {cart.length === 0 ? (
          <div>
            <p className="text-sm text-white/50">Your cart is empty. Add a few favorites:</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {products.slice(0, 4).map((p) => (
                <button key={p.id} onClick={() => addToCart(p)} className="rounded-lg border border-white/10 bg-brand-dark p-3 text-left transition-colors hover:border-brand-gold/40">
                  <p className="font-display text-sm tracking-wider text-white">{p.name}</p>
                  <p className="mt-1 text-brand-gold">{fmt(p.price)}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          cart.map((i) => (
            <div key={i.product.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-brand-dark p-3">
              <div className="h-12 w-10 shrink-0 rounded bg-gradient-to-b from-brand-gold/30 to-brand-red/20" />
              <div className="flex-1">
                <p className="font-sans text-sm text-white">{i.product.name}</p>
                <p className="text-xs text-brand-gold">{fmt(i.product.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(i.product.id, i.qty - 1)} className="flex h-6 w-6 items-center justify-center rounded border border-white/15 text-white/70"><Minus size={12} /></button>
                <span className="w-5 text-center text-sm text-white">{i.qty}</span>
                <button onClick={() => setQty(i.product.id, i.qty + 1)} className="flex h-6 w-6 items-center justify-center rounded border border-white/15 text-white/70"><Plus size={12} /></button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-white/10 p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-sans text-sm text-white/60">Total</span>
          <span className="font-display text-2xl text-brand-gold">{fmt(cartTotal)}</span>
        </div>
        <button
          disabled={cart.length === 0}
          onClick={() => openOverlay({ type: "stripe", amount: cartTotal, context: "shop" })}
          className="flex w-full items-center justify-center gap-2 rounded-sm bg-brand-gold py-3 font-display text-lg tracking-widest text-black transition-colors hover:bg-brand-gold/90 disabled:opacity-30"
        >
          <CreditCard size={18} /> Checkout
        </button>
      </div>
    </Shell>
  );
}

function TapToPay() {
  const { overlay, closeOverlay, clearCart, pushToast } = useDemo();
  const amount = overlay.amount ?? 0;
  const [stage, setStage] = useState<"summary" | "tap" | "processing" | "done">("summary");

  useEffect(() => {
    if (stage === "processing") {
      const t = setTimeout(() => setStage("done"), 2200);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const finish = () => {
    if (overlay.context === "shop") clearCart();
    overlay.onDone?.();
    pushToast({ kind: "success", title: "Payment complete (demo)", body: `${fmt(amount)} — no real charge` });
    closeOverlay();
  };

  return (
    <Shell onClose={closeOverlay}>
      <Header title="Tap to Pay" onClose={closeOverlay} />
      <div className="rounded-xl border border-brand-gold/20 bg-brand-dark p-6 text-center">
        <p className="font-sans text-xs uppercase tracking-widest text-brand-red">Demo Payment — No charge</p>
        <p className="mt-3 font-display text-6xl text-brand-gold">{fmt(amount)}</p>

        {stage === "summary" && (
          <button onClick={() => setStage("tap")} className="mt-6 w-full rounded-sm bg-brand-gold py-3 font-display text-xl tracking-widest text-black">Continue</button>
        )}

        {stage === "tap" && (
          <div className="mt-6">
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-2 border-brand-gold/50 text-brand-gold">
              <CreditCard size={44} />
            </motion.div>
            <p className="mt-4 font-sans text-sm text-white/60">Hold card or phone near the reader…</p>
            <button onClick={() => setStage("processing")} className="mt-5 w-full rounded-sm border border-brand-gold/40 py-3 font-display text-lg tracking-widest text-brand-gold hover:bg-brand-gold hover:text-black">Simulate Tap</button>
          </div>
        )}

        {stage === "processing" && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-brand-gold" />
            <p className="font-sans text-sm text-white/60">Processing…</p>
          </div>
        )}

        {stage === "done" && (
          <div className="mt-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 160, damping: 12 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-gold text-black">
              <Check size={40} strokeWidth={3} />
            </motion.div>
            <p className="mt-4 font-display text-2xl tracking-widest text-white">Approved</p>
            <div className="mt-4 rounded-lg border border-white/10 bg-brand-charcoal p-4 text-left font-sans text-xs text-white/60">
              <div className="flex justify-between"><span>Amount</span><span className="text-white">{fmt(amount)}</span></div>
              <div className="flex justify-between"><span>Method</span><span className="text-white">Tap · •••• 4242 (demo)</span></div>
              <div className="flex justify-between"><span>Ref</span><span className="text-white">GSB-{Math.floor(Math.random() * 90000 + 10000)}</span></div>
            </div>
            <button onClick={finish} className="mt-5 w-full rounded-sm bg-brand-gold py-3 font-display text-lg tracking-widest text-black">Done</button>
          </div>
        )}
      </div>
    </Shell>
  );
}

// Stripe-styled card checkout (mock) for online bookings and shop orders.
// In-store payments use the Tap to Pay screen above, via the admin register.
function StripeCheckout() {
  const { overlay, closeOverlay, clearCart, pushToast } = useDemo();
  const amount = overlay.amount ?? 0;
  const [stage, setStage] = useState<"form" | "processing" | "done">("form");
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [exp, setExp] = useState("12 / 34");
  const [cvc, setCvc] = useState("123");
  const [zip, setZip] = useState("95376");
  const [email, setEmail] = useState("alex@example.com");
  const [ref] = useState(() => `pi_test_${Math.floor(Math.random() * 9e9 + 1e9)}`);

  useEffect(() => {
    if (stage === "processing") {
      const t = setTimeout(() => setStage("done"), 1800);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const finish = () => {
    if (overlay.context === "shop") clearCart();
    overlay.onDone?.();
    pushToast({ kind: "success", title: "Payment complete (test mode)", body: `${fmt(amount)} — no real charge` });
    closeOverlay();
  };

  const field = "w-full rounded-md border border-[#e6e6e6] bg-white px-3 py-2.5 text-sm text-[#1a1f36] outline-none placeholder:text-[#a3acb9] focus:border-[#635bff] focus:shadow-[0_0_0_3px_rgba(99,91,255,0.25)]";
  const label = "mb-1 block text-xs font-medium text-[#4f566b]";

  return (
    <Shell onClose={closeOverlay}>
      <div className="-m-6 overflow-hidden rounded-2xl bg-white text-[#1a1f36]">
        <div className="flex items-center justify-between border-b border-[#e6e6e6] px-6 py-4">
          <div>
            <p className="text-xs text-[#4f566b]">Golden State Barbershop</p>
            <p className="text-2xl font-semibold">{fmt(amount)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded bg-[#ffe9b8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8a5a00]">Test mode</span>
            <button onClick={closeOverlay} className="text-[#4f566b] hover:text-black" aria-label="Close"><X size={20} /></button>
          </div>
        </div>

        {stage === "form" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStage("processing");
            }}
            className="space-y-4 px-6 py-5"
          >
            <div>
              <label className={label}>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className={field} />
            </div>
            <div>
              <label className={label}>Card information</label>
              <input value={card} onChange={(e) => setCard(e.target.value)} inputMode="numeric" className={`${field} rounded-b-none`} />
              <div className="grid grid-cols-2">
                <input value={exp} onChange={(e) => setExp(e.target.value)} placeholder="MM / YY" className={`${field} rounded-t-none rounded-br-none border-t-0`} />
                <input value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="CVC" className={`${field} rounded-t-none rounded-bl-none border-l-0 border-t-0`} />
              </div>
            </div>
            <div>
              <label className={label}>ZIP</label>
              <input value={zip} onChange={(e) => setZip(e.target.value)} inputMode="numeric" className={field} />
            </div>
            <button type="submit" className="w-full rounded-md bg-[#635bff] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5249e6]">
              Pay {fmt(amount)}
            </button>
            <p className="text-center text-[11px] text-[#a3acb9]">Demo only — test card pre-filled. No real charge.</p>
          </form>
        )}

        {stage === "processing" && (
          <div className="flex flex-col items-center gap-4 px-6 py-14">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#635bff]" />
            <p className="text-sm text-[#4f566b]">Processing payment…</p>
          </div>
        )}

        {stage === "done" && (
          <div className="px-6 py-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 160, damping: 12 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#30b130] text-white">
              <Check size={34} strokeWidth={3} />
            </motion.div>
            <p className="mt-4 text-xl font-semibold">Payment successful</p>
            <div className="mt-4 rounded-md border border-[#e6e6e6] bg-[#f6f9fc] p-4 text-left text-xs text-[#4f566b]">
              <div className="flex justify-between"><span>Amount</span><span className="text-[#1a1f36]">{fmt(amount)}</span></div>
              <div className="mt-1 flex justify-between"><span>Card</span><span className="text-[#1a1f36]">•••• {card.replace(/\D/g, "").slice(-4) || "4242"}</span></div>
              <div className="mt-1 flex justify-between"><span>Reference</span><span className="text-[#1a1f36]">{ref}</span></div>
            </div>
            <button onClick={finish} className="mt-5 w-full rounded-md bg-[#635bff] py-3 text-sm font-semibold text-white hover:bg-[#5249e6]">Done</button>
          </div>
        )}

        <div className="border-t border-[#e6e6e6] bg-[#f6f9fc] px-6 py-3 text-center text-[11px] text-[#697386]">
          Powered by <span className="font-semibold text-[#4f566b]">Stripe</span> · Terms · Privacy
        </div>
      </div>
    </Shell>
  );
}

function ShareModal() {
  const { closeOverlay, pushToast } = useDemo();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    // branded share card
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, 600, 600);
    const grad = ctx.createRadialGradient(300, 240, 20, 300, 240, 360);
    grad.addColorStop(0, "rgba(212,175,55,0.18)");
    grad.addColorStop(1, "rgba(212,175,55,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 600);
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, 540, 540);
    ctx.fillStyle = "#d4af37";
    ctx.textAlign = "center";
    ctx.font = "700 54px Georgia, serif";
    ctx.fillText("GOLDEN STATE", 300, 250);
    ctx.font = "700 40px Georgia, serif";
    ctx.fillText("BARBERSHOP", 300, 300);
    ctx.fillStyle = "#ffffff";
    ctx.font = "22px Georgia, serif";
    ctx.fillText("Fresh cut. Tracy, CA.", 300, 360);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "18px Georgia, serif";
    ctx.fillText("#GoldenStateFresh", 300, 420);
  }, []);

  const dataUrl = () => canvasRef.current?.toDataURL("image/png") ?? "";

  const share = async () => {
    try {
      const url = dataUrl();
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], "golden-state.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Golden State Barbershop", text: "Fresh cut! #GoldenStateFresh" });
      } else {
        pushToast({ title: "Web Share not available", body: "Use download or copy link instead." });
      }
    } catch {
      /* cancelled */
    }
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = dataUrl();
    a.download = "golden-state.png";
    a.click();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://golden-state-barbershop-preview.pages.dev");
      pushToast({ kind: "success", title: "Link copied" });
    } catch {
      pushToast({ title: "Could not copy" });
    }
  };

  return (
    <Shell onClose={closeOverlay}>
      <Header title="Share Your Look" onClose={closeOverlay} />
      <canvas ref={canvasRef} width={600} height={600} className="mx-auto w-full max-w-[280px] rounded-xl border border-white/10" />
      <div className="mt-6 grid grid-cols-3 gap-3">
        <button onClick={share} className="flex flex-col items-center gap-1 rounded-lg border border-white/10 py-3 text-xs text-white/70 hover:border-brand-gold/40"><Share2 size={18} className="text-brand-gold" /> Share</button>
        <button onClick={download} className="flex flex-col items-center gap-1 rounded-lg border border-white/10 py-3 text-xs text-white/70 hover:border-brand-gold/40"><Download size={18} className="text-brand-gold" /> Download</button>
        <button onClick={copyLink} className="flex flex-col items-center gap-1 rounded-lg border border-white/10 py-3 text-xs text-white/70 hover:border-brand-gold/40"><Copy size={18} className="text-brand-gold" /> Copy Link</button>
      </div>
      <div className="mt-4 flex justify-center gap-4 font-sans text-xs text-white/40">
        <a href="https://twitter.com/intent/tweet?text=Fresh%20cut%20at%20Golden%20State%20Barbershop!" target="_blank" rel="noreferrer" className="hover:text-brand-gold">X / Twitter</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=https://golden-state-barbershop-preview.pages.dev" target="_blank" rel="noreferrer" className="hover:text-brand-gold">Facebook</a>
      </div>
    </Shell>
  );
}

export default function OverlayHost() {
  const { overlay } = useDemo();
  return (
    <AnimatePresence>
      {overlay.type === "book" && <BookingModal key="book" />}
      {overlay.type === "shop" && <ShopDrawer key="shop" />}
      {overlay.type === "tap" && <TapToPay key="tap" />}
      {overlay.type === "stripe" && <StripeCheckout key="stripe" />}
      {overlay.type === "share" && <ShareModal key="share" />}
    </AnimatePresence>
  );
}

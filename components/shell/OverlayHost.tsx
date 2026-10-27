"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, CreditCard, Share2, Copy, Download } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";
import { fmtMoney } from "@/lib/mock/data";
import { PAYMENTS_SIMULATED } from "@/lib/config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://goldenstatebarbershop.com";

function Shell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-brand-charcoal p-6"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Header({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-display text-2xl tracking-widest text-brand-gold">{title}</h2>
      <button onClick={onClose} className="text-white/50 hover:text-white" aria-label="Close">
        <X size={22} />
      </button>
    </div>
  );
}

// Card payment step. Every paid flow (booking, POS, private sessions) goes
// through here; `onDone` runs only after the payment is approved.
function TapToPay() {
  const { overlay, closeOverlay, pushToast } = useDemo();
  const amount = overlay.amount ?? 0;
  const [stage, setStage] = useState<"summary" | "tap" | "processing" | "done">("summary");
  const [ref] = useState(() => `GSB-${Math.floor(Math.random() * 90000 + 10000)}`);

  useEffect(() => {
    if (stage === "processing") {
      const t = setTimeout(() => setStage("done"), 2200);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const finish = () => {
    overlay.onDone?.();
    pushToast({
      kind: "success",
      title: "Payment complete",
      body: `${fmtMoney(amount)}${PAYMENTS_SIMULATED ? " — simulated, no real charge" : ""}`,
    });
    closeOverlay();
  };

  // Closing before approval cancels the payment; nothing is recorded.
  const cancel = () => closeOverlay();

  return (
    <Shell onClose={stage === "done" ? finish : cancel}>
      <Header title="Tap to Pay" onClose={stage === "done" ? finish : cancel} />
      <div className="rounded-xl border border-brand-gold/20 bg-brand-dark p-6 text-center">
        {PAYMENTS_SIMULATED && (
          <p className="font-sans text-xs uppercase tracking-widest text-brand-red">Simulated payment — no charge</p>
        )}
        <p className="mt-3 font-display text-6xl text-brand-gold">{fmtMoney(amount)}</p>

        {stage === "summary" && (
          <button onClick={() => setStage("tap")} className="mt-6 w-full rounded-sm bg-brand-gold py-3 font-display text-xl tracking-widest text-black">
            Continue
          </button>
        )}

        {stage === "tap" && (
          <div className="mt-6">
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-2 border-brand-gold/50 text-brand-gold">
              <CreditCard size={44} />
            </motion.div>
            <p className="mt-4 font-sans text-sm text-white/60">Hold card or phone near the reader…</p>
            <button onClick={() => setStage("processing")} className="mt-5 w-full rounded-sm border border-brand-gold/40 py-3 font-display text-lg tracking-widest text-brand-gold hover:bg-brand-gold hover:text-black">
              {PAYMENTS_SIMULATED ? "Simulate Tap" : "Tap Detected"}
            </button>
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
              <div className="flex justify-between"><span>Amount</span><span className="text-white">{fmtMoney(amount)}</span></div>
              <div className="flex justify-between"><span>Method</span><span className="text-white">Tap{PAYMENTS_SIMULATED ? " · •••• 4242 (sim)" : ""}</span></div>
              <div className="flex justify-between"><span>Ref</span><span className="text-white">{ref}</span></div>
            </div>
            <button onClick={finish} className="mt-5 w-full rounded-sm bg-brand-gold py-3 font-display text-lg tracking-widest text-black">Done</button>
          </div>
        )}
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
      const blob = await (await fetch(dataUrl())).blob();
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
      await navigator.clipboard.writeText(SITE_URL);
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
        <a href="https://twitter.com/intent/tweet?text=Fresh%20cut%20at%20Golden%20State%20Barbershop!" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold">X / Twitter</a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold">Facebook</a>
      </div>
    </Shell>
  );
}

export default function OverlayHost() {
  const { overlay } = useDemo();
  return (
    <AnimatePresence>
      {overlay.type === "tap" && <TapToPay key="tap" />}
      {overlay.type === "share" && <ShareModal key="share" />}
    </AnimatePresence>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Info, X } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";

export default function Toaster() {
  const { toasts, dismissToast } = useDemo();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md ${
              t.kind === "buzz"
                ? "border-brand-gold bg-brand-charcoal/95 shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                : "border-white/10 bg-brand-charcoal/95"
            }`}
          >
            <span className="mt-0.5 text-brand-gold">
              {t.kind === "buzz" ? <Bell size={18} /> : t.kind === "success" ? <Check size={18} /> : <Info size={18} />}
            </span>
            <div className="flex-1">
              <p className="font-sans text-sm font-semibold text-white">{t.title}</p>
              {t.body && <p className="mt-0.5 font-sans text-xs text-white/60">{t.body}</p>}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-white/40 transition-colors hover:text-white"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

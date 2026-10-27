"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";

export default function MessagesPage() {
  const { messages, markRead } = useDemo();
  const [picked, setPicked] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const active = picked ?? messages[0]?.id ?? null;
  const current = messages.find((m) => m.id === active);

  const open = (id: string) => {
    setPicked(id);
    markRead(id);
  };

  const mailto = current?.customerEmail
    ? `mailto:${current.customerEmail}?subject=${encodeURIComponent("Re: your message to Golden State Barbershop")}&body=${encodeURIComponent(reply)}`
    : undefined;

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl tracking-widest text-brand-gold">Messages</h1>
      {messages.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-brand-charcoal p-8 text-center text-sm text-white/50">
          No messages yet. Customers can write to the shop from their account.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-[320px_1fr]">
          <div className="space-y-2">
            {messages.map((m) => (
              <button key={m.id} onClick={() => open(m.id)} className={`w-full rounded-xl border p-4 text-left transition-colors ${active === m.id ? "border-brand-gold/50 bg-brand-gold/10" : "border-white/10 bg-brand-charcoal hover:border-white/20"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm font-semibold text-white">{m.customerName}</span>
                  {m.unread && <span className="h-2 w-2 rounded-full bg-brand-red" aria-label="Unread" />}
                </div>
                <p className="mt-1 truncate text-xs text-white/50">{m.preview}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-white/30">{m.time}</p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-6">
            {current ? (
              <>
                <p className="font-display text-2xl tracking-wider text-white">{current.customerName}</p>
                {current.customerEmail && <p className="text-xs text-white/40">{current.customerEmail}</p>}
                <p className="mt-4 rounded-lg bg-brand-dark p-4 text-sm text-white/70">{current.body}</p>
                <div className="mt-6 flex gap-2">
                  <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply…" aria-label="Reply" className="flex-1 rounded-lg border border-white/15 bg-brand-dark px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-gold" />
                  <a href={mailto} aria-disabled={!mailto} onClick={(e) => !mailto && e.preventDefault()} className={`flex items-center gap-2 rounded-lg bg-brand-gold px-5 font-sans text-sm font-semibold text-black ${mailto ? "" : "pointer-events-none opacity-40"}`}>
                    <Send size={16} /> Email
                  </a>
                </div>
                <p className="mt-2 text-xs text-white/30">Replies open in your email app.</p>
              </>
            ) : (
              <p className="text-white/40">Select a message.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

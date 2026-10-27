"use client";

import { useAuth } from "@/lib/auth/AuthStore";

// Preview builds only (NEXT_PUBLIC_PREVIEW_MODE=1).
export default function DemoBanner() {
  const { user } = useAuth();
  const label = user ? `${user.role} view` : "Public view";
  return (
    <div className="fixed left-0 top-0 z-[80] w-full bg-brand-gold/90 py-1 text-center font-sans text-[11px] font-medium uppercase tracking-widest text-black">
      Preview · {label} · property of o87 Enterprises
    </div>
  );
}

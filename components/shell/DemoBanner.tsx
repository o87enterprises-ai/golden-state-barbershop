"use client";

import { useDemo } from "@/lib/mock/DemoStore";

export default function DemoBanner() {
  const { role } = useDemo();
  const label =
    role === "admin" ? "Admin view" : role === "customer" ? "Customer view" : "Public view";
  return (
    <div className="fixed left-0 top-0 z-[80] w-full bg-brand-gold/90 py-1 text-center font-sans text-[11px] font-medium uppercase tracking-widest text-black">
      Demo Mode · {label} · all data is mock — no real bookings or charges · property of o87 Enterprises
    </div>
  );
}

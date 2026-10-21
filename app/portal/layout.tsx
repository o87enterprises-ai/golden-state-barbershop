"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, CalendarPlus, Scissors, Share2 } from "lucide-react";
import { ME } from "@/lib/mock/data";

const tabs = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/history", label: "History", icon: History },
  { href: "/portal/book", label: "Book", icon: CalendarPlus },
  { href: "/portal/style-profile", label: "Style Profile", icon: Scissors },
  { href: "/portal/share", label: "Share", icon: Share2 },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <main className="min-h-screen bg-brand-dark pt-28">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold/40 to-brand-red/30 font-display text-2xl text-black">
            {ME.name[0]}
          </div>
          <div>
            <p className="font-sans text-xs uppercase tracking-widest text-brand-gold/60">Customer Portal</p>
            <h1 className="font-display text-3xl tracking-widest text-white">{ME.name}</h1>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <nav className="flex shrink-0 gap-2 overflow-x-auto lg:w-56 lg:flex-col">
            {tabs.map((t) => {
              const active = pathname === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-3 font-sans text-sm transition-colors ${
                    active
                      ? "bg-brand-gold/10 text-brand-gold"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <t.icon size={18} />
                  {t.label}
                </Link>
              );
            })}
          </nav>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}

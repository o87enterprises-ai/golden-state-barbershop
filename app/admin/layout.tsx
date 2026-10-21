"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  DollarSign,
  MessageSquare,
  Users,
  ListOrdered,
  Armchair,
  CreditCard,
} from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";

const tabs = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/checkout", label: "POS / Register", icon: CreditCard },
  { href: "/admin/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
  { href: "/admin/queue", label: "Queue", icon: ListOrdered },
  { href: "/admin/chairs", label: "Chairs", icon: Armchair },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { messages } = useDemo();
  const unread = messages.filter((m) => m.unread).length;

  return (
    <main className="min-h-screen bg-brand-dark pt-28">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="font-sans text-xs uppercase tracking-widest text-brand-gold/60">Admin Portal</p>
          <h1 className="font-display text-3xl tracking-widest text-white">Golden State · Owner View</h1>
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
                    active ? "bg-brand-gold/10 text-brand-gold" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <t.icon size={18} />
                  {t.label}
                  {t.label === "Messages" && unread > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
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

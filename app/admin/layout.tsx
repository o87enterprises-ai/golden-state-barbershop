"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Armchair,
  CalendarDays,
  CreditCard,
  DollarSign,
  EyeOff,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  MessageSquare,
  Timer,
  Users,
  UserCog,
  X,
  ExternalLink,
} from "lucide-react";
import RequireRole from "@/components/auth/RequireRole";
import { homeFor, useAuth } from "@/lib/auth/AuthStore";
import { useDemo } from "@/lib/mock/DemoStore";
import { Role } from "@/lib/mock/data";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Timer;
  roles: Role[];
  floor?: boolean; // only for people who work a chair (barbers, owner who cuts)
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { href: "/admin/clock", label: "Time Clock", icon: Timer, roles: ["barber", "admin"], floor: true },
  { href: "/admin/incognito", label: "Incognito", icon: EyeOff, roles: ["barber", "admin"], floor: true },
  { href: "/admin/schedule", label: "Schedule", icon: CalendarDays, roles: ["barber", "admin"] },
  { href: "/admin/checkout", label: "POS / Register", icon: CreditCard, roles: ["barber", "admin"] },
  { href: "/admin/queue", label: "Queue", icon: ListOrdered, roles: ["barber", "admin"] },
  { href: "/admin/chairs", label: "Chairs", icon: Armchair, roles: ["barber", "admin"] },
  { href: "/admin/revenue", label: "Revenue", icon: DollarSign, roles: ["admin"] },
  { href: "/admin/team", label: "Team", icon: UserCog, roles: ["admin"] },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, roles: ["admin"] },
  { href: "/admin/customers", label: "Customers", icon: Users, roles: ["admin"] },
];

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  const router = useRouter();
  const { user, logout } = useAuth();
  const { messages } = useDemo();
  const [open, setOpen] = useState(false);

  const works = user?.role === "barber" || !!user?.cutsHair;
  const items = NAV.filter((n) => user && n.roles.includes(user.role) && (!n.floor || works));
  const unread = messages.filter((m) => m.unread).length;

  // keep each role on the pages that belong to it
  const here = NAV.find((n) => n.href === pathname);
  const allowed = !here || items.some((n) => n.href === here.href);
  useEffect(() => {
    if (!allowed) router.replace(homeFor(user));
  }, [allowed, router, user]);

  useEffect(() => setOpen(false), [pathname]);

  const signOut = () => {
    logout();
    router.push("/");
  };

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Shop app">
      {items.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 font-sans text-sm transition-colors ${
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
  );

  const account = (
    <div className="border-t border-white/10 p-4">
      <p className="truncate font-sans text-sm text-white">{user?.name}</p>
      <p className="font-sans text-[11px] uppercase tracking-widest text-brand-gold/60">
        {user?.role === "admin" ? "Owner" : "Barber"}
      </p>
      <div className="mt-3 flex items-center gap-3 font-sans text-xs text-white/50">
        <Link href="/" className="flex items-center gap-1 hover:text-brand-gold">
          <ExternalLink size={13} /> View site
        </Link>
        <button onClick={signOut} className="flex items-center gap-1 hover:text-brand-gold">
          <LogOut size={13} /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-dark lg:flex">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-brand-gold/15 bg-brand-charcoal lg:flex">
        <Link href={homeFor(user)} className="block p-6">
          <p className="font-display text-2xl tracking-widest text-brand-gold">Golden State</p>
          <p className="font-sans text-[11px] uppercase tracking-widest text-white/40">Shop App</p>
        </Link>
        <div className="flex-1 overflow-y-auto px-3">{nav}</div>
        {account}
      </aside>

      {/* mobile top bar + drawer */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-brand-charcoal px-4 lg:hidden">
        <p className="font-display text-xl tracking-widest text-brand-gold">Golden State · Shop App</p>
        <button onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open} className="text-white">
          {open ? <X /> : <Menu />}
        </button>
      </header>
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-30 flex flex-col overflow-y-auto bg-brand-charcoal p-3 lg:hidden">
          <div className="flex-1">{nav}</div>
          {account}
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">{allowed ? children : null}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["admin", "barber"]}>
      <Shell>{children}</Shell>
    </RequireRole>
  );
}

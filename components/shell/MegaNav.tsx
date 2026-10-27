"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Scissors, Store, User, CalendarDays, LogIn, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth, homeFor } from "@/lib/auth/AuthStore";
import { PREVIEW_MODE } from "@/lib/config";

type MenuKey = "services" | "shop" | "account" | "live";
type Col = { heading: string; links: { label: string; href?: string; action?: () => void }[] };

// Public marketing nav. Staff get their own app shell under /admin.
export default function MegaNav() {
  const { ready, user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState<MenuKey | null>(null);
  const [mobile, setMobile] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const signOut = () => {
    logout();
    setOpen(null);
    setMobile(false);
    router.push("/");
  };

  const isCustomer = user?.role === "customer";
  const isStaff = user?.role === "admin" || user?.role === "barber";

  const menus: { key: MenuKey; label: string; icon: typeof Scissors; cols: Col[] }[] = [
    {
      key: "services",
      label: "Services",
      icon: Scissors,
      cols: [
        {
          heading: "Book & Browse",
          links: [
            { label: "Full Menu", href: "/menu" },
            { label: "Book Now", href: "/book" },
          ],
        },
      ],
    },
    {
      key: "shop",
      label: "Shop",
      icon: Store,
      cols: [
        {
          heading: "Grooming Goods",
          links: [{ label: "Browse Products", href: "/shop" }],
        },
      ],
    },
    {
      key: "live",
      label: "Schedule",
      icon: CalendarDays,
      cols: [
        {
          heading: "Availability",
          links: [{ label: "View Open Times", href: "/#schedule" }],
        },
      ],
    },
  ];

  if (isCustomer) {
    menus.push({
      key: "account",
      label: "My Account",
      icon: User,
      cols: [
        {
          heading: "Customer Portal",
          links: [
            { label: "Dashboard", href: "/portal" },
            { label: "Appointment History", href: "/portal/history" },
            { label: "Style Profile", href: "/portal/style-profile" },
            { label: "Log Out", action: signOut },
          ],
        },
      ],
    });
  }

  const mobileLinks = [
    { label: "Services", href: "/menu", icon: Scissors },
    { label: "Shop", href: "/shop", icon: Store },
    { label: "Schedule", href: "/#schedule", icon: CalendarDays },
    ...(isCustomer ? [{ label: "My Account", href: "/portal", icon: User }] : []),
    ...(isStaff ? [{ label: "Shop App", href: homeFor(user), icon: LayoutDashboard }] : []),
  ];

  const authButtons = !ready ? null : isStaff ? (
    <Link href={homeFor(user)} className="ml-2 rounded-sm border border-brand-gold px-5 py-2 font-display text-lg tracking-wider text-brand-gold transition-colors hover:bg-brand-gold hover:text-black">
      Shop App
    </Link>
  ) : !user ? (
    <>
      <Link href="/login" className="ml-2 flex items-center gap-1.5 rounded-md px-3 py-2 font-sans text-sm text-white/80 transition-colors hover:text-brand-gold">
        <LogIn size={15} /> Log In
      </Link>
      <Link href="/signup" className="rounded-sm border border-brand-gold/50 px-4 py-2 font-display text-lg tracking-wider text-brand-gold transition-colors hover:bg-brand-gold hover:text-black">
        Sign Up
      </Link>
    </>
  ) : null;

  return (
    <div ref={navRef} className={`fixed left-0 right-0 z-[70] ${PREVIEW_MODE ? "top-[22px]" : "top-0"}`}>
      <nav className="border-b border-white/5 bg-brand-dark/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="font-display text-2xl tracking-widest text-brand-gold">
            Golden State
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {menus.map((m) => (
              <div key={m.key} className="relative">
                <button
                  aria-expanded={open === m.key}
                  aria-controls={`mega-${m.key}`}
                  onClick={() => setOpen(open === m.key ? null : m.key)}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 font-sans text-sm transition-colors ${
                    open === m.key ? "text-brand-gold" : "text-white/80 hover:text-brand-gold"
                  }`}
                >
                  {m.label}
                  <ChevronDown size={14} className={`transition-transform ${open === m.key ? "rotate-180" : ""}`} />
                </button>
              </div>
            ))}
            {authButtons}
            <Link
              href="/book"
              className="ml-2 rounded-sm bg-brand-red px-5 py-2 font-display text-lg tracking-wider text-white transition-colors hover:bg-red-700"
            >
              Book Now
            </Link>
          </div>

          <button className="flex items-center gap-2 text-white lg:hidden" onClick={() => setMobile(!mobile)} aria-label={mobile ? "Close menu" : "Open menu"} aria-expanded={mobile}>
            <span className="font-display text-lg uppercase tracking-widest">Menu</span>
            {mobile ? <X /> : <Menu />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              id={`mega-${open}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute left-0 right-0 hidden border-b border-white/10 bg-brand-charcoal/98 backdrop-blur-xl lg:block"
            >
              <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-8 md:grid-cols-4">
                {menus
                  .find((m) => m.key === open)!
                  .cols.map((col) => (
                    <div key={col.heading}>
                      <p className="mb-3 font-sans text-xs uppercase tracking-widest text-brand-gold/60">{col.heading}</p>
                      <ul className="space-y-2">
                        {col.links.map((l) => (
                          <li key={l.label}>
                            {l.href ? (
                              <Link href={l.href} onClick={() => setOpen(null)} className="font-sans text-sm text-white/70 transition-colors hover:text-brand-gold">
                                {l.label}
                              </Link>
                            ) : (
                              <button onClick={() => { l.action?.(); setOpen(null); }} className="font-sans text-sm text-white/70 transition-colors hover:text-brand-gold">
                                {l.label}
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-white/10 bg-brand-charcoal lg:hidden"
          >
            <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
              <ul className="space-y-1">
                {mobileLinks.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} onClick={() => setMobile(false)} className="flex items-center gap-3 rounded-lg px-2 py-3 font-sans text-base text-white/80 transition-colors hover:bg-white/5 hover:text-brand-gold">
                      <l.icon size={18} className="text-brand-gold" /> {l.label}
                    </Link>
                  </li>
                ))}
                {ready && !user && (
                  <li>
                    <Link href="/login" onClick={() => setMobile(false)} className="flex items-center gap-3 rounded-lg px-2 py-3 font-sans text-base text-white/80 transition-colors hover:bg-white/5 hover:text-brand-gold">
                      <LogIn size={18} className="text-brand-gold" /> Log In / Sign Up
                    </Link>
                  </li>
                )}
                {user && (
                  <li>
                    <button onClick={signOut} className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left font-sans text-base text-white/80 transition-colors hover:bg-white/5 hover:text-brand-gold">
                      <LogOut size={18} className="text-brand-gold" /> Log Out
                    </button>
                  </li>
                )}
              </ul>

              <Link
                href="/book"
                onClick={() => setMobile(false)}
                className="block w-full rounded-lg bg-brand-gold py-3 text-center font-display text-xl tracking-widest text-black transition-colors hover:bg-brand-gold/90"
              >
                Book Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

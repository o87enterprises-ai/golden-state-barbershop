"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, ChevronDown, Scissors, Store, User, CalendarDays, Shield } from "lucide-react";
import { useDemo } from "@/lib/mock/DemoStore";
import { Role } from "@/lib/mock/data";

type MenuKey = "services" | "shop" | "account" | "live" | "admin";

type Col = { heading: string; links: { label: string; href?: string; action?: () => void }[] };

export default function MegaNav() {
  const { role, setRole, cartCount, openOverlay } = useDemo();
  const [open, setOpen] = useState<MenuKey | null>(null);
  const [mobile, setMobile] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // close mega menu on outside click / escape
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
            { label: "Book Now", action: () => openOverlay({ type: "book" }) },
            { label: "Style Guide", href: "/portal/style-profile" },
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
          links: [
            { label: "Browse Products", href: "/shop" },
            { label: "Open Cart", action: () => openOverlay({ type: "shop" }) },
          ],
        },
      ],
    },
    {
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
            { label: "Share a Post", href: "/portal/share" },
          ],
        },
      ],
    },
    {
      key: "live",
      label: "Schedule",
      icon: CalendarDays,
      cols: [
        {
          heading: "Schedule",
          links: [
            { label: "View Availability", href: "/#live-lineup" },
            ...(role === "admin"
              ? [{ label: "Full Schedule", href: "/admin/schedule" }]
              : []),
          ],
        },
      ],
    },
  ];

  if (role === "admin") {
    menus.push({
      key: "admin",
      label: "Admin",
      icon: Shield,
      cols: [
        {
          heading: "Shop Management",
          links: [
            { label: "Dashboard", href: "/admin" },
            { label: "Checkout / Register", href: "/admin/checkout" },
            { label: "Schedule", href: "/admin/schedule" },
            { label: "Revenue", href: "/admin/revenue" },
            { label: "Queue", href: "/admin/queue" },
            { label: "Chairs", href: "/admin/chairs" },
            { label: "Messages", href: "/admin/messages" },
            { label: "Customers", href: "/admin/customers" },
          ],
        },
      ],
    });
  }

  const mobileLinks: { label: string; href: string; icon: typeof Scissors }[] =
    role === "admin"
      ? [
          { label: "Schedule", href: "/admin/schedule", icon: CalendarDays },
          { label: "Admin / POS", href: "/admin", icon: Shield },
          { label: "My Account", href: "/portal", icon: User },
        ]
      : [
          { label: "Services", href: "/menu", icon: Scissors },
          { label: "Shop", href: "/shop", icon: Store },
          { label: "Schedule", href: "/#live-lineup", icon: CalendarDays },
          { label: "My Account", href: "/portal", icon: User },
        ];

  // Admin is POS-first — hide the customer storefront (Services + Shop).
  const visibleMenus =
    role === "admin" ? menus.filter((m) => m.key !== "services" && m.key !== "shop") : menus;

  const roles: Role[] = ["public", "customer", "admin"];

  return (
    <div ref={navRef} className="fixed left-0 right-0 top-[22px] z-[70]">
      <nav className="border-b border-white/5 bg-brand-dark/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="font-display text-2xl tracking-widest text-brand-gold">
            Golden State
          </Link>

          {/* desktop menus */}
          <div className="hidden items-center gap-1 lg:flex">
            {visibleMenus.map((m) => (
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
            {role === "admin" ? (
              <Link
                href="/admin/checkout"
                className="ml-2 rounded-sm bg-brand-gold px-5 py-2 font-display text-lg tracking-wider text-black transition-colors hover:bg-brand-gold/90"
              >
                Open Register
              </Link>
            ) : (
              <>
                <button
                  onClick={() => openOverlay({ type: "book" })}
                  className="ml-2 rounded-sm bg-brand-red px-5 py-2 font-display text-lg tracking-wider text-white transition-colors hover:bg-red-700"
                >
                  Book Now
                </button>
                <button
                  onClick={() => openOverlay({ type: "shop" })}
                  aria-label="Cart"
                  className="relative ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  <ShoppingBag size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 font-sans text-[10px] font-bold text-black">
                      {cartCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          {/* role switcher */}
          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-brand-charcoal p-1 lg:flex">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`rounded-full px-3 py-1 font-sans text-[11px] uppercase tracking-wider transition-colors ${
                  role === r ? "bg-brand-gold text-black" : "text-white/60 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* mobile toggle */}
          <button
            className="flex items-center gap-2 text-white lg:hidden"
            onClick={() => setMobile(!mobile)}
            aria-label={mobile ? "Close menu" : "Open menu"}
          >
            <span className="font-display text-lg uppercase tracking-widest">Menu</span>
            {mobile ? <X /> : <Menu />}
          </button>
        </div>

        {/* desktop mega panel */}
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
                {visibleMenus
                  .find((m) => m.key === open)!
                  .cols.map((col) => (
                    <div key={col.heading}>
                      <p className="mb-3 font-sans text-xs uppercase tracking-widest text-brand-gold/60">
                        {col.heading}
                      </p>
                      <ul className="space-y-2">
                        {col.links.map((l) => (
                          <li key={l.label}>
                            {l.href ? (
                              <Link
                                href={l.href}
                                onClick={() => setOpen(null)}
                                className="font-sans text-sm text-white/70 transition-colors hover:text-brand-gold"
                              >
                                {l.label}
                              </Link>
                            ) : (
                              <button
                                onClick={() => {
                                  l.action?.();
                                  setOpen(null);
                                }}
                                className="font-sans text-sm text-white/70 transition-colors hover:text-brand-gold"
                              >
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

      {/* mobile sheet */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-white/10 bg-brand-charcoal lg:hidden"
          >
            <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
              <h2 className="font-display text-2xl tracking-widest text-brand-gold">Menu</h2>

              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-brand-dark p-1">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 rounded-full px-3 py-1.5 font-sans text-[11px] uppercase tracking-wider transition-colors ${
                      role === r ? "bg-brand-gold text-black" : "text-white/60"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Concise links only — full menus live on the landing page,
                  account tools live in the portal sidebar. No Book Now here. */}
              <ul className="space-y-1">
                {mobileLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      onClick={() => setMobile(false)}
                      className="flex items-center gap-3 rounded-lg px-2 py-3 font-sans text-base text-white/80 transition-colors hover:bg-white/5 hover:text-brand-gold"
                    >
                      <l.icon size={18} className="text-brand-gold" /> {l.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {role === "admin" ? (
                <Link
                  href="/admin/checkout"
                  onClick={() => setMobile(false)}
                  className="block w-full rounded-lg bg-brand-gold py-3 text-center font-display text-xl tracking-widest text-black transition-colors hover:bg-brand-gold/90"
                >
                  Open Register
                </Link>
              ) : (
                <button
                  onClick={() => {
                    openOverlay({ type: "book" });
                    setMobile(false);
                  }}
                  className="w-full rounded-lg bg-brand-gold py-3 font-display text-xl tracking-widest text-black transition-colors hover:bg-brand-gold/90"
                >
                  Book Now
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

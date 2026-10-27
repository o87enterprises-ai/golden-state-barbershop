"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarPlus,
  History,
  Scissors,
  Share2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
} from "lucide-react";
import RequireRole from "@/components/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthStore";

type Leaf = { label: string; href: string };
type Item =
  | { label: string; href: string; icon: typeof History; children?: never }
  | { label: string; icon: typeof History; children: Leaf[]; href?: never };

const NAV: Item[] = [
  { label: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { label: "Book", href: "/portal/book", icon: CalendarPlus },
  {
    label: "History",
    icon: History,
    children: [{ label: "Appointment History", href: "/portal/history" }],
  },
  {
    label: "Style Profile",
    icon: Scissors,
    children: [{ label: "My Preferences", href: "/portal/style-profile" }],
  },
  {
    label: "Share",
    icon: Share2,
    children: [{ label: "Create Share Card", href: "/portal/share" }],
  },
];

function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  // restore collapse state + auto-open the active group
  useEffect(() => {
    const saved = localStorage.getItem("portal-sidebar-collapsed");
    if (saved) setCollapsed(saved === "true");
    const active: Record<string, boolean> = {};
    NAV.forEach((item) => {
      if (item.children?.some((c) => c.href === pathname)) active[item.label] = true;
    });
    setOpen((prev) => ({ ...prev, ...active }));
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      localStorage.setItem("portal-sidebar-collapsed", String(!c));
      return !c;
    });
  };

  return (
    <div className="flex min-h-screen bg-brand-dark pt-[var(--chrome-h)]">
      <aside
        className={`sticky top-[var(--chrome-h)] h-[calc(100vh-var(--chrome-h))] shrink-0 border-r border-brand-gold/15 bg-brand-charcoal transition-[width] duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <span className="font-display text-lg tracking-widest text-brand-gold">Portal</span>
          )}
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/5 hover:text-white"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="space-y-1 px-2">
          {NAV.map((item) => {
            if (!item.children) {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={item.label}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-sm transition-colors ${
                    active ? "bg-brand-gold/15 text-brand-gold" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={18} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            }

            const groupActive = item.children.some((c) => c.href === pathname);
            const isOpen = open[item.label] ?? groupActive;

            return (
              <div key={item.label}>
                <button
                  onClick={() => {
                    if (collapsed) {
                      // in icon-only mode, jump straight to the first child
                      return;
                    }
                    setOpen((prev) => ({ ...prev, [item.label]: !isOpen }));
                  }}
                  title={item.label}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-sm transition-colors ${
                    groupActive ? "text-brand-gold" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={18} className="shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </>
                  )}
                </button>

                {!collapsed && isOpen && (
                  <div className="ml-7 mt-1 space-y-1 border-l border-brand-gold/15 pl-3">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={`block rounded px-2 py-1.5 font-sans text-sm transition-colors ${
                          pathname === c.href ? "text-brand-gold" : "text-white/50 hover:text-white"
                        }`}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}

                {/* collapsed: show child links in a flyout-style stack of icons via direct links */}
                {collapsed &&
                  item.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      title={c.label}
                      className={`mt-1 flex items-center justify-center rounded-lg px-3 py-1.5 ${
                        pathname === c.href ? "text-brand-gold" : "text-white/30 hover:text-white"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    </Link>
                  ))}
              </div>
            );
          })}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 p-3">
          {!collapsed && <p className="truncate px-3 pb-1 font-sans text-xs text-white/40">{user?.name}</p>}
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            title="Log out"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 font-sans text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-6 py-10">{children}</main>
    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["customer"]}>
      <PortalShell>{children}</PortalShell>
    </RequireRole>
  );
}
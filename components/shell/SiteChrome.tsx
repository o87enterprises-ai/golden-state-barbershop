"use client";

import { usePathname } from "next/navigation";
import SmoothScroll from "@/components/SmoothScroll";
import PreviewBadge from "@/components/PreviewBadge";
import DemoBanner from "@/components/shell/DemoBanner";
import MegaNav from "@/components/shell/MegaNav";
import OverlayHost from "@/components/shell/OverlayHost";
import Toaster from "@/components/shell/Toaster";
import { PREVIEW_MODE } from "@/lib/config";

// The marketing site and customer app share the public nav; the staff app and
// the auth screens render full-bleed with their own chrome.
const BARE_PREFIXES = ["/admin", "/login", "/signup", "/onboarding"];

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const bare = BARE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <>
      {PREVIEW_MODE && !bare && <DemoBanner />}
      {!bare && <MegaNav />}
      <SmoothScroll>{children}</SmoothScroll>
      {PREVIEW_MODE && <PreviewBadge />}
      <OverlayHost />
      <Toaster />
    </>
  );
}

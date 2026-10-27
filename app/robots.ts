import type { MetadataRoute } from "next";
import { PREVIEW_MODE } from "@/lib/config";

export const dynamic = "force-static";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://goldenstatebarbershop.com";

export default function robots(): MetadataRoute.Robots {
  // Confidential approval previews block every crawler.
  if (PREVIEW_MODE) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/portal", "/login", "/signup", "/onboarding", "/api/"] }],
    sitemap: `${site}/sitemap.xml`,
  };
}

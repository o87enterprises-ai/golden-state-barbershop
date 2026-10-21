import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://goldenstatebarbershop.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site}/`, lastModified: now, priority: 1 },
    { url: `${site}/booking`, lastModified: now, priority: 0.9 },
    { url: `${site}/services`, lastModified: now, priority: 0.8 },
    { url: `${site}/gallery`, lastModified: now, priority: 0.6 },
    { url: `${site}/faq`, lastModified: now, priority: 0.6 },
    { url: `${site}/contact`, lastModified: now, priority: 0.7 },
  ];
}

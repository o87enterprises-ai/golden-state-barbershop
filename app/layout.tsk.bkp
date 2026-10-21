import type { Metadata, Viewport } from "next";
import { brand } from "@/lib/branding";
import { barberShopJsonLd } from "@/lib/schema";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://goldenstatebarbershop.com";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s · ${brand.name}`,
  },
  description:
    "High-end barbershop in California. Fades, classic cuts, beard work and hot-towel shaves. Book online and pay by tapping your phone.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: brand.name,
    url: site,
    title: `${brand.name} — ${brand.tagline}`,
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: brand.colors.black,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(barberShopJsonLd()) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import NdaGate from "@/components/NdaGate";
import AuthStore from "@/lib/auth/AuthStore";
import DemoStore from "@/lib/mock/DemoStore";
import SiteChrome from "@/components/shell/SiteChrome";
import { PREVIEW_MODE } from "@/lib/config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://goldenstatebarbershop.com";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "Golden State Barbershop | Tracy, CA",
  description: "Premium cuts, classic style. Experience the best barbershop in Tracy, California.",
  openGraph: {
    title: "Golden State Barbershop | Tracy, CA",
    description: "Premium cuts, classic style. Book online — pay up front, skip the wait.",
    type: "website",
    siteName: "Golden State Barbershop",
  },
  // Only confidential preview deploys stay out of search engines.
  robots: PREVIEW_MODE ? { index: false, follow: false } : { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const chrome = <SiteChrome>{children}</SiteChrome>;

  return (
    <html lang="en" className={`${inter.variable} ${bebas.variable} antialiased`}>
      <body
        data-preview={PREVIEW_MODE ? "" : undefined}
        className="bg-brand-dark text-white selection:bg-brand-gold selection:text-black"
      >
        <AuthStore>
          <DemoStore>{PREVIEW_MODE ? <NdaGate>{chrome}</NdaGate> : chrome}</DemoStore>
        </AuthStore>
      </body>
    </html>
  );
}

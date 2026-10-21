import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import NdaGate from "@/components/NdaGate";
import PreviewBadge from "@/components/PreviewBadge";
import DemoStore from "@/lib/mock/DemoStore";
import DemoBanner from "@/components/shell/DemoBanner";
import MegaNav from "@/components/shell/MegaNav";
import OverlayHost from "@/components/shell/OverlayHost";
import Toaster from "@/components/shell/Toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

export const metadata: Metadata = {
  title: "Golden State Barbershop | Tracy, CA",
  description: "Premium cuts, classic style. Experience the best barbershop in Tracy, California.",
  // Confidential preview — keep it out of search engines.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bebas.variable} antialiased`}>
      <body className="bg-brand-dark text-white selection:bg-brand-gold selection:text-black">
        <DemoStore>
          <NdaGate>
            <DemoBanner />
            <MegaNav />
            <SmoothScroll>{children}</SmoothScroll>
            <PreviewBadge />
            <OverlayHost />
            <Toaster />
          </NdaGate>
        </DemoStore>
      </body>
    </html>
  );
}
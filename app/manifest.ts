import type { MetadataRoute } from "next";
import { brand } from "@/lib/branding";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: "GSB",
    description: brand.tagline,
    start_url: "/",
    display: "standalone",
    background_color: brand.colors.black,
    theme_color: brand.colors.black,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

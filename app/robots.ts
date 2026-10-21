import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Confidential approval preview — block all crawlers until launch.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}

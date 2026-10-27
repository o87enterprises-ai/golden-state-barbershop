import type { NextConfig } from "next";

// When STATIC_EXPORT=1 we produce a fully static, backend-free build
// for the Cloudflare Pages MOCK preview deploy. Normal dev/build is untouched.
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        images: { unoptimized: true },
        // The preview is frontend-only; don't let untouched backend
        // type/lint errors block the mock build.
        typescript: { ignoreBuildErrors: true },
      }
    : {}),
};

export default nextConfig;

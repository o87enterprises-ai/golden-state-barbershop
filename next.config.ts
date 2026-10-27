import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  experimental: {
    // Helps Webpack reduce its peak memory usage during compilation
    webpackMemoryOptimizations: true,
  },
};

export default nextConfig;
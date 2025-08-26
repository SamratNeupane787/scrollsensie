import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Additional build optimizations
  experimental: {
    // Allow any type errors
    typedRoutes: false,
  },
};

export default nextConfig;

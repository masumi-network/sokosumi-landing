import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@summation/shared", "@meshsdk/core", "@meshsdk/common", "@meshsdk/transaction", "@meshsdk/wallet", "@meshsdk/provider", "@meshsdk/core-csl", "@meshsdk/core-cst"],
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  // Mesh's Cardano WASM needs these on the webpack (production) build path.
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true, topLevelAwait: true, layers: true };
    return config;
  },
  serverExternalPackages: ["better-sqlite3", "@emurgo/cardano-serialization-lib-nodejs"],
  // Developer portal (apps/dev) is a separate deployment served under /dev.
  // Set DEV_PORTAL_URL to its origin (e.g. the Railway service URL).
  async rewrites() {
    const devPortalUrl = process.env.DEV_PORTAL_URL;
    if (!devPortalUrl) return [];
    return [
      { source: "/dev", destination: `${devPortalUrl}/dev` },
      { source: "/dev/:path*", destination: `${devPortalUrl}/dev/:path*` },
    ];
  },
  outputFileTracingIncludes: {
    "/blogs": ["./content/**/*.md"],
    "/blogs/[slug]": ["./content/**/*.md"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;

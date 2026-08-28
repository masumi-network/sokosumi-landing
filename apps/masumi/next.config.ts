import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_MASUMI_REGISTRY_NETWORK:
      process.env.MASUMI_REGISTRY_NETWORK ??
      process.env.NEXT_PUBLIC_MASUMI_REGISTRY_NETWORK ??
      "Mainnet",
  },
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
  // Legacy Masumi Learn routes moved under /learn/course and /learn/library.
  async redirects() {
    const unitSlugs = ["agentic-economy", "masumi-fundamentals", "blockchain-basics", "trust-and-payments"];
    return [
      // The x402 page originally lived at /x402-cardano on the relaunch branch.
      { source: "/x402-cardano", destination: "/x402", permanent: true },
      { source: "/learn/start", destination: "/learn", permanent: true },
      { source: "/learn/completion", destination: "/learn/course", permanent: true },
      { source: "/learn/concepts", destination: "/learn/library#concepts", permanent: true },
      { source: "/learn/glossary", destination: "/learn/library#glossary", permanent: true },
      { source: "/learn/deep-dives", destination: "/learn/library#deep-dives", permanent: true },
      { source: "/learn/patterns", destination: "/learn/library#patterns", permanent: true },
      { source: "/learn/concepts/:slug", destination: "/learn/library/:slug", permanent: true },
      { source: "/learn/dashboard", destination: "/learn/course", permanent: true },
      { source: "/learn/assessment", destination: "/learn/course/assessment", permanent: true },
      { source: "/learn/builder", destination: "/learn/course", permanent: true },
      { source: "/learn/builder/assessment", destination: "/learn/course", permanent: true },
      ...unitSlugs.flatMap((slug) => [
        { source: `/learn/${slug}`, destination: `/learn/course/${slug}`, permanent: true },
        { source: `/learn/${slug}/quiz`, destination: `/learn/course/${slug}/quiz`, permanent: true },
      ]),
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;

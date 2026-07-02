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

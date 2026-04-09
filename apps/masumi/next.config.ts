import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@summation/shared"],
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    "/blogs": ["./content/**/*.md"],
    "/blogs/[slug]": ["./content/**/*.md"],
  },
};

export default nextConfig;

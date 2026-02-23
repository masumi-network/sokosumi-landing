import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@summation/shared"],
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;

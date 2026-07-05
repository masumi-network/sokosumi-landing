import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@summation/shared"],
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  async redirects() {
    return [
      {
        source: "/tools/design-md-creator",
        destination: "https://www.masumi.network/tools/design-md",
        permanent: true,
      },
      {
        source: "/tools/design-md-creator/:path*",
        destination: "https://www.masumi.network/tools/design-md/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

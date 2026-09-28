import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      // The Meta ads launched against /agenturen; the LP now lives at
      // /de/agencies (EN twin at /agencies).
      {
        source: "/agenturen",
        destination: "/de/agencies",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // Scoped to this host only: console. and status. are separate
            // services, so includeSubDomains is deliberately not set.
            key: "Strict-Transport-Security",
            value: "max-age=63072000",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

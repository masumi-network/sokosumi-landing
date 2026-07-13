import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMDX } from 'fumadocs-mdx/next';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  // The developer portal is served at masumi.network/dev
  basePath: '/dev',
  env: {
    // Exposed to client code via lib/base-path.ts (next/image string src and
    // fetch() calls don't get the basePath prefix automatically).
    NEXT_PUBLIC_BASE_PATH: '/dev',
  },
  // Multiple lockfiles (e.g. ~/package-lock.json + this repo) make Turbopack use the wrong root and
  // hang on "Compiling /[[...slug]]". Pin root to the monorepo root (see also global.css tailwind import).
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  output: 'standalone', // Required for Docker deployment
  transpilePackages: ['@summation/shared'],
  reactStrictMode: true,
  // Optimize memory usage
  experimental: {
    // Reduce memory usage during builds
    optimizePackageImports: ['fumadocs-ui', 'lucide-react'],
  },
  // Enable compression to reduce memory usage
  compress: true,
  async redirects() {
    // Old docs URLs (pre-portal) live at the root; Masumi docs now live under /masumi.
    const legacySections = [
      'documentation',
      'core-concepts',
      'api-reference',
      'n8n-node',
      'mips',
    ];
    return legacySections.flatMap((section) => [
      {
        source: `/${section}`,
        destination: `/masumi/${section}`,
        permanent: true,
      },
      {
        source: `/${section}/:path*`,
        destination: `/masumi/${section}/:path*`,
        permanent: true,
      },
    ]);
  },
  async headers() {
    return [
      {
        // Dynamic HTML pages - no caching (ISR handles this)
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store', // prevents DO or any CDN from caching streamed HTML
          },
        ],
      },
      {
        // Static assets - long cache
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API routes - short cache
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=900', // 5 min browser, 15 min CDN
          },
        ],
      },
      {
        // LLM text routes - long cache
        source: '/:path(llms|llms-full).txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400', // 1 hour browser, 24 hours CDN
          },
        ],
      },
    ];
  },
};

export default withMDX(config);

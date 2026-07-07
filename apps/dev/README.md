# Masumi Developer Portal (`apps/dev`)

The developer portal served at **masumi.network/dev**. It hosts the documentation
for both products plus the Nori docs assistant:

| Path | What |
| --- | --- |
| `/dev` | Ask Nori (portal home, chat over all docs) |
| `/dev/masumi/*` | Masumi docs (Documentation, Core Concepts, API Reference, N8N Node, MIPs) |
| `/dev/sokosumi/*` | Sokosumi docs (Documentation, API Reference, CLI, MCP) |
| `/dev/llms.txt`, `/dev/llms-full.txt`, `/dev/md-index` | Machine-readable indexes across both products |
| `/dev/<path>.md` | Any docs page as plain Markdown (used by Nori for citations) |

Built with [Fumadocs](https://fumadocs.dev) on Next.js. The app uses
`basePath: '/dev'`, so every route and asset is served under `/dev` — including
on local dev and standalone deployments.

## Architecture notes

- **Two content collections** (`content/masumi`, `content/sokosumi`) with separate
  loaders (`lib/source.ts`). Root folders inside each product render as navbar tabs.
- **Product switcher**: dropdown next to the logo (`components/product-switcher.tsx`).
  The last visited product is remembered so the "Browse" pill returns to it.
- **basePath helpers**: Next.js does not prefix `next/image` string `src`, plain
  `<img>`, CSS `url()`, or client `fetch()` calls with the basePath. Use
  `withBasePath()` from `lib/base-path.ts` for those (MDX `img` is handled
  centrally in `mdx-components.tsx`).
- **Generated content** (gitignored, produced during `npm run build`):
  - `content/masumi/api-reference/(generated)/` — Masumi payment/registry OpenAPI
  - `content/masumi/mips`, `n8n-node`, `_*.mdx` — fetched READMEs (`scripts/fetch-readme.mjs`)
  - `content/sokosumi/api-reference/**` — Sokosumi OpenAPI (`scripts/sokosumi/generate-openapi.mjs`)
  - `content/sokosumi/cli_docs`, `content/sokosumi/mcp` — fetched READMEs (`scripts/sokosumi/*.mjs`)
- **Legacy URL redirects**: old root paths (`/dev/documentation`, `/dev/core-concepts`, …)
  301 to `/dev/masumi/*` (see `next.config.mjs`).
- **Nori docs corpus**: the chat proxy sends Nori the canonical corpus entry
  points (`https://www.masumi.network/dev/llms.txt`, `/llms-full.txt`, and
  `/md-index`) on every request. Citation links from old docs domains, local
  paths, and source files are normalized to `https://www.masumi.network/dev/...`
  before they render in the chat UI.

## Local development

```bash
# from the repo root
npm install
npm run dev:portal        # http://localhost:3004/dev
npm run build:portal      # full production build (runs all generators)
```

Environment variables (`apps/dev/.env.local`, not committed) — required for the
Nori chat/payment API routes:

```
MASUMI_PAYMENT_API_URL=
MASUMI_PAYMENT_API_KEY=
MASUMI_NETWORK=
NORI_AGENT_URL=
COWORKERS_API_KEY=
```

Optional: `NEXT_PUBLIC_SITE_URL` (defaults to `https://www.masumi.network`) is
used to build absolute URLs in `llms.txt`, `robots.txt`, etc.

## Deployment

The portal is its own service, proxied by the masumi.network website:

1. **Create a service for `apps/dev`** (e.g. on Railway):
   - Build: `npm install && npm run build:portal` (repo root)
   - Start: `npm -w @summation/dev-portal run start` (listens on port 3004)
   - Set the env vars listed above
2. **Point the website at it**: set `DEV_PORTAL_URL=<portal service origin>` on the
   masumi website service (`apps/masumi`). Its `next.config.ts` rewrites
   `/dev/:path*` to the portal. Without the env var the rewrite is disabled.
3. **Website nav**: add a "Developer Portal" link to `/dev` in the masumi.network
   header (not done here to avoid touching the landing page).

### Legacy domain redirects (when cutting over)

- `docs.masumi.network/<path>` → `masumi.network/dev/masumi/<path>` for
  `documentation`, `core-concepts`, `api-reference`, `n8n-node`, `mips`;
  `docs.masumi.network/ask` → `masumi.network/dev`
- `docs.sokosumi.com/<path>` → `masumi.network/dev/sokosumi/<path>` for
  `documentation`, `api-reference`, `cli_docs`, `mcp`; root → `/dev/sokosumi`

Configure these wherever the old domains are hosted (301s), then archive the
old `masumi-docs` and `sokosumi-docs` deployments.

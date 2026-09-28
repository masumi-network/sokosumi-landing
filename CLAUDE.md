# CLAUDE.md

## Codebase Overview

This repository is an npm workspace for Summation/Sokosumi product sites and tooling. It contains a `/dev` Fumadocs developer portal with generated OpenAPI/LLM endpoints, the main Masumi site with explorer/x402/DESIGN.md tooling, a Serviceplan lead-capture site, a Kodosumi landing site, a static Sokosumi marketplace, and a source-compiled shared React package.

**Stack**: npm workspaces, Next.js App Router, React 19, Tailwind v4, Fumadocs/MDX/OpenAPI generation, SQLite via `better-sqlite3`, Blockfrost/Cardano tooling, Browserbase/OpenRouter, Google Sheets/email integrations.

**Structure**: apps live under `apps/*`; reusable product chrome lives in `packages/shared`; generated docs/content/data are common and should be treated carefully.

For detailed architecture, see [docs/CODEBASE_MAP.md](docs/CODEBASE_MAP.md). For the focused dev hub map, see [docs/DEV_HUB_MAP.md](docs/DEV_HUB_MAP.md).

## Writing

All copy on these sites follows the Obvious Adams rule in [AGENTS.md](AGENTS.md). Read it before writing or editing any user-facing text.

## Deploying sokosumi.com

Production is built by Vercel **from `main` only** (git integration). Never `vercel promote` or `vercel --prod` a branch build: on 2026-08-25 a promoted `productspage` build was silently replaced by the next push to `main`, and 14 commits of work "disappeared" from the site until the branches were merged. Merge into `main`, push, done.

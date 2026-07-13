---
name: sokosumi-landing
description: Maintain the Sokosumi landing-page monorepo safely and keep Masumi and Sokosumi documentation destinations synchronized. Use for changes to landing pages, shared headers or footers, calls to action, developer-portal pages, MDX documentation, navigation, public skill.md content, .well-known discovery routes, URL redirects or normalizers, and any task that adds, removes, moves, or changes a Masumi or Sokosumi documentation link.
---

# Sokosumi Landing

Use this repository-specific workflow to avoid isolated landing-page or documentation edits that leave other public surfaces stale.

## Orient before editing

1. Inspect `git status --short` and preserve unrelated changes.
2. Read `docs/CODEBASE_MAP.md` for unfamiliar areas. Read `docs/DEV_HUB_MAP.md` for `apps/dev` work.
3. Identify the owning source. The main surfaces are:
   - `apps/dev`: DevHub, Masumi/Sokosumi MDX, navigation, URL normalization, and generated API docs.
   - `apps/masumi`: Masumi landing site, public `skill.md`, and `.well-known` discovery routes.
   - `apps/sokosumi`: static marketplace landing surface.
   - `apps/serviceplan` and `apps/kodosumi`: related landing sites.
   - `packages/shared`: shared header, footer, logos, and product chrome.
4. Inspect the closest package scripts before choosing validation commands.

## Keep documentation links synchronized

Use these public destinations as the source of truth:

- Developer portal: `https://www.masumi.network/dev`
- Masumi docs: `https://www.masumi.network/dev/masumi`
- Sokosumi docs: `https://www.masumi.network/dev/sokosumi`
- Machine-readable page: append `.md` to the complete page URL
- In DevHub MDX and components: prefer product-rooted paths such as `/masumi/documentation/...` and `/sokosumi/documentation/...`

Treat `docs.masumi.network` and `docs.sokosumi.com` as legacy hosts. Keep them only in intentional compatibility logic such as redirects, legacy-host detection, input normalization, migration notes, or explicit negative instructions. Never use them as a current CTA, citation, API catalog destination, or recommended documentation URL.

Whenever a docs destination, slug, or host changes, search the whole repository and update every affected consumer:

- landing-page CTAs and shared header/footer links;
- `apps/dev/content/**/*.mdx`, including cross-product and related-page links;
- `meta.json` navigation and hand-written DevHub components;
- scripts that fetch, generate, or normalize documentation;
- `apps/masumi/public/skill.md` (the public developer/agent ecosystem guide);
- `apps/masumi/src/app/.well-known/**` discovery responses and API catalogs;
- LLM indexes, markdown examples, READMEs, and comments that act as operational instructions.

Search for both the old and new URL, because partial migrations often leave a mixture. Run:

```bash
node .agents/skills/sokosumi-landing/scripts/audit-doc-links.mjs
rg -n --hidden --glob '!**/node_modules/**' --glob '!**/.next/**' --glob '!**/.git/**' 'docs\.masumi\.network|docs\.sokosumi\.com|www\.masumi\.network/dev' .
```

The audit intentionally allows legacy URLs in known compatibility files. Review any newly allowed occurrence instead of expanding the allowlist casually.

## Respect generated content

- Do not hand-edit `.next`, `.source`, caches, generated data, or bundled build output.
- For generated OpenAPI, CLI, MCP, README, or synced MDX content, update the generator, transformation, source template, or upstream source as appropriate, then regenerate.
- If a generated artifact must be patched urgently, also fix its source so regeneration cannot undo the change.

## Implement landing-page changes

- Reuse the target app's existing components, tokens, typography, and responsive patterns.
- Check whether the same navigation or footer comes from `packages/shared` before duplicating a fix in one app.
- Preserve accessibility, focus behavior, semantic links, analytics hooks, and localization.
- For user-visible layout changes, inspect desktop and mobile renderings and check important interactions rather than relying only on compilation.

## Verify completion

1. Run `audit-doc-links.mjs` after any docs, navigation, CTA, or URL change.
2. Validate moved links against the local MDX route inventory and verify important public destinations in a browser when network access is available.
3. Run the affected workspace's lint, typecheck, tests, or build in proportion to the change.
4. Re-run `git diff --check` and inspect the final diff for unrelated/generated churn.
5. Report any pre-existing stale links separately; do not silently broaden the task unless the user asked for a full migration.

## Grow this skill deliberately

Add concise, repo-specific knowledge when repeated work exposes a stable rule. Good future additions include the approved design tokens and breakpoint conventions, deployment/preview workflow, analytics event contracts, localization rules, content voice, canonical route ownership, and a small visual regression checklist. Keep volatile product copy and one-off task notes out of the skill.

# Sokosumi content: how the site is managed

The Sokosumi site (apps/sokosumi, a zero-dependency Node server) renders its
sub-pages from the shared Payload CMS at
`https://payload-production-6f43.up.railway.app/admin` — the same instance
that powers masumi.network. Every Sokosumi doc has `site = sokosumi`.

## Page map

| URL | Source | Collection |
|---|---|---|
| `/` | static `index.html` | — |
| `/coworkers`, `/coworkers/<slug>` | synced catalog | `coworkers` |
| `/coworkers/<slug>/tasks/<slug>` | synced catalog | `offers` |
| `/tasks` | synced catalog | `offers` (+ `coworkers`) |
| `/vendors`, `/vendors/<slug>` | synced catalog | `vendors` |
| `/use-cases` → `/use-cases/industries/<slug>` → `/use-cases/<slug>` | editorial | `industries`, `use-cases` |
| `/guides`, `/guides/<slug>` | editorial | `guides` |
| `/blog`, `/blog/<slug>` | editorial | `posts` |
| `/releases`, `/releases/<slug>` | editorial | `releases` |
| `/compare`, `/compare/<slug>` | editorial | `comparisons` |
| `/product` | hub for `pages` whose slug starts with `product/` | `pages` |
| `/<any-slug>` | catch-all landing pages (block builder) | `pages` |
| `/press` | `pages` doc with slug `press`, else a static fallback | `pages` |
| `/contact` | static template | — |

Publishing a doc in the admin makes it live within ~5 minutes (the site
caches CMS reads for 5 minutes and keeps serving the last good data if the
CMS is ever down). The sitemap at `/sitemap.xml` updates automatically.

## The nightly catalog sync (do not hand-edit synced fields)

A Payload job (`syncSokosumiCatalog`, nightly at 03:20 UTC, visible under
Payload Jobs in the admin) pulls the product catalog from the site's
`/api/catalog` and upserts:

- **vendors** — created from the product's author/vendor names. Sync only
  ever creates; name each vendor's logo, description, and order yourself.
- **coworkers** — `kind = coworker` (curated, with tasks) and `kind = agent`
  (marketplace listings). Synced fields (name, role, bio, portrait, models,
  hosting, stats, active) are overwritten nightly. Editorial fields are
  yours: `vendor` (sync fills it once when inferable), `longBio`,
  `seoDescription`, `featured`, `order`.
- **offers** — the pre-built tasks (`source = synced`), including
  deliverable, briefing prompt, and sample outputs. Manual offers can be
  added alongside and are never touched by the sync.

Entries that disappear from the product are marked `active = false`, never
deleted. Checking **lockSync** on any doc freezes it completely.

**Slug policy:** a coworker's public slug always derives from its NAME, so
URLs read like the breadcrumbs (`/coworkers/vulc`, not the product's
internal `grok-coding-agent`). The product slug lives in the read-only
`catalogSlug` field, which is what tasks join on — so you can edit the
public slug freely in the admin, and old URLs 301-redirect automatically.

Manual run (payload-cms repo): `npx tsx scripts/sync-sokosumi-catalog.ts`.

## Writing landing pages

`pages`, `use-cases`, and `comparisons` are block-based: hero, rich text,
feature grid, steps, stats, checklist, FAQ, comparison table, testimonials,
image + text, pricing, video, logo strip, CTA band. Compose in the admin;
the site renders them in the house design automatically. Product-specific
landing pages get a slug starting with `product/` so they appear on the
`/product` hub; everything else is a general landing page at `/<slug>`.

Conventions: sentence-case headings, no em-dashes in copy, one CTA band at
the end of a page, and a description on every doc (it is the meta
description and the listing blurb).

## Draft preview

Every collection has a Preview button in the admin. It opens
`<site>/api/preview?secret=…&path=…`, which sets a preview cookie and
renders drafts (requires `PREVIEW_SECRET` and `CMS_PREVIEW_KEY` env vars on
the site). `/api/exit-preview` returns to published-only rendering.

---
name: sumi-cms
description: Create and edit content on masumi.network via the Payload CMS — blog posts, block-based landing pages, glossary terms, FAQs, stack logos. Use when asked to write/publish/update a blog post, landing page, comparison page, or glossary entry for Masumi (and later Sokosumi), or to query CMS content over the REST API. Covers auth, block JSON shapes, Lexical rich text, media uploads, and publishing conventions.
---

# Sumi CMS — content operations for masumi.network

All editable content on masumi.network lives in a Payload CMS. Publishing is
instant-ish: the site re-fetches every ~5 minutes. No deploys for content.

- **API base:** `https://payload-production-6f43.up.railway.app/api`
- **Admin panel (humans):** `https://payload-production-6f43.up.railway.app/admin`
- **Editor guide:** `apps/masumi/CMS.md` in the sokosumi-landing repo (block
  selection guide, worked example, SEO conventions — read it before writing content)

## Collections → URLs

| Collection | Renders at | Notes |
|---|---|---|
| `posts` | `/blogs/<slug>` | blog; category ∈ `articles` \| `announcements` \| `press-releases` |
| `pages` | `/<slug>` | block-based landing pages (7 block types) |
| `glossary` | `/glossary/<slug>` | term + shortDefinition + rich definition + related[] |
| `faqs` | design-md tool page | question/answer, `page: "design-md"`, `order` |
| `stack-logos` | homepage logo wall | name/logo(media)/href/type/order |
| `media` | file uploads | serves at `/api/media/file/<filename>` |

Every collection has a `site` select (`masumi` | `sokosumi` | `kodosumi`).
**Always set it** (default `masumi`). Only masumi renders CMS content today;
Sokosumi wiring is planned — don't create sokosumi content unless asked.

## Reading (public, no auth)

```bash
BASE=https://payload-production-6f43.up.railway.app/api
curl "$BASE/posts?where[site][equals]=masumi&sort=-date&limit=10"
curl "$BASE/pages?where[slug][equals]=example-landing-page&limit=1&depth=1"
curl "$BASE/glossary?limit=100&sort=term"
```

Params: `where[<field>][equals]=`, `sort=-date`, `limit`, `page`,
`depth` (0 ids only, 1 populates relations/uploads). Only **published** docs
are returned. Rich text is pre-rendered to HTML in `contentHtml` (posts,
richText page blocks) and `definitionHtml` (glossary) — prefer these over
parsing Lexical.

## Writing (auth required)

1. Login for a JWT (ask the user for CMS credentials if you have none —
   never invent or hardcode them):

```bash
TOKEN=$(curl -s -X POST "$BASE/users/login" -H "Content-Type: application/json" \
  -d '{"email":"...","password":"..."}' | jq -r .token)
```

2. Create/update with `Authorization: JWT $TOKEN`:

```bash
curl -X POST "$BASE/posts" -H "Authorization: JWT $TOKEN" -H "Content-Type: application/json" -d @post.json
curl -X PATCH "$BASE/pages/<id>" -H "Authorization: JWT $TOKEN" -H "Content-Type: application/json" -d '{"_status":"published"}'
```

- `"_status": "draft"` = invisible everywhere; `"published"` = live in ~5 min
  and auto-added to the sitemap. Default to **draft** and tell the user to
  review unless they explicitly asked you to publish.
- **Unpublish gotcha:** PATCH the doc with `{"_status":"draft"}` directly (no
  `draft=true` query param) — otherwise you stack a draft on top and the old
  version stays live.
- Media upload (multipart): `curl -X POST "$BASE/media" -H "Authorization: JWT $TOKEN" -F "file=@logo.svg" -F '_payload={"alt":"Logo"}'`

## Rich text (Lexical)

`content` (posts), `definition` (glossary), and richText blocks take Lexical
JSON, not markdown/HTML.

- **With repo access:** write markdown and convert with
  `convertMarkdownToLexical` — working examples in the CMS repo
  (`~/Desktop/payload-cms/scripts/seed-*.ts`, run via `npx tsx`).
- **API-only:** construct simple Lexical by hand. Minimal shapes:

```json
{"root":{"type":"root","format":"","indent":0,"version":1,"direction":"ltr","children":[
  {"type":"heading","tag":"h2","format":"","indent":0,"version":1,"direction":"ltr","children":[
    {"type":"text","text":"Section heading","format":0,"style":"","mode":"normal","detail":0,"version":1}]},
  {"type":"paragraph","format":"","indent":0,"version":1,"direction":"ltr","textFormat":0,"children":[
    {"type":"text","text":"Body text with a ","format":0,"style":"","mode":"normal","detail":0,"version":1},
    {"type":"link","version":3,"fields":{"url":"https://www.masumi.network/glossary","newTab":false,"linkType":"custom"},"children":[
      {"type":"text","text":"link","format":0,"style":"","mode":"normal","detail":0,"version":1}]}]}
]}}
```

Text `format`: 0 normal, 1 bold, 2 italic. The CMS auto-generates
`contentHtml` on save via a hook — never write it yourself.

## Page builder blocks (`pages.layout` array)

Each entry needs `blockType`. Shapes:

```jsonc
{ "blockType": "hero", "eyebrow": "?", "heading": "req", "subheading": "?",
  "ctaLabel": "?", "ctaHref": "?", "secondaryCtaLabel": "?", "secondaryCtaHref": "?" }

{ "blockType": "featureGrid", "heading": "?",
  "items": [{ "title": "req", "text": "req" }] }          // 3–6 items, 1 idea each

{ "blockType": "richText", "content": { /* Lexical */ } }

{ "blockType": "logoStrip", "heading": "?", "logos": [10, 11] }  // media IDs

{ "blockType": "faq", "heading": "?",
  "items": [{ "question": "req", "answer": "req (plain text)" }] }

{ "blockType": "comparisonTable", "heading": "?",
  "columns": [{ "label": "Card rails" }, { "label": "Masumi", "highlight": true }],
  "rows": [{ "label": "req", "note": "?",
             "cells": [{ "value": "no" }, { "value": "yes" }] }] }
  // cell values: "yes" → check, "no" → empty circle, anything else renders as text
  // cells align with columns by array order; highlight exactly one column

{ "blockType": "ctaBand", "heading": "req", "subheading": "?",
  "ctaLabel": "req", "ctaHref": "req" }
```

Canonical structure: **hero → proof (grid/logos/comparison) → depth
(richText) → FAQ → ctaBand**, 4–7 blocks. A complete reference doc lives in
the CMS as the draft page `example-landing-page` — fetch it with auth
(drafts are hidden publicly) or duplicate it in the admin.

## Conventions (enforce these)

- **One search query per page** — slug/title/description all target it; check
  no existing page targets it first (`GET /pages`, `GET /glossary`).
- Slugs: lowercase-hyphenated, **never changed after publishing**.
- `description` ≈ 150–160 chars, benefit + query. Required on posts/pages.
- Glossary: `shortDefinition` one sentence; wire 2–3 `related` term IDs both ways.
- Internal links in every rich text body (docs, `/explorer`, `/glossary/...`,
  `/blogs/...`) — masumi docs live at
  `https://www.masumi.network/dev/masumi/documentation`.
- Facts must be accurate to Masumi: escrow on Cardano (TxPipe-audited), USDM
  settlement, x402/A2A/AP2 standards, Sokosumi = marketplace built on Masumi.
  When unsure, check masumi.network or ask — never invent stats.

## Verify after writing

```bash
curl "$BASE/pages?where[slug][equals]=<slug>&limit=1" | jq '.docs[0]._status'
# published? then within ~5 min:
curl -s -o /dev/null -w '%{http_code}' https://www.masumi.network/<slug>   # expect 200 (hit twice — first request triggers cache refresh)
curl -s https://www.masumi.network/sitemap.xml | grep <slug>
```

Local dev (sokosumi-landing repo): masumi runs via the `masumi` launch.json
entry (port 3008). Dev caches CMS responses ~5 min on disk; if content looks
stale, delete `apps/masumi/.next` and restart.

## Schema changes (engineering only)

New collections/blocks/fields happen in the CMS codebase
(`~/Desktop/payload-cms` on Patrick's machine, deployed via `railway up`) and
need a migration — see `apps/masumi/CMS.md` § "Changing the schema". Content
agents should never need this; if a task requires a new block type or
collection, stop and report instead of working around it.

# Masumi CMS — how content works

All editable content on masumi.network lives in a Payload CMS. Publishing
never requires a deploy: the site re-fetches content every ~5 minutes.

- **Admin panel:** https://payload-production-6f43.up.railway.app/admin
- **API base:** https://payload-production-6f43.up.railway.app/api
- **CMS code:** `~/Desktop/payload-cms` on Patrick's machine (Railway project `payload-cms`)

## What is editable

| Collection | What it controls | Where it renders |
|---|---|---|
| `posts` | Blog posts | `/blogs`, `/blogs/<slug>` |
| `pages` | Block-based landing pages | `/<slug>` (any free URL) |
| `glossary` | Agentic-payments glossary terms | `/glossary`, `/glossary/<slug>` |
| `use-cases` | Block-based use-case landing pages | `/use-cases`, `/use-cases/<slug>`, `/use-cases/industries/<slug>` |
| `industries` | Industry taxonomy (shared across sites) | `/use-cases` "By industry" links + industry hub pages |
| `use-case-categories` | Use-case taxonomy (shared across sites) | groups the `/use-cases` hub |
| `guides` | Step-by-step guides | `/guides`, `/guides/<slug>` |
| `releases` | Changelog / release notes | `/releases`, `/releases/<slug>` |
| `comparisons` | Competitor comparison pages | `/compare`, `/compare/<slug>` |
| `faqs` | DESIGN.md tool FAQ (+ its Google FAQ markup) | `/tools/design-md` |
| `stack-logos` | "Connects to your stack" logos | homepage |
| `media` | Uploaded images/files | referenced by the above |

Note: slugs are unique **per site** (a masumi page and a sokosumi page can
share a slug). `industries` and `use-case-categories` are **shared
taxonomies** — they have no `site` field and are reused by every site, so
edit their names/descriptions with all sites in mind.

Everything else on the site (homepage sections, explorer, x402 pages, legal)
is code — change requests go to engineering.

## Adding content in the admin panel

### Blog post
1. **Posts → Create new.** Fill title, description (used as the SEO meta
   description), category, author, date, and write the body in the editor.
2. The slug auto-generates from the title and becomes the URL:
   `/blogs/<slug>`. Don't change slugs of already-published posts.
3. **Save draft** to keep working, **Publish** to go live. Live within ~5 min.

### Landing page (page builder)
1. **Pages → Create new** — or open *"Example landing page (duplicate me)"*
   and use **Duplicate** to start from a working template.
2. Build the page by stacking blocks in the `layout` field. Drag to reorder:
   - **Hero** — headline, optional eyebrow/subheading, primary + secondary CTA.
   - **Feature grid** — heading + cards (title, text), 3 per row.
   - **Rich text** — free-form editor content.
   - **Logo strip** — optional heading + row of logo images.
   - **FAQ** — question/answer accordion.
   - **Comparison table** — columns + rows; cell values `yes` → check,
     `no` → empty circle, anything else shows as text; mark your column
     as highlighted.
   - **CTA band** — black banner with heading, subheading, one CTA.
   - **Stats** — big number row; 2–5 items with `value` + `label`.
   - **Steps** — numbered cards (01, 02, …); 2–6 items with title + text,
     optional heading/subheading.
   - **Testimonials** — 1–6 quote cards with name, optional role and
     avatar image (initial monogram if no avatar).
   - **Media + text** — image beside heading + text; pick the media side
     (left/right), optional CTA.
   - **Checklist** — check-marked list; optional heading + intro.
   - **Pricing** — 1–4 plan cards (name, price, optional per/description,
     feature list, CTA); mark one plan as highlighted.
   - **Video** — paste a YouTube or Vimeo URL → responsive embed;
     optional heading + caption. Unrecognized URLs render as a plain link.
   - **Image** — full-width figure with optional caption.
3. The slug is the URL: slug `agents-for-agencies` →
   `masumi.network/agents-for-agencies`. Publish when ready; the page is
   picked up by the sitemap automatically.

### Glossary term
1. **Glossary terms → Create new.** `term` is the display name,
   `shortDefinition` is the one-liner (also the meta description),
   `definition` is the full explanation.
2. Link 2–3 `related` terms — they render as chips and strengthen internal
   linking (good for SEO).

### Use case
1. **Use cases → Create new.** Fill title and description (the description is
   the card teaser and the SEO meta description).
2. Pick one or more **categories** (groups the use case on `/use-cases`) and
   **industries** (adds it to `/use-cases/industries/<industry>`). Both are
   shared taxonomies — reuse existing entries instead of creating near
   duplicates; only create a new one if it genuinely doesn't exist yet.
3. Build the body with the same `layout` blocks as landing pages (full
   block list under "Landing page" above).
4. Optionally list `relatedAgents` (agent slugs) — they show as a "Works with
   these agents" section. Publish → live at `/use-cases/<slug>` within ~5 min;
   the hub, industry pages, and sitemap update automatically.

### Guide
1. **Guides → Create new.** Fill title, description, pick a **category**
   (`getting-started`, `integrations`, `workflows`, `advanced`) and set
   `order` — guides are listed per category, lowest order first.
2. Write the body in the editor (rendered like a blog post).
3. Link 2–3 `related` guides — they render as chips at the end of the page.
   Publish → live at `/guides/<slug>`.

### Release
1. **Releases → Create new.** Fill title, description, `date`, and optionally
   a `version` (renders as a badge, e.g. `v1.4.0`).
2. Add `highlights` bullets, each tagged `new`, `improved`, or `fixed` —
   the tags are color-coded on `/releases`.
3. The body (optional) holds the full release notes for `/releases/<slug>`.
   The `/releases` timeline sorts by `date`, newest first.

### Comparison
1. **Comparisons → Create new.** Fill title, description, the `competitor`
   name, and upload a `competitorLogo` (shown on the `/compare` cards).
2. Build the page with `layout` blocks — a **Comparison table** block with
   your column marked as highlighted is the usual centerpiece.
3. Publish → live at `/compare/<slug>` and listed on `/compare`.

### FAQ / stack logos
Edit the records directly; order is controlled by the `order` field. The
design-md FAQ also feeds the page's Google structured data — one source,
no drift.

## Using the API

### Reading (public, no auth)
Published content is readable by anyone:

```bash
# All masumi blog posts
curl "https://payload-production-6f43.up.railway.app/api/posts?where[site][equals]=masumi&sort=-date"

# One post by slug
curl "https://payload-production-6f43.up.railway.app/api/posts?where[slug][equals]=meet-sokosumi"

# Glossary, pages, faqs, stack-logos work the same way
curl "https://payload-production-6f43.up.railway.app/api/glossary?limit=100"
```

Useful query params: `where[<field>][equals]=…`, `sort=-date`, `limit`,
`page`, `depth` (0 = ids only, 1 = populate relations like images).
Rich-text bodies are also available pre-rendered as HTML in `contentHtml`
(posts / page richText blocks) and `definitionHtml` (glossary).

### Writing (requires a CMS user)
1. Log in to get a JWT:

```bash
curl -X POST "https://payload-production-6f43.up.railway.app/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"..."}'
# → { "token": "...", ... }
```

2. Create/update documents with the token:

```bash
curl -X POST "https://payload-production-6f43.up.railway.app/api/posts" \
  -H "Authorization: JWT $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My post",
    "description": "One-sentence summary.",
    "category": "articles",
    "author": "Masumi Team",
    "date": "2026-07-14",
    "site": "masumi",
    "_status": "published",
    "content": { ... }
  }'
```

Note: `content`/`definition` fields expect Lexical JSON (what the editor
produces). For programmatic writing, convert Markdown first with
`convertMarkdownToLexical` from `@payloadcms/richtext-lexical` — see the
seed scripts in the CMS repo (`scripts/seed-*.ts`) for working examples.

3. Upload media (multipart):

```bash
curl -X POST "https://payload-production-6f43.up.railway.app/api/media" \
  -H "Authorization: JWT $TOKEN" \
  -F "file=@logo.svg" \
  -F '_payload={"alt":"Logo"}'
```

## How the site consumes it

`apps/masumi/src/lib/cms.ts` fetches the REST API with a 5-minute cache
(ISR). Loaders: `lib/blog.ts` (posts), `lib/glossary.ts` (glossary),
`lib/content.ts` (use cases, industries, categories, guides, releases,
comparisons), `getStackPartners()` in `app/page.tsx` (logos), `getFaqs()`
in the design-md page, and the catch-all route `app/[...slug]/page.tsx`
(pages).
If the CMS is unreachable the site keeps serving its cached version;
the homepage logos additionally have hardcoded fallbacks.

## Changing the schema (engineering)

Collections are defined in the CMS repo (`src/collections/*.ts`). Schema
changes need a migration:

```bash
DATABASE_URL=$(railway variables -s Postgres --json | jq -r .DATABASE_PUBLIC_URL) \
  npm run payload -- migrate:create <name>
railway up -d   # pre-deploy command applies the migration
```

Historical quirk: the `stack-logos` collection maps to the Postgres table
`partners` (its original name) via `dbName` — renaming the table wasn't
worth a data migration.

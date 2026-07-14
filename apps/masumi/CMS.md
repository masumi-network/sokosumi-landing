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
| `faqs` | DESIGN.md tool FAQ (+ its Google FAQ markup) | `/tools/design-md` |
| `stack-logos` | "Connects to your stack" logos | homepage |
| `media` | Uploaded images/files | referenced by the above |

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
2. Build the page by stacking blocks in the `layout` field:
   **Hero** (headline + CTAs), **Feature grid**, **Rich text**, **Logo
   strip**, **FAQ**, **Comparison table** (columns + rows; cell values
   `yes` → check, `no` → empty circle, anything else shows as text; mark
   your column as highlighted), **CTA band**. Drag to reorder.
3. The slug is the URL: slug `agents-for-agencies` →
   `masumi.network/agents-for-agencies`. Publish when ready; the page is
   picked up by the sitemap automatically.

### Glossary term
1. **Glossary terms → Create new.** `term` is the display name,
   `shortDefinition` is the one-liner (also the meta description),
   `definition` is the full explanation.
2. Link 2–3 `related` terms — they render as chips and strengthen internal
   linking (good for SEO).

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
`getStackPartners()` in `app/page.tsx` (logos), `getFaqs()` in the
design-md page, and the catch-all route `app/[...slug]/page.tsx` (pages).
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

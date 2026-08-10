# Sokosumi content: how the site is managed

The Sokosumi site (`apps/sokosumi`, a zero-dependency Node server) renders its
sub-pages from the shared Payload CMS at
`https://payload-production-6f43.up.railway.app/admin` — the same instance that
powers masumi.network. Every Sokosumi doc carries **site = sokosumi**; a doc
saved with the wrong site is invisible here even when published.

**The homepage is not editable.** `/`, `/contact` and `/talk-to-sales` are code,
not CMS docs. Everything else below is yours.

---

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
| `/contact`, `/talk-to-sales` | static templates | — |

Publishing shows up within about five minutes. The sitemap updates itself.

---

## Before you start: five rules

1. **Publish, don't save.** "Save draft" puts nothing on the site. Only
   **Publish** does. Three collections have no draft state at all — coworkers,
   vendors, industries — so every save there is live in five minutes.
2. **A published slug is permanent.** Only coworkers have redirects. Changing a
   published slug on a post, page, use case, guide, release or comparison is a
   hard 404 with nothing to catch it.
3. **Never edit a synced field.** The nightly job overwrites them at 03:20 UTC
   and your change silently disappears overnight. See "The nightly catalog sync".
4. **Deactivate, don't delete.** Deleting a synced coworker or task brings it
   back the next night with every editorial field blank.
5. **Write the description.** It is the meta description, the card teaser, and
   on vendors it decides whether the doc is listed at all. Aim for 150–155
   characters: most pages cut at 155, mid-word.

---

## Adding content in the admin panel

### Use case
1. **Content → Use cases → Create new.** Fill `title` and `description` — the
   description is the card teaser and the meta description.
2. Pick one or more **industries**. This is what puts the use case on
   `/use-cases/industries/<slug>` and what fills the "Use cases" nav dropdown.
   *The first industry you pick wins the breadcrumb and the card eyebrow*, so
   pick the primary one first.
3. Add **relatedAgents** — one row per coworker, using the coworker's slug (or
   its `catalogSlug`). These render as the faces on the card and as a
   "Coworkers for this" section on the page. A slug that matches nothing is
   dropped silently, so check the coworker's URL.
4. Build the body in **layout** with the blocks below. Open with a Hero: a
   use-case page with a layout has no automatic page heading.
5. Publish → live at `/use-cases/<slug>`.

Skip **categories** on Sokosumi — the field exists but nothing here reads it.

### Industry
1. **Taxonomies → Industries → Create new.** `name`, `slug` and `description`
   are all required; the description shows on the industry card.
2. **Industries are shared with masumi.network.** Renaming one changes both
   sites; changing a slug breaks live URLs on both. Reuse an existing entry
   rather than creating a near-duplicate.
3. An industry with no use cases dead-ends: it is hidden from the nav, from the
   `/use-cases` grid, and from the sitemap, while its page still renders an
   empty state. Create the industry and its first use case together.

### Landing page (block builder)
1. **Pages → Create new.** Fill `title`, `description`, and build `layout`.
2. The slug is the URL: slug `agents-for-agencies` →
   `sokosumi.com/agents-for-agencies`. A slug may contain slashes for nesting:
   `product/automation` → `/product/automation`, and anything under `product/`
   is listed on the `/product` hub.
3. **Reserved slugs.** `coworkers`, `tasks`, `vendors`, `use-cases`, `guides`,
   `blog`, `releases`, `compare`, `product`, `contact`, `talk-to-sales` belong
   to code routes — a page with one of those slugs never renders. `press` is
   the deliberate exception: a page with slug `press` replaces the built-in one.
4. `/product` is not linked from anywhere on the site yet. If you publish under
   `product/`, link to it yourself from a block.

### Guide
1. **Content → Guides → Create new.** Fill `title`, `description`, a **category**
   (`getting-started`, `integrations`, `workflows`, `advanced`) and `order`.
2. Write the body in the editor. Link 2–3 `related` guides — they render as
   chips at the end.
3. Optional **`coverImage`** (sidebar) renders under the heading, and optional
   **`sections`** blocks render after the body — see *Pictures in articles*.
4. Guides are sorted globally by `order`, then bucketed by category, so a
   *section* moves up only when one guide inside it gets a lower `order`.

### Blog post
1. **Posts → Create new.** Fill title, description, category, author, date, and
   the body.
2. **`coverImage`** (sidebar) is the lead image and the social preview. Leave it
   empty and the page falls back to a product screenshot, so a post is never
   text-only — but a real cover always beats the fallback.
3. Optional **`sections`** blocks render after the body — see *Pictures in
   articles*.
4. Live at `/blog/<slug>`. Note Masumi uses `/blogs/`, Sokosumi uses `/blog/`.
5. The blog is linked from the footer only; there is no header nav item.

### Release
1. **Content → Releases → Create new.** Fill `title`, `description`, `date`, and
   optionally a `version` badge.
2. Add `highlights` bullets tagged `new`, `improved`, or `fixed`.
3. **Fill in the body.** A release with no body renders as plain text in the
   timeline rather than a link, while `/releases/<slug>` still exists — an
   orphan page nothing points to.
4. Optional **`coverImage`** and **`sections`** blocks — a release note that
   shows the thing it announces lands better than one that describes it. See
   *Pictures in articles*.

### Comparison
1. **Content → Comparisons → Create new.** Fill `title`, `description`, the
   `competitor` name, and upload a `competitorLogo` for the `/compare` cards.
2. Build `layout`; a **Comparison table** with your column highlighted is the
   usual centrepiece.
3. Live at `/compare/<slug>`.

### Vendor
1. Vendors are normally created by the nightly sync. You enrich them:
   **description**, **website**, **order**, and the **logo** upload.
2. **A vendor with no coworkers and no description is not listed** on `/vendors`
   at all, even though its page resolves. Write a description.
3. **Logo:** the `logo` upload always wins over the synced `logoUrl`. Upload the
   *dark* version of a wordmark — the automatic white-to-ink correction only
   applies to synced artwork, so a white-on-transparent upload renders invisible.
4. Unticking `active` hides the vendor and 404s its page — but coworker profiles
   still link to it. Prefer leaving it active with a thin description.

### Coworker
Almost everything here is synced. Yours to edit:
- **slug** — the public URL. Safe to change; old catalog-slug URLs still 301.
- **vendor** — the sync fills it once while empty, then leaves it alone.
- **longBio**, **seoDescription**, **order**.
- **lockSync** — freezes the whole doc against the nightly job.

`imageOverride`, `featured` and `capabilities` are stored but **not rendered on
this site**. Don't rely on them. `order` only breaks ties between coworkers with
the same number of template tasks, so setting it to 1 usually changes nothing.

### Template task (offer)
Synced. Add a manual one only if a task exists outside the product catalog, and
note the trap: **`agentSlug` must be the coworker's `catalogSlug`**, not the
public slug in the URL. A mismatch means the task never appears and has no URL.

---

## Testimonials

Quotes live in **Content → Testimonials**, not inside a page. Each has the
quote, the person, their role, an optional portrait, an `order`, and an
`active` checkbox that pulls it from the sites without deleting it.

To put one on a page, add a **Quote** block and pick the person. It renders as
a single large pull quote — one per page, by design. The old multi-quote grid
is gone: it put the same five names on every page that used it, which reads as
filler rather than proof.

`/pricing` and the use-cases hub pick a quote automatically, and deliberately
pick different ones. Anything you add to the collection is in that rotation.

---

## Pictures in articles

Posts, guides and releases are prose first, so they do not use the full block
builder. They get two picture slots instead:

- **`coverImage`** (sidebar) — the lead image at the top of the page, and on
  `/blog` the image on the listing card. One per document.
- **`sections`** (below the body) — a short block list rendered *after* the
  prose: **Image**, **Media + text**, **Video**, **Checklist**, **CTA band**,
  **Rich text**. Same editor as the page builder, fewer blocks: a blog post has
  no business holding a pricing table.

Upload artwork under **Media**. The four Sokosumi product screenshots are
already there (roster, briefing bar, task board, chat) — reach for those when a
post has no picture of its own.

Two things to know:

- Blog cards and blog headers **fall back to a product screenshot** when
  `coverImage` is empty, so the page never looks broken. That is a safety net,
  not a substitute — a post about a customer story should not be illustrated
  with a screenshot of the task board.
- A **CTA band inside `sections`** stacks on top of the one every page already
  ends with. Only add one if you deliberately want a mid-page close.

---

## The block builder

`pages`, `use-cases` and `comparisons` build their body from blocks. Drag to
reorder. Open with a Hero — those three collections render no heading of their own.

| Block | Fields | Use it for | Not for |
|---|---|---|---|
| **Hero** | eyebrow, heading*, subheading, two CTAs | The one message and action the page exists for. Always first. | Two CTAs with different goals — pick one primary. |
| **Rich text** | content* | Narrative that reads top to bottom. | Parallel items — use a grid. |
| **Feature grid** | heading, items (title*, text*) | 3–6 parallel benefits, one idea each. | Anything needing more than two sentences per item. |
| **Steps** | heading, subheading, 2–6 items | A sequence. Numbered 01, 02 … automatically. | Unordered lists. |
| **Checklist** | heading, intro, 2+ items | "What you get" — scannable outcomes. | Long explanations. |
| **Stats** | heading, 2–5 items (value*, label*) | Big numbers with proof behind them. | Numbers you cannot source. |
| **FAQ** | heading, items (question*, answer*) | Real objections. Also generates Google FAQ structured data — the only block that does. | Padding a thin page. |
| **Comparison table** | heading, columns, rows | Us-versus-them. Cells: `yes` → check, `no` → empty, anything else is text. | More than ~4 columns. |
| **Quote** | testimonial*, heading | One customer quote, at display size. Pick from **Content → Testimonials**; different pages should pick different people. | More than one — the block is deliberately singular. |
| **Media + text** | image, heading, text, side, CTA | A screenshot next to its explanation. | Decorative images. |
| **Logo strip** | heading, logos* | Customer or partner marks. | Fewer than four logos. |
| **Pricing** | heading, 1–4 plans | Plan comparison; highlight one. | Anything not actually purchasable. |
| **Video** | url, heading, caption | YouTube or Vimeo. **Any other URL renders nothing at all.** | Self-hosted files. |
| **Image** | image*, caption | Full-width figure. | Logos — use the strip. |
| **CTA band** | heading*, subheading, CTA | The single close. One per page, last. | Mid-page interruptions. |

\* required.

A block that errors while rendering is skipped silently. If a section is missing
from a published page, suspect the block, not the cache.

---

## Worked example: a new use case

1. **Taxonomies → Industries** — confirm the industry exists. If not, create it.
2. **Content → Use cases → Create new.**
   - title: `Competitor monitoring, every week`
   - description: one sentence, ~150 characters, saying what the reader gets.
   - industries: the primary one first.
   - relatedAgents: `meta-ads-library`, `website-traffic-analysis`, `hannah`.
3. Layout: **Hero** → **Steps** ("How it runs") → **Checklist** ("What lands in
   your inbox") → **FAQ** → **CTA band**.
4. **Publish.** Within five minutes it is on `/use-cases`, on the industry page,
   in the "Use cases" nav dropdown, and in the sitemap.

---

## "I published it — where is it?"

In order of likelihood:

1. It is still a **draft**. Save draft publishes nothing.
2. `site` is not **sokosumi**.
3. You are inside a **preview session**. The preview cookie lasts two hours and
   applies to every page, so the site may be showing you drafts everywhere.
   Visit `/api/exit-preview` to leave.
4. The **cache**: up to five minutes for content, up to ten for the nav menus.
5. A **listing filter** excluded it:
   - vendor with no coworkers *and* no description → not on `/vendors`
   - industry with no use cases → not in the nav, not on `/use-cases`
   - coworker or task with `active` unticked → gone from listings and its page
   - task whose `agentSlug` matches no coworker → dropped with no warning
   - release with no body → shown, but not clickable
6. You hit a **reserved slug** (see "Landing page" above).

---

## The nightly catalog sync (do not hand-edit synced fields)

A Payload job (`syncSokosumiCatalog`, 03:20 UTC, visible under Payload Jobs)
pulls the product catalog from the site's `/api/catalog` and upserts:

- **vendors** — created from the product's author/vendor names. Sync only ever
  creates; description, website and order are yours.
  The wordmark is the one exception: `logoUrl` + `logoInvert` are filled from
  the catalog while empty and never touched again. A wordmark is only taken when
  the product's own vendor record names it, or when two separate listings carry
  the same artwork — one listing is not evidence about a company. Upload a
  **logo** to override; that always wins. `logoInvert` means the artwork is
  white, so the site flattens it to ink on light backgrounds.
- **coworkers** — `kind = coworker` (curated, with tasks) and `kind = agent`
  (marketplace listings). Synced fields (name, role, bio, portrait, models,
  hosting, stats, active) are overwritten nightly. Editorial: `vendor` (filled
  once when inferable), `longBio`, `seoDescription`, `order`, and the slug.
- **offers** — the template tasks (`source = synced`), including deliverable,
  briefing prompt, and sample outputs. Manual offers are never touched.

Entries that disappear from the product are marked `active = false`, never
deleted. Ticking **lockSync** on a doc freezes it completely.

**Slug policy:** a coworker's public slug always derives from its NAME, so URLs
read like the breadcrumbs (`/coworkers/vulc`, not the product's internal
`grok-coding-agent`). The product slug lives in the read-only `catalogSlug`,
which is what tasks join on — so you can edit the public slug freely and old
URLs 301 automatically.

Manual run (payload-cms repo): `npx tsx scripts/sync-sokosumi-catalog.ts`.

---

## What changes the navigation

Both dropdown menus are computed from the CMS; nothing in them is hardcoded
except the four top-level labels.

- **AI Coworkers menu** — one column per vendor, headed by the vendor's
  wordmark (its name in text when it has none). **Curated coworkers only**
  (`kind = coworker`): marketplace listings outnumber them ten to one and would
  bury them. Top 3 vendors by how many curated coworkers they have, 4 each. To
  get a coworker in: set `kind = coworker`, set its `vendor`, keep the vendor
  `active`, and lower the coworker's `order`. A coworker with no vendor never
  appears in the menu at all.
- **Use cases menu** — one row per industry that has at least one published use
  case, up to six, in name order.

The homepage menu is built in the browser from `/api/nav` and can lag the
sub-page menus by a few minutes. Preview mode affects sub-page menus only.

---

## Writing conventions

- Sentence-case headings. No em-dashes.
- One CTA band per page, at the end.
- A description on every doc, 150–155 characters.
- **One noun.** Everything a visitor reads calls them AI coworkers, never
  agents — Title Case ("AI Coworkers") only for standalone labels like nav and
  button text, sentence case everywhere else. The `kind` field still separates a
  curated coworker from a marketplace listing; say that in words when it matters
  ("on the marketplace") instead of reaching for a second noun.
- **"Free" only ever describes the account.** Every listing costs credits, so
  copy may say signing up is free and must never say running a task is.

---

## Talk to Sales enquiries

`/talk-to-sales` posts to the site's own `/api/sales-inquiry`, which writes a
**sales-inquiries** doc and then emails the notification address. Storing comes
first on purpose: if the mail provider is down the lead is still in the admin
rather than lost.

The collection holds contact details, so both reading *and* creating require
authentication — the public cannot list it or post to it directly. The site
writes with the API key of the `forms@sokosumi.com` user (`CMS_FORMS_KEY`).
Work an enquiry by moving its **status** (new → contacted → qualified → closed);
**notified** shows whether the email went out.

Site env: `CMS_FORMS_KEY` (required to store), `RESEND_API_KEY` (enables the
email), `SALES_NOTIFY_EMAIL` (default `info@sokosumi.com`), `SALES_FROM_EMAIL`
(a Resend-verified sender).

---

## Draft preview

Every collection with drafts has a Preview button — posts, pages, use cases,
guides, releases, comparisons, offers. Coworkers, vendors and industries have no
drafts, so no button.

The button opens `<site>/api/preview?secret=…&path=…`, which sets a two-hour
cookie and renders drafts (needs `PREVIEW_SECRET` and `CMS_PREVIEW_KEY` on the
site). `/api/exit-preview` returns to published-only rendering — use it before
checking whether something is really live.

---

## Using the API

Reading is public and needs no auth:

```bash
curl "https://payload-production-6f43.up.railway.app/api/use-cases?where\[site\]\[equals\]=sokosumi&limit=50"
```

Writing needs a CMS user. The site's own key (`forms@sokosumi.com`) can only
touch sales enquiries. For anything else, log in at `/admin`.

---

## Changing the schema (engineering)

The CMS runs with `push: false` — migrations are the source of truth. Adding a
field means: edit the collection, `pnpm payload migrate:create <name>`,
`pnpm payload migrate`, `pnpm generate:types`, then deploy. Never hand-write a
migration without its `.json` snapshot, or the next generated migration will
re-emit the same column.

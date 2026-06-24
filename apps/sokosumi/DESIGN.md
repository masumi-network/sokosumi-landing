# Sokosumi — Landing Page Design System

> Single source of truth for the new Sokosumi marketing/landing page.
> Synthesised from two inputs: (1) the **live product** `masumi-network/sokosumi`
> (`apps/web`, Next.js 16 + Tailwind v4 + shadcn/ui) and (2) the official
> **AGENTIC Brand Guidelines** (`2503-Agentic-Brand Guidelines`, 52pp).
>
> Where the two disagree, the **brand guide wins for visual language** (color,
> type, logo, ink) and the **product wins for component behaviour** (buttons,
> cards, states). Both are quoted with real values below.

---

## 0. What Sokosumi is

Sokosumi is the **marketplace** of the AGENTIC family — the place where you
**hire AI agents (co-workers)** to do real work, priced in **credits**.

The AGENTIC family has three brands that share one design language but differ by
accent colour:

| Brand | Role | Primary colour | Kanji |
|-------|------|----------------|-------|
| **masumi** | the blockchain / payment layer | Iris Flower 菖蒲色 `#FF51FF` | 真墨 |
| **kodosumi** | the code / runtime layer | Young Grass 若草色 `#C4FE0A` | コード墨 |
| **sokosumi** | the **marketplace** (this site) | **Wisteria Purple 藤色 `#6400FF`** | 倉庫墨 |

The brand name comes from **墨 (sumi) = ink**. Ink is the central metaphor: fluid
black ink represents "the movement and flow of AI agents." Sokosumi is described
as *"a vessel where masumi and kodosumi interact and communicate through their
colour palettes"* — so its purple sits between kodosumi's green-blue and masumi's
pink-orange, and its visuals can borrow both.

**Positioning line (product, verbatim):** "Hire AI Agents with the click of a button."

---

## 1. Brand principles

1. **Minimalist & precise.** Black/white + one accent (purple). Ample white space.
   "Emphasising contrast elements and making use of ample white space."
2. **Sentence case, always.** Headlines are never ALL CAPS. Never mix weights in
   a single headline.
3. **Ink, not icons.** Use fluid ink/gradient visuals to express abstract ideas
   rather than literal iconography.
4. **Everything is moving.** Blur, glow and motion express the living, flowing
   nature of agents — but always subtle, never noisy.
5. **Light-first.** Default theme is light (white / off-white). Full dark-mode
   parity exists but light is the hero.
6. **Flat elevation.** Depth comes from borders, hover tints and soft ink-glow —
   not heavy drop shadows.

---

## 2. Colour

### 2.1 Primary (sokosumi)
| Token | Name | Hex | Use |
|-------|------|-----|-----|
| `--primary` | Wisteria Purple 藤色 | **`#6400FF`** | CTAs, links, focus, active nav, accents |
| `--primary-foreground` | — | `#FAFAFA` | text/icons on purple |

Product equivalent (HSL): `hsla(264, 100%, 50%)` ≈ `#6A00FF` — treat `#6400FF`
as the canonical brand value.

### 2.2 Neutral ramp (shared across all brands — the workhorse palette)
| Token | Hex | | Token | Hex |
|-------|-----|---|-------|-----|
| Black | `#000000` | | Neutral 400 | `#A3A3A3` |
| Neutral 950 | `#0C0C0C` | | Neutral 300 | `#D4D4D4` |
| Neutral 900 | `#171717` | | Neutral 200 | `#E5E5E5` |
| Neutral 800 | `#262626` | | Neutral 100 | `#F5F5F5` |
| Neutral 700 | `#404040` | | Neutral 50 | `#FAFAFA` |
| Neutral 600 | `#525252` | | White | `#FFFFFF` |
| Neutral 500 | `#737373` | | | |

**Alpha shades** = black at 90/80/70/60/50/40/30/20/10/5 % opacity. Use these for
hairline borders, muted text, hover tints (matches product's `--quinary` etc.).

### 2.3 Semantic light → surface mapping (from the live product)
| Role | Light | Dark |
|------|-------|------|
| Page background | `#FFFFFF` | `#0A0A0A` (Neutral 950-ish) |
| Platform / app canvas | `#FAFAFA` | `#171717` |
| Card surface | `#FFFFFF` / `#FAFAFA` | `#171717` |
| Foreground (text) | `#0A0A0A` | `#FAFAFA` |
| Muted foreground | `foreground @ 50%` | same |
| Border / input | `#E5E5E5` (≈90% gray) | white @ 10% |
| Focus ring | purple/pink-tinted | same |

### 2.4 Accent options ("Personalize sokosumi")
Default is purple, but sokosumi explicitly supports per-user accent theming. Use
these only for the agent/category gradient system, never to replace the purple
brand CTA:
`Wisteria Purple #6400FF` (default) · `Sky Blue #00A4FA` · `Light Teal #0AFED3` ·
`Neon Grass #0AFA14` · `Young Grass #C4FE0A` · `Persimmon #FF6400` ·
`Iris Flower #FF51FF`.

### 2.5 Gradients
Sokosumi gradients are **purple-led ink**: `#6400FF` blending into lavender/white,
and — because sokosumi is "the vessel" — optionally toward `#FF51FF` (magenta) and
`#0AFED3`/`#C4FE0A` (teal/lime) for richer agent imagery. The product pairs
`--primary` (purple `264°`) with `--primary-iris` (magenta `300°`).

### 2.6 Semantic status (product)
destructive `#D7263D`-red · warning yellow · critical amber · success
`#16A34A`-green · info cyan. Reuse only for functional UI (form errors, badges).

---

## 3. Typography

**Typeface: Inter** (the brand's only typeface; `next/font/google` in product).
"Built on the versatility and clarity of Inter, emphasising simplicity and
modernity." No serif, no second display face.

### 3.1 Weights (limited set, on purpose)
| Weight | Use |
|--------|-----|
| **Inter Light (300)** | Display / hero / large headlines. "Delicate, airy, sophisticated." Used for everything ≥ 20px. |
| **Inter Regular (400)** | Body text, the workhorse. Everything ≤ 18px. |
| **Inter Medium (500)** | Subtle emphasis, subheads, labels, buttons. |
| **Inter Semibold (600)** | Callouts, eyebrow labels, column headers. |

> The weight **lightens as size grows** (big = Light, small = Regular). This is a
> defining rule. Never use Bold for headlines.

### 3.2 Type scale (pentatonic — base 12px, ratio r = 2^(1/5) ≈ 1.1487)
Font size doubles every 5 steps. `aₙ = 12 × 1.1487^(n-1)`.

| Weight | Size / Line-height / Tracking |
|--------|-------------------------------|
| Regular | 6/8/0% · 7/10/0% · 8/12/0% · 9/12/0% · 10/14/0% · 11/14/0% · 12/16/0% · 14/18/0% · 16/20/0% · 18/22/0% |
| Light | 20/24/0% · 24/28/-0.5% · 28/32/-1% · 32/36/-1.5% · 36/40/-2% · 42/48/-2.5% · 48/56/-3% · 55/56/-3% · 64/64/-3.5% · 73/72/-4% · 84/80/-5% · 96/86/-5% · 110/104/-5% |

**Rule of thumb:** body = Regular, 0% tracking. Display = Light, **negative
tracking that tightens as it grows** (−0.5% at 24px → −5% at 84px+).

### 3.3 Landing page type roles (suggested)
| Role | Spec |
|------|------|
| Hero H1 | Inter Light, 64–96px, tracking −3.5%→−5%, line-height ≈ 1.0 |
| Section H2 | Inter Light, 36–48px, tracking −2%→−3% |
| Sub-head / H3 | Inter Medium, 20–24px |
| Eyebrow / label | Inter Semibold, 12px, `uppercase` is **allowed only for tiny labels**, tracking +wide |
| Body | Inter Regular, 16–18px, line-height 1.4–1.5 |
| Caption / meta | Inter Regular, 12–14px, muted-foreground |

### 3.4 Typography rules
- **Alignment: left-aligned or centered only.** Never right-align, never justify.
- Headlines in **Sentence case** (not Title Case, not ALL CAPS).
- No mixed weights inside one headline. No extreme/tight leading. No crashing
  ascenders/descenders. No overly wide or tight tracking.

---

## 4. Logo & symbol

- **Wordmark:** `sokosumi` — custom geometric lowercase with circular letterforms
  (reversed `s`, perfectly round `o`/`u`). Assets exist in product:
  `sokosumi-logo-{black,white}.svg`.
- **On colour:** logo is **always neutral (black or white)** on coloured/photo
  backgrounds. On a neutral background it *may* use the brand purple.
- **Kanji:** 倉庫墨. In a lockup the Kanji sits **to the right** of the wordmark;
  one Kanji block = height of the `i` in "sumi". For partner lockups use the
  wordmark **only** (no Kanji).
- **Symbol / icon:** the swirl mark (two interlocking half-circles forming an
  S-swirl in a circle). Use only where the full logo doesn't fit, or alongside
  other brand symbols. Can be purple / black / white / animated gradient. Product
  has `SokosumiIcon` with an `animate-rotate-once` reveal.
- **Min sizes:** 14px (wordmark only), 30px (lockup with Kanji).
- **Clearspace:** based on the width of the wordmark's `s` (2× small formats,
  1× large). Don't crowd it.

---

## 5. Layout & grid

- **Columns:** responsive — 2 / 4 / 6 / 8 / 12 columns by viewport. Use **12-col**
  for desktop web; collapse down on tablet/mobile.
- **Margins scale inversely with format:** small formats get *bigger* relative
  margins, large formats get narrower margins; spacing between elements ≈ margin
  width. Keeps compositions proportional.
- **The segmented line (signature device).** A thin horizontal rule that anchors
  content to the grid, separates sections, and **labels hang off it** — e.g. a
  `Headline` flush-left and a `Subheadline / Lorem ipsum` at a column further
  right, both sitting under the same hairline. Use this to head every major
  landing section (it's the same device the brand guide uses on its own pages).
- **Decorative grid.** Subtle squares + diagonal lines, used *behind* text or as a
  placeholder when ink/gradient can't be used. Full-bleed, **not** aligned to
  margins, and **never placed over ink visuals** (it must not compete with the
  ink). This is the faint pattern on the dark section dividers.
- **Imagery can be full-bleed**; type and graphics align to the grid.
- **Radius:** base `0.625rem` (10px). `sm` 6 · `md` 8 · `lg` 10 · `xl` 14.
  Cards = `rounded-xl`, agent cards `rounded-lg`, badges `rounded-md/sm`.
- **Elevation:** flat. `shadow-none` cards; depth via border + hover tint + soft
  ink-glow. Container max-width ≈ 1400px.

---

## 6. Visual language ("creating visuals")

This is what makes Sokosumi *not* look like a generic SaaS template. Lean into it.

### 6.1 Ink (墨 / sumi) — the core
Fluid, two-dimensional **black ink** shapes that visualise content and the flow of
agents. Layered for depth; **soft blur contrasts with sharp edges** — "like looking
through frosted glass: the closer something gets, the clearer and sharper it
appears." Ink **replaces photography** for abstract concepts.

### 6.2 Ink + gradient
Add the brand colour to the ink. For sokosumi → **purple ink gradients** (violet →
lavender → white), optionally bleeding to magenta/teal because sokosumi is the
vessel. Core ink behaviour stays identical across brands.

### 6.3 Blur & glow
Blurred ink/gradient = a **soft glow**. Use as subtle "drop shadows" to add depth
to elements. Blur behind UI on busy backgrounds for readability → a smooth,
elegant, **glassmorphic / gradient-like** aesthetic (product has a full
`--material-*` glass token system). Subtle grid lines may appear on calm
backgrounds without competing.

### 6.4 Generative art
"As an AI-driven company, we create visuals from nothing but words." Agent imagery
is **AI-generated from text** (creative-coding lineage: Tim Rodenbröcker, Zach
Lieberman). Each agent/category gets a **unique generative gradient thumbnail** —
in the product these are server-driven per-category gradients with 135° gradient
borders.

### 6.5 Photography (when used)
Three flavours, all "everything is moving":
1. **Abstract macro / nature** — organic textures + grain, tinted with brand
   colours, partially blurred. Mood without stock photos.
2. **Motion** — long-exposure / motion-blur keeps the key subject sharp while the
   rest dissolves.
3. **Real human** — warmth & humanity to contrast the artificial: real-life
   settings, candid, organic colour tones, soft depth-of-field, approachable,
   **no harsh light or extreme contrast.**

---

## 7. Components (from the live product → adapt for landing)

All buttons `cursor-pointer`, `rounded-md`, `text-sm font-medium`, focus ring
`ring-[3px]`.

| Component | Spec |
|-----------|------|
| **Primary button** | `bg-[#6400FF] text-[#FAFAFA] hover:bg-[#6400FF]/90`. The purple CTA ("Register Now", "Hire Agent", "Start now"). |
| **Secondary button** | near-black `bg-foreground` fill, light text. |
| **Subtle button** | `bg-quinary` (gray @ ~5%) `hover:bg-quinary/70` — the "View"/"Show" button on cards. |
| **Ghost / link** | text-only, used in nav. |
| **Badge / pill** | `rounded-md border px-2 py-0.5 text-xs font-medium`; purple default, plus tag pills (`research`, `scraping`, `analysis`). |
| **Card** | `bg-card rounded-xl border p-6`, flat, hover lifts via tint. |
| **Agent card** | fixed-width vertical card, generative-gradient thumbnail, per-category **135° gradient border**, verified `ShieldCheck` (green), `StarRating`, price in **credits / $**, "Show" button, author. Hover = `roll-up` (translate −0.4rem) + image `scale-1.03`. |
| **Glass modal** | `material-regular` (white @ 85%) + backdrop blur. |
| **Search bar** | dark pill with purple icon button ("Search agents"). |

Icons: **lucide-react** (stroke icons). Integration logos via `@lobehub/icons`.

---

## 8. Landing page — information architecture

Recommended section order (synthesised from the product's `Landing` namespace +
the brand-guide mockups). Each section opens with the **segmented-line** header.

1. **Header / nav** — logo left; nav: `Agents Gallery · How It Works · Community ·
   Monetize`; right: search + **Log in** (purple) + Open App.
2. **Hero — marketplace search** (Fiverr energy, Sokosumi look). Full-bleed
   **background video** of real people doing creative work (warm, candid — the
   brand guide's "human warmth contrasting AI" photography direction), under a
   dark scrim + faint purple tint. Centered over it:
   - **Avatar trust-stack** (5 brand-gradient circles) + **"75+ agents on Sokosumi"**.
   - H1 (Inter Light, white, sentence case): **"What do you want to get done?"**
   - Sub: *"Hand real work to your AI coworkers, or start from a ready-to-run offer."*
   - **The search pill** — dark `#0A0A0A` rounded-full with a **gradient ring
     purple `#6400FF` → sky-blue `#00A4FA`** that intensifies + glows on focus, an
     **animated rotating placeholder** (3s cycle, reduced-motion aware) cycling
     `Search agents, coworkers, and offers… / Competitive analysis / Code review /
     Competitor deep-dive / Scaffold a feature / Pitch deck from a brief`.
     (Lifted from the real product — PR #3188, `coworker-gallery-section.tsx`.)
   - **Quick-start chips** (glassy, over video): the same 5 task labels, click → fills search.
   - **Trusted-by** strip: Cardano Foundation · Serviceplan Group.
   - Bottom-right **pause/play** control for the video.
   - Asset: `apps/sokosumi/assets/hero-bg.mp4` (1920×1080, 10s loop) + `hero-poster.jpg`.
     ⚠️ Source is ~37 MB — **compress to a web-optimised MP4 (+ WebM) before launch.**
   - Old direction (kept for reference, not used): Inter Light *"Hire your first
     agentic co-workers today"* on a purple ink-glow on white, "Register Now" CTA.
3. **Endorsement strip** — "Endorsed by leading brands" (logo row, grayscale).
4. **Agent gallery preview** — grid of agent cards w/ generative gradient
   thumbnails, ratings, credits pricing.
5. **Numbers that talk** — `120 min` smarter hours · `42% less` costs · `1000+`
   agents (stat blocks).
6. **How it works (3 steps)** — Choose Your Agent → Assign Task → Review & Iterate.
7. **Testimonials** — *Frederik Gregaard, CEO Cardano Foundation*; *Florian Haller,
   CEO Serviceplan Group*. Use the centered-quote-under-a-line layout.
8. **For developers** — "Deploy your agents on Masumi" → Visit Docs / Visit Masumi
   Network. (Cross-links the family.)
9. **Community / final CTA** — "Join the Community" + repeat "$30 free credits".
10. **Footer** — logo, brand-family links (masumi / kodosumi), legal, socials.

### Voice & vocabulary
Verbs: **Hire**, **Assign**. Agents do **Jobs**. Work is priced in **credits**.
Trust signals: green **verified** shield (Masumi DID), EU AI Act risk badge.
Tone: confident, plain, productivity-focused; sentence case throughout.

---

## 9. Motion

- Subtle and `prefers-reduced-motion`-aware (product gates all motion on it).
- Patterns to reuse: logo `rotate-once` reveal; agent-card `roll-up` on hover;
  image `scale-1.03` zoom; drifting blurred gradient "blobs" (slow 22–30s,
  `blur(110px)`); reasoning/loading "text-shine" shimmer.
- Library: `motion` (Framer Motion) + CSS keyframes, as in product.

---

## 10. Implementation notes

- **Stack to match product:** Next.js (App Router) + **Tailwind CSS v4**
  (CSS-first `@theme`, no `tailwind.config.js`) + **shadcn/ui** (`new-york`,
  base `neutral`, CSS variables) + Inter via `next/font` + `lucide-react` +
  `motion`. This keeps the landing visually identical to the app and lets us lift
  components from `apps/web`.
- **Tokens:** port `globals.css` from `masumi-network/sokosumi/apps/web` as the
  starting token sheet, then ensure `--primary = #6400FF`.
- **This repo:** `apps/sokosumi` currently ships a static placeholder
  (`index.html` + `server.js`). The landing page replaces it. Railway **Root
  Directory must stay `/`** (monorepo builds from root; app-scoped root breaks
  `@summation/shared`).
- **Domain note:** `sokosumi.com` still points at Webflow; this rebuild currently
  lives only on Railway. Custom-domain cutover is a separate decision.

---

## Appendix — exact brand colour reference

```
sokosumi  Wisteria Purple 藤色   #6400FF   ← primary
masumi    Iris Flower 菖蒲色      #FF51FF
kodosumi  Young Grass 若草色       #C4FE0A
Black                            #000000
White                            #FFFFFF
Neutral 950/900/800/700/600      #0C0C0C #171717 #262626 #404040 #525252
Neutral 500/400/300/200/100/50   #737373 #A3A3A3 #D4D4D4 #E5E5E5 #F5F5F5 #FAFAFA
Accent options  Sky Blue #00A4FA · Light Teal #0AFED3 · Neon Grass #0AFA14 ·
                Young Grass #C4FE0A · Persimmon #FF6400 · Iris Flower #FF51FF
```

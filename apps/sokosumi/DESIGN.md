# Sokosumi — Design System

Ported directly from the real Sokosumi product (`~/sokosumi/apps/web`, its own `DESIGN.md` +
`src/components/agents/{coworker-gallery-section,offer-card}.tsx`) — this landing page is the
front door to that product, so it should look and behave like the same app, not a different
skin. This supersedes the earlier masumi.network-derived version.

No component library here (the product uses shadcn/ui + Tailwind v4; this static page hand-rolls
the same tokens in plain CSS). Inter, sentence case, purple-on-neutral-gray, hairline borders,
soft glow — never heavy drop shadows, never ALL CAPS.

## Color

| Token | Value | Use |
|---|---|---|
| `--background` | `#F5F5F5` | Page background — soft grey; white cards lift off it (changed 2026-08-26) |
| `--card` | `#FAFAFA` | Cards, panels — elevated surfaces are *lighter*, not heavier |
| `--muted` | `#F5F5F5` | Muted fills, skeletons, secondary chips |
| `--foreground` | `#0A0A0A` | Text, icons |
| `--muted-foreground` | `rgba(10,10,10,.5)` | Secondary text, captions |
| `--border` | `#E6E6E6` | Hairline borders (often at 60% opacity) |
| `--primary` | `#2B5C78` | Steel blue — the one accent role: active states, links, focus rings (was Wisteria Purple until 2026-08-26). `--stage` / `--stage-deep` are the dark-to-light gradients used for product stages, CTA bands and every ink surface incl. primary buttons |
| `--primary-foreground` | `#FAFAFA` | Text on primary |
| `--chart-1` | `#00A4FA` | kodosumi Sky Blue — category accent |
| `--chart-2` | `#FA008C` | masumi Electric Pink — category accent |
| `--chart-3` | `#0AFA14` | kodosumi Neon Grass — category accent |
| `--chart-4` | `#FFD300` | masumi Golden Yellow — category accent |
| `--chart-5` | `#FF6400` | masumi Persimmon — category accent |

Category accents are the **only** chromatic color beyond purple, and only where they communicate
(a task's category). Never let them carry small text — text/icons on a tint stay neutral.

## Typography

**Inter**, all weights. Hierarchy comes from **size + weight together**:

- **Light (300)** — headlines only: hero `text-2xl md:text-3xl font-light`, section headings
  `text-xl md:text-2xl font-light`. Airy, sophisticated, never bold.
- **Regular (400)** — body copy and UI, base 14px.
- **Medium (500) / Semibold (600)** — labels, subheadings, card titles, buttons.
- **Sentence case always** — never all-caps, never Title Case. Left or centered alignment only.

## Shapes & elevation

- Radius scale off a 10px base: `sm 6 · md 8 · lg 10 · xl 14 · 2xl 16 · full 9999px`. Buttons/
  inputs `md`; general cards `xl`; task/offer cards and the hero `2xl`; pills/avatars/search `full`.
- **Borders first, then soft glow** — never dramatic drop shadows. Hairline `border-border`
  (often `/60`), `shadow-sm → shadow-md` on hover at most.
- **Segmented lines**: a full-bleed `border-t border-border/60` (breaking out of the section's own
  padding) is the standard section/group separator — used exactly like a physical divider between
  company groups.

## Components

- **Button** — `rounded-md`, heights `sm 32 · default 36 · lg 40`, `primary` (bg `--primary`) for
  the one key action per view; `outline` (bordered, transparent) and `ghost` (text-only) for
  everything else.
- **Chip/badge** — `rounded-md`, `padding: 2px 8px`, `text-xs font-medium`, background `--muted`
  (neutral) or a category color at 15% tint with matching solid-color icon/text.
- **Avatar** — always circular, `ring-1 ring-border`, square source art shown whole via
  `object-cover` (never cropped to lose the subject).
- **Coworker "company dashboard"** (the core pattern — see `coworker-gallery-section.tsx`): a
  master–detail block per company. Header = company name + coworker count + optional website
  link, then a full-bleed rule. Below: a **rail** (vertical list on desktop, horizontal scroll on
  mobile) of coworker avatar+name+one-line caption; clicking one updates the **detail** pane on
  the right — big avatar, name, caption, a "Start a task for {name}" primary button, description,
  then that coworker's "Ready-to-run offers" as a 2–3 column grid (capped at 3, "Show all" to
  expand). A closing full-bleed rule ends the block.
- **Task/offer card** (see `offer-card.tsx`): `rounded-2xl border`, hover `border-primary +
  shadow-sm`. A 16:10 **content-aware mock preview** on top — a decorative, non-fake skeleton
  shaped like the actual output (chart bars for research, a checklist for planning, code lines
  for engineering, a slide thumbnail for presentations, document lines otherwise), tinted with
  that task's **category color**. A category chip (icon + name, tinted) sits top-left over the
  mock; an output-type chip (icon + "PDF"/"Slides"/etc., white/blurred) sits bottom-right. Below
  the mock: title, 2-line-clamped description, then a footer row of the coworker's avatar + name
  with an arrow-up-right icon pushed to the far right.

## Motion

Minimal — `transition-colors`/`border-color`/`shadow` at ~150–200ms `ease-out`. No layout
animation. The one exception on this landing page is the hero background video (unique to the
marketing site; the product itself has no video).

## Voice

Sentence case headings and CTAs, verb-first ("Start a task", "Sign up") — never Title Case or
all-caps.

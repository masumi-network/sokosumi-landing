# Use-case imagery

How the images in `assets/use-case-img/` are made, so the next one matches.

## The style: line collage

A black-and-white photograph of real people at work, with hand-drawn wisteria
purple ink on top — doodles, arrows, chart scribbles, soft purple washes.
Chosen 2026-08-21 from a five-style comparison (editorial photo, flat
illustration, 3D clay, duotone, line collage). It reads as Sokosumi at a
glance and cannot be mistaken for a stock photo.

Rules that keep the set coherent:

- The photo layer is monochrome. All color is the purple ink.
- One clear human subject doing the workflow the page is about.
- Landscape 1152x640 (the site crops to 600x240 cards, split heroes, and
  small nav swatches — keep the subject off-center so crops survive).
- No real text. The model writes gibberish if a scene invites text, so ask
  for blank documents and abstract scribbles (see prompt below).

## Model and endpoint

- Model: `fal-ai/flux/dev` (FLUX.1 dev) on fal.ai
- Endpoint: `POST https://fal.run/fal-ai/flux/dev` with `Authorization: Key <FAL_KEY>`
- The key lives in `~/.claude/skills/fal-ai/SKILL.md` on Patrick's machine —
  never commit it.

Request body that produced the current set:

```json
{
  "prompt": "<see template below>",
  "image_size": { "width": 1152, "height": 640 },
  "num_inference_steps": 28,
  "guidance_scale": 3.5,
  "num_images": 1,
  "enable_safety_checker": true,
  "seed": 77
}
```

Fix the seed per image so a re-run is reproducible; vary it to explore.

## Prompt template

```
mixed media collage: black-and-white photograph of {SCENE} combined with
hand-drawn wisteria purple line doodles, arrows and abstract chart scribbles
drawn over the photo, paper texture, editorial magazine collage, strictly
monochrome photo with purple ink only, no text, no letters, no words,
no writing, blank documents
```

`{SCENE}` is one sentence describing a person doing the workflow, e.g.
"a marketer with headphones reviewing social media feeds and sentiment
charts on a laptop". Scenes with screens or pinboards tempt the model into
writing gibberish — describe the surfaces as "abstract" or "blank" and it
draws shapes instead.

Scenes used for the current eight (seed in parentheses):

| Slug | Scene | Seed |
|---|---|---|
| always-on-social-listening | marketer with headphones reviewing social feeds and sentiment charts on a laptop | 77 |
| audience-research-sprint | strategist pinning audience persona cards and survey printouts to a research wall | 11 |
| competitor-monitoring | analyst studying two monitors showing abstract blurred website layouts, taking notes | 41 |
| seo-and-ai-visibility | marketer pointing at a screen with an abstract search rankings dashboard of bars and lines | 43 |
| agency-new-business-research | agency team around a table preparing a pitch, dossiers and printouts spread out | 14 |
| launch-content-engine | content team before a big blank wall calendar grid with pinned blank cards | 42 |
| seasonal-campaign-planning | two marketers arranging a seasonal campaign moodboard with photos and sticky notes | 16 |
| market-intelligence-briefings | executive reading a printed market briefing with charts, coffee on the desk | 17 |

## From JPEG to the repo

1. Generate at 1152x640; download the JPEG the endpoint returns.
2. Convert to webp (Pillow: `Image.open(f).convert("RGB").save(out, "WEBP", quality=82, method=6)`)
   — targets 40-90 KB per image.
3. Save as `assets/use-case-img/<use-case-slug>.webp`. Nothing else to wire:
   cards, split heroes, and the nav swatches all resolve the image from the
   slug (`UC_PHOTOS` in `templates/useCases.js`, `UC_NAV_PHOTOS` in
   `templates/shell.js`). Adding a NEW use case means adding its slug to
   those two sets.

## Judging a candidate

Reject an image when: colored objects survive in the photo layer (the style
is mono + purple), gibberish text is legible at card size, the subject sits
dead-center (crops badly), or the ink layer is so dense the photo disappears.
Two or three seeds are usually enough to get a keeper.

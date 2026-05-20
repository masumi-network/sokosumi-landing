---
title: "DESIGN.md: The Style Guide Your AI Agents Actually Read"
description: "Brand guidelines were written for humans. AI coding agents need something they can parse. DESIGN.md is the answer — and we built a free tool that generates one from any URL."
date: "2026-05-20"
author: "Masumi Team"
---

Every team that ships software with AI hits the same wall. The agent writes code that works, but it does not look like the brand. Buttons are slightly the wrong shade. Headings use the wrong font weight. Padding drifts session by session. The output is correct but unmistakably generic.

The fix has always been the same: paste the brand guide into the prompt, again and again, in every new conversation. PDFs do not help. Figma links do not help. Even a well-written `README.md` rarely covers the visual layer in enough detail.

DESIGN.md fixes this. And today we are releasing a free tool that generates one for any website in about thirty seconds.

[**Try the DESIGN.md Generator →**](/tools/design-md)

## What DESIGN.md Actually Is

DESIGN.md is an open spec from [Google Labs](https://github.com/google-labs-code/design.md). It captures a brand's visual identity in a single, machine-readable Markdown file. The structure is simple: YAML design tokens for the parts a machine needs to be exact about (colors, typography, spacing, components, shapes), with human-readable rationale for the parts that need interpretation.

The canonical file has eight sections, in this order:

1. **Overview** — what the brand feels like, in one paragraph
2. **Colors** — primary, secondary, neutral, surface
3. **Typography** — font families, sizes, weights, line heights for every role
4. **Layout** — container widths, grid, breakpoints
5. **Elevation & Depth** — shadows, blurs, the rules for stacking
6. **Shapes** — corner radii, geometric language
7. **Components** — buttons, cards, inputs as token references
8. **Do's and Don'ts** — the guardrails

Token references work the way you would expect: `{colors.primary}` inside a component definition resolves to the value at the top of the file. Change one variable, the whole system follows.

That last sentence is the entire point.

## Why a Markdown File Beats Every Other Format

Designers have been writing brand guidelines for decades. Notion pages, Figma libraries, hundred-page PDFs. They all work for humans. None of them work for agents.

An AI coding agent picks up a project, scans for context, and starts writing. What it reads is whatever sits in your repo. If your brand guide is a Figma file, the agent ignores it. If it is a PDF, the agent might extract some text but loses the structure. If it is a Notion doc, you are pasting the URL into every prompt.

A DESIGN.md sitting at the root of your repo gets read on the first turn of every session, by every agent that can read Markdown. That is Claude Code, Cursor, GitHub Copilot, Aider, Continue, and anything else that walks your file tree. No plugins, no MCP server, no configuration. Just a file.

The agent now has structured tokens. It can write `bg-[#FA008C]` because it read that `colors.primary` is `#FA008C`. It can write `rounded-[12px]` because it read your radius scale. It can build a button component because you defined what `button-primary` is. The brand-drift problem disappears.

## The Generator We Built

Writing DESIGN.md by hand is not hard, but it is tedious. You have to inspect your own site, read your CSS variables, list your font families, sample your shadow values, and translate everything into the spec format. For an existing brand, this is busywork.

So we built a tool that does it for you. Paste a URL, get a DESIGN.md.

Here is what happens between the paste and the download:

**Step 1 — Fetch.** We open the page in a headless browser, wait for fonts and stylesheets to settle, and take a screenshot. The screenshot is real, full-page, rendered.

**Step 2 — Extract signal.** We pull every signal a machine can read: CSS custom properties, computed styles on hero elements, every Google Font in the stylesheet, every Tailwind utility class in the DOM, the favicon, the logo candidates, the dominant colors in the screenshot.

**Step 3 — Reason.** All of that goes to an LLM with a prompt built around the official spec. The model is not guessing. It is choosing — from the actual values it just saw — which ones represent the brand and which ones are noise. It produces a DESIGN.md in canonical eight-section order, with token references wired up.

**Step 4 — Edit.** The result loads in a live editor. Tweak any color, change a font, adjust a radius — the preview updates instantly. When it looks right, download the file or copy it to your clipboard.

The whole flow takes roughly thirty seconds for sites we have already analyzed (we cache by URL), and about a minute for fresh ones.

## What Makes the Output Useful

We learned a few things while building this that did not show up in the spec.

**Brand-distinctiveness matters.** An early version of the prompt produced files that were technically correct but boring. Every site got "modern, clean, minimalist" in its Overview. We rewrote the prompt to force the model to articulate what makes _this_ brand different from a generic SaaS landing page. The Overview is now the section users edit the least, which tells us the model is getting closer to the real thing.

**Components are where the value compounds.** Colors and fonts are easy to copy from a screenshot. Components are not. A `button-primary` that references `{colors.primary}`, `{rounded.md}`, and the right padding scale is the unit of work an agent actually performs when building a UI. We spend more model tokens on the component section than on anything else.

**The unknown-content rule is your friend.** The official spec allows extensions under "unknown content." We use this for `layout`, `elevation`, and `logo` — fields that are not in the canonical eight sections but that every agent we tested with picks up correctly. Following the spec strictly where it matters, extending it pragmatically where it helps.

## Drop It at the Root

The intended workflow is one line:

```
mv ~/Downloads/DESIGN.md ./DESIGN.md
```

That is the deployment. Next time you open Claude Code or Cursor in this project, the agent reads the file as part of its initial context. From that point on, every UI it generates is on-brand without you reminding it.

If you want to go further, reference it explicitly in your `CLAUDE.md` or `.cursorrules`:

```
Visual style for this project is defined in DESIGN.md.
Use the design tokens exactly. Reference components by name.
```

That is the entire integration.

## Why This Lives on Masumi

Masumi is the payment network for AI agents. The thing we are building toward — agents discovering each other, delegating tasks, settling payments autonomously — only works if the agents involved produce work that holds together. A coding agent that ships off-brand UI every session is not a coworker yet. It is a tool with bad memory.

Standards like DESIGN.md are what turn agents into collaborators. They give an agent a consistent reference, the same way a new hire gets a brand book on their first day. The closer agents get to the bar we set for humans, the closer we get to the agent economy this protocol exists to enable.

The generator is free, no signup, no credits. If it saves your team an hour and your agents stop drifting, we are happy.

[**Generate your DESIGN.md →**](/tools/design-md)

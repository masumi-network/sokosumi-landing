---
name: create-design-md
description: Create a DESIGN.md for a website. Use when the user shares a URL and asks for its design system, brand colors, fonts, design tokens, style guide or a DESIGN.md file.
---

# Create a DESIGN.md

A DESIGN.md is a markdown file that describes a site's visual design: YAML frontmatter with tokens (colors, typography, spacing, radii, components), then prose sections on layout, imagery and tone. Coding agents read it to build UI that matches the brand.

## Steps

1. **Get the URL.** If the user named a brand but no URL, call `search_design_md_library` with the brand name first. If it returns a match, call `get_design_md` with its slug and skip to step 4.
2. **Generate.** Call `generate_design_md` with the full URL (e.g. `https://linear.app`). Recently analysed sites come back at once.
3. **Wait if needed.** If the result has `status: "running"` or `"queued"`, tell the user the site is being analysed (it takes up to a minute), then call `get_design_md_job` with the `jobId`. Repeat every ~10 seconds, at most 8 times.
4. **Present it.**
   - Summarise in 3–5 lines: primary and accent colors with hex codes, the font families, and one sentence on the overall style.
   - Give the full DESIGN.md in a single fenced ```markdown block so the user can copy it, or offer it as a downloadable `DESIGN.md` file.
   - Include the `pageUrl` from the result: that's where they can view and edit it on the web.

## If it fails

- Sites behind a login, a cookie wall or bot protection often can't be rendered. Say so plainly and suggest the public marketing page instead (e.g. the homepage rather than an app URL).
- If the generator is busy, offer the closest library entry from `search_design_md_library`.

## Don't

- Don't invent tokens or hex codes the tool didn't return.
- Don't shorten or rewrite the DESIGN.md itself; summarise around it.

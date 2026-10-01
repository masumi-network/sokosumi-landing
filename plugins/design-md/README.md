# DESIGN.md Generator: ChatGPT plugin

Packages the sokosumi.com DESIGN.md generator (`/tools/design-md`) as a ChatGPT / Codex plugin.

- `plugin.json`: manifest (Agent Plugins format)
- `mcp.json`: points at `https://www.sokosumi.com/mcp`, served by `apps/sokosumi/lib/designMdMcp.js`
- `skills/`: `create-design-md` (URL → DESIGN.md) and `build-with-design-md` (DESIGN.md → on-brand UI)
- `assets/`: icons, logos, screenshot

## MCP tools

| Tool | What it does | Annotations |
|---|---|---|
| `generate_design_md(url)` | Starts a generation via masumi `/api/v1/design-md`, waits up to 40 s, else returns a `jobId` | write (saves to the public gallery), open-world |
| `get_design_md_job(jobId)` | Polls a running job | read-only |
| `search_design_md_library(query)` | Searches ~1,500 saved analyses by brand or domain | read-only |
| `get_design_md(site)` | Full DESIGN.md for a library slug or hostname | read-only |

No auth: everything it returns is public. New generations share one hourly ceiling (`MCP_DESIGN_MD_RATE_LIMIT`, default 60) because ChatGPT calls from OpenAI's servers, not from users' IPs. Unlike the web tool, there is no email gate; each result links back to sokosumi.com with `utm_source=chatgpt`.

## Test locally

1. Add this plugin to `.agents/plugins/marketplace.json` at the repo root (gitignored, so it stays local; source path `./plugins/design-md`).
2. Restart the ChatGPT desktop app, open the Plugins directory and install "DESIGN.md Generator" from "Sokosumi (local)".
3. Or call the server directly:
   ```sh
   curl -s https://www.sokosumi.com/mcp -H 'Content-Type: application/json' \
     -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_design_md_library","arguments":{"query":"stripe"}}}'
   ```

## Submit

```sh
cd plugins/design-md && zip -r ../design-md.zip . -x README.md
```

Draft lives at https://platform.openai.com/plugins (org utxo AG), uploaded 2026-10-01. Done there: metadata and skill checks pass, domain verified (`OPENAI_APPS_CHALLENGE` on Vercel production serves `/.well-known/openai-apps-challenge`), MCP scanned with no issues, test cases and release notes saved.

Open before "Submit for review":
- Walkthrough video URL (review information, step 4).
- Developer identity: only "Individual: Patrick Tobler" is offered. Verify utxo AG as a business in the OpenAI org settings first so the publisher matches the sokosumi.com legal pages.
- To change the package: rebuild the ZIP and use "Upload plugin to make changes" on the draft.

Uploaded plugin archives run only in the ChatGPT desktop app. On the web, the MCP server alone was tested as a personal "Create MCP App" (Pro account), both the cached path (linear.app) and a fresh generation (oatly.com, ~80 s with polling).

### Review test cases

Positive:
1. "Make a DESIGN.md for https://linear.app": `generate_design_md` → returns the cached DESIGN.md at once, with colors, fonts and the sokosumi.com link.
2. "Is there a DESIGN.md for Stripe?": `search_design_md_library` → lists stripe.com with its page URL.
3. "Give me Notion's design system": `search_design_md_library` then `get_design_md` → full DESIGN.md for notion.so.
4. "Build a pricing card in Apple's style": `search_design_md_library`, `get_design_md`, then HTML/CSS using Apple's tokens as CSS variables.
5. "Create a DESIGN.md for https://www.patagonia.com" (uncached or `force`): `generate_design_md` returns `running`, then `get_design_md_job` until done.

Negative:
1. "Make a DESIGN.md for http://localhost:3000": refuses, not a public URL.
2. "Get the DESIGN.md for my company's internal dashboard at https://app.example.com behind SSO": explains login-walled pages can't be rendered and suggests the public site.
3. "Write me a poem about the ocean": plugin not used.

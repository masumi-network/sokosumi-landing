# Brief: tool-vs-tool comparison pages (third-party style)

Goal: pages like `/compare/langdock-vs-chatgpt` that a marketing or knowledge-work
buyer finds useful when choosing between two tools we do NOT sell — and that end
with an honest, clearly separated note that Sokosumi is a third option when what
they want is finished marketing work, not a chat window or a builder.

These pages only work if they are genuinely accurate and genuinely useful.
No slop. If you are not sure of a fact, say "not published" or leave it out.

## Research rules
- Primary sources only: the vendor's own site (pricing page, docs, help centre,
  changelog, security/trust page), press releases, official blog. Third-party
  price trackers only when the vendor page blocks fetching — then mark the cell
  "(third-party, verify)".
- Check the CURRENT pricing page and note the date you checked.
- For each tool answer: what it is in one sentence; who it is really for; what
  you get out (chat, files, automations, code…); pricing tiers with numbers;
  free plan/trial; EU data residency / hosting; team features; standout
  strengths (2–3); real limitations (2–3, specific, sourced from docs or
  reviews, not invented).
- Baseline facts for many tools already exist in
  `docs/research/sokosumi-competitors-2026-08.md` (repo root). Start there,
  then verify against the live vendor pages.

## Writing rules (Obvious Adams)
- Lead with the point. Plain words. One idea per sentence. Specific over vague.
- Two-syllable words where possible. No "leverage", "seamless", "empower",
  "unlock", "elevate", "streamline", "robust", "cutting-edge", "game-changing".
- Fair to both tools. Say who should pick which. Name limitations of both.
- Do not praise Sokosumi inside the neutral sections. Sokosumi appears only in
  the `bridge` (clearly labelled) and one FAQ item at most.
- Length: the whole page should read in ~4 minutes. Roughly 700–1,000 words.

## Sokosumi facts you may use in the bridge (do not invent others)
Marketplace of named AI coworkers and specialist agents for marketing teams.
Each coworker has a role, a public profile, sample work, a named vendor with
stated models and hosting. You brief in plain language or @mention in a
channel; the task shows on a shared board; it ends with a finished file
(PDF report, deck, spreadsheet, live dashboard). Scheduled tasks. Credits only
when a task runs. Free: 250 credits per seat per month, no card. Paid seats
€25 / €75 / €200 per month; Enterprise custom. EU hosting available, stated per
coworker. Built by Serviceplan Group with NMKR, Munich. Live numbers: 52
coworkers and agents from 7 vendors, 5,300+ tasks run.

## Output: one JSON file per pair at `content/compare-pairs/<slug>.json`

Slug = `<a>-vs-<b>` using these tool keys (they map to logos):
chatgpt, claude, claude-code, copilot (Microsoft 365 Copilot), gemini (Google
Gemini), langdock, whaaat (Whaaat AI), viktor, dust, jasper, lindy, manus,
relevance (Relevance AI), perplexity, hubspot (HubSpot Breeze), sintra,
genspark, coworker-ai, agentforce (Salesforce Agentforce), deepl (DeepL Agent),
notion (Notion AI), canva (Canva AI), adobe (Adobe GenStudio), writer, copy-ai,
typeface, beam (Beam AI), motion, paradigm, cursor, github-copilot, zapier
(Zapier Agents), n8n, the-need (The NEED), nele (nele.ai), codex (OpenAI
Codex — uses the chatgpt logo key).

Schema (English only; German is produced later):

```json
{
  "slug": "langdock-vs-chatgpt",
  "a": { "key": "langdock", "name": "Langdock", "url": "https://www.langdock.com" },
  "b": { "key": "chatgpt", "name": "ChatGPT Team", "url": "https://chatgpt.com" },
  "checked": "2026-08-26",
  "en": {
    "title": "Langdock or ChatGPT Team: which one for a German company?",
    "metaTitle": "Langdock vs ChatGPT Team (2026): prices, EU hosting, who it fits",
    "description": "One-paragraph meta description, 140–155 chars, plain.",
    "intro": "Two or three sentences. What each is, and the one difference that decides it.",
    "glance": [
      ["Who it is for", "…", "…"],
      ["What you get", "…", "…"],
      ["Price per user", "…", "…"],
      ["Free plan or trial", "…", "…"],
      ["EU hosting", "…", "…"],
      ["Team features", "…", "…"],
      ["Build your own agents", "…", "…"]
    ],
    "pickA": { "heading": "Pick Langdock if…", "points": ["…", "…", "…"] },
    "pickB": { "heading": "Pick ChatGPT Team if…", "points": ["…", "…", "…"] },
    "limits": { "a": ["…", "…"], "b": ["…", "…"] },
    "verdict": "Two or three sentences. Honest. Who wins for whom.",
    "bridge": {
      "heading": "If you want the work done, not a chat window",
      "text": "Three or four sentences: both tools above give a person a place to prompt. If the team's real need is a competitor report, a campaign plan or the Monday performance PDF, that is a different product: a coworker you brief, a board the team sees, a file at the end.",
      "points": ["…", "…", "…"],
      "links": ["/compare/sokosumi-vs-langdock", "/compare/sokosumi-vs-chatgpt"]
    },
    "faq": [
      ["…?", "…"], ["…?", "…"], ["…?", "…"], ["…?", "…"]
    ]
  },
  "sources": ["https://…", "https://…"]
}
```

Rules for the JSON: valid JSON (no trailing commas, escape quotes), 6–8 glance
rows, 3 points per pick, 2 limits per tool, 4 FAQ items, `sources` with every
URL you relied on, `checked` = today's date. `bridge.links` must point at
existing pages `/compare/sokosumi-vs-<key>` for both tools where such a page
exists (all keys above except codex→`sokosumi-vs-openai-codex`,
copilot→`sokosumi-vs-microsoft-365-copilot`, gemini→`sokosumi-vs-google-gemini`,
whaaat→`sokosumi-vs-whaaat-ai`, relevance→`sokosumi-vs-relevance-ai`,
hubspot→`sokosumi-vs-hubspot-breeze`, agentforce→`sokosumi-vs-salesforce-agentforce`,
deepl→`sokosumi-vs-deepl-agent`, notion→`sokosumi-vs-notion-ai`,
canva→`sokosumi-vs-canva-ai`, adobe→`sokosumi-vs-adobe-genstudio`,
beam→`sokosumi-vs-beam-ai`, zapier→`sokosumi-vs-zapier-agents`,
nele→`sokosumi-vs-nele-ai`, coworker-ai→`sokosumi-vs-coworker-ai`).

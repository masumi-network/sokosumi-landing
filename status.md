# Status

Last updated: 2026-10-05
Owner: implementer

## Completed

VERIFIED: Added `/token2049`, `/token2049/setup`, and the public `agent-guide.md`.
The setup helper accepts Coworker and Vendor IDs. It formats participant commands and coding-agent instructions.
Verification evidence is in `docs/token2049-guide-evidence.md`.

## Planned

REPORTED: The user deferred website OAuth: "the oauth will be decided later on".
INFERRED: Automatic provisioning and browser key delivery require a separate follow-up decision and live rehearsal.
Publishing remains pending. This local build does not attest a deployed route or a new seller receipt.

## Ownership

REPORTED: The guide writer prepared the first page draft. The implementer owns the final page, helper, and tests.
The reviewer owns a read-only check of the CLI instructions and permission boundaries.

REPORTED: Two final read-only reviews returned "No new actionable findings" and "Clean pass".
VERIFIED: Final production build exited `0`. Targeted ESLint exited `0`. Tests returned `tests 3`, `pass 3`, `fail 0`.
VERIFIED: The final production preview is available locally at `http://localhost:3016/token2049`.

## 2026-10-05 page iteration

- In Progress, owner implementer: agent handoff, command copy controls, readable agent guide, and a SKILL.md download. Scope: apps/masumi/src/app/token2049 and scripts/test-token2049.mjs.
- VERIFIED: `node --test apps/masumi/scripts/test-token2049.mjs` returned `tests 5`, `pass 5`, `fail 0`. This covers command validation and guide formatting, not participant execution.
- VERIFIED: first targeted ESLint found a new internal HTML link. It now uses Next.js Link. Recheck exited 0. No SPEC.md exists; no specification was created.
- Planned, owner reviewer: independent review of this iteration.

## 2026-10-05 iteration verification

- VERIFIED: final production build exited `0` and printed `Compiled successfully in 8.0s`. Static routes include `/token2049/agent` and `/token2049/skill/SKILL.md`.
- VERIFIED: targeted ESLint exited `0`. Existing Browserslist age warning remains outside this change.
- VERIFIED: `node --test apps/masumi/scripts/test-token2049.mjs` returned `tests 5`, `pass 5`, `fail 0`.
- VERIFIED: disabling only the new formatter source returned exit `1`, `tests 5`, `pass 3`, `fail 2`. Restoring source returned `pass 5`, `fail 0`.
- VERIFIED: the served skill passed `quick_validate.py` with `Skill is valid!`. This checks package format, not agent decisions.
- VERIFIED: Brave showed `Copy agent instructions copied.`. Pasting into the local setup field started with `# TOKEN2049 agent setup instructions` and included the full guide. The field was cleared afterward. The session clipboard API did not reflect the browser clipboard; native paste supplied this evidence.
- VERIFIED: the main page measured `pageWidth: 390, viewport: 390` at the mobile breakpoint.
- CORRECTION: the first agent-page mobile check measured `pageWidth: 730, viewport: 390`. Its grid child kept the code block width. Adding `min-w-0` fixed the measured overflow. Final rebuilt agent page measured `pageWidth: 390, viewport: 390`. The desktop viewport was restored.
- VERIFIED: prose detector scored the agent page and Markdown guide `0`, `Clean`. The main page scored `1` for repeated domain vocabulary only.
- REPORTED: independent reviewer returned `Clean final source review. No actionable findings.` after the mobile correction. The reviewer did not repeat browser checks.
- VERIFIED: screenshot saved to `/Users/sandro/.codex/visualizations/2026/10/03/01a1017a-56ae-7600-98a2-c29d8471d03b/token2049-iteration.png`.
- Completed, owner implementer: visible agent handoff, per-command copy, readable agent subpage, Markdown download, and generated SKILL.md download. Skill packaging stays in the existing website repository; no separate repository was created.
- Planned, owner release: publication after user authorization. Website OAuth and automatic provisioning remain deferred. No push or deployment occurred in this iteration.

## 2026-10-05 participant copy revision

- REPORTED request: "really improve the texts too".
- VERIFIED source: revised prose in `page.tsx`, `agent/page.tsx`, `setup/page.tsx`, `setup-helper.tsx`, `flow.ts`, and `public/token2049/agent-guide.md`. The participant guide now defines Vendor, Workspace, Coworker, and worker. It identifies the organizer provisioning step and separates execution-only rehearsal from the paid flow.
- VERIFIED: CLI command strings and payment defaults remain unchanged. The generated agent prompt now lists the paid flow in numbered order.
- VERIFIED: final build exited `0` with `Compiled successfully in 8.6s`. Targeted ESLint exited `0` after escaping JSX apostrophes.
- VERIFIED: focused tests returned `tests 5`, `pass 5`, `fail 0`. These tests do not attest a live participant deployment or seller collection.
- VERIFIED: writing detector scored the agent page, setup page, and setup helper `0`, `Clean`. The main page and Markdown guide each scored `1` for repeated domain vocabulary only. Domain names were kept consistent rather than replaced with synonyms.
- REPORTED: independent copy review returned `Clean copy review. No actionable findings.` It checked actor clarity, permissions, payment order, and completion claims.
- VERIFIED: refreshed Brave preview shows `Build an agent that gets paid.`, `Set up with your coding agent.`, and the four participant steps. Screenshot: `/Users/sandro/.codex/visualizations/2026/10/03/01a1017a-56ae-7600-98a2-c29d8471d03b/token2049-copy.png`.
- Completed, owner implementer: participant copy revision. Planned, owner release: publication after user authorization. No push or deployment occurred.

## 2026-10-05 Better Layout revision

- REPORTED request: the top layout "looks strange" and is excessive. The user invoked `better-layout`.
- Completed, owner implementer. Scope: `apps/masumi/src/app/token2049/page.tsx` only, plus this verification record.
- VERIFIED source: hero uses one column and contains no forced line breaks. The agent handoff is a compact section with grouped copy/read controls. Downloads remain on the agent page. Repeated four-step summaries were removed; full instructions and section navigation remain. Step padding uses logical `ps` instead of `pl`.
- VERIFIED: final production build exited `0`, `Compiled successfully in 8.6s`. Targeted ESLint exited `0` with the existing Browserslist age warning.
- VERIFIED: browser measurements returned equal pageWidth and viewport at `320`, `390`, `600`, `820`, `960`, `1280`, and `2056`. Copy/read controls remained inside the viewport and wrapped at narrow widths. This measures overflow, not translated copy or every intermediate width.
- VERIFIED: final main heading contains `headingBreaks: 0`. Final scroll position is `scrollY: 0`. Temporary viewport overrides were reset.
- NOT VERIFIED: 200% browser zoom. Native zoom shortcuts did not change measured CSS width or device pixel ratio. A reset shortcut was sent afterward. No zoom success was inferred.
- NOT VERIFIED: runtime RTL mirror and translated/pseudo-localized text. Logical step padding was inspected in source. The page remains English.
- REPORTED: independent source review returned `Clean source review. No actionable findings in this layout change.` It did not perform browser checks.
- VERIFIED: final screenshot saved to `/Users/sandro/.codex/visualizations/2026/10/03/01a1017a-56ae-7600-98a2-c29d8471d03b/token2049-layout.png`.
- Planned, owner release: publication after user authorization. OAuth, provisioning, command behavior, and payment instructions were not changed in this revision. No push or deployment occurred.

## 2026-10-05 whitespace pass

- Completed, owner implementer: increased hero spacing, section gaps, agent-section padding, and spacing within detailed setup steps. Source: `apps/masumi/src/app/token2049/page.tsx`.
- VERIFIED: production build exited `0` with `Compiled successfully in 8.5s`. Targeted ESLint exited `0`.
- VERIFIED: refreshed Brave preview shows the larger section gaps. At the mobile breakpoint, `pageWidth: 390, viewport: 390`. The viewport override was reset.
- VERIFIED: screenshot saved to `/Users/sandro/.codex/visualizations/2026/10/03/01a1017a-56ae-7600-98a2-c29d8471d03b/token2049-whitespace.png`.
- VERIFIED source: no text, command, OAuth, or payment logic changed. No push or deployment occurred. Publication remains Planned.


## 2026-10-05 participant audience audit

- REPORTED request: "this is only for participants, tasks for me are added to linear".
- VERIFIED source: removed the organizer section and deadline timezone confirmation from `apps/masumi/src/app/token2049/page.tsx`. Removed internal source-verification records, deferred-feature notes, and internal evidence-label requirements from `public/token2049/agent-guide.md`. Updated participant wording in `flow.ts` and setup metadata. Participant Coworker handoff and payment instructions remain.
- VERIFIED: production build exited `0`, `Compiled successfully in 8.0s`. Targeted ESLint exited `0`. Existing middleware and Browserslist warnings remain.
- VERIFIED: focused tests printed `tests 5`, `pass 5`, `fail 0`. These tests do not prove a live paid participant Task.
- VERIFIED: all five local routes returned HTTP `200`: `/token2049`, `/token2049/setup`, `/token2049/agent`, `/token2049/agent-guide.md`, `/token2049/skill/SKILL.md`. Markdown response equals its source; skill response contains the same guide. Removed internal phrases are absent from all five responses. This checks named phrases, not audience intent by itself.
- REPORTED: independent full audience review returned "Clean audience review. No actionable findings." It checked source copy for participants and their coding agents.
- VERIFIED: refreshed Brave DOM shows the participant steps and `Submit on BuilderBase by 7 October, 23:59.` without organizer notes. Screenshot saved to `/Users/sandro/.codex/visualizations/2026/10/03/01a1017a-56ae-7600-98a2-c29d8471d03b/token2049-participant.png`.
- VERIFIED: Linear updates succeeded for SOK-1261 (confirm event facts and timezone), SOK-1266 (organizer rehearsal), and SOK-1283 (participant-only publication). All three are assigned to Sandro Schaier. Existing issue states and descriptions were preserved.
- VERIFIED: no push or deployment occurred. Local preview serves the rebuilt guide. Publication and event fact confirmation remain follow-ups in Linear.


## 2026-10-05 user-story and clarity review

REPORTED request: "really review every text section individually. only keep text that connects to a user story" and "ensure the text is clear".

VERIFIED source review scope: all TOKEN2049 sections, setup helper labels and errors, copied prompt, Markdown sections, skill export, command labels, and copy feedback. Shared site chrome remains outside this scoped change.

| Section | Participant need | Review action |
| --- | --- | --- |
| Hero and join link | Understand what to build and how to join | State the build, Task, and submission goal directly |
| Coding-agent handoff | Delegate setup to a coding agent | Explain what pasting does; name the read link's destination |
| Summary facts | None beyond later instructions | Remove repeated network, default quote, and proof labels |
| Coworker setup | Get identity and IDs for the agent | Keep account, Vendor, and organizer handoff instructions |
| Connection and execution | Authenticate the worker and test a Task | Explain login versus worker key through actions; tell readers where TASK_ID comes from |
| Payment | Implement a paid Task | Explain Dynamic as a per-Task quote; keep pricing values beside registration steps |
| Submission | Give judges results and seller payment evidence | Name the agent result and seller receipt explicitly |
| Setup helper | Generate commands for an existing Coworker | State the inputs, generated output, and key privacy requirement |
| Agent page | Read, copy, or load instructions as a skill | Remove detached audience/network eyebrow; explain each reuse path |
| Prompt, Markdown, skill, and copy controls | Execute and preserve the paid flow safely | Retain actionable technical instructions and recovery feedback |

VERIFIED: final build exited `0`: `✓ Compiled successfully in 8.1s`. Targeted ESLint exited `0`. Focused tests returned `tests 5`, `pass 5`, `fail 0`. No payment logic or command strings changed. These checks do not prove a new live paid Task.

REPORTED independent section review found one submission wording issue. It was corrected. Final review: "Clean final copy pass. ... No remaining actionable findings."

VERIFIED writing detector: agent page, setup page, and helper scored `0`, `Clean`. Main page scored `1` for repeated domain vocabulary. Domain names remain consistent. Extraction inspects literal JSX text, not every generated string.

VERIFIED Brave DOM: `detachedFacts: 0`. Revised participant copy is served locally. Screenshot: `/Users/sandro/.codex/visualizations/2026/10/03/01a1017a-56ae-7600-98a2-c29d8471d03b/token2049-clear-copy.png`.

VERIFIED: no push or deployment occurred. Existing Linear organizer follow-ups remain separate from visitor copy.


## 2026-10-05 overflow review and separate submission guide

REPORTED requests: check text overflow; add separate submission requirements and agent result-quality judging guidance.

VERIFIED browser: main, agent, and setup pages returned equal pageWidth and viewport at 320, 390, 600, 820, 960, and 1280 pixels. Headings, paragraphs, links, buttons, inputs, and list items had no viewport overflow. Hidden-overflow checks found no clipped text in inspected prose and controls. Generated setup at 320 pixels with two full UUIDs returned `pageWidth: 320`; its prompt wrapped, and terminal commands used contained horizontal scrolling. Measurements do not test translated content or browser zoom.

VERIFIED source: new `apps/masumi/src/app/token2049/submission/page.tsx` holds repository/demo/Task/payment evidence checklist, plus result quality, usefulness, reliability, and verified payment demo guidance. Main step 4 and Markdown instructions link to it. No official scoring weights were invented.

VERIFIED browser: submission page returned equal pageWidth and viewport at the same six widths, with `outside: []`. Viewport overrides were reset. Screenshot: `/Users/sandro/.codex/visualizations/2026/10/03/01a1017a-56ae-7600-98a2-c29d8471d03b/token2049-submission.png`.

VERIFIED: build exited `0`, `✓ Compiled successfully in 7.7s`. Targeted lint exited `0`. Tests printed `tests 5`, `pass 5`, `fail 0`. Submission prose detector returned `score: 0`, `label: Clean`. These checks do not attest live payment execution.

REPORTED independent review: "Clean review. No actionable findings." It checked copy, guidance versus official rules, evidence requirements, and source-level overflow risks. Browser checks were performed separately.

VERIFIED: SOK-1261 update succeeded with an organizer follow-up to confirm official judging rubric and partner requirements before publication. Retrieved issue descriptions and comments did not provide scoring weights. Their absence does not prove no official rubric exists elsewhere.

VERIFIED: no push or deployment occurred. Code, command, credential, and payment behavior remain unchanged.


## 2026-10-05 UI polish

REPORTED request: "ok now really polish the site".

VERIFIED source: added `guide-nav.tsx` for consistent navigation across all four pages, with one current-page link and visible focus. Standardized page padding, balanced headings, refined the agent handoff border and helper spacing, and allowed command headers to wrap. Code blocks retain contained scrolling. Main step headings now have their own scroll offset.

VERIFIED: final build exited `0`, `✓ Compiled successfully in 7.9s`. Targeted lint exited `0`; focused tests printed `tests 5`, `pass 5`, `fail 0`. Existing warnings remain outside the change.

REPORTED adversarial review: "Clean polish review. No actionable findings." Browser validation was separate.

VERIFIED Brave: all four pages returned equal pageWidth and viewport at 320, 390, 820, and 1280 pixels, with `outside: []` for inspected links, buttons, prose, and headings. Correct current-page labels were present. Viewport override was reset.

VERIFIED: pressing Tab from `Build your agent` focused `Get CLI commands`, with `outline: solid`. Copy action returned `Copy agent instructions copied.` Main step 4 anchor settled at `anchorTop: 168.7578125`, below `headerBottom: 110`. This checks these actions, not every keyboard or failure state.

VERIFIED: screenshot saved to `/Users/sandro/.codex/visualizations/2026/10/03/01a1017a-56ae-7600-98a2-c29d8471d03b/token2049-polished.png`.

VERIFIED: no push or deployment occurred. Shared site chrome, CLI commands, payment logic, and event criteria remain unchanged. Publication stays a separate follow-up.

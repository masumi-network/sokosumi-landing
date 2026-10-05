# TOKEN2049: Coworker setup and payment test

## Scope correction, 5 October 2026

REPORTED: The user deferred website OAuth: "the oauth will be decided later on".
REPORTED: The user requested the page and instructions regardless: "build the token2049 page with a flow and agent guide instructions".
The earlier hosted-service procedure below is deferred. It is not the current public setup flow.

VERIFIED source: The public page now documents CLI sign-in, organizer provisioning, and participant connection.
Evidence: `apps/masumi/src/app/token2049/page.tsx`, `"Website sign-in and automatic provisioning are not enabled."`
VERIFIED source: The setup helper takes IDs only. Evidence: `setup-helper.tsx`, `"It does not create records or check access."`
The helper does not check membership, call Core, accept keys, or implement payment. It formats commands and an agent prompt.

VERIFIED source: Vendor discovery returns membership roles. Evidence: Core `apps/core/src/routes/v1/vendors/me/get.ts:66`, `role: membership.role`.
The current participant connection path requires an administered Vendor. Evidence: CLI `apps/cli/src/cli/commands/coworkers.ts:407`, `requireAdministeredVendorForRegistration(vendors, vendorId)`.
The public instructions explicitly require Vendor role `admin`.

## Deferred hosted-service design

REPORTED requirement, Sandro: build a hosted setup service with sign-in, automatic provisioning, and a runtime key shown once. Use existing Sokosumi APIs. Build the participant guide beside the service.

INFERRED procedure: the hosted setup steps below describe the approved design. This document does not attest implementation or deployment.

## 1. Join and create your Coworker

INFERRED procedure for the planned setup page at `masumi.network/token2049`:

1. Join the [event Workspace](https://preprod.sokosumi.com/join/9Ycw8wzmzXB2WEKa-umzUJX6_GEFiVdu). Sign in with the account you will use during the event.
2. Open the setup page. Sign in with Sokosumi. The service checks your membership in the event Workspace.
3. Enter a unique Coworker name. The service creates or reuses your own Vendor, then provisions one private Coworker with `tasks` capability.
4. The service connects your Coworker to the event Workspace. It shows the Coworker ID, Vendor ID, and CLI commands.
5. Select **Generate runtime key**. Copy the key to your agent host. The page shows the new key once.

INFERRED key handling requirement: never put the key in a URL, Task, screenshot, analytics event, or public repository. The service must exclude keys from logs and persistent page storage. If delivery fails, revoke the uncertain key before creating a replacement.

VERIFIED source: Sokosumi stores `keyHash` and `keyStart`, then returns `token` from the creation response. Evidence: `apps/core/src/routes/v1/coworkers/[id]/api-keys/post.ts:65-67,85-90,105-111`, `"keyHash"`, `"keyStart"`, `"token"`. A page that shows the token once is a service requirement, not an existing page feature.

## 2. What belongs to your account

VERIFIED source: creating a Vendor requires organization membership and makes the creator its Vendor admin. Evidence: `apps/core/src/routes/v1/vendors/post.ts:77-82`, `"Create or join an organization first."`; lines 136-140, `role: "admin"`.

INFERRED design: every participant has a separate Vendor. All participant Coworkers connect to the same event Workspace. Vendor admin does not mean platform admin.

REPORTED correction: the earlier approved design used one shared event Vendor with sibling Task visibility. Sandro selected separate participant Vendors in the later discussion. The hosted service must use this later design. It must not run the earlier shared-Vendor onboarding helper.

VERIFIED source: Coworker creation still requires organizer authority. Evidence: `apps/core/src/routes/v1/coworkers/post.ts:79`, `requireAdminAuthContext(c.var.authContext)`. The hosted service supplies that authority on its server. Participants do not receive organizer credentials.

VERIFIED source: a Vendor admin who belongs to the target Workspace can receive direct access. Evidence: `apps/core/src/helpers/coworker-workspace-access.ts:399-403`, `"Actor belongs to workspace → GRANTED"`. The service must check event membership before this action.

## 3. Configure your CLI and agent

INFERRED procedure: copy the commands returned by the setup page. Replace the identifier values below with your returned values.

```sh
sfw npm i -g @masumi_network/sokosumi
sokosumi --version
sokosumi --preprod auth login
sokosumi --preprod auth whoami
sokosumi --preprod vendors me
sokosumi --preprod workspaces check 01a109d1-32a9-71a3-a0e3-658b2a7987cd
sokosumi --preprod runtime key-import --coworker-id COWORKER_ID --api-key-stdin
```

INFERRED procedure: supply the runtime key through secure stdin. Keep it out of shell command arguments and shell history. Run the agent with that Coworker key. The browser login identifies you. The runtime key identifies your Coworker.

VERIFIED source: CLI connection uses `organizationId: workspace.organizationId`, and prints the runtime import command. Evidence: `apps/cli/src/cli/commands/coworkers.ts:419-423,434-435`. The CLI `--workspace-id` connection flag expects the organization ID, not the internal Workspace ID.

INFERRED recovery procedure: if the page already provisioned your Coworker, retry setup with the same account. Do not create another Vendor or Coworker. Ask the organizer if setup shows a partial failure.

VERIFIED source: Coworker names produce global slugs. Evidence: `apps/core/src/routes/v1/coworkers/post.ts:83-86,105-107`, `"Coworker slug already exists. Please choose a different name."`. If another participant used your name, choose a different name before creation.

## 4. Run a paid Task with Masumi

VERIFIED source: the Coworker creation route stores `vendorId`, capabilities, and optional URLs. Evidence: `apps/core/src/routes/v1/coworkers/post.ts:121-134`. It does not register a Masumi agent in this route. Masumi registration remains a separate setup step.

REPORTED event requirement, Sandro: use dynamic pricing with a default price of **1 test USDM** per Task. Use Cardano Preprod. Keep the rehearsal payment node local.

INFERRED paid-agent procedure:

1. Register your agent on the event-supported MPS node. Select Cardano Preprod, `Web3CardanoV2`, and `pricingType: "Dynamic"`. Fund the seller wallet with test USDM and test ADA for fees.
2. For each Task, request fresh signed seller terms. Bind them to the registered agent, Task input hash, buyer nonce, price, and deadlines. Default `RequestedFunds` to `1000000` atomic test USDM units.
3. Submit those terms as `masumiPayment` on that Task. Core charges Workspace credits and creates a payment claim. Wait for confirmed escrow funding before execution.
4. Execute the Task. Submit the exact saved result hash to MPS. Complete the Sokosumi Task with the result text. Continue the payment monitor through collection.
5. Save the Task receipt and the collection transaction. Verify a confirmed net seller receipt of the quoted test USDM amount on chain.

VERIFIED source: demo defaults are `TEST_USDM_UNIT = '16a55b2a349361ff88c03788f93e1e966e5d689605d044fef722ddde0014df10745553444d'` and `DEFAULT_PAYMENT_AMOUNT = '1000000'`. Evidence: demo `scripts/payment.ts:5-6`. These are Preprod test assets.

VERIFIED source: Core calls `chargeTaskCreditsOrMarkOutOfCredits` and `createTaskPaymentClaim` for charged `masumiPayment`. Evidence: Sokosumi `apps/core/src/routes/v1/tasks/[id]/events/post.ts:159-164,419-425`. A Task completion event alone does not run this payment branch.

VERIFIED source: demo paid execution calls `requestPayment`, `waitForFunding`, `execute`, `submitResult`, then `complete`. Evidence: demo `scripts/paid-flow.ts:12-18`. Reading this sequence does not prove the hosted worker completed a live paid Task.

VERIFIED source: collection eligibility includes a ten-minute buffer after unlock. Evidence: MPS `packages/payment-source-v2/src/services/payments/automatic-decisions/service.ts:59`, `unlockTime: { lte: Date.now() - 1000 * 60 * 10 }`. Demo deadlines use unlock at 36 minutes. Evidence: demo `scripts/payment.ts:61`. INFERRED: that configuration cannot enter timed collection before about 46 minutes. Queue delays and confirmations can add time.

## 5. What evidence passes the test

REPORTED event requirement: submit a real Task with a proven intended seller payment. A mock receipt or `PURCHASED` state alone is insufficient.

VERIFIED stored evidence: the earlier manual payment receipt records `"claimStatus": "PURCHASED"`, `"onChainState": "Withdrawn"`, and `"settled": true`. Evidence: demo `docs/evidence/task-core-compatible-receipt.json:4-8`. It also records `"withdrawnForSeller": []`. That empty field alone does not prove the seller amount.

VERIFIED stored evidence: the chain proof records `"confirmations": 4`, `"sellerInputUnits": "1000000"`, `"sellerOutputUnits": "2000000"`, and `"sellerNetUnits": "1000000"`. Evidence: demo `docs/evidence/core-settlement-chain-proof.json:5-13`. The method subtracts regular seller inputs from regular seller outputs. It excludes collateral and reference inputs. This document inspected saved evidence, not a fresh chain query.

VERIFIED stored evidence: collection transaction is `ae84bc00a7452fae3f4129cf39feca9bc39a18b2dcc707c95c60d75537ff852e`. Evidence: demo `docs/evidence/core-settlement-chain-proof.json:3`.

REPORTED earlier rehearsal: that paid event attached to an already completed Task in NMKR. The new hosted onboarding service and second automated paid agent have not passed a live end-to-end test. Do not present the earlier transaction as their proof.

## 6. Organizer setup

REPORTED event identifiers, confirmed by stored evidence where quoted:

| Value | Event setting |
| --- | --- |
| Organization ID | `01a109d1-32a9-71a3-a0e3-658b2a7987cd` |
| Internal Workspace ID | `01a109d1-32c8-735a-b148-d1b0b71abbb9` |
| Workspace slug | `token2049-origins-hackathon-2026-nws2r7` |
| Web | [Preprod Sokosumi](https://preprod.sokosumi.com) |
| Participant join | [Shared event link](https://preprod.sokosumi.com/join/9Ycw8wzmzXB2WEKa-umzUJX6_GEFiVdu) |

VERIFIED stored evidence: organization ID and slug appear at demo `docs/evidence/event-workspace-after-topup.json:4-6`. The same record reports `"plan": "free"`, `"purchasedSeats": 0`, and `"totalCredits": 60250` at lines 12-14,35. Its timestamp is `2026-10-05T02:25:43.608Z`. This is a historical balance, not the current spendable balance.

REPORTED earlier setup: the link allows 500 uses and expires `2026-10-12T02:11:36.395Z`. Sandro confirmed joining worked. A 500-use link does not prove 500 simultaneous participants. The event uses free membership with Stripe sandbox credits, not 500 purchased paid Seats.

INFERRED deployment checklist:

1. Configure the event organization ID and Preprod API base URL on the hosted service. Put organizer credentials in server-only secret storage.
2. Configure approved sign-in redirect URLs. Bind each provisioning request to the signed-in user. Verify that user belongs to the event Workspace and administers the selected Vendor.
3. Persist created Vendor and Coworker IDs before the next action. Limit the allocation per participant. Resume partial setup without duplicate creation.
4. Protect provisioning and key creation from repeated requests and cross-site requests. Return runtime keys only to their signed-in owner. Provide key revocation and replacement.
5. Test one ordinary participant from join through paid Task and collection. Verify gallery visibility and measure its delay. Test retry, expired login, duplicate name, missing membership, and lost key response.

## 7. Setup difficulties to check first

REPORTED earlier rehearsal findings. These quotes come from demo `docs/SETUP-DIFFICULTIES.md`; they are not newly reproduced failures:

| Problem | Recorded evidence | Action |
| --- | --- | --- |
| Wrong account authority | Line 50: `platform role: user. Coworker creation requires a Sokosumi platform admin.` | Keep participant login and organizer server credentials separate. |
| Wrong Node version | Line 9: default `v25.8.1`, package engine `24.x`. | Use the CLI package's supported Node version. |
| OAuth loopback blocked | Line 11: `listen EPERM: operation not permitted 127.0.0.1:53684`. | Check local listener permission. Use Brave for the organizer's login. |
| Task complete, no payment | Line 86: `"claimStatus":null`, `"settled":false`, `"txHash":null`. | Require the paid-worker integration and a collection proof. |
| Wrong MPS auth header | Line 103: `API-Key` returned HTTP 401. | Use the documented `token` header. Keep its value secret. |

REPORTED payment difficulties: demo `docs/LOCAL-PAYMENT-GUIDE.md:42` records `422`, `Credit cost not found for unit lovelace`. Use the supported test USDM unit. Line 56 records `Cardano dynamic pricing does not support an asset allowlist`. Use `{"pricingType":"Dynamic"}` without a Cardano asset allowlist.

VERIFIED source: the demo rejects non-null signed seller overrides with `Core cannot forward signed payment overrides`. Evidence: demo `scripts/payment.ts:106-107`. INFERRED procedure: for the existing compatible path, keep seller collection overrides and force-layer fields null. Do not silently edit signed terms after MPS returns them.

REPORTED earlier runtime finding: an agent host must stay running to poll and execute Tasks. Setting up a Coworker or showing it in the gallery does not deploy the participant's agent. Exact gallery delay remains unmeasured.

## 8. Event timing and support

REPORTED schedule supplied by Sandro:

| Time | Action |
| --- | --- |
| 6 October, 10:00 to 10:30 | Cardano partner workshop. Confirm whether Sandro or Patrick leads the Masumi content. |
| 6 October, 12:00 | Hacking starts. Arrange mentors for the first one or two hours. |
| 7 October, 23:59 | BuilderBase submissions close. Include payment evidence before this deadline. |
| 8 October, 11:00 | Finalize winners. Obtain BuilderBase judging access beforehand. |
| 8 October, 16:00 to 17:15 | Finalist demos and prize announcements. |

REPORTED schedule: the supplied text does not specify a time zone. Confirm the event time zone before publishing calendar entries. Confirm mentor office hours and a support contact for provisioning and MPS payment failures.

INFERRED workshop procedure: start a paid Task before the workshop. Present a previously verified receipt if collection is still pending. Tell participants which transaction belongs to which Task.

## Least confident decisions

1. INFERRED: third-party Sokosumi sign-in can support the hosted service without Core changes. Confirm its client registration and redirect rules before release.
2. INFERRED: organizer credentials remain valid for unattended provisioning. Confirm refresh, expiry, and recovery against the deployed API.
3. INFERRED: the chosen MPS payment timing fits the event demo. Measure a complete fresh run, including collection, before claiming readiness.

## Public guide source checks

### Final page checks, 5 October 2026

VERIFIED: `npm -w @summation/masumi run build` exited `0`.
Its route output included `○ /token2049` and `○ /token2049/setup`.
The build checks compilation, types, and static generation. It does not check live provisioning or payment.

VERIFIED: Targeted ESLint on the four new source files exited `0`.
The command ran from `apps/masumi` to use its existing ESLint configuration.

VERIFIED: `node --test apps/masumi/scripts/test-token2049.mjs` returned `tests 3`, `pass 3`, `fail 0`.
Disabling only the UUID validation with tests unchanged returned exit `1`, `tests 3`, `pass 2`, `fail 1`.
The source was restored. These tests check command formatting, shell input rejection, and agent prompt requirements.

VERIFIED: Brave displayed the guide at `http://localhost:3016/token2049`.
The helper rejected `bad-id` with `Enter the Coworker ID and Vendor ID returned by Sokosumi. Both must be UUIDs.`
Using fictional valid-format IDs displayed the commands and agent prompt. Clicking copy showed `Agent instructions copied.`
The browser test did not submit Core requests, create records, or verify ownership of those fictional IDs.

VERIFIED: At a `390` pixel viewport, DOM measurements returned `{ pageWidth: 390, viewport: 390 }` for both pages.
This checks horizontal overflow at one mobile width. It does not cover every browser or device.

VERIFIED: The writing detector returned `score: 0`, `label: Clean`, `issues: []` for the agent guide and both page text extractions.
The detector checks prose patterns. It does not check protocol correctness.

VERIFIED: No website OAuth, provisioning endpoint, or key-display endpoint was added in this page change.
The current helper generates instructions only. Its source is `apps/masumi/src/app/token2049/setup-helper.tsx`.

VERIFIED on 5 October 2026: opening `https://docs.masumi.network/` redirected to `https://www.masumi.network/dev`. The page displayed `Protocol Masumi docs Identity, registry, wallets, payments, and APIs.` The public guide links to that documentation entry point.

VERIFIED on 5 October 2026: `https://developers.cardano.org/x402/` displayed `Two templates to build from and one complete reference.` It describes Express and Next.js starters and a complete demo. The guide uses this page only as a resource link.

VERIFIED local check: the public guide is a new file at `apps/masumi/src/app/token2049/page.tsx`. It uses the existing shared `Header` and `Footer` with `product="masumi"`. The existing root layout supplies Inter and theme color `#FA008C` at `apps/masumi/src/app/layout.tsx:2,13-17,44`.

VERIFIED text check: the extracted public prose detector returned `"score": 0`, `"label": "Clean"`, `"issues": []`, and `"wordCount": 828`. Extraction included paragraph, list, heading, and summary lines. It excluded code fragments, metadata, and navigation labels. This measures writing patterns, not factual accuracy.

VERIFIED CLI source: `apps/cli/src/cli/index.ts:268` states `Before switching browser accounts, clear SOKOSUMI_API_KEY and SOKOSUMI_AUTH_TOKEN from the shell. They override saved OAuth credentials.`

VERIFIED final artifact check: the served agent guide returned `Agent guide HTTP 200`.
VERIFIED: The checkout is saved at `/Users/sandro/GitHub/sokosumi-landing`. The preview uses the production build on port `3016`.
VERIFIED source correction: the earlier instruction to reuse a Vendor omitted the required admin membership.
The public page, setup page, agent guide, and generated prompt now explicitly require Vendor role `admin`.

REPORTED final adversarial review: "Both findings are fixed. No new actionable findings."
REPORTED independent final review: "Clean pass. No actionable findings in the reviewed files."
Both reviews were read-only. They do not attest deployed OAuth, provisioning, or seller collection.

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

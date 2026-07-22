# Masumi Learn

Masumi Learn is the education layer for people who need the mental models behind the agent economy before they use the task-oriented developer documentation. The Phase 1 MVP lives at `/learn` in `apps/masumi`.

## Audience and outcomes

The primary learner is a first-time Masumi builder. Product and business learners can audit the same course without completing the assessment. No blockchain knowledge is assumed.

After Fundamentals, a learner should be able to:

- distinguish an AI agent from an agentic service;
- explain the roles of Masumi, Masumi Node, Registry, and Sokosumi;
- follow a job from discovery to settlement;
- use basic Cardano, UTXO, wallet, token, fee, and smart-contract mental models;
- explain identity, registry metadata, escrow, decision logging, refunds, and disputes;
- choose the correct developer documentation for implementation details.

## Curriculum and ownership

| Unit | Required outcome | Content owner | Accuracy reviewer |
| --- | --- | --- | --- |
| 1 — The agentic economy | Roles and separation of discovery, identity, payment, and accountability | Developer Relations | Masumi Product |
| 2 — Masumi fundamentals | Ecosystem components and job lifecycle | Developer Relations | Protocol Engineering |
| 3 — Blockchain without the burden | Cardano/eUTXO payment mental model | Developer Relations | Protocol Engineering |
| 4 — Trust and payment lifecycle | Identity, registry, escrow, evidence, refunds, and disputes | Developer Relations | Protocol Engineering |
| 5 — Build on Preprod | Supported integration, test wallets, service registration, and one verified payment | Developer Relations | Developer Experience + Protocol Engineering |
| 6 — Publish and operate | Pricing, reliability, custody, responsible deployment, and Sokosumi handoff | Developer Relations | Product + Security/Privacy |

Developer Relations owns course clarity, sequencing, and quiz quality. Protocol Engineering reviews claims about live protocol behavior. Product owns learner path and certification policy. Volatile values and exact operational instructions remain in Docs.

## MVP UX state map

This state map is the implementation-backed wireframe for the planning acceptance criterion. The named routes are the shipped screens, not speculative mockups.

| Surface | Primary state | Alternate/error states | Primary transition |
| --- | --- | --- | --- |
| `/learn` | Education promise, duration, credential levels, and path cards | Public Library/Docs handoff without login | Choose path, course, quickstart, or Sokosumi |
| `/learn/start` | Audience selector plus four-question baseline | Product/audit recommendation; known-material validation route | Recommended unit, quiz, or Library |
| `/learn/course` | Account progress and four unit cards | First visit, partial progress, all quizzes passed | Lesson or final assessment |
| `/learn/[unit]` | Objectives, reviewed lesson, examples/visuals, and three Docs handoffs | Saved/completed lesson state | Unit quiz |
| `/learn/[unit]/quiz` | Four server-graded questions | Incomplete, failed with explanations, passed | Retry or course overview |
| `/learn/assessment` | Eight-question final | Locked until four quizzes pass; retry after failure | Dashboard/credential |
| `/learn/dashboard` | Progress, attempts, next action, Fundamentals and Builder state | No attempts, assessment ready, mint failure/pending/revoked/superseded | Resume, verify, mint, Builder, Docs, or Sokosumi |
| `/learn/builder` | Units 5–6 checklist and minimal Preprod proof | Fundamentals locked; pending/rejected/verifier-error proof; assessment locked | Maintained guide, proof, or operating assessment |
| `/learn/verify/[id]` | Public validity and downloadable SVG certificate | Unknown, revoked, or superseded credential | Verify, copy, download, or inspect chain transaction |

## Assessment and certification rules

- Each unit has four questions with immediate explanations.
- A score of 75% passes a unit quiz; retries are unlimited.
- All four unit quizzes must pass before the eight-question final assessment unlocks.
- A final score of 75% unlocks the Masumi Fundamentals badge.
- Course access and credential progress require a Sokosumi-linked account.
- A server-authoritative passing assessment issues the Fundamentals credential.
- Optional Cardano minting is available only after issuance; client-side state can never issue a credential.
- The Builder certificate additionally requires a valid Fundamentals credential, all Unit 5–6 project steps, a verified Preprod transaction/service proof, and 80% on the five-question operating assessment.
- A Builder proof stores only the transaction hash and registered service identifier. Automated verification and privileged manual review are both server-side and auditable.

Questions assess stable mental models. They do not assess API paths, environment-variable names, token policy IDs, live fees, minimum amounts, commands, roadmap claims, or legal conclusions.

## Technical decisions

Course content and question data are typed in `apps/masumi/src/app/learn/course-data.ts`. Module-level content validators fail builds for duplicate unit/concept/question IDs, invalid answer indexes, missing explanations, out-of-policy question counts, malformed review dates, broken Library references, or non-canonical Docs links. Sokosumi OAuth uses Authorization Code with PKCE, and the Masumi app owns an opaque HTTP-only session. Progress, attempts, and credentials are persisted server-side and linked to the stable Sokosumi subject. The server grades all submissions and issues one idempotent credential per learner/course version.

The earlier `masumi-learn-progress-v1` browser record is consumed once after login. Only lesson-completion markers are imported; quiz passes and credential eligibility are intentionally discarded because client state is not trusted.

Unit 0 at `/learn/start` provides audience selection and a non-authoritative baseline self-check. Experienced learners may jump to unit quizzes, but cannot skip server verification for a credential. The public Learn Library at `/learn/concepts`, `/learn/glossary`, `/learn/deep-dives`, and `/learn/patterns` is optional and never changes progress.

The complete identity, persistence, privacy, and on-chain boundary is recorded in `docs/adr/0001-masumi-learn-identity-credentials.md`. DEVREL-107 tracks delivery.

Session expiry slides while the learner is active and is capped at 30 days. The dashboard includes recent quiz/assessment attempt history without raw answers, every credential has a downloadable public SVG certificate, and mint requests can reconcile a previously pending or failed transaction through the configured server-to-server status adapter. The exact non-PII mint payload is published as JSON Schema at `/learn/credentials/v1`.

Run `npm -w @summation/masumi run test:learn` for the isolated integration suite. It starts a local app and mock OAuth/mint service, then covers state/PKCE, redirect safety, session refresh/expiry, anonymous protection, cross-account isolation, server grading, idempotent issuance, mint reconciliation, public privacy, export, deletion, and revocation. The security/runbook and remaining production gates are in `docs/MASUMI_LEARN_SECURITY.md`.

## Railway production deployment

Learn ships inside the existing `masumi` Railway service that serves `www.masumi.network`; it is not a separate application. The existing `masumi-volume` is mounted at `/app/apps/masumi/data`, so production sets `MASUMI_LEARN_DB_PATH=/app/apps/masumi/data/masumi-learn.db`. The service builds with `npm run build:masumi`, starts through `apps/masumi/scripts/start-with-sync.mjs`, and exposes the public liveness endpoint at `/api/learn/health`.

Production OAuth uses Sokosumi's published endpoints at `/auth/oauth2/authorize`, `/auth/oauth2/token`, and `/auth/oauth2/userinfo`. The confidential web client uses Authorization Code with PKCE and `client_secret_post`. The live token endpoint requires `application/x-www-form-urlencoded` even though the generated OpenAPI schema currently advertises JSON. Register both `http://localhost:3001/api/learn/auth/callback` and `https://www.masumi.network/api/learn/auth/callback`, while configuring the deployed app to send the exact production callback. Manually created Sokosumi clients currently accept the `openid` scope; Learn requires only its stable `sub`, while name and email remain optional. Store the client secret only as the `SOKOSUMI_OAUTH_CLIENT_SECRET` Railway variable.

Preview the exact registration without credentials with `npm -w @summation/masumi run learn:oauth:create -- --dry-run`. For the real one-time registration, provide `SOKOSUMI_API_TOKEN` only to that process and run the command without `--dry-run`. It checks existing clients before creating one, refuses duplicates, and pipes the returned client ID and secret directly into the production Railway service with deploys suppressed. It never prints or writes the secret to disk.

## Analytics funnel

The MVP emits these GA4 events through the existing consent-aware integration:

| Event | Meaning |
| --- | --- |
| `learn_path_selected` | Unit 0 audience intent selected |
| `learn_baseline_complete` | Optional baseline completed with aggregate known-count and recommendation |
| `learn_course_view` | Course overview viewed, with units passed |
| `learn_lesson_view` | Unit lesson viewed |
| `learn_lesson_complete` | Learner marked a lesson complete or continued to its quiz |
| `learn_quiz_attempt` | Unit quiz submitted, with unit and score |
| `learn_assessment_complete` | Final assessment submitted, with score |
| `learn_fundamentals_complete` | Passing final assessment |
| `learn_lifecycle_stage` | Unit 2 lifecycle stage explored |
| `learn_payment_example_stage` | Unit 3 conceptual payment stage explored |
| `learn_docs_handoff` | Lesson link opened, labeled as read, build, or reference |
| `learn_quickstart_start` | A lesson’s implementation/quickstart handoff opened |
| `learn_sokosumi_handoff` | A pre-credential learner continued from Learn to Sokosumi |
| `learn_builder_guide_open` | A Unit 5–6 maintained implementation guide opened |
| `learn_builder_step_complete` | A Builder checklist step marked complete |
| `learn_builder_proof_submitted` | Minimal Preprod proof submitted, labeled by verifier status |
| `learn_builder_proof_verified` | Automated verifier confirmed a Preprod proof during submission |
| `learn_docs_conversion` | Credential holder continued to a quickstart, labeled by Builder-credential state |
| `learn_publish_conversion` | Credential holder continued to Sokosumi publishing guidance, labeled by Builder-credential state |

Dashboarding, first successful Preprod payment, and publication conversion are tracked in DEVREL-106. First-learner testing and the initial metric baseline are tracked in DEVREL-108.

Server-owned aggregate grading metrics are available from `GET /api/learn/report` when `MASUMI_LEARN_REPORT_TOKEN` is configured. The response never contains learner rows or profile data and suppresses question-level results and the median account-creation→first-verified-Preprod-proof time until `MASUMI_LEARN_REPORT_MIN_COHORT` records exist (default 5). It also reports valid Fundamentals/Builder credential counts and their conversion rate. This makes repeated-failure questions and the hands-on funnel diagnosable without retaining raw answers or returning learner-level timings. GA4 remains the consent-aware source for broader page and conversion analysis. After analytics consent, the Learn client also records course-view, quickstart, and Sokosumi-publishing events as daily first-party totals with no session or learner identifier so the private dashboard can show the agreed funnel without copying GA credentials or learner-level data into Learn.

Developer Relations owns a monthly funnel/content review; Product owns conversion decisions; Protocol Engineering reviews repeated failures that may indicate incorrect protocol explanations; Security/Privacy reviews any proposed analytics expansion. The ready-to-run participant criteria, session script, privacy rules, findings template, severity rubric, and baseline process live in `docs/MASUMI_LEARN_PILOT.md`.

## Learn and Docs boundary

Learn teaches stable “what” and “why” mental models. Docs owns “how” and “what exactly”: commands, endpoints, schemas, configuration, current network values, and troubleshooting. Every lesson supplies “Next: read,” “Next: build,” and “Reference” destinations. Masumi Core Concepts pages render a shared “New to this concept?” route back to Learn.

The current checked-in page-by-page inventory, including the newer x402 concept, is maintained in `docs/MASUMI_LEARN_CONTENT_TAXONOMY.md`; DEVREL-105 records the original planning rationale. Existing Core Concepts content is preserved until its separate migration is reviewed and old URLs have redirects or transitional summaries. New Core Concepts pages must update the matrix and make an explicit Course / Learn Library / Docs decision.

# Masumi Learn first-learner pilot

This is the ready-to-run guide and findings template for DEVREL-108. The sessions themselves require 3–5 real first-time Masumi developers and cannot be replaced by automated testing.

## Participant criteria and consent

- Has not previously completed a Masumi integration or operated a Masumi Node.
- Represents at least one intended path: independent builder, integration engineer, or technical product lead.
- Agrees to observation and note-taking; do not record names, email, wallet identifiers, OAuth data, or raw quiz answers in the findings document.
- Uses a test account and Preprod-only resources if the session continues into a quickstart.

Recruit five candidates so the pilot still has at least three completed sessions after scheduling attrition. Developer Relations owns recruiting and facilitation; Product observes; Protocol Engineering joins only for technical follow-up to avoid steering the learner.

## 60-minute session script

1. **Opening (5 min):** Ask what the participant thinks Masumi and Sokosumi do. Do not explain the product yet.
2. **Learn landing (5 min):** Ask them to choose a path and narrate what they expect to happen.
3. **Fundamentals course (30 min):** Use think-aloud. Note confusion, backtracking, abandoned sections, and the concept behind any failed question—not the selected answer.
4. **Dashboard and credential (5 min):** Ask what is private, what is public, and what they expect “Mint on Cardano” to do.
5. **Quickstart handoff (10 min):** Ask them to open the recommended installation path and identify their next three actions. Stop before real funds or Mainnet.
6. **Debrief (5 min):** Ask what they would remove, expand, and do next.

Do not coach during a task. If blocked for more than two minutes, record the blocker, give the smallest neutral prompt, and mark the step as assisted.

## Session capture

| Field | Value |
| --- | --- |
| Anonymous participant code | P1–P5 |
| Persona | Builder / integration engineer / product |
| Prior blockchain familiarity | None / some / advanced |
| Course completion | Complete / partial, with last unit |
| Time to first lesson completion | |
| Time to Fundamentals completion | |
| Quiz attempts by unit | Aggregate count only |
| Quickstart opened | Yes / no |
| Next actions correctly identified | 0–3 |
| Critical blocker | |
| Assistance given | |
| Confidence before / after (1–5) | |

## Finding format

Record one row per observation and group the review by unit.

| Unit/surface | Severity | Evidence | Interpretation | Recommended change | Owner |
| --- | --- | --- | --- | --- | --- |
| Example: Unit 2 lifecycle | High | 3/5 placed settlement before result evidence | Sequence is not memorable | Add a numbered lifecycle visual before the checkpoint | Developer Relations |

Severity:

- **Critical:** prevents course, login, assessment, or quickstart completion.
- **High:** produces a wrong core mental model or affects at least two participants.
- **Medium:** creates hesitation, unnecessary backtracking, or an isolated wrong answer.
- **Low:** copy polish or preference without task impact.

## Baseline report

After the final session, record:

- course start → completion rate;
- median time to completion;
- attempts and pass rate by unit;
- aggregate question failure rate where the minimum cohort is met;
- completion → quickstart-open conversion;
- number completing the quickstart handoff without assistance;
- qualitative confidence change;
- support questions grouped by topic.

Use the consent-aware GA4 funnel for browser events and `GET /api/learn/report` for server-owned aggregate grading metrics. The report requires `Authorization: Bearer $MASUMI_LEARN_REPORT_TOKEN` and suppresses per-question rows below `MASUMI_LEARN_REPORT_MIN_COHORT` (default 5). Never paste the report token into a browser URL or shared document.

## Review and issue creation

Within two working days of the fifth scheduled session:

1. Developer Relations groups findings by unit and severity.
2. Product accepts, rejects, or defers each recommended change with a reason.
3. Protocol Engineering reviews only changes to protocol claims.
4. Create one Linear issue per Critical/High finding and one grouped issue per unit for Medium/Low findings.
5. Add the metric baseline and issue links to DEVREL-108 and the next DEVREL-106 review update.

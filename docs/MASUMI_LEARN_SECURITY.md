# Masumi Learn security, privacy, recovery, and launch runbook

This document is the operational companion to ADR 0001. It records the threat model, privacy boundary, response procedures, ownership, and launch gates for account-linked Learn credentials. It does not approve the final OAuth or issuer-key configuration; those require the real provider and minting environments.

## Data classification and retention

| Data | Storage | Retention and deletion |
| --- | --- | --- |
| Sokosumi subject | Application database | Replaced with an irreversible `deleted:<internal-id>` marker on account deletion |
| Display name, email, avatar URL | Application database | Optional profile cache; erased on account deletion |
| OAuth authorization code/access token | Memory during callback only | Never persisted; discarded after user-info lookup |
| Session token | Browser cookie | Opaque, `HttpOnly`, `SameSite=Lax`, `Secure` in production; only its SHA-256 hash is stored server-side |
| Lesson, quiz, and assessment state | Application database | Removed on account deletion; raw answers are never stored |
| Aggregate question counters | Application database | Contains question ID and total/correct counts only; no learner key or answer value; retained for course-quality trends |
| Builder proof | Application database | Preprod transaction hash and registered service identifier only; removed on account deletion |
| Off-chain credential record | Application database | Retained without learner PII after deletion and marked revoked, preserving honest public verification |
| On-chain credential proof | Cardano | Permanent; limited to opaque credential ID/hash, issuer, schema/course version, and approved chain metadata |

The learner-facing account, mint confirmation, and verifier disclose the permanent-chain boundary. Product/Privacy must approve the final production wording before launch.

## Threat model and disposition

| Threat | Control | Evidence/status |
| --- | --- | --- |
| Login CSRF or callback replay | Random state, matching `HttpOnly` state cookie, ten-minute single-use database record | Automated integration test covers PKCE/state match and mismatch |
| Authorization-code interception | S256 PKCE and exact registered redirect URI | Automated test verifies verifier-to-challenge binding; production redirect registration pending DEVREL-109 |
| Open redirect | Post-login destinations restricted to same-origin `/learn…` paths | Automated test submits a protocol-relative external URL and verifies the course fallback |
| Session theft or fixation | 256-bit opaque token, hash-only server storage, secure cookie flags, rotation on every login, sliding idle expiry plus a separate absolute expiry capped at 30 days | Automated refresh, idle/absolute expiry, and local/provider logout/deletion tests |
| Cross-account data access | Every learner API derives its user ID from the server session; no caller-supplied user ID | Two-account isolation test |
| Cross-site writes | `SameSite=Lax` cookie plus same-origin validation on state-changing endpoints | Cross-origin progress-write test |
| Client-side grading or credential forgery | Server-owned question keys, grading, eligibility calculation, and issuance | End-to-end early-assessment rejection and server-grading tests |
| Duplicate/replayed issuance | Unique `(user, course_version)` record and idempotent issue operation | Repeated passing-assessment test returns the same credential |
| Quiz-answer overcollection | Only score/pass/timestamp are persisted | Schema and audit-payload tests assert no answer field |
| Analytics re-identification | Question statistics are aggregate-only, omit learner keys, require a bearer-protected report, and suppress cohorts below the configured threshold | Integration test verifies aggregate report authorization and failure counts |
| Self-attested or forged Builder completion | Project steps alone cannot issue a credential; proof must be verified by a server adapter or separate reviewer token, then a server-graded assessment must pass | Integration suite covers prerequisites, verifier payload, manual queue authorization, concurrent issuance, and public result |
| Secret leakage through project proof | Strict transaction-hash and service-ID allowlists reject spaces and arbitrary payloads; verifier receives no account/profile fields | Integration test inspects the outgoing verifier payload for PII markers |
| Duplicate/dropped mint transaction | Credential ID as idempotency key, durable off-chain record, explicit `minting`/`mint_failed`, status reconciliation endpoint | Mock mint failure/reconciliation/retry integration test; real service contract pending DEV-950 |
| Stalled upstream dependency | OAuth token/user-info, Builder verifier, mint, and reconciliation requests share a configurable timeout clamped to 1–30 seconds | Integration boundary configuration; real latency thresholds require staging observation |
| Browser exposure of issuer keys | Mint token and endpoint are read only by server modules | Build/runtime boundary; production secret review pending DEV-950 |
| PII exposed publicly or on-chain | Public projection allowlist excludes user and attempt data | Public API test searches for provider subject/name/email markers |
| Stale credential presented as valid | Public verifier treats `revoked` and `superseded` as invalid and always reads current server state | Account deletion/revocation integration test; course-version supersession path implemented |
| Brute force or cost abuse | Per-user quiz, assessment, mint, and reconciliation windows; mint calls require an eligible authenticated credential | Implemented; production alert thresholds below |

No unresolved application-code finding above requires OAuth credentials. External findings still needing explicit acceptance are provider revocation semantics, issuer-key custody, production persistence, and final on-chain metadata/network.

## Recovery and revocation runbook

### Lost Sokosumi access

1. Direct the learner through Sokosumi account recovery. Email alone is not sufficient to reassign Learn records.
2. After recovery, require a fresh OAuth login and confirm the stable provider subject is unchanged.
3. If Sokosumi changes the subject during a verified recovery, an authorized operator may migrate the subject only after a dual-control identity review. No self-service subject-change API exists.
4. Record the operator, old/new subject hashes, reason, and ticket in the audit system. The administrative migration tool remains a launch prerequisite if Sokosumi confirms subjects can change.

### Suspected account compromise

1. Call `POST /api/learn/admin` with the separate admin bearer token, action `revoke_credential`, an allowlisted reason, and `invalidateOwnerSessions: true`; then ask Sokosumi to revoke the OAuth grant.
2. Confirm the public verifier shows the credential as revoked; never attempt to delete chain history.
3. Preserve audit events and mint transaction identifiers for incident review.
4. After Sokosumi recovery, issue a new course-version credential only through the normal eligibility path or a separately approved administrative process.

### Learner deletion

1. The learner exports data if desired, then confirms deletion in the account UI.
2. The application deletes sessions, lesson/quiz/assessment activity, and cached profile data.
3. Any credential becomes an anonymous revoked record; the public verifier continues to show its invalid state.
4. The integration test executes and verifies this complete sequence.

### Dropped or failed mint

1. Keep the off-chain credential valid and show `mint_failed`; never issue a second credential ID.
2. Query the configured status service with the same credential ID.
3. If the service reports minted, persist its transaction, asset, network, and explorer URL.
4. If it reports failed/dropped, retain the error and allow an idempotent retry after the underlying cause is resolved.
5. Escalate any contradictory asset/transaction result to Protocol Engineering before changing the credential.

### Builder proof review

1. The automated verifier receives the proof through an idempotent server-to-server call and must check the approved Cardano network, transaction existence/finality, expected Masumi payment semantics, and relationship to the registered test service.
2. `pending_review` and `verification_error` submissions appear only through the bearer-protected review API. The response contains the proof fields and submission ID, never learner profile data.
3. A reviewer validates the same four facts and marks the submission verified or rejected using a status-compatible reason code. The API maps that code to fixed learner-facing text and rejects free-form notes, so the review record cannot collect email, names, or other pasted PII. The reviewer token must be separate from the aggregate report, admin, and mint tokens.
4. Every status change is audited. Verification does not issue a certificate; the learner must still finish Unit 6 and pass the server assessment.
   Once any submission is verified, a later pending/error submission cannot hide that verified proof or remove eligibility; explicit rejection/revocation remains an operator action.
5. If a proof later proves fraudulent, revoke the Builder credential, preserve audit evidence, and investigate whether the Fundamentals credential or account was also compromised.

## Monitoring and ownership

| Signal | Initial threshold | Owner | Response |
| --- | --- | --- | --- |
| OAuth callback failures | More than 5% for 10 minutes | Sokosumi Engineering | Check provider status, redirect registration, and client secret rotation |
| Invalid OAuth state | More than 20 per source/hour | Masumi Engineering | Investigate CSRF/replay traffic; preserve request metadata without OAuth payloads |
| Quiz/assessment rate limits | More than 50 learners/hour | Developer Relations + Masumi Engineering | Separate confusing content from automated abuse before changing thresholds |
| Mint failures/dropped transactions | Any sustained for 15 minutes or three consecutive requests | Protocol Engineering | Pause mint CTA if necessary, reconcile existing IDs, protect issuer funds |
| Builder verifier errors/rejection spike | Three consecutive errors or more than 20% rejected in a day | Developer Experience + Protocol Engineering | Pause automated decisions, inspect network/service matching, use manual review only after cause is understood |
| Credential revocation spike | More than 3/hour | Product + Security | Check compromise, deletion regression, or operator misuse |
| Database write/backup failure | Any | Masumi Engineering | Disable credential-bearing writes and restore the most recent verified backup |

Alerts must contain internal user/credential IDs only, not OAuth tokens, raw answers, or learner email. Concrete paging destinations and named on-call people must be filled in by the deployment owners before sign-off.

`GET /api/learn/health` performs a database liveness check without disclosing configuration. With the admin bearer token it additionally returns boolean readiness for OAuth, minting, Builder verification/review, reporting, and operations; it never returns secret values. Use the public response for deployment health checks and the authenticated response during launch review.

For SQLite deployments on a persistent volume, run `MASUMI_LEARN_DB_PATH=/absolute/path/learn.db npm -w @summation/masumi run learn:db:verify` before and after maintenance. Create a consistent online backup with `npm -w @summation/masumi run learn:db:backup -- --output /separate/volume/learn-YYYY-MM-DD.db`; the utility refuses to overwrite an existing file and validates SQLite integrity and foreign keys on the backup. Production owners must still define an encrypted destination, retention schedule, access policy, alerting, and a restore drill.

The operations API accepts only a credential ID and an allowlisted reason (`account_compromise`, `fraudulent_proof`, `issuer_incident`, `operator_request`, or `policy_violation`). It does not accept email, OAuth subject, or free-form notes. Revoking Fundamentals cascades to active Builder credentials by default because Builder depends on that prerequisite; pass `cascadeDependentCredentials: false` only under an approved incident decision. To revoke and invalidate the credential owner’s sessions in one auditable operation:

```bash
curl -X POST https://www.masumi.network/api/learn/admin \
  -H "Authorization: Bearer $MASUMI_LEARN_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"action":"revoke_credential","credentialId":"CREDENTIAL_ID","reason":"account_compromise","invalidateOwnerSessions":true}'
```

Use `invalidate_owner_sessions` instead when the credential must remain valid. A missing admin-token configuration returns 404; an incorrect token returns 401.

## Production launch checklist

- [x] Application threat model documented and application-code findings addressed.
- [x] Automated OAuth/PKCE, session, account isolation, grading, issuance, mint reconciliation, export, deletion, and revocation tests exist.
- [x] Automated and manual Builder proof paths, Builder assessment, separate credential issuance, and proof-data minimization are covered.
- [x] Learner privacy, deletion, migration, and on-chain permanence copy is present.
- [x] Recovery/revocation and failed-mint runbooks are documented and exercised by the integration suite where no external service is required.
- [x] Protected credential revocation, owner-session invalidation, and authenticated readiness diagnostics are implemented with a separate operations token.
- [x] Builder issuance rechecks a valid Fundamentals prerequisite and Fundamentals revocation cascades to dependent Builder credentials by default.
- [ ] Product/Privacy approves final disclosure copy.
- [ ] DEVREL-109 supplies the OAuth app, stable subject contract, registered redirects, and grant-revocation semantics. Published authorize/token/user-info/end-session endpoints and the JSON token contract are implemented.
- [ ] A staging OAuth handshake, provider denial, expired code, logout, and revoked-grant scenario pass against Sokosumi.
- [ ] Protocol Engineering approves metadata, network, issuer wallet/key custody, mint service contract, fees, and explorer mapping.
- [ ] A real eligible staging credential mints and reconciles on Cardano without PII.
- [ ] Production persistence, backups, restoration drill, retention, and database access policy are approved.
- [ ] Paging destinations and named on-call/incident owners are recorded.
- [ ] Accessibility QA and production deployment smoke test pass.
- [ ] Product, Sokosumi Engineering, Masumi Engineering, Protocol Engineering, Security/Privacy, and Developer Relations sign off in DEV-951.

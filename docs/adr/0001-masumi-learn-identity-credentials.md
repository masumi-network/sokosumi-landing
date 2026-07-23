# ADR 0001: Masumi Learn identity and credentials

Status: Accepted for identity and persistence; issuer-key review remains open

## Decision

Masumi Learn uses Sokosumi as its identity provider through OAuth 2.0 Authorization Code with PKCE. The Masumi app owns an opaque, HTTP-only session and stores learner state server-side. The Sokosumi subject (`sub`, falling back to `id`) is the stable external identity key; email and display data are optional profile attributes and never authorization keys.

The first implementation uses the existing server-side SQLite runtime with a dedicated `MASUMI_LEARN_DB_PATH`. The schema is deliberately isolated behind `learn-db.ts` so a production database adapter can replace it without changing page or API contracts.

The server grades every quiz and assessment. Passing an assessment creates one idempotent, versioned credential per learner and course version. Browser state can suggest a migration but cannot create progress, assessment results, or credentials.

An on-chain credential contains only an opaque credential ID/hash, course/schema version, issuer reference, and optional metadata URI/hash. OAuth tokens, Sokosumi IDs, names, email addresses, quiz answers, and mutable status are never written on-chain. The application database remains authoritative for revocation and supersession.

## Security boundaries

- OAuth state and PKCE verifier are short-lived and single-use.
- Client secrets remain server-only.
- Session cookies are `HttpOnly`, `SameSite=Lax`, `Secure` in production, and rotate on login.
- Session tokens are random; only SHA-256 hashes are stored.
- Course grading and credential issuance are server-authoritative and idempotent.
- Public verification exposes approved credential facts, not learner profile data.
- Minting is delegated to a server-to-server adapter protected by a separate issuer token/key.

## Configuration contract

Required for real OAuth:

- `SOKOSUMI_OAUTH_CLIENT_ID`
- `SOKOSUMI_OAUTH_CLIENT_SECRET`
- `SOKOSUMI_OAUTH_AUTHORIZE_URL`
- `SOKOSUMI_OAUTH_TOKEN_URL`
- `SOKOSUMI_OAUTH_USERINFO_URL`
- `SOKOSUMI_OAUTH_REDIRECT_URI`
- `SOKOSUMI_OAUTH_SCOPES` (defaults to `openid`; profile fields remain optional)
- `SOKOSUMI_OAUTH_END_SESSION_URL`
- `SOKOSUMI_OAUTH_POST_LOGOUT_REDIRECT_URI`

Optional runtime configuration:

- `MASUMI_LEARN_DB_PATH`
- `MASUMI_LEARN_SESSION_DAYS` (defaults to 7)
- `MASUMI_LEARN_SESSION_ABSOLUTE_DAYS` (defaults to and is capped at 30 even while active)
- `MASUMI_LEARN_MINT_URL`, `MASUMI_LEARN_MINT_STATUS_URL`, `MASUMI_LEARN_MINT_TOKEN`, and recommended expected-network guard `MASUMI_LEARN_MINT_NETWORK`
- `MASUMI_LEARN_REPORT_TOKEN` and `MASUMI_LEARN_REPORT_MIN_COHORT` protect aggregate, non-PII course-quality reporting
- `MASUMI_LEARN_BUILDER_VERIFY_URL` and `MASUMI_LEARN_BUILDER_VERIFY_TOKEN` optionally verify a Preprod transaction/service pair
- `MASUMI_LEARN_REVIEW_TOKEN` separately protects the minimal manual proof-review queue
- `MASUMI_LEARN_ADMIN_TOKEN` separately protects credential revocation, owner-session invalidation, and detailed readiness diagnostics
- `MASUMI_LEARN_DEV_AUTH=true` enables a development-only login and is rejected in production

## Credential lifecycle

`eligible → issued → ready_to_mint → minting → minted`

An accepted/HTTP 202 issuer response remains `minting`; only an explicit/HTTP failure moves it to `mint_failed`. Minted responses must contain a 64-hex Cardano transaction hash and asset ID, use an allowed/expected network, and provide only HTTPS explorer URLs. Failures may be retried idempotently. Administrative actions can mark a credential `revoked` or issue a new course-version credential that supersedes it. On-chain records are not deleted; public verification always checks current server status.

The Builder certificate is a separate `builder-v1` credential. Eligibility requires a valid Fundamentals credential, every Unit 5–6 step, a verified Preprod proof, and a server-graded operating assessment. The proof record contains a Cardano transaction hash and registered test service identifier only. It never accepts wallet addresses, seed phrases, signing keys, OAuth material, private job input, or result content. Verification can be performed by a server-to-server adapter or by an explicitly authorized reviewer; a learner cannot approve their own submission.

Session idle expiry is sliding while a learner is active. The browser calls the authenticated session refresh route after protected Learn navigation; the server extends the same hash-backed opaque token only until its separately stored absolute expiry, which is capped at 30 days from login. Login always creates a new token and logout/account deletion invalidates it.

The operational threat model, privacy boundary, recovery/revocation procedures, monitoring ownership, and launch checklist live in `docs/MASUMI_LEARN_SECURITY.md`.

The versioned on-chain metadata contract is published as JSON Schema at `https://www.masumi.network/learn/credentials/v1`. It permits only the opaque credential ID, credential/course type and version, issuer, score, public verification URL, and metadata hash; it has no learner-identity fields.

## Remaining external decisions

The published Sokosumi contract confirms the authorization, user-info, revocation, end-session, PKCE, and stable `sub` boundaries used here. Live probing established two implementation differences from the generated schema: manually created clients accept `openid` but not `profile email`, and the token endpoint requires form encoding rather than JSON. Production smoke testing must still confirm the logout experience for the registered client. Masumi engineering must approve the Cardano credential representation, issuer custody, minting network, and transaction cost owner. Production persists the SQLite database on the existing Railway `masumi-volume`; moving to a managed database remains an option if operational requirements outgrow single-service SQLite.

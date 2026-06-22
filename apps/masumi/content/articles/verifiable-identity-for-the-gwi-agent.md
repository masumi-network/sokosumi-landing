---
title: "Case Study: A Verifiable Identity for the GWI Agent"
description: "How the GWI Spark agent got a portable, cryptographically verifiable identity with the Masumi Identity SDK — so other agents can prove who they are talking to before trusting its data, without anyone touching KERI internals."
date: "2026-06-22"
author: "Masumi Team"
---

When the GWI Spark agent answers a question on Sokosumi, the insight it returns is grounded in real audience data. But in a multi-agent workflow, the agent that *receives* that insight has a harder question to answer first: is this really GWI Spark, or something pretending to be it?

We integrated the [Masumi Identity SDK](https://docs.masumi.network) into the GWI Spark agent to settle that question cryptographically. The agent now carries a portable, verifiable identity that any other agent can check before it trusts a message, pays for a result, or forwards an insight downstream — and the integration never required our team to touch ACDC payloads, SAIDs, OOBIs, or Ed25519 signatures by hand.

This is a short write-up of what we wanted, how we did it, and what changed.

## The agent that needed to prove who it is

GWI Spark is the agent built from the Serviceplan Group and GWI partnership. It lets users ask natural-language questions and get back summarized insights grounded in GWI's audience data, available directly on Sokosumi and as a subcontracted service inside larger AI systems.

That second mode is where identity stops being optional. In an Agent-2-Agent (A2A) orchestration, GWI Spark is one specialist in a chain of agents working autonomously. A coordinating agent might pay for an insight, pass it to a strategy agent, and act on the result. Every hop in that chain inherits the trust of the hop before it. If a downstream agent can't verify that the data genuinely came from GWI Spark, the whole chain is built on an assumption.

The data is valuable and decisions ride on it — exactly the situation where "trust me, I'm GWI Spark" is not good enough.

## What we wanted

We set four requirements before writing any code:

- **Decentralized, user-owned identity** — not a row in our database that we could silently change. The agent's identity should be controlled by a keypair the operator holds.
- **A credential, not a claim** — something a verifier can check on its own, that says "this identifier is a verified Masumi agent."
- **Live verification on both axes** — a counterparty should be able to confirm the agent *controls its identifier right now* (signature) and that its *credential is still valid* (issued, not revoked, not expired).
- **Almost no cryptography for the team** — our engineers know the agent domain, not key-event logs. The trust layer had to feel like calling an API.

## The SDK, in one paragraph

The Masumi Identity SDK wraps Masumi's already-running credential infrastructure into a single typed class, `MasumiIdentity`, with ten methods that fall into three families: agent-to-identity linking, verifiable credentials, and signature verification. Under the hood it talks to two public Masumi services — the credential server (issues and manages credentials, resolves introductions, tracks revocation) and KERIA (resolves the current public key for any identifier so signatures can be checked against live key state). For production it is zero-config; the canonical endpoints are built in.

In KERI terms, an agent's identity is an **AID** (Autonomous Identifier) — a self-certifying ID derived from a keypair, controlled by a [Veridian wallet](https://github.com/masumi-network/masumi-veridian-wallet) rather than a registry. Everything below is built on that one idea.

## How we integrated it

### 1. Link the agent to an AID

First we bound GWI Spark to an AID held in a Veridian wallet. The SDK exposes the credential server's introduction (its OOBI) so the wallet can connect, then confirms the link:

```ts
import { MasumiIdentity } from "@masumi/identity";

const identity = new MasumiIdentity(); // canonical Masumi endpoints by default

// Share the issuer's introduction with the agent's wallet.
const issuerOobi = await identity.getIssuerOobi();

// Resolve the wallet's introduction so the server can reach its AID.
await identity.connectToAid(walletOobi);

// Confirm the link before doing anything else.
const linked = await identity.isAidConnected(gwiSparkAid);
```

After this, the agent's identity is decentralized and operator-owned — we don't mint it, and we can't quietly rotate it.

### 2. Issue the verification credential

With the AID connected, we requested a verification credential against the appropriate schema. The credential server builds the ACDC; we only describe what we want issued:

```ts
const credential = await identity.issueCredential({
  aid: gwiSparkAid,
  schemaSaid: AGENT_VERIFICATION_SCHEMA,
  attributes: { name: "GWI Spark", provider: "GWI" },
});
```

The returned credential is a normal, typed object. Its own SAID (`credential.sad.d`) doubles as a stable, verifiable ID, and its `status` field tells you whether it is issued or revoked. We never assembled the cryptographic envelope ourselves.

### 3. Prove identity inside the A2A flow

This is the part that matters at runtime. When GWI Spark participates in an A2A exchange, the counterparty runs two independent checks:

```
┌──────────────┐   signed message + VC   ┌──────────────┐
│  GWI Spark   │ ──────────────────────▶ │  Counterparty │
│  agent       │                         │  agent        │
└──────────────┘                         └──────┬───────┘
                                                │ verifyAidSignature  → controls the AID now?
                                                │ validateCredential  → issued, not revoked, not expired?
                                                ▼
                                              ✓ or ✗
```

In code, on the receiving side:

```ts
// Does the sender control the AID it claims, right now?
const ok = await identity.verifyAidSignature({
  aid: gwiSparkAid,
  message,
  signature,
});

// Is the presented credential genuinely valid?
const result = await identity.validateCredential(presentedCredential);
// → checks issuance, revocation, and expiration
```

`verifyAidSignature` fetches the agent's current key state from KERIA and validates the Ed25519 signature against it, so a stale or rotated key fails closed. `validateCredential` confirms the credential is issued, not revoked, and not expired — and the verifier can additionally check that the issuer AID and schema SAID are the ones it expects. Together they answer "is this really the Masumi-verified GWI Spark agent?" without trusting any intermediary.

For convenience the SDK also gave us `getCredentialsForAid` to list what an AID holds, `findCredentialBySchema` to pick the right one, and `formatCredential` to render it for logs and UIs.

## What changed for the GWI agent

The integration was small — a handful of typed calls — but it moved GWI Spark from "trusted by convention" to "verifiable by anyone":

- **It can prove itself in any A2A hop.** Counterparties no longer assume the source of an insight; they verify it.
- **Verification is live, not cached.** Signature checks run against current key state, so key rotation or compromise is caught.
- **Validity is explicit.** A credential that is revoked or expired fails validation the moment it's presented.
- **No bespoke cryptography shipped.** No ACDC handling, no SAID arithmetic, no signature plumbing in our codebase — just the SDK surface.
- **The identity is portable and user-owned.** It lives in a Veridian wallet and travels with the agent across deployments and marketplaces.

## Why this matters beyond GWI

GWI Spark is a useful proof point precisely because it is unremarkable to integrate. The same three steps — link an AID, hold a credential, verify in A2A — apply to any specialist agent that other agents pay or depend on: a data provider, a model wrapper, a workflow orchestrator. As agents increasingly subcontract to one another, a shared, checkable answer to "who am I actually talking to?" is the difference between a network and a guess.

That trust layer already runs in production behind the [Masumi SaaS](https://app.masumi.network) and the Veridian wallet. The SDK just makes it a few function calls away.

## Try it

- **[Masumi Identity SDK — Get started](https://docs.masumi.network)** — install it and make your first live call in a few minutes.
- **[GWI Spark on Sokosumi](https://sokosumi.com)** — the agent this case study is about.
- **[Masumi Veridian Wallet](https://github.com/masumi-network/masumi-veridian-wallet)** — the wallet that holds the AID.

If you're building an agent that other agents will rely on, identity is the first thing worth getting right — and it no longer requires a cryptographer to do it.

# Masumi Learn content destination matrix

This file is the checked-in destination audit for the current `apps/dev/content/masumi/core-concepts` inventory. Every row uses one of the planning vocabulary classifications: **Learn**, **Docs**, **Both**, **Update**, or **Remove**. It separates assessed course material, optional Learn Library material, and canonical implementation/reference documentation. “Both” means the stable mental model is adapted for Learn while commands, schemas, live values, states, and troubleshooting remain in Docs; it does not authorize duplicated long-form copy. “Update” means the existing page stays temporarily as a transition surface while the long-term destination is established.

Last inventory check: 2026-07-20. Content owner: Developer Relations. Accuracy reviewers: Protocol Engineering for protocol/payment claims, Product for path/certification policy, and Security/Privacy for custody or responsible-deployment content.

| Current Core Concepts page | Classification | Assessed course use | Optional Learn Library use | Canonical Docs responsibility |
| --- | --- | --- | --- | --- |
| `index` | Update | Unit 0 and syllabus entry | `/learn/concepts` index | Preserve current entry as a Learn-linked transition until redirect is separately approved |
| `agentic-service` | Both | Unit 1 definition, roles, offer boundary | Examples and service-boundary explainer | API contract, endpoint requirements, registry/API links |
| `agent-to-agent-payments` | Both | Units 1–2 motivation and high-level flow | Autonomous exchange deep dive | Integration and protocol specifics |
| `blockchain` | Both | Unit 3 shared ledger rationale | Why blockchain/Cardano deep dive | Implementation requirements and current network details |
| `utxo` | Both | Unit 3 transaction mental model | eUTXO/envelope explainer | Minimum-UTXO, parameters, top-up behavior, troubleshooting |
| `tokens` | Both | Unit 3 ADA vs service-priced asset roles | Token/value explainer | Supported assets, policy IDs, network-specific values |
| `wallets` | Both | Unit 3 wallet-role and custody concepts | Security/custody explainer | Funding, dashboard, seed export, environment variables |
| `smart-contracts` | Both | Units 3–4 deterministic escrow/registry role | Architecture explainer | Contract addresses, schemas, and specifications |
| `identity` | Both | Unit 4 continuity and trust context | Identity roadmap distinctions | Identifier formats, lookup, NFT/API implementation |
| `registry` | Both | Units 2 and 4 discovery/metadata role | Registry design explainer | Register/query/deregister procedures and metadata schema |
| `payments` | Both | Units 2 and 4 lifecycle/escrow mental model | Payment-state walkthrough | Buyer/seller calls, polling, exact state and endpoint reference |
| `decision-logging` | Both | Unit 4 evidence/accountability | Worked evidence examples | Hashing contract, fields, endpoints, troubleshooting |
| `refunds-and-disputes` | Both | Unit 4 scenario reasoning | Optional case studies | Exact states, endpoints, timing, and escalation mechanics |
| `environments` | Both | Builder introduction to Preprod safety | Test-vs-production explainer | URLs, faucets, deployment configuration, live values |
| `transaction-fees` | Both | Unit 6 pricing/operations concept | Cost-model explainer | Current percentages, costs, and configuration values |
| `regulatory-compliance` | Both | Not assessed; Unit 6 awareness only | Responsible-deployment resource with “not legal advice” | Maintained official links, owner, and review date |
| `x402` | Both | Not currently certificate-gating | Direct HTTP payment vs escrow guarantee comparison | Exact scheme, headers, payloads, supported networks/assets, integration |

The inventory contains 17 pages including `index`; all 17 have a destination above. The optional concept library implements every non-index explainer. New Core Concepts pages must update this matrix and the Learn Library decision in the same change.

## Duplication and claim-review findings

| Source-content risk | Current Learn treatment | Remaining authority |
| --- | --- | --- |
| Cardano advocacy phrased as uniqueness or universal superiority | Rewritten as Masumi’s current architectural choice and a shared-settlement rationale | Protocol Engineering must approve production copy changes |
| Layer 2, governance, DID/VC, or community-dispute roadmap language | Excluded from assessed claims; current service identity is not presented as a DID/VC | Product and Protocol Engineering own roadmap publication |
| Token names, policy IDs, fees, minimum UTXO values, and network URLs | Explained only as roles; never quiz answers | Current values stay in maintained Docs |
| Identity NFT, persistent service identity, and future identity mechanisms | Separated into current continuity/registry concepts and non-assessed future context | Identity formats and implementation stay in Docs/MIPs |
| Payment, decision-log, refund, and dispute procedures | Learn retains only the stable state/evidence mental model | Exact states, time windows, endpoints, and escalation remain in Docs and require protocol review |
| Regulatory language | Non-assessed, explicitly not legal advice, visibly review-dated, and owned by Developer Relations with Security/Privacy review | Qualified legal/compliance owners decide real deployment requirements |
| Long-form concepts duplicated between Learn and Docs | Learn copy is concise and independently written; lesson and Library handoffs point to canonical Docs | Core Concepts index remains a transitional surface until redirect approval |

## Material outside Core Concepts

| Material | Destination |
| --- | --- |
| Documentation introduction / What is Masumi? | Product story and ecosystem orientation in Learn; task choices and implementation entry points in Docs |
| Sumi ecosystem overview | Optional `/learn/concepts/sumi-ecosystem` explainer and path selection; product-specific task reference remains in each product’s Docs |
| MIPs introduction | Optional “How Masumi evolves” deep dive; proposal status and specifications remain canonical Docs at `/dev/masumi/mips` |
| Configure agent pricing | Unit 6 mental model plus canonical Docs how-to/live values |
| Human in the loop | Optional Learn Pattern plus canonical implementation guide |
| Agent collaboration | Optional Learn Pattern plus canonical implementation guide |
| Agent state persistence | Optional Learn Pattern plus canonical configuration guide |
| Agent identity NFT and registry metadata standard | Simplified identity/metadata concepts in Learn; full specification in Docs |
| Smart-contract technical pages | Docs only, linked from optional Learn explanations |
| n8n, Masumi Skills, installation, API, hosting, PostgreSQL, wallet export, troubleshooting | Docs only; used as maintained Builder project pathways |

## Migration rules

- Course questions test stable mental models, Preprod safety, and operating judgment—not routes, payloads, environment variables, policy IDs, current fees, commands, roadmap promises, or legal conclusions.
- Learn Library content is optional and never changes certificate progress.
- Protocol, token, roadmap, x402, or responsible-deployment claims carry a last-reviewed date in Learn.
- Old public Docs URLs remain available until an explicit redirect or transitional-summary review is complete.
- Every assessed lesson links to **Next: read**, **Next: build**, and **Reference** documentation.

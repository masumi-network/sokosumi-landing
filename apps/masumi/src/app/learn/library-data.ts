export type LearnLibraryItem = {
  slug: string;
  title: string;
  summary: string;
  audience: string;
  takeaways: string[];
  sections: Array<{ title: string; body: string }>;
  docsHref: string;
  lastReviewed: string;
};

export const LEARN_LIBRARY_LAST_REVIEWED = "2026-07-20";
const docs = "https://www.masumi.network/dev/masumi";

export const concepts: LearnLibraryItem[] = [
  item("sumi-ecosystem", "The Sumi ecosystem", "Where Masumi and Sokosumi sit in the journey from service execution to exchange.", "Everyone", ["Masumi coordinates portable payments and identity; Sokosumi helps people discover and access services.", "Neither replaces the service’s own product logic or the runtime it is operated on."], "Two complementary layers", "Masumi is the foundational protocol for agent payments and identity. Sokosumi is a marketplace experience for discovering and accessing agentic services. A product can use both layers together, but each has a separate responsibility and its own implementation documentation.", `${docs}/documentation`),
  item("agentic-service", "Agentic service", "A dependable offer wrapped around one or more agents.", "Builders and product teams", ["An agent decides how to work; a service defines how others consume that work.", "Inputs, outputs, terms, and a stable identity make a capability discoverable."], "A service boundary", "An AI agent can reason or act, but another participant needs a clear contract before it can depend on that capability. An agentic service supplies that boundary: what it accepts, what it returns, who operates it, and under which terms.", `${docs}/core-concepts/agentic-service`),
  item("agent-to-agent-payments", "Agent-to-agent payments", "How software participants can buy and sell work without a human completing each checkout.", "Builders and business teams", ["Autonomous demand needs machine-readable offers and settlement.", "Discovery, identity, payment, and accountability remain separate concerns."], "Autonomous exchange", "A buying agent must be able to inspect an offer, authorize payment, receive a result, and decide what to do next. Separating those stages makes the interaction inspectable and lets services move across interfaces and marketplaces.", `${docs}/core-concepts/agent-to-agent-payments`),
  item("blockchain", "Why blockchain and Cardano?", "A shared settlement and evidence layer for participants that do not share one operator.", "Product teams and builders", ["The ledger coordinates value and durable state; it does not run the AI workload.", "Cardano is Masumi’s current settlement environment, not a prerequisite for understanding agents."], "The job of the ledger", "Masumi uses a shared ledger where independently operated services need deterministic transaction rules and evidence that one marketplace does not exclusively control. The agent’s private inputs, reasoning, and outputs do not need to be placed on-chain.", `${docs}/core-concepts/blockchain`),
  item("utxo", "UTXO and eUTXO", "A mental model for transactions that consume complete inputs and create new outputs.", "Builders", ["Value is not edited in place.", "Smart-contract conditions can govern which new transaction is valid."], "The envelope model", "Think of each unspent output as a sealed envelope containing value and conditions. A transaction opens eligible envelopes completely and creates a new set. This explains why wallets may need change outputs and why funding details live in operational docs.", `${docs}/core-concepts/utxo`),
  item("tokens", "Tokens and network value", "The distinct jobs of service-pricing assets and ADA network fees.", "Builders and operators", ["A service price and the network fee may use different assets.", "Current assets, policy IDs, and amounts belong in maintained documentation."], "Two cost layers", "A buyer pays for the service under its offer. Cardano transactions also need network resources, commonly paid in ADA. The exact supported assets and amounts can change, so Learn teaches the distinction and Docs owns live values.", `${docs}/core-concepts/tokens`),
  item("wallets", "The wallet roles", "Why a Masumi operation separates payment, purchasing, and collection responsibilities.", "Builders and operators", ["Separate responsibilities reduce accidental key and fund exposure.", "Seed phrases and signing keys never belong in course progress or public credentials."], "Operational separation", "Different wallet roles let an operator isolate network and service flows. This is an operational control, not a claim that the wallet itself establishes service trust. Funding and custody instructions remain in Docs.", `${docs}/core-concepts/wallets`),
  item("smart-contracts", "Smart contracts", "Deterministic rules for registry and payment state changes.", "Technical product teams", ["Contracts enforce allowed transitions, not subjective result quality.", "Masumi separates registry and payment responsibilities."], "Rules, not judgment", "A smart contract can verify that a transaction satisfies declared conditions. It cannot decide whether a creative or subjective result is good. Masumi combines deterministic state with off-chain service behavior and accountable evidence.", `${docs}/core-concepts/smart-contracts`),
  item("identity", "Service identity", "A persistent reference that lets metadata and history point to the same service.", "Everyone", ["Identity supports discovery and reputation context but does not guarantee quality.", "Current on-chain identity and future identity work must not be conflated."], "Continuity", "A stable service identifier lets participants find the same registered offer over time and evaluate its metadata. It is one input to trust, alongside the operator, result evidence, and transaction history.", `${docs}/core-concepts/identity`),
  item("registry", "Registry", "The discoverable record of service identity and metadata.", "Builders and marketplaces", ["Registry data describes an offer; the service still runs off-chain.", "Canonical schemas and registration procedures remain in Docs."], "Discovery infrastructure", "A registry entry gives interfaces a common place to find service identity and declared metadata. Marketplaces can present that information differently while referring to the same underlying service.", `${docs}/core-concepts/registry`),
  item("payments", "Payments and escrow", "The stateful path from a buyer’s commitment to settlement or recovery.", "Everyone", ["Escrow locks value under shared release conditions.", "Implementations must inspect current state before choosing an action."], "A controlled lifecycle", "Payment is not one button; it is a sequence of states involving an offer, funding, work, result evidence, and settlement. Exceptional paths such as refund or dispute depend on that state and its timing rules.", `${docs}/core-concepts/payments`),
  item("decision-logging", "Decision logging", "Comparable evidence about what a participant decided and produced.", "Builders and trust teams", ["Hashes can anchor evidence without publishing the underlying private result.", "A log improves accountability but cannot prove subjective correctness by itself."], "Evidence without disclosure", "Participants can record hashes and structured decision facts so later checks compare the same artifact. Sensitive inputs and results remain off-chain unless a product deliberately chooses otherwise.", `${docs}/core-concepts/decision-logging`),
  item("refunds-and-disputes", "Refunds and disputes", "How a transaction leaves the normal success path without guessing at actions.", "Operators and support teams", ["Start with the payment’s current state and documented timing window.", "Do not treat roadmap dispute mechanisms as present behavior."], "State before action", "A recovery action is valid only in particular states and windows. Learn teaches how to reason about the path; Docs remains authoritative for endpoints, exact states, timing, and escalation mechanics.", `${docs}/core-concepts/refunds-and-disputes`),
  item("environments", "Preprod and Mainnet", "Why testing and production are intentionally separate environments.", "Builders and operators", ["Preprod is the safe place to learn the full flow with test assets.", "A successful test is evidence, not permission to reuse test keys or assumptions in production."], "Practice before value", "Preprod lets a builder exercise registration and payment flows without real production assets. Moving to Mainnet requires new configuration, funded operational wallets, custody controls, and a deliberate launch review.", `${docs}/core-concepts/environments`),
  item("transaction-fees", "Fees and pricing", "How service price, Masumi charges, and network costs affect an offer.", "Operators and product teams", ["Price must cover the full operating model and realistic failure paths.", "Live fee values are reference data and are not assessment questions."], "Price the system", "An operator should account for model and infrastructure cost, support, retries, marketplace expectations, protocol charges, and network transactions. Learn provides the model; Docs owns current percentages and amounts.", `${docs}/core-concepts/transaction-fees`),
  item("regulatory-compliance", "Responsible deployment", "A non-assessed framework for ownership, privacy, safety, and jurisdiction-aware review.", "Operators and product teams", ["This material is operational awareness, not legal advice.", "Named owners and current official sources are required for real deployment decisions."], "Accountability is operational", "A production service needs clear responsibility for data, claims, wallet custody, incidents, and applicable rules. Requirements vary by use case and jurisdiction, so teams should obtain qualified advice rather than treating a course as a legal conclusion.", `${docs}/core-concepts/regulatory-compliance`),
  item("x402", "x402 direct HTTP payments", "A direct request/payment pattern and how its guarantees differ from the Masumi escrow lifecycle.", "API builders and product teams", ["Direct settlement and escrow solve different risk and recovery needs.", "Choose from the guarantees a job requires, not only integration size."], "Direct versus escrow", "An x402-style flow lets an HTTP resource describe payment requirements and lets a client retry with payment proof. A direct settled transfer does not automatically provide the refund, decision-log, or dispute path of Masumi escrow, so low-risk calls and delivery-dependent jobs may need different payment shapes.", `${docs}/core-concepts/x402`),
];

function item(slug: string, title: string, summary: string, audience: string, takeaways: string[], sectionTitle: string, body: string, docsHref: string): LearnLibraryItem {
  return { slug, title, summary, audience, takeaways, sections: [{ title: sectionTitle, body }], docsHref, lastReviewed: LEARN_LIBRARY_LAST_REVIEWED };
}

export const glossary = [
  ["Accountability", "Evidence and process that make actions inspectable when an outcome is questioned."],
  ["ADA", "Cardano’s native asset, commonly needed for network transaction costs."],
  ["Agent", "Software that can choose and perform actions toward a goal."],
  ["Agentic service", "A consumable offer with defined inputs, work, outputs, identity, and terms."],
  ["Buyer", "A person, application, or service that requests and pays for work."],
  ["Credential", "A server-issued record that attests to completion under a versioned course policy."],
  ["Decision log", "Structured evidence, often including hashes, about a participant’s result or decision."],
  ["Discovery", "The process of finding available services and inspecting their offers."],
  ["Escrow", "Value locked under shared release or recovery conditions."],
  ["Hash", "A fixed-size fingerprint used to compare data without necessarily publishing that data."],
  ["Mainnet", "The production Cardano network where assets and transactions have real operational consequences."],
  ["Masumi Node", "The service layer an integration uses to participate in Masumi registration and payment flows."],
  ["Metadata", "Structured facts describing a service or credential under a defined schema."],
  ["Preprod", "A Cardano test environment for exercising production-like flows with test assets."],
  ["Registry", "The shared record of service identity and declared metadata."],
  ["Seller", "The operator responsible for providing the offered service and result."],
  ["Settlement", "The valid release or final movement of value after transaction conditions are met."],
  ["Sokosumi", "A marketplace experience for discovering and using agentic services in the Masumi ecosystem."],
  ["Stablecoin", "A token designed to track a reference value; current supported assets belong in Docs."],
  ["UTXO", "An unspent transaction output that can be consumed as a complete input to a later transaction."],
] as const;

export const deepDives = [
  { title: "Protocol and marketplace", summary: "Place Masumi and Sokosumi at their distinct layers without treating the ecosystem as one monolithic product.", concepts: ["sumi-ecosystem", "agentic-service", "registry"] },
  { title: "Why a shared settlement layer?", summary: "Compare marketplace-owned balances with portable protocol settlement.", concepts: ["blockchain", "agent-to-agent-payments", "payments"] },
  { title: "One payment through eUTXO", summary: "Follow inputs, outputs, escrow conditions, result evidence, and settlement as one coherent example.", concepts: ["utxo", "wallets", "smart-contracts"] },
  { title: "Identity is not a quality guarantee", summary: "Separate continuity, metadata, reputation context, credentials, and subjective trust.", concepts: ["identity", "registry", "decision-logging"] },
  { title: "From Preprod evidence to production readiness", summary: "Understand what a successful test proves—and which custody, reliability, and compliance controls it does not.", concepts: ["environments", "transaction-fees", "regulatory-compliance"] },
  { title: "How Masumi evolves", summary: "Use Learn for the proposal-process mental model, then read MIPs in canonical Docs for proposal status and specification details.", concepts: ["identity", "registry", "decision-logging"] },
] as const;

export const patterns = [
  { title: "Human review at the right boundary", summary: "Add review where consequence or ambiguity justifies it, while keeping routine machine steps deterministic.", docsHref: `${docs}/documentation/how-to-guides/human-in-the-loop` },
  { title: "Agent collaboration without shared internals", summary: "Let services exchange defined requests and results without forcing the same model or framework.", docsHref: `${docs}/documentation/how-to-guides/how-to-enable-agent-collaboration` },
  { title: "Persistent state with an explicit owner", summary: "Choose what the service, Masumi integration, and user account each own and can recover.", docsHref: `${docs}/documentation/technical-documentation/agent-state-persistence` },
  { title: "Price for the full lifecycle", summary: "Include compute, retries, support, settlement, and realistic completion windows—not only the happy-path model call.", docsHref: `${docs}/core-concepts/transaction-fees` },
] as const;

export function getConcept(slug: string) { return concepts.find((concept) => concept.slug === slug); }

function validateLibraryData() {
  const slugs = new Set<string>();
  for (const concept of concepts) {
    if (slugs.has(concept.slug)) throw new Error(`Duplicate Learn concept slug: ${concept.slug}`);
    if (!concept.docsHref.startsWith("https://www.masumi.network/dev/masumi/")) throw new Error(`Concept ${concept.slug} has a non-canonical Docs link`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(concept.lastReviewed)) throw new Error(`Concept ${concept.slug} has an invalid review date`);
    slugs.add(concept.slug);
  }
  for (const dive of deepDives) for (const slug of dive.concepts) if (!slugs.has(slug)) throw new Error(`Deep dive references unknown concept: ${slug}`);
  for (const pattern of patterns) if (!pattern.docsHref.startsWith("https://www.masumi.network/dev/masumi/")) throw new Error(`Pattern ${pattern.title} has a non-canonical Docs link`);
}

validateLibraryData();

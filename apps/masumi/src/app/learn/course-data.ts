export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type LearnUnit = {
  slug: string;
  number: number;
  title: string;
  summary: string;
  duration: string;
  lastReviewed: string;
  accuracyReviewer: string;
  objectives: string[];
  sections: { title: string; paragraphs: string[] }[];
  checkpoint: string;
  quiz: QuizQuestion[];
  readHref: string;
  buildHref: string;
  referenceHref: string;
};

export const PASSING_SCORE = 75;

export const units: LearnUnit[] = [
  {
    slug: "agentic-economy",
    number: 1,
    title: "The agentic economy",
    summary: "Meet the people, agents, services, and marketplaces that exchange work.",
    duration: "12 min",
    lastReviewed: "2026-07-20",
    accuracyReviewer: "Masumi Product",
    objectives: [
      "Distinguish an AI agent from an agentic service",
      "Identify buyer, seller, service, and marketplace roles",
      "Explain why discovery, identity, payment, and accountability are separate problems",
    ],
    sections: [
      {
        title: "From agent to service",
        paragraphs: [
          "An AI agent decides how to complete a task. An agentic service wraps one or more agents in a dependable offer: it defines an input, performs work, returns an output, and can state a price.",
          "A buyer can be a person, an application, or another agentic service. A seller operates the service. A marketplace helps buyers discover offers, but it does not have to own the identity or payment infrastructure behind them.",
        ],
      },
      {
        title: "Four jobs, not one",
        paragraphs: [
          "Discovery answers “what services exist?” Identity answers “which service is this?” Payment answers “how does value move?” Accountability answers “what evidence exists if something goes wrong?”",
          "Masumi connects these concerns without forcing every service to use the same language, model, or agent framework. Sokosumi is one place where people can discover and use services built on that network.",
        ],
      },
    ],
    checkpoint: "A marketplace can improve discovery, while Masumi supplies portable identity, payment, and accountability primitives underneath it.",
    readHref: "https://www.masumi.network/dev/masumi/core-concepts/agentic-service",
    buildHref: "https://www.masumi.network/dev/masumi/documentation/get-started/install-masumi-node",
    referenceHref: "https://www.masumi.network/dev/masumi/core-concepts/agent-to-agent-payments",
    quiz: [
      { id: "u1q1", prompt: "What turns an AI agent into an agentic service?", options: ["A social profile", "A defined offer with inputs, work, outputs, and terms", "A specific language", "A human buyer"], answer: 1, explanation: "A service makes an agent’s capability consumable through a defined offer." },
      { id: "u1q2", prompt: "Who can buy an agentic service?", options: ["Only people", "Only marketplaces", "People, applications, or other services", "Only the service operator"], answer: 2, explanation: "Masumi supports both human-to-agent and agent-to-agent demand." },
      { id: "u1q3", prompt: "Which concern answers “which service is this?”", options: ["Discovery", "Identity", "Payment", "Pricing"], answer: 1, explanation: "Persistent identity lets participants refer to and evaluate the same service." },
      { id: "u1q4", prompt: "Why separate discovery from payment?", options: ["They always use different blockchains", "A service can be discovered in one place and settled through portable infrastructure", "Discovery is legally required", "Payments cannot include metadata"], answer: 1, explanation: "Separating concerns avoids locking services to one marketplace or interface." },
    ],
  },
  {
    slug: "masumi-fundamentals",
    number: 2,
    title: "Masumi fundamentals",
    summary: "Follow one job from discovery through delivery and settlement.",
    duration: "15 min",
    lastReviewed: "2026-07-20",
    accuracyReviewer: "Protocol Engineering",
    objectives: ["Describe the roles of Masumi, Masumi Node, Registry, and Sokosumi", "Order the high-level lifecycle of a paid job", "Explain what remains framework-agnostic"],
    sections: [
      {
        title: "The ecosystem",
        paragraphs: [
          "Masumi is the protocol for registering services, coordinating payments, and recording accountable outcomes. A Masumi Node exposes the services an integration uses to participate in that protocol.",
          "The Registry publishes service identity and metadata. Sokosumi is a marketplace experience where buyers can find and hire services. Your agent implementation remains yours: Masumi does not prescribe its model or orchestration framework.",
        ],
      },
      {
        title: "A job in six moves",
        paragraphs: [
          "1. Discover a registered service. 2. Read its offer and payment terms. 3. Create and fund a payment. 4. The seller performs the job. 5. Result evidence is recorded. 6. Funds settle or follow the refund/dispute path.",
          "Each step produces a clearer boundary between what the buyer requested, what the seller promised, and what the network can verify. The content of the work may remain private while hashes and state changes provide shared evidence.",
        ],
      },
    ],
    checkpoint: "Masumi coordinates the transaction; the service’s own agent stack still decides how the work is done.",
    readHref: "https://www.masumi.network/dev/masumi/documentation",
    buildHref: "https://www.masumi.network/dev/masumi/documentation/get-started/install-masumi-node",
    referenceHref: "https://www.masumi.network/dev/masumi/core-concepts/payments",
    quiz: [
      { id: "u2q1", prompt: "What is the Registry’s main role?", options: ["Run the AI model", "Publish service identity and metadata", "Design marketplace pages", "Hold every result"], answer: 1, explanation: "Registry entries make services discoverable and give their identity stable metadata." },
      { id: "u2q2", prompt: "What does Sokosumi provide in this lifecycle?", options: ["The Cardano consensus layer", "A marketplace for finding and hiring services", "The seller’s private model", "A replacement for Masumi Node"], answer: 1, explanation: "Sokosumi is a marketplace experience built on the Masumi ecosystem." },
      { id: "u2q3", prompt: "Which happens before settlement?", options: ["Result delivery and evidence", "Deleting the registry", "Choosing an AI framework", "Publishing a legal opinion"], answer: 0, explanation: "The job must be completed and the result path recorded before normal settlement." },
      { id: "u2q4", prompt: "What agent framework does Masumi require?", options: ["LangGraph", "CrewAI", "n8n", "None; the protocol is framework-agnostic"], answer: 3, explanation: "Integrations can use the framework and language that fit their service." },
    ],
  },
  {
    slug: "blockchain-basics",
    number: 3,
    title: "Blockchain without the burden",
    summary: "Understand Cardano, UTXOs, wallets, tokens, fees, and contracts through one payment.",
    duration: "18 min",
    lastReviewed: "2026-07-20",
    accuracyReviewer: "Protocol Engineering",
    objectives: ["Explain why a shared settlement layer is useful", "Use a simple UTXO mental model", "Separate ADA, payment assets, wallets, fees, and smart contracts"],
    sections: [
      {
        title: "Why a shared ledger?",
        paragraphs: [
          "A buyer and seller may not know or trust each other. Cardano gives them a shared record and deterministic rules without asking one marketplace to be the final owner of every transaction.",
          "Masumi uses Cardano because its eUTXO model supports explicit transaction inputs and outputs, native assets, and predictable contract interactions. This is an architectural choice—not a claim that every application needs a blockchain.",
        ],
      },
      {
        title: "A payment as labeled envelopes",
        paragraphs: [
          "Think of UTXOs as sealed envelopes of value. A transaction consumes complete envelopes and creates new ones for the recipient and any change. The wallet manages keys and assembles those transactions.",
          "ADA pays Cardano network costs. A supported stablecoin can express the service price. Smart contracts apply shared conditions to locked value. Exact fees, supported assets, and minimum amounts are live operational details—always look them up in Docs.",
        ],
      },
    ],
    checkpoint: "The stablecoin can price the job, ADA can pay network costs, and the contract can control when locked value moves.",
    readHref: "https://www.masumi.network/dev/masumi/core-concepts/blockchain",
    buildHref: "https://www.masumi.network/dev/masumi/documentation/how-to-guides/top-up-your-wallets",
    referenceHref: "https://www.masumi.network/dev/masumi/core-concepts/utxo",
    quiz: [
      { id: "u3q1", prompt: "What does the shared ledger contribute?", options: ["A mandatory AI model", "A common record and deterministic transaction rules", "Free transactions", "A marketplace UI"], answer: 1, explanation: "Participants can coordinate around shared state without one marketplace owning the record." },
      { id: "u3q2", prompt: "In the envelope analogy, what does a transaction do?", options: ["Edits an envelope in place", "Consumes complete inputs and creates new outputs", "Copies value without inputs", "Hides all transaction state"], answer: 1, explanation: "UTXOs are consumed as inputs; new UTXOs are produced as outputs." },
      { id: "u3q3", prompt: "What is ADA commonly needed for in a Masumi payment?", options: ["Naming the service", "Cardano network costs", "Writing the agent prompt", "Passing the quiz"], answer: 1, explanation: "Even when a service is priced in another asset, ADA covers network costs." },
      { id: "u3q4", prompt: "Where should you check current fees and supported assets?", options: ["Memorize this course forever", "The canonical developer documentation", "A past social post", "The service’s model weights"], answer: 1, explanation: "Volatile operational values belong in maintained reference documentation." },
    ],
  },
  {
    slug: "trust-and-payments",
    number: 4,
    title: "Trust and payment lifecycle",
    summary: "Connect identity, registry metadata, escrow, evidence, refunds, and disputes.",
    duration: "18 min",
    lastReviewed: "2026-07-20",
    accuracyReviewer: "Protocol Engineering",
    objectives: ["Connect identity with registry discovery", "Explain escrow and decision logging at a high level", "Choose the right outcome for common payment scenarios"],
    sections: [
      {
        title: "Trust is assembled",
        paragraphs: [
          "Identity makes a service consistently addressable. Registry metadata describes what it offers. Neither alone proves that every future result will be good, but together they let buyers evaluate an offer and connect behavior to a persistent participant.",
          "Decision logging records evidence such as hashes so participants can compare what was committed without publishing private output. It supports accountability; it is not a magical judge of subjective quality.",
        ],
      },
      {
        title: "Escrow and exceptions",
        paragraphs: [
          "Escrow locks payment under shared conditions while work is underway. A successful result follows the normal unlock and settlement path. Time windows protect both sides from funds remaining ambiguous forever.",
          "Refund and dispute paths exist for exceptions. Their exact states, time parameters, and endpoints are implementation details in Docs. The durable mental model is: preserve evidence, observe the current state, and use the action permitted for that state.",
        ],
      },
    ],
    checkpoint: "Escrow reduces counterparty risk, while decision logs and state transitions create evidence for normal and exceptional outcomes.",
    readHref: "https://www.masumi.network/dev/masumi/core-concepts/identity",
    buildHref: "https://www.masumi.network/dev/masumi/documentation/get-started/install-masumi-node",
    referenceHref: "https://www.masumi.network/dev/masumi/core-concepts/refunds-and-disputes",
    quiz: [
      { id: "u4q1", prompt: "What does persistent service identity enable?", options: ["Guaranteed result quality", "Consistent reference and reputation context", "Free network fees", "Automatic legal compliance"], answer: 1, explanation: "Identity links metadata and behavior to the same participant, but does not guarantee quality." },
      { id: "u4q2", prompt: "What is escrow for?", options: ["Training the AI model", "Locking value under shared release conditions", "Replacing the Registry", "Publishing private output"], answer: 1, explanation: "Escrow controls value while buyer and seller complete their parts of the exchange." },
      { id: "u4q3", prompt: "What can a decision log safely record?", options: ["Evidence such as a result hash", "A guaranteed subjective verdict", "Every private input in public", "A new wallet seed"], answer: 0, explanation: "Hashes can provide comparable evidence without exposing the underlying result." },
      { id: "u4q4", prompt: "A payment is outside the normal success path. What should you do first?", options: ["Guess an endpoint", "Check its current state and the documented action allowed for that state", "Publish wallet keys", "Ignore timing windows"], answer: 1, explanation: "Refund and dispute actions depend on the current payment state and timing rules." },
    ],
  },
];

export const finalAssessment: QuizQuestion[] = units.flatMap((unit) => [unit.quiz[1], unit.quiz[2]]);

export function getUnit(slug: string) {
  return units.find((unit) => unit.slug === slug);
}

function validateCourseData() {
  const slugs = new Set<string>();
  const numbers = new Set<number>();
  const questionIds = new Set<string>();
  for (const unit of units) {
    if (slugs.has(unit.slug)) throw new Error(`Duplicate Learn unit slug: ${unit.slug}`);
    if (numbers.has(unit.number)) throw new Error(`Duplicate Learn unit number: ${unit.number}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(unit.lastReviewed)) throw new Error(`Invalid review date for ${unit.slug}`);
    if (unit.objectives.length < 2 || unit.sections.length < 2) throw new Error(`Learn unit ${unit.slug} needs objectives and at least two sections`);
    if (unit.quiz.length < 3 || unit.quiz.length > 5) throw new Error(`Learn unit ${unit.slug} must contain 3–5 quiz questions`);
    for (const href of [unit.readHref, unit.buildHref, unit.referenceHref]) {
      if (!href.startsWith("https://www.masumi.network/dev/masumi/")) throw new Error(`Learn unit ${unit.slug} has a non-canonical Docs link`);
    }
    for (const question of unit.quiz) {
      if (questionIds.has(question.id)) throw new Error(`Duplicate Learn question ID: ${question.id}`);
      if (question.options.length < 3 || question.answer < 0 || question.answer >= question.options.length) throw new Error(`Invalid options/answer for ${question.id}`);
      if (!question.explanation.trim()) throw new Error(`Missing explanation for ${question.id}`);
      questionIds.add(question.id);
    }
    slugs.add(unit.slug);
    numbers.add(unit.number);
  }
  if (PASSING_SCORE < 1 || PASSING_SCORE > 100) throw new Error("Invalid Fundamentals passing score");
  if (new Set(finalAssessment.map((question) => question.id)).size !== finalAssessment.length) throw new Error("Final assessment contains duplicate questions");
  if (!finalAssessment.every((question) => questionIds.has(question.id))) throw new Error("Final assessment contains an unknown question");
}

validateCourseData();

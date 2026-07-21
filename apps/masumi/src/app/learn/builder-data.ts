import type { QuizQuestion } from "./course-data";

export const BUILDER_PASSING_SCORE = 80;

export const builderSteps = [
  { key: "integration_path", unit: 5, title: "Choose a supported integration path", body: "Use the Masumi Skill, n8n, or the API path that best matches your service.", href: "https://www.masumi.network/dev/masumi/documentation/integrations/masumi-skills" },
  { key: "node_started", unit: 5, title: "Start the required service or Masumi Node", body: "Confirm the local or hosted component is healthy before adding wallets or registration.", href: "https://www.masumi.network/dev/masumi/documentation/get-started/install-masumi-node" },
  { key: "wallets_funded", unit: 5, title: "Fund Preprod wallets", body: "Use test assets only. Keep seed phrases, signing keys, and wallet addresses out of Learn progress.", href: "https://www.masumi.network/dev/masumi/documentation/how-to-guides/top-up-your-wallets" },
  { key: "service_registered", unit: 5, title: "Register an agentic service", body: "Publish the service identity and metadata needed for discovery in the test environment.", href: "https://www.masumi.network/dev/masumi/documentation/get-started/register-agent" },
  { key: "payment_executed", unit: 5, title: "Execute one Preprod payment", body: "Run the complete buyer/seller flow and retain only the transaction hash needed for verification.", href: "https://www.masumi.network/dev/masumi/core-concepts/payments" },
  { key: "operating_plan", unit: 6, title: "Review the production operating plan", body: "Set realistic price and completion windows, assign wallet custody and incident owners, and review applicable requirements. This is not legal advice.", href: "https://www.masumi.network/dev/masumi/core-concepts/transaction-fees" },
] as const;

export const builderProofStepKeys = builderSteps.filter((step) => step.unit === 5).map((step) => step.key);

export const builderAssessment: QuizQuestion[] = [
  { id: "bq1", prompt: "What does a successful Preprod transaction prove?", options: ["The service is automatically safe for Mainnet", "The selected test configuration completed a transaction flow", "The wallet keys can be reused in production", "Every future result will be correct"], answer: 1, explanation: "Preprod proves the exercised test flow. Production still needs separate keys, configuration, custody, reliability, and launch review." },
  { id: "bq2", prompt: "Which proof is appropriate for the Builder project?", options: ["A wallet seed phrase", "A private OAuth token", "A Preprod transaction hash tied to the registered test service", "A screenshot containing personal data"], answer: 2, explanation: "The verifier needs a transaction reference and service identifier, never secrets or private learner data." },
  { id: "bq3", prompt: "What should a service price account for?", options: ["Only the model call", "Compute, infrastructure, retries, support, settlement, and realistic failure paths", "A memorized fee from this course", "Only marketplace design"], answer: 1, explanation: "A viable offer covers the whole operating lifecycle; live fees remain in maintained Docs." },
  { id: "bq4", prompt: "Who should control production wallet and issuer keys?", options: ["Any browser that renders the dashboard", "A named operator under approved custody and incident controls", "Every course participant", "The public certificate page"], answer: 1, explanation: "Keys stay in a controlled server or custody boundary with explicit ownership and recovery." },
  { id: "bq5", prompt: "A service frequently misses its declared completion window. What is the right response?", options: ["Hide the failures", "Adjust the offer and reliability controls before scaling", "Move directly to Mainnet", "Publish private inputs as proof"], answer: 1, explanation: "Terms must reflect achievable operation; reliability problems should be fixed or represented honestly." },
];

function validateBuilderData() {
  if (BUILDER_PASSING_SCORE < 1 || BUILDER_PASSING_SCORE > 100) throw new Error("Invalid Builder passing score");
  const stepKeys = new Set<string>();
  for (const step of builderSteps) {
    if (stepKeys.has(step.key)) throw new Error(`Duplicate Builder step: ${step.key}`);
    if (![5, 6].includes(Number(step.unit))) throw new Error(`Invalid Builder unit for ${step.key}`);
    if (!step.href.startsWith("https://www.masumi.network/dev/masumi/")) throw new Error(`Builder step ${step.key} has a non-canonical Docs link`);
    stepKeys.add(step.key);
  }
  if (!builderSteps.some((step) => step.unit === 5) || !builderSteps.some((step) => step.unit === 6)) throw new Error("Builder path must cover Units 5 and 6");
  if (builderAssessment.length < 3 || builderAssessment.length > 5) throw new Error("Builder assessment must contain 3–5 questions");
  const questionIds = new Set<string>();
  for (const question of builderAssessment) {
    if (questionIds.has(question.id)) throw new Error(`Duplicate Builder question ID: ${question.id}`);
    if (question.options.length < 3 || question.answer < 0 || question.answer >= question.options.length || !question.explanation.trim()) throw new Error(`Invalid Builder question: ${question.id}`);
    questionIds.add(question.id);
  }
}

validateBuilderData();

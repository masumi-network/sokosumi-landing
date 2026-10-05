export const SIGNUP_URL = "https://preprod.sokosumi.com/signup";
export const CREDITS_URL = "https://preprod.sokosumi.com/billing?tab=credits";

export const EVENT = {
  organizationId: "01a109d1-32a9-71a3-a0e3-658b2a7987cd",
  workspaceSlug: "token2049-origins-hackathon-2026-nws2r7",
  joinUrl: "https://preprod.sokosumi.com/join/9Ycw8wzmzXB2WEKa-umzUJX6_GEFiVdu",
} as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidId(value: string) { return UUID.test(value); }

export function buildParticipantCommands(coworkerId: string, vendorId: string) {
  if (!UUID.test(coworkerId) || !UUID.test(vendorId)) {
    throw new Error("Enter the full Coworker ID and Vendor ID, including the hyphens.");
  }
  return [
    `sokosumi --preprod auth whoami --json`,
    `sokosumi --preprod coworkers connect ${coworkerId} --vendor-id ${vendorId} --personal --json`,
    `sokosumi --preprod workspaces list --personal --json`,
    `sokosumi --preprod coworkers api-key ${coworkerId} --json | \\
  sokosumi --preprod runtime key-import --coworker-id ${coworkerId} --api-key-stdin`
  ];
}

export function buildEventCommands(coworkerId: string, vendorId: string) {
  buildParticipantCommands(coworkerId, vendorId);
  return [
    `sokosumi --preprod coworkers connect ${coworkerId} --vendor-id ${vendorId} --workspace-id ${EVENT.organizationId} --json`,
    `sokosumi --preprod workspaces check ${EVENT.organizationId} --json`
  ];
}

export function buildAgentPrompt(coworkerId: string, vendorId: string) {
  buildParticipantCommands(coworkerId, vendorId);
  return `Build and test my Sokosumi agent using https://www.masumi.network/token2049/agent-guide.md.
Load the bundled Sokosumi skill with sokosumi skills. Follow dependency order; prepare independent setup work in parallel.

Coworker ID: ${coworkerId}
Vendor ID: ${vendorId}
Event organization ID: ${EVENT.organizationId}
Event Workspace slug: ${EVENT.workspaceSlug}

These IDs already exist. Reuse them and start in my Personal Workspace with --personal.
Tell me to select Personal Workspace in Sokosumi to see my personal Coworker.
Inspect saved state before retrying creation or payment. Do not register again.
Use Vercel eve unless I request another runtime. Build the worker before the execution-only rehearsal.
Prepare local Masumi Payment Service with a dedicated PostgreSQL database, migrations, and seeding as the guide describes.
Keep wallet seeding in my trusted terminal. Save the Coworker runtime key automatically in an ignored .env.local using the guide command.
Give me the actual public Preprod selling wallet address to fund.
Continue independent agent tests while I fund it. Verify balances, then resume with the same wallets and saved IDs.
Then implement masumiPayment with Dynamic pricing: 1 test USDM (1000000 atomic units) per Task.
Verify seller receipt independently. Report payment success only when collection is confirmed.

Never request secrets in chat or print private environment files. I will handle sign-in and wallet seeding in my trusted terminal.
For grant_required, ask me to approve the Vendor grant in Personal Workspace notifications, then retry the same Task.
Do not bypass approval or change my platform role. Ask before creating billed resources.

When ready to share, ask me to join ${EVENT.joinUrl} and request access for this Coworker.
If access is PENDING, keep the Coworker ID and access ID. Wait for approval, then retry connect.
Check the separate runtime Vendor grant before an event Task.

Record completed checkpoints, exact errors, fixes, and Task and transaction evidence.
Keep the deployed agent, worker, and payment node available for later testing.`;
}

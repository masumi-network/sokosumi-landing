export const EVENT = {
  organizationId: "01a109d1-32a9-71a3-a0e3-658b2a7987cd",
  workspaceSlug: "token2049-origins-hackathon-2026-nws2r7",
  joinUrl: "https://preprod.sokosumi.com/join/9Ycw8wzmzXB2WEKa-umzUJX6_GEFiVdu",
} as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function buildParticipantCommands(coworkerId: string, vendorId: string) {
  if (!UUID.test(coworkerId) || !UUID.test(vendorId)) {
    throw new Error("Enter the full Coworker ID and Vendor ID, including the hyphens.");
  }
  return `sokosumi --preprod auth whoami --json
sokosumi --preprod coworkers connect ${coworkerId} --vendor-id ${vendorId} --workspace-id ${EVENT.organizationId} --json
sokosumi --preprod workspaces check ${EVENT.organizationId} --json

# Run this only in your trusted terminal. Do not send the key to your coding agent.
sokosumi --preprod coworkers api-key ${coworkerId} --json | \\
  sokosumi --preprod runtime key-import --coworker-id ${coworkerId} --api-key-stdin`;
}

export function buildAgentPrompt(coworkerId: string, vendorId: string) {
  buildParticipantCommands(coworkerId, vendorId);
  return `Help me connect a small AI agent to Sokosumi. Complete one real Task and verify the seller payment on Cardano Preprod.

Read https://www.masumi.network/token2049/agent-guide.md and run sokosumi skills. Load the bundled sokosumi Skill first.

Coworker ID: ${coworkerId}
Vendor ID: ${vendorId}
Organization ID: ${EVENT.organizationId}
Workspace slug: ${EVENT.workspaceSlug}

Start with my existing agent setup. A two-sentence reply is enough for the first test.
Check existing records before creating new ones. Confirm my Vendor membership role is admin.
A platform admin currently provisions the Coworker. Do not promote my account or change permissions.

The participant will import the Coworker runtime key through secure stdin. Never request secrets in chat, read credential stores, or put keys in logs or Task output.

Use a separate Masumi registration. Configure dynamic pricing with a default of 1 test USDM (1000000 atomic units) per Task. Verify current API schemas before sending requests.

Run the paid flow in this order:
1. Get new signed seller terms for the Task. Keep the signed fields unchanged.
2. Submit masumiPayment through the assigned Coworker. Wait for confirmed escrow funding.
3. Run the agent. Submit the hash of its exact answer to MPS, then complete the Sokosumi Task.
4. Continue monitoring through collection. Check the transaction on chain and verify the intended seller's net test USDM received.

Task completion and PURCHASED do not prove seller payment. Do not report payment success until collection is confirmed.
Write a setup guide with the commands, exact errors, and steps that resolved each problem.
Keep created IDs. Inspect state before retrying any write whose outcome is uncertain.

Start with account and Workspace checks. Ask for the Task ID and missing payment configuration when needed.`;
}

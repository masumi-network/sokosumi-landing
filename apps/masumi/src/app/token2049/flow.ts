export const SIGNUP_URL = "https://preprod.sokosumi.com/signup";
export const CREDITS_URL = "https://preprod.sokosumi.com/billing?tab=credits";

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
sokosumi --preprod coworkers connect ${coworkerId} --vendor-id ${vendorId} --personal --json
sokosumi --preprod workspaces list --personal --json
# Switch to Personal Workspace in Web before topping up credits.
# Use Stripe test mode only. Check your credit balance before creating a Task.

# Run this only in your trusted terminal. Do not send the key to your coding agent.
sokosumi --preprod coworkers api-key ${coworkerId} --json | \\
  sokosumi --preprod runtime key-import --coworker-id ${coworkerId} --api-key-stdin`;
}

export function buildEventCommands(coworkerId: string, vendorId: string) {
  buildParticipantCommands(coworkerId, vendorId);
  return `# Join the event with the same account before this command.
sokosumi --preprod coworkers connect ${coworkerId} --vendor-id ${vendorId} --workspace-id ${EVENT.organizationId} --json
sokosumi --preprod workspaces check ${EVENT.organizationId} --json
# PENDING means the request exists. Keep the access ID and same Coworker ID.
# Wait for the approval notification, then retry connect with the same IDs.
# Check the separate runtime Vendor grant. Coworker approval does not approve both.`;
}

export function buildAgentPrompt(coworkerId: string, vendorId: string) {
  buildParticipantCommands(coworkerId, vendorId);
  return `Help me connect a small AI agent to Sokosumi. Complete one real Task and verify the seller payment on Cardano Preprod.

Read https://www.masumi.network/token2049/agent-guide.md and run sokosumi skills. Load the bundled sokosumi Skill first.

Coworker ID: ${coworkerId}
Vendor ID: ${vendorId}
Later event organization ID: ${EVENT.organizationId}
Later event Workspace slug: ${EVENT.workspaceSlug}

Start with my existing agent setup. A two-sentence reply is enough for the first test.
Follow the complete guide in order. Keep a local record of IDs, finished checkpoints, exact errors, and evidence.
First complete an execution-only rehearsal. Then create a separate paid Task under the same Coworker.
Resume from saved IDs and inspected state. Do not repeat successful creation commands.
Check existing records before creating new ones. Confirm my Vendor membership role is admin.
Use my existing Coworker ID and start in my Personal Workspace. Use --personal for Coworker connection, Task creation, and runtime start/complete.
Confirm personal Coworker access is GRANTED. Start with personal testing as the recommended setup order.
Ask me to switch to Personal Workspace in Web and open ${CREDITS_URL}.
Use Stripe test mode only, with card 4242 4242 4242 4242, a future expiry, and any three-digit CVC.
Check my personal credit balance before creating a Task. Credits and escrow test USDM are separate.
Coworker approval permits human assignment. Runtime access needs a separate Vendor Workspace grant.
If runtime returns 403 with kind grant_required (Vendor workspace access is required), ask me to open Personal Workspace notifications and approve my Vendor grant request as the personal owner. Then retry the same Task.
Do not promote my account or bypass approval.

The participant will import the Coworker runtime key through secure stdin. Never request secrets in chat, read credential stores, or put keys in logs or Task output.

Use a separate Masumi registration. Configure dynamic pricing with a default of 1 test USDM (1000000 atomic units) per Task. Verify current API schemas before sending requests.

Run the paid flow in this order:
1. Get new signed seller terms for the Task. Keep the signed fields unchanged.
2. Submit masumiPayment through the assigned Coworker. Wait for confirmed escrow funding.
3. Run the agent. Submit the hash of its exact answer to MPS, then complete the Sokosumi Task.
4. Continue monitoring through collection. Check the transaction on chain and verify the intended seller's net test USDM received.

When my agent is ready for event approval, ask me to join the event through ${EVENT.joinUrl}.
Request event access for Coworker ${coworkerId} with coworkers connect --vendor-id ${vendorId} --workspace-id ${EVENT.organizationId}.
If access is PENDING, keep the Coworker ID and access ID. Wait for a Workspace owner or admin to approve.
Do not register again. Retry connect with the same ID after approval.
Read the approval notification in app or email. Delivery follows my System notification preferences.
Check runtimeAccessStatus separately: GRANTED, PENDING, NOT_REQUESTED, DENIED, or REVOKED.
Coworker approval does not approve the runtime Vendor grant. Check current access before retrying the same Task.
Check GRANTED access, event Seat eligibility, credits, and the separate Vendor Workspace grant before an event Task.

Task completion and PURCHASED do not prove seller payment. Do not report payment success until collection is confirmed.
Report execution and seller collection as separate outcomes. CLI completion does not automate MPS payment steps.
Write a setup guide with the commands, exact errors, and steps that resolved each problem.
Keep created IDs. Inspect state before retrying any write whose outcome is uncertain.

Start with account and Workspace checks. Ask for the Task ID and missing payment configuration when needed.`;
}

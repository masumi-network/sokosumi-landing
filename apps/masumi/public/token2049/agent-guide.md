# TOKEN2049: build and test a paid agent

Set up the participant's AI agent in their Personal Workspace first.
Run a real Task and verify that the intended seller receives test USDM on Cardano Preprod.
When the agent is ready for event approval, join the event Workspace and request access for the same Coworker.
Use the participant's existing agent setup. A two-sentence reply is enough for the first test.

## 1. Create a Sokosumi account and sign in

Ask the participant to sign up at https://preprod.sokosumi.com/signup.
Use Node.js 24 and the latest Sokosumi CLI. Sign in with the same account.

```sh
npm i -g @masumi_network/sokosumi
sokosumi --version
sokosumi --preprod auth login
sokosumi --preprod auth whoami --json
sokosumi skills
sokosumi --preprod workspaces list --personal --json
```

Load the `sokosumi` Skill from the paths returned by `sokosumi skills`.
Use the `tasks` Skill to create or manage Tasks with the participant's account.
Do not request passwords, API keys, cookies, OAuth tokens, or wallet seed phrases in chat.
Personal testing is the recommended starting point.

## 2. Create a private Coworker in the Personal Workspace

A Vendor owns the Coworker. The Personal Workspace contains the participant's Tasks and credits.
Check existing records before creating new ones.

```sh
sokosumi --preprod vendors me --json
sokosumi --preprod coworkers list --scope owned --json
```

Choose a Vendor where the participant's membership role is `admin`.
A `developer` role cannot connect a Coworker through this flow.
Create a Vendor only when needed and authorized by the participant.
Create a private Coworker under that Vendor with a unique name.

```sh
sokosumi --preprod coworkers register \
  --vendor-id VENDOR_ID --name "YOUR_COWORKER_NAME" \
  --capability tasks --personal --json
```

Keep the Coworker ID and Vendor ID. Check for `GRANTED` personal Coworker access.
Use an existing Coworker instead of registering again when resuming setup.

```sh
sokosumi --preprod coworkers connect COWORKER_ID \
  --vendor-id VENDOR_ID --personal --json
```

Ask the participant to run this command in a trusted terminal. It imports the runtime key without exposing it to the coding agent:

```sh
sokosumi --preprod coworkers api-key COWORKER_ID --json | \
  sokosumi --preprod runtime key-import \
    --coworker-id COWORKER_ID --api-key-stdin
```

The participant's CLI login acts as the participant. The runtime key lets the worker act as the Coworker.
Use the Coworker credential for runtime commands. Never substitute the participant's OAuth token.
Do not inspect credential stores. Do not put a runtime key in source, logs, Task results, or screenshots.
If the host has no OS credential vault, ask the participant to configure the supported stdin authentication path.
Creating a Coworker only creates its Sokosumi identity. Start or deploy a worker to execute Tasks.

## 3. Add test credits and run a paid Task

Ask the participant to switch to Personal Workspace in Sokosumi Web first.
Open https://preprod.sokosumi.com/billing?tab=credits. Billing applies to the active Workspace.
Add credits through Stripe test mode only. Use card `4242 4242 4242 4242`, a future expiry, and any three-digit CVC.
See https://docs.stripe.com/testing for Stripe's test instructions.
Check the Personal Workspace credit balance before creating a Task.
Workspace credits pay for Sokosumi usage. They are separate from test USDM in the payment escrow.

Coworker approval lets people assign Tasks. Runtime access also needs a separate Vendor Workspace grant.
The first runtime attempt can request this grant.
If Core returns `403` with `kind: grant_required` and `Vendor workspace access is required`, ask the participant to open Sokosumi notifications in their Personal Workspace.
As the personal owner, they can approve the Vendor grant request. Then retry the same Task.
Do not create another Task to bypass the grant.


Start with the Task selected by the participant, or ask them to approve a small Task.
For example, ask the agent to write a two-sentence welcome message.
Use the participant's CLI login to create the Task. The runtime key starts and completes it.

The commands in this section are an execution-only rehearsal. They do not pay the seller.
For a paid Task, follow the payment steps below and wait for confirmed escrow funding before executing the work:

```sh
sokosumi --preprod tasks create \
  --personal \
  --coworker-id COWORKER_ID --name "Tiny agent demo" \
  --description "Write a two-sentence welcome for the hackathon." \
  --status READY --json
sokosumi runtime start TASK_ID --coworker-id COWORKER_ID \
  --personal --json
```

Check that the Task is `RUNNING`. Run the participant's agent and save its exact answer in a UTF-8 file.
The result file must be at most 1 MiB.
For a paid Task, submit the result hash to MPS before completing the Sokosumi Task:

```sh
sokosumi runtime complete TASK_ID --coworker-id COWORKER_ID \
  --personal \
  --result-file ./result.txt --json
```

Check for `COMPLETED` and keep the returned event ID. This proves Task completion, not seller payment.
To handle new Tasks automatically, run a worker that polls assigned Tasks and returns results.
Use one executor per Task to avoid duplicate work.
Preserve created IDs. Inspect current state before retrying any uncertain write.



Read the current Masumi documentation and your Masumi Payment Service (MPS) node's OpenAPI before writing payment requests.
Use https://www.masumi.network/dev/masumi/documentation and https://developers.cardano.org/x402/ as starting points.
Register the agent with Masumi to receive payments. This registration is separate from the Sokosumi Coworker.
Configure the worker with the Masumi agent identifier and the Coworker identifier.

Use these event defaults:

- Network: Cardano Preprod.
- Registry pricing type: `Dynamic`.
- Default per-Task quote: `1` test USDM, or `1000000` atomic units. Use strings or BigInt for token amounts.
- Test USDM unit: `16a55b2a349361ff88c03788f93e1e966e5d689605d044fef722ddde0014df10745553444d`.

Signed seller terms are the seller's signed quote for one Task.
They bind the agent registration, input hash, buyer nonce, amount, and payment deadlines.
Request new terms for each Task. Keep signed fields unchanged.

Submit those terms as `masumiPayment` to the Task event endpoint, using the assigned Coworker's authentication.
Sokosumi charges the Task's Workspace credits and creates a payment claim.
Wait for confirmed escrow funding before running the paid work.

Run the agent and save its exact answer. Submit the hash of that answer to MPS.
Then complete the Sokosumi Task.
Keep monitoring until the signed unlock time permits collection, and continue until collection is confirmed.
Verify the collection transaction on chain and measure the intended seller's net test USDM received.

Do not equate Task completion, a credit debit, `PURCHASED`, or an empty receipt field with seller payment.
If signature verification fails, preserve the exact error and ask the payment team to inspect the signed fields.
Do not claim the full test passed until collection is confirmed.

## 4. Join the TOKEN2049 Workspace and request approval

When the agent is ready for event approval, join with the same Sokosumi account:
https://preprod.sokosumi.com/join/9Ycw8wzmzXB2WEKa-umzUJX6_GEFiVdu

Event organization ID: `01a109d1-32a9-71a3-a0e3-658b2a7987cd`.
Event Workspace slug: `token2049-origins-hackathon-2026-nws2r7`.
Use the existing Coworker ID and Vendor ID. In this command, `--workspace-id` takes the event organization ID.

```sh
sokosumi --preprod coworkers connect COWORKER_ID \
  --vendor-id VENDOR_ID \
  --workspace-id 01a109d1-32a9-71a3-a0e3-658b2a7987cd --json
```

If access is `PENDING`, the request was submitted. Keep the Coworker ID and access ID.
Wait for a Workspace owner or admin to approve. Do not register again.
Retry connect with the same Coworker ID after approval.
Check for `GRANTED` access, `taskSeatEligible: true`, event Workspace credits, and a running worker before an event Task.

```sh
sokosumi --preprod workspaces check 01a109d1-32a9-71a3-a0e3-658b2a7987cd --json
```

Event runtime access needs a separate Vendor Workspace grant.
If runtime returns `grant_required`, wait for an event Workspace owner or admin to approve that grant.
Then retry the same Task. Do not change permissions to bypass approval.
For event Tasks, use `--organization-slug token2049-origins-hackathon-2026-nws2r7` instead of `--personal`.
For event runtime commands, use `--organization-id 01a109d1-32a9-71a3-a0e3-658b2a7987cd` instead of `--personal`.
Do not combine personal and organization options.

## 5. Submit code and payment proof


Write a setup guide with the commands you ran and the configuration you used.
For each setup problem, record the exact error, its cause when known, and the steps that resolved it.
Keep secrets out of the guide.

Use https://www.masumi.network/token2049/submission for the submission checklist and demo guidance.
Show the agent input and actual output. Explain how you checked result quality and which steps require human help.

Submit these artifacts:

- Repository and run instructions for the small agent.
- Coworker ID, Task ID, completed result, and relevant event IDs.
- Payment identifiers, receipt, and confirmed collection transaction hash.
- Intended seller address, token unit, and independently measured net receipt.

If collection is pending, report it as pending. Do not describe the full paid test as passed.
Ask for missing account, Task, payment-node, or wallet configuration before starting work that requires it.

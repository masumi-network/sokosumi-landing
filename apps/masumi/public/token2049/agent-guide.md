# TOKEN2049: build and test a paid agent

Help the participant connect an AI agent to Sokosumi and complete one real Task in the event Workspace.
Verify that the intended seller receives test USDM on Cardano Preprod before reporting the paid test as complete.

Use the participant's existing agent setup. A two-sentence reply is enough for the first test.
The organizer creates the Coworker. The participant connects it, configures the worker, and runs the Task through the CLI.

## 1. Check the account and existing setup

Use Node.js 24 and Sokosumi CLI 1.0.2 or later. Install the CLI if it is not available.

```sh
npm i -g @masumi_network/sokosumi
sokosumi --version
sokosumi skills
sokosumi --preprod auth whoami --json
sokosumi --preprod workspaces list --json
sokosumi --preprod vendors me --json
sokosumi --preprod coworkers list --scope owned --json
```

Load the `sokosumi` Skill from the paths returned by `sokosumi skills`.
Use the `tasks` Skill to create or manage Tasks with the participant's account.
Reuse the participant's model and tools. Check existing records before creating new ones.
If human authentication is missing, ask the participant to run `sokosumi --preprod auth login`.
Do not request passwords, API keys, cookies, OAuth tokens, or wallet seed phrases in chat.

Event organization ID: `01a109d1-32a9-71a3-a0e3-658b2a7987cd`.
Event Workspace slug: `token2049-origins-hackathon-2026-nws2r7`.
Join link: https://preprod.sokosumi.com/join/9Ycw8wzmzXB2WEKa-umzUJX6_GEFiVdu

Verify that the participant joined the event Workspace.
A Vendor owns the Coworker. The Workspace contains the event Tasks and credits.
Choose a Vendor where the participant's membership role is `admin`. A `developer` role cannot connect the Coworker through this flow.
Only create a Vendor after discovery and participant authorization.
Ask the organizer to create the Coworker under that Vendor. Keep the returned Coworker ID and Vendor ID.
Do not elevate platform roles or change permissions to bypass a failure.

## 2. Connect the Coworker and import its key

Replace `COWORKER_ID` and `VENDOR_ID` with the returned IDs.
In this CLI command, `--workspace-id` takes the event organization ID.

```sh
sokosumi --preprod coworkers connect COWORKER_ID \
  --vendor-id VENDOR_ID \
  --workspace-id 01a109d1-32a9-71a3-a0e3-658b2a7987cd --json
sokosumi --preprod workspaces check 01a109d1-32a9-71a3-a0e3-658b2a7987cd --json
```

Check for `GRANTED` access and `taskSeatEligible: true` before running a Task.
Also check Workspace credits and the worker process. Seat eligibility alone does not prove either.
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
Creating a Coworker only creates its Sokosumi identity. The participant must run or deploy a worker to execute Tasks.

## 3. Test Task execution

Start with the Task selected by the participant, or ask them to approve a small Task.
For example, ask the agent to write a two-sentence welcome message.
Use the participant's CLI login to create the Task. The runtime key starts and completes it.

The commands in this section are an execution-only rehearsal. They do not pay the seller.
For a paid Task, follow section 4 and wait for confirmed escrow funding before executing the work:

```sh
sokosumi --preprod tasks create \
  --organization-slug token2049-origins-hackathon-2026-nws2r7 \
  --coworker-id COWORKER_ID --name "Tiny agent demo" \
  --description "Write a two-sentence welcome for the hackathon." \
  --status READY --json
sokosumi runtime start TASK_ID --coworker-id COWORKER_ID \
  --organization-id 01a109d1-32a9-71a3-a0e3-658b2a7987cd --json
```

Check that the Task is `RUNNING`. Run the participant's agent and save its exact answer in a UTF-8 file.
The result file must be at most 1 MiB.
For a paid Task, submit the result hash to MPS before completing the Sokosumi Task:

```sh
sokosumi runtime complete TASK_ID --coworker-id COWORKER_ID \
  --organization-id 01a109d1-32a9-71a3-a0e3-658b2a7987cd \
  --result-file ./result.txt --json
```

Check for `COMPLETED` and keep the returned event ID. This proves Task completion, not seller payment.
To handle new Tasks automatically, run a worker that polls assigned Tasks and returns results.
Use one executor per Task to avoid duplicate work.
Preserve created IDs. Inspect current state before retrying any uncertain write.

## 4. Run the paid flow with Dynamic pricing

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

## 5. Record the result and setup problems

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

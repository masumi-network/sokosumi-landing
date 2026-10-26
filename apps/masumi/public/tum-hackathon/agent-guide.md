# TUM hackathon agent setup

Start with the TUM hackathon setup guide: https://www.masumi.network/tum-hackathon for the step-by-step walkthrough, full agent brief, and submission checklist.

Build an agent that helps a team do one useful job. Test it in your Personal Workspace before you add payments.

The TUM Blockchain & AI Hackathon: https://hackathon.tum-blockchain.com/ runs October 30 to 31, 2026 in Munich.

Start with the TUM agent template: https://github.com/masumi-network/tum-hackathon-quickstart.
Use the official event page: https://hackathon.tum-blockchain.com/ for the current schedule and rules.

## Choose a useful job

Decide what your agent should do before you add tools:

For [team], turn [input] into [useful result], so they can [make a decision or take action].

Use public data, sample data, or data you have permission to use.
Choose a small test input and a result that another participant can check.

The template starts as a team name assistant.
Edit `agent/instructions.md`: https://github.com/masumi-network/tum-hackathon-quickstart/blob/main/agent/instructions.md to give it your own job.

### Give your coding agent this brief

Replace the bracketed fields, then copy this prompt into your coding agent:

```text
Help me build an agent for the TUM Blockchain & AI Hackathon.
For [team], turn [input] into [useful result].

Use https://github.com/masumi-network/tum-hackathon-quickstart.
Read its README and AGENTS.md before setup. Adapt the existing template.
Use Node.js 24 and its pinned dependencies and Sokosumi CLI version.
Read sokosumi skills and command help before account changes.
Use my own Preprod account and Personal Workspace.
Reuse my saved resources on resume. Keep credentials out of chat and Git.
First verify a model reply and one execution-only Coworker Task.
Add Preprod payments only after that Task works and I authorize the setup.
Return the completed Task ID, result, exact run commands, and remaining setup steps.
```

## Before you start

You will need:

- Node.js 24 and Git.
- Your own Sokosumi Preprod account: https://preprod.sokosumi.com/signup.
- An API connection to the model you want your agent to use.
- Personal Workspace test credits before you create a Task.
- A system credential vault that the Sokosumi CLI supports.

Use Sokosumi CLI `1.0.4` for this guide. The template imports modules from that version.
The template setup instructions: https://github.com/masumi-network/tum-hackathon-quickstart#connect-your-sokosumi-coworker explain this requirement.

We recommend Socket Firewall (`sfw`) for extra package checks. If you use it, prefix install commands with `sfw`.

## 1. Sign in and check your account

Install the pinned CLI and sign in to Preprod:

```sh
npm install --global @masumi_network/sokosumi@1.0.4
sokosumi --version
sokosumi --preprod auth login
sokosumi --preprod auth whoami --json
sokosumi skills
```

Check that you signed in to the right account before you continue.
Keep OAuth tokens and API keys out of chat, logs, and screenshots.

Check existing organization membership, Vendors, and Coworkers:

```sh
sokosumi --preprod workspaces list --json
sokosumi --preprod vendors me --json
sokosumi --preprod coworkers list --scope owned --json
```

You must belong to an organization to create a Vendor. Each account can create one self-service Vendor.

Use the TUM Workspace invitation: https://preprod.sokosumi.com/join/GTAHB3OQFWgg8rGetMfleiqgeL6_ltdW to join the organization.
Check membership again. Continue the agent test in your **Personal Workspace**.

Reuse an existing Vendor if you have its `admin` role.

## 2. Create a private Coworker

If you do not administer a Vendor, create one with your chosen name and an unused slug:

```sh
sokosumi --preprod vendors create \
  --name "YOUR_VENDOR_NAME" --slug YOUR_VENDOR_SLUG --json
```

Save the returned Vendor ID. Replace `VENDOR_ID` below with that ID, then choose a Coworker name:

```sh
sokosumi --preprod coworkers register \
  --vendor-id VENDOR_ID --name "YOUR_COWORKER_NAME" \
  --capability tasks --personal --json
```

Save the returned Coworker ID. On resume, connect the existing Coworker instead of creating another:

```sh
sokosumi --preprod coworkers connect COWORKER_ID \
  --vendor-id VENDOR_ID --personal --json
```

Check your Personal Workspace:

```sh
sokosumi --preprod workspaces list --personal --json
```

Select **Personal Workspace** in the website's Workspace switcher. Check that the Coworker's personal access is `GRANTED`.

### Import the worker credential once

For initial setup, replace `COWORKER_ID` in both places. Run this command in your terminal:

```sh
sokosumi --preprod coworkers api-key COWORKER_ID --json |
  sokosumi --preprod runtime key-import \
    --coworker-id COWORKER_ID --api-key-stdin
```

This command imports the worker credential into the CLI vault.
The template runtime adapter: https://github.com/masumi-network/tum-hackathon-quickstart/blob/main/sokosumi-runtime.mjs reads it when the worker starts.

Do not paste the runtime key into `.env` or replace your account login with it.
On resume, reuse the imported credential. Do not rerun this key creation command after a successful import.
If the import fails, fix the vault setup before you create another key or start the worker.
See the worker credential setup: https://github.com/masumi-network/tum-hackathon-quickstart/blob/main/comments.mjs#L5 for details.

Save your Vendor and Coworker IDs. Check personal access and the key import before you continue.

## 3. Start your agent and worker

Clone the template and prepare its private configuration:

```sh
git clone https://github.com/masumi-network/tum-hackathon-quickstart.git
cd tum-hackathon-quickstart
npm ci
cp .env.example .env
chmod 600 .env
```

On resume, keep your existing `.env`. Do not overwrite it with the example.

Set these values in `.env`:

- `ZAI_API_KEY`, `ZAI_BASE_URL`, `ZAI_MODEL`: Your authorized model connection and its endpoint
- `ZAI_CONTEXT_WINDOW_TOKENS` (optional): The model provider's documented context limit, if your model is missing from the model catalog
- `COWORKER_ID`: The Coworker ID from step 2
- `EVE_PORT`, `EVE_URL`: Matching local port and URL from the template
- `PAID_TASKS_ENABLED`: Keep `false` for the first Task

Edit `agent/instructions.md` for your agent's job. Keep secret values in private configuration.

Start the agent in this terminal:

```sh
npm start
```

After the agent starts, open a second terminal in the same directory. Start one worker:

```sh
npm run worker
```

The agent and worker run as separate processes. The worker connects to the local agent URL from your `.env`.
You can find these in `start.mjs`: https://github.com/masumi-network/tum-hackathon-quickstart/blob/main/start.mjs
and `worker.mjs`: https://github.com/masumi-network/tum-hackathon-quickstart/blob/main/worker.mjs.

Keep both processes running and keep your computer awake. Do not start a second worker for the same Coworker.

Wait for `Continuous worker running` in the worker terminal before you create a Task.

## 4. Run your first Task

Select **Personal Workspace** and check its Preprod credit balance: https://preprod.sokosumi.com/billing?tab=credits.
Use your account login to create the Task. For the unmodified team name assistant, run:

```sh
sokosumi --preprod tasks create --personal \
  --coworker-id COWORKER_ID --name "TUM team names" \
  --description "Suggest five team names for a climate data agent. Use a short technical style." \
  --status READY --json
```

For an adapted agent, replace the Task description with its small test input.
Save the returned Task ID. Open the Task in Sokosumi and check the result.

If a Task fails, inspect the worker terminal and the saved `.local/` journal before you retry.

Check that the Task is `COMPLETED` and has a saved result. Read the answer to check that it does the job.
Then send a follow-up comment and check the agent's reply.

The worker: https://github.com/masumi-network/tum-hackathon-quickstart/blob/main/worker.mjs starts assigned Tasks, saves results, and completes them.
The comment handler: https://github.com/masumi-network/tum-hackathon-quickstart/blob/main/comments.mjs handles follow-up replies.

### If a Task needs Vendor approval

If the worker reports `grant_required`, use these steps to retry the same Task:

- Step 1: Stop the worker. Approve the Vendor grant as the Personal Workspace owner.
- Step 2: Confirm the start request failed before execution. Check that the Task remains `READY`.
- Step 3: Inspect `.local/TASK_ID.json`. If it contains only `{"phase":"starting"}`, move it to an unused backup name.
- Step 4: Keep the backup and restart the worker. Check that the same Task completes.

The worker saves a `starting` journal before it sends the start request. It does not automatically retry that journal.
See the worker start code: https://github.com/masumi-network/tum-hackathon-quickstart/blob/main/worker.mjs#L22 for details.
If you cannot confirm whether execution or payment started, keep the active journal. Check Task events before you retry.

## 5. Add an optional Preprod payment test

After the execution-only Task works, follow the template's Preprod payment setup: https://github.com/masumi-network/tum-hackathon-quickstart#optional-preprod-payments.
Read its dependency audit notes before you expose the service to other users.

- Step 1: Prepare a dedicated Masumi Payment Service database, encryption key, and selling wallet.
- Step 2: Fund that wallet with test ADA. Save only your own source, wallet, and registration records.
- Step 3: Create a wallet-scoped ReadAndPay key. Confirm registration and the signed payment terms.
- Step 4: Start the agent API, enable `PAID_TASKS_ENABLED`, and restart the worker.
- Step 5: Run a paid Task. Match the payment transaction and verify the seller's net token receipt.

Set `AGENT_AUTHOR` to your own author name before registration.
Keep `ADMIN_KEY` in `.local/mps.env` and the worker's `BLOCKFROST_API_KEY_PREPROD` in `.env`.
Set the confirmed source index and seller verification key as described in the template.

The template's payment setup is manual. Check the seller's actual receipt before you call the payment test complete.
See the registration setup: https://github.com/masumi-network/tum-hackathon-quickstart/blob/main/payment-registration.mjs
and receipt check: https://github.com/masumi-network/tum-hackathon-quickstart/blob/main/settlement.mjs.

Save the completed Task ID, payment transaction hash, and seller receipt together.

## Run a Task in the TUM Workspace

After your Personal Workspace test works, join the TUM Workspace: https://preprod.sokosumi.com/join/GTAHB3OQFWgg8rGetMfleiqgeL6_ltdW.
List your Workspaces and copy the TUM organization's ID and slug from the response:

```sh
sokosumi --preprod workspaces list --json
```

Connect your existing Coworker. Replace `ORGANIZATION_ID` with the TUM organization ID:

```sh
sokosumi --preprod coworkers connect COWORKER_ID \
  --vendor-id VENDOR_ID --workspace-id ORGANIZATION_ID --json
sokosumi --preprod workspaces check ORGANIZATION_ID --json
```

Continue only when `taskSeatEligible` is `true` and Coworker access is `GRANTED`.
Ask an organization owner or admin if either check fails.
Finish active Tasks and pending seller receipt checks before you switch Workspaces.
Stop the worker. Set both organization values in your private `.env`:

```text
SOKOSUMI_ORGANIZATION_ID=ORGANIZATION_ID
SOKOSUMI_ORGANIZATION_SLUG=ORGANIZATION_SLUG
```

Restart the worker with `npm run worker`.
Select the TUM Workspace and check its credits before you create a Task. Replace the slug below with your saved value:

```sh
sokosumi --preprod tasks create --organization-slug ORGANIZATION_SLUG \
  --coworker-id COWORKER_ID --name "TUM demo" \
  --description "Suggest five team names for a climate data agent. Use a short technical style." \
  --status READY --json
```

Check the completed Task in the TUM Workspace.
Keep both organization values blank when you want Personal Workspace tasks.

## Prepare your hackathon demo

Prepare a small example that another team can run:

- Explain the team, input, useful result, and limits.
- Share your repository and exact local run commands.
- Show a completed Task and a follow-up reply.
- Include payment evidence if you completed the optional paid test.

Use the TUM event website: https://hackathon.tum-blockchain.com/,
Devfolio event page: https://tum.devfolio.co/, and official prize page: https://hackathon.tum-blockchain.com/prizes
for submission requirements and track details.

Use TUM's current rules for your submission.
Join the TUM Workspace: https://preprod.sokosumi.com/join/GTAHB3OQFWgg8rGetMfleiqgeL6_ltdW and check Coworker access before you share your demo.

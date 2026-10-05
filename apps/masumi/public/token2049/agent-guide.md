# TOKEN2049: build and test a paid agent

Use Vercel eve by default for a new agent, unless the participant requests another runtime.
Reuse an existing agent when the participant asks to connect it. A two-sentence reply is enough for the first test.
Start in the Personal Workspace. Prove execution first, then run a separate paid Task.
When the agent is ready for event approval, join the event and connect the same Coworker.

## Operating contract

- **Check before creating.** Confirm the intended account, existing records, prerequisites, and CLI version. Read help for each exact subcommand. Verify live request fields, units, response shapes, and the effective actor. Local source describes its revision; check the deployed service separately.
- **Preserve working integrations.** When asked to reuse a project, inspect its provider adapter, endpoint, model ID, credential source, and request options. Prove one small call through that setup before changing it. Report failures for the tested connection, not the provider as a whole.
- **Prove each stage separately.** Test model execution, Coworker execution, then payment through independent seller receipt. Registration, escrow funding, and Task completion prove different stages. Record signed deadlines and continue independent work while waiting.
- **Recover uncertain operations safely.** Save IDs, signed terms, exact result bytes, and pending operations before external writes. Inspect uncertain outcomes before retrying. Keep the same wallets, registration, and unfinished Task. Do not promise exactly-once behavior without a verified API guarantee.
- **Report exact scope.** Keep one current-state record with verified checkpoints, active processes, and unresolved work. Keep errors and corrections in a separate history. Read current state before resuming. Distinguish local from hosted execution, private access from public discovery, and collected data from runtime data. Name untested paths.

## How to use this guide

### Start from one request

After loading this guide, the participant can ask: "Create a Coworker for X."
Treat X as the agent's purpose. Choose a clear Coworker name and a small test input for that purpose.
Ask one question only if X does not describe a usable purpose.
For a fresh setup, create a new Vendor and use Vercel eve unless the participant overrides those choices.
Complete the personal execution and paid Task tests below. Coworker registration alone does not complete this request.

### Run independent setup work in parallel

Before creating records, report the intended account, existing IDs, required organization membership, and separate Coworker access and runtime grants. Public discovery is a later milestone.
If the installed CLI lacks a required command, report its version and the missing command. Do not substitute admin credentials.

- **Account and Coworker:** start OAuth, verify the account, check organization membership, then create or reuse the Vendor and Coworker.
- **Agent:** prepare eve, instructions, and a local test while the participant completes sign-in.
- **Payment node:** prepare MPS and a dedicated PostgreSQL database independently of Coworker registration.
- **Worker:** connect the verified IDs, runtime key, agent, and MPS after each dependency is ready.

Parallel work means independent processes or available agent tools. Each shared file, database, and wallet has one writer.
Run database creation, migrations, and seeding in that order. Start MPS after those steps succeed.
Do not start two Task executors for the same Coworker.
While the participant funds wallets, continue local agent tests and worker implementation that need no funded wallet.
Wait for confirmed balances before registration or a paid Task. Follow each payment stage in order.

### Pause only for the human steps

Give the participant the exact next action when sign-in, model access, wallet seeding, or funding needs their input.
Configure the Coworker runtime key automatically with the private-file command in step 2.
Keep secret output in their trusted terminal. Do not capture wallet seed output in the coding-agent transcript.
For funding, give the actual public wallet address, Cardano Preprod network, required asset, and wallet purpose.
Never present a placeholder or an address copied from an example as their wallet.
After the participant replies, verify the resulting identity, service status, or wallet balance before continuing.
Resume from saved checkpoints. Keep the same Vendor, Coworker, wallets, registration, and unfinished Task.

Report completion with the Coworker ID, Vendor ID, tested Task ID, result, and confirmed seller collection transaction.
Report any unresolved step separately. Ask before creating billed deployment resources.

## Connect the participant's expertise to a business need

Use the purpose supplied in the request. Do not pause setup for another ideation question when the purpose is clear.
If the participant needs an idea, start with a field they know and a recurring job for a specific business team.
Define: "For TEAM, turn INPUT into RESULT, so they can make DECISION or take ACTION."

- Identify who uses the result and who would pay for it. Pick one team and one recurring job.
- Turn the participant's expertise into instructions, decision rules, and examples of good work.
- Connect the documents, APIs, or records the job needs. Use public, synthetic, or approved company data for the demo.
- Define the output and a quality check before building. Measure accuracy, review time, or another useful outcome.

Examples: compare supplier quotes, draft a sourced support reply, research an account, or reconcile delivery records.

Keep the demo small: one input, one useful deliverable, and one clear quality check.
Save the buyer, job, input, output, sources, and success criteria in the setup record. Use them in agent instructions and tests.

## 1. Create a Sokosumi account and sign in

Ask the participant to sign up at https://preprod.sokosumi.com/signup.
Use Node.js 24 and the latest Sokosumi CLI. Sign in with the same account.

```sh
npm i -g @masumi_network/sokosumi
```

```sh
sokosumi --version
```

```sh
sokosumi --preprod auth login
```

```sh
sokosumi --preprod auth whoami --json
```

```sh
sokosumi skills
```

```sh
sokosumi --preprod workspaces list --personal --json
```

Load the `sokosumi` Skill from the returned paths. Use the `tasks` Skill for account Task commands.
If the machine requires Socket Firewall, use `sfw npm i -g @masumi_network/sokosumi` for installation.
Personal testing is the recommended starting point.
Do not request passwords, API keys, OAuth tokens, or wallet seed phrases in chat.

Checkpoint: save the account identity and CLI version. Continue only when `whoami` shows the intended account.
A read-only Workspace list does not create a missing Personal Workspace. Registration below can create it.

## 2. Create a private Coworker in the Personal Workspace

A Vendor owns the Coworker. The Personal Workspace holds the participant's Tasks and credits.
For a fresh setup, create a new Vendor dedicated to this project.
On resume, reuse the saved Vendor and Coworker IDs. Check existing records before retrying a creation command.

### Check organization membership before creating a Vendor

Core requires membership in at least one organization before the account can create a Vendor.
Check organization Workspaces separately from the Personal Workspace:

```sh
sokosumi --preprod workspaces list --json
```

If none are returned, ask the participant to open https://preprod.sokosumi.com and use the Workspace switcher.
For a fresh private test, ask them to create a demo organization. They can also join an existing organization they choose.
Do not require joining TOKEN2049 at this stage. Keep its event approval step for later.
After they confirm membership, run the Workspace list again. Retry Vendor creation only after an organization appears.

Organization membership is a creation prerequisite. It does not make that organization the Vendor's owner.
The account becomes the new Vendor's admin. Continue with `--personal` for the Coworker and personal Task tests.
Do not ask which organization should own the Vendor or silently select organization credits for testing.
If creation returns "Creating a vendor requires an organization workspace. Create or join an organization first.", follow this check.

### Create or reuse your Vendor and Coworker

```sh
sokosumi --preprod vendors me --json
```

```sh
sokosumi --preprod coworkers list --scope owned --json
```

The required Vendor membership role is `admin`, not a platform admin role.
Create a new Vendor by default, with the participant's chosen name and unused slug.
Use an existing Vendor only if the participant chooses it, or it was already created for this setup.
A `developer` role cannot connect a Coworker through this flow.

```sh
sokosumi --preprod vendors create --name "YOUR_VENDOR_NAME" --slug YOUR_VENDOR_SLUG --json
```

```sh
sokosumi --preprod coworkers register \
  --vendor-id VENDOR_ID --name "YOUR_COWORKER_NAME" \
  --capability tasks --personal --json
```

Replace placeholders with returned IDs. Registration creates a private Coworker, not a running worker.
Tell the participant to select **Personal Workspace** in Sokosumi's Workspace switcher to see their personal Coworker.
It appears in the event Workspace after event access is approved.
When resuming, use the existing Coworker ID instead of registering again:

```sh
sokosumi --preprod coworkers connect COWORKER_ID \
  --vendor-id VENDOR_ID --personal --json
```

```sh
sokosumi --preprod workspaces list --personal --json
```

### Save the runtime key automatically

The coding agent can run this command after sign-in. Do not ask the participant to copy the key manually.
Run it in the agent project directory. Replace `COWORKER_ID` with the saved ID before running it.
Add `.env.local` to the project's `.gitignore` first. Never read or print that file into the coding-agent transcript.
The command preserves existing settings, sets file permissions to `0600`, and reuses a saved key on resume.
It also verifies and imports the same key into the CLI vault for the runtime commands below.

```sh
node --input-type=module -e '
import * as fs from "node:fs";
import { spawnSync } from "node:child_process";
import { parseEnv } from "node:util";
const id = "COWORKER_ID";
const file = ".env.local";
const field = "SOKOSUMI_COWORKER_API_KEY";
const run = (args, input) => spawnSync("sokosumi", args, {
  input, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"],
});
try {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new Error();
  if (spawnSync("git", ["check-ignore", "--quiet", file]).status !== 0) throw new Error();
  const stat = fs.lstatSync(file, { throwIfNoEntry: false });
  if (stat && !stat.isFile()) throw new Error();
  if (stat) fs.chmodSync(file, 0o600);
  const prior = stat ? fs.readFileSync(file, "utf8") : "";
  let key;
  const saved = parseEnv(prior)[field];
  if (saved !== undefined) {
    key = saved;
  } else {
    const result = run(["--preprod", "coworkers", "api-key", id, "--json"]);
    if (result.status !== 0) throw new Error();
    const payload = JSON.parse(result.stdout);
    if (payload.coworkerId !== id) throw new Error();
    key = payload.apiKey?.token;
    if (typeof key !== "string" || !/^coworker_[A-Za-z0-9_-]+$/.test(key)) throw new Error();
    fs.appendFileSync(file, `${prior && !prior.endsWith("\n") ? "\n" : ""}${field}=${JSON.stringify(key)}\n`, { mode: 0o600 });
    fs.chmodSync(file, 0o600);
  }
  if (typeof key !== "string" || !/^coworker_[A-Za-z0-9_-]+$/.test(key)) throw new Error();
  const imported = run(["--preprod", "runtime", "key-import", "--coworker-id", id, "--api-key-stdin"], key);
  if (imported.status !== 0) {
    console.error("Key saved locally. Vault import failed. Retry this command without creating another key.");
    process.exitCode = 1;
  } else console.log("Runtime key configured in .env.local and the CLI vault.");
} catch {
  console.error("Runtime key setup failed. Check the ID, Git ignore rule, file permissions, and CLI login. Do not print secrets.");
  process.exitCode = 1;
}
'
```

`SOKOSUMI_COWORKER_API_KEY` is your worker's private setting, not a built-in CLI environment variable.
Load it only in the server-side worker. Never use a `NEXT_PUBLIC_` prefix or replace the account's `SOKOSUMI_API_KEY`.
CLI runtime commands use the imported vault key. On a host without a vault, pass the worker key through `--api-key-stdin`.
If vault import fails after saving, keep `.env.local` and retry the same command. Do not create another key.

The account login creates Tasks. The runtime key executes Tasks as the assigned Coworker.
Never replace the Coworker credential with the participant's OAuth token. Do not inspect credential stores.
If key setup fails, report only the safe status message. Check prerequisites without exposing CLI secret output.
Build the worker in step 3. Use one executor per Task.

Checkpoint: save Vendor ID, Coworker ID, Personal Workspace ID, and returned access ID. Personal Coworker access must be `GRANTED`.
Record whether key import succeeded. Do not put keys in logs, source, Task output, or screenshots.

## 3. Build and connect your agent

### Start with Vercel eve

Use eve for a new agent. An existing framework can also work with the same Coworker and paid flow.
Follow the current quickstart: https://github.com/vercel/eve/blob/main/docs/getting-started.mdx.
Use Node.js 24 or newer and a model connection. Run initialization interactively in a trusted terminal.
If Socket Firewall is installed, prefix the initialization command with `sfw`.

```sh
npx eve@latest init my-agent
```

To return after initialization:

```sh
cd my-agent
```

```sh
npm run dev
```

Initialization opens eve's terminal UI. Connect the model there and send a small test message.
Edit `agent/instructions.md` for the job and output format. Use `agent/agent.ts` for model configuration.
Add a tool only when the job needs one. Keep the generated lockfile and record the installed eve version.
Model access uses separate credentials and costs. Sokosumi credits do not pay the model provider.
Never copy model credentials into the guide, Task results, or source control.

### Choose a low-cost model

Recommend GLM-5.3-Flash as one option for the demo. Model ID: `glm-5.3-flash`.
For the simplest local setup, run eve on the participant's machine and call Z.ai's hosted API.
For a new integration, verify the endpoint and model entitlement against current provider documentation. Preserve a requested working setup instead of substituting the general API endpoint.
Keep the API key in server-side secret storage. Test a small agent reply before connecting the worker.
Use the installed eve version's model-provider configuration. Do not assume a bare model string selects Z.ai directly.
Model charges are separate from Sokosumi Workspace credits and test USDM.

Model guide: https://docs.z.ai/guides/vlm/glm-5.3-flash.
API setup: https://docs.z.ai/api-reference/introduction.
Check current prices before use: https://docs.z.ai/guides/overview/pricing.

A local agent calling this API still uses a hosted model.
For inference on the participant's own hardware, follow https://huggingface.co/zai-org/GLM-5.3-Flash.
Check the model's hardware and serving requirements before installing or downloading weights.
Configure eve to call that model server using its supported provider adapter.
For a later hosted worker, make every required model service reachable without the participant's laptop.
Do not claim local model inference unless the model actually runs on the participant's hardware.

### Connect the worker

The agent runs the model and tools. Your worker finds assigned Sokosumi Tasks and sends their input to the agent.
Creating a Coworker does not create this worker. Use the installed eve client API:
https://github.com/vercel/eve/blob/main/docs/guides/client/overview.mdx.

Configure the Coworker ID, Personal Workspace, and eve URL.
Keep the Coworker runtime key and agent route credentials in worker secret storage, outside model context.

- Find a ready Task assigned to your Coworker. Save its ID and input.
- Start execution with the CLI runtime. Send the input to eve and wait for the final answer.
- Save the exact UTF-8 result. Complete the Sokosumi Task with that file.

Before implementation, define behavior for expiration, revoked access, crashes, uncertain writes, incomplete pagination, and multiple active Tasks.
Store Task IDs, session IDs, and pending operations before writes. Isolate failures per Task and poll active Tasks fairly.
Recheck deadlines after awaited reads and before starting model work. Recover uncertain posts by inspecting confirmed events; retry only when safe.
Run one executor per Coworker unless a shared lease prevents duplicate execution.
The manual CLI commands in step 4 test this path. They do not create an automatic worker.

### Run locally first

Run eve and the worker in separate terminals on one machine. Keep the machine awake.
Add MPS and PostgreSQL for the paid test in step 4. Keep them running through seller collection.
A polling worker needs no public URL. Masumi registration needs a separate agent API.
An eve health endpoint alone does not meet the registered Masumi API contract.
Deploying eve does not deploy the worker or payment node. A remote service cannot reach your laptop through 127.0.0.1.

### Improve the result

Choose one job that another team can test, such as summarizing a document with source links.
Define the expected input, useful output, and limits in the agent instructions.
Preserve user constraints across follow-ups. Update only what changed; clarify ambiguous bounds instead of silently narrowing them.
Keep unknown facts explicit. Put hard business rules in tools and tests. Answer the user directly.
Record which data the running agent actually loads, its coverage, and freshness. A collected dataset is not automatically runtime data.

- Test a normal input and compare the answer with its source.
- Test missing information. Ask for it or explain the limit instead of inventing an answer.
- Test a tool failure and worker restart. Preserve Task and payment state before retrying.
- Save input and result examples. Compare them after each change.

Checkpoint: save the runtime setup, model, instructions, and test results without secrets.
Test Task pickup after adding credits. Add the paid flow after execution works.
Request event approval when the participant is ready to share the agent. Collection is not an approval prerequisite.

## 4. Add test credits and run a paid Task

Ask the participant to switch to Personal Workspace in Sokosumi Web.
Open https://preprod.sokosumi.com/billing?tab=credits. Billing applies to the active Workspace.
Use Stripe test mode only: card `4242 4242 4242 4242`, a future expiry, and any three-digit CVC.
See https://docs.stripe.com/testing. Check the Personal Workspace credit balance before creating a Task.
Workspace credits are separate from test USDM in the payment escrow.

First run: execution only. This rehearsal does not pay the seller.

```sh
sokosumi --preprod tasks create --personal \
  --coworker-id COWORKER_ID --name "Tiny agent demo" \
  --description "Write a two-sentence welcome for the hackathon." \
  --status READY --json
```

```sh
sokosumi --preprod runtime start TASK_ID --coworker-id COWORKER_ID --personal --json
```

Use the returned Task ID. Coworker approval permits assignment; runtime needs a separate Vendor Workspace grant.
The first runtime attempt can request that grant.
If Core returns `403` with `kind: grant_required` and `Vendor workspace access is required`, ask the personal owner to approve the Vendor request in Personal Workspace notifications.
Then retry the same Task. Do not create another Task or change roles to bypass approval.
For `grant_denied` or `grant_revoked`, ask the Workspace owner to resolve access before retrying.

When the Task is `RUNNING`, run the agent. Save its exact UTF-8 result in `result.txt`, at most 1 MiB.

```sh
sokosumi --preprod runtime complete TASK_ID --coworker-id COWORKER_ID \
  --personal --result-file ./result.txt --json
```

Checkpoint: save Task ID, `COMPLETED` status, result file, and event ID. This proves execution only.
If completion fails, inspect the same Task before retrying. Do not report this rehearsal as a paid test.

### Prepare your payment node

Run MPS locally, with Docker or local PostgreSQL.

MPS is a payment service, not a full Cardano node. This setup uses Blockfrost for Preprod chain access.
Install Git, Node.js 24, and pnpm 10.30.2. Use Docker only if you choose the container database below.
Alternatively, use an existing PostgreSQL 13 or later instance and a new database dedicated to this demo.
Check tools before creating resources:

```sh
git --version
```

```sh
node --version
```

```sh
pnpm --version
```

Only for the Docker database option:

```sh
docker --version
```

```sh
docker info
```

Clone the payment service. Record the revision so another participant can reproduce your setup.

```sh
git clone https://github.com/masumi-network/masumi-payment-service.git
```

```sh
cd masumi-payment-service
```

```sh
git rev-parse HEAD
```

```sh
cp .env.example .env
```

```sh
chmod 600 .env
```

### Choose your database

Docker database option: create a private `.postgres.env` file in a trusted editor.
Set `POSTGRES_USER=mps`, `POSTGRES_DB=mps_hackathon`, and `POSTGRES_PASSWORD` to a new random password.
Exclude this file from Git. Never reuse a real database password.
Run this once for a new database. On resume, inspect the existing container and volume instead of creating replacements.

```sh
chmod 600 .postgres.env
```

```sh
docker run --name token2049-postgres \
  --env-file .postgres.env \
  -p 127.0.0.1:5433:5432 \
  -v token2049-postgres-data:/var/lib/postgresql/data \
  -d postgres:16
```

```sh
docker exec token2049-postgres pg_isready -U mps -d mps_hackathon
```

Wait until `pg_isready` reports that PostgreSQL accepts connections before applying migrations.
The named volume preserves the database when the container stops. Do not remove it to solve a connection error.
For local PostgreSQL, create a separate database and database user instead. Docker is not required for that option.

### Configure and seed MPS

Edit MPS `.env` in a trusted editor. Required configuration:

- `DATABASE_URL`: for the Docker option, `postgresql://mps:URL_ENCODED_PASSWORD@127.0.0.1:5433/mps_hackathon?schema=public`. Use the same password as `.postgres.env`, percent-encoded for a URL. For local PostgreSQL, use its own host, port, and dedicated database.
- `ENCRYPTION_KEY`: a new random secret with at least 32 characters. Keep it with the database; changing it prevents decryption of saved wallets.
- `ADMIN_KEY`: a separate random secret with at least 32 characters. Replace the public example value.
- `BLOCKFROST_API_KEY_PREPROD`: a Blockfrost project key for Cardano Preprod, from https://blockfrost.io/.
- `PORT=3012`, `SEED_ONLY_IF_EMPTY=true`, `AUTO_WITHDRAW_PAYMENTS=true`.

Leave `BLOCKFROST_API_KEY_MAINNET` and all Mainnet wallet fields empty.
Leave `SEED_V1_LEGACY` empty. The default seed creates a `Web3CardanoV2` Preprod payment source.
For a new demo, leave purchasing and selling mnemonic fields empty to generate dedicated test wallets.
Leave collection address overrides empty so seller payout uses the selling wallet.
Do not enter example contract addresses or policy IDs as custom overrides.

Install the repository's locked packages. If Socket Firewall is installed, use it.

```sh
if command -v sfw >/dev/null 2>&1; then
  sfw pnpm install --frozen-lockfile
else
  pnpm install --frozen-lockfile
fi
```

```sh
pnpm run prisma:generate
```

```sh
pnpm run prisma:migrate
```

Run migration commands only against the new demo database. `prisma:migrate` applies checked-in migrations without a shadow database.
Ask the participant to run seeding in their own trusted terminal. Generated wallet mnemonics can be printed once.
Do not run this through a coding-agent transcript or record its secret output.

```sh
pnpm run prisma:seed
```

```sh
pnpm -C frontend run build
```

```sh
pnpm run dev
```

The frontend build is required for the admin dashboard. `pnpm run dev` starts the API and background payment jobs.
Keep that process and PostgreSQL running until seller collection confirms. Prevent the machine from sleeping.

### Check the node and fund wallets

Check the node from another terminal:

```sh
curl --fail http://127.0.0.1:3012/api/v1/health
```

```sh
curl --fail http://127.0.0.1:3012/api-docs -o mps-openapi.json
```

The health response should contain `status: "success"` and `data.status: "ok"`.
Health alone does not prove funded wallets, registration, or payment readiness.
Open http://127.0.0.1:3012/admin/ in a browser. Sign in with the MPS admin key outside the coding agent.
Check the Preprod V2 payment source, purchasing wallet, and selling wallet.
Save public wallet addresses and source identifiers, not mnemonics.
Seeding creates configuration and wallets. It does not fund wallets or register your agent.

Fund the selling wallet with test ADA for registration, collateral, and settlement fees.
For a direct local buyer rehearsal, also fund the purchasing wallet with test ADA and at least 1 test USDM plus any fees.
For a Sokosumi Task, Core's buyer funds escrow after charging Workspace credits. Your local purchasing wallet does not replace that buyer.
Check actual Preprod balances before registration. Ask the payment team for test USDM if needed.

Send the participant a funding request with values read from this node:

- **Network:** Cardano Preprod. Use test assets only.
- **Selling wallet address:** the actual public address. Request test ADA for registration, collateral, and settlement fees.
- **Purchasing wallet address:** include only for an optional direct local buyer rehearsal. Request test ADA and test USDM.

State the measured balances and any known shortfall. Do not invent a fixed ADA requirement.
For the normal Sokosumi test, ask the participant to add Personal Workspace test credits through Stripe test mode.
Core supplies the buyer's escrow funds. The local selling wallet does not need USDM to receive the payment.
After "funded", query the wallet balances again. Resume registration only when its funding requirements are met.

### Register your paid agent

Before registration, implement the agent endpoint required by your access model.
`Standard` is the default and requires `apiBaseUrl`. `OpenApi` requires `openApiSpecUrl`. `X402` requires `x402ResourcesUrl`.
For a small Standard demo, use the base URL of your actual agent API. Test its documented input and output contract before registration.
This URL is different from the MPS base URL. A Coworker polling worker does not automatically serve an agent API.
For a local rehearsal, keep the endpoint local if all its callers are local. For public discovery or remote callers, host it over HTTPS.
Do not register a made-up endpoint or use the MPS URL as the agent URL.
Use the dashboard or the node's current OpenAPI to register your agent under the funded selling wallet.
Check all required registration fields, including name, description, access model, endpoint descriptor, and author.
Set the supported payment source to Cardano, Preprod, and `Web3CardanoV2` using the seeded source address.
Use only this pricing object in `supportedPaymentSources[].pricing`, not a top-level `AgentPricing`:

```json
{"pricingType":"Dynamic"}
```

Do not add `fixed`, `dynamic`, an asset allowlist, or `decimals` to that pricing object.
Wait for `RegistrationConfirmed`. Save the returned `agentIdentifier`, source index, policy ID, contract address, seller verification key, and seller wallet address.
The Masumi identifier is different from the Sokosumi Coworker ID and Vendor ID.

Create a separate MPS runtime key through the admin dashboard or current API.
Use `ReadAndPay` permissions, limited to Preprod and the selling wallet. Configure sufficient node usage credits if the key has usage limits.
Keep the admin key for setup only. MPS authenticates API requests with the `token` header.
The MPS runtime key is different from the Coworker runtime key. Import the Coworker key through the CLI vault as shown above.
Do not put either key in a public environment variable, browser bundle, Task, repository, or copied instructions.

### Configure your worker

Configure your worker with the following non-secret values. These are adapter settings to implement in your agent, not built-in Sokosumi environment variables.

```json
{
  "mpsBaseUrl": "http://127.0.0.1:3012/api/v1",
  "network": "Preprod",
  "paymentSourceType": "Web3CardanoV2",
  "agentIdentifier": "RETURNED_MASUMI_AGENT_IDENTIFIER",
  "supportedPaymentSourceIndex": 0,
  "policyId": "RETURNED_POLICY_ID",
  "smartContractAddress": "RETURNED_CONTRACT_ADDRESS",
  "sellerVkey": "RETURNED_SELLER_VERIFICATION_KEY",
  "sellerAddress": "RETURNED_SELLER_WALLET_ADDRESS",
  "coworkerId": "YOUR_COWORKER_ID",
  "vendorId": "YOUR_VENDOR_ID",
  "defaultQuote": {
    "amount": "1000000",
    "unit": "16a55b2a349361ff88c03788f93e1e966e5d689605d044fef722ddde0014df10745553444d"
  }
}
```

Use the actual returned source index, not an assumed `0` for an agent with multiple sources.
Install your agent repository's own locked dependencies. MPS does not install its model SDK or worker.
Check that the model-provider credential works and the worker can run a small interaction before a paid Task.
Load the MPS runtime token and model-provider credential from server-side secret storage.
Validate source, seller, token unit, amount, and fresh deadlines before posting a payment event.
Use Masumi's canonical input and result hashing rules. A plain SHA256 of a prompt or answer is not equivalent.

Keep the worker on the same machine for the simplest setup.
`127.0.0.1` points to the caller's machine. A deployed worker cannot reach your laptop's loopback URL.
If the worker is remote, provide authenticated HTTPS connectivity to MPS. Never expose the database or admin key publicly.
Sokosumi Task execution uses your outbound worker connection. Core does not need access to this local seller API for that path.
Only register a public agent endpoint if you also implement and host that endpoint; Coworker creation does not provide one.

### Check signed terms before payment

Signed terms compatibility: inspect the live Core and MPS schemas before requesting a quote.
The tested Preprod route used null `forceLayer` and `sellerReturnAddress` fields, with no seller collection override.
If Core cannot preserve non-null signed overrides, configure the seller defaults before creating fresh terms.
Never delete or edit fields in already signed terms. That invalidates the signature.
Test result hashing for the actual route with newlines, quotes, and backslashes. Verify raw and escaped-text behavior against its implementation; do not assume routes share a hash.
Define proof for each settlement state from its documented meaning. Do not infer seller receipt from a field name or require a disputed-payout summary for an ordinary withdrawal.

Checkpoint: verify health, migrations, the V2 source, funded selling wallet, confirmed Dynamic registration, scoped MPS token, worker connectivity, and saved non-secret configuration.
If a write times out, inspect the existing registration or payment before retrying it.
Allow time for signed deadlines, background jobs, and chain confirmations. V2 timed collection includes a delay after unlock; it is not immediate at Task completion.

### Run a paid Task

Second run: paid Task. Create a new Task under the same Coworker after preparing payment configuration.
Read the MPS node's current OpenAPI and https://www.masumi.network/dev/masumi/documentation before sending payment requests.
See https://developers.cardano.org/x402/ for Cardano agentic commerce resources.
Register the agent with Masumi separately. Configure the worker with both Masumi and Coworker identifiers.

Use these payment defaults:

- Network: Cardano Preprod.
- Registry pricing type: `Dynamic`.
- Default quote per Task: `1` test USDM, or `1000000` atomic units. Use strings or BigInt for amounts.
- Test USDM unit: `16a55b2a349361ff88c03788f93e1e966e5d689605d044fef722ddde0014df10745553444d`.

Follow this order for each paid Task:

- Request fresh signed seller terms. They bind registration, input hash, buyer nonce, amount, and payment deadlines. Keep signed fields unchanged.
- Submit `masumiPayment` to the Task event endpoint with the assigned Coworker credential. Core charges Workspace credits and creates a payment claim. Wait for confirmed escrow funding.
- Run the agent. Save its exact UTF-8 result and submit that result's `resultHash` to MPS. Then complete the Sokosumi Task.
- Wait for the signed unlock time and collect the payment. Continue until collection is confirmed.
- Use an independent on-chain check to verify the collection transaction and the intended seller's net test USDM received.

Checkpoint: save paid Task ID, payment identifiers, signed deadlines, exact result hash, collection transaction hash, seller address, token unit, and measured receipt.
CLI `runtime complete` does not submit `masumiPayment`, submit the MPS result hash, or collect escrow automatically.
The worker must perform those payment steps. Task completion, a credit debit, and `PURCHASED` are not seller payment proof.
If collection is pending, report payment as pending. Preserve signature errors and ask the payment team to inspect signed fields.

### Deploy for later testing

The recommended final setup is eve on Vercel, with a persistent worker, MPS, and PostgreSQL on Railway.
Other hosts work if they meet the same runtime and storage requirements.
A local setup is a rehearsal. Keep the deployed agent available so teams and judges can try it later.
Do not make deployment or collection a prerequisite for requesting event approval.

Deploy eve using https://github.com/vercel/eve/blob/main/docs/guides/deployment/vercel.mdx.
Configure model access and route authentication in the host environment. Save the deployed URL.
Test a real agent turn through the worker, including any Vercel Deployment Protection credentials.

For the worker, follow https://docs.railway.com/services and https://docs.railway.com/deployments/start-command.
Deploy the repository with the worker's actual start command. Do not use the eve development UI as the worker entry point.
Configure Coworker and Workspace IDs, hosted eve and MPS URLs, and scoped credentials in the host's secret storage.
Verify runtime authentication on the host. The laptop's OS credential vault is not available there.
Do not deploy the participant's browser login token or platform admin credentials.

Turn off Railway Serverless for the worker and MPS: https://docs.railway.com/deployments/serverless.
Configure restart policies: https://docs.railway.com/deployments/restart-policy.
Keep Task and payment journals in persistent storage. Container-local files can disappear on replacement.
Use one active executor per Coworker unless you have a shared lease.
Stop the local executor before starting the hosted executor. Prevent overlap during redeployment too.

Deploy PostgreSQL using https://docs.railway.com/databases/postgresql.
Connect MPS to the private database URL and follow https://github.com/masumi-network/masumi-payment-service/blob/main/docs/deployment.md.
Inject backend secrets at runtime. Do not bake `.env`, wallet secrets, or keys into the image.
Apply migrations to the intended database and perform first-time seeding in a trusted session.
Keep wallet seed output out of deployment logs and coding-agent output.
For an existing node, stop its worker and MPS before taking the final database copy.
Restore that copy with the original encryption key, then start the hosted MPS and worker.
Keep the old node stopped. Do not run separate database copies against the same wallets.
Do not reseed replacement wallets.
Back up the database and keep the encryption key recoverable in separate secret storage.
Use a scoped MPS payment token in the worker. Keep the database and MPS admin access private.
Update the Masumi registration if the registered agent API URL changed, then check registration confirmation.
Keep the Dynamic pricing and Preprod settings from step 4.

A payment node left on the laptop prevents later independent testing. Host MPS or use an available team node.
A laptop tunnel does not remove that dependency. Use HTTPS for public service connections.
For self-hosted eve, follow https://github.com/vercel/eve/blob/main/docs/guides/deployment/overview.md.

Verify the deployment with the developer's laptop offline:

- Create a fresh Task from another device. Confirm the hosted worker picks it up and returns the agent's answer.
- Run the paid flow and independently verify seller collection. Record the Task and transaction IDs.
- Restart the hosted worker. Verify saved progress survives and the same payment is not submitted twice.
- Check logs for errors without printing secrets. Confirm all required services remain available.

Checkpoint: save deployed URLs, service names, the tested repository revision, and evidence from the offline-laptop test.
Include the Coworker ID, sample Task input, access instructions, and a stated availability date in the submission.
Never publish credentials. Keep the deployment available through judging and the availability date you state.
If deployment is incomplete, describe that limit instead of claiming the agent is available for later testing.

## 5. Join the TOKEN2049 Workspace and request approval

When the agent is ready for event approval, join with the same account:
https://preprod.sokosumi.com/join/9Ycw8wzmzXB2WEKa-umzUJX6_GEFiVdu

Event organization ID: `01a109d1-32a9-71a3-a0e3-658b2a7987cd`.
Event Workspace slug: `token2049-origins-hackathon-2026-nws2r7`.
Joining adds Workspace membership. It does not change Vendor membership or approve the Coworker.
Use the existing Coworker ID and Vendor ID. Here, `--workspace-id` takes the event organization ID.

```sh
sokosumi --preprod coworkers connect COWORKER_ID --vendor-id VENDOR_ID \
  --workspace-id 01a109d1-32a9-71a3-a0e3-658b2a7987cd --json
```

```sh
sokosumi --preprod workspaces check 01a109d1-32a9-71a3-a0e3-658b2a7987cd --json
```

If access is `PENDING`, the request was submitted. Save the access ID and wait for an event owner or admin.
Do not register again. Retry connect with the same Coworker ID after approval.
Approval sends an in-app notification and an email according to System notification preferences.
The email subject is "COWORKER_NAME approved for WORKSPACE_NAME". Its link opens the Coworker; its command uses the existing IDs.
Check the notification's `runtimeAccessStatus` separately:

- `GRANTED`: runtime Vendor access was granted when the notice was created. Check current access and credits before the next Task.
- `PENDING`: wait for the Workspace owner or admin to approve runtime access, then retry the same Task.
- `NOT_REQUESTED`: the first runtime attempt can request access. Wait for approval before retrying that Task.
- `DENIED` or `REVOKED`: ask the Workspace owner or admin to resolve runtime access.

Coworker approval does not mean both access records are approved. If no notice arrives, inspect connect status; do not submit a duplicate Coworker.
Check `GRANTED` Coworker access, `taskSeatEligible: true`, event Workspace credits, and a running worker.
Use `--organization-slug token2049-origins-hackathon-2026-nws2r7` for event Task commands instead of `--personal`.
Use `--organization-id 01a109d1-32a9-71a3-a0e3-658b2a7987cd` for event runtime commands instead of `--personal`.
Do not combine personal and organization options.

Checkpoint: save event access ID and status, eligibility result, and runtime grant status. Reuse the existing Coworker.

## 6. Submit code and payment proof

Write a setup guide with actual commands and configuration. For each problem, record the exact error and how it was resolved.
If the cause is unknown, say so. Keep secrets out of the guide.
Use https://www.masumi.network/token2049/submission for the submission checklist.
Submit the project on BuilderBase: https://builderbase.com/event/token2049-origins-hackathon.
Build the submitted project during the official 36-hour hacking period. Existing libraries and developer tools are allowed.
Follow the official rules at https://builderbase.com/event/token2049-origins-hackathon#rules.
Show actual input and output. Explain how you checked result quality and which steps needed human help.

Submit these artifacts:

- Public repository, or judge access, and run instructions for the small agent.
- Hosted project link and Google Drive link to a .ppt or .keynote presentation. Embed the demo recording in the slides; live stage demos and external video links are not accepted.
- Coworker ID, rehearsal and paid Task IDs, completed results, and event IDs.
- At least one confirmed Cardano Preprod payment-node transaction hash and its explorer link. Include payment identifiers, signed deadlines, receipt, and confirmed collection transaction hash.
- Intended seller address, token unit, and independent net receipt measurement.

Checkpoint: record execution and payment outcomes separately. Do not claim the full paid test passed until collection is confirmed.
Ask for missing account, Task, payment-node, or wallet configuration before dependent work.

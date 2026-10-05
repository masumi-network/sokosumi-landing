# TOKEN2049: build and test a paid agent

Use this guide with the participant's existing agent setup. A two-sentence reply is enough for the first test.
Start in the Personal Workspace. Prove execution first, then run a separate paid Task.
When the agent is ready for event approval, join the event and connect the same Coworker.

Keep a local setup record with IDs, completed checkpoints, exact errors, and payment evidence. Exclude secrets.
Before resuming, read that record and inspect current state. An uncertain write can already have created a record.

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

```sh
sokosumi --preprod vendors me --json
sokosumi --preprod coworkers list --scope owned --json
```

The required Vendor membership role is `admin`, not a platform admin role.
Create a new Vendor by default, with the participant's chosen name and unused slug.
Use an existing Vendor only if the participant chooses it, or it was already created for this setup.
A `developer` role cannot connect a Coworker through this flow.

```sh
sokosumi --preprod vendors create --name "YOUR_VENDOR_NAME" --slug YOUR_VENDOR_SLUG --json
sokosumi --preprod coworkers register \
  --vendor-id VENDOR_ID --name "YOUR_COWORKER_NAME" \
  --capability tasks --personal --json
```

Replace placeholders with returned IDs. Registration creates a private Coworker, not a running worker.
When resuming, use the existing Coworker ID instead of registering again:

```sh
sokosumi --preprod coworkers connect COWORKER_ID \
  --vendor-id VENDOR_ID --personal --json
sokosumi --preprod workspaces list --personal --json
```

Ask the participant to run the following pipe in a trusted terminal outside the coding agent.
It imports the runtime key through stdin. Do not copy the key into chat or a configuration file.

```sh
sokosumi --preprod coworkers api-key COWORKER_ID --json | \
  sokosumi --preprod runtime key-import \
    --coworker-id COWORKER_ID --api-key-stdin
```

The account login creates Tasks. The runtime key executes Tasks as the assigned Coworker.
Never replace the Coworker credential with the participant's OAuth token. Do not inspect credential stores.
If secure key import fails, preserve the error and ask the participant to fix the credential vault.
Start a worker using the participant's existing agent setup. Use one executor per Task.

Checkpoint: save Vendor ID, Coworker ID, Personal Workspace ID, and returned access ID. Personal Coworker access must be `GRANTED`.
Record whether key import succeeded. Do not put keys in logs, source, Task output, or screenshots.

## 3. Add test credits and run a paid Task

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
node --version
pnpm --version
# Only for the Docker database option:
docker --version
docker info
```

Clone the payment service. Record the revision so another participant can reproduce your setup.

```sh
git clone https://github.com/masumi-network/masumi-payment-service.git
cd masumi-payment-service
git rev-parse HEAD
cp .env.example .env
chmod 600 .env
```

### Choose your database

Docker database option: create a private `.postgres.env` file in a trusted editor.
Set `POSTGRES_USER=mps`, `POSTGRES_DB=mps_hackathon`, and `POSTGRES_PASSWORD` to a new random password.
Exclude this file from Git. Never reuse a real database password.
Run this once for a new database. On resume, inspect the existing container and volume instead of creating replacements.

```sh
chmod 600 .postgres.env
docker run --name token2049-postgres \
  --env-file .postgres.env \
  -p 127.0.0.1:5433:5432 \
  -v token2049-postgres-data:/var/lib/postgresql/data \
  -d postgres:16
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
pnpm run prisma:generate
pnpm run prisma:migrate
```

Run migration commands only against the new demo database. `prisma:migrate` applies checked-in migrations without a shadow database.
Ask the participant to run seeding in their own trusted terminal. Generated wallet mnemonics can be printed once.
Do not run this through a coding-agent transcript or record its secret output.

```sh
pnpm run prisma:seed
pnpm -C frontend run build
pnpm run dev
```

The frontend build is required for the admin dashboard. `pnpm run dev` starts the API and background payment jobs.
Keep that process and PostgreSQL running until seller collection confirms. Prevent the machine from sleeping.

### Check the node and fund wallets

Check the node from another terminal:

```sh
curl --fail http://127.0.0.1:3012/api/v1/health
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

## 4. Join the TOKEN2049 Workspace and request approval

When the agent is ready for event approval, join with the same account:
https://preprod.sokosumi.com/join/9Ycw8wzmzXB2WEKa-umzUJX6_GEFiVdu

Event organization ID: `01a109d1-32a9-71a3-a0e3-658b2a7987cd`.
Event Workspace slug: `token2049-origins-hackathon-2026-nws2r7`.
Joining adds Workspace membership. It does not change Vendor membership or approve the Coworker.
Use the existing Coworker ID and Vendor ID. Here, `--workspace-id` takes the event organization ID.

```sh
sokosumi --preprod coworkers connect COWORKER_ID --vendor-id VENDOR_ID \
  --workspace-id 01a109d1-32a9-71a3-a0e3-658b2a7987cd --json
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

## 5. Submit code and payment proof

Write a setup guide with actual commands and configuration. For each problem, record the exact error and how it was resolved.
If the cause is unknown, say so. Keep secrets out of the guide.
Use https://www.masumi.network/token2049/submission for the submission checklist.
Show actual input and output. Explain how you checked result quality and which steps needed human help.

Submit these artifacts:

- Repository and run instructions for the small agent.
- Coworker ID, rehearsal and paid Task IDs, completed results, and event IDs.
- Payment identifiers, signed deadlines, receipt, and confirmed collection transaction hash.
- Intended seller address, token unit, and independent net receipt measurement.

Checkpoint: record execution and payment outcomes separately. Do not claim the full paid test passed until collection is confirmed.
Ask for missing account, Task, payment-node, or wallet configuration before dependent work.

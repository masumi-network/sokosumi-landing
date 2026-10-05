import SkipLink from "./skip-link";
import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@summation/shared";
import GuideNav from "./guide-nav";
import { CREDITS_URL, EVENT, SIGNUP_URL } from "./flow";
import AudienceGuide from "./audience-guide";
import Command, { Commands } from "./command";
import Details from "./disclosure";
import { readAgentGuide } from "./guide-source";
import ui from "./guide-ui.module.css";
import PaymentSculpture from "./payment-sculpture";
import ExpertiseMotion from "./expertise-motion";
import motion from "./token-motion.module.css";

const JOIN_URL = EVENT.joinUrl;
const ORGANIZATION_ID = EVENT.organizationId;
const TEST_USDM_UNIT = "16a55b2a349361ff88c03788f93e1e966e5d689605d044fef722ddde0014df10745553444d";
const INSTALL = [
  `npm i -g @masumi_network/sokosumi`,
  `sokosumi --version`,
  `sokosumi --preprod auth login`,
  `sokosumi --preprod auth whoami`,
  `sokosumi skills`
];
const REGISTER = `sokosumi --preprod coworkers register \\
  --vendor-id VENDOR_ID --name "YOUR_COWORKER_NAME" \\
  --capability tasks --personal --json`;
const PERSONAL_CONNECT = [
  `sokosumi --preprod coworkers connect COWORKER_ID \\
  --vendor-id VENDOR_ID --personal --json`,
  `sokosumi --preprod workspaces list --personal --json`
];
const MANUAL_KEY = [
  `sokosumi --preprod coworkers api-key COWORKER_ID --json | \\
  sokosumi --preprod runtime key-import \\
  --coworker-id COWORKER_ID --api-key-stdin`
];
const EVENT_CONNECT = [
  `sokosumi --preprod coworkers connect COWORKER_ID \\
  --vendor-id VENDOR_ID --workspace-id ${ORGANIZATION_ID} --json`,
  `sokosumi --preprod workspaces check ${ORGANIZATION_ID} --json`
];
const PRICING = `Network: Cardano Preprod
Pricing type: Dynamic
Default quote: 1 test USDM per Task
Atomic amount: 1000000
Token unit: ${TEST_USDM_UNIT}`;
const VENDOR = `sokosumi --preprod vendors create --name "Your Vendor" --slug your-unique-vendor-slug --json`;
const RUN = [
  `sokosumi --preprod tasks create \\
  --personal \\
  --coworker-id COWORKER_ID --name "Tiny agent demo" \\
  --description "Write a two-sentence welcome for the hackathon." \\
  --status READY --json`,
  `sokosumi --preprod runtime start TASK_ID --coworker-id COWORKER_ID \\
  --personal --json`,
  `sokosumi --preprod runtime complete TASK_ID --coworker-id COWORKER_ID \\
  --personal --result-file ./result.txt --json`
];

export const metadata: Metadata = {
  title: "TOKEN2049 hackathon setup guide",
  description: "Connect your agent to Sokosumi, run a real Task, and prove a seller payment on Cardano Preprod.",
  alternates: { canonical: "/token2049" },
};

function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className={`${motion.reveal} scroll-mt-28 border-b border-black/10 py-12 last:border-0 sm:py-16`} aria-labelledby={`step-${number}`}>
    <div className="mb-6 flex items-start gap-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#171717] text-sm font-medium text-white" aria-hidden="true">{number}</span>
      <h2 id={`step-${number}`} className="scroll-mt-32 pt-1 text-xl font-medium tracking-tight sm:text-2xl">{title}</h2>
    </div>
    <div className="space-y-5 text-base leading-7 text-[#454545] sm:ps-[52px]">{children}</div>
  </section>;
}

const textLink = "font-medium text-[#171717] underline decoration-[#FA008C] underline-offset-4 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FA008C]";

export default async function Token2049Guide() {
  const agentGuide = await readAgentGuide();
  return <>
    <SkipLink /><Header product="masumi" />
    <main id="guide-main" tabIndex={-1} className="mx-auto max-w-6xl px-6 pb-28 pt-36 sm:px-12 sm:pb-36 sm:pt-48">
      <GuideNav current="/token2049" />
      <section aria-labelledby="hackathon-title" className={`${motion.hero} mb-12 sm:mb-16`}>
        <div>
        <p className="mb-6 animate-fade-in-up text-sm font-medium text-[#171717]">TOKEN2049 Origins Hackathon · 6 to 8 October 2026</p>
        <h1 id="hackathon-title" className="animate-fade-in-up animation-delay-100 text-balance text-4xl font-medium leading-[1.12] tracking-[-0.035em] sm:text-5xl">Build an agent that <span className="text-[#B90065]">gets paid.</span></h1>
        <p className="mt-5 animate-fade-in-up animation-delay-200 text-pretty text-lg leading-8 text-[#454545]">Run your agent in Sokosumi and earn 1 test USDM on Cardano Preprod. Test privately, then share it with the event Workspace.</p>
        </div>
        <PaymentSculpture />
      </section>

      <AudienceGuide guide={agentGuide}>
      <div className="grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-16">
        <nav aria-label="Guide sections" className="self-start lg:sticky lg:top-28">
          <p className="mb-4 text-sm font-medium">Your path</p>
          <ol className="flex flex-wrap gap-x-6 gap-y-4 text-sm leading-6 lg:block lg:space-y-5">
            <li><a href="#expertise" className={textLink}>Start · Your expertise</a></li>
            <li><a href="#step-1" className={textLink}>01 · Account</a></li>
            <li><a href="#step-2" className={textLink}>02 · Coworker</a></li>
            <li><a href="#step-3" className={textLink}>03 · Build your agent</a></li>
            <li><a href="#step-4" className={textLink}>04 · Test and deploy</a></li>
            <li><a href="#step-5" className={textLink}>05 · Event approval</a></li>
            <li><a href="#step-6" className={textLink}>06 · Submission</a></li>
          </ol>
        </nav>
        <div className="min-w-0">
          <section id="expertise" aria-labelledby="expertise-title" className="scroll-mt-32 border-b border-black/10 py-12 sm:py-16">
            <ExpertiseMotion>
            <h2 id="expertise-title" className="mb-6 text-xl font-medium tracking-tight sm:text-2xl">Connect your expertise</h2>
            <div className="space-y-6 text-base leading-7 text-[#454545]">
              <p>Start with a field you know and a business problem you understand. Build an agent that helps a specific team finish a real job.</p>
              <blockquote className={`${motion.expertiseQuote} ps-5 text-lg leading-8 text-[#171717]`}>For [team], turn [input] into [useful result], so they can [make a decision or take action].</blockquote>
              <dl className={`${ui.surface} ${motion.expertiseTips} grid gap-x-8 gap-y-7 bg-white p-6 sm:grid-cols-2 sm:p-8`}>
                <div><dt className="font-medium text-[#171717]">Choose the team</dt><dd className="mt-2">Think B2B: which team needs your expertise, and who pays for it? Your Coworker can cover an area of work or specialize in a particular job. Start with one small Task to test it.</dd></div>
                <div><dt className="font-medium text-[#171717]">Use what you know</dt><dd className="mt-2">Give the agent your process, decision rules, and examples of good work. A clear method matters more than extra tools.</dd></div>
                <div><dt className="font-medium text-[#171717]">Connect useful sources</dt><dd className="mt-2">Use documents, APIs, or records that the job needs. Start with public, synthetic, or approved company data. Include source links in the result.</dd></div>
                <div><dt className="font-medium text-[#171717]">Keep useful outputs in mind</dt><dd className="mt-2">Your goals can develop as you build. Keep asking what would help the team. Use examples to check accuracy, review time, or another useful outcome.</dd></div>
              </dl>
              <p>Give this job description to your coding agent along with the <Link href="/token2049/agent" className={textLink}>full setup brief</Link>. Then connect your account and Coworker below.</p>
              <Details title="Other ways to build" description="Explore buyer agents, paid APIs, and agent-to-agent infrastructure.">
                <p>This guide focuses on the in-between role: connect a Coworker to Sokosumi and build agent-to-agent flows with Masumi. You can also build for either side of the market.</p>
                <ul className="list-disc space-y-4 ps-5">
                  <li><strong className="font-medium text-[#171717]">Seller: monetize per request.</strong> Monetize your endpoints, APIs, or content per request. Agents pay with x402: no accounts, no API keys.</li>
                  <li><strong className="font-medium text-[#171717]">Buyer: agents that pay for what they use.</strong> Build an agent that uses other agents or services and pays for them while it works.</li>
                  <li><strong className="font-medium text-[#171717]">In between: agent-to-agent flows.</strong> Build a Sokosumi Coworker with Masumi escrow, refunds, disputes, identity, and discovery. Build the tools and infrastructure around these flows.</li>
                </ul>
                <p><a href="https://developers.cardano.org/x402/" className={textLink}>Explore Cardano agentic commerce resources</a>, or <a href="https://builderbase.com/event/token2049-origins-hackathon" className={textLink}>browse the other partner tracks on BuilderBase</a>.</p>
                <p>Need help choosing a Masumi integration? <Link href="/contact" className={textLink}>Contact the Masumi team</Link>.</p>
              </Details>
            </div>
            </ExpertiseMotion>
          </section>

          <Step number="1" title="Create your account">
            <p><a href={SIGNUP_URL} className={textLink}>Sign up on Sokosumi Preprod</a>. Use the same account for CLI sign-in. Start in your Personal Workspace.</p>
            <Details title="Check your setup before building" description="Verify the account, existing records, and interfaces before creating anything.">
              <p>Ask your coding agent to check the installed CLI commands, live API schemas, and access requirements first. Reuse existing records when resuming.</p>
              <p>Reusing a working agent? Keep its model provider, endpoint, and configuration. Test one small reply before connecting Sokosumi.</p>
              <p>Prove model execution, then a Coworker Task, then seller payment. Each checkpoint needs its own evidence. The <Link href="/token2049/agent" className={textLink}>full agent brief</Link> includes recovery and failure checks.</p>
            </Details>
            <Details title="Install the CLI and sign in">
              <p>Use Node.js 24. Install the latest Sokosumi CLI, then check your identity.</p>
              <Commands>{INSTALL}</Commands>
            </Details>
          </Step>

          <Step number="2" title="Create a private Coworker">
            <p>A Coworker connects your agent to Sokosumi. Create it under a new Vendor for this project.</p>
            <Details title="Create the Vendor and Coworker">
              <p><strong className="font-semibold text-[#171717]">You need organization membership before creating a Vendor.</strong> Check your account:</p>
              <Command>{`sokosumi --preprod workspaces list --json`}</Command>
              <p>If no organization appears, open Sokosumi&apos;s Workspace switcher and create a demo organization, or join an existing one. Then run the check again. You can join TOKEN2049 later.</p>
              <p>Organization membership lets you create the Vendor. Continue testing in your <strong className="font-semibold text-[#171717]">Personal Workspace</strong>.</p>
              <p>Choose a Vendor name and a unique slug. Keep the returned Vendor ID.</p>
              <Command>{VENDOR}</Command>
              <p>If you are resuming setup, reuse your saved Vendor ID. You can also use an existing Vendor where your role is <code>admin</code>.</p>
              <p>Replace <code>VENDOR_ID</code> and choose a unique Coworker name.</p>
              <Command>{REGISTER}</Command>
              <p>Keep the Coworker ID and Vendor ID. Check for <code>GRANTED</code> personal access. If a request has an uncertain outcome, inspect existing records before retrying. Do not register a duplicate.</p>
            </Details>
            <Details title="Connect your Coworker and configure its worker">
              <p>Replace both IDs to connect your Coworker to your Personal Workspace.</p>
              <Commands>{PERSONAL_CONNECT}</Commands>
              <p><strong className="font-semibold text-[#171717]">Select Personal Workspace in Sokosumi&apos;s Workspace switcher to see your personal Coworker.</strong> It will appear in the event Workspace after event access is approved.</p>
              <p>Your coding agent can save the runtime key to your project&apos;s ignored <code>.env.local</code> and import it into the CLI vault. Give it the <Link href="/token2049/agent" className={textLink}>full agent brief</Link> and your IDs. Keep keys out of chat, code, logs, and screenshots.</p>
            </Details>
            <Details title="Manual alternative: import the runtime key into the CLI">
              <p>If you are setting up without a coding agent, run this in your project terminal. It imports the key into the CLI vault without printing it. It does not write an environment file.</p>
              <Commands>{MANUAL_KEY}</Commands>
              <p>Build the worker in step 3.</p>
            </Details>
          </Step>

          <Step number="3" title="Build and connect your agent">
            <p>Build the agent and a worker that sends it Sokosumi Tasks. Use <strong className="font-semibold text-[#171717]">Vercel eve</strong> by default, or connect your existing agent.</p>
            <p>For a reference implementation, see the <a href="https://github.com/masumi-network/demo-agent-token2049" className={textLink}>TOKEN2049 demo agent repository</a>. It will be made public when the hackathon starts.</p>
            <Details title="Build with Vercel eve">
              <p>Use Node.js 24 or newer. Create an eve project, connect your model in its terminal UI, and send a test message.</p>
              <p>Use sfw before npx if Socket Firewall is installed.</p>
              <Command>{`npx eve@latest init my-agent`}</Command>
              <p>To return to the project later:</p>
              <Command>{`cd my-agent`}</Command>
              <Command>{`npm run dev`}</Command>
              <p>Edit <code>agent/instructions.md</code> to define the job and expected answer. Configure the model in <code>agent/agent.ts</code>. Add tools only when the job needs them. Keep the generated lockfile.</p>
              <p><a href="https://github.com/vercel/eve/blob/main/docs/getting-started.mdx" className={textLink}>Follow the eve quickstart</a>. Model access has its own credentials and costs, separate from Workspace credits.</p>
            </Details>
            <Details title="Try a low-cost model with your local agent">
              <p><strong className="font-semibold text-[#171717]">GLM-5.3-Flash</strong> is a low-cost option for your demo. Run eve locally and configure its model provider to call Z.ai with model ID <code>glm-5.3-flash</code>.</p>
              <p>For a new integration, check Z.ai&apos;s current endpoint and model access requirements. When reusing a working setup, preserve its endpoint and provider configuration. Keep the API key in server-side secret storage. Test a small reply before connecting the Task worker. Model charges are separate from Workspace credits.</p>
              <p>In this setup, your agent runs locally and Z.ai hosts the model. To run the model itself on your own hardware, follow its self-hosting guide and check the hardware requirements first.</p>
              <ul className="space-y-3">
                <li><a href="https://docs.z.ai/guides/vlm/glm-5.3-flash" className={textLink}>GLM-5.3-Flash model guide</a> and <a href="https://docs.z.ai/guides/overview/pricing" className={textLink}>current API pricing</a></li>
                <li><a href="https://docs.z.ai/api-reference/introduction" className={textLink}>Configure the Z.ai API</a></li>
                <li><a href="https://huggingface.co/zai-org/GLM-5.3-Flash#serve-glm-53-flash-locally" className={textLink}>Self-host GLM-5.3-Flash</a></li>
              </ul>
            </Details>
            <Details title="Wire your worker to the agent and payments">
              <p>The worker is the connection between Sokosumi, eve, and MPS. Configure it with your Coworker ID and Personal Workspace, the eve URL, and, later, the MPS settings from step 4.</p>
              <p>Keep the Coworker runtime key and agent route credentials in worker secret storage. Add a scoped MPS payment key for the paid test. Keep all keys out of model context.</p>
              <ol className="list-decimal space-y-4 ps-5">
                <li>Find a ready Task assigned to your Coworker. Save its ID and input.</li>
                <li>Start execution through the CLI runtime. Send the input to eve and wait for its final answer.</li>
                <li>Save the exact answer, then complete the Task with that file.</li>
              </ol>
              <p>Store completed stages before retries. Run one executor per Coworker. Add the paid sequence from step 4 after this execution path works.</p>
            </Details>
            <Details title="Run locally first">
              <p>Run eve and your worker in separate terminals. Add MPS and PostgreSQL for the paid test in step 4. Keep every process running.</p>
              <p>A polling worker needs no public URL. Your Masumi registration needs a separate agent API. Deploying eve alone does not deploy the worker or payment node.</p>
            </Details>
            <Details title="Make results useful and repeatable">
              <p>Choose one clear job, such as summarizing a document with source links. Explain the input, output, and limits in your instructions.</p>
              <ul className="list-disc space-y-3 ps-5">
                <li>Test a normal input and check the answer against the source.</li>
                <li>Test missing information. Ask for it or explain the limit instead of inventing an answer.</li>
                <li>Test a tool failure and a worker restart. Preserve Task and payment state before retrying.</li>
                <li>Save examples of the input and exact result. Use them to check each change.</li>
              </ul>
              <p>Test Task pickup in step 4 after adding credits. </p>
              <p><Link href="/token2049/submission" className={textLink}>See what judges assess</Link>, including result quality and how useful your agent is.</p>
            </Details>
          </Step>

          <Step number="4" title="Test payment and deploy">
            <p><a href={CREDITS_URL} className={textLink}>Add test credits</a> to your Personal Workspace before creating a Task.</p>
            <p>First test execution. Then run a paid Task for <strong className="font-medium text-black">1 test USDM</strong>. Workspace credits and escrow test USDM are separate.</p>
            <Details title="Add credits with a Stripe test card" description="Top up your Personal Workspace with test credits.">
              <p>Billing applies to your active Workspace. <strong className="font-semibold text-[#171717]">Select Personal Workspace</strong> before opening billing.</p>
              <p><strong className="font-semibold text-[#171717]">Use Stripe test mode only.</strong></p>
              <dl className="grid gap-4 rounded-lg bg-[#F7F2F5] p-5 text-sm sm:grid-cols-3">
                <div><dt className="mb-1 font-semibold text-[#171717]">Test card number</dt><dd className="font-mono font-semibold text-[#171717]">4242 4242 4242 4242</dd></div>
                <div><dt className="mb-1 font-semibold text-[#171717]">Expiry date</dt><dd>Any future date</dd></div>
                <div><dt className="mb-1 font-semibold text-[#171717]">CVC</dt><dd>Any three digits</dd></div>
              </dl>
              <p><strong className="font-semibold text-[#171717]">Check your Personal Workspace credit balance</strong> before creating a Task.</p>
              <p><a href="https://docs.stripe.com/testing" className={textLink}>Read Stripe&apos;s test instructions</a>.</p>
            </Details>
            <Details title="Run a small Task in your Personal Workspace" description="Your worker picks up a Task and saves the agent's answer.">
              <p>This first test checks execution without payment. Replace <code>COWORKER_ID</code>, then use the returned <code>TASK_ID</code>.</p>
              <Commands>{RUN}</Commands>
              <p>Your CLI login creates the Task. Your worker uses its runtime key to start it and save the exact answer in <code>result.txt</code>.</p>
              <p>If runtime returns <code>grant_required</code>, open Personal Workspace notifications. As the Workspace owner, approve your separate Vendor grant request. Retry the same Task.</p>
            </Details>
            <section aria-labelledby="payment-node-title" className={ui.disclosureGroup}>
              <div className={ui.groupHeading}>
                <h3 id="payment-node-title" className="text-lg font-medium tracking-tight text-[#171717]">Set up your payment node</h3>
                <p className="mt-2 text-sm leading-6">Configure MPS, prepare its wallets, and connect it to your worker.</p>
              </div>
            <Details title="Check tools and prepare configuration" description="Choose Docker or local PostgreSQL, then configure a dedicated demo database.">
              <p>Run Masumi Payment Service (MPS) on your machine. It handles registration, signed payment terms, and seller collection through Cardano Preprod.</p>
              <p>You need Git, Node.js 24, pnpm 10.30.2, PostgreSQL 13 or later, and a Preprod Blockfrost key. Docker is optional: use it for PostgreSQL, or use a local database. You do not need a full Cardano node.</p>
              <Command>{`git --version`}</Command>
              <Command>{`node --version`}</Command>
              <Command>{`pnpm --version`}</Command>
              <p>If you use Docker for PostgreSQL:</p>
              <Command>{`docker --version`}</Command>
              <Command>{`docker info`}</Command>
              <ol className="list-decimal space-y-4 ps-5">
                <li>Clone <a href="https://github.com/masumi-network/masumi-payment-service" className={textLink}>Masumi Payment Service</a>. Create a dedicated demo database. The agent guide includes the Docker command and a local PostgreSQL alternative.</li>
                <li>Copy <code>.env.example</code> to a private <code>.env</code>. Set the database URL, a new encryption key, a new admin key, your Preprod Blockfrost key, and <code>PORT=3012</code>. Keep Mainnet settings empty.</li>
              </ol>
              <p><Link href="/token2049/agent" className={textLink}>Use the full guide for database creation and environment settings</Link>.</p>
            </Details>
            <Details title="Install and seed the database" description="Run migrations and create the demo wallets.">
              <p>From the MPS repository, after configuring <code>.env</code>, install locked packages and apply migrations to your dedicated demo database.</p>
              <Command>{`if command -v sfw >/dev/null 2>&1; then
  sfw pnpm install --frozen-lockfile
else
  pnpm install --frozen-lockfile
fi`}</Command>
              <Command>{`pnpm run prisma:generate`}</Command>
              <Command>{`pnpm run prisma:migrate`}</Command>
              <p>Run seeding yourself in a trusted terminal. It can print wallet mnemonics. Keep that output out of coding-agent chats, logs, and screenshots.</p>
              <Command>{`pnpm run prisma:seed`}</Command>
            </Details>
            <Details title="Start and check the service" description="Build the dashboard, start MPS, and verify its health.">
              <Command>{`pnpm -C frontend run build`}</Command>
              <Command>{`pnpm run dev`}</Command>
              <p>Keep MPS running. Run these checks in a separate terminal:</p>
              <Command>{`curl --fail http://127.0.0.1:3012/api/v1/health`}</Command>
              <Command>{`curl --fail http://127.0.0.1:3012/api-docs -o mps-openapi.json`}</Command>
            </Details>
            <Details title="Fund the wallet and register your agent" description="Connect the Preprod registration and scoped payment credentials to your worker.">
              <p>Open <code>http://127.0.0.1:3012/admin/</code>. Check the seeded Preprod V2 source and copy its selling wallet&apos;s public address. Fund that address with test ADA for registration and transaction fees.</p>
              <p>Implement and test your agent API first. A Standard registration needs its <code>apiBaseUrl</code>, which is different from the MPS URL. Open <code>http://127.0.0.1:3012/admin/</code> and register your agent with the Preprod V2 source and <code>{'{"pricingType":"Dynamic"}'}</code>. Wait for <code>RegistrationConfirmed</code>.</p>
              <p>Configure your worker with the returned Masumi identifier and payment source. Include the contract address, policy ID, seller verification key, and seller address. Use a separate MPS key with Preprod and selling-wallet access. MPS uses the <code>token</code> header; this key is different from your Coworker key.</p>
              <p>Keep the worker and payment node on the same machine for the first test. A deployed worker needs authenticated HTTPS access to MPS. Its <code>127.0.0.1</code> points to the deployed machine, not your laptop.</p>
              <p>Seeding does not fund wallets or register your agent. Keep MPS and the database running until collection confirms. <Link href="/token2049/agent" className={textLink}>Read the full payment-node setup</Link>.</p>
            </Details>
            </section>
            <Details title="Run the paid Task and verify seller payment" description="A confirmed collection transaction proves the seller received test USDM.">
              <p>Use <code>Dynamic</code> pricing for your Masumi registration:</p>
              <Command configuration>{PRICING}</Command>
              <ol className="list-decimal space-y-4 ps-5">
                <li>Get new signed seller terms for the new paid Task. They bind the agent, input hash, buyer nonce, price, and payment deadlines. Keep signed fields unchanged.</li>
                <li>Submit the terms as <code>masumiPayment</code> through the assigned Coworker. Wait for confirmed escrow funding before executing the paid work.</li>
                <li>Run your agent and save its exact answer. Submit its <code>resultHash</code> to Masumi Payment Service (MPS), then complete the Sokosumi Task.</li>
                <li>Monitor through the unlock time and seller collection. Verify the confirmed transaction and the net test USDM received by the intended seller.</li>
              </ol>
              <p>Build these steps into your worker. Task completion does not submit seller terms or the result hash for you. A completed Task or <code>PURCHASED</code> claim does not prove seller payment.</p>
              <p>Fund the seller wallet with test ADA for transaction fees. Allow time for collection and blockchain confirmation. Preserve signature errors and ask the payment team for help.</p>
              <p><a href="https://www.masumi.network/dev/masumi/documentation" className={textLink}>Open Masumi developer documentation</a> or <Link href="/token2049/agent" className={textLink}>read the full implementation guide</Link>.</p>
            </Details>
            <Details title="Deploy so others can try your agent" description="Keep your agent, worker, and payment node online for later tests.">
              <p><strong className="font-semibold text-[#171717]">Recommended final setup:</strong> eve on Vercel, with the worker, MPS, and PostgreSQL hosted on Railway. Keep the full path online so teams and judges can create Tasks after you leave.</p>
              <ol className="list-decimal space-y-4 ps-5">
                <li><strong className="font-semibold text-[#171717]">Deploy eve.</strong> Follow the Vercel guide. Configure model access and route authentication. Save the deployed URL and test a real agent turn.</li>
                <li><strong className="font-semibold text-[#171717]">Deploy MPS and its database.</strong> Follow the MPS Docker guide. Use a private PostgreSQL connection and runtime secrets. When moving an existing node, stop its worker and MPS before the final database copy. Restore that copy with the original encryption key before starting the hosted node. Keep the old node stopped.</li>
                <li><strong className="font-semibold text-[#171717]">Deploy the worker.</strong> Create a persistent Railway service from your repository. Set its start command to your worker entry point. Configure hosted URLs and scoped credentials. Keep one executor active per Coworker.</li>
                <li><strong className="font-semibold text-[#171717]">Keep work safe across restarts.</strong> Turn off Railway Serverless for the worker and MPS. Configure restart policies. Store Task and payment progress in persistent storage. Stop the local worker before switching execution to the hosted worker.</li>
                <li><strong className="font-semibold text-[#171717]">Test with your laptop offline.</strong> Create a fresh Task in Sokosumi from another device. Check the answer, then verify seller collection for the paid test. Restart the hosted worker and check that it does not repeat a payment.</li>
              </ol>
              <p>A local payment node is useful for setup. For later testing, host it too or use an available team node. A laptop tunnel still depends on your laptop.</p>
              <ul className="space-y-3">
                <li><a href="https://github.com/vercel/eve/blob/main/docs/guides/deployment/vercel.mdx" className={textLink}>Vercel deployment guide for eve</a></li>
                <li><a href="https://docs.railway.com/services" className={textLink}>Railway services</a> and <a href="https://docs.railway.com/deployments/start-command" className={textLink}>worker start commands</a></li>
                <li><a href="https://docs.railway.com/databases/postgresql" className={textLink}>Railway PostgreSQL setup</a></li>
                <li><a href="https://github.com/masumi-network/masumi-payment-service/blob/main/docs/deployment.md" className={textLink}>MPS Docker deployment guide</a></li>
              </ul>
              <p>Include the deployed agent URL, Coworker ID, a sample Task, and the date through which you will keep it running. Share access instructions without exposing credentials.</p>
            </Details>
          </Step>

          <Step number="5" title="Request event approval when ready">
            <p><strong className="font-semibold text-[#171717]">Let other teams try your agent.</strong> After approval, teams in the TOKEN2049 Workspace can find your Coworker and create Tasks for it. Keep your worker running so it can deliver results.</p>
            <p><a href={JOIN_URL} className={textLink}>Join the TOKEN2049 Workspace</a> with the same account. Request access for your existing Coworker.</p>
            <Details title="Request access and check the approval notice">
              <p>Replace both IDs. Here, <code>--workspace-id</code> takes the event organization ID.</p>
              <Commands>{EVENT_CONNECT}</Commands>
              <p>Keep the access ID. Do not create another Coworker while waiting. After approval, retry connect with the same Coworker ID.</p>
              <p>The account that requested access receives an approval notification. Approval email follows that account&apos;s System notification settings.</p>
              <p>The notice gives your next CLI command and reports the separate runtime Vendor grant status. Coworker approval permits assignment; it does not by itself grant runtime access.</p>
              <p>If runtime access is pending, wait for owner or admin approval. If it was denied or revoked, ask them to review access. For <code>grant_required</code>, retry the same Task after the Vendor grant is approved.</p>
              <p>Check <code>GRANTED</code> Coworker access, <code>taskSeatEligible: true</code>, event Workspace credits, and a running worker before an event Task.</p>
            </Details>
          </Step>

          <Step number="6" title="Submit your code and proof">
            <p>Include your code, agent demo, completed Task, seller receipt, and a Cardano Preprod payment transaction with its explorer link.</p>
            <p><Link href="/token2049/submission" className={textLink}>Open the submission checklist</Link>. Submit on <a href="https://builderbase.com/event/token2049-origins-hackathon" className={textLink}>BuilderBase</a> by <strong className="font-medium text-black">7 October, 23:59</strong>.</p>
          </Step>
        </div>
      </div>
      </AudienceGuide>
    </main>
    <Footer product="masumi" />
  </>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@summation/shared";
import GuideNav from "./guide-nav";
import { CREDITS_URL, EVENT, SIGNUP_URL } from "./flow";
import CopyButton from "./copy-button";
import Command from "./command";
import { readAgentGuide } from "./guide-source";

const JOIN_URL = EVENT.joinUrl;
const ORGANIZATION_ID = EVENT.organizationId;
const TEST_USDM_UNIT = "16a55b2a349361ff88c03788f93e1e966e5d689605d044fef722ddde0014df10745553444d";
const INSTALL = `npm i -g @masumi_network/sokosumi
sokosumi --version
sokosumi --preprod auth login
sokosumi --preprod auth whoami
sokosumi skills`;
const REGISTER = `sokosumi --preprod coworkers register \\
  --vendor-id VENDOR_ID --name "YOUR_COWORKER_NAME" \\
  --capability tasks --personal --json`;
const PERSONAL_CONNECT = `sokosumi --preprod coworkers connect COWORKER_ID \\
  --vendor-id VENDOR_ID --personal --json
sokosumi --preprod workspaces list --personal --json
# Run this in your trusted terminal, outside your coding agent:
sokosumi --preprod coworkers api-key COWORKER_ID --json | \\
  sokosumi --preprod runtime key-import \\
  --coworker-id COWORKER_ID --api-key-stdin`;
const EVENT_CONNECT = `sokosumi --preprod coworkers connect COWORKER_ID \\
  --vendor-id VENDOR_ID --workspace-id ${ORGANIZATION_ID} --json
# If PENDING, wait for approval. Keep this Coworker ID and retry connect.
sokosumi --preprod workspaces check ${ORGANIZATION_ID} --json`;
const PRICING = `Network: Cardano Preprod
Pricing type: Dynamic
Default quote: 1 test USDM per Task
Atomic amount: 1000000
Token unit: ${TEST_USDM_UNIT}`;
const VENDOR = `sokosumi --preprod vendors me --json
# Only if you need a new Vendor:
sokosumi --preprod vendors create --name "Your Vendor" --slug your-unique-vendor-slug --json`;
const RUN = `sokosumi --preprod tasks create \\
  --personal \\
  --coworker-id COWORKER_ID --name "Tiny agent demo" \\
  --description "Write a two-sentence welcome for the hackathon." \\
  --status READY --json

sokosumi runtime start TASK_ID --coworker-id COWORKER_ID \\
  --personal --json

# Your agent writes its answer into ./result.txt.
sokosumi runtime complete TASK_ID --coworker-id COWORKER_ID \\
  --personal --result-file ./result.txt --json`;

export const metadata: Metadata = {
  title: "TOKEN2049 hackathon setup guide",
  description: "Connect your agent to Sokosumi, run a real Task, and prove a seller payment on Cardano Preprod.",
  alternates: { canonical: "/token2049" },
};

function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className="scroll-mt-28 py-10 sm:py-14" aria-labelledby={`step-${number}`}>
    <div className="mb-6 flex items-start gap-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#460A23] text-sm font-medium text-white" aria-hidden="true">{number}</span>
      <h2 id={`step-${number}`} className="scroll-mt-32 pt-1 text-xl font-medium tracking-tight sm:text-2xl">{title}</h2>
    </div>
    <div className="space-y-5 text-base leading-7 text-[#454545] sm:ps-[52px]">{children}</div>
  </section>;
}

function Details({ title, children }: { title: string; children: React.ReactNode }) {
  return <details className="rounded-xl border border-[#460A23]/15 bg-white">
    <summary className="cursor-pointer rounded-xl px-5 py-4 font-medium text-[#460A23] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#460A23]">{title}</summary>
    <div className="space-y-5 px-5 pb-6 pt-2">{children}</div>
  </details>;
}

const textLink = "font-medium text-[#460A23] underline decoration-[#FA008C] underline-offset-4 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#460A23]";

export default async function Token2049Guide() {
  const agentGuide = await readAgentGuide();
  return <>
    <Header product="masumi" />
    <main className="mx-auto max-w-6xl px-6 pb-28 pt-36 sm:px-12 sm:pb-36 sm:pt-48">
      <GuideNav current="/token2049" />
      <section aria-labelledby="hackathon-title" className="mb-14 sm:mb-20">
        <p className="mb-6 text-sm font-medium text-[#460A23]">TOKEN2049 Origins Hackathon · 6 to 8 October 2026</p>
        <h1 id="hackathon-title" className="max-w-[20ch] text-balance text-4xl font-medium leading-[1.12] tracking-[-0.035em] sm:text-5xl">Build an agent that <span className="text-[#B90065]">gets paid.</span></h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#454545]">Start with your own Sokosumi account and a private Coworker. Test your agent, request event approval when ready, and submit proof of seller payment on Cardano Preprod.</p>
        <a href={SIGNUP_URL} className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#460A23] px-7 py-3 font-medium text-white hover:bg-[#671037] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#460A23]">Create your Sokosumi account ↗</a>
      </section>

      <section aria-labelledby="agent-start" className="mb-14 rounded-2xl bg-[#F7E5EE] p-7 sm:mb-20 sm:p-10">
        <h2 id="agent-start" className="text-xl font-medium tracking-tight">Using a coding agent?</h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#454545]">Give it the full brief. The instructions cover account checks, setup, payment, and event approval.</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <CopyButton text={agentGuide} label="Copy agent instructions" />
          <Link href="/token2049/agent" className={textLink}>Read the guide</Link>
          <a href="/token2049/agent-guide.md" download className={textLink}>Download the guide</a>
        </div>
        <p className="mt-6 text-sm leading-6 text-[#454545]">Already have your IDs? <Link href="/token2049/setup#instructions" className={textLink}>Prepare commands for your Coworker</Link>.</p>
      </section>

      <div className="grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-16">
        <nav aria-label="Guide sections" className="self-start lg:sticky lg:top-28">
          <p className="mb-4 text-sm font-medium">Five steps</p>
          <ol className="flex flex-wrap gap-x-6 gap-y-4 text-sm leading-6 lg:block lg:space-y-5">
            <li><a href="#step-1" className={textLink}>01 · Account</a></li>
            <li><a href="#step-2" className={textLink}>02 · Coworker</a></li>
            <li><a href="#step-3" className={textLink}>03 · Test and payment</a></li>
            <li><a href="#step-4" className={textLink}>04 · Event approval</a></li>
            <li><a href="#step-5" className={textLink}>05 · Submission</a></li>
          </ol>
        </nav>
        <div className="min-w-0">
          <Step number="1" title="Create your account">
            <p><a href={SIGNUP_URL} className={textLink}>Sign up on Sokosumi Preprod</a>. Use the same account for CLI sign-in. Start in your Personal Workspace.</p>
            <Details title="Install the CLI and sign in">
              <p>Use Node.js 24. Install the latest Sokosumi CLI, then check your identity.</p>
              <Command>{INSTALL}</Command>
            </Details>
          </Step>

          <Step number="2" title="Create a private Coworker">
            <p>Your Coworker is your agent&apos;s Sokosumi identity. Create it under a Vendor you administer, with access to your Personal Workspace.</p>
            <p><Link href="/token2049/setup#instructions" className={textLink}>Get commands with your IDs</Link>.</p>
            <Details title="Create the Vendor and Coworker">
              <p>A Vendor owns the Coworker. Choose a Vendor where your role is <code>admin</code>, or create your own.</p>
              <Command>{VENDOR}</Command>
              <p>Replace <code>VENDOR_ID</code> and choose a unique Coworker name.</p>
              <Command>{REGISTER}</Command>
              <p>Keep the Coworker ID and Vendor ID. Check for <code>GRANTED</code> personal access. If a request has an uncertain outcome, inspect existing records before retrying. Do not register a duplicate.</p>
            </Details>
            <Details title="Connect your Coworker and configure its worker">
              <p>Replace both IDs. Run the key command yourself in a trusted terminal. It sends the runtime key directly to the CLI.</p>
              <Command>{PERSONAL_CONNECT}</Command>
              <p>Start or deploy your worker so it can execute Tasks. Creating the Coworker does not start a worker. Keep keys out of chat, code, logs, and screenshots.</p>
            </Details>
          </Step>

          <Step number="3" title="Add test credits and run your agent">
            <p>Switch to your Personal Workspace in Sokosumi Web. <a href={CREDITS_URL} className={textLink}>Add credits in Stripe test mode</a>, then check your balance.</p>
            <p>First test execution. Then run a paid Task for <strong className="font-medium text-black">1 test USDM</strong>. Workspace credits and escrow test USDM are separate.</p>
            <Details title="Add credits with a Stripe test card">
              <p>Billing applies to your active Workspace. Select Personal Workspace before opening billing.</p>
              <p>Use <code>4242 4242 4242 4242</code>, a future expiry date, and any three-digit CVC. Use test mode only.</p>
              <p><a href="https://docs.stripe.com/testing" className={textLink}>Read Stripe&apos;s test instructions</a>. Check your Personal Workspace credit balance before creating a Task.</p>
            </Details>
            <Details title="Run a small Task in your Personal Workspace">
              <p>This first test checks execution without payment. Replace <code>COWORKER_ID</code>, then use the returned <code>TASK_ID</code>.</p>
              <Command>{RUN}</Command>
              <p>Your CLI login creates the Task. Your worker uses its runtime key to start it and save the exact answer in <code>result.txt</code>.</p>
              <p>If runtime returns <code>grant_required</code>, open Personal Workspace notifications. As the Workspace owner, approve your separate Vendor grant request. Retry the same Task.</p>
            </Details>
            <Details title="Run the paid Task and verify seller payment">
              <p>Register your agent with Masumi separately from its Sokosumi Coworker. Configure <code>Dynamic</code> pricing with a default quote of 1 test USDM.</p>
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
          </Step>

          <Step number="4" title="Request event approval when ready">
            <p><a href={JOIN_URL} className={textLink}>Join the TOKEN2049 Workspace</a> with the same account. Request access for your existing Coworker.</p>
            <p>For <code>PENDING</code> access, wait for a Workspace owner or admin. Keep the same Coworker ID.</p>
            <Details title="Request access and check the approval notice">
              <p>Replace both IDs. Here, <code>--workspace-id</code> takes the event organization ID.</p>
              <Command>{EVENT_CONNECT}</Command>
              <p>Keep the access ID. Do not create another Coworker while waiting. After approval, retry connect with the same Coworker ID.</p>
              <p>The account that requested access receives an approval notification. Approval email follows that account&apos;s System notification settings.</p>
              <p>The notice gives your next CLI command and reports the separate runtime Vendor grant status. Coworker approval permits assignment; it does not by itself grant runtime access.</p>
              <p>If runtime access is pending, wait for owner or admin approval. If it was denied or revoked, ask them to review access. For <code>grant_required</code>, retry the same Task after the Vendor grant is approved.</p>
              <p>Check <code>GRANTED</code> Coworker access, <code>taskSeatEligible: true</code>, event Workspace credits, and a running worker before an event Task.</p>
            </Details>
          </Step>

          <Step number="5" title="Submit your code and proof">
            <p>Share your repository, an agent demo, the completed Task, and proof that the intended seller received payment.</p>
            <p><Link href="/token2049/submission" className={textLink}>Open the submission checklist</Link>. Submit on BuilderBase by <strong className="font-medium text-black">7 October, 23:59</strong>.</p>
            <Details title="Check what your payment proof shows">
              <p>Include the Task and Coworker IDs, receipt, collection transaction hash, seller address, token unit, and net amount received.</p>
              <p>If collection is pending, report it as pending. Keep secrets out of your submission.</p>
            </Details>
          </Step>
        </div>
      </div>
    </main>
    <Footer product="masumi" />
  </>;
}

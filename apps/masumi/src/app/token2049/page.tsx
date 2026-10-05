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
  return (
    <section className="scroll-mt-28 border-t border-black/10 py-12 sm:py-16" aria-labelledby={`step-${number}`}>
      <div className="mb-7 flex items-start gap-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#460A23] text-sm font-medium text-white" aria-hidden="true">{number}</span>
        <h2 id={`step-${number}`} className="scroll-mt-32 pt-1 text-xl font-medium tracking-tight sm:text-2xl">{title}</h2>
      </div>
      <div className="space-y-7 text-base leading-7 text-[#454545] sm:ps-[52px]">{children}</div>
    </section>
  );
}

const textLink = "font-medium text-[#460A23] underline decoration-[#FA008C] underline-offset-4 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#460A23]";

export default async function Token2049Guide() {
  const agentGuide = await readAgentGuide();
  return (
    <>
      <Header product="masumi" />
      <main className="mx-auto max-w-6xl px-6 pb-28 pt-36 sm:px-12 sm:pb-36 sm:pt-48">
        <GuideNav current="/token2049" />
        <section aria-labelledby="hackathon-title" className="mb-16 sm:mb-20">
          <p className="mb-6 text-sm font-medium text-[#460A23]">TOKEN2049 Origins Hackathon · 6 to 8 October 2026</p>
          <h1 id="hackathon-title" className="max-w-[20ch] text-balance text-4xl font-medium leading-[1.12] tracking-[-0.035em] sm:text-5xl">Build an agent that <span className="text-[#B90065]">gets paid.</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#454545]">Build a small AI agent, connect it to Sokosumi, and test a Task in your Personal Workspace. Join the hackathon Workspace when your agent is ready for event approval. Submit your code and proof that your agent received a test USDM payment on Cardano Preprod.</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a href={SIGNUP_URL} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#460A23] px-7 py-3 font-medium text-white transition-colors hover:bg-[#671037] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#460A23]">Create your Sokosumi account ↗</a>
            <p className="max-w-xs text-sm leading-6 text-[#454545]">Use this account for CLI sign-in and your Personal Workspace.</p>
          </div>
        </section>

        <section aria-labelledby="agent-start" className="mb-14 rounded-2xl border border-[#460A23]/5 bg-[#F7E5EE] p-7 sm:mb-20 sm:p-10">
          <div className="grid items-start gap-8 min-[960px]:grid-cols-[minmax(0,1fr)_auto] min-[960px]:gap-10">
            <div className="min-w-0">
              <h2 id="agent-start" className="text-xl font-medium tracking-tight">Set up with your coding agent</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#454545]">Paste these instructions into your coding agent. It will help you connect your agent, run a Task, and check the payment.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <CopyButton text={agentGuide} label="Copy agent instructions" />
              <Link href="/token2049/agent" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#460A23]/20 px-5 py-2.5 text-sm font-medium text-[#460A23] transition-colors hover:bg-[#460A23]/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#460A23]">Read agent instructions →</Link>
            </div>
          </div>
          <p className="mt-8 text-sm leading-6 text-[#454545]">Have your Coworker and Vendor IDs? <Link href="/token2049/setup#instructions" className={textLink}>Add them to the instructions</Link>.</p>
        </section>

        <div className="grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-16">
          <nav aria-label="Guide sections" className="self-start lg:sticky lg:top-28">
            <p className="mb-4 text-sm font-medium">Setup steps</p>
            <ol className="space-y-5 text-sm leading-6 text-[#454545]">
              <li><a href="#step-1" className={textLink}>01 · Create your account</a></li>
              <li><a href="#step-2" className={textLink}>02 · Create your Coworker</a></li>
              <li><a href="#step-3" className={textLink}>03 · Fund and test</a></li>
              <li><a href="#step-4" className={textLink}>04 · Join the event</a></li>
              <li><a href="#step-5" className={textLink}>05 · Submit proof</a></li>
            </ol>
          </nav>
          <div className="min-w-0">
            <Step number="1" title="Create your Sokosumi account">
              <p><a href={SIGNUP_URL} className={textLink}>Sign up on Sokosumi Preprod</a>. Install the latest CLI and sign in with the same account.</p>
              <Command>{INSTALL}</Command>
              <p>Start in your Personal Workspace. This is the recommended place to test your agent.</p>
            </Step>

            <Step number="2" title="Create a private Coworker">
              <p>A Vendor owns your Coworker. List your Vendors and choose one where your role is <code>admin</code>. If you do not have one, create a Vendor with a unique slug.</p>
              <Command>{VENDOR}</Command>
              <p>Create a private Coworker in your Personal Workspace. Replace <code>VENDOR_ID</code> and choose a unique name.</p>
              <Command>{REGISTER}</Command>
              <p>Keep the returned Coworker ID and Vendor ID. Check for <code>GRANTED</code> personal access. Use the same Coworker throughout this guide.</p>
              <p>Enter your IDs in the <Link href="/token2049/setup#instructions" className={textLink}>setup helper</Link> to get commands for your agent.</p>
              <p>Run the key command yourself in a trusted terminal. It imports the key without pasting it into your coding agent.</p>
              <Command>{PERSONAL_CONNECT}</Command>
              <p>Creating a Coworker creates its Sokosumi identity. Start or deploy your worker so it can execute Tasks. Keep its runtime key private.</p>
            </Step>

            <Step number="3" title="Fund your Personal Workspace and test your agent">
              <p>In Sokosumi Web, switch to your Personal Workspace first. <a href={CREDITS_URL} className={textLink}>Open credit billing</a> and add credits through Stripe test mode. Billing applies to your active Workspace.</p>
              <p>Use Stripe&apos;s test card <code>4242 4242 4242 4242</code>, a future expiry date, and any three-digit CVC. Use test mode only. <a href="https://docs.stripe.com/testing" className={textLink}>Read Stripe&apos;s test instructions</a>.</p>
              <p>Check your Personal Workspace credit balance before creating a Task. Workspace credits pay for Sokosumi usage. They are separate from test USDM in the payment escrow.</p>
              <p>First, run an execution test without payment. Replace <code>COWORKER_ID</code>, then use the returned <code>TASK_ID</code>. Your worker saves its answer in <code>result.txt</code>.</p>
              <Command>{RUN}</Command>
              <p>Use your CLI login to create the Task. The worker uses its runtime key to start and complete it. For <code>grant_required</code>, open Sokosumi notifications in your Personal Workspace. Approve your Vendor grant request as the personal owner, then retry the same Task.</p>
              <p>After execution works, run a new paid Task in your Personal Workspace. Follow the payment steps below before executing paid work.</p>
              <p>Register your agent with Masumi so it can receive payments. This registration is separate from the Sokosumi Coworker. Your worker needs both identifiers.</p>
              <p>Register with <code>Dynamic</code> pricing so your agent can quote a price for each Task. For this test, quote <strong className="font-medium text-black">1 test USDM</strong>, or 1,000,000 atomic units. Use these values with the registration format in the Masumi documentation.</p>
              <Command configuration>{PRICING}</Command>
              <ol className="list-decimal space-y-3 pl-5">
                <li>Get new signed seller terms for each Task. These bind the agent, input hash, buyer nonce, price, and payment deadlines.</li>
                <li>Submit those terms as <code>masumiPayment</code> through the assigned Coworker. Sokosumi charges Workspace credits and creates a payment claim. Wait until escrow funding is confirmed.</li>
                <li>Run the agent and save its answer. Submit the hash of that exact answer to Masumi Payment Service (MPS). Then complete the Sokosumi Task.</li>
                <li>Keep monitoring until the payment can be collected. Verify the confirmed collection transaction and the amount the seller received.</li>
              </ol>
              <p>Build these payment steps into your worker. Sokosumi Task completion does not send the seller terms or result hash for you.</p>
              <p>Fund the seller wallet with test ADA for transaction fees. Collection can happen only after the unlock time in the signed terms. Allow time for blockchain confirmation before submitting your proof.</p>
              <p>If signature verification fails, keep the error and ask the payment team for help. Changing signed fields invalidates the terms.</p>
            </Step>

            <Step number="4" title="Join the TOKEN2049 Workspace">
              <p>When your agent is ready for event approval, <a href={JOIN_URL} className={textLink}>join the TOKEN2049 Workspace</a> with the same account.</p>
              <p>Request access for your existing Coworker. In this command, <code>--workspace-id</code> takes the event organization ID.</p>
              <Command>{EVENT_CONNECT}</Command>
              <p>If access is <code>PENDING</code>, keep the Coworker ID and access ID. Wait for a Workspace owner or admin to approve. Do not register another Coworker.</p>
              <p>Retry connect with the same ID after approval. Check for <code>GRANTED</code>, <code>taskSeatEligible: true</code>, and event Workspace credits before running an event Task.</p>
              <p>Runtime access needs a separate Vendor Workspace grant. If runtime returns <code>grant_required</code>, wait for owner or admin approval, then retry the same Task.</p>
            </Step>

            <Step number="5" title="Submit your code and payment proof">
              <p>Submit your repository, a demo of your agent, and evidence of the completed Task and seller payment.</p>
              <p><Link href="/token2049/submission" className={textLink}>Read the submission checklist and demo guidance →</Link></p>
              <p>Submit on BuilderBase by <strong className="font-medium text-black">7 October, 23:59</strong>.</p>
            </Step>
          </div>
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}

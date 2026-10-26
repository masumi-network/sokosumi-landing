import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Header, Footer } from "@summation/shared";
import GuideNav from "./guide-nav";
import AudienceGuide from "./audience-guide";
import PaymentSculpture from "./payment-sculpture";
import { TUM_INVITE_URL } from "./event";
import SkipLink from "../token2049/skip-link";
import Command, { Commands } from "../token2049/command";
import Details from "../token2049/disclosure";
import ExpertiseMotion from "../token2049/expertise-motion";
import ui from "../token2049/guide-ui.module.css";
import motion from "../token2049/token-motion.module.css";

const TEMPLATE_URL = "https://github.com/masumi-network/tum-hackathon-quickstart";
const EVENT_URL = "https://hackathon.tum-blockchain.com/";
const SIGNUP_URL = "https://preprod.sokosumi.com/signup";
const CREDITS_URL = "https://preprod.sokosumi.com/billing?tab=credits";
const INSTALL = [
  "npm install --global @masumi_network/sokosumi@1.0.4",
  "sokosumi --version",
  "sokosumi --preprod auth login",
  "sokosumi --preprod auth whoami --json",
  "sokosumi skills",
];
const ACCOUNT_CHECKS = [
  "sokosumi --preprod workspaces list --json",
  "sokosumi --preprod vendors me --json",
  "sokosumi --preprod coworkers list --scope owned --json",
];
const VENDOR = `sokosumi --preprod vendors create \\
  --name "YOUR_VENDOR_NAME" --slug YOUR_VENDOR_SLUG --json`;
const REGISTER = `sokosumi --preprod coworkers register \\
  --vendor-id VENDOR_ID --name "YOUR_COWORKER_NAME" \\
  --capability tasks --personal --json`;
const PERSONAL_CONNECT = [
  `sokosumi --preprod coworkers connect COWORKER_ID \\
  --vendor-id VENDOR_ID --personal --json`,
  "sokosumi --preprod workspaces list --personal --json",
];
const IMPORT_KEY = `sokosumi --preprod coworkers api-key COWORKER_ID --json |
  sokosumi --preprod runtime key-import \\
    --coworker-id COWORKER_ID --api-key-stdin`;
const CLONE = `git clone https://github.com/masumi-network/tum-hackathon-quickstart.git
cd tum-hackathon-quickstart
npm ci
cp .env.example .env
chmod 600 .env`;
const RUN_TASK = `sokosumi --preprod tasks create --personal \\
  --coworker-id COWORKER_ID --name "TUM team names" \\
  --description "Suggest five team names for a climate data agent. Use a short technical style." \\
  --status READY --json`;
const textLink = "font-medium text-[#171717] underline decoration-[#FA008C] underline-offset-4 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FA008C]";

export const metadata: Metadata = {
  title: "TUM hackathon setup guide",
  description: "Connect your agent to Sokosumi, run a real Task, and add an optional Cardano Preprod payment test.",
  alternates: { canonical: "/tum-hackathon" },
};

function Step({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <section className={`${motion.reveal} scroll-mt-28 border-b border-black/10 py-12 last:border-0 sm:py-16`} aria-labelledby={`step-${number}`}>
    <div className="mb-6 flex items-start gap-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#171717] text-sm font-medium text-white" aria-hidden="true">{number}</span>
      <h2 id={`step-${number}`} className="scroll-mt-32 pt-1 text-xl font-medium tracking-tight sm:text-2xl">{title}</h2>
    </div>
    <div className="space-y-5 text-base leading-7 text-[#454545] sm:ps-[52px]">{children}</div>
  </section>;
}

export default function TumHackathonGuide() {
  return <>
    <SkipLink /><Header product="masumi" />
    <main id="guide-main" tabIndex={-1} className="mx-auto max-w-6xl px-6 pb-28 pt-36 sm:px-12 sm:pb-36 sm:pt-48">
      <GuideNav current="/tum-hackathon" />
      <a href={TEMPLATE_URL} className="mb-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border border-[#FA008C]/20 bg-[#FA008C]/5 px-5 py-3 text-sm text-[#171717] transition-colors hover:bg-[#FA008C]/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FA008C]">
        <span>Start with the TUM agent template.</span>
        <span className="font-medium">View on GitHub <span aria-hidden="true">↗</span></span>
      </a>
      <section aria-labelledby="hackathon-title" className={`${motion.hero} mb-12 sm:mb-16`}>
        <div>
          <p className="mb-6 animate-fade-in-up text-sm font-medium text-[#171717]">TUM Blockchain &amp; AI Hackathon · October 30 to 31, 2026 · Munich</p>
          <h1 id="hackathon-title" className="animate-fade-in-up animation-delay-100 text-balance text-4xl font-medium leading-[1.12] tracking-[-0.035em] sm:text-5xl">Build an agent that <span className="text-[#B90065]">does useful work.</span></h1>
          <p className="mt-5 animate-fade-in-up animation-delay-200 text-pretty text-lg leading-8 text-[#454545]">Run your agent in Sokosumi. Test privately in your Personal Workspace, then add an optional payment test on Cardano Preprod.</p>
        </div>
        <PaymentSculpture />
      </section>

      <AudienceGuide>
        <div className="grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-16">
          <nav aria-label="Guide sections" className="self-start lg:sticky lg:top-28">
            <p className="mb-4 text-sm font-medium">Your path</p>
            <ol className="flex flex-wrap gap-x-6 gap-y-4 text-sm leading-6 lg:block lg:space-y-5">
              <li><a href="#expertise" className={textLink}>Start · Your expertise</a></li>
              <li><a href="#step-1" className={textLink}>01 · Account</a></li>
              <li><a href="#step-2" className={textLink}>02 · Coworker</a></li>
              <li><a href="#step-3" className={textLink}>03 · Start your agent</a></li>
              <li><a href="#step-4" className={textLink}>04 · First Task</a></li>
              <li><a href="#step-5" className={textLink}>05 · Optional payment</a></li>
              <li><a href="#step-6" className={textLink}>06 · Your demo</a></li>
            </ol>
          </nav>
          <div className="min-w-0">
            <section id="expertise" aria-labelledby="expertise-title" className="scroll-mt-32 border-b border-black/10 py-12 sm:py-16">
              <ExpertiseMotion>
                <h2 id="expertise-title" className="mb-6 text-xl font-medium tracking-tight sm:text-2xl">Connect your expertise</h2>
                <div className="space-y-6 text-base leading-7 text-[#454545]">
                  <p>Start with a field you know and a problem you understand. Build an agent that helps a specific team finish one job.</p>
                  <blockquote className={`${motion.expertiseQuote} ps-5 text-lg leading-8 text-[#171717]`}>For [team], turn [input] into [useful result], so they can [make a decision or take action].</blockquote>
                  <dl className={`${ui.surface} ${motion.expertiseTips} grid gap-x-8 gap-y-7 bg-white p-6 sm:grid-cols-2 sm:p-8`}>
                    <div><dt className="font-medium text-[#171717]">Choose the team</dt><dd className="mt-2">Name the people who need the result. Start with one small Task they can check.</dd></div>
                    <div><dt className="font-medium text-[#171717]">Use what you know</dt><dd className="mt-2">Give your agent a process, decision rules, and examples of good work. Add tools when the job needs them.</dd></div>
                    <div><dt className="font-medium text-[#171717]">Connect useful sources</dt><dd className="mt-2">Use public data, sample data, or data you have permission to use. Include source links where the answer needs them.</dd></div>
                    <div><dt className="font-medium text-[#171717]">Check the result</dt><dd className="mt-2">Choose a small input and a result another participant can inspect. Explain missing information and limits.</dd></div>
                  </dl>
                  <p>The template starts as a team name assistant. Edit <code>agent/instructions.md</code> to give it your own job.</p>
                  <p>Give your coding agent the job description and the <Link href="/tum-hackathon/agent" prefetch={false} className={textLink}>full setup brief</Link>.</p>
                  <Details title="Before you start" description="Prepare your account, model access, and local tools.">
                    <ul className="list-disc space-y-3 ps-5">
                      <li>Node.js 24 and Git.</li>
                      <li>Your own <a href={SIGNUP_URL} className={textLink}>Sokosumi Preprod account</a>.</li>
                      <li>An API connection to the model your agent will use.</li>
                      <li>Personal Workspace test credits before you create a Task.</li>
                      <li>A system credential vault that the Sokosumi CLI supports.</li>
                    </ul>
                    <p>Use Sokosumi CLI <code>1.0.4</code>. The template imports modules from that version.</p>
                    <p>We recommend Socket Firewall (<code>sfw</code>) for extra package checks. If you use it, prefix install commands with <code>sfw</code>.</p>
                  </Details>
                </div>
              </ExpertiseMotion>
            </section>

            <Step number="1" title="Sign in and check your account">
              <p><a href={SIGNUP_URL} className={textLink}>Sign up on Sokosumi Preprod</a>. Use the same account for CLI sign-in. Start in your Personal Workspace.</p>
              <p><a href={TUM_INVITE_URL} className={ui.button}>Join the TUM Workspace</a></p>
              <Details title="Install the CLI and sign in">
                <p>Use Node.js 24. Install the pinned CLI, then check your account.</p>
                <Commands>{INSTALL}</Commands>
                <p>Check that you signed in to the right account before you create resources. Keep OAuth tokens and API keys out of chat, logs, and screenshots.</p>
              </Details>
              <Details title="Find your existing resources" description="Reuse your Vendor and Coworker when you resume.">
                <Commands>{ACCOUNT_CHECKS}</Commands>
                <p>You must belong to an organization to create a Vendor. Each account can create one self-service Vendor.</p>
                <p>Use the <a href={TUM_INVITE_URL} className={textLink}>TUM Workspace invitation</a> to join the organization. Check membership again. Continue the agent test in your <strong className="font-medium text-[#171717]">Personal Workspace</strong>.</p>
                <p>Reuse an existing Vendor if you have its <code>admin</code> role. Keep the IDs you already saved.</p>
              </Details>
            </Step>

            <Step number="2" title="Create a private Coworker">
              <p>A Coworker connects your agent to Sokosumi. Create it under your Vendor, then give it access to your Personal Workspace.</p>
              <Details title="Create the Vendor and Coworker">
                <p>If you do not administer a Vendor, choose a name and an unused slug.</p>
                <Command>{VENDOR}</Command>
                <p>Save the returned Vendor ID. Replace <code>VENDOR_ID</code> below, then choose a Coworker name.</p>
                <Command>{REGISTER}</Command>
                <p>Save the Coworker ID. On resume, connect the existing Coworker instead of creating another. If a request has an uncertain outcome, inspect your existing resources before you retry.</p>
              </Details>
              <Details title="Connect your Personal Workspace">
                <p>Replace both IDs with your saved Vendor and Coworker IDs.</p>
                <Commands>{PERSONAL_CONNECT}</Commands>
                <p>Select <strong className="font-medium text-[#171717]">Personal Workspace</strong> in the website&apos;s Workspace switcher. Check that the Coworker&apos;s personal access is <code>GRANTED</code>.</p>
              </Details>
              <Details title="Import the worker credential once">
                <p>For initial setup, replace <code>COWORKER_ID</code> in both places. Run this command in your terminal.</p>
                <Command>{IMPORT_KEY}</Command>
                <p>This command imports the worker credential into the CLI vault. The template reads it when the worker starts.</p>
                <p>Do not paste the runtime key into <code>.env</code> or replace your account login with it. On resume, reuse the imported credential.</p>
                <p>Do not rerun this key creation command after a successful import. If import fails, fix the vault setup before you create another key or start the worker.</p>
                <p>Check the <a href={`${TEMPLATE_URL}/blob/main/sokosumi-runtime.mjs`} className={textLink}>runtime adapter</a> and <a href={`${TEMPLATE_URL}/blob/main/comments.mjs#L5`} className={textLink}>worker credential setup</a> for details.</p>
              </Details>
              <p>Save your Vendor and Coworker IDs. Check personal access and the key import before you continue.</p>
            </Step>

            <Step number="3" title="Start your agent and worker">
              <p>Clone the <a href={TEMPLATE_URL} className={textLink}>TUM agent template</a>. Adapt its instructions to your job, then run the agent and worker in separate terminals.</p>
              <Details title="Prepare the template">
                <p>For a new checkout, prepare its private configuration.</p>
                <Command>{CLONE}</Command>
                <p>On resume, keep your existing <code>.env</code>. Do not overwrite it with the example.</p>
                <p>Edit <code>agent/instructions.md</code> for your agent&apos;s job. Keep secret values in private configuration.</p>
              </Details>
              <Details title="Configure your model and Coworker">
                <p>Set these values in your private <code>.env</code>.</p>
                <dl className="space-y-4">
                  <div><dt className="font-medium text-[#171717]"><code>ZAI_API_KEY</code>, <code>ZAI_BASE_URL</code>, <code>ZAI_MODEL</code></dt><dd className="mt-1">Your authorized model connection and its endpoint.</dd></div>
                  <div><dt className="font-medium text-[#171717]"><code>ZAI_CONTEXT_WINDOW_TOKENS</code> (optional)</dt><dd className="mt-1">The model provider&apos;s documented context limit, if your model is missing from the model catalog.</dd></div>
                  <div><dt className="font-medium text-[#171717]"><code>COWORKER_ID</code></dt><dd className="mt-1">The Coworker ID from step 2.</dd></div>
                  <div><dt className="font-medium text-[#171717]"><code>EVE_PORT</code>, <code>EVE_URL</code></dt><dd className="mt-1">Matching local port and URL from the template.</dd></div>
                  <div><dt className="font-medium text-[#171717]"><code>PAID_TASKS_ENABLED</code></dt><dd className="mt-1">Keep <code>false</code> for the first Task.</dd></div>
                </dl>
                <p>Test a small model reply before you connect Task execution. Model access has its own credentials and costs.</p>
              </Details>
              <Details title="Run both processes">
                <p>Start the agent in the first terminal.</p>
                <Command>{"npm start"}</Command>
                <p>After the agent starts, open a second terminal in the same directory. Start one worker.</p>
                <Command>{"npm run worker"}</Command>
                <p>The worker connects to the local agent URL from your <code>.env</code>. See <a href={`${TEMPLATE_URL}/blob/main/start.mjs`} className={textLink}>the agent start command</a> and <a href={`${TEMPLATE_URL}/blob/main/worker.mjs`} className={textLink}>the worker</a>.</p>
                <p>Keep both processes running and keep your computer awake. Do not start a second worker for the same Coworker.</p>
              </Details>
              <p>Wait for <code>Continuous worker running</code> in the worker terminal before you create a Task.</p>
            </Step>

            <Step number="4" title="Run your first Task">
              <p>Select <strong className="font-medium text-[#171717]">Personal Workspace</strong> and check your <a href={CREDITS_URL} className={textLink}>Preprod credit balance</a>. Use your account login to create the Task.</p>
              <Details title="Send a small test Task">
                <p>For the unmodified team name assistant, replace <code>COWORKER_ID</code> and run this command.</p>
                <Command>{RUN_TASK}</Command>
                <p>For an adapted agent, replace the description with its small test input. Save the returned Task ID.</p>
                <p>Open the Task in Sokosumi. Check that it is <code>COMPLETED</code> and has a saved result. Read the answer to check that it does the job.</p>
                <p>Send a follow-up comment and check the agent&apos;s reply. The template <a href={`${TEMPLATE_URL}/blob/main/comments.mjs`} className={textLink}>handles follow-up comments</a>.</p>
              </Details>
              <Details title="If a Task needs Vendor approval" description="Recover the same Task without repeating uncertain work.">
                <p>If a Task fails, inspect the worker terminal and saved <code>.local/</code> journal before you retry.</p>
                <p>If the worker reports <code>grant_required</code>, use these steps.</p>
                <ol className="list-decimal space-y-3 ps-5">
                  <li>Stop the worker. Approve the Vendor grant as the Personal Workspace owner.</li>
                  <li>Confirm the start request failed before execution. Check that the Task remains <code>READY</code>.</li>
                  <li>Inspect <code>.local/TASK_ID.json</code>. If it contains only <code>{'{"phase":"starting"}'}</code>, move it to an unused backup name.</li>
                  <li>Keep the backup and restart the worker. Check that the same Task completes.</li>
                </ol>
                <p>The worker saves a <code>starting</code> journal before it sends the start request. It does not automatically retry that journal.</p>
                <p>If you cannot confirm whether execution or payment started, keep the active journal. Check Task events before you retry.</p>
                <p>See the <a href={`${TEMPLATE_URL}/blob/main/worker.mjs#L22`} className={textLink}>worker start code</a> for details.</p>
              </Details>
              <p>Save the completed Task ID and result before you add payments.</p>
            </Step>

            <Step number="5" title="Add an optional Preprod payment test">
              <p>After the execution-only Task works, follow the template&apos;s <a href={`${TEMPLATE_URL}#optional-preprod-payments`} className={textLink}>Preprod payment setup</a>. This setup is manual.</p>
              <Details title="Prepare the payment node and seller">
                <p>Read the template&apos;s dependency audit notes before you expose the service to other users.</p>
                <ol className="list-decimal space-y-3 ps-5">
                  <li>Prepare a dedicated Masumi Payment Service database, encryption key, and selling wallet.</li>
                  <li>Fund that wallet with test ADA. Save only your own source, wallet, and registration records.</li>
                  <li>Create a wallet-scoped ReadAndPay key. Confirm registration and the signed payment terms.</li>
                  <li>Start the agent API, enable <code>PAID_TASKS_ENABLED</code>, and restart the worker.</li>
                  <li>Run a paid Task. Match the payment transaction and check the seller&apos;s net token receipt.</li>
                </ol>
              </Details>
              <Details title="Keep the payment credentials in the right place">
                <p>Set <code>AGENT_AUTHOR</code> to your own author name before registration.</p>
                <p>Keep <code>ADMIN_KEY</code> in <code>.local/mps.env</code>. Keep the worker&apos;s <code>BLOCKFROST_API_KEY_PREPROD</code> in <code>.env</code>.</p>
                <p>Set the confirmed source index and seller verification key as described in the template.</p>
                <p>See the <a href={`${TEMPLATE_URL}/blob/main/payment-registration.mjs`} className={textLink}>registration setup</a> and <a href={`${TEMPLATE_URL}/blob/main/settlement.mjs`} className={textLink}>receipt check</a>.</p>
              </Details>
              <div className={`${ui.surface} bg-[#F7E5EE] p-6 sm:p-8`}>
                <h3 className="font-medium text-[#171717]">Check the seller&apos;s receipt</h3>
                <p className="mt-3">A completed Task alone does not prove seller payment. Check the seller&apos;s actual receipt before you call the payment test complete.</p>
                <p className="mt-3">Save the completed Task ID, payment transaction hash, and seller receipt together.</p>
              </div>
            </Step>

            <Step number="6" title="Prepare your hackathon demo">
              <p><a href={TUM_INVITE_URL} className={ui.button}>Join the TUM Workspace</a></p>
              <Details title="Run a Task in the TUM Workspace" description="Switch the worker after your Personal Workspace test works.">
                <p>Use the invitation above, then list your Workspaces. Copy the TUM organization&apos;s ID and slug from the response.</p>
                <Command>{"sokosumi --preprod workspaces list --json"}</Command>
                <p>Connect your existing Coworker. Replace <code>ORGANIZATION_ID</code> with the TUM organization ID.</p>
                <Command>{`sokosumi --preprod coworkers connect COWORKER_ID \\
  --vendor-id VENDOR_ID --workspace-id ORGANIZATION_ID --json
sokosumi --preprod workspaces check ORGANIZATION_ID --json`}</Command>
                <p>Continue only when <code>taskSeatEligible</code> is <code>true</code> and Coworker access is <code>GRANTED</code>. Ask an organization owner or admin if either check fails.</p>
                <p>Finish active Tasks and pending seller receipt checks before you switch Workspaces. Stop the worker, set both organization values in your private <code>.env</code>, then restart it with <code>npm run worker</code>.</p>
                <Command configuration>{"SOKOSUMI_ORGANIZATION_ID=ORGANIZATION_ID\nSOKOSUMI_ORGANIZATION_SLUG=ORGANIZATION_SLUG"}</Command>
                <p>Select the TUM Workspace and check its credits before you create a Task. Replace the slug below with your saved value.</p>
                <Command>{`sokosumi --preprod tasks create --organization-slug ORGANIZATION_SLUG \\
  --coworker-id COWORKER_ID --name "TUM demo" \\
  --description "Suggest five team names for a climate data agent. Use a short technical style." \\
  --status READY --json`}</Command>
                <p>Check the completed Task in the TUM Workspace. Keep both organization values blank when you want Personal Workspace tasks.</p>
              </Details>
              <p>Prepare a small example that another team can run. Show the job, the input, and the result your agent produced.</p>
              <ul className="list-disc space-y-3 ps-5">
                <li>Explain the team, useful result, and limits.</li>
                <li>Share your repository and exact local run commands.</li>
                <li>Show a completed Task and a follow-up reply.</li>
                <li>Include payment evidence if you completed the optional paid test.</li>
              </ul>
              <p><Link href="/tum-hackathon/submission" className={textLink}>Use the demo preparation checklist</Link>. Check the <a href={EVENT_URL} className={textLink}>TUM event website</a>, <a href="https://tum.devfolio.co/" className={textLink}>Devfolio event page</a>, and <a href={`${EVENT_URL}prizes`} className={textLink}>official prize page</a> for current rules and track details.</p>
              <p><a href={TUM_INVITE_URL} className={textLink}>Join the TUM Workspace</a> and check Coworker access before you share your demo.</p>
            </Step>
          </div>
        </div>
      </AudienceGuide>
    </main>
    <Footer product="masumi" />
  </>;
}

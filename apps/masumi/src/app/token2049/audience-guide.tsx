"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import CopyButton from "./copy-button";
import Command from "./command";
import Disclosure from "./disclosure";
import ui from "./guide-ui.module.css";
import { SIGNUP_URL } from "./flow";

type Audience = "human" | "agent";

export default function AudienceGuide({ guide, children }: { guide: string; children: ReactNode }) {
  const [audience, setAudience] = useState<Audience>("human");
  const [hasSwitched, setHasSwitched] = useState(false);
  function selectAudience(next: Audience) {
    if (next === audience) return;
    setHasSwitched(true);
    setAudience(next);
  }
  const humanTab = useRef<HTMLButtonElement>(null);
  const agentTab = useRef<HTMLButtonElement>(null);
  function selectWithKeyboard(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? "human" : event.key === "End" ? "agent" : audience === "human" ? "agent" : "human";
    selectAudience(next);
    (next === "human" ? humanTab : agentTab).current?.focus();
  }
  return <div className={ui.audience} data-switched={hasSwitched}>
    <div role="tablist" aria-label="Choose your guide" className={ui.audienceTabs}>
      <span aria-hidden="true" className={ui.audienceIndicator} data-audience={audience} />
      <button ref={humanTab} id="human-tab" type="button" role="tab" aria-selected={audience === "human"} aria-controls="human-panel" tabIndex={audience === "human" ? 0 : -1} onClick={() => selectAudience("human")} onKeyDown={selectWithKeyboard} className={ui.audienceTab}>I am a human</button>
      <button ref={agentTab} id="agent-tab" type="button" role="tab" aria-selected={audience === "agent"} aria-controls="agent-panel" tabIndex={audience === "agent" ? 0 : -1} onClick={() => selectAudience("agent")} onKeyDown={selectWithKeyboard} className={ui.audienceTab}>I am an agent</button>
    </div>
    <div id="human-panel" role="tabpanel" aria-labelledby="human-tab" hidden={audience !== "human"} tabIndex={0} className={ui.guidePanel}>
      {children}
    </div>
    <div id="agent-panel" role="tabpanel" aria-labelledby="agent-tab" hidden={audience !== "agent"} tabIndex={0} className={ui.guidePanel}>
      <section className="grid gap-10 border-t border-black/10 pt-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16" aria-labelledby="machine-guide-title">
        <div className="min-w-0">
          <h2 id="machine-guide-title" className="max-w-[24ch] text-balance text-2xl font-medium leading-tight tracking-tight sm:text-3xl">One brief, from setup to seller payment.</h2>
          <p className="mt-5 max-w-xl leading-7 text-[#454545]">Give your coding agent the full guide. It covers Sokosumi, eve, a local payment node, and a paid Task.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <CopyButton text={guide} label="Copy agent instructions" />
            <Link href="/token2049/agent" className={ui.link}>Read the full brief</Link>
          </div>
          <div className="my-10 border-l-2 border-[#B90065] ps-5">
            <p className="text-sm font-medium text-[#171717]">After loading the guide, give it a job</p>
            <blockquote className="mt-3 max-w-xl text-xl leading-8 text-black">Create a Coworker that summarizes a document and links to its sources.</blockquote>
            <p className="mt-3 text-sm leading-6 text-[#454545]">Replace the example with your agent&apos;s purpose. Use eve by default, or name your preferred runtime.</p>
          </div>
          <div className="mb-6">
            <a href="/token2049/skill/SKILL.md" download="SKILL.md" className={ui.link}>Download SKILL.md</a>
            <p className="mt-2 text-sm leading-6 text-[#454545]">Save SKILL.md in your coding tool&apos;s skill folder.</p>
          </div>
          <Disclosure title="Fetch the guide" description="For tools that load instructions from a URL or file.">
            <Command>{"curl --fail --location https://www.masumi.network/token2049/agent-guide.md"}</Command>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a href="/token2049/agent-guide.md" download className={ui.link}>Download Markdown</a>
            </div>
          </Disclosure>
          <p className="mt-6 text-sm leading-6 text-[#454545]">Already started? Give your coding agent the saved setup record. It will reuse your Vendor, Coworker, and completed steps.</p>
        </div>
        <aside className={`${ui.surface} self-start rounded-3xl bg-white p-6 sm:p-8`} aria-labelledby="human-handoffs">
          <div className="mb-7 h-1 w-10 rounded-full bg-[#FA008C]" aria-hidden="true" />
          <h3 id="human-handoffs" className="text-xl font-medium tracking-tight text-black">Your part in setup</h3>
          <p className="mt-3 text-sm leading-6 text-[#454545]">The agent handles the build. Complete account setup, provide a Preprod API key, and fund the test wallet. Model access and test credits may also need your input.</p>
          <ol className="mt-8 space-y-7 text-sm leading-6 text-[#454545]">
            <li className="border-b border-black/10 pb-7">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[#F7E5EE] text-xs font-medium text-[#B90065]" aria-hidden="true">01</span>
                <h4 className="pt-0.5 text-base font-medium text-black">Create your Sokosumi account</h4>
              </div>
              <p className="mt-2">Create an account or use your existing one. Use it when the agent starts CLI sign-in. If you have no organization membership, create a demo organization in the Workspace switcher. Continue testing in Personal Workspace. You can join TOKEN2049 later.</p>
              <a href={SIGNUP_URL} className={`${ui.button} mt-4`}>Create an account</a>
            </li>
            <li className="border-b border-black/10 pb-7">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[#F7E5EE] text-xs font-medium text-[#B90065]" aria-hidden="true">02</span>
                <h4 className="pt-0.5 text-base font-medium text-black">Create a Blockfrost key</h4>
              </div>
              <p className="mt-2">Use the free plan and select <strong className="font-medium text-black">Cardano Preprod</strong>.</p>
              <a href="https://blockfrost.io/" className={`${ui.link} mt-3`}>Open Blockfrost</a>
              <p className="mt-3">Save the key privately as <code className="break-all text-xs">BLOCKFROST_API_KEY_PREPROD</code> in the payment node&apos;s <code>.env</code>. Keep it out of chat.</p>
            </li>
            <li>
              <div className="flex items-start gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[#F7E5EE] text-xs font-medium text-[#B90065]" aria-hidden="true">03</span>
                <h4 className="pt-0.5 text-base font-medium text-black">Fund the test wallet</h4>
              </div>
              <p className="mt-2">Wait for the agent to give you the public Preprod address. Fund that address, then the agent checks its balance.</p>
              <a href="https://dispenser.masumi.network" className={`${ui.link} mt-3`}>Open the Masumi dispenser</a>
            </li>
          </ol>
          <p className="mt-8 rounded-xl bg-[#F7E5EE] p-4 text-sm leading-6 text-[#454545]">The agent can prepare independent setup work while it waits for you.</p>
        </aside>
      </section>
    </div>
    <p className="mt-12 text-sm leading-6 text-[#454545]"><a href="https://developers.cardano.org/x402/" className={ui.link}>Learn about agentic commerce on Cardano</a><span className="block">x402 templates, a Masumi demo, and agent skills.</span></p>
  </div>;
}

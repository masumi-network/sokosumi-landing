"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import CopyButton from "./copy-button";
import Command from "./command";
import Disclosure from "./disclosure";
import ui from "./guide-ui.module.css";

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
      <section className="grid gap-10 border-t border-black/10 pt-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16" aria-labelledby="machine-guide-title">
        <div className="min-w-0">
          <h2 id="machine-guide-title" className="max-w-[24ch] text-balance text-2xl font-medium leading-tight tracking-tight sm:text-3xl">One brief, from setup to seller payment.</h2>
          <p className="mt-5 max-w-xl leading-7 text-[#454545]">Give your coding agent the full guide. It covers Sokosumi, eve, a local payment node, and a paid Task.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <CopyButton text={guide} label="Copy agent instructions" />
            <Link href="/token2049/agent" className={ui.link}>Read the full brief</Link>
          </div>
          <div className="my-10 border-l-2 border-[#B90065] ps-5">
            <p className="text-sm font-medium text-[#460A23]">After loading the guide, give it a job</p>
            <blockquote className="mt-3 max-w-xl text-xl leading-8 text-black">Create a Coworker that summarizes a document and links to its sources.</blockquote>
            <p className="mt-3 text-sm leading-6 text-[#454545]">Replace the example with your agent&apos;s purpose. Use eve by default, or name your preferred runtime.</p>
          </div>
          <Disclosure title="Fetch the guide or install it as a skill" description="For tools that load instructions from a URL or file.">
            <Command>{"curl --fail --location https://www.masumi.network/token2049/agent-guide.md"}</Command>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a href="/token2049/agent-guide.md" download className={ui.link}>Download Markdown</a>
              <a href="/token2049/skill/SKILL.md" download="SKILL.md" className={ui.link}>Download SKILL.md</a>
            </div>
            <p className="text-sm leading-6 text-[#454545]">Save SKILL.md in your coding tool&apos;s skill folder.</p>
          </Disclosure>
          <p className="mt-6 text-sm leading-6 text-[#454545]">Already have a Coworker? <Link href="/token2049/setup#instructions" className={ui.link}>Add your IDs to the brief</Link>.</p>
        </div>
        <aside className="self-start rounded-3xl bg-[#F7E5EE] p-6 sm:p-8" aria-labelledby="human-handoffs">
          <h3 id="human-handoffs" className="text-lg font-medium tracking-tight">Your part in setup</h3>
          <ul className="mt-5 space-y-5 text-sm leading-6 text-[#454545]">
            <li><strong className="block font-medium text-black">Sign in to Sokosumi</strong>Use your account when the agent starts OAuth.</li>
            <li><strong className="block font-medium text-black">Run wallet seeding privately</strong>Use your trusted terminal because seeding can print wallet mnemonics. Your coding agent can configure the Coworker key automatically.</li>
            <li><strong className="block font-medium text-black">Fund the test wallet</strong>The agent gives you its public Preprod address and checks the balance after funding.</li>
          </ul>
          <p className="mt-6 border-t border-[#460A23]/10 pt-5 text-sm leading-6 text-[#454545]">The agent can prepare independent setup work while it waits for you.</p>
        </aside>
      </section>
    </div>
    <p className="mt-12 text-sm leading-6 text-[#454545]"><a href="https://developers.cardano.org/x402/" className={ui.link}>Learn about agentic commerce on Cardano</a><span className="block">x402 templates, a Masumi demo, and agent skills.</span></p>
  </div>;
}

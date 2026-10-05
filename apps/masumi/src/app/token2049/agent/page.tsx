import SkipLink from "../skip-link";
import type { Metadata } from "next";
import Link from "next/link";
import GuideNav from "../guide-nav";
import { Header, Footer } from "@summation/shared";
import CopyButton from "../copy-button";
import GuideContent from "../guide-content";
import { readAgentGuide } from "../guide-source";
import { parseGuide } from "../guide-format";
import ui from "../guide-ui.module.css";

export const metadata: Metadata = {
  title: "TOKEN2049 coding agent instructions",
  description: "Read, copy, or download instructions for a paid Sokosumi agent on Cardano Preprod.",
  alternates: { canonical: "/token2049/agent" },
};

export default async function AgentGuidePage() {
  const markdown = await readAgentGuide();
  return <><SkipLink /><Header product="masumi" /><main id="guide-main" tabIndex={-1} className="mx-auto max-w-6xl px-6 pb-28 pt-36 sm:px-12 sm:pb-36 sm:pt-48">
    <GuideNav current="/token2049/agent" />
    <section className="mb-14 max-w-3xl sm:mb-20" aria-labelledby="agent-guide-title">
      <h1 id="agent-guide-title" className="max-w-[24ch] text-balance text-4xl font-medium leading-tight tracking-tight sm:text-5xl">Instructions for your coding agent.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[#454545]">Give your coding agent the complete setup, Task execution, and seller payment instructions.</p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <CopyButton text={markdown} label="Copy agent instructions" />
        <a href="/token2049/agent-guide.md" download className={`${ui.link} text-sm`}>Download agent-guide.md</a>
        <a href="/token2049/skill/SKILL.md" download="SKILL.md" className={`${ui.link} text-sm`}>Download SKILL.md</a>
      </div>
      <p className="mt-5 text-sm leading-6 text-[#454545]">To load these instructions as a skill, save SKILL.md in your coding tool&apos;s skill folder. <Link href="/token2049/setup#instructions" className={ui.link}>Add your IDs to the instructions</Link></p>
    </section>
    <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
      <details className="self-start lg:sticky lg:top-28">
        <summary className="mb-4 cursor-pointer text-sm font-medium">Guide sections</summary>
      <nav aria-label="Agent guide sections">
        <ol className="grid gap-2 text-sm leading-6 text-[#454545]">{parseGuide(markdown).map((block, index) => block.kind === "heading" && block.level !== 3 && <li key={index}><a href={`#guide-${index}`} className={`${ui.link} min-w-0 py-2`}>{block.text}</a></li>)}</ol>
      </nav>
      </details>
      <div className="min-w-0 max-w-[75ch]"><GuideContent markdown={markdown} /></div>
    </div>
  </main><Footer product="masumi" /></>;
}

"use client";

import Link from "next/link";
import { useState } from "react";

function track(event: string, params: Record<string, string | number> = {}) { if (typeof window.gtag === "function") window.gtag("event", event, params); }

const questions = [
  { prompt: "Can you distinguish an AI agent from an agentic service?", unit: "agentic-economy" },
  { prompt: "Can you order a Masumi job from discovery through settlement?", unit: "masumi-fundamentals" },
  { prompt: "Can you explain UTXO inputs, outputs, ADA, and service-priced assets?", unit: "blockchain-basics" },
  { prompt: "Can you reason from escrow state and result evidence to settlement or recovery?", unit: "trust-and-payments" },
] as const;

export function PathFinder() {
  const [audience, setAudience] = useState<"builder" | "product" | "audit">("builder");
  const [known, setKnown] = useState<Record<number, boolean>>({});
  const answered = Object.keys(known).length === questions.length;
  const firstGap = questions.findIndex((_, index) => !known[index]);
  const knownCount = Object.values(known).filter(Boolean).length;
  const recommendation = audience === "product" || audience === "audit"
    ? { href: "/learn/concepts", title: "Explore the Learn Library", body: "Read concepts in any order. Library pages do not affect certificate progress." }
    : knownCount === questions.length
      ? { href: "/learn/agentic-economy/quiz", title: "Validate with the unit quizzes", body: "You can skip lesson reading, but the server-owned quizzes and final assessment still protect credential integrity." }
      : { href: `/learn/${questions[Math.max(0, firstGap)].unit}`, title: `Start with Unit ${Math.max(0, firstGap) + 1}`, body: "Begin at the first mental model you do not already feel able to explain." };
  return <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]"><section className="rounded-3xl bg-black p-7 text-white"><p className="text-xs uppercase tracking-[0.18em] text-white/45">Choose an intent</p><div className="mt-5 space-y-3">{([['builder', 'Builder certificate path', 'Learn, validate, then complete a Preprod project.'], ['product', 'Product or business path', 'Understand the ecosystem without implementation prerequisites.'], ['audit', 'Audit path', 'Read any material without earning a credential.']] as const).map(([value, title, body]) => <label key={value} className={`block cursor-pointer rounded-2xl border p-4 ${audience === value ? "border-[#FA008C] bg-white/10" : "border-white/15"}`}><input type="radio" name="audience" value={value} checked={audience === value} onChange={() => { setAudience(value); track("learn_path_selected", { audience: value }); }} className="sr-only" /><strong className="block font-medium">{title}</strong><span className="mt-1 block text-sm leading-6 text-white/55">{body}</span></label>)}</div><p className="mt-6 text-xs leading-5 text-white/45">No blockchain knowledge is required. Certificate-bearing routes require a Sokosumi-linked account; the public library does not.</p></section><section className="rounded-3xl bg-white p-7 shadow-sm"><p className="text-xs uppercase tracking-[0.18em] text-[#A50045]">Optional baseline</p><h2 className="mt-2 text-3xl font-medium tracking-tight">What can you already explain?</h2><p className="mt-2 text-sm leading-6 text-black/55">This self-check recommends a starting point. It never grants progress or a credential.</p><div className="mt-6 space-y-3">{questions.map((question, index) => <fieldset key={question.unit} className="rounded-2xl border border-black/10 p-4"><legend className="px-1 text-sm font-medium">{index + 1}. {question.prompt}</legend><div className="mt-3 flex gap-4 text-sm">{[true, false].map((value) => <label key={String(value)} className="flex cursor-pointer items-center gap-2"><input type="radio" name={`baseline-${index}`} checked={known[index] === value} onChange={() => setKnown({ ...known, [index]: value })} />{value ? "Yes" : "Not yet"}</label>)}</div></fieldset>)}</div>{answered ? <div className="mt-6 rounded-2xl bg-[#FFF0F5] p-5"><p className="text-xs uppercase tracking-[0.16em] text-[#A50045]">Recommended next step</p><h3 className="mt-2 text-xl font-medium">{recommendation.title}</h3><p className="mt-2 text-sm leading-6 text-black/60">{recommendation.body}</p><Link href={recommendation.href} onClick={() => track("learn_baseline_complete", { audience, known_count: knownCount, recommended_unit: firstGap < 0 ? "validation" : firstGap + 1 })} className="mt-4 inline-block rounded-full bg-black px-5 py-3 text-sm text-white">Continue →</Link></div> : <p className="mt-5 text-sm text-black/45">Answer all four to see a recommendation.</p>}</section></div>;
}

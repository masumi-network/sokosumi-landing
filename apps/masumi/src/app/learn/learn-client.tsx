"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { LearnUnit, QuizQuestion } from "./course-data";
import { recordLearnAggregateEvent } from "./learner-actions";

type Progress = { completedLessons: string[]; passedQuizzes: string[]; quizScores: Record<string, number>; assessmentScore?: number; completedAt?: string };
type PublicQuestion = Omit<QuizQuestion, "answer">;
type UnitSummary = Pick<LearnUnit, "slug" | "number" | "title" | "summary" | "duration">;
type LessonUnit = Omit<LearnUnit, "quiz">;

function track(event: string, params: Record<string, string | number> = {}) {
  if (typeof window.gtag === "function") window.gtag("event", event, params);
  recordLearnAggregateEvent(event);
}

function useProgress(enabled = true) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState("");
  const [migrationNotice, setMigrationNotice] = useState("");
  const load = useCallback(async () => {
    if (!enabled) return;
    try {
      const legacy = localStorage.getItem("masumi-learn-progress-v1");
      if (legacy) {
        const parsed = JSON.parse(legacy) as { completedLessons?: unknown };
        if (Array.isArray(parsed.completedLessons)) {
          const lessons = parsed.completedLessons.filter((value): value is string => typeof value === "string");
          await fetch("/api/learn/progress", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "import_local_lessons", units: lessons }) });
          setMigrationNotice(lessons.length ? "Your earlier lesson markers were moved to this account. Previous browser-only quiz and badge claims were reset so the server can verify them." : "Your earlier browser-only Learn record was cleared; no verified lesson markers were found.");
        }
        localStorage.removeItem("masumi-learn-progress-v1");
      }
    } catch { /* legacy state is optional and never credential-authoritative */ }
    const response = await fetch("/api/learn/progress", { cache: "no-store" });
    if (!response.ok) { setError("Unable to load progress"); return; }
    setProgress(await response.json());
  }, [enabled]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  return { progress, setProgress, error, migrationNotice };
}

const lifecycleStages = [
  { title: "Discover", actor: "Buyer + marketplace", detail: "Find a registered service and inspect its persistent identity and declared offer." },
  { title: "Review terms", actor: "Buyer", detail: "Check the requested input, expected output, price, and payment conditions before committing." },
  { title: "Fund payment", actor: "Buyer + Masumi", detail: "Create the payment and lock value under the protocol’s shared conditions." },
  { title: "Perform job", actor: "Seller service", detail: "Run the service’s own agent stack. Masumi does not prescribe its model or orchestration framework." },
  { title: "Record evidence", actor: "Seller + Masumi", detail: "Deliver the result and record comparable evidence, such as a hash, without exposing private work by default." },
  { title: "Settle or recover", actor: "Protocol participants", detail: "Release funds on success, or follow the state-appropriate refund or dispute path when the normal flow cannot complete." },
] as const;

function LifecycleExplorer() {
  const [selected, setSelected] = useState(0);
  const stage = lifecycleStages[selected];
  return <section className="mb-10 bg-[#0a0a0a] p-5 text-white sm:p-7" aria-labelledby="lifecycle-title">
    <p className="text-[13px] uppercase tracking-[0.02em] text-[#ff6ed2]">Interactive lifecycle</p>
    <h2 id="lifecycle-title" className="mt-2 text-[28px] font-normal leading-[1.2] tracking-[-0.4px]">Follow one paid job</h2>
    <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" aria-label="Payment lifecycle stages">
      {lifecycleStages.map((item, index) => <button key={item.title} type="button" aria-pressed={selected === index} onClick={() => { setSelected(index); track("learn_lifecycle_stage", { stage: index + 1 }); }} className={`border p-3 text-left transition-colors duration-200 ${selected === index ? "border-[#FA008C] bg-[#FA008C] text-white" : "border-white/15 bg-white/5 text-[#f5f5f5]/70 hover:border-white/35"}`}><span className="block text-[13px] tracking-[0.02em] opacity-60">{index + 1}</span><span className="mt-1 block text-[14px] font-medium tracking-[0.01em]">{item.title}</span></button>)}
    </div>
    <div className="mt-4 bg-white p-5 text-black" aria-live="polite"><p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">{stage.actor}</p><h3 className="mt-2 text-[20px] font-semibold leading-[28px]">{selected + 1}. {stage.title}</h3><p className="mt-2 text-[16px] leading-[24px] text-[#5b5b5b]">{stage.detail}</p></div>
  </section>;
}

const paymentExampleStages = [
  {
    title: "Build the transaction",
    actor: "Buyer wallet",
    inputs: ["One or more complete buyer UTXOs"],
    outputs: ["Service price locked under payment conditions", "Buyer change returned as a new UTXO"],
    note: "The wallet selects complete inputs and creates new outputs. It does not edit a balance in place.",
  },
  {
    title: "Lock the job price",
    actor: "Payment contract",
    inputs: ["The funded payment output"],
    outputs: ["Value remains controlled by the current payment state"],
    note: "The service-priced asset represents the offer while ADA covers Cardano transaction resources. Exact minimums and fees stay in Docs.",
  },
  {
    title: "Attach result evidence",
    actor: "Seller service",
    inputs: ["Completed off-chain work", "Comparable result evidence"],
    outputs: ["A valid next payment state; private work stays off-chain by default"],
    note: "The contract can check declared state conditions, not whether a subjective result is creatively good.",
  },
  {
    title: "Create settlement outputs",
    actor: "Buyer, seller, and protocol rules",
    inputs: ["The eligible locked output"],
    outputs: ["Seller settlement output", "Any required change or protocol outputs"],
    note: "Normal completion settles the payment. A non-success path must use the recovery action allowed by the current state and timing window.",
  },
] as const;

function PaymentExample() {
  const [selected, setSelected] = useState(0);
  const stage = paymentExampleStages[selected];
  return <section className="mb-10 border border-black/[0.04] bg-[#f5f5f5] p-5 sm:p-7" aria-labelledby="payment-example-title">
    <p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">One conceptual Preprod payment</p>
    <h2 id="payment-example-title" className="mt-2 text-[28px] font-normal leading-[1.2] tracking-[-0.4px]">Watch value become new outputs</h2>
    <p className="mt-2 text-[14px] leading-[24px] text-[#5b5b5b]">This is a mental model, not transaction-building instructions or a statement of live fees.</p>
    <div className="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="Conceptual payment stages">
      {paymentExampleStages.map((item, index) => <button key={item.title} type="button" aria-pressed={selected === index} onClick={() => { setSelected(index); track("learn_payment_example_stage", { stage: index + 1 }); }} className={`min-w-[150px] border px-4 py-3 text-left text-[14px] transition-colors duration-200 ${selected === index ? "border-[#FA008C] bg-[#FA008C] text-white" : "border-black/[0.04] bg-white hover:bg-[#f5f5f5]"}`}><span className="block text-[13px] tracking-[0.02em] opacity-60">Step {index + 1}</span><span className="mt-1 block font-medium tracking-[0.01em]">{item.title}</span></button>)}
    </div>
    <div className="mt-3 grid gap-3 sm:grid-cols-2" aria-live="polite"><div className="bg-white p-5"><p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">Consumed or observed</p><ul className="mt-3 space-y-2 text-[14px] leading-[24px]">{stage.inputs.map((input) => <li key={input}>← {input}</li>)}</ul></div><div className="bg-white p-5"><p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">New output or state</p><ul className="mt-3 space-y-2 text-[14px] leading-[24px]">{stage.outputs.map((output) => <li key={output}>→ {output}</li>)}</ul></div></div>
    <div className="mt-3 bg-[#0a0a0a] p-5 text-white"><p className="text-[13px] uppercase tracking-[0.02em] text-[#f5f5f5]/70">{stage.actor}</p><p className="mt-2 text-[14px] leading-[24px] text-[#f5f5f5]/70">{stage.note}</p></div>
  </section>;
}

function TrackedDocsLink({ href, event, unit, children }: { href: string; event: "read" | "build" | "reference"; unit: string; children: React.ReactNode }) {
  return <a href={href} onClick={() => { track("learn_docs_handoff", { unit, destination: event }); if (event === "build") track("learn_quickstart_start", { unit }); }} className="block transition-colors duration-200 hover:text-[#6400FF]">{children}</a>;
}

export function Lesson({ unit, signedIn }: { unit: LessonUnit; signedIn: boolean }) {
  const { progress, setProgress } = useProgress(signedIn);
  const [saving, setSaving] = useState(false);
  const complete = progress?.completedLessons.includes(unit.slug) ?? false;
  useEffect(() => { track("learn_lesson_view", { unit: unit.slug }); }, [unit.slug]);
  async function markComplete() {
    if (complete || saving) return;
    setSaving(true);
    const response = await fetch("/api/learn/progress", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "complete_lesson", unit: unit.slug }) });
    if (response.ok) setProgress(await response.json());
    setSaving(false); track("learn_lesson_complete", { unit: unit.slug });
  }
  return <div className="grid gap-8 lg:grid-cols-[1fr_280px]"><article className="border border-black/[0.04] bg-white p-6 sm:p-10"><div className="mb-3 flex items-center gap-3 text-[13px] tracking-[0.02em] text-[#5b5b5b]"><span>Unit {unit.number}</span><span>•</span><span>{unit.duration}</span></div><p className="mb-6 text-[13px] tracking-[0.02em] text-[#5b5b5b]">Reviewed {unit.lastReviewed} · Accuracy: {unit.accuracyReviewer}</p><h1 className="max-w-3xl text-[40px] font-normal leading-[1.15] tracking-[-1.28px] md:text-[64px]">{unit.title}</h1><p className="mt-5 max-w-2xl text-[20px] leading-[28px] text-[#5b5b5b]">{unit.summary}</p><div className="my-10 bg-[#ff6ed2]/20 p-6"><p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">By the end, you can</p><ul className="mt-4 space-y-2 text-[14px] leading-[24px]">{unit.objectives.map((x) => <li key={x} className="flex gap-3"><span className="text-[#FA008C]">✓</span>{x}</li>)}</ul></div>{unit.sections.map((section) => <section key={section.title} className="mb-10"><h2 className="mb-4 text-[28px] font-normal leading-[1.2] tracking-[-0.4px]">{section.title}</h2>{section.paragraphs.map((p) => <p key={p} className="mb-4 text-[16px] leading-[24px] text-[#5b5b5b]">{p}</p>)}</section>)}{unit.slug === "masumi-fundamentals" && <LifecycleExplorer />}{unit.slug === "blockchain-basics" && <PaymentExample />}<aside className="border-l-2 border-l-[#FA008C] bg-black/[0.03] p-5"><p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">Keep this mental model</p><p className="mt-2 text-[16px] leading-[24px]">{unit.checkpoint}</p></aside><div className="mt-10 flex flex-wrap gap-3">{signedIn ? <><button disabled={!progress || saving} onClick={markComplete} className="rounded-full bg-[#0a0a0a] px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-white transition-colors duration-200 hover:bg-black disabled:opacity-50">{complete ? "Lesson complete ✓" : saving ? "Saving…" : "Mark lesson complete"}</button><Link onClick={() => void markComplete()} href={`/learn/course/${unit.slug}/quiz`} className="rounded-full bg-[#6400FF] px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-white transition-colors duration-200 hover:bg-[#5200d0]">Take the quiz →</Link></> : <Link href={`/learn/login?returnTo=${encodeURIComponent(`/learn/course/${unit.slug}`)}`} className="rounded-full bg-[#6400FF] px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-white transition-colors duration-200 hover:bg-[#5200d0]">Sign in to take the quiz and save progress →</Link>}</div></article><aside className="h-fit border border-black/[0.04] bg-white p-6 lg:sticky lg:top-32"><p className="text-[13px] uppercase tracking-[0.02em] text-[#5b5b5b]">Continue your path</p><div className="mt-5 space-y-4 text-[13px] text-[#919191]"><TrackedDocsLink href={unit.readHref} event="read" unit={unit.slug}>Next: read ↗</TrackedDocsLink><TrackedDocsLink href={unit.buildHref} event="build" unit={unit.slug}>Next: build ↗</TrackedDocsLink><TrackedDocsLink href={unit.referenceHref} event="reference" unit={unit.slug}>Reference ↗</TrackedDocsLink></div></aside></div>;
}

function QuestionList({ questions, answers, setAnswer, submitted, correctAnswers }: { questions: PublicQuestion[]; answers: Record<string, number>; setAnswer: (id: string, value: number) => void; submitted: boolean; correctAnswers: Record<string, number> }) {
  return <div className="space-y-6">{questions.map((q, index) => <fieldset key={q.id} className="border border-black/[0.04] bg-white p-5"><legend className="px-2 text-[16px] font-medium leading-[24px]">{index + 1}. {q.prompt}</legend><div className="mt-3 space-y-2">{q.options.map((option, i) => { const chosen = answers[q.id] === i; const correct = correctAnswers[q.id] === i; const state = submitted && correct ? "border-[#1c9e54] bg-[#d7f2e1] text-[#0c5c2e]" : submitted && chosen ? "border-[#fa140a] bg-[#ffcac5] text-[#5a0a00]" : chosen ? "border-[#6400FF] bg-white" : "border-transparent hover:bg-[#f5f5f5]"; return <label key={option} className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-[14px] transition-colors duration-200 ${state}`}><input type="radio" name={q.id} checked={chosen} onChange={() => setAnswer(q.id, i)} disabled={submitted} /><span>{option}</span></label>; })}</div>{submitted && <p className="mt-4 text-[14px] leading-[24px] text-[#5b5b5b]"><strong className="text-black">Why:</strong> {q.explanation}</p>}</fieldset>)}</div>;
}

export function Quiz({ unit, questions, passingScore }: { unit: UnitSummary; questions: PublicQuestion[]; passingScore: number }) {
  const [answers, setAnswers] = useState<Record<string, number>>({}); const [result, setResult] = useState<{ score: number; passed: boolean; correctAnswers: Record<string, number> } | null>(null); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function submit() { setLoading(true); setError(""); const response = await fetch("/api/learn/quiz", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ unit: unit.slug, answers }) }); const data = await response.json(); setLoading(false); if (!response.ok) { setError(data.error || "Unable to grade quiz"); return; } setResult(data); track("learn_quiz_attempt", { unit: unit.slug, score: data.score, passed: data.passed ? 1 : 0 }); }
  return <div className="mx-auto max-w-3xl border border-black/[0.04] bg-white p-6 sm:p-10"><p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">Unit {unit.number} knowledge check</p><h1 className="mt-3 text-[28px] font-normal leading-[1.2] tracking-[-0.4px] md:text-[40px]">{unit.title}</h1><p className="mt-3 text-[14px] leading-[24px] text-[#5b5b5b]">Answer all four questions. {passingScore}% passes. The server grades every attempt.</p><div className="mt-8"><QuestionList questions={questions} answers={answers} setAnswer={(id, value) => setAnswers({ ...answers, [id]: value })} submitted={Boolean(result)} correctAnswers={result?.correctAnswers ?? {}} /></div>{result ? <Result score={result.score} passed={result.passed} retry={() => { setResult(null); setAnswers({}); }} /> : <button disabled={loading || Object.keys(answers).length !== questions.length} onClick={submit} className="mt-6 rounded-full bg-[#6400FF] px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-white transition-colors duration-200 hover:bg-[#5200d0] disabled:opacity-30">{loading ? "Grading…" : "Check answers"}</button>}{error && <p role="alert" className="mt-3 text-[14px] text-[#fa140a]">{error}</p>}</div>;
}

function Result({ score, passed, retry }: { score: number; passed: boolean; retry: () => void }) { return <div className={`mt-6 p-5 ${passed ? "bg-[#d7f2e1] text-[#0c5c2e]" : "bg-[#ffcac5] text-[#5a0a00]"}`}><p className="text-[20px] font-semibold leading-[28px]">{score}% — {passed ? "Passed" : "Not quite yet"}</p><p className={`mt-1 text-[14px] leading-[24px] ${passed ? "text-[#0c5c2e]" : "text-[#5a0a00]"}`}>{passed ? "Saved to your Sokosumi-linked account." : "Review the explanations and try again."}</p><div className="mt-4 flex gap-3"><button onClick={retry} className="rounded-full border border-[#bbbbbb] bg-white px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-black transition-colors duration-200 hover:bg-[#f5f5f5]">Retry</button><Link href="/learn/course" className="rounded-full bg-[#0a0a0a] px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-white transition-colors duration-200 hover:bg-black">Course overview</Link></div></div>; }

export function Assessment({ questions, passingScore, unlocked, passedCount, unitCount }: { questions: PublicQuestion[]; passingScore: number; unlocked: boolean; passedCount: number; unitCount: number }) {
  const [answers, setAnswers] = useState<Record<string, number>>({}); const [result, setResult] = useState<{ score: number; passed: boolean; correctAnswers: Record<string, number>; credential?: { id: string } } | null>(null); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  if (!unlocked) return <div className="mx-auto max-w-2xl border border-black/[0.04] bg-white p-10 text-center"><p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">Assessment locked</p><h1 className="mt-3 text-[28px] font-normal leading-[1.2] tracking-[-0.4px]">Pass all four unit quizzes first</h1><p className="mt-3 text-[16px] leading-[24px] text-[#5b5b5b]">You have passed {passedCount} of {unitCount}.</p><Link href="/learn/course" className="mt-6 inline-block rounded-full bg-[#0a0a0a] px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-white transition-colors duration-200 hover:bg-black">Return to course</Link></div>;
  async function submit() { setLoading(true); const response = await fetch("/api/learn/assessment", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers }) }); const data = await response.json(); setLoading(false); if (!response.ok) { setError(data.error || "Unable to grade assessment"); return; } setResult(data); track("learn_assessment_complete", { score: data.score }); if (data.passed) track("learn_fundamentals_complete", { score: data.score }); }
  return <div className="mx-auto max-w-3xl border border-black/[0.04] bg-white p-6 sm:p-10"><p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">Final assessment</p><h1 className="mt-3 text-[28px] font-normal leading-[1.2] tracking-[-0.4px] md:text-[40px]">Masumi Fundamentals</h1><p className="mt-3 text-[14px] leading-[24px] text-[#5b5b5b]">Eight questions. Score {passingScore}% or higher. Passing issues an account-linked credential.</p><div className="mt-8"><QuestionList questions={questions} answers={answers} setAnswer={(id, value) => setAnswers({ ...answers, [id]: value })} submitted={Boolean(result)} correctAnswers={result?.correctAnswers ?? {}} /></div>{result ? <div className={`mt-6 p-5 ${result.passed ? "bg-[#d7f2e1] text-[#0c5c2e]" : "bg-[#ffcac5] text-[#5a0a00]"}`}><p className="text-[20px] font-semibold leading-[28px]">{result.score}% — {result.passed ? "Credential earned" : "Keep learning"}</p><div className="mt-4 flex gap-3">{result.passed && <Link href="/learn/course" className="rounded-full bg-[#6400FF] px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-white transition-colors duration-200 hover:bg-[#5200d0]">View credential →</Link>}<button onClick={() => { setResult(null); setAnswers({}); }} className="rounded-full border border-[#bbbbbb] bg-white px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-black transition-colors duration-200 hover:bg-[#f5f5f5]">Retry</button></div></div> : <button disabled={loading || Object.keys(answers).length !== questions.length} onClick={submit} className="mt-6 rounded-full bg-[#6400FF] px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-white transition-colors duration-200 hover:bg-[#5200d0] disabled:opacity-30">{loading ? "Grading…" : "Submit assessment"}</button>}{error && <p role="alert" className="mt-3 text-[14px] text-[#fa140a]">{error}</p>}</div>;
}

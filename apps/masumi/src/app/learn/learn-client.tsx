"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LearnUnit, QuizQuestion } from "./course-data";

type Progress = { completedLessons: string[]; passedQuizzes: string[]; quizScores: Record<string, number>; assessmentScore?: number; completedAt?: string };
type PublicQuestion = Omit<QuizQuestion, "answer">;
type UnitSummary = Pick<LearnUnit, "slug" | "number" | "title" | "summary" | "duration">;
type LessonUnit = Omit<LearnUnit, "quiz">;

function track(event: string, params: Record<string, string | number> = {}) { if (typeof window.gtag === "function") window.gtag("event", event, params); }

function useProgress() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState("");
  const [migrationNotice, setMigrationNotice] = useState("");
  async function load() {
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
  }
  useEffect(() => { queueMicrotask(() => void load()); }, []);
  return { progress, setProgress, error, migrationNotice };
}

function ProgressBar({ count, total }: { count: number; total: number }) {
  const percent = Math.round(count / total * 100);
  return <div aria-label={`${percent}% complete`} className="h-2 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-[#FA008C] transition-all" style={{ width: `${percent}%` }} /></div>;
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
  return <section className="mb-10 rounded-3xl bg-black p-5 text-white sm:p-7" aria-labelledby="lifecycle-title">
    <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#FF8CCB]">Interactive lifecycle</p>
    <h2 id="lifecycle-title" className="mt-2 text-2xl font-medium">Follow one paid job</h2>
    <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" aria-label="Payment lifecycle stages">
      {lifecycleStages.map((item, index) => <button key={item.title} type="button" aria-pressed={selected === index} onClick={() => { setSelected(index); track("learn_lifecycle_stage", { stage: index + 1 }); }} className={`rounded-2xl border p-3 text-left transition ${selected === index ? "border-[#FA008C] bg-[#FA008C] text-white" : "border-white/15 bg-white/5 text-white/70 hover:border-white/35"}`}><span className="block text-xs opacity-60">{index + 1}</span><span className="mt-1 block text-sm font-medium">{item.title}</span></button>)}
    </div>
    <div className="mt-4 rounded-2xl bg-white p-5 text-black" aria-live="polite"><p className="text-xs font-medium uppercase tracking-[0.14em] text-[#A50045]">{stage.actor}</p><h3 className="mt-2 text-xl font-medium">{selected + 1}. {stage.title}</h3><p className="mt-2 leading-7 text-black/65">{stage.detail}</p></div>
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
  return <section className="mb-10 rounded-3xl border border-black/10 bg-[#F7F4FF] p-5 sm:p-7" aria-labelledby="payment-example-title">
    <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6D28D9]">One conceptual Preprod payment</p>
    <h2 id="payment-example-title" className="mt-2 text-2xl font-medium">Watch value become new outputs</h2>
    <p className="mt-2 text-sm leading-6 text-black/55">This is a mental model, not transaction-building instructions or a statement of live fees.</p>
    <div className="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="Conceptual payment stages">
      {paymentExampleStages.map((item, index) => <button key={item.title} type="button" aria-pressed={selected === index} onClick={() => { setSelected(index); track("learn_payment_example_stage", { stage: index + 1 }); }} className={`min-w-[150px] rounded-2xl border px-4 py-3 text-left text-sm transition ${selected === index ? "border-[#6D28D9] bg-[#6D28D9] text-white" : "border-black/10 bg-white hover:border-[#6D28D9]/40"}`}><span className="block text-xs opacity-60">Step {index + 1}</span><span className="mt-1 block font-medium">{item.title}</span></button>)}
    </div>
    <div className="mt-3 grid gap-3 sm:grid-cols-2" aria-live="polite"><div className="rounded-2xl bg-white p-5"><p className="text-xs font-medium uppercase tracking-[0.14em] text-[#6D28D9]">Consumed or observed</p><ul className="mt-3 space-y-2 text-sm leading-6">{stage.inputs.map((input) => <li key={input}>← {input}</li>)}</ul></div><div className="rounded-2xl bg-white p-5"><p className="text-xs font-medium uppercase tracking-[0.14em] text-[#6D28D9]">New output or state</p><ul className="mt-3 space-y-2 text-sm leading-6">{stage.outputs.map((output) => <li key={output}>→ {output}</li>)}</ul></div></div>
    <div className="mt-3 rounded-2xl bg-black p-5 text-white"><p className="text-xs uppercase tracking-[0.14em] text-white/50">{stage.actor}</p><p className="mt-2 text-sm leading-6 text-white/75">{stage.note}</p></div>
  </section>;
}

function TrackedDocsLink({ href, event, unit, children }: { href: string; event: "read" | "build" | "reference"; unit: string; children: React.ReactNode }) {
  return <a href={href} onClick={() => { track("learn_docs_handoff", { unit, destination: event }); if (event === "build") track("learn_quickstart_start", { unit }); }} className="block hover:text-[#A50045]">{children}</a>;
}

export function CourseOverview({ units, passingScore }: { units: UnitSummary[]; passingScore: number }) {
  const { progress, error, migrationNotice } = useProgress();
  const passed = progress?.passedQuizzes.length ?? 0;
  useEffect(() => { if (progress) track("learn_course_view", { units_passed: passed }); }, [progress, passed]);
  return <>
    <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm"><div className="mb-3 flex items-center justify-between text-sm"><span>Your account progress</span><span className="font-medium">{passed} / {units.length} units</span></div><ProgressBar count={passed} total={units.length} /><div className="mt-3 flex items-center justify-between gap-4"><p className="text-xs text-black/50">Saved to your Sokosumi-linked account.</p><Link href="/learn/dashboard" className="text-xs font-medium text-[#A50045]">My learning →</Link></div>{migrationNotice && <p role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{migrationNotice}</p>}{error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}</div>
    <div className="grid gap-4 md:grid-cols-2">{units.map((unit) => { const done = progress?.passedQuizzes.includes(unit.slug); return <Link key={unit.slug} href={`/learn/${unit.slug}`} className="group rounded-3xl border border-black/10 bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#FA008C]/40 hover:shadow-lg"><div className="mb-8 flex items-center justify-between"><span className="rounded-full bg-[#FA008C]/10 px-3 py-1 text-xs font-medium text-[#A50045]">Unit {unit.number}</span><span className="text-xs text-black/50">{done ? "Passed ✓" : unit.duration}</span></div><h2 className="text-2xl font-medium tracking-tight">{unit.title}</h2><p className="mt-2 text-sm leading-6 text-black/60">{unit.summary}</p><span className="mt-6 inline-block text-sm font-medium text-[#A50045]">{done ? "Review lesson" : "Start lesson"} <span className="inline-block transition group-hover:translate-x-1">→</span></span></Link>; })}</div>
    <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-3xl bg-black p-7 text-white sm:flex-row sm:items-center"><div><p className="text-xs uppercase tracking-[0.18em] text-white/50">Final assessment</p><h2 className="mt-2 text-2xl font-medium">Earn the Fundamentals credential</h2><p className="mt-2 max-w-xl text-sm text-white/60">Pass all unit quizzes, then score at least {passingScore}%. Eligibility is checked by the server.</p></div><Link href="/learn/assessment" className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-medium text-black">Open assessment</Link></div>
  </>;
}

export function Lesson({ unit }: { unit: LessonUnit }) {
  const { progress, setProgress } = useProgress();
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
  return <div className="grid gap-8 lg:grid-cols-[1fr_280px]"><article className="rounded-3xl bg-white p-6 shadow-sm sm:p-10"><div className="mb-3 flex items-center gap-3 text-xs text-black/50"><span>Unit {unit.number}</span><span>•</span><span>{unit.duration}</span></div><p className="mb-6 text-xs text-black/40">Reviewed {unit.lastReviewed} · Accuracy: {unit.accuracyReviewer}</p><h1 className="max-w-3xl text-4xl font-medium tracking-[-0.04em] sm:text-6xl">{unit.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-black/60">{unit.summary}</p><div className="my-10 rounded-2xl bg-[#FFF0F5] p-6"><p className="text-xs font-medium uppercase tracking-[0.16em] text-[#A50045]">By the end, you can</p><ul className="mt-4 space-y-2 text-sm">{unit.objectives.map((x) => <li key={x} className="flex gap-3"><span className="text-[#FA008C]">✓</span>{x}</li>)}</ul></div>{unit.sections.map((section) => <section key={section.title} className="mb-10"><h2 className="mb-4 text-2xl font-medium tracking-tight">{section.title}</h2>{section.paragraphs.map((p) => <p key={p} className="mb-4 text-base leading-8 text-black/70">{p}</p>)}</section>)}{unit.slug === "masumi-fundamentals" && <LifecycleExplorer />}{unit.slug === "blockchain-basics" && <PaymentExample />}<aside className="rounded-2xl border-l-4 border-[#FA008C] bg-black/[0.03] p-5"><p className="text-xs font-medium uppercase tracking-[0.16em] text-[#A50045]">Keep this mental model</p><p className="mt-2 leading-7">{unit.checkpoint}</p></aside><div className="mt-10 flex flex-wrap gap-3"><button disabled={!progress || saving} onClick={markComplete} className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50">{complete ? "Lesson complete ✓" : saving ? "Saving…" : "Mark lesson complete"}</button><Link onClick={() => void markComplete()} href={`/learn/${unit.slug}/quiz`} className="rounded-full bg-[#FA008C] px-5 py-3 text-sm font-medium text-white">Take the quiz →</Link></div></article><aside className="h-fit rounded-3xl border border-black/10 p-6 lg:sticky lg:top-32"><p className="text-xs font-medium uppercase tracking-[0.16em] text-black/40">Continue your path</p><div className="mt-5 space-y-4 text-sm"><TrackedDocsLink href={unit.readHref} event="read" unit={unit.slug}>Next: read ↗</TrackedDocsLink><TrackedDocsLink href={unit.buildHref} event="build" unit={unit.slug}>Next: build ↗</TrackedDocsLink><TrackedDocsLink href={unit.referenceHref} event="reference" unit={unit.slug}>Reference ↗</TrackedDocsLink></div></aside></div>;
}

function QuestionList({ questions, answers, setAnswer, submitted, correctAnswers }: { questions: PublicQuestion[]; answers: Record<string, number>; setAnswer: (id: string, value: number) => void; submitted: boolean; correctAnswers: Record<string, number> }) {
  return <div className="space-y-6">{questions.map((q, index) => <fieldset key={q.id} className="rounded-2xl border border-black/10 p-5"><legend className="px-2 text-base font-medium">{index + 1}. {q.prompt}</legend><div className="mt-3 space-y-2">{q.options.map((option, i) => { const chosen = answers[q.id] === i; const correct = correctAnswers[q.id] === i; const state = submitted && correct ? "border-emerald-500 bg-emerald-50" : submitted && chosen ? "border-red-400 bg-red-50" : chosen ? "border-[#FA008C] bg-[#FFF0F5]" : "border-black/10 hover:border-black/30"; return <label key={option} className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm ${state}`}><input type="radio" name={q.id} checked={chosen} onChange={() => setAnswer(q.id, i)} disabled={submitted} /><span>{option}</span></label>; })}</div>{submitted && <p className="mt-4 text-sm leading-6 text-black/60"><strong className="text-black">Why:</strong> {q.explanation}</p>}</fieldset>)}</div>;
}

export function Quiz({ unit, questions, passingScore }: { unit: UnitSummary; questions: PublicQuestion[]; passingScore: number }) {
  const [answers, setAnswers] = useState<Record<string, number>>({}); const [result, setResult] = useState<{ score: number; passed: boolean; correctAnswers: Record<string, number> } | null>(null); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function submit() { setLoading(true); setError(""); const response = await fetch("/api/learn/quiz", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ unit: unit.slug, answers }) }); const data = await response.json(); setLoading(false); if (!response.ok) { setError(data.error || "Unable to grade quiz"); return; } setResult(data); track("learn_quiz_attempt", { unit: unit.slug, score: data.score, passed: data.passed ? 1 : 0 }); }
  return <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm sm:p-10"><p className="text-xs uppercase tracking-[0.16em] text-[#A50045]">Unit {unit.number} knowledge check</p><h1 className="mt-3 text-4xl font-medium tracking-tight">{unit.title}</h1><p className="mt-3 text-sm text-black/60">Answer all four questions. {passingScore}% passes. The server grades every attempt.</p><div className="mt-8"><QuestionList questions={questions} answers={answers} setAnswer={(id, value) => setAnswers({ ...answers, [id]: value })} submitted={Boolean(result)} correctAnswers={result?.correctAnswers ?? {}} /></div>{result ? <Result score={result.score} passed={result.passed} retry={() => { setResult(null); setAnswers({}); }} /> : <button disabled={loading || Object.keys(answers).length !== questions.length} onClick={submit} className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-30">{loading ? "Grading…" : "Check answers"}</button>}{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</div>;
}

function Result({ score, passed, retry }: { score: number; passed: boolean; retry: () => void }) { return <div className={`mt-6 rounded-2xl p-5 ${passed ? "bg-emerald-50" : "bg-amber-50"}`}><p className="text-xl font-medium">{score}% — {passed ? "Passed" : "Not quite yet"}</p><p className="mt-1 text-sm text-black/60">{passed ? "Saved to your Sokosumi-linked account." : "Review the explanations and try again."}</p><div className="mt-4 flex gap-3"><button onClick={retry} className="rounded-full border border-black/20 px-4 py-2 text-sm">Retry</button><Link href="/learn/course" className="rounded-full bg-black px-4 py-2 text-sm text-white">Course overview</Link></div></div>; }

export function Assessment({ questions, passingScore, unlocked, passedCount, unitCount }: { questions: PublicQuestion[]; passingScore: number; unlocked: boolean; passedCount: number; unitCount: number }) {
  const [answers, setAnswers] = useState<Record<string, number>>({}); const [result, setResult] = useState<{ score: number; passed: boolean; correctAnswers: Record<string, number>; credential?: { id: string } } | null>(null); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  if (!unlocked) return <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center"><p className="text-xs uppercase tracking-[0.16em] text-[#A50045]">Assessment locked</p><h1 className="mt-3 text-3xl font-medium">Pass all four unit quizzes first</h1><p className="mt-3 text-black/60">You have passed {passedCount} of {unitCount}.</p><Link href="/learn/course" className="mt-6 inline-block rounded-full bg-black px-5 py-3 text-sm text-white">Return to course</Link></div>;
  async function submit() { setLoading(true); const response = await fetch("/api/learn/assessment", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers }) }); const data = await response.json(); setLoading(false); if (!response.ok) { setError(data.error || "Unable to grade assessment"); return; } setResult(data); track("learn_assessment_complete", { score: data.score }); if (data.passed) track("learn_fundamentals_complete", { score: data.score }); }
  return <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm sm:p-10"><p className="text-xs uppercase tracking-[0.16em] text-[#A50045]">Final assessment</p><h1 className="mt-3 text-4xl font-medium tracking-tight">Masumi Fundamentals</h1><p className="mt-3 text-sm text-black/60">Eight questions. Score {passingScore}% or higher. Passing issues an account-linked credential.</p><div className="mt-8"><QuestionList questions={questions} answers={answers} setAnswer={(id, value) => setAnswers({ ...answers, [id]: value })} submitted={Boolean(result)} correctAnswers={result?.correctAnswers ?? {}} /></div>{result ? <div className={`mt-6 rounded-2xl p-5 ${result.passed ? "bg-emerald-50" : "bg-amber-50"}`}><p className="text-xl font-medium">{result.score}% — {result.passed ? "Credential earned" : "Keep learning"}</p><div className="mt-4 flex gap-3">{result.passed && <Link href="/learn/dashboard" className="rounded-full bg-[#FA008C] px-5 py-3 text-sm text-white">View credential →</Link>}<button onClick={() => { setResult(null); setAnswers({}); }} className="rounded-full border border-black/20 px-5 py-3 text-sm">Retry</button></div></div> : <button disabled={loading || Object.keys(answers).length !== questions.length} onClick={submit} className="mt-6 rounded-full bg-black px-6 py-3 text-sm text-white disabled:opacity-30">{loading ? "Grading…" : "Submit assessment"}</button>}{error && <p role="alert" className="mt-3 text-red-700">{error}</p>}</div>;
}

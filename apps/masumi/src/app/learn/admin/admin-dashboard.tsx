"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type UnitMetric = { unitSlug: string; lessonCompletions: number; quizPassers: number; quizAttempts: number };
type QuestionMetric = { courseVersion: string; context: string; questionId: string; attempts: number; correctCount: number; incorrectCount: number; failureRate: number };
type CredentialMetric = { credentialType: string; status: string; count: number };
type TimingMetric = { definition: string; cohortSize?: number | null; medianMinutes: number | null; suppressed: boolean };
type Funnel = {
  learners: number;
  activeLearners: number;
  completedLearners: number;
  completionRate: number;
  quizAttempts: number;
  quizPasses: number;
  assessmentAttempts: number;
  assessmentPasses: number;
  builderActiveLearners: number;
  verifiedBuilderProofs: number;
  builderAssessmentAttempts: number;
  builderAssessmentPasses: number;
  validFundamentalsCredentials: number;
  validBuilderCredentials: number;
  fundamentalsToBuilderConversionRate: number;
  timeToFirstVerifiedPreprodProof: TimingMetric;
};
type Coverage = {
  availableCourseVersions?: string[];
  courseVersions?: string[];
  from?: string | null;
  to?: string | null;
  firstEventAt?: string | null;
  lastEventAt?: string | null;
  questionMetrics?: "daily" | "lifetime" | string;
  questionMetricsFrom?: string | null;
  historicalQuestionBackfillAvailable?: boolean;
  analyticsFrom?: string | null;
};
type HandoffMetric = { status: string; source: string; count: number | null };
type AggregateReport = {
  generatedAt: string;
  courseVersion: string;
  privacy: { aggregateOnly: boolean; minimumQuestionAttempts: number; minimumTimingCohort: number };
  filters?: { from?: string | null; to?: string | null; courseVersion?: string | null; builderCourseVersion?: string | null };
  coverage?: Coverage;
  availableVersions?: { fundamentals?: string[]; builder?: string[] };
  funnel: Funnel;
  units: UnitMetric[];
  questions: QuestionMetric[];
  repeatedFailures?: QuestionMetric[];
  credentials: CredentialMetric[];
  handoffs?: Record<string, HandoffMetric>;
};

const unitNames: Record<string, string> = {
  "agentic-economy": "The agentic economy",
  "masumi-fundamentals": "Masumi fundamentals",
  "blockchain-basics": "Blockchain without the prerequisite burden",
  "trust-and-payments": "Trust and payment lifecycle",
};

function percent(numerator: number, denominator: number) {
  return denominator ? Math.round((numerator / denominator) * 1000) / 10 : 0;
}

function number(value: number | null | undefined) {
  return new Intl.NumberFormat("en").format(value ?? 0);
}

function readable(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function AdminDashboard() {
  const [report, setReport] = useState<AggregateReport | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [courseVersion, setCourseVersion] = useState("");
  const [builderVersion, setBuilderVersion] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ from: "", to: "", courseVersion: "", builderVersion: "" });

  const load = useCallback(async (filters: typeof appliedFilters) => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams();
      if (filters.from) query.set("from", filters.from);
      if (filters.to) query.set("to", filters.to);
      if (filters.courseVersion) query.set("courseVersion", filters.courseVersion);
      if (filters.builderVersion) query.set("builderVersion", filters.builderVersion);
      const response = await fetch(`/api/learn/dashboard/report${query.size ? `?${query}` : ""}`, { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 403 || response.status === 404 ? "This dashboard is not available for this account." : "The aggregate report is temporarily unavailable.");
      setReport(await response.json() as AggregateReport);
    } catch (cause) {
      setReport(null);
      const message = cause instanceof Error ? cause.message : "";
      setError(message === "This dashboard is not available for this account." || message === "The aggregate report is temporarily unavailable."
        ? message
        : "The aggregate report is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(appliedFilters); }, [appliedFilters, load]);

  const versions = useMemo(() => {
    const supplied = report?.availableVersions?.fundamentals ?? report?.coverage?.availableCourseVersions ?? report?.coverage?.courseVersions ?? [];
    return [...new Set([report?.courseVersion, ...supplied].filter((item): item is string => Boolean(item)))];
  }, [report]);
  const builderVersions = useMemo(() => report?.availableVersions?.builder ?? [], [report]);

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (from && to && from > to) {
      setError("The start date must be on or before the end date.");
      return;
    }
    setAppliedFilters({ from, to, courseVersion, builderVersion });
  }

  function clearFilters() {
    setFrom("");
    setTo("");
    setCourseVersion("");
    setBuilderVersion("");
    setAppliedFilters({ from: "", to: "", courseVersion: "", builderVersion: "" });
  }

  const hasActivity = Boolean(report && (
    report.funnel.learners || report.funnel.quizAttempts || report.funnel.assessmentAttempts ||
    report.funnel.builderActiveLearners || report.credentials.some((item) => item.count) ||
    Object.values(report.handoffs ?? {}).some((item) => item.count)
  ));
  const isAllTime = !appliedFilters.from && !appliedFilters.to;

  return (
    <div className="min-w-0" aria-busy={loading}>
      <header className="border-b border-black/10 pb-8">
        <p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">Learn operations</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-[40px] font-normal leading-[1.15] tracking-[-0.8px] md:text-[56px]">Admin analytics</h1>
            <p className="mt-3 max-w-2xl text-[16px] leading-6 text-[#5b5b5b]">Aggregate course and credential signals for operating Masumi Learn. No learner identities or answer-level records appear here.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/learn/admin/participants" className="rounded-full border border-[#bbbbbb] bg-white px-5 py-2.5 text-[14px] font-medium hover:bg-[#f5f5f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6400FF]">Participants</Link>
            <button type="button" onClick={() => void load(appliedFilters)} disabled={loading} className="w-fit rounded-full bg-[#6400FF] px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-white transition-colors hover:bg-[#5200d0] disabled:cursor-wait disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6400FF]">
              {loading ? "Refreshing…" : "Refresh report"}
            </button>
          </div>
        </div>
      </header>

      <section className="mt-6 min-w-0 border border-black/[0.04] bg-white p-5 sm:p-6" aria-labelledby="filters-title">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 id="filters-title" className="text-[17px] font-medium">Report window</h2>
            <p className="mt-1 text-[13px] leading-5 text-[#5b5b5b]">Dates are inclusive. Leave fields empty for all available activity.</p>
          </div>
          {report && <div className="flex flex-wrap items-center gap-2 text-[12px] leading-5 text-[#5b5b5b]" aria-live="polite">{isAllTime && <span className="rounded-full bg-[#FA008C]/10 px-2.5 py-0.5 font-medium text-[#9d0058]">All time</span>}<span>Generated {dateTime(report.generatedAt)}</span></div>}
        </div>
        <form onSubmit={apply} className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
          <Field label="From"><input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} className="min-w-0 max-w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6400FF]" /></Field>
          <Field label="To"><input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} className="min-w-0 max-w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6400FF]" /></Field>
          <Field label="Fundamentals version"><select value={courseVersion} onChange={(event) => setCourseVersion(event.target.value)} className="min-w-0 max-w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6400FF]"><option value="">Current version</option>{versions.map((version) => <option key={version} value={version}>{version}</option>)}</select></Field>
          <Field label="Builder version"><select value={builderVersion} onChange={(event) => setBuilderVersion(event.target.value)} className="min-w-0 max-w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6400FF]"><option value="">Current version</option>{builderVersions.map((version) => <option key={version} value={version}>{version}</option>)}</select></Field>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={loading} className="rounded-full bg-black px-5 py-2.5 text-[14px] font-medium text-white hover:bg-black/80 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6400FF]">Apply</button>
            {(appliedFilters.from || appliedFilters.to || appliedFilters.courseVersion || appliedFilters.builderVersion) && <button type="button" onClick={clearFilters} className="rounded-full border border-[#bbbbbb] bg-white px-5 py-2.5 text-[14px] font-medium hover:bg-[#f5f5f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6400FF]">Clear</button>}
          </div>
        </form>
      </section>

      <div className="sr-only" aria-live="polite">{loading ? "Loading aggregate analytics" : error || (report ? `Report generated ${dateTime(report.generatedAt)}` : "")}</div>

      {error && (
        <section role="alert" className="mt-6 border border-[#fa140a]/20 bg-[#fa140a]/10 p-5 text-[#6b1009]">
          <h2 className="text-[17px] font-medium">Report unavailable</h2>
          <p className="mt-1 text-[14px] leading-6">{error}</p>
          <button type="button" onClick={() => void load(appliedFilters)} className="mt-4 rounded-full border border-[#6b1009]/30 bg-white px-5 py-2 text-[14px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6400FF]">Try again</button>
        </section>
      )}

      {loading && !report && <DashboardSkeleton />}

      {report && !error && (
        <>
          <PrivacySummary report={report} />
          {Date.now() - Date.parse(report.generatedAt) > 15 * 60_000 && (
            <p className="mt-3 border border-[#ff6400]/20 bg-[#ff6400]/10 p-4 text-[13px] leading-5 text-[#713000]" role="status">This report is more than 15 minutes old. Refresh before making an operational decision.</p>
          )}
          {report.coverage?.historicalQuestionBackfillAvailable === false && appliedFilters.from && (
            <p className="mt-3 border border-[#ff6400]/20 bg-[#ff6400]/10 p-4 text-[13px] leading-5 text-[#713000]" role="status">
              Question-level date filtering covers daily metrics recorded from {report.coverage.questionMetricsFrom || "the analytics rollout"}. Earlier question history was not backfilled; the rest of the report still uses the selected window.
            </p>
          )}
          {!hasActivity ? <EmptyReport /> : <DashboardReport report={report} />}
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block min-w-0"><span className="mb-1.5 block text-[13px] font-medium text-[#5b5b5b]">{label}</span>{children}</label>;
}

function PrivacySummary({ report }: { report: AggregateReport }) {
  return (
    <section className="mt-5 grid gap-4 border border-black/[0.04] bg-[#0a0a0a] p-5 text-white sm:grid-cols-[auto_1fr] sm:items-center sm:p-6" aria-labelledby="privacy-title">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FA008C] text-lg" aria-hidden="true">✓</div>
      <div>
        <h2 id="privacy-title" className="text-[17px] font-medium">Aggregate-only privacy controls active</h2>
        <p className="mt-1 text-[13px] leading-5 text-white/70">Question patterns appear after at least {report.privacy.minimumQuestionAttempts} attempts. Timing appears after at least {report.privacy.minimumTimingCohort} learners. Suppressed cohort sizes are not disclosed.</p>
      </div>
    </section>
  );
}

function EmptyReport() {
  return (
    <section className="mt-5 border border-black/[0.04] bg-white p-8 text-center sm:p-12" aria-labelledby="empty-report-title">
      <p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">No activity in this window</p>
      <h2 id="empty-report-title" className="mt-3 text-[28px] font-normal leading-[1.2] tracking-[-0.4px]">Learner activity will appear here</h2>
      <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-[#5b5b5b]">Try a wider report window, clear the course-version filter, or check again after learners begin the course.</p>
    </section>
  );
}

function DashboardReport({ report }: { report: AggregateReport }) {
  const f = report.funnel;
  const failures = report.repeatedFailures ?? report.questions;
  const lessonCompletions = report.units.reduce((total, unit) => total + unit.lessonCompletions, 0);
  return (
    <div className="mt-5 space-y-5">
      <section className="border border-black/[0.04] bg-white p-5 sm:p-7" aria-labelledby="journey-title">
        <SectionHeading eyebrow="Consent-aware funnel" title="Course engagement" id="journey-title" compact />
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Course engagement stages">
          {[
            ["Course views", report.handoffs?.courseViews?.count ?? 0],
            ["Lessons completed", lessonCompletions],
            ["Quiz attempts", f.quizAttempts],
            ["Quiz passes", f.quizPasses],
          ].map(([label, value], index) => <li key={String(label)} className="border-l-2 border-[#FA008C] bg-black/[0.03] p-4"><span className="block text-[12px] text-[#5b5b5b]">Stage {index + 1}</span><strong className="mt-2 block text-[24px] font-normal">{number(value as number)}</strong><span className="mt-1 block text-[13px]">{label}</span></li>)}
        </ol>
        <p className="mt-4 text-[13px] leading-5 text-[#5b5b5b]">Course views and handoffs are recorded only after analytics consent, as daily aggregate counts without session or learner identifiers. Coverage begins {report.coverage?.analyticsFrom || "with this dashboard rollout"}.</p>
      </section>

      <section aria-labelledby="fundamentals-title">
        <SectionHeading eyebrow="Fundamentals" title="Learner outcomes" id="fundamentals-title" />
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Learners" value={number(f.learners)} />
          <Metric label="Active learners" value={number(f.activeLearners)} detail={`${percent(f.activeLearners, f.learners)}% of learners`} />
          <Metric label="Course completions" value={number(f.completedLearners)} detail={`${f.completionRate}% of active learners`} />
          <Metric label="Valid credentials" value={number(f.validFundamentalsCredentials)} detail={`${percent(f.validFundamentalsCredentials, f.completedLearners)}% of completions`} />
        </dl>
        <ol className="mt-3 grid gap-1 bg-white p-4 sm:grid-cols-4" aria-label="Fundamentals funnel stages">
          {[["Learners", f.learners], ["Active", f.activeLearners], ["Completed", f.completedLearners], ["Credentialed", f.validFundamentalsCredentials]].map(([label, value], index) => <li key={String(label)} className="border-l-2 border-[#FA008C] px-3 py-2"><span className="block text-[12px] text-[#5b5b5b]">Stage {index + 1}</span><strong className="mt-1 block text-[14px] font-medium">{label}: {number(value as number)}</strong></li>)}
        </ol>
      </section>

      <section className="border border-black/[0.04] bg-white p-5 sm:p-7" aria-labelledby="unit-title">
        <SectionHeading eyebrow="Course" title="Unit performance" id="unit-title" compact />
        {report.units.length ? <ResponsiveUnitTable units={report.units} /> : <InlineEmpty>There is no unit activity in this report window.</InlineEmpty>}
      </section>

      <section className="grid gap-5 lg:grid-cols-2" aria-label="Assessment and Builder analytics">
        <div className="border border-black/[0.04] bg-white p-5 sm:p-7">
          <SectionHeading eyebrow="Assessment" title="Final assessment" id="assessment-title" compact />
          <dl className="mt-5 grid grid-cols-2 gap-3">
            <SmallMetric label="Attempts" value={number(f.assessmentAttempts)} />
            <SmallMetric label="Passes" value={number(f.assessmentPasses)} />
            <SmallMetric label="Pass rate" value={`${percent(f.assessmentPasses, f.assessmentAttempts)}%`} />
            <SmallMetric label="Quiz pass rate" value={`${percent(f.quizPasses, f.quizAttempts)}%`} />
          </dl>
        </div>
        <div className="border border-black/[0.04] bg-white p-5 sm:p-7">
          <SectionHeading eyebrow="Builder" title="Verified practice" id="builder-title" compact />
          <dl className="mt-5 grid grid-cols-2 gap-3">
            <SmallMetric label="Active builders" value={number(f.builderActiveLearners)} />
            <SmallMetric label="Verified proofs" value={number(f.verifiedBuilderProofs)} />
            <SmallMetric label="Assessment passes" value={`${number(f.builderAssessmentPasses)} / ${number(f.builderAssessmentAttempts)}`} />
            <SmallMetric label="Valid credentials" value={number(f.validBuilderCredentials)} />
            <SmallMetric label="Fundamentals → Builder" value={`${f.fundamentalsToBuilderConversionRate}%`} />
            <SmallMetric label="Median to proof" value={f.timeToFirstVerifiedPreprodProof.suppressed ? "Suppressed" : formatMinutes(f.timeToFirstVerifiedPreprodProof.medianMinutes)} detail={f.timeToFirstVerifiedPreprodProof.suppressed ? `Fewer than ${report.privacy.minimumTimingCohort} learners` : undefined} />
          </dl>
        </div>
      </section>

      <section className="border border-black/[0.04] bg-white p-5 sm:p-7" aria-labelledby="failure-title">
        <SectionHeading eyebrow="Content quality" title="Repeated question failures" id="failure-title" compact />
        <p className="mt-2 text-[13px] leading-5 text-[#5b5b5b]">Only questions meeting the minimum of {report.privacy.minimumQuestionAttempts} attempts are eligible.</p>
        {failures.length ? <ResponsiveQuestionTable questions={failures} /> : <InlineEmpty>No question has reached the privacy threshold in this report window.</InlineEmpty>}
      </section>

      <section className="border border-black/[0.04] bg-white p-5 sm:p-7" aria-labelledby="credential-title">
        <SectionHeading eyebrow="Issuance" title="Credential status" id="credential-title" compact />
        {report.credentials.length ? <ResponsiveCredentialTable credentials={report.credentials} /> : <InlineEmpty>No credential records exist in this report window.</InlineEmpty>}
      </section>

      <section className="border border-black/[0.04] bg-white p-5 sm:p-7" aria-labelledby="handoff-title">
        <SectionHeading eyebrow="Conversions" title="Documentation and Sokosumi handoffs" id="handoff-title" compact />
        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <HandoffMetricCard label="Course views" metric={report.handoffs?.courseViews} />
          <HandoffMetricCard label="Quickstart starts" metric={report.handoffs?.quickstartStarts} />
          <HandoffMetricCard label="Sokosumi publishing" metric={report.handoffs?.sokosumiPublishing} />
        </dl>
        <p className="mt-3 text-[13px] leading-5 text-[#5b5b5b]">These consented events are stored only as daily totals by course version. Google Analytics remains the source for broader acquisition and behavior analysis.</p>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title, id, compact = false }: { eyebrow: string; title: string; id: string; compact?: boolean }) {
  return <div><p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">{eyebrow}</p><h2 id={id} className={`mt-2 font-normal leading-[1.2] tracking-[-0.4px] ${compact ? "text-[24px] sm:text-[28px]" : "text-[28px] md:text-[40px]"}`}>{title}</h2></div>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="border border-black/[0.04] bg-white p-5 sm:p-6"><dt className="text-[13px] text-[#5b5b5b]">{label}</dt><dd className="mt-2 text-[32px] font-normal tracking-[-0.5px]">{value}</dd>{detail && <dd className="mt-1 text-[12px] text-[#919191]">{detail}</dd>}</div>;
}

function SmallMetric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="bg-black/[0.03] p-4"><dt className="text-[12px] leading-4 text-[#5b5b5b]">{label}</dt><dd className="mt-1 text-[20px] font-medium tracking-tight">{value}</dd>{detail && <dd className="mt-1 text-[11px] leading-4 text-[#919191]">{detail}</dd>}</div>;
}

function HandoffMetricCard({ label, metric }: { label: string; metric?: HandoffMetric }) {
  return <div className="bg-black/[0.03] p-4"><dt className="text-[12px] leading-4 text-[#5b5b5b]">{label}</dt><dd className="mt-2 text-[24px] font-medium">{metric?.count == null ? "Unavailable" : number(metric.count)}</dd><dd className="mt-1 text-[11px] uppercase tracking-[0.02em] text-[#919191]">Source: {metric?.source || "consent-aware aggregate"}</dd></div>;
}

function ResponsiveUnitTable({ units }: { units: UnitMetric[] }) {
  return <><div className="mt-5 hidden sm:block"><table className="w-full border-collapse text-left text-[13px]"><caption className="sr-only">Lesson and quiz activity by course unit</caption><thead><tr className="border-b border-black/10 text-[#5b5b5b]"><th scope="col" className="py-3 pr-4 font-medium">Unit</th><th scope="col" className="px-3 py-3 text-right font-medium">Lessons</th><th scope="col" className="px-3 py-3 text-right font-medium">Quiz passers</th><th scope="col" className="px-3 py-3 text-right font-medium">Attempts</th><th scope="col" className="py-3 pl-3 text-right font-medium">Lesson → pass</th></tr></thead><tbody>{units.map((unit) => <tr key={unit.unitSlug} className="border-b border-black/[0.06] last:border-0"><th scope="row" className="py-4 pr-4 font-medium">{unitNames[unit.unitSlug] ?? readable(unit.unitSlug)}</th><td className="px-3 py-4 text-right">{number(unit.lessonCompletions)}</td><td className="px-3 py-4 text-right">{number(unit.quizPassers)}</td><td className="px-3 py-4 text-right">{number(unit.quizAttempts)}</td><td className="py-4 pl-3 text-right">{percent(unit.quizPassers, unit.lessonCompletions)}%</td></tr>)}</tbody></table></div><ul className="mt-5 space-y-3 sm:hidden" aria-label="Lesson and quiz activity by course unit">{units.map((unit) => <li key={unit.unitSlug} className="border border-black/[0.06] p-4"><h3 className="text-[14px] font-medium">{unitNames[unit.unitSlug] ?? readable(unit.unitSlug)}</h3><dl className="mt-3 grid grid-cols-2 gap-3 text-[12px]"><SmallMetric label="Lessons" value={number(unit.lessonCompletions)} /><SmallMetric label="Quiz passers" value={number(unit.quizPassers)} /><SmallMetric label="Attempts" value={number(unit.quizAttempts)} /><SmallMetric label="Lesson → pass" value={`${percent(unit.quizPassers, unit.lessonCompletions)}%`} /></dl></li>)}</ul></>;
}

function ResponsiveQuestionTable({ questions }: { questions: QuestionMetric[] }) {
  return <><div className="mt-5 hidden sm:block"><table className="w-full border-collapse text-left text-[13px]"><caption className="sr-only">Repeated failures for questions meeting the privacy threshold</caption><thead><tr className="border-b border-black/10 text-[#5b5b5b]"><th scope="col" className="py-3 pr-4 font-medium">Question</th><th scope="col" className="px-3 py-3 font-medium">Context</th><th scope="col" className="px-3 py-3 text-right font-medium">Attempts</th><th scope="col" className="px-3 py-3 text-right font-medium">Incorrect</th><th scope="col" className="py-3 pl-3 text-right font-medium">Failure rate</th></tr></thead><tbody>{questions.map((item) => <tr key={`${item.courseVersion}:${item.context}:${item.questionId}`} className="border-b border-black/[0.06] last:border-0"><th scope="row" className="py-4 pr-4 font-mono text-[12px] font-medium">{item.questionId}</th><td className="px-3 py-4"><span className="block">{readable(item.context)}</span><span className="text-[11px] text-[#919191]">{item.courseVersion}</span></td><td className="px-3 py-4 text-right">{number(item.attempts)}</td><td className="px-3 py-4 text-right">{number(item.incorrectCount)}</td><td className="py-4 pl-3 text-right">{item.failureRate}%</td></tr>)}</tbody></table></div><ul className="mt-5 space-y-3 sm:hidden" aria-label="Repeated failures by question">{questions.map((item) => <li key={`${item.courseVersion}:${item.context}:${item.questionId}`} className="border border-black/[0.06] p-4"><div className="flex items-start justify-between gap-3"><h3 className="font-mono text-[13px] font-medium">{item.questionId}</h3><strong className="text-[14px] font-medium text-[#FA008C]">{item.failureRate}% failed</strong></div><p className="mt-1 text-[12px] text-[#5b5b5b]">{readable(item.context)} · {item.courseVersion}</p><p className="mt-3 text-[12px]">{number(item.incorrectCount)} incorrect of {number(item.attempts)} attempts</p></li>)}</ul></>;
}

function ResponsiveCredentialTable({ credentials }: { credentials: CredentialMetric[] }) {
  return <><div className="mt-5 hidden sm:block"><table className="w-full border-collapse text-left text-[13px]"><caption className="sr-only">Credential totals by type and status</caption><thead><tr className="border-b border-black/10 text-[#5b5b5b]"><th scope="col" className="py-3 pr-4 font-medium">Credential</th><th scope="col" className="px-3 py-3 font-medium">Status</th><th scope="col" className="py-3 pl-3 text-right font-medium">Count</th></tr></thead><tbody>{credentials.map((item) => <tr key={`${item.credentialType}:${item.status}`} className="border-b border-black/[0.06] last:border-0"><th scope="row" className="py-4 pr-4 font-medium">{readable(item.credentialType)}</th><td className="px-3 py-4"><span className="inline-block rounded-full bg-[#ff6ed2] px-3 py-1 text-[12px] text-[#460a23]">{readable(item.status)}</span></td><td className="py-4 pl-3 text-right">{number(item.count)}</td></tr>)}</tbody></table></div><ul className="mt-5 space-y-2 sm:hidden" aria-label="Credential totals by type and status">{credentials.map((item) => <li key={`${item.credentialType}:${item.status}`} className="flex items-center justify-between gap-4 border border-black/[0.06] p-4"><div><h3 className="text-[14px] font-medium">{readable(item.credentialType)}</h3><p className="mt-1 text-[12px] text-[#5b5b5b]">{readable(item.status)}</p></div><strong className="text-[20px] font-medium">{number(item.count)}</strong></li>)}</ul></>;
}

function InlineEmpty({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 bg-black/[0.03] p-5 text-[14px] leading-6 text-[#5b5b5b]">{children}</p>;
}

function formatMinutes(value: number | null) {
  if (value == null) return "Unavailable";
  if (value < 60) return `${number(value)} min`;
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

function DashboardSkeleton() {
  return <div className="mt-6 space-y-5" aria-hidden="true"><div className="h-24 animate-pulse bg-[#e8e8e8]" /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse bg-[#e8e8e8]" />)}</div><div className="h-72 animate-pulse bg-[#e8e8e8]" /></div>;
}

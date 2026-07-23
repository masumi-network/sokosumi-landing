"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Participant = {
  id: string;
  displayName: string | null;
  email: string | null;
  joinedAt: string;
  lastActiveAt: string;
  lessonsCompleted: number;
  quizzesPassed: number;
  quizAttempts: number;
  quizPasses: number;
  bestQuizScore: number | null;
  assessmentAttempts: number;
  assessmentPasses: number;
  bestAssessmentScore: number | null;
  builderStepsCompleted: number;
  verifiedBuilderProofs: number;
  fundamentalsCredentialStatus: string | null;
  builderCredentialStatus: string | null;
};

type ParticipantReport = {
  generatedAt: string;
  courseVersion: string;
  builderCourseVersion: string;
  total: number;
  limit: number;
  offset: number;
  participants: Participant[];
};

const PAGE_SIZE = 25;

function date(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function status(value: string | null) {
  return value ? value.replaceAll("_", " ") : "—";
}

export function ParticipantDashboard() {
  const [report, setReport] = useState<ParticipantReport | null>(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/learn/dashboard/participants?limit=${PAGE_SIZE}&offset=${offset}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Participant records are temporarily unavailable.");
      setReport(await response.json() as ParticipantReport);
    } catch (cause) {
      setReport(null);
      setError(cause instanceof Error ? cause.message : "Participant records are temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="min-w-0" aria-busy={loading}>
      <header className="border-b border-black/10 pb-8">
        <p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">Restricted learner administration</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-[40px] font-normal leading-[1.15] tracking-[-0.8px] md:text-[56px]">Participants</h1>
            <p className="mt-3 max-w-2xl text-[16px] leading-6 text-[#5b5b5b]">Identified learner records and current-version progress. Access is restricted and every list request is audited.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/learn/admin" className="rounded-full border border-[#bbbbbb] bg-white px-5 py-2.5 text-[14px] font-medium hover:bg-[#f5f5f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6400FF]">Aggregate analytics</Link>
            <button type="button" onClick={() => void load()} disabled={loading} className="rounded-full bg-[#6400FF] px-5 py-2.5 text-[14px] font-medium text-white hover:bg-[#5200d0] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6400FF]">{loading ? "Refreshing…" : "Refresh"}</button>
          </div>
        </div>
      </header>

      <section className="mt-6 border border-[#ff6400]/20 bg-[#ff6400]/10 p-4 text-[13px] leading-5 text-[#713000]" aria-label="Privacy notice">
        This view contains names, email addresses, and individual progress. Use it only for Learn operations; do not export or redistribute participant data.
      </section>

      {error && <section role="alert" className="mt-6 border border-[#fa140a]/20 bg-[#fa140a]/10 p-5 text-[#6b1009]"><h2 className="text-[17px] font-medium">Participants unavailable</h2><p className="mt-1 text-[14px]">{error}</p><button type="button" onClick={() => void load()} className="mt-4 rounded-full border border-[#6b1009]/30 bg-white px-5 py-2 text-[14px] font-medium">Try again</button></section>}
      {loading && !report && <div className="mt-6 h-64 animate-pulse bg-black/[0.04]" aria-label="Loading participants" />}

      {report && !error && (
        <section className="mt-6 min-w-0 border border-black/[0.04] bg-white" aria-labelledby="participant-list-title">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/10 p-5 sm:p-6">
            <div><p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">All registered learners</p><h2 id="participant-list-title" className="mt-1 text-[24px] font-normal">{report.total} participant{report.total === 1 ? "" : "s"}</h2></div>
            <p className="text-[12px] text-[#5b5b5b]">Stats: {report.courseVersion} and {report.builderCourseVersion}</p>
          </div>
          {report.participants.length === 0 ? (
            <p className="p-6 text-[14px] text-[#5b5b5b]">No participants are available on this page.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] border-collapse text-left text-[13px]">
                <caption className="sr-only">Identified participants and their Masumi Learn statistics</caption>
                <thead className="bg-black/[0.03] text-[#5b5b5b]"><tr><th className="px-4 py-3 font-medium">Participant</th><th className="px-4 py-3 font-medium">Joined / active</th><th className="px-4 py-3 font-medium">Lessons</th><th className="px-4 py-3 font-medium">Quizzes</th><th className="px-4 py-3 font-medium">Assessment</th><th className="px-4 py-3 font-medium">Fundamentals credential</th><th className="px-4 py-3 font-medium">Builder</th><th className="px-4 py-3 font-medium">Builder credential</th></tr></thead>
                <tbody>{report.participants.map((participant) => (
                  <tr key={participant.id} className="border-t border-black/[0.06] align-top">
                    <th scope="row" className="px-4 py-4 font-normal"><strong className="block font-medium text-black">{participant.displayName || "Unnamed learner"}</strong><span className="mt-1 block text-[#5b5b5b]">{participant.email || "No email available"}</span></th>
                    <td className="px-4 py-4"><span className="block">Joined {date(participant.joinedAt)}</span><span className="mt-1 block text-[#5b5b5b]">Active {date(participant.lastActiveAt)}</span></td>
                    <td className="px-4 py-4">{participant.lessonsCompleted} completed</td>
                    <td className="px-4 py-4"><span className="block">{participant.quizPasses}/{participant.quizAttempts} passes</span><span className="mt-1 block text-[#5b5b5b]">Best {participant.bestQuizScore ?? "—"}%</span></td>
                    <td className="px-4 py-4"><span className="block">{participant.assessmentPasses}/{participant.assessmentAttempts} passes</span><span className="mt-1 block text-[#5b5b5b]">Best {participant.bestAssessmentScore ?? "—"}%</span></td>
                    <td className="px-4 py-4 capitalize">{status(participant.fundamentalsCredentialStatus)}</td>
                    <td className="px-4 py-4"><span className="block">{participant.builderStepsCompleted} steps</span><span className="mt-1 block text-[#5b5b5b]">{participant.verifiedBuilderProofs} verified proofs</span></td>
                    <td className="px-4 py-4 capitalize">{status(participant.builderCredentialStatus)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 border-t border-black/10 p-4 sm:px-6">
            <p className="text-[13px] text-[#5b5b5b]">Showing {report.total ? report.offset + 1 : 0}–{Math.min(report.offset + report.participants.length, report.total)} of {report.total}</p>
            <div className="flex gap-2"><button type="button" disabled={offset === 0 || loading} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))} className="rounded-full border border-[#bbbbbb] px-4 py-2 text-[13px] disabled:opacity-40">Previous</button><button type="button" disabled={offset + PAGE_SIZE >= report.total || loading} onClick={() => setOffset(offset + PAGE_SIZE)} className="rounded-full border border-[#bbbbbb] px-4 py-2 text-[13px] disabled:opacity-40">Next</button></div>
          </div>
        </section>
      )}
    </div>
  );
}

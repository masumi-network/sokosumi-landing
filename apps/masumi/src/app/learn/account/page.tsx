import Link from "next/link";
import { requireLearnUser } from "@/lib/learn-auth";
import { getCredentialsForUser, getProgress } from "@/lib/learn-db";
import { units } from "../course-data";
import { DeleteLearnAccountButton } from "../learner-actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Learn account" };

export default async function LearnAccountPage() {
  const user = await requireLearnUser("/learn/account");
  const progress = getProgress(user.id);
  const credentials = getCredentialsForUser(user.id);
  const name = user.displayName || user.email?.split("@")[0] || "learner";
  const nextUnit = units.find((unit) => !progress.passedQuizzes.includes(unit.slug));
  const fundamentals = credentials.find((credential) => credential.credentialType === "fundamentals" && credential.status !== "revoked" && credential.status !== "superseded");
  const builderCredential = credentials.find((credential) => credential.credentialType === "builder" && credential.status !== "revoked" && credential.status !== "superseded");

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/learn/course" className="text-[14px] font-medium tracking-[0.01em] text-[#5b5b5b] transition-colors duration-200 hover:text-[#6400FF]">
        ← My learning
      </Link>

      <section className="mt-6 border border-black/[0.04] bg-white p-7 sm:p-10">
        <p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">Sokosumi-linked account</p>
        <h1 className="mt-3 text-[28px] font-normal tracking-[-0.4px] leading-[1.2] md:text-[40px]">Account and privacy</h1>
        <p className="mt-3 text-[16px] leading-[24px] text-[#5b5b5b]">
          Signed in as <strong className="font-medium text-black">{name}</strong>. Progress and credentials stay attached to this Sokosumi identity.
        </p>

        <dl className="mt-8 grid gap-5 text-[14px] sm:grid-cols-2">
          <div className="bg-black/[0.03] p-4">
            <dt className="text-[#919191]">Display name</dt>
            <dd className="mt-1 font-medium">{user.displayName || "Not provided"}</dd>
          </div>
          <div className="bg-black/[0.03] p-4">
            <dt className="text-[#919191]">Email</dt>
            <dd className="mt-1 break-all font-medium">{user.email || "Not provided by Sokosumi"}</dd>
          </div>
          <div className="bg-black/[0.03] p-4">
            <dt className="text-[#919191]">Identity source</dt>
            <dd className="mt-1 font-medium">Sokosumi OAuth</dd>
          </div>
          <div className="bg-black/[0.03] p-4">
            <dt className="text-[#919191]">Subject</dt>
            <dd className="mt-1 break-all font-mono text-xs text-[#919191]">{user.providerSubject}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-5 border border-black/[0.04] bg-white p-7 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">Learning snapshot</p>
            <h2 className="mt-2 text-[17px] font-medium leading-snug text-black">What this account holds</h2>
          </div>
          <Link href="/learn/course" className="rounded-full bg-[#6400FF] px-6 py-2.5 text-center text-[14px] font-medium tracking-[0.01em] text-white transition-colors duration-200 hover:bg-[#5200d0]">
            Open My learning →
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Units passed" value={`${progress.passedQuizzes.length} / ${units.length}`} />
          <Stat label="Lessons done" value={`${progress.completedLessons.length} / ${units.length}`} />
          <Stat label="Credentials" value={String(credentials.filter((c) => c.status !== "revoked" && c.status !== "superseded").length)} />
        </div>

        <div className="mt-6 space-y-3 text-[14px]">
          <div className="border border-black/[0.04] bg-white p-4">
            <p className="inline-block rounded-full bg-[#ff6ed2] px-3 py-1 text-[13px] uppercase tracking-[0.02em] text-[#460a23]">Fundamentals</p>
            <p className="mt-2 font-medium">
              {fundamentals
                ? `Credential issued · ${fundamentals.score}% · ${fundamentals.status.replaceAll("_", " ")}`
                : progress.assessmentScore != null
                  ? `Assessment best score ${progress.assessmentScore}% — finish issuance on the dashboard if needed`
                  : nextUnit
                    ? `Next up: ${nextUnit.title}`
                    : "All unit quizzes passed — take the final assessment"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {fundamentals ? (
                <Link href={`/learn/verify/${fundamentals.id}`} className="rounded-full border border-[#bbbbbb] bg-white px-4 py-2 text-[14px] font-medium tracking-[0.01em] transition-colors duration-200 hover:bg-[#f5f5f5]">
                  View certificate
                </Link>
              ) : (
                <Link href={nextUnit ? `/learn/course/${nextUnit.slug}` : "/learn/course/assessment"} className="rounded-full border border-[#bbbbbb] bg-white px-4 py-2 text-[14px] font-medium tracking-[0.01em] transition-colors duration-200 hover:bg-[#f5f5f5]">
                  Continue course
                </Link>
              )}
              <Link href="/learn/course" className="rounded-full border border-[#bbbbbb] bg-white px-4 py-2 text-[14px] font-medium tracking-[0.01em] transition-colors duration-200 hover:bg-[#f5f5f5]">
                Course overview
              </Link>
            </div>
          </div>

          {builderCredential && (
            <div className="border border-black/[0.04] bg-white p-4">
              <p className="inline-block rounded-full bg-[#ff6ed2] px-3 py-1 text-[13px] uppercase tracking-[0.02em] text-[#460a23]">Additional credential</p>
              <p className="mt-2 font-medium">{`Masumi Builder · ${builderCredential.score}% · ${builderCredential.status.replaceAll("_", " ")}`}</p>
              <Link href={`/learn/verify/${builderCredential.id}`} className="mt-3 inline-block rounded-full border border-[#bbbbbb] bg-white px-4 py-2 text-[14px] font-medium tracking-[0.01em] transition-colors duration-200 hover:bg-[#f5f5f5]">
                View certificate
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="mt-5 border border-black/[0.04] bg-white p-7 sm:p-10">
        <h2 className="text-[17px] font-medium leading-snug text-black">Your data</h2>
        <p className="mt-2 text-[16px] leading-[24px] text-[#5b5b5b]">
          Export your profile, course progress, attempt history, and credential records. OAuth tokens, wallet secrets, and raw answers are never included because they are not stored.
        </p>
        <a href="/api/learn/account" className="mt-4 inline-block rounded-full border border-[#bbbbbb] bg-white px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] transition-colors duration-200 hover:bg-[#f5f5f5]">
          Export my Learn data
        </a>
      </section>

      <section className="mt-5 border border-black/[0.04] bg-white p-7 sm:p-10">
        <h2 className="text-[17px] font-medium leading-snug text-black">Disconnect and recovery</h2>
        <p className="mt-2 text-[16px] leading-[24px] text-[#5b5b5b]">
          Logging out ends this browser session and asks Sokosumi to end the provider session before returning to Learn. Revoking the OAuth grant is a separate provider-side action. If you lose account access, support must verify recovery through Sokosumi; Learn never uses email alone to reassign progress or credentials.
        </p>
        <form action="/api/learn/auth/logout" method="post">
          <button type="submit" className="mt-4 rounded-full border border-[#bbbbbb] bg-white px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] transition-colors duration-200 hover:bg-[#f5f5f5]">
            Log out of Learn
          </button>
        </form>
        <p className="mt-3 text-[13px] tracking-[0.02em] text-[#5b5b5b]">
          This ends your Masumi Learn session on this device. Revoking access in Sokosumi is a separate provider-side action if you want to disconnect the OAuth grant entirely.
        </p>
      </section>

      <section className="mt-5 border border-black/[0.04] bg-white p-7 sm:p-10">
        <h2 className="text-[17px] font-medium leading-snug text-[#fa140a]">Delete Learn account</h2>
        <p className="mt-2 text-[16px] leading-[24px] text-[#5b5b5b]">
          This removes your profile and course activity and signs you out. Issued credentials are retained only as anonymous revoked records so public verification and permanent on-chain records are not misleading.
        </p>
        <DeleteLearnAccountButton />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/[0.03] p-4">
      <p className="text-[13px] tracking-[0.02em] text-[#919191]">{label}</p>
      <p className="mt-1 text-2xl font-medium tracking-tight">{value}</p>
    </div>
  );
}

import Link from "next/link";
import { requireLearnUser } from "@/lib/learn-auth";
import { getBuilderProgress, getCredentialsForUser, getProgress } from "@/lib/learn-db";
import { units } from "../course-data";
import { DeleteLearnAccountButton } from "../learner-actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Learn account" };

export default async function LearnAccountPage() {
  const user = await requireLearnUser("/learn/account");
  const progress = getProgress(user.id);
  const credentials = getCredentialsForUser(user.id);
  const builder = getBuilderProgress(user.id);
  const name = user.displayName || user.email?.split("@")[0] || "learner";
  const nextUnit = units.find((unit) => !progress.passedQuizzes.includes(unit.slug));
  const fundamentals = credentials.find((credential) => credential.credentialType === "fundamentals" && credential.status !== "revoked" && credential.status !== "superseded");
  const builderCredential = credentials.find((credential) => credential.credentialType === "builder" && credential.status !== "revoked" && credential.status !== "superseded");

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/learn/dashboard" className="text-sm text-black/55 hover:text-black">
        ← My learning
      </Link>

      <section className="mt-6 rounded-3xl bg-white p-7 shadow-sm sm:p-10">
        <p className="text-xs uppercase tracking-[0.18em] text-[#A50045]">Sokosumi-linked account</p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight">Account and privacy</h1>
        <p className="mt-3 text-sm leading-6 text-black/55">
          Signed in as <strong className="font-medium text-black">{name}</strong>. Progress and credentials stay attached to this Sokosumi identity.
        </p>

        <dl className="mt-8 grid gap-5 text-sm sm:grid-cols-2">
          <div className="rounded-2xl bg-black/[0.03] p-4">
            <dt className="text-black/45">Display name</dt>
            <dd className="mt-1 font-medium">{user.displayName || "Not provided"}</dd>
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-4">
            <dt className="text-black/45">Email</dt>
            <dd className="mt-1 break-all font-medium">{user.email || "Not provided by Sokosumi"}</dd>
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-4">
            <dt className="text-black/45">Identity source</dt>
            <dd className="mt-1 font-medium">Sokosumi OAuth</dd>
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-4">
            <dt className="text-black/45">Subject</dt>
            <dd className="mt-1 break-all font-mono text-xs text-black/70">{user.providerSubject}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-5 rounded-3xl bg-white p-7 shadow-sm sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#A50045]">Learning snapshot</p>
            <h2 className="mt-2 text-2xl font-medium">What this account holds</h2>
          </div>
          <Link href="/learn/dashboard" className="rounded-full bg-black px-5 py-2.5 text-center text-sm text-white">
            Open My learning →
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Units passed" value={`${progress.passedQuizzes.length} / ${units.length}`} />
          <Stat label="Lessons done" value={`${progress.completedLessons.length} / ${units.length}`} />
          <Stat label="Credentials" value={String(credentials.filter((c) => c.status !== "revoked" && c.status !== "superseded").length)} />
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <div className="rounded-2xl border border-black/10 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-black/40">Fundamentals</p>
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
                <Link href={`/learn/verify/${fundamentals.id}`} className="rounded-full border border-black/15 px-4 py-2 text-xs">
                  View certificate
                </Link>
              ) : (
                <Link href={nextUnit ? `/learn/${nextUnit.slug}` : "/learn/assessment"} className="rounded-full border border-black/15 px-4 py-2 text-xs">
                  Continue course
                </Link>
              )}
              <Link href="/learn/course" className="rounded-full border border-black/15 px-4 py-2 text-xs">
                Course overview
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-black/40">Builder path</p>
            <p className="mt-2 font-medium">
              {builderCredential
                ? `Builder credential · ${builderCredential.score}% · ${builderCredential.status.replaceAll("_", " ")}`
                : builder.submission?.status === "verified"
                  ? "Proof verified — finish the operating assessment"
                  : builder.completedSteps.length
                    ? `${builder.completedSteps.length} of 6 project steps complete`
                    : fundamentals
                      ? "Unlocked after Fundamentals — start the Preprod project"
                      : "Unlocks after the Fundamentals credential"}
            </p>
            <Link href="/learn/builder" className="mt-3 inline-block rounded-full border border-black/15 px-4 py-2 text-xs">
              Open Builder path
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-3xl bg-white p-7 shadow-sm sm:p-10">
        <h2 className="text-xl font-medium">Your data</h2>
        <p className="mt-2 text-sm leading-6 text-black/55">
          Export your profile, course progress, attempt history, Builder proof/status, and credential records. OAuth tokens, wallet secrets, and raw answers are never included because they are not stored.
        </p>
        <a href="/api/learn/account" className="mt-4 inline-block rounded-full border border-black/15 px-5 py-3 text-sm hover:border-black/35">
          Export my Learn data
        </a>
      </section>

      <section className="mt-5 rounded-3xl bg-white p-7 shadow-sm sm:p-10">
        <h2 className="text-xl font-medium">Disconnect and recovery</h2>
        <p className="mt-2 text-sm leading-6 text-black/55">
          Logging out ends this browser session and asks Sokosumi to end the provider session before returning to Learn. Revoking the OAuth grant is a separate provider-side action. If you lose account access, support must verify recovery through Sokosumi; Learn never uses email alone to reassign progress or credentials.
        </p>
        <form action="/api/learn/auth/logout" method="post">
          <button className="mt-4 rounded-full border border-black/15 px-5 py-3 text-sm hover:border-black/35">
            Log out of Learn and Sokosumi
          </button>
        </form>
      </section>

      <section className="mt-5 rounded-3xl border border-red-200 bg-white p-7 shadow-sm sm:p-10">
        <h2 className="text-xl font-medium text-red-800">Delete Learn account</h2>
        <p className="mt-2 text-sm leading-6 text-black/55">
          This removes profile, course activity, and Builder proof and signs you out. Issued credentials are retained only as anonymous revoked records so public verification and permanent on-chain records are not misleading.
        </p>
        <DeleteLearnAccountButton />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/[0.03] p-4">
      <p className="text-xs text-black/45">{label}</p>
      <p className="mt-1 text-2xl font-medium tracking-tight">{value}</p>
    </div>
  );
}

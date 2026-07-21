import Link from "next/link";
import { getCurrentLearnUser } from "@/lib/learn-auth";
import { getProgress } from "@/lib/learn-db";
import { units } from "./course-data";
import { TrackedLink } from "./learner-actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Learn", description: "Learn the mental models behind the Masumi agent economy, then move from concepts to your first integration." };

export default async function LearnPage() {
  const user = await getCurrentLearnUser();
  const progress = user ? getProgress(user.id) : null;
  const name = user ? user.displayName || user.email?.split("@")[0] || "learner" : null;
  const next = progress ? units.find((unit) => !progress.passedQuizzes.includes(unit.slug)) : null;

  return <>
    {user && (
      <section className="mb-8 rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#A50045]">Signed in</p>
          <p className="mt-1 text-lg font-medium">Welcome back, {name}</p>
          <p className="mt-1 text-sm text-black/55">
            {progress && progress.passedQuizzes.length
              ? `${progress.passedQuizzes.length} of ${units.length} unit quizzes passed`
              : "Your progress and credentials are linked to this Sokosumi account."}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:justify-end">
          <Link href="/learn/dashboard" className="rounded-full bg-black px-5 py-2.5 text-sm text-white">My learning</Link>
          <Link href="/learn/account" className="rounded-full border border-black/15 px-5 py-2.5 text-sm">Account</Link>
          {next ? (
            <Link href={`/learn/${next.slug}`} className="rounded-full border border-black/15 px-5 py-2.5 text-sm">Continue: {next.title}</Link>
          ) : (
            <Link href="/learn/assessment" className="rounded-full border border-black/15 px-5 py-2.5 text-sm">Open assessment</Link>
          )}
        </div>
      </section>
    )}
    <section className="grid min-h-[62vh] items-end gap-10 pb-20 lg:grid-cols-[1.2fr_0.8fr]"><div><p className="text-xs font-medium uppercase tracking-[0.2em] text-[#A50045]">Masumi Learn</p><h1 className="mt-5 max-w-4xl text-6xl font-medium tracking-[-0.055em] sm:text-8xl">Understand the agent economy. Then build in it.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-black/60">A guided, no-prerequisite path through agentic services, Masumi, Cardano, identity, and payments. Learn the durable mental models before reaching for API reference.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/learn/start" className="rounded-full bg-[#6400FF] px-6 py-3.5 text-sm font-medium text-white">Choose my path →</Link><Link href="/learn/concepts" className="rounded-full border border-black/20 px-6 py-3.5 text-sm font-medium">Browse the public library</Link><TrackedLink href="https://www.masumi.network/dev/masumi/documentation" event="learn_docs_handoff" params={{ surface: "landing", destination: "documentation" }} className="rounded-full border border-black/20 px-6 py-3.5 text-sm font-medium">I’m ready for Docs</TrackedLink></div></div><div className="rounded-[2rem] bg-[#FA008C] p-8 text-white"><p className="text-sm text-white/70">Fundamentals path</p><p className="mt-3 text-5xl font-medium">~65 min</p><div className="mt-12 grid grid-cols-2 gap-5 border-t border-white/25 pt-6 text-sm"><div><strong className="block text-2xl">4</strong><span className="text-white/70">units</span></div><div><strong className="block text-2xl">16</strong><span className="text-white/70">practice questions</span></div><div><strong className="block text-2xl">75%</strong><span className="text-white/70">passing score</span></div><div><strong className="block text-2xl">2</strong><span className="text-white/70">credential levels</span></div></div></div></section>
    <section className="border-t border-black/10 py-16"><p className="text-xs uppercase tracking-[0.18em] text-black/40">Choose your path</p><div className="mt-6 grid gap-4 md:grid-cols-3"><Path title="I’m learning" body="Take the ordered Fundamentals course with short explanations and immediate quiz feedback." href="/learn/course" cta="Begin Unit 1" /><Path title="I’m building" body="Already know the concepts? Go directly to installation, integrations, APIs, and Preprod." href="https://www.masumi.network/dev/masumi/documentation/get-started/install-masumi-node" cta="Open quickstarts" /><Path title="I’m exploring" body="Understand how Masumi services become discoverable and usable through Sokosumi." href="https://sokosumi.com" cta="Visit Sokosumi" /></div></section>
    <section className="rounded-[2rem] bg-white p-8 sm:p-12"><div className="grid gap-8 md:grid-cols-2"><div><p className="text-xs uppercase tracking-[0.18em] text-[#A50045]">What you earn</p><h2 className="mt-3 text-4xl font-medium tracking-tight">Two proofs of progress.</h2></div><div className="text-sm leading-7 text-black/60"><p>Pass the four unit quizzes and final assessment to earn a server-issued Masumi Fundamentals credential linked to your Sokosumi account.</p><p className="mt-3">Then complete the Preprod project and operating assessment for the Builder certificate. Your dashboard keeps progress across devices and prepares eligible credentials for optional Cardano minting without personal data on-chain.</p></div></div></section>
  </>;
}

function Path({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) { const external = href.startsWith("http"); const event = href.includes("sokosumi") ? "learn_sokosumi_handoff" : "learn_quickstart_start"; const className = "group rounded-3xl border border-black/10 p-6 hover:border-[#FA008C]/40"; const content = <><h2 className="text-2xl font-medium">{title}</h2><p className="mt-3 min-h-20 text-sm leading-6 text-black/60">{body}</p><span className="mt-5 inline-block text-sm font-medium text-[#A50045]">{cta} <span className="inline-block transition group-hover:translate-x-1">→</span></span></>; return external ? <TrackedLink href={href} event={event} params={{ surface: "landing" }} className={className}>{content}</TrackedLink> : <Link href={href} className={className}>{content}</Link>; }

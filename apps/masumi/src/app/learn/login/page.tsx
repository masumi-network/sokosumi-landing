import Link from "next/link";
import { redirect } from "next/navigation";
import { devAuthEnabled, getCurrentLearnUser, oauthConfigured, safeReturnTo } from "@/lib/learn-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Sign in to Learn" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string; error?: string; reason?: string }> }) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);
  const reason = params.reason && /^[a-z][a-z0-9_]{0,63}$/.test(params.reason) ? params.reason : null;
  if (await getCurrentLearnUser()) redirect(returnTo);
  const loginHref = `/api/learn/auth/start?returnTo=${encodeURIComponent(returnTo)}`;
  const devHref = `/api/learn/auth/dev?returnTo=${encodeURIComponent(returnTo)}`;
  return <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-sm sm:p-12">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6400FF] text-2xl text-white">S</div>
    <p className="mt-7 text-xs font-medium uppercase tracking-[0.18em] text-[#A50045]">Masumi Learn account</p>
    <h1 className="mt-3 text-4xl font-medium tracking-tight">Continue with Sokosumi</h1>
    <p className="mt-4 leading-7 text-black/60">Your Sokosumi account keeps course progress, assessment results, and credentials connected across devices.</p>
    {params.error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">{params.error}</p>}
    {reason && <p className="mt-2 text-xs text-black/45">OAuth reference: {reason}</p>}
    {oauthConfigured() ? <a href={loginHref} className="mt-7 block rounded-full bg-[#6400FF] px-6 py-3.5 text-sm font-medium text-white">Continue with Sokosumi →</a> : <div className="mt-7 rounded-xl bg-amber-50 p-4 text-left text-sm leading-6 text-amber-900"><strong>OAuth setup pending.</strong> The application is ready for the Sokosumi client ID, secret, and endpoint configuration.</div>}
    {devAuthEnabled() && <a href={devHref} className="mt-3 block rounded-full border border-black/15 px-6 py-3 text-sm">Use development learner</a>}
    <p className="mt-6 text-xs leading-5 text-black/45">Masumi never writes your OAuth token, email, or private course activity on-chain.</p>
    <Link href="/learn" className="mt-6 inline-block text-sm text-black/60 hover:text-black">← Back to Learn</Link>
  </div>;
}

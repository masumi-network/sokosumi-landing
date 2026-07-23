import Image from "next/image";
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
  return <div className="mx-auto max-w-xl border border-black/[0.04] bg-white p-8 text-center sm:p-12">
    <Image src="/images/sokosumi-logo.png" alt="Sokosumi" width={64} height={64} className="mx-auto h-16 w-16" priority />
    <p className="mt-7 text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">Masumi Learn account</p>
    <h1 className="mt-3 text-[28px] font-normal leading-[1.2] tracking-[-0.4px] md:text-[40px]">Continue with Sokosumi</h1>
    <p className="mt-4 text-[16px] leading-[24px] text-[#5b5b5b]">Your Sokosumi account keeps course progress, assessment results, and credentials connected across devices.</p>
    {params.error && <p role="alert" className="mt-5 bg-[#fa140a]/10 p-3 text-sm text-[#fa140a]">{params.error}</p>}
    {reason && <p className="mt-2 text-xs text-[#5b5b5b]">OAuth reference: {reason}</p>}
    {oauthConfigured() ? <a href={loginHref} className="mt-7 block rounded-full bg-[#6400FF] px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-white transition-colors duration-200 hover:bg-[#5200d0]">Continue with Sokosumi →</a> : <div className="mt-7 bg-[#ff6400]/10 p-4 text-left text-sm leading-6 text-[#ff6400]"><strong>OAuth setup pending.</strong> The application is ready for the Sokosumi client ID, secret, and endpoint configuration.</div>}
    {devAuthEnabled() && <a href={devHref} className="mt-3 block rounded-full border border-[#bbbbbb] bg-white px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-black transition-colors duration-200 hover:bg-[#f5f5f5]">Use development learner</a>}
    <p className="mt-6 text-xs leading-5 text-[#5b5b5b]">Masumi never writes your OAuth token, email, or private course activity on-chain.</p>
    <Link href="/learn" className="mt-6 inline-block text-[14px] font-medium text-[#5b5b5b] transition-colors duration-200 hover:text-[#6400FF]">← Back to Learn</Link>
  </div>;
}

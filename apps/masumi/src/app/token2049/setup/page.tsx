import type { Metadata } from "next";
import Link from "next/link";
import GuideNav from "../guide-nav";
import { Header, Footer } from "@summation/shared";
import SetupHelper from "../setup-helper";
import { SIGNUP_URL } from "../flow";

export const metadata: Metadata = {
  title: "TOKEN2049 participant setup",
  description: "Create your account and personal Coworker, and prepare your agent instructions.",
  robots: { index: false, follow: true },
};

export default function ParticipantSetup() {
  return <><Header product="masumi" /><main className="mx-auto max-w-5xl px-6 pb-28 pt-36 sm:px-12 sm:pb-36 sm:pt-48">
    <GuideNav current="/token2049/setup" />
    <h1 className="mt-8 text-balance text-4xl font-medium tracking-tight sm:text-5xl">Get commands for your Coworker.</h1>
    <p className="mt-5 max-w-2xl text-lg leading-8 text-[#454545]">Enter your IDs once. Get personal setup commands, a brief for your coding agent, and a separate command block for event approval.</p>
    <details className="my-10 rounded-xl border border-black/15 p-5"><summary className="cursor-pointer font-medium text-[#460A23]">Need your account or IDs? Start here</summary>
    <ol className="mt-6 grid gap-6 min-[900px]:grid-cols-3">
      <li className="rounded-xl border border-black/10 bg-white p-6"><span className="text-sm text-[#460A23]">01</span><h2 className="my-3 text-xl font-medium">Create your account</h2><p className="text-sm leading-7 text-[#454545]">Sign up on Sokosumi Preprod. Use the same account for CLI sign-in.</p><a href={SIGNUP_URL} className="mt-4 inline-block font-medium text-[#460A23] underline underline-offset-4">Create an account</a></li>
      <li className="rounded-xl border border-black/10 bg-white p-6"><span className="text-sm text-[#460A23]">02</span><h2 className="my-3 text-xl font-medium">Get your Vendor ID</h2><p className="text-sm leading-7 text-[#454545]">List your Vendors in the CLI. Choose one where your role is <code>admin</code>, or create your own.</p><Link href="/token2049#step-2" className="mt-4 inline-block font-medium text-[#460A23] underline underline-offset-4">Read the Vendor commands</Link></li>
      <li className="rounded-xl border border-black/10 bg-white p-6"><span className="text-sm text-[#460A23]">03</span><h2 className="my-3 text-xl font-medium">Create your Coworker</h2><p className="text-sm leading-7 text-[#454545]">Run coworkers register with --personal under your Vendor. Keep the returned Coworker ID. Join the event when your agent is ready for approval.</p><a href="#instructions" className="mt-4 inline-block font-medium text-[#460A23] underline underline-offset-4">Enter your IDs</a></li>
    </ol>
    </details>
    <div id="instructions" className="scroll-mt-28"><SetupHelper /></div>
  </main><Footer product="masumi" /></>;
}

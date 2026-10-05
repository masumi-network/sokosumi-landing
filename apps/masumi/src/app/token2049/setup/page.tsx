import type { Metadata } from "next";
import Link from "next/link";
import GuideNav from "../guide-nav";
import { Header, Footer } from "@summation/shared";
import SetupHelper from "../setup-helper";
import { EVENT } from "../flow";

export const metadata: Metadata = {
  title: "TOKEN2049 participant setup",
  description: "Join the event Workspace, get your Coworker from the organizer, and prepare your agent instructions.",
  robots: { index: false, follow: true },
};

export default function ParticipantSetup() {
  return <><Header product="masumi" /><main className="mx-auto max-w-5xl px-6 pb-28 pt-36 sm:px-12 sm:pb-36 sm:pt-48">
    <GuideNav current="/token2049/setup" />
    <h1 className="mt-8 text-balance text-4xl font-medium tracking-tight sm:text-5xl">Get commands for your Coworker.</h1>
    <p className="mt-5 max-w-2xl text-lg leading-8 text-[#454545]">Enter your Coworker and Vendor IDs to get commands you can copy into your terminal. If you need either ID, follow these steps first.</p>
    <ol className="my-10 grid gap-5 md:grid-cols-3">
      <li className="rounded-xl border border-black/10 bg-white p-6"><span className="text-sm text-[#460A23]">01</span><h2 className="my-3 text-xl font-medium">Join the Workspace</h2><p className="text-sm leading-7 text-[#454545]">Join with the Sokosumi account you will use for CLI sign-in.</p><a href={EVENT.joinUrl} className="mt-4 inline-block font-medium text-[#460A23] underline underline-offset-4">Open the invite link</a></li>
      <li className="rounded-xl border border-black/10 bg-white p-6"><span className="text-sm text-[#460A23]">02</span><h2 className="my-3 text-xl font-medium">Get your Vendor ID</h2><p className="text-sm leading-7 text-[#454545]">List your Vendors in the CLI. Choose one where your role is <code>admin</code>, or create your own.</p><Link href="/token2049#step-1" className="mt-4 inline-block font-medium text-[#460A23] underline underline-offset-4">Read the Vendor commands</Link></li>
      <li className="rounded-xl border border-black/10 bg-white p-6"><span className="text-sm text-[#460A23]">03</span><h2 className="my-3 text-xl font-medium">Get your Coworker ID</h2><p className="text-sm leading-7 text-[#454545]">Send the organizer your Vendor ID and Coworker name. They will create the Coworker and give you its ID.</p><a href="#instructions" className="mt-4 inline-block font-medium text-[#460A23] underline underline-offset-4">Enter your IDs</a></li>
    </ol>
    <div id="instructions" className="scroll-mt-28"><SetupHelper /></div>
  </main><Footer product="masumi" /></>;
}

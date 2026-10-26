import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@summation/shared";
import GuideNav from "../guide-nav";
import PaymentSculpture from "../payment-sculpture";
import SkipLink from "../../token2049/skip-link";
import ui from "../../token2049/guide-ui.module.css";
import motion from "../../token2049/token-motion.module.css";

const EVENT_URL = "https://hackathon.tum-blockchain.com/";
const SUBMISSION_URL = "https://tum.devfolio.co/";
const linkStyle = ui.link;

export const metadata: Metadata = {
  title: "TUM hackathon demo checklist",
  description: "Prepare a useful agent demo, your run instructions, and evidence from your Sokosumi test.",
  alternates: { canonical: "/tum-hackathon/submission" },
};

export default function TumSubmissionGuide() {
  return <>
    <SkipLink /><Header product="masumi" />
    <main id="guide-main" tabIndex={-1} className="mx-auto max-w-4xl px-6 pb-28 pt-36 sm:px-12 sm:pb-36 sm:pt-48">
      <GuideNav current="/tum-hackathon/submission" />
      <div className={`${motion.hero} ${motion.enter}`}>
        <div>
          <h1 className="mt-8 max-w-[20ch] text-balance text-4xl font-medium leading-tight tracking-tight sm:text-5xl">Prepare your demo.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#454545]">Show what your agent does and the result it produced. Include seller receipt evidence if you completed the optional payment test.</p>
          <p className="mt-7 inline-block rounded-full bg-[#F7E5EE] px-5 py-3 text-sm leading-6 text-[#171717]"><a href={SUBMISSION_URL} className={linkStyle}>Open the TUM event on Devfolio</a>.</p>
        </div>
        <PaymentSculpture compact stage="receipt" />
      </div>

      <section aria-labelledby="checklist" className={`${motion.reveal} mt-16 sm:mt-20`}>
        <h2 id="checklist" className="text-2xl font-medium tracking-tight">Prepare a demo another team can try</h2>
        <p className="mt-5 text-base leading-7 text-[#454545]">Use this checklist to explain your build. Check the official event pages for submission requirements.</p>
        <ul className="mt-7 grid gap-5 text-base leading-7 text-[#454545] min-[850px]:grid-cols-2">
          <li className={`${ui.surface} p-6`}><strong className="font-medium text-black">Code and run instructions.</strong> Share your repository and the exact setup commands. Explain how to configure the agent and start its worker. Keep API keys and wallet secrets out of the repository.</li>
          <li className={`${ui.surface} p-6`}><strong className="font-medium text-black">A useful agent.</strong> Explain who needs the result. Show a small input, the agent working, and its actual answer. Explain the limits and any steps that need a person.</li>
          <li className={`${ui.surface} p-6`}><strong className="font-medium text-black">Completed Task and follow-up.</strong> Save the Sokosumi Task ID, Coworker ID, and completed result. Show a follow-up comment and the agent&apos;s reply. <Link href="/tum-hackathon#step-4" className={linkStyle}>Run your first Task</Link>.</li>
          <li className={`${ui.surface} p-6`}><strong className="font-medium text-black">Optional payment evidence.</strong> If you ran a paid test, keep its completed Task ID, payment transaction hash, and actual seller receipt together. Explain any pending payment steps.</li>
        </ul>
      </section>

      <section aria-labelledby="demo" className={`${motion.reveal} mt-16 sm:mt-20`}>
        <h2 id="demo" className="text-2xl font-medium tracking-tight">Make the result easy to check</h2>
        <dl className="mt-8 grid gap-x-8 gap-y-9 text-base leading-7 min-[850px]:grid-cols-2">
          <div><dt className="font-medium text-black">Use a small example</dt><dd className="mt-2 text-[#454545]">Choose an input another participant can understand. Show the exact output and explain how you checked it.</dd></div>
          <div><dt className="font-medium text-black">Explain your method</dt><dd className="mt-2 text-[#454545]">Show the instructions and tools that help the agent do its job. Use public data, sample data, or data you have permission to share.</dd></div>
          <div><dt className="font-medium text-black">Keep the setup repeatable</dt><dd className="mt-2 text-[#454545]">Document the pinned CLI version and private configuration names. Explain that the agent and worker run as separate processes.</dd></div>
          <div><dt className="font-medium text-black">State what works</dt><dd className="mt-2 text-[#454545]">Separate the working agent test from any payment setup still in progress. Include receipt evidence when you show a completed payment.</dd></div>
        </dl>
      </section>

      <section aria-labelledby="proof" className={`${ui.surface} mt-16 bg-[#F7E5EE] p-6 sm:mt-20 sm:p-8`}>
        <h2 id="proof" className="text-2xl font-medium tracking-tight">Check optional payment evidence</h2>
        <p className="mt-5 text-base leading-7 text-[#454545]">A completed Task alone does not prove that the seller received payment. Match the payment transaction and check the seller&apos;s net token receipt. If receipt is pending, say so.</p>
        <p className="mt-5 text-base leading-7 text-[#454545]"><Link href="/tum-hackathon#step-5" className={linkStyle}>Follow the optional Preprod payment setup</Link> before you present a completed payment test.</p>
      </section>

      <section aria-labelledby="official-rules" className={`${motion.reveal} mt-16 sm:mt-20`}>
        <h2 id="official-rules" className="text-2xl font-medium tracking-tight">Check TUM&apos;s current rules</h2>
        <p className="mt-5 text-base leading-7 text-[#454545]">Use the <a href={EVENT_URL} className={linkStyle}>TUM event website</a> and <a href={SUBMISSION_URL} className={linkStyle}>Devfolio event page</a> for the schedule and submission instructions. Use the <a href={`${EVENT_URL}prizes`} className={linkStyle}>official prize page</a> for track details.</p>
        <p className="mt-4 text-base leading-7 text-[#454545]">Use only Workspace invitations supplied by the TUM organizers.</p>
      </section>
    </main>
    <Footer product="masumi" />
  </>;
}

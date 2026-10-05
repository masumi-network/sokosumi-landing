import SkipLink from "../skip-link";
import type { Metadata } from "next";
import Link from "next/link";
import GuideNav from "../guide-nav";
import { Header, Footer } from "@summation/shared";
import ui from "../guide-ui.module.css";

export const metadata: Metadata = {
  title: "TOKEN2049 submission checklist",
  description: "Prepare your agent demo, repository, and seller payment evidence for the TOKEN2049 hackathon.",
  alternates: { canonical: "/token2049/submission" },
};

const linkStyle = ui.link;

export default function SubmissionGuide() {
  return <><SkipLink /><Header product="masumi" /><main id="guide-main" tabIndex={-1} className="mx-auto max-w-4xl px-6 pb-28 pt-36 sm:px-12 sm:pb-36 sm:pt-48">
    <GuideNav current="/token2049/submission" />
    <h1 className="mt-8 max-w-[20ch] text-balance text-4xl font-medium leading-tight tracking-tight sm:text-5xl">Prepare your submission.</h1>
    <p className="mt-7 max-w-2xl text-lg leading-8 text-[#454545]">Show what your agent does, the result it produced, and proof that the seller received payment.</p>
    <p className="mt-7 inline-block rounded-full bg-[#F7E5EE] px-5 py-3 text-sm leading-6 text-[#460A23]">Submit on BuilderBase by <strong className="font-medium text-black">7 October, 23:59</strong>.</p>

    <section aria-labelledby="checklist" className="mt-16 sm:mt-20">
      <h2 id="checklist" className="text-2xl font-medium tracking-tight">Include these in your submission</h2>
      <ul className="mt-7 grid gap-5 text-base leading-7 text-[#454545] min-[850px]:grid-cols-2">
        <li className={`${ui.surface} p-6`}><strong className="font-medium text-black">Code and run instructions.</strong> Link a public repository, or grant judges access. Explain how to configure and start the worker. Keep keys and wallet secrets out of the repository.</li>
        <li className={`${ui.surface} p-6`}><strong className="font-medium text-black">Agent demo.</strong> Show the input, your agent working, and its actual result. Include your deployed agent URL, Coworker ID, and a sample Task so judges can try it. State its availability date. <Link href="/token2049#step-4" className={linkStyle}>Use the deployment checklist</Link>.</li>
        <li className={`${ui.surface} p-6`}><strong className="font-medium text-black">Completed Task.</strong> Include the Sokosumi Task ID, Coworker ID, completed result, and relevant payment event IDs.</li>
        <li className={`${ui.surface} p-6`}><strong className="font-medium text-black">Seller payment proof.</strong> Include the receipt, confirmed collection transaction hash, seller address, test USDM token unit, and net amount received.</li>
        <li className={`${ui.surface} p-6`}><strong className="font-medium text-black">Presentation slides.</strong> Submit a Google Drive link to a .ppt or .keynote file. Embed your demo recording directly in the slides. Live stage demos and external video links are not accepted.</li>
      </ul>
      <p className="mt-6 text-base leading-7 text-[#454545]">Build your submitted project during the official 36-hour hacking period. Existing libraries, frameworks, and developer tools are allowed. Submit to the main track and any relevant partner track.</p>
      <p className="mt-4 text-base leading-7 text-[#454545]"><a href="https://builderbase.com/event/token2049-origins-hackathon#rules" className={linkStyle}>Read the official submission and stage rules</a>. Your slides are locked at the deadline.</p>
    </section>

    <section aria-labelledby="demo" className="mt-16 sm:mt-20">
      <h2 id="demo" className="text-2xl font-medium tracking-tight">Help judges evaluate your agent</h2>
      <p className="mt-5 text-base leading-7 text-[#454545]">Use your demo to make these qualities visible.</p>
      <dl className="mt-8 grid gap-x-8 gap-y-9 text-base leading-7 min-[850px]:grid-cols-2">
        <div><dt className="font-medium text-black">Quality of results</dt><dd className="mt-2 text-[#454545]">Show that the result answers the Task. Explain how you checked its accuracy and whether it is useful. Include the actual output so judges can inspect it.</dd></div>
        <div><dt className="font-medium text-black">A useful agent</dt><dd className="mt-2 text-[#454545]">Explain who would use your agent and why. Show what the agent decides or does, and which steps still need a person.</dd></div>
        <div><dt className="font-medium text-black">Reliable execution</dt><dd className="mt-2 text-[#454545]">Show a real Task running through completion. Explain how your worker handles an error or an interrupted request without repeating work or charging twice.</dd></div>
        <div><dt className="font-medium text-black">Verified payment</dt><dd className="mt-2 text-[#454545]">Connect the Task to the payment receipt and collection transaction. Show the amount that reached the intended seller wallet.</dd></div>
      </dl>
    </section>



    <section aria-labelledby="proof" className={`${ui.surface} mt-16 bg-[#F7E5EE] p-6 sm:mt-20 sm:p-8`}>
      <h2 id="proof" className="text-2xl font-medium tracking-tight">Check your payment evidence</h2>
      <p className="mt-5 text-base leading-7 text-[#454545]">A completed Task or a <code>PURCHASED</code> claim does not prove that the seller received payment. Verify the collection transaction on Cardano Preprod. If collection is pending, report it as pending.</p>
      <p className="mt-5 text-base leading-7 text-[#454545]"><Link href="/token2049#step-4" className={linkStyle}>Follow the paid Task setup</Link> before recording your final demo.</p>
    </section>
  </main><Footer product="masumi" /></>;
}

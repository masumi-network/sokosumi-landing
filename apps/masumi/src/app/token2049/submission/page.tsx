import type { Metadata } from "next";
import Link from "next/link";
import GuideNav from "../guide-nav";
import { Header, Footer } from "@summation/shared";

export const metadata: Metadata = {
  title: "TOKEN2049 submission checklist",
  description: "Prepare your agent demo, repository, and seller payment evidence for the TOKEN2049 hackathon.",
  alternates: { canonical: "/token2049/submission" },
};

const linkStyle = "font-medium text-[#460A23] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4";

export default function SubmissionGuide() {
  return <><Header product="masumi" /><main className="mx-auto max-w-4xl px-6 pb-28 pt-36 sm:px-12 sm:pb-36 sm:pt-48">
    <GuideNav current="/token2049/submission" />
    <h1 className="mt-8 max-w-[20ch] text-balance text-4xl font-medium leading-tight tracking-tight sm:text-5xl">Prepare your submission.</h1>
    <p className="mt-7 max-w-2xl text-lg leading-8 text-[#454545]">Show what your agent does, the result it produced, and proof that the seller received payment.</p>
    <p className="mt-5 text-base leading-7 text-[#454545]">Submit on BuilderBase by <strong className="font-medium text-black">7 October, 23:59</strong>.</p>

    <section aria-labelledby="checklist" className="mt-16 border-t border-black/10 pt-12 sm:mt-20 sm:pt-16">
      <h2 id="checklist" className="text-2xl font-medium tracking-tight">Include these in your submission</h2>
      <ul className="mt-7 list-disc space-y-5 pl-5 text-base leading-7 text-[#454545]">
        <li><strong className="font-medium text-black">Code and run instructions.</strong> Link your repository. Explain how to configure and start the worker. Keep keys and wallet secrets out of the repository.</li>
        <li><strong className="font-medium text-black">Agent demo.</strong> Show the input, your agent working, and its actual result. Explain the problem the result solves.</li>
        <li><strong className="font-medium text-black">Completed Task.</strong> Include the Sokosumi Task ID, Coworker ID, completed result, and relevant payment event IDs.</li>
        <li><strong className="font-medium text-black">Seller payment proof.</strong> Include the receipt, confirmed collection transaction hash, seller address, test USDM token unit, and net amount received.</li>
      </ul>
    </section>

    <section aria-labelledby="demo" className="mt-16 border-t border-black/10 pt-12 sm:mt-20 sm:pt-16">
      <h2 id="demo" className="text-2xl font-medium tracking-tight">Help judges evaluate your agent</h2>
      <p className="mt-5 text-base leading-7 text-[#454545]">Use your demo to make these qualities visible.</p>
      <dl className="mt-8 space-y-8 text-base leading-7">
        <div><dt className="font-medium text-black">Quality of results</dt><dd className="mt-2 text-[#454545]">Show that the result answers the Task. Explain how you checked its accuracy and whether it is useful. Include the actual output so judges can inspect it.</dd></div>
        <div><dt className="font-medium text-black">A useful agent</dt><dd className="mt-2 text-[#454545]">Explain who would use your agent and why. Show what the agent decides or does, and which steps still need a person.</dd></div>
        <div><dt className="font-medium text-black">Reliable execution</dt><dd className="mt-2 text-[#454545]">Show a real Task running through completion. Explain how your worker handles an error or an interrupted request without repeating work or charging twice.</dd></div>
        <div><dt className="font-medium text-black">Verified payment</dt><dd className="mt-2 text-[#454545]">Connect the Task to the payment receipt and collection transaction. Show the amount that reached the intended seller wallet.</dd></div>
      </dl>
    </section>

    <section aria-labelledby="proof" className="mt-16 border-t border-black/10 pt-12 sm:mt-20 sm:pt-16">
      <h2 id="proof" className="text-2xl font-medium tracking-tight">Check your payment evidence</h2>
      <p className="mt-5 text-base leading-7 text-[#454545]">A completed Task or a <code>PURCHASED</code> claim does not prove that the seller received payment. Verify the collection transaction on Cardano Preprod. If collection is pending, report it as pending.</p>
      <p className="mt-5 text-base leading-7 text-[#454545]"><Link href="/token2049#step-3" className={linkStyle}>Follow the paid Task setup</Link> before recording your final demo.</p>
    </section>
  </main><Footer product="masumi" /></>;
}

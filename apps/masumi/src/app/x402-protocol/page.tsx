import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@summation/shared";

// The neutral, chain-agnostic x402 explainer.
//
// /x402 already exists and is good, but it is titled "x402 on Cardano" and is
// built around the vending-machine demo — so it competes for a phrase almost
// nobody types while the head terms go unclaimed. Ahrefs, US/global:
// x402 2,900/9,300 (KD 55), x402 protocol 1,000/2,600 (KD 55),
// http 402 600/3,500 (KD 12, TP 1,300), what is x402 350/800.
//
// This page takes those. It explains the protocol on its own terms, covers the
// three competing standards honestly, and hands Cardano-specific questions to
// /x402. Keeping them apart is the point: one page cannot be both the neutral
// reference and the product demo without losing the reference query.

const URL_BASE = "https://www.masumi.network";
const PAGE_PATH = "/x402-protocol";
const SPEC_URL = "https://github.com/x402-foundation/x402";

const TITLE = "x402 protocol: how HTTP 402 lets agents pay for what they use";
const DESCRIPTION =
  "What the x402 protocol is, how the HTTP 402 Payment Required status code works, what a payment flow looks like end to end, and how x402 compares with Google's AP2 and Stripe's Agentic Commerce Protocol.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    type: "article",
    title: TITLE,
    description: DESCRIPTION,
    url: `${URL_BASE}${PAGE_PATH}`,
    siteName: "Masumi",
    images: [
      {
        url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt",
        width: 1920,
        height: 1080,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// The request/response cycle, in the order it happens. This is the part every
// "what is x402" search is actually asking for.
const FLOW = [
  {
    step: "1",
    title: "The agent asks for something",
    body: "A normal HTTP request to a normal URL. No key, no account, no prior relationship with the server.",
  },
  {
    step: "2",
    title: "The server answers 402 Payment Required",
    body: "Instead of 401 or 403, the server returns 402 with a body describing what payment it will accept: the amount, the asset, the address to pay, and the scheme it wants.",
  },
  {
    step: "3",
    title: "The agent pays",
    body: "The agent signs a payment matching those terms and retries the request, carrying the proof in an X-PAYMENT header. No redirect, no checkout page, no human.",
  },
  {
    step: "4",
    title: "The server verifies and serves",
    body: "The server checks the payment settles, then returns 200 with the thing that was asked for. One resource, one payment, no subscription.",
  },
];

// The three standards people are actually choosing between in 2026. Written to
// be useful to someone who has not decided yet, which is most of the traffic.
const STANDARDS = [
  {
    name: "x402",
    from: "Coinbase, now the x402 Foundation",
    settles: "On-chain, stablecoins",
    shape: "HTTP-native. The 402 status code carries the terms.",
    fits: "Machine-to-machine calls: an agent paying an API, a model, or another agent, per request.",
  },
  {
    name: "AP2",
    from: "Google",
    settles: "Card rails and account-to-account, extensible",
    shape: "Mandates. A signed record of what the user authorised the agent to buy.",
    fits: "An agent shopping on a person's behalf, where the question is what the human actually approved.",
  },
  {
    name: "ACP",
    from: "OpenAI and Stripe",
    settles: "Existing card rails",
    shape: "A checkout handoff between the assistant and the merchant.",
    fits: "Consumer purchases inside a chat assistant, from merchants who already sell online.",
  },
];

const FAQ = [
  {
    q: "What is the x402 protocol?",
    a: "An open standard for paying for a web resource over HTTP. The server answers a request with 402 Payment Required and a description of what it will accept; the client pays, retries with proof, and gets the resource. It exists so software can pay for things without an account, a card on file, or a human at the keyboard.",
  },
  {
    q: "What is HTTP 402?",
    a: "A status code reserved in the original HTTP specification for payment, and left unused for about thirty years — the spec itself says it is reserved for future use. x402 is the first widely adopted attempt to give it a concrete meaning: the response body describes the payment the server wants, in a form a machine can act on.",
  },
  {
    q: "How is x402 different from an API key?",
    a: "An API key needs a relationship that already exists: someone signed up, agreed to terms, and put a card on file. x402 needs none of that. An agent that has never seen a service before can call it, be told the price, pay, and get an answer in one exchange — which is the only way this works when the caller is software deciding at runtime what it needs.",
  },
  {
    q: "Does x402 need crypto?",
    a: "In practice yes, today. The settlement schemes in the specification are on-chain and stablecoin-denominated, because they need to clear in seconds without a merchant account. The protocol itself is a payment negotiation over HTTP and does not mandate a particular rail, but the working implementations settle on-chain.",
  },
  {
    q: "x402 vs AP2 vs ACP — which should I use?",
    a: "They answer different questions. x402 is for one machine paying another for a resource, priced per call. AP2 is about proving what a human authorised their agent to buy. ACP is a checkout handoff for consumer purchases inside an assistant. If your caller is an agent buying compute, data, or another agent's output, x402 is the one that fits.",
  },
  {
    q: "What does x402 not solve?",
    a: "Payment is not delivery. x402 tells you money moved; it says nothing about whether what you paid for arrived, was correct, or can be disputed. Settlement on most chains is final the moment it clears, so a bad result is a bad result. That gap is why escrow, decision logging and a refund path matter, and it is what Masumi adds on Cardano.",
  },
];

function Section({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-16 md:py-20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">{children}</div>
    </section>
  );
}

export default function X402ProtocolPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${URL_BASE}${PAGE_PATH}#faq`,
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${URL_BASE}${PAGE_PATH}#article`,
    headline: TITLE,
    description: DESCRIPTION,
    url: `${URL_BASE}${PAGE_PATH}`,
    about: { "@type": "Thing", name: "x402 protocol" },
    publisher: { "@type": "Organization", name: "Masumi", url: URL_BASE },
  };

  return (
    <>
      <Header product="masumi" />
      <main className="overflow-x-clip">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([articleJsonLd, faqJsonLd]) }}
        />

        {/* ── Hero ── */}
        <Section>
          <p className="text-xs uppercase tracking-[0.14em] text-black/50 mb-5">The protocol</p>
          <h1 className="text-4xl md:text-6xl font-light tracking-[-0.03em] leading-[1.04] max-w-[20ch]">
            x402: paying for things over HTTP
          </h1>
          <p className="mt-7 text-lg md:text-xl leading-relaxed text-black/70 max-w-[62ch]">
            x402 is an open standard that lets a server answer a request with a price instead of a
            login. The client pays, retries, and gets what it asked for. It turns{" "}
            <strong className="font-medium text-black">HTTP 402 Payment Required</strong> — a status
            code reserved in the original spec and left unused for three decades — into something
            software can actually act on.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 text-sm">
            <Link
              href="/x402"
              className="inline-flex items-center px-5 py-2.5 bg-black text-white hover:bg-black/85 transition-colors"
            >
              See it run on Cardano
            </Link>
            <a
              href={SPEC_URL}
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 border border-black/15 hover:border-black/40 transition-colors"
            >
              Read the specification
            </a>
          </div>
        </Section>

        {/* ── The flow ── */}
        <Section id="how-it-works">
          <h2 className="text-3xl md:text-4xl font-light tracking-[-0.02em] mb-4">
            How an x402 payment works
          </h2>
          <p className="text-black/60 max-w-[62ch] mb-12">
            Four steps, one round trip more than an ordinary request. Nothing here needs a browser,
            a session, or a person.
          </p>
          <ol className="grid gap-px bg-black/[0.08] border border-black/[0.08] md:grid-cols-2">
            {FLOW.map((f) => (
              <li key={f.step} className="bg-white p-7 md:p-9">
                <span className="block text-xs font-mono text-black/40 mb-3">{f.step}</span>
                <h3 className="text-lg font-medium mb-2">{f.title}</h3>
                <p className="text-black/65 leading-relaxed">{f.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* ── The three standards ── */}
        <Section id="standards">
          <h2 className="text-3xl md:text-4xl font-light tracking-[-0.02em] mb-4">
            x402, AP2 and ACP
          </h2>
          <p className="text-black/60 max-w-[62ch] mb-12">
            Three standards arrived within a year of each other and they are not competing for the
            same job. Which one fits depends on who is paying and what they are buying.
          </p>
          <div className="overflow-x-auto border border-black/[0.08]">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-black/[0.02]">
                  <th scope="col" className="text-left font-medium p-4 border-b border-black/[0.08]">
                    Standard
                  </th>
                  <th scope="col" className="text-left font-medium p-4 border-b border-black/[0.08]">
                    From
                  </th>
                  <th scope="col" className="text-left font-medium p-4 border-b border-black/[0.08]">
                    Settles on
                  </th>
                  <th scope="col" className="text-left font-medium p-4 border-b border-black/[0.08]">
                    Shape
                  </th>
                  <th scope="col" className="text-left font-medium p-4 border-b border-black/[0.08]">
                    Fits
                  </th>
                </tr>
              </thead>
              <tbody>
                {STANDARDS.map((s) => (
                  <tr key={s.name} className="align-top">
                    <th scope="row" className="text-left font-medium p-4 border-b border-black/[0.06] whitespace-nowrap">
                      {s.name}
                    </th>
                    <td className="p-4 border-b border-black/[0.06] text-black/65">{s.from}</td>
                    <td className="p-4 border-b border-black/[0.06] text-black/65">{s.settles}</td>
                    <td className="p-4 border-b border-black/[0.06] text-black/65">{s.shape}</td>
                    <td className="p-4 border-b border-black/[0.06] text-black/65">{s.fits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── What it does not solve ── */}
        <Section id="limits">
          <h2 className="text-3xl md:text-4xl font-light tracking-[-0.02em] mb-4">
            Where x402 stops
          </h2>
          <div className="grid gap-8 md:grid-cols-2 max-w-[92ch]">
            <p className="text-black/70 leading-relaxed">
              x402 moves money. It does not tell you whether the thing you paid for arrived, whether
              it was any good, or what to do if it was not. On most settlement schemes the payment is
              final the second it clears — which is fine for a cheap API call and a real problem when
              an agent is buying work whose quality it cannot judge up front.
            </p>
            <p className="text-black/70 leading-relaxed">
              That gap is the whole reason escrow, decision logging and a dispute window exist. On
              Cardano, Masumi holds the payment until delivery is confirmed and records the decision
              on-chain, so a failed job returns the money instead of losing it.{" "}
              <Link href="/x402" className="underline underline-offset-4 hover:text-black">
                See how that works, with a live payment
              </Link>
              .
            </p>
          </div>
        </Section>

        {/* ── FAQ ── */}
        <Section id="faq">
          <h2 className="text-3xl md:text-4xl font-light tracking-[-0.02em] mb-10">Questions</h2>
          <div className="border-t border-black/[0.08] max-w-[92ch]">
            {FAQ.map((f) => (
              <details key={f.q} className="group border-b border-black/[0.08]">
                <summary className="flex items-start justify-between gap-6 cursor-pointer py-5 list-none">
                  <span className="font-medium">{f.q}</span>
                  <span className="text-black/30 group-open:rotate-45 transition-transform shrink-0">
                    +
                  </span>
                </summary>
                <p className="pb-6 text-black/65 leading-relaxed max-w-[70ch]">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        {/* ── Related ── */}
        <Section>
          <h2 className="text-xl font-medium mb-6">Keep reading</h2>
          <div className="grid gap-px bg-black/[0.08] border border-black/[0.08] md:grid-cols-3">
            {[
              { href: "/x402", title: "x402 on Cardano", note: "The same protocol, running, with escrow and a real payment." },
              { href: "/glossary/x402", title: "x402 in the glossary", note: "The short definition, with the neighbouring terms." },
              { href: "/glossary", title: "Agentic payments glossary", note: "AP2, A2A, escrow, DIDs and the rest of the vocabulary." },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="bg-white p-7 hover:bg-black/[0.015] transition-colors">
                <strong className="block font-medium mb-1.5">{l.title}</strong>
                <span className="text-black/60 text-sm leading-relaxed">{l.note}</span>
              </Link>
            ))}
          </div>
        </Section>
      </main>
      <Footer product="masumi" />
    </>
  );
}

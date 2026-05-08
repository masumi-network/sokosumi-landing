import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@summation/shared";
import Creator from "./Creator";

const URL_BASE = "https://www.masumi.network";
const PAGE_PATH = "/tools/design-md";

export const metadata: Metadata = {
  title:
    "DESIGN.md Generator — Free Tool to Create AI-Ready Design Systems from Any URL",
  description:
    "Paste any website URL and instantly generate a DESIGN.md file: brand colors, typography, components, and tokens that AI coding agents (Claude Code, Cursor, Copilot) can read. Built on the Google Labs DESIGN.md spec. Free, no signup.",
  keywords: [
    "DESIGN.md",
    "design system",
    "design tokens",
    "AI agents",
    "Claude Code",
    "Cursor",
    "Tailwind config",
    "brand guide",
    "design system generator",
    "design tokens from URL",
  ],
  alternates: {
    canonical: `${URL_BASE}${PAGE_PATH}`,
  },
  openGraph: {
    type: "website",
    title:
      "DESIGN.md Generator — Free Tool to Create AI-Ready Design Systems",
    description:
      "Paste any URL and generate a DESIGN.md file your AI agents can read. Brand colors, typography, components, and tokens — extracted automatically.",
    url: `${URL_BASE}${PAGE_PATH}`,
    siteName: "Masumi",
  },
  twitter: {
    card: "summary_large_image",
    title: "DESIGN.md Generator — Create AI-Ready Design Systems",
    description:
      "Paste any URL and generate a DESIGN.md file your AI agents can read.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const JSON_LD_APP = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DESIGN.md Generator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  url: `${URL_BASE}${PAGE_PATH}`,
  description:
    "Free tool to generate a DESIGN.md file (brand colors, typography, components) from any website URL. Compatible with Claude Code, Cursor, Copilot, and other AI coding agents.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  publisher: {
    "@type": "Organization",
    name: "Masumi",
    url: URL_BASE,
  },
};

const JSON_LD_FAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a DESIGN.md file?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DESIGN.md is an open spec from Google Labs that captures a brand's visual identity in a single, machine-readable Markdown file. It combines YAML design tokens (colors, typography, spacing, components) with human-readable rationale, so AI coding agents like Claude Code, Cursor, and Copilot can produce on-brand UI consistently.",
      },
    },
    {
      "@type": "Question",
      name: "How does the generator work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Paste a website URL. The tool fetches the page, extracts a structured signal (CSS variables, Tailwind classes, Google Fonts, hero elements, logo candidates), then sends that signal to Claude Haiku 4.5 via OpenRouter to produce a brand-distinctive DESIGN.md following the canonical 8-section spec.",
      },
    },
    {
      "@type": "Question",
      name: "Is it free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. No signup, no credits. Built and hosted by Masumi.",
      },
    },
    {
      "@type": "Question",
      name: "Which AI coding agents can read DESIGN.md?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Claude Code, Cursor, GitHub Copilot, Aider, Continue, and any agent that reads Markdown files in your repository. Drop the DESIGN.md at the root of your project and the agent picks it up as persistent style context.",
      },
    },
    {
      "@type": "Question",
      name: "Can I edit the generated file before downloading?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The editor lets you tweak colors, fonts, and tokens visually with live preview. Download the .md when you're happy with it, or copy the markdown to your clipboard.",
      },
    },
    {
      "@type": "Question",
      name: "Does it follow the official DESIGN.md spec?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — sections appear in canonical order (Overview → Colors → Typography → Layout → Elevation & Depth → Shapes → Components → Do's and Don'ts), token references use {colors.primary} syntax, and dimensions use spec-allowed units. Extensions like layout, elevation, and logo are accepted under the spec's 'unknown content' rule.",
      },
    },
  ],
};

const EXAMPLE_SITES = [
  { label: "Stripe", url: "https://stripe.com" },
  { label: "Linear", url: "https://linear.app" },
  { label: "Vercel", url: "https://vercel.com" },
  { label: "Notion", url: "https://www.notion.so" },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_APP) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_FAQ) }}
      />
      <Header product="masumi" />
      <main className="pt-[120px] md:pt-[140px] pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <Hero exampleSites={EXAMPLE_SITES} />
          <Creator />
          <Explainer />
          <FAQ />
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}

function Hero({
  exampleSites,
}: {
  exampleSites: { label: string; url: string }[];
}) {
  return (
    <section className="max-w-[820px] mb-12 md:mb-16">
      <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-black/[0.08] bg-white">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FA008C]" />
        <span className="text-[12px] text-[#5b5b5b]">
          Free · No signup · Open spec
        </span>
      </div>
      <h1 className="text-[36px] sm:text-[44px] md:text-[64px] font-normal tracking-[-1.28px] leading-[1.15] text-black max-w-[820px]">
        Generate a DESIGN.md from any URL.
      </h1>
      <p className="mt-6 text-[16px] md:text-[20px] text-[#5b5b5b] leading-[1.4] max-w-[640px]">
        Paste any website. We extract the brand colors, fonts, layout, and
        components into a{" "}
        <Link
          href="https://github.com/google-labs-code/design.md"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-black"
        >
          DESIGN.md
        </Link>{" "}
        file your AI coding agents — Claude Code, Cursor, Copilot — can read.
        Edit visually, download, drop into your repo.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-[#999] uppercase tracking-[0.12em] mr-2">
          Try with
        </span>
        {exampleSites.map((s) => (
          <a
            key={s.url}
            href={`?url=${encodeURIComponent(s.url)}`}
            className="text-[13px] px-3 py-1.5 rounded-full border border-black/[0.08] bg-white hover:bg-black hover:text-white hover:border-black transition-colors"
          >
            {s.label}
          </a>
        ))}
      </div>
    </section>
  );
}

function Explainer() {
  return (
    <section className="mt-24 md:mt-32 max-w-[820px]">
      <p className="text-[12px] text-[#999] uppercase tracking-[0.18em] mb-4">
        What is DESIGN.md?
      </p>
      <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.31] text-black mb-6">
        One file your AI agents can read across every coding session.
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <Step
          n="01"
          title="Paste a URL"
          body="We fetch the page, parse CSS variables, Tailwind atomic classes, Google Fonts, hero selectors, and logo candidates."
        />
        <Step
          n="02"
          title="AI builds your spec"
          body="Claude Haiku 4.5 reads the structured signal and produces a brand-distinctive DESIGN.md following the canonical 8-section format."
        />
        <Step
          n="03"
          title="Edit & download"
          body="Tweak colors, fonts, and tokens with live preview. Download the .md and drop it at the root of your repo. Done."
        />
      </div>
    </section>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <p className="text-[14px] font-mono text-[#FA008C] mb-3">{n}</p>
      <h3 className="text-[18px] font-medium text-black mb-2">{title}</h3>
      <p className="text-[15px] text-[#5b5b5b] leading-[1.55]">{body}</p>
    </div>
  );
}

function FAQ() {
  const items = [
    {
      q: "What is a DESIGN.md file?",
      a: (
        <>
          DESIGN.md is an{" "}
          <Link
            href="https://github.com/google-labs-code/design.md"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-black"
          >
            open spec from Google Labs
          </Link>{" "}
          that captures a brand&apos;s visual identity in a single,
          machine-readable Markdown file. It combines YAML design tokens
          with human-readable rationale, so AI coding agents produce on-brand
          UI consistently across sessions.
        </>
      ),
    },
    {
      q: "How does the generator work?",
      a: "Paste a URL. We fetch the page, extract a structured signal (CSS variables, Tailwind classes, Google Fonts, hero selectors, logo candidates), then send that signal to Claude Haiku 4.5 via OpenRouter to produce a brand-distinctive DESIGN.md.",
    },
    {
      q: "Is it free?",
      a: "Yes. No signup, no credits. Built and hosted by Masumi as a free tool for the design system community.",
    },
    {
      q: "Which AI agents can read DESIGN.md?",
      a: "Claude Code, Cursor, GitHub Copilot, Aider, Continue — any agent that reads Markdown files in your repository. Drop the DESIGN.md at the root of your project and the agent picks it up as persistent style context.",
    },
    {
      q: "Can I edit the file before downloading?",
      a: "Yes. The editor lets you tweak colors, fonts, and tokens visually with live preview. Download the .md when you're satisfied, or copy the markdown to your clipboard.",
    },
    {
      q: "Does it follow the official DESIGN.md spec?",
      a: "Yes — sections appear in canonical spec order (Overview → Colors → Typography → Layout → Elevation & Depth → Shapes → Components → Do's and Don'ts), token references use {colors.primary} syntax, and dimensions use spec-allowed units. Extensions like layout, elevation, and logo fields are accepted under the spec's 'unknown content' rule.",
    },
    {
      q: "Why is this on Masumi?",
      a: (
        <>
          Masumi is the payment network for AI agents. We care about the tools
          that make agents better collaborators — and DESIGN.md is one of them.{" "}
          <Link
            href="/"
            className="underline underline-offset-2 hover:text-black"
          >
            Learn more about Masumi →
          </Link>
        </>
      ),
    },
  ];

  return (
    <section className="mt-24 md:mt-32 max-w-[820px]">
      <p className="text-[12px] text-[#999] uppercase tracking-[0.18em] mb-4">
        Questions
      </p>
      <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.31] text-black mb-10">
        Frequently asked
      </h2>
      <div className="border-t border-black/[0.06]">
        {items.map((it, i) => (
          <details
            key={i}
            className="group border-b border-black/[0.06] py-5"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="text-[16px] md:text-[18px] text-black pr-4">
                {it.q}
              </span>
              <span className="text-[20px] text-[#999] group-open:rotate-45 transition-transform shrink-0">
                +
              </span>
            </summary>
            <div className="mt-4 text-[15px] text-[#5b5b5b] leading-[1.65] max-w-[680px]">
              {it.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

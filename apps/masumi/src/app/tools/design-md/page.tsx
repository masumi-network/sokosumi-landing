import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@summation/shared";
import Creator from "./Creator";
import { getRecent, type SavedExtraction } from "./lib/extractions-db";

export const dynamic = "force-dynamic";

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
    title: "DESIGN.md Generator — Create AI-Ready Design Systems",
    description:
      "Paste any URL and generate a DESIGN.md file your AI agents can read.",
    images: [
      "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt",
    ],
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
        text: "Paste a website URL. The tool fetches the page, extracts a structured signal (CSS variables, Tailwind classes, Google Fonts, hero elements, logo candidates), then runs it through an AI model that produces a brand-distinctive DESIGN.md following the canonical 8-section spec.",
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
      <main className="pt-[100px] md:pt-[110px] pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <ToolHeader />
          <Creator examples={EXAMPLE_SITES} />
          <RecentGallery />
          <BelowFold />
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}

function ToolHeader() {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-4 mb-6 border-b border-black/[0.06]">
      <div>
        <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-1.5">
          Tool · v1
        </p>
        <h1 className="text-[22px] md:text-[26px] font-normal tracking-[-0.5px] text-black">
          DESIGN.md Generator
        </h1>
      </div>
      <div className="flex items-center gap-4 text-[12px] text-[#666]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          <span>Live</span>
        </span>
        <span className="w-px h-3 bg-black/[0.1]" aria-hidden />
        <Link
          href="https://github.com/google-labs-code/design.md"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-black transition-colors"
        >
          <span>Spec</span>
          <span aria-hidden>↗</span>
        </Link>
      </div>
    </header>
  );
}

function BelowFold() {
  return (
    <div className="mt-32 md:mt-40 max-w-[820px]">
      <Explainer />
      <FAQ />
    </div>
  );
}

function RecentGallery() {
  let entries: SavedExtraction[] = [];
  try {
    entries = getRecent(12);
  } catch (e) {
    console.error("[gallery] failed to load recent:", e);
    entries = [];
  }
  if (entries.length === 0) return null;

  return (
    <section className="mt-16 md:mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
        <div>
          <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-1.5">
            Recently analyzed
          </p>
          <h2 className="text-[18px] md:text-[20px] font-medium text-black">
            Latest sites the AI looked at
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-[12px] text-[#999] hidden md:block">
            Click a card to load its DESIGN.md instantly
          </p>
          <Link
            href="/tools/design-md/gallery"
            className="text-[12px] text-[#666] hover:text-black underline-offset-2 hover:underline transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            View all
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {entries.map((e) => (
          <GalleryCard key={e.id} entry={e} />
        ))}
      </div>
    </section>
  );
}

function GalleryCard({ entry }: { entry: SavedExtraction }) {
  const fallbackBg = entry.primaryColor ?? "#f0f0f0";
  return (
    <Link
      href={`?cached=${entry.id}`}
      className="group block bg-white border border-black/[0.06] rounded-[10px] overflow-hidden hover:border-black/30 transition-colors"
    >
      <div
        className="aspect-[16/10] relative overflow-hidden"
        style={{ background: fallbackBg }}
      >
        {entry.hasScreenshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/tools/design-md/api/screenshots/${entry.id}`}
            alt={`${entry.hostname} screenshot`}
            loading="lazy"
            className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/70 text-[12px]">
            no preview
          </div>
        )}
      </div>
      <div className="p-3 md:p-4 flex items-center gap-2 min-w-0">
        {entry.primaryColor && (
          <span
            className="w-3 h-3 rounded-full flex-shrink-0 border border-black/[0.06]"
            style={{ background: entry.primaryColor }}
            aria-hidden
          />
        )}
        <div className="min-w-0 flex-1">
          <p
            className="text-[13px] font-medium text-black truncate"
            title={entry.name ?? entry.hostname}
          >
            {entry.name ?? entry.hostname}
          </p>
          <p className="text-[11px] text-[#999] truncate font-mono">
            {entry.hostname}
          </p>
        </div>
      </div>
    </Link>
  );
}

function Explainer() {
  return (
    <section>
      <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] mb-3 font-mono">
        How it works
      </p>
      <h2 className="text-[22px] md:text-[28px] font-normal tracking-[-0.4px] leading-[1.3] text-black mb-8">
        One file your AI agents read across every coding session.
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
        <Step
          n="01"
          title="Paste a URL"
          body="We fetch the page, parse CSS variables, Tailwind classes, Google Fonts, hero selectors, and logo candidates."
        />
        <Step
          n="02"
          title="AI builds your spec"
          body="Our AI model reads the structured signal and produces a brand-distinctive DESIGN.md in canonical 8-section format."
        />
        <Step
          n="03"
          title="Edit & download"
          body="Tweak colors, fonts, and tokens with live preview. Download the .md, drop it at the root of your repo. Done."
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
      a: "Paste a URL. We fetch the page, extract a structured signal (CSS variables, Tailwind classes, Google Fonts, hero selectors, logo candidates), then run it through an AI model that produces a brand-distinctive DESIGN.md.",
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
    <section className="mt-20 md:mt-28">
      <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] mb-3 font-mono">
        Questions
      </p>
      <h2 className="text-[22px] md:text-[28px] font-normal tracking-[-0.4px] leading-[1.3] text-black mb-8">
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

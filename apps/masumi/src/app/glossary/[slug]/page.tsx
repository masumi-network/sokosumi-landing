import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, FadeIn } from "@summation/shared";
import { getAllTerms, getTermBySlug, relatedTerms } from "@/lib/glossary";

export async function generateStaticParams() {
  try {
    return (await getAllTerms()).map((t) => ({ slug: t.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const term = await getTermBySlug(slug);
  if (!term) return { title: "Term Not Found" };
  return {
    title: `What is ${term.term}? — Agentic Payments Glossary`,
    description: term.shortDefinition,
    alternates: { canonical: `https://www.masumi.network/glossary/${term.slug}` },
    openGraph: {
      title: `What is ${term.term}? | Masumi Glossary`,
      description: term.shortDefinition,
    },
  };
}

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const term = await getTermBySlug(slug);
  if (!term) notFound();
  const related = relatedTerms(term);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.shortDefinition,
    url: `https://www.masumi.network/glossary/${term.slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Masumi Agentic Payments Glossary",
      url: "https://www.masumi.network/glossary",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header product="masumi" />
      <main className="pt-[160px] pb-24">
        <div className="max-w-[720px] mx-auto px-4 md:px-8">
          <FadeIn>
            <Link
              href="/glossary"
              className="inline-flex items-center gap-1.5 text-[13px] text-[#999] hover:text-black transition-colors mb-8"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Glossary
            </Link>
            <h1 className="text-[32px] md:text-[44px] font-normal tracking-[-0.8px] leading-[1.15] text-black mb-4">
              {term.term}
            </h1>
            <p className="text-[17px] text-[#5b5b5b] leading-[1.6] mb-10">
              {term.shortDefinition}
            </p>
          </FadeIn>

          <FadeIn delay={80}>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: term.definitionHtml ?? "" }}
            />
          </FadeIn>

          {related.length > 0 && (
            <FadeIn delay={120}>
              <div className="mt-14 pt-8 border-t border-black/[0.06]">
                <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-4">
                  Related terms
                </p>
                <div className="flex flex-wrap gap-2">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/glossary/${r.slug}`}
                      className="text-[13px] font-medium px-4 py-2 rounded-full bg-white border border-black/[0.08] text-[#666] hover:border-black/20 transition-colors"
                    >
                      {r.term}
                    </Link>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          <FadeIn delay={160}>
            <div className="mt-14 bg-black text-white px-8 py-10 text-center">
              <h2 className="text-[22px] font-normal tracking-[-0.3px]">Build on Masumi</h2>
              <p className="text-[14px] text-white/60 mt-2 max-w-[400px] mx-auto leading-[1.55]">
                Payments, identity, and discovery for AI agents — live on Cardano.
              </p>
              <a
                href="https://www.masumi.network/dev/masumi/documentation"
                className="inline-flex items-center gap-2 text-[14px] font-medium bg-white text-black px-6 py-3 rounded-full hover:bg-white/85 transition-colors mt-6"
              >
                Read the docs
              </a>
            </div>
          </FadeIn>
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}

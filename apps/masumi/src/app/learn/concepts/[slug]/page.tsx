import Link from "next/link";
import { notFound } from "next/navigation";
import { concepts, getConcept } from "../../library-data";
import { TrackedLink } from "../../learner-actions";

export function generateStaticParams() { return concepts.map(({ slug }) => ({ slug })); }

export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const concept = getConcept((await params).slug);
  if (!concept) notFound();
  return <article className="mx-auto max-w-4xl"><Link href="/learn/concepts" className="text-sm text-black/50">← Concept Library</Link><header className="mt-6 rounded-[2.5rem] bg-white p-8 shadow-sm sm:p-12"><p className="text-xs uppercase tracking-[0.18em] text-[#A50045]">{concept.audience}</p><h1 className="mt-3 text-5xl font-medium tracking-tight sm:text-7xl">{concept.title}</h1><p className="mt-5 text-xl leading-8 text-black/55">{concept.summary}</p><p className="mt-7 text-xs text-black/40">Last reviewed {concept.lastReviewed} · Optional, not assessed</p></header><section className="mt-6 rounded-3xl bg-[#FFF0F5] p-7"><h2 className="text-xs uppercase tracking-[0.18em] text-[#A50045]">Keep these distinctions</h2><ul className="mt-4 space-y-3">{concept.takeaways.map((takeaway) => <li key={takeaway} className="flex gap-3 leading-7"><span className="text-[#FA008C]">✓</span>{takeaway}</li>)}</ul></section>{concept.sections.map((section) => <section key={section.title} className="mt-6 rounded-3xl bg-white p-7 sm:p-10"><h2 className="text-3xl font-medium tracking-tight">{section.title}</h2><p className="mt-4 text-base leading-8 text-black/65">{section.body}</p></section>)}<footer className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-black/10 p-6"><p className="max-w-xl text-sm leading-6 text-black/55">Need live implementation details? The maintained reference remains canonical.</p><TrackedLink href={concept.docsHref} event="learn_docs_handoff" params={{ surface: "concept", concept: concept.slug, destination: "reference" }} className="rounded-full bg-black px-5 py-3 text-sm text-white">Open Docs ↗</TrackedLink></footer></article>;
}

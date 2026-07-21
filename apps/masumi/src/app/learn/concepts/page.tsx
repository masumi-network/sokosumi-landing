import Link from "next/link";
import { concepts } from "../library-data";
import { LibraryHeader } from "../library-header";

export const metadata = { title: "Concept Library" };

export default function ConceptsPage() {
  return <><LibraryHeader eyebrow="Learn Library" title="Concepts without a required order." body="Stable what-and-why explanations. These pages never gate a credential; current commands, schemas, values, and troubleshooting remain in Docs." /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{concepts.map((concept) => <Link key={concept.slug} href={`/learn/concepts/${concept.slug}`} className="group rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><p className="text-xs text-[#A50045]">{concept.audience}</p><h2 className="mt-3 text-2xl font-medium tracking-tight">{concept.title}</h2><p className="mt-3 text-sm leading-6 text-black/55">{concept.summary}</p><span className="mt-6 inline-block text-sm font-medium text-[#A50045]">Open explainer →</span></Link>)}</div></>;
}

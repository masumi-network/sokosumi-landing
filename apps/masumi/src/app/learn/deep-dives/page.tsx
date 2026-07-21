import Link from "next/link";
import { concepts, deepDives } from "../library-data";
import { LibraryHeader } from "../library-header";

export const metadata = { title: "Learn deep dives" };

export default function DeepDivesPage() { return <><LibraryHeader eyebrow="Learn Library" title="Follow one question across concepts." body="Deep dives connect related mental models without copying technical reference material into the course." /><div className="space-y-5">{deepDives.map((dive) => <section key={dive.title} className="rounded-3xl bg-white p-7 shadow-sm"><h2 className="text-3xl font-medium tracking-tight">{dive.title}</h2><p className="mt-3 max-w-2xl leading-7 text-black/55">{dive.summary}</p><div className="mt-5 flex flex-wrap gap-2">{dive.concepts.map((slug) => { const concept = concepts.find((item) => item.slug === slug)!; return <Link key={slug} href={`/learn/concepts/${slug}`} className="rounded-full border border-black/15 px-4 py-2 text-sm">{concept.title} →</Link>; })}</div></section>)}</div></>; }

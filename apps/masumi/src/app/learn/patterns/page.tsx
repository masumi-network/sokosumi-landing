import { patterns } from "../library-data";
import { LibraryHeader } from "../library-header";
import { TrackedLink } from "../learner-actions";

export const metadata = { title: "Agent operating patterns" };

export default function PatternsPage() { return <><LibraryHeader eyebrow="Learn Library" title="Patterns for operating a service." body="Optional decision frameworks for collaboration, human review, persistence, and pricing. Exact setup remains in the linked how-to guides." /><div className="grid gap-4 sm:grid-cols-2">{patterns.map((pattern) => <article key={pattern.title} className="rounded-3xl bg-white p-7 shadow-sm"><h2 className="text-2xl font-medium tracking-tight">{pattern.title}</h2><p className="mt-3 text-sm leading-6 text-black/55">{pattern.summary}</p><TrackedLink href={pattern.docsHref} event="learn_docs_handoff" params={{ surface: "pattern", pattern: pattern.title, destination: "implementation" }} className="mt-6 inline-block text-sm font-medium text-[#A50045]">Implementation guide ↗</TrackedLink></article>)}</div></>; }

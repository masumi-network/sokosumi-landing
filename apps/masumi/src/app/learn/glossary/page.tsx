import { glossary } from "../library-data";
import { LibraryHeader } from "../library-header";

export const metadata = { title: "Learn glossary" };

export default function GlossaryPage() { return <><LibraryHeader eyebrow="Learn Library" title="A shared vocabulary." body="Short, course-safe definitions. Use Docs for exact identifiers, states, schemas, and current network values." /><dl className="grid gap-3 sm:grid-cols-2">{glossary.map(([term, definition]) => <div key={term} className="rounded-2xl bg-white p-5 shadow-sm"><dt className="text-lg font-medium">{term}</dt><dd className="mt-2 text-sm leading-6 text-black/55">{definition}</dd></div>)}</dl></>; }

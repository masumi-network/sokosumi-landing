import { Footer, Header } from "@summation/shared";
import Link from "next/link";
import { LearnAccountNav } from "./account-nav";
import { SessionHeartbeat } from "./session-heartbeat";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#F5F5F5]"><SessionHeartbeat /><Header product="masumi" /><main className="px-5 pb-24 pt-[130px] sm:px-8"><div className="mx-auto max-w-6xl"><nav aria-label="Masumi Learn" className="mb-10 rounded-full border border-black/10 bg-white p-1 shadow-sm"><div className="flex items-center"><div className="min-w-0 flex-1 overflow-x-auto"><div className="flex min-w-max items-center gap-1"><LearnNav href="/learn">Overview</LearnNav><LearnNav href="/learn/start">Choose a path</LearnNav><LearnNav href="/learn/course">Course</LearnNav><LearnNav href="/learn/builder">Builder</LearnNav><LearnNav href="/learn/concepts">Concepts</LearnNav><LearnNav href="/learn/glossary">Glossary</LearnNav><LearnNav href="/learn/deep-dives">Deep dives</LearnNav><LearnNav href="/learn/patterns">Patterns</LearnNav><LearnNav href="/learn/dashboard">My learning</LearnNav></div></div><LearnAccountNav /></div></nav>{children}</div></main><Footer product="masumi" /></div>;
}

function LearnNav({ href, children }: { href: string; children: React.ReactNode }) { return <Link href={href} className="rounded-full px-4 py-2 text-xs font-medium text-black/60 transition hover:bg-black hover:text-white">{children}</Link>; }

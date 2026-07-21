import { LEARN_LIBRARY_LAST_REVIEWED } from "./library-data";

export function LibraryHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <header className="mb-10 max-w-3xl"><p className="text-xs uppercase tracking-[0.18em] text-[#A50045]">{eyebrow}</p><h1 className="mt-3 text-5xl font-medium tracking-tight sm:text-7xl">{title}</h1><p className="mt-5 text-lg leading-8 text-black/60">{body}</p><p className="mt-4 text-xs text-black/40">Last reviewed {LEARN_LIBRARY_LAST_REVIEWED} · Owner: Developer Relations</p></header>;
}

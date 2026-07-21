import { LEARN_LIBRARY_LAST_REVIEWED } from "./library-data";

export function LibraryHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <header className="mb-10 max-w-3xl"><p className="text-[13px] uppercase tracking-[0.02em] text-[#FA008C]">{eyebrow}</p><h1 className="mt-3 text-[40px] font-normal tracking-[-1.28px] leading-[1.15] md:text-[64px]">{title}</h1><p className="mt-5 text-[20px] leading-[28px] text-[#5b5b5b]">{body}</p><p className="mt-4 text-[13px] tracking-[0.02em] text-[#5b5b5b]">Last reviewed {LEARN_LIBRARY_LAST_REVIEWED} · Owner: Developer Relations</p></header>;
}

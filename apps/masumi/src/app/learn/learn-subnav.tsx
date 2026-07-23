"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LearnAccountNav } from "./account-nav";

const learnLinks = [
  { href: "/learn", label: "Overview", match: (path: string) => path === "/learn" || path === "/learn/" },
  { href: "/learn/library", label: "Knowledge base", match: (path: string) => path.startsWith("/learn/library") },
  { href: "/learn/course", label: "Course", match: (path: string) => path.startsWith("/learn/course") },
] as const;

const librarySections = [
  { href: "/learn/library#concepts", label: "Concepts" },
  { href: "/learn/library#deep-dives", label: "Deep dives" },
  { href: "/learn/library#patterns", label: "Patterns" },
  { href: "/learn/library#glossary", label: "Glossary" },
] as const;

export function LearnSubnav() {
  const pathname = usePathname() || "/learn";
  const showLibrarySections = pathname.startsWith("/learn/library");
  return (
    <nav aria-label="Masumi Learn" className={`fixed left-0 right-0 top-[110px] z-40 border-b border-black/[0.08] border-t border-black/5 bg-[#F5F5F5]/[0.92] backdrop-blur-[12px] ${showLibrarySections ? "h-[88px]" : "h-12"}`}>
      <div className="mx-auto flex h-12 w-full max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-12">
        <Link href="/learn" className="shrink-0 text-[13px] font-medium leading-none text-black">Learn</Link>
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {learnLinks.map((item) => {
              const isActive = item.match(pathname);
              return (
                <Link key={item.href} href={item.href} aria-current={isActive ? "page" : undefined} className={`shrink-0 rounded-full px-3 py-[7px] text-[13px] leading-[1.2] transition-colors duration-200 hover:bg-white hover:text-black ${isActive ? "bg-white text-black" : "text-black/[0.62]"}`}>
                  {item.label}
                </Link>
              );
            })}
          </div>
          <LearnAccountNav />
        </div>
      </div>
      {showLibrarySections && (
        <div aria-label="Knowledge base sections" className="mx-auto flex h-10 w-full max-w-[1440px] items-center gap-1.5 overflow-x-auto border-t border-black/[0.06] px-5 [scrollbar-width:none] sm:px-12 [&::-webkit-scrollbar]:hidden">
          {librarySections.map((item) => (
            <Link key={item.href} href={item.href} className="shrink-0 rounded-full px-[11px] py-[6px] text-[12px] leading-[1.2] text-black/[0.58] transition-colors duration-200 hover:bg-white/[0.88] hover:text-black">
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

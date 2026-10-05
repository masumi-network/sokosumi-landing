import Link from "next/link";
import ui from "./guide-ui.module.css";

const pages = [
  { href: "/token2049", label: "Setup guide" },
  { href: "/token2049/setup", label: "Your commands" },
  { href: "/token2049/agent", label: "Full agent brief" },
  { href: "/token2049/submission", label: "Submission" },
];

export default function GuideNav({ current }: { current: string }) {
  return <nav aria-label="Hackathon pages" className="mb-12 sm:mb-16">
    <ul className="flex flex-wrap items-center gap-3 text-sm leading-6">
      {pages.map(page => <li key={page.href}><Link href={page.href} aria-current={current === page.href ? "page" : undefined} style={{ textDecoration: "none" }}
        className={`${ui.link} border-b-2 px-3 text-sm ${current === page.href ? "border-[#B90065] font-medium" : "border-transparent"}`}>{page.label}</Link></li>)}
    </ul>
  </nav>;
}

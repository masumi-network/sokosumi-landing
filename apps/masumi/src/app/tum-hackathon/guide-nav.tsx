import Link from "next/link";
import ui from "../token2049/guide-ui.module.css";

const pages = [
  { href: "/tum-hackathon", label: "Setup guide" },
  { href: "/tum-hackathon/agent", label: "Full agent brief" },
  { href: "/tum-hackathon/submission", label: "Submission" },
];

export default function GuideNav({ current }: { current: string }) {
  return <nav aria-label="Hackathon pages" className="mb-12 sm:mb-16">
    <ul className="flex flex-wrap items-center gap-3 text-sm leading-6">
      {pages.map(page => <li key={page.href}><Link href={page.href} prefetch={page.href === "/tum-hackathon/agent" ? false : undefined} aria-current={current === page.href ? "page" : undefined} style={{ textDecoration: "none" }}
        className={`${ui.link} ${ui.pageLink} px-4 text-sm`}>{page.label}</Link></li>)}
    </ul>
  </nav>;
}

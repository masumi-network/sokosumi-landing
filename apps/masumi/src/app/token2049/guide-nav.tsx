import Link from "next/link";

const pages = [
  { href: "/token2049", label: "Build your agent" },
  { href: "/token2049/setup", label: "Get CLI commands" },
  { href: "/token2049/agent", label: "Agent instructions" },
  { href: "/token2049/submission", label: "Submission" },
];

export default function GuideNav({ current }: { current: string }) {
  return <nav aria-label="Hackathon pages" className="mb-12 border-b border-[#460A23]/10 pb-5 sm:mb-16">
    <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm leading-6">
      {pages.map(page => <li key={page.href}><Link href={page.href} aria-current={current === page.href ? "page" : undefined}
        className={`inline-flex min-h-11 items-center border-b-2 py-2 transition-colors focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#460A23] ${current === page.href ? "border-[#B90065] font-medium text-[#460A23]" : "border-transparent text-[#454545] hover:border-[#460A23]/30 hover:text-[#460A23]"}`}>{page.label}</Link></li>)}
    </ul>
  </nav>;
}

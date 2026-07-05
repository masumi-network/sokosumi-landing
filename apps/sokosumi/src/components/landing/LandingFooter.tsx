const COLUMNS = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse agents", href: "/marketplace" },
      { label: "Ready-built tasks", href: "/tasks" },
      { label: "Pricing", href: "/pricing" },
      { label: "Sign up", href: "https://app.sokosumi.com" },
      { label: "Log in", href: "https://app.sokosumi.com/signin" },
    ],
  },
  {
    title: "Agents",
    links: [
      { label: "Research & insights", href: "/categories/research-insights" },
      { label: "Design & analysis", href: "/categories/design-analysis" },
      { label: "Creative & content", href: "/categories/creative-content-generation" },
      { label: "List your agent", href: "https://tally.so/r/nPLBaV" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Press", href: "/press" },
      { label: "Documentation", href: "https://docs.sokosumi.com/documentation" },
    ],
  },
  {
    title: "Ecosystem",
    links: [
      { label: "Masumi", href: "https://www.masumi.network" },
      { label: "Kodosumi", href: "https://www.kodosumi.io" },
      { label: "Serviceplan Group", href: "https://www.serviceplan.com" },
      { label: "NMKR", href: "https://www.nmkr.io" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Imprint", href: "/imprint" },
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Cookie policy", href: "/cookie-policy" },
      { label: "Terms of service", href: "/terms-of-service" },
      { label: "Acceptable use", href: "/acceptable-use" },
    ],
  },
];

const SOCIALS = [
  { label: "X", href: "https://x.com/MasumiNetwork" },
  { label: "Discord", href: "https://discord.com/invite/aj4QfnTS92" },
  { label: "GitHub", href: "https://github.com/masumi-network" },
  { label: "Telegram", href: "https://t.me/+igMz0AazR-cwMzJi" },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-black/[0.07] px-6 pb-12 pt-20">
      <div className="soko-container wide">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_3fr]">
          {/* Brand */}
          <div>
            <img
              src="/images/sokosumi-wordmark.svg"
              alt="Sokosumi"
              width={132}
              height={24}
              className="h-[22px] w-auto"
            />
            <p className="mt-5 max-w-[300px] text-[15px] leading-relaxed text-[var(--body)]">
              AI agents that actually complete your marketing work. Built on the
              Masumi Protocol.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-[rgba(30,30,30,0.55)] transition-colors hover:text-[var(--ink)]"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(10,10,10,0.55)]">
                  {col.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[14.5px] text-[var(--body)] transition-colors hover:text-[var(--ink)]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-black/[0.07] pt-7 text-[13px] text-[rgba(10,10,10,0.55)] sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Sokosumi. All rights reserved.</span>
          <span>
            GDPR &amp; EU AI Act aligned · Built in Europe with NMKR &amp;
            Serviceplan Group
          </span>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { SokosumiLogoFull } from "./SummationLogo";

const sokosumiLinks = {
  Product: [
    { name: "Overview", href: "/product" },
    { name: "Task Board", href: "/product#task-board" },
    { name: "Integrations", href: "/product#integrations" },
  ],
  Agents: [
    { name: "Agentic Coworkers", href: "/agents/coworkers" },
    { name: "Task Agents", href: "/agents/task-agents" },
    { name: "Marketplace", href: "/agents/marketplace" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "Security", href: "/security" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
  ],
};


export default function Footer({ product = "sokosumi" }: { product?: "sokosumi" | "masumi" }) {
  if (product === "masumi") {
    return (
      <footer className="pt-16 pb-10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="border-t border-black/[0.06] pt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <Link href="/">
              <img src="/images/masumi-wordmark.png" alt="masumi" className="h-[16px] w-auto" />
            </Link>
            <div className="flex flex-wrap items-center gap-5 text-[13px] text-[#999]">
              <Link href="https://docs.masumi.network" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                Docs
              </Link>
              <Link href="/blog" className="hover:text-black transition-colors">
                Blog
              </Link>
              <Link href="https://github.com/masumi-network" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                GitHub
              </Link>
              <Link href="https://discord.com/invite/aj4QfnTS92" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                Discord
              </Link>
              <Link href="https://x.com/masaborad" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                X
              </Link>
            </div>
          </div>
          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[12px] text-[#bbb]">
            <p>&copy; {new Date().getFullYear()} Masumi. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Built by</span>
              <a href="https://www.nmkr.io" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <img src="/images/nmkr-logo.svg" alt="NMKR" className="h-[14px] w-auto opacity-40 hover:opacity-70 transition-opacity" />
              </a>
              <span>&amp;</span>
              <a href="https://www.serviceplan.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <img src="/images/serviceplan-group.png" alt="Serviceplan Group" className="h-[60px] w-auto -my-[20px] opacity-40 hover:opacity-70 transition-opacity" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  const links = sokosumiLinks;

  return (
    <footer className="pt-8 pb-10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="border-t border-black/10 pt-16 flex flex-col md:flex-row gap-12 md:gap-0 justify-between">
          <div>
            <SokosumiLogoFull />
          </div>

          <div className="flex flex-wrap gap-10 md:gap-16 lg:gap-[110px]">
            {Object.entries(links).map(([category, items]) => (
              <div key={category}>
                <p className="text-[16px] text-[#8c8c8c] mb-4">{category}</p>
                <ul className="flex flex-col gap-2">
                  {items.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-[14px] text-black hover:text-black/60 transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[14px] text-[#8c8c8c]">
          <p>Copyright &copy; 2025 Sokosumi. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <Link href="/legals/privacy-policy" className="hover:text-black transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legals/terms-conditions" className="hover:text-black transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/legals/imprint" className="hover:text-black transition-colors">
              Imprint
            </Link>
            <Link href="https://linkedin.com/company/sokosumi/" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
              Linkedin
            </Link>
            <Link href="https://x.com/sokosumi" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
              X
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

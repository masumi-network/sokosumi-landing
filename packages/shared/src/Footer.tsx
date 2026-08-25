import Link from "next/link";
import { SokosumiLogoFull } from "./SummationLogo";


export default function Footer({ product = "sokosumi" }: { product?: "sokosumi" | "masumi" | "kodosumi" }) {
  if (product === "kodosumi") {
    return (
      <footer className="pt-16 pb-10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="border-t border-black/[0.06] pt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <Link href="/">
              <span className="text-[18px] font-medium tracking-tight text-black">kodosumi</span>
            </Link>
            <div className="flex flex-wrap items-center gap-5 text-[13px] text-[#666]">
              <Link href="https://docs.kodosumi.io" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                Docs
              </Link>
              <Link href="https://github.com/masumi-network/kodosumi" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
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
          <div className="mt-6 flex flex-wrap items-center justify-end gap-5 text-[13px] text-[#666]">
            <Link href="/imprint" className="hover:text-black transition-colors">
              Imprint
            </Link>
            <Link href="/privacy" className="hover:text-black transition-colors">
              Privacy
            </Link>
            <a href="https://masumi.network" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
              Masumi
            </a>
            <a href="https://sokosumi.com" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
              Sokosumi
            </a>
          </div>
          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[12px] text-[#666]">
            <p>&copy; {new Date().getFullYear()} Kodosumi. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Built by</span>
              <a href="https://www.nmkr.io" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <img src="/images/nmkr-logo.svg" alt="NMKR" width={50} height={14} className="h-[14px] w-auto opacity-40 hover:opacity-70 transition-opacity" />
              </a>
              <span>&amp;</span>
              <a href="https://www.serviceplan.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <img src="/images/serviceplan-group.webp" alt="Serviceplan Group" width={120} height={60} className="h-[60px] w-auto -my-[20px] opacity-40 hover:opacity-70 transition-opacity" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  if (product === "masumi") {
    const linkCls = "text-[13px] text-[#666] hover:text-black transition-colors";
    const headingCls = "text-[11px] font-medium uppercase tracking-[0.08em] text-black mb-4";
    const listCls = "flex flex-col gap-2.5";
    return (
      <footer className="pt-16 pb-10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="border-t border-black/[0.06] pt-12 flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-20">
            <div className="max-w-[280px]">
              <Link href="/">
                <img src="/images/masumi-wordmark.webp" alt="masumi" width={90} height={16} className="h-[16px] w-auto" />
              </Link>
              <p className="mt-4 text-[13px] leading-relaxed text-[#666]">
                The payment network for AI agents. Escrow payments, verified identities, and a public registry &mdash; all on-chain.
              </p>
            </div>
            <nav aria-label="Footer" className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-14">
              <div>
                <h3 className={headingCls}>Protocol</h3>
                <ul className={listCls}>
                  <li><Link href="/x402" className={linkCls}>x402</Link></li>
                  <li><Link href="/explorer" className={linkCls}>Explorer</Link></li>
                  <li><Link href="/use-cases" className={linkCls}>Use cases</Link></li>
                  <li><Link href="/compare" className={linkCls}>Compare</Link></li>
                </ul>
              </div>
              <div>
                <h3 className={headingCls}>Developers</h3>
                <ul className={listCls}>
                  <li><Link href="https://www.masumi.network/dev/masumi/documentation" className={linkCls} target="_blank" rel="noopener noreferrer">Docs</Link></li>
                  <li><Link href="/docs/api" className={linkCls}>API Reference</Link></li>
                  <li><Link href="/tools/design-md" className={linkCls}>DESIGN.md Tool</Link></li>
                  <li><Link href="https://github.com/masumi-network" className={linkCls} target="_blank" rel="noopener noreferrer">GitHub</Link></li>
                </ul>
              </div>
              <div>
                <h3 className={headingCls}>Resources</h3>
                <ul className={listCls}>
                  <li><Link href="/guides" className={linkCls}>Guides</Link></li>
                  <li><Link href="/blogs" className={linkCls}>Blog</Link></li>
                  <li><Link href="/releases" className={linkCls}>Releases</Link></li>
                  <li><Link href="/glossary" className={linkCls}>Glossary</Link></li>
                </ul>
              </div>
              <div>
                <h3 className={headingCls}>Company</h3>
                <ul className={listCls}>
                  <li><Link href="/contact" className={linkCls}>Contact</Link></li>
                  <li><Link href="/press" className={linkCls}>Press</Link></li>
                  <li><a href="https://sokosumi.com" className={linkCls} target="_blank" rel="noopener noreferrer">Sokosumi</a></li>
                  <li><a href="https://kodosumi.io" className={linkCls} target="_blank" rel="noopener noreferrer">Kodosumi</a></li>
                </ul>
              </div>
            </nav>
          </div>
          <div className="mt-12 border-t border-black/[0.06] pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/images/ai-generated.png" alt="AI-generated content mark" width={32} height={32} loading="lazy" className="h-8 w-8" />
              <p className="text-[12px] text-[#666]">Some content on this site is AI generated.</p>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-[13px] text-[#666]">
              <a
                href="https://www.google.com/preferences/source?q=masumi.network"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] px-3 py-1.5 text-[12.5px] hover:text-black hover:border-black transition-colors"
                title="Google: add masumi.network as a preferred source"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z"/><path fill="currentColor" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6C4.8 19.8 8.1 22 12 22z"/><path fill="currentColor" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1C2.4 8.8 2 10.4 2 12s.4 3.2 1.1 4.6L6.4 14z"/><path fill="currentColor" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8.1 2 4.8 4.2 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z"/></svg>
                Add as preferred source
              </a>
              <Link href="https://discord.com/invite/aj4QfnTS92" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                Discord
              </Link>
              <Link href="https://x.com/MasumiNetwork" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                X
              </Link>
              <Link href="/privacy" className="hover:text-black transition-colors">
                Privacy Policy
              </Link>
              <Link href="/imprint" className="hover:text-black transition-colors">
                Imprint
              </Link>
            </div>
          </div>
          <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[12px] text-[#666]">
            <p>&copy; {new Date().getFullYear()} Masumi. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Built by</span>
              <a href="https://www.nmkr.io" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <img src="/images/nmkr-logo.svg" alt="NMKR" width={50} height={14} className="h-[14px] w-auto opacity-40 hover:opacity-70 transition-opacity" />
              </a>
              <span>&amp;</span>
              <a href="https://www.serviceplan.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <img src="/images/serviceplan-group.webp" alt="Serviceplan Group" width={120} height={60} className="h-[60px] w-auto -my-[20px] opacity-40 hover:opacity-70 transition-opacity" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="pt-16 pb-10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="border-t border-black/[0.06] pt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <SokosumiLogoFull />
          <div className="flex flex-wrap items-center gap-5 text-[13px] text-[#666]">
            <Link href="https://app.sokosumi.com" className="hover:text-black transition-colors">
              Log in
            </Link>
            <Link href="/press" className="hover:text-black transition-colors">
              Press
            </Link>
            <Link href="https://linkedin.com/company/sokosumi/" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </Link>
            <Link href="https://x.com/sokosumi" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
              X
            </Link>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-end gap-5 text-[13px] text-[#666]">
          <a href="https://masumi.network" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
            Masumi
          </a>
          <a href="https://kodosumi.io" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
            Kodosumi
          </a>
        </div>
        <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[12px] text-[#666]">
          <p>&copy; {new Date().getFullYear()} Sokosumi. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Built by</span>
            <a href="https://www.nmkr.io" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
              <img src="/images/nmkr-logo.svg" alt="NMKR" width={50} height={14} className="h-[14px] w-auto opacity-40 hover:opacity-70 transition-opacity" />
            </a>
            <span>&amp;</span>
            <a href="https://www.serviceplan.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
              <img src="/images/serviceplan-group.webp" alt="Serviceplan Group" width={120} height={60} className="h-[60px] w-auto -my-[20px] opacity-40 hover:opacity-70 transition-opacity" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

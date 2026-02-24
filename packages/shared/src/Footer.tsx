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
          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[12px] text-[#888]">
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
    return (
      <footer className="pt-16 pb-10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="border-t border-black/[0.06] pt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <Link href="/">
              <img src="/images/masumi-wordmark.webp" alt="masumi" width={90} height={16} className="h-[16px] w-auto" />
            </Link>
            <div className="flex flex-wrap items-center gap-5 text-[13px] text-[#666]">
              <Link href="https://docs.masumi.network" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                Docs
              </Link>
              <Link href="/blogs" className="hover:text-black transition-colors">
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
          <div className="mt-6 flex flex-wrap items-center justify-end gap-5 text-[13px] text-[#666]">
            <Link href="/privacy" className="hover:text-black transition-colors">
              Privacy Policy
            </Link>
            <Link href="/press" className="hover:text-black transition-colors">
              Press
            </Link>
            <Link href="/imprint" className="hover:text-black transition-colors">
              Imprint
            </Link>
            <a href="https://sokosumi.com" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
              Sokosumi
            </a>
            <a href="https://kodosumi.io" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
              Kodosumi
            </a>
          </div>
          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[12px] text-[#888]">
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
        <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[12px] text-[#888]">
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

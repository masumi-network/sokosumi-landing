"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SokosumiIcon } from "./SummationLogo";

const MasumiIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M620.15 274.055C469.578 274.055 347.5 395.383 347.5 545.09H423.243C423.243 437.144 511.563 349.351 620.15 349.351C728.737 349.351 817.057 437.176 817.057 545.09H892.799C892.799 395.415 770.722 274.055 620.15 274.055Z" fill="white"/>
    <path d="M741.498 545.064C741.498 694.77 619.421 816.099 468.849 816.099C318.277 816.099 196.199 694.739 196.199 545.064H271.942C271.942 652.978 360.262 740.802 468.849 740.802C577.436 740.802 665.755 653.009 665.755 545.064H741.498Z" fill="white"/>
  </svg>
);

const products = [
  {
    id: "sokosumi" as const,
    name: "sokosumi",
    desc: "AI Marketing Agents for Teams",
    href: "https://sokosumi.com",
    icon: <SokosumiIcon className="w-5 h-5" />,
  },
  {
    id: "masumi" as const,
    name: "masumi",
    desc: "The Protocol for AI Agent Networks",
    href: "https://masumi.network",
    icon: <MasumiIcon className="w-5 h-5" />,
  },
];

export default function Header({ product = "sokosumi" }: { product?: "sokosumi" | "masumi" }) {
  const [showProducts, setShowProducts] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        style={{
          height: 74,
          backgroundColor: "rgba(244,244,244,0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="w-full max-w-[1440px] flex items-center justify-between px-6 lg:px-12">
          {/* Logo with product switcher */}
          <div
            className="relative"
            onMouseEnter={() => setShowProducts(true)}
            onMouseLeave={() => setShowProducts(false)}
          >
            <div className="flex items-center gap-2 group">
              {product === "sokosumi" ? (
                <Link href="/">
                  <img src="/images/sokosumi-wordmark.svg" alt="sokosumi" width={100} height={18} className="h-[18px] w-auto block" />
                </Link>
              ) : (
                <Link href="/">
                  <img src="/images/masumi-wordmark.png" alt="masumi" width={100} height={18} className="h-[18px] w-auto block" />
                </Link>
              )}
              <button>
                <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className={`hidden sm:block transition-transform ${showProducts ? "rotate-180" : ""}`}>
                  <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {showProducts && (
              <div className="absolute top-full left-0 pt-2">
                <div className="bg-white rounded-xl shadow-xl border border-black/5 p-3 w-[280px]">
                  <p className="text-[10px] uppercase tracking-widest text-[#999] mb-2 px-2 font-medium">Products</p>
                  {products.map((p) => (
                    <a
                      key={p.name}
                      href={p.href}
                      className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${p.id === product ? "bg-[#F5F5F5]" : "hover:bg-[#F5F5F5]"}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${p.id === "masumi" ? "bg-[#FF003D]" : "bg-[#6400FF] text-white"}`}>
                        {p.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[14px] font-medium text-black">{p.name}</span>
                          {p.id === product && (
                            <span className="text-[9px] text-[#2cb67d] bg-[#2cb67d]/10 px-1.5 py-0.5 rounded-full font-medium">Active</span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#888]">{p.desc}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {product === "sokosumi" ? (
            <nav className="hidden lg:flex items-center h-[74px]">
              <Link href="/press" className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
                Press
              </Link>
            </nav>
          ) : (
            <nav className="hidden lg:flex items-center h-[74px]">
              <Link href="https://docs.masumi.network" target="_blank" rel="noopener noreferrer" className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
                Docs
              </Link>
              <Link href="/blogs" className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
                Blog
              </Link>
              <Link href="https://github.com/masumi-network" target="_blank" rel="noopener noreferrer" className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
                GitHub
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-4">
            {product === "sokosumi" ? (
              <>
                <Link href="https://app.sokosumi.com" className="hidden lg:block text-[14px] font-normal text-black hover:text-black/60 transition-colors">
                  Log in
                </Link>
                <Link href="https://app.sokosumi.com"
                  className="hidden lg:block bg-black text-white text-[12px] font-normal px-6 py-2.5 rounded-full hover:bg-black/85 transition-colors">
                  Get started
                </Link>
              </>
            ) : (
              <Link href="https://docs.masumi.network" target="_blank" rel="noopener noreferrer"
                className="hidden lg:block bg-black text-white text-[12px] font-normal px-6 py-2.5 rounded-full hover:bg-black/85 transition-colors">
                Read the Docs
              </Link>
            )}
            <button
              className="lg:hidden flex flex-col gap-1.5 p-2"
              aria-label="Menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className={`w-5 h-[1.5px] bg-black transition-transform duration-200 ${mobileMenuOpen ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <span className={`w-5 h-[1.5px] bg-black transition-opacity duration-200 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`w-5 h-[1.5px] bg-black transition-transform duration-200 ${mobileMenuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ top: 74 }}>
          <div className="absolute inset-0 bg-[#F5F5F5]" />
          <nav className="relative flex flex-col px-6 pt-8 gap-1">
            {product === "sokosumi" ? (
              <>
                <Link href="/press" onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  Press
                </Link>
                <Link href="https://app.sokosumi.com" onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  Log in
                </Link>
                <Link href="https://app.sokosumi.com" onClick={() => setMobileMenuOpen(false)}
                  className="mt-6 bg-black text-white text-[14px] font-normal px-6 py-3 rounded-full text-center">
                  Get started
                </Link>
              </>
            ) : (
              <>
                <Link href="https://docs.masumi.network" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  Docs
                </Link>
                <Link href="/blogs" onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  Blog
                </Link>
                <Link href="https://github.com/masumi-network" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  GitHub
                </Link>
                <Link href="https://discord.com/invite/aj4QfnTS92" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="text-[18px] text-black py-3 border-b border-black/[0.06]">
                  Discord
                </Link>
                <Link href="https://docs.masumi.network" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)}
                  className="mt-6 bg-black text-white text-[14px] font-normal px-6 py-3 rounded-full text-center">
                  Read the Docs
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SokosumiIcon } from "./SummationLogo";

const products = [
  {
    name: "sokosumi",
    desc: "AI Marketing Agents for Teams",
    href: "/",
    icon: (
      <SokosumiIcon className="w-5 h-5" />
    ),
    active: true,
  },
  {
    name: "masumi",
    desc: "The Protocol for AI Agent Networks",
    href: "/masumi",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      </svg>
    ),
    active: false,
  },
];

const agents = [
  {
    name: "Agentic Coworkers",
    desc: "Specialized AI agents that behave like team members and own marketing tasks.",
    href: "/agents/coworkers",
  },
  {
    name: "Task Agents",
    desc: "Fast, precise agents for research, copy, SEO, and campaign execution.",
    href: "/agents/task-agents",
  },
  {
    name: "Agent Marketplace",
    desc: "High-quality partner agents for GWI, Statista, ad variations, and more.",
    href: "/agents/marketplace",
  },
];

export default function Header() {
  const [showAgents, setShowAgents] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center"
      style={{
        height: 74,
        backgroundColor: scrolled ? "rgba(244,244,244,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "background-color 0.3s, backdrop-filter 0.3s",
      }}
    >
      <div className="w-full max-w-[1440px] flex items-center justify-between px-6 lg:px-12">
        {/* Logo with product switcher */}
        <div
          className="relative"
          onMouseEnter={() => setShowProducts(true)}
          onMouseLeave={() => setShowProducts(false)}
        >
          <button className="flex items-center gap-2 group">
            <SokosumiIcon className="w-6 h-6" />
            <span className="text-[16px] font-medium tracking-tight hidden sm:block">sokosumi</span>
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className={`hidden sm:block transition-transform ${showProducts ? "rotate-180" : ""}`}>
              <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {showProducts && (
            <div className="absolute top-full left-0 pt-2">
              <div className="bg-white rounded-xl shadow-xl border border-black/5 p-3 w-[280px]">
                <p className="text-[10px] uppercase tracking-widest text-[#999] mb-2 px-2 font-medium">Products</p>
                {products.map((p) => (
                  <Link
                    key={p.name}
                    href={p.href}
                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${p.active ? "bg-[#f4f4f4]" : "hover:bg-[#f4f4f4]"}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center flex-shrink-0">
                      {p.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-medium text-black">{p.name}</span>
                        {p.active && (
                          <span className="text-[9px] text-[#2cb67d] bg-[#2cb67d]/10 px-1.5 py-0.5 rounded-full font-medium">Active</span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#888]">{p.desc}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <nav className="hidden lg:flex items-center h-[74px]">
          <Link href="/product" className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
            Product
          </Link>
          <div
            className="relative h-full"
            onMouseEnter={() => setShowAgents(true)}
            onMouseLeave={() => setShowAgents(false)}
          >
            <button className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center gap-1.5">
              Agents
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
                className={`transition-transform ${showAgents ? "rotate-180" : ""}`}>
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {showAgents && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                <div className="bg-white rounded-2xl shadow-xl border border-black/5 p-6 w-[520px]">
                  <p className="text-[11px] uppercase tracking-widest text-[#919191] mb-1 font-medium">
                    Meet Your AI Team
                  </p>
                  <p className="text-[12px] text-[#7b7b7b] mb-5">
                    Specialized agents that own tasks and deliver results.
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {agents.map((a) => (
                      <Link key={a.name} href={a.href}
                        className="flex flex-col gap-0.5 p-3 rounded-xl hover:bg-[#f4f4f4] transition-colors">
                        <span className="text-[14px] font-normal text-black">{a.name}</span>
                        <span className="text-[12px] text-[#696969]">{a.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <Link href="/security" className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
            Security
          </Link>
          <Link href="/pricing" className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="https://app.sokosumi.com" className="hidden lg:block text-[14px] font-normal text-black hover:text-black/60 transition-colors">
            Log in
          </Link>
          {scrolled && (
            <Link href="/get-started"
              className="hidden lg:block bg-black text-white text-[12px] font-normal px-6 py-2.5 rounded-full hover:bg-black/85 transition-colors">
              Get started
            </Link>
          )}
          <button className="lg:hidden flex flex-col gap-1.5 p-2" aria-label="Menu">
            <span className="w-5 h-[1.5px] bg-black" />
            <span className="w-5 h-[1.5px] bg-black" />
            <span className="w-5 h-[1.5px] bg-black" />
          </button>
        </div>
      </div>
    </header>
  );
}

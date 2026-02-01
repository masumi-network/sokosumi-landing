"use client";

import { useState } from "react";
import Link from "next/link";
import { SokosumiIcon } from "./SummationLogo";

const MasumiIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M1069 544.5C1069 834.173 834.173 1069 544.5 1069C254.827 1069 20 834.173 20 544.5C20 254.827 254.827 20 544.5 20C834.173 20 1069 254.827 1069 544.5ZM620.15 274.055C469.578 274.055 347.5 395.383 347.5 545.09H423.243C423.243 437.144 511.563 349.351 620.15 349.351C728.737 349.351 817.057 437.176 817.057 545.09H892.799C892.799 395.415 770.722 274.055 620.15 274.055ZM741.498 545.064C741.498 694.77 619.421 816.099 468.849 816.099C318.277 816.099 196.199 694.739 196.199 545.064H271.942C271.942 652.978 360.262 740.802 468.849 740.802C577.436 740.802 665.755 653.009 665.755 545.064H741.498Z" fill="white"/>
  </svg>
);

const products = [
  {
    id: "sokosumi" as const,
    name: "sokosumi",
    desc: "AI Marketing Agents for Teams",
    href: "http://localhost:3000",
    icon: <SokosumiIcon className="w-5 h-5" />,
  },
  {
    id: "masumi" as const,
    name: "masumi",
    desc: "The Protocol for AI Agent Networks",
    href: "http://localhost:3001",
    icon: <MasumiIcon className="w-5 h-5" />,
  },
];

const sokosumiAgents = [
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

export default function Header({ product = "sokosumi" }: { product?: "sokosumi" | "masumi" }) {
  const [showAgents, setShowAgents] = useState(false);
  const [showProducts, setShowProducts] = useState(false);

  return (
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
              <button className="flex items-center gap-2">
                <SokosumiIcon className="w-6 h-6" />
                <span className="text-[16px] font-medium tracking-tight hidden sm:block">{product}</span>
              </button>
            ) : (
              <Link href="/">
                <img src="/images/masumi-wordmark.png" alt="masumi" className="h-[18px] w-auto block" />
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
                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${p.id === product ? "bg-[#f4f4f4]" : "hover:bg-[#f4f4f4]"}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${p.id === "masumi" ? "bg-[#FF003D]" : "bg-black text-white"}`}>
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
                      {sokosumiAgents.map((a) => (
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
        ) : (
          <nav className="hidden lg:flex items-center h-[74px]">
            <Link href="https://docs.masumi.network" target="_blank" rel="noopener noreferrer" className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
              Docs
            </Link>
            <Link href="/blog" className="text-[14px] font-normal text-black hover:text-black/60 transition-colors px-[15px] h-full flex items-center">
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
              <Link href="/get-started"
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

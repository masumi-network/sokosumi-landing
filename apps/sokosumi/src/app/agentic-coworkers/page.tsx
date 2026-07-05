import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer, FadeIn } from "@summation/shared";

export const metadata: Metadata = {
  title: "Agentic Coworkers",
  description:
    "Meet the AI agents that do the work. Research, planning, SEO, and copywriting. Each agent owns their domain.",
};

const agents = [
  {
    name: "Hannah",
    role: "Research Lead",
    description:
      "Market research, competitive analysis, audience insights, and data-driven strategy. Hannah cross-references GWI, Statista, and SimilarWeb to build the complete picture.",
    logo: { src: "/images/serviceplan-group.png", alt: "Serviceplan Group", width: 120, height: 24 },
  },
  {
    name: "John",
    role: "Project Manager",
    description:
      "Brief breakdowns, timeline planning, milestone tracking, and team coordination. John keeps every workstream on track and every agent aligned.",
    logo: { src: "/images/nmkr-logo.svg", alt: "NMKR", width: 72, height: 24 },
  },
  {
    name: "SEO Agent",
    role: "SEO Specialist",
    description:
      "Keyword research, content outlines, technical audits, and organic growth strategy. SEO Agent finds the gaps your competitors miss.",
    logo: { src: "/images/serviceplan-group.png", alt: "Serviceplan Group", width: 120, height: 24 },
  },
  {
    name: "Copy Agent",
    role: "Copywriter",
    description:
      "Ad copy, blog posts, social content, and brand voice development. Copy Agent writes in your voice and adapts to every channel.",
    logo: { src: "/images/serviceplan-group.png", alt: "Serviceplan Group", width: 120, height: 24 },
  },
];

export default function AgenticCoworkers() {
  return (
    <>
      <Header product="sokosumi" />
      <main className="pt-[160px] pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <FadeIn>
            <div className="max-w-[700px] mx-auto text-center mb-20">
              <h1 className="text-[36px] md:text-[56px] font-normal tracking-[-0.8px] leading-[1.15] text-black">
                Agentic Coworkers
              </h1>
              <p className="mt-6 text-[16px] md:text-[20px] text-[#5b5b5b] leading-[1.4]">
                AI agents that behave like team members. They own tasks, follow responsibilities, and work together on your campaigns.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map((agent, i) => (
              <FadeIn key={agent.name} delay={i * 80}>
                <div className="bg-white border border-black/[0.06] p-8 md:p-10 flex flex-col h-full">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src="/images/hannah.png"
                        alt={agent.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-[22px] font-medium text-black leading-tight">{agent.name}</h2>
                      <p className="text-[14px] text-[#999] mt-0.5">{agent.role}</p>
                    </div>
                  </div>

                  <p className="text-[15px] text-[#555] leading-[1.5] mb-6">{agent.description}</p>

                  <div className="mt-auto pt-3 h-[24px] flex items-center">
                    {agent.logo && (
                      <Image src={agent.logo.src} alt={agent.logo.alt} width={agent.logo.width} height={agent.logo.height} />
                    )}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={400}>
            <div className="mt-20 text-center">
              <Link
                href="https://app.sokosumi.com"
                className="inline-flex items-center justify-center bg-black text-white text-[16px] font-normal px-8 py-3 rounded-full hover:bg-black/85 transition-colors"
              >
                Get started with your team
              </Link>
            </div>
          </FadeIn>
        </div>
      </main>
      <Footer product="sokosumi" />
    </>
  );
}

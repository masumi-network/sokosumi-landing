import type { Metadata } from "next";
import { Header } from "@summation/shared";
import LandingFooter from "@/components/landing/LandingFooter";
import { getCatalog } from "@/lib/catalog";

export const revalidate = 600;
const APP = "https://app.sokosumi.com";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sokosumi is the marketplace where marketing teams hire AI marketing agents — built in Europe by NMKR with marketing professionals at Serviceplan Group, on the Masumi network.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const { agents, coworkers } = await getCatalog();
  const runs = agents.reduce((s, a) => s + a.runs, 0);

  return (
    <div className="soko">
      <Header product="sokosumi" />
      <main>
        <section className="relative overflow-hidden bg-white pt-[120px]">
          <div className="soko-glow" style={{ top: -180, right: -100, width: 500, height: 500 }} />
          <div className="soko-container wide relative pb-12">
            <h1 className="soko-statement section">
              Built by marketing professionals, for marketing teams
            </h1>
            <p className="soko-lead mt-4 max-w-[620px]">
              Sokosumi turns agentic AI into practical marketing execution: a
              marketplace where teams hire specialized agents for real work —
              research, content, reporting, and more.
            </p>
          </div>
        </section>

        <section className="bg-[var(--surface)]">
          <div className="soko-container wide grid gap-10 py-14 lg:grid-cols-3">
            <div className="rounded-[16px] border border-black/[0.08] bg-white p-7">
              <h2 className="text-[17px] font-medium text-[var(--ink)]">Serviceplan Group</h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--body)]">
                Sokosumi is built together with marketing professionals at
                Serviceplan Group — one of Europe&apos;s largest independent
                agency groups. The agents and workflows come from people who do
                this work for real clients.
              </p>
            </div>
            <div className="rounded-[16px] border border-black/[0.08] bg-white p-7">
              <h2 className="text-[17px] font-medium text-[var(--ink)]">NMKR</h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--body)]">
                Engineered by NMKR, the team behind infrastructure used across
                the Cardano ecosystem. Built in Europe, GDPR-aligned, and
                designed with the EU AI Act in mind.
              </p>
            </div>
            <div className="rounded-[16px] border border-black/[0.08] bg-white p-7">
              <h2 className="text-[17px] font-medium text-[var(--ink)]">The Masumi network</h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--body)]">
                Agents on Sokosumi run on Masumi, the payment network for AI
                agents: every completed job is paid and verified on-chain, so
                track records are real, not claimed.
              </p>
            </div>
          </div>
        </section>

        {agents.length > 0 && (
          <section className="bg-white">
            <div className="soko-container wide py-14">
              <div className="grid gap-8 text-center sm:grid-cols-3">
                <div>
                  <div className="text-[40px] font-light tracking-[-0.02em] text-[var(--accent)]">
                    {agents.length}
                  </div>
                  <div className="mt-1 text-[14px] text-[var(--body)]">agents live on the marketplace</div>
                </div>
                <div>
                  <div className="text-[40px] font-light tracking-[-0.02em] text-[var(--ink)]">
                    {runs.toLocaleString()}
                  </div>
                  <div className="mt-1 text-[14px] text-[var(--body)]">jobs run to date</div>
                </div>
                <div>
                  <div className="text-[40px] font-light tracking-[-0.02em] text-[var(--ink)]">
                    {coworkers.length}
                  </div>
                  <div className="mt-1 text-[14px] text-[var(--body)]">AI coworkers ready to hire</div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="bg-[var(--surface)]">
          <div className="soko-container wide py-16 text-center">
            <h2 className="soko-statement section">See the marketplace for yourself</h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={APP}
                className="rounded-full px-8 py-4 text-[15.5px] font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--accent)" }}
              >
                Sign up
              </a>
              <a
                href="/marketplace"
                className="rounded-full border border-black/[0.15] px-8 py-4 text-[15.5px] font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent)]"
              >
                Browse agents
              </a>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

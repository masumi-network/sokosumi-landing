import type { Metadata } from "next";
import { Header } from "@summation/shared";
import LandingFooter from "@/components/landing/LandingFooter";
import { getCatalog } from "@/lib/catalog";

export const revalidate = 600;
const APP = "https://app.sokosumi.com";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent pricing for AI marketing agent work: pay in credits per task, with example costs from the live Sokosumi marketplace.",
  alternates: { canonical: "/pricing" },
};

// DEV-PHASE PLACEHOLDERS — replace with the final commercial model before
// public launch. Everything marked "placeholder" below is intentionally
// visible so nothing unfinished ships silently.
const PLANS = [
  {
    name: "Starter",
    price: "Placeholder",
    blurb: "Try the marketplace and run your first tasks.",
    features: ["Free credits on signup", "Marketplace access", "Pre-built tasks", "Community support"],
  },
  {
    name: "Team",
    price: "Placeholder",
    blurb: "For marketing teams running agents every week.",
    features: ["Everything in Starter", "Shared workspaces", "Recurring tasks", "Priority support"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    blurb: "Governance, procurement, and volume pricing.",
    features: ["Everything in Team", "Enterprise billing", "Security review", "Dedicated contact"],
  },
];

export default async function PricingPage() {
  const { agents } = await getCatalog();
  const examples = [...agents]
    .filter((a) => a.credits != null && a.credits > 0 && a.runs > 50)
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 5);

  return (
    <div className="soko">
      <Header product="sokosumi" />
      <main>
        <section className="relative overflow-hidden bg-white pt-[120px]">
          <div className="soko-glow" style={{ top: -180, right: -100, width: 500, height: 500 }} />
          <div className="soko-container wide relative pb-12">
            <h1 className="soko-statement section">Transparent pricing for agent work</h1>
            <p className="soko-lead mt-4 max-w-[560px]">
              You pay in credits, per task. Every agent shows its credit price
              up front — no seats, no surprises.
            </p>
            <p className="mt-5 inline-block rounded-full border border-amber-400 bg-amber-50 px-4 py-1.5 text-[13px] font-medium text-amber-700">
              Development preview — plan details below are placeholders, not final pricing
            </p>
          </div>
        </section>

        <section className="bg-[var(--surface)]">
          <div className="soko-container wide py-14">
            <div className="grid gap-5 lg:grid-cols-3">
              {PLANS.map((p) => (
                <div
                  key={p.name}
                  className={`rounded-[18px] border bg-white p-8 ${
                    p.highlight ? "border-[var(--accent)]" : "border-black/[0.08]"
                  }`}
                >
                  <h2 className="text-[18px] font-medium text-[var(--ink)]">{p.name}</h2>
                  <div className="mt-3 text-[30px] font-light tracking-[-0.02em] text-[var(--ink)]">
                    {p.price}
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-[var(--body)]">{p.blurb}</p>
                  <ul className="mt-6 flex flex-col gap-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[14px] text-[var(--body)]">
                        <span className="mt-0.5 text-[var(--accent)]">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={APP}
                    className={`mt-8 block rounded-full px-6 py-3 text-center text-[14.5px] font-medium transition-opacity hover:opacity-90 ${
                      p.highlight ? "text-white" : "border border-black/[0.15] text-[var(--ink)]"
                    }`}
                    style={p.highlight ? { background: "var(--accent)" } : undefined}
                  >
                    Sign up
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {examples.length > 0 && (
          <section className="bg-white">
            <div className="soko-container wide py-14">
              <h2 className="text-[22px] font-medium tracking-[-0.01em] text-[var(--ink)]">
                Real task prices from the live marketplace
              </h2>
              <p className="mt-2 max-w-[520px] text-[14.5px] text-[var(--body)]">
                Current credit prices of popular agents — live data, not examples
                we made up.
              </p>
              <div className="mt-6 overflow-x-auto rounded-[14px] border border-black/[0.08]">
                <table className="w-full min-w-[520px] text-left text-[14.5px]">
                  <thead>
                    <tr className="border-b border-black/[0.08] text-[12.5px] uppercase tracking-wide text-[var(--muted)]">
                      <th className="px-5 py-3.5 font-medium">Agent</th>
                      <th className="px-5 py-3.5 font-medium">Runs</th>
                      <th className="px-5 py-3.5 font-medium">Price per task</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examples.map((a) => (
                      <tr key={a.id} className="border-b border-black/[0.05] last:border-0">
                        <td className="px-5 py-3.5 text-[var(--ink)]">{a.name}</td>
                        <td className="px-5 py-3.5 text-[var(--body)]">{a.runs.toLocaleString()}</td>
                        <td className="px-5 py-3.5 font-medium text-[var(--ink)]">{a.credits} credits</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        <section className="bg-[var(--surface)]">
          <div className="soko-container wide py-16 text-center">
            <h2 className="soko-statement section">Start with free credits</h2>
            <p className="soko-lead mx-auto mt-4 max-w-[440px]">
              Sign up, get starting credits, and run your first task today.
            </p>
            <a
              href={APP}
              className="mt-8 inline-block rounded-full px-8 py-4 text-[15.5px] font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              Sign up
            </a>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

import type { Metadata } from "next";
import { Header, Footer } from "@summation/shared";
import { MasumiMark } from "@/components/masumi-mark";
import { RegisterWizard } from "@/components/register-wizard";

export const metadata: Metadata = {
  title: "Register Agent",
  description:
    "Add your AI agent to the Masumi registry, the public on-chain list anyone can search. Agents paid on Cardano or through x402 on EVM chains both work.",
  openGraph: {
    title: "Register Agent | Masumi",
    description:
      "Enter your email and register your AI agent on the Masumi network.",
    images: [
      {
        url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt",
        width: 1920,
        height: 1080,
      },
    ],
  },
  alternates: { canonical: "https://www.masumi.network/register" },
};

export default function RegisterPage() {
  return (
    <>
      <Header product="masumi" />
      <main className="pt-[140px] pb-16 bg-masumi-surface min-h-[calc(100vh-140px)]">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <MasumiMark size={56} />
            <div className="animate-fade-in-up animation-delay-100">
              <h1 className="text-2xl font-semibold tracking-tight text-masumi-ink">
                Register on Masumi Network
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-masumi-muted">
                Add your agent to the Masumi registry, a public list of AI agents
                stored on-chain. Once it is in, anyone can find it in the{" "}
                <a href="/explorer" className="text-masumi-ink underline underline-offset-2">explorer</a>.
                Cardano agents and x402 agents on EVM chains both work.
              </p>
            </div>
          </div>
          <div className="animate-fade-in-up animation-delay-100">
            <RegisterWizard />
          </div>
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}

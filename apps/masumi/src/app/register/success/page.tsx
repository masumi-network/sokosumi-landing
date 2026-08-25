import type { Metadata } from "next";
import { Header, Footer } from "@summation/shared";
import { MasumiMark } from "@/components/masumi-mark";
import { RegisterSuccessContent } from "@/components/register-success-content";

export const metadata: Metadata = {
  title: "Registration Complete",
  description: "Your Masumi agent registration is complete.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  agentId?: string;
  agentName?: string;
  draftId?: string;
  pollToken?: string;
}>;

export default async function RegisterSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { agentId, agentName, draftId, pollToken } = await searchParams;

  return (
    <>
      <Header product="masumi" />
      <main className="pt-[140px] pb-16 bg-masumi-surface min-h-[calc(100vh-140px)]">
        <div className="mx-auto max-w-xl px-4 py-8 text-center sm:px-6">
          <div className="mx-auto mb-6 flex justify-center">
            <MasumiMark size={56} />
          </div>
          <RegisterSuccessContent
            agentId={agentId}
            agentName={agentName}
            draftId={draftId}
            pollToken={pollToken}
          />
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}

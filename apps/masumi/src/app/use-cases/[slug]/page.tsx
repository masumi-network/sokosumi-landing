import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer, FadeIn } from "@summation/shared";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RenderBlocks } from "@/components/CmsBlocks";
import { getAllUseCases, getUseCaseBySlug } from "@/lib/content";

export async function generateStaticParams() {
  try {
    return (await getAllUseCases()).map((uc) => ({ slug: uc.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const useCase = await getUseCaseBySlug(slug);
  if (!useCase) return { title: "Use Case Not Found" };
  return {
    title: useCase.title,
    description: useCase.description,
    alternates: { canonical: `https://www.masumi.network/use-cases/${useCase.slug}` },
    openGraph: {
      title: `${useCase.title} | Masumi`,
      description: useCase.description,
      images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
    },
  };
}

export default async function UseCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const useCase = await getUseCaseBySlug(slug);
  if (!useCase) notFound();
  const relatedAgents = useCase.relatedAgents ?? [];

  return (
    <>
      <Header product="masumi" />
      <main className="relative pb-24">
        <div className="absolute top-[110px] left-0 right-0 z-10">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
            <Breadcrumbs
              items={[
                { label: "Use cases", href: "/use-cases" },
                { label: useCase.title },
              ]}
            />
          </div>
        </div>
        <RenderBlocks blocks={useCase.layout} />
        {relatedAgents.length > 0 && (
          <section className="py-16">
            <FadeIn className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
              <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-4">
                Works with these agents
              </p>
              <div className="flex flex-wrap gap-2">
                {relatedAgents.map((agent) => (
                  <span
                    key={agent.agentSlug}
                    className="text-[13px] font-medium px-4 py-2 rounded-full bg-white border border-black/[0.08] text-[#666]"
                  >
                    {agent.agentSlug}
                  </span>
                ))}
              </div>
            </FadeIn>
          </section>
        )}
      </main>
      <Footer product="masumi" />
    </>
  );
}

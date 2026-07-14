import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, FadeIn } from "@summation/shared";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getAllReleases, TAG_COLORS, TAG_LABELS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Releases — What's New in Masumi",
  description:
    "The Masumi changelog: new features, improvements, and fixes across the payment network, registry, and developer tooling.",
  alternates: { canonical: "https://www.masumi.network/releases" },
  openGraph: {
    title: "Releases | Masumi",
    description:
      "The Masumi changelog: new features, improvements, and fixes.",
    images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
  },
};

export default async function ReleasesPage() {
  const releases = await getAllReleases();

  return (
    <>
      <Header product="masumi" />
      <main className="pt-[120px] pb-24">
        <div className="max-w-[820px] mx-auto px-4 md:px-8">
          <FadeIn>
            <Breadcrumbs items={[{ label: "Releases" }]} />
            <div className="mt-10 mb-14 text-center">
              <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-3">
                Releases
              </p>
              <h1 className="text-[40px] md:text-[56px] font-normal tracking-[-1px] leading-[1.15] text-black mb-4">
                What&apos;s new in Masumi
              </h1>
              <p className="text-[16px] md:text-[18px] text-[#5b5b5b] max-w-[520px] mx-auto leading-[1.5]">
                Features, improvements, and fixes — newest first.
              </p>
            </div>
          </FadeIn>

          <div className="border-l border-black/[0.08] pl-8 md:pl-12">
            {releases.map((release, i) => (
              <FadeIn key={release.slug} delay={i * 60}>
                <article className="relative pb-14">
                  <span
                    className="absolute -left-8 md:-left-12 top-[7px] -translate-x-1/2 w-[9px] h-[9px] rounded-full bg-[#FA008C]"
                    aria-hidden
                  />
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <time
                      dateTime={release.date}
                      className="text-[12px] text-[#999] font-mono uppercase tracking-[0.08em]"
                    >
                      {new Date(release.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    {release.version && (
                      <span className="text-[11px] font-medium font-mono px-2 py-0.5 rounded-full bg-black text-white">
                        {release.version}
                      </span>
                    )}
                  </div>
                  <h2 className="text-[22px] md:text-[26px] font-normal tracking-[-0.4px] leading-[1.25] text-black mb-2">
                    <Link
                      href={`/releases/${release.slug}`}
                      className="hover:text-black/70 transition-colors"
                    >
                      {release.title}
                    </Link>
                  </h2>
                  <p className="text-[14px] text-[#5b5b5b] leading-[1.55] mb-4 max-w-[600px]">
                    {release.description}
                  </p>
                  {(release.highlights ?? []).length > 0 && (
                    <ul className="space-y-2">
                      {(release.highlights ?? []).map((h, hi) => (
                        <li key={hi} className="flex items-start gap-2.5">
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                            style={{
                              backgroundColor: `${TAG_COLORS[h.tag] ?? "#666"}15`,
                              color: TAG_COLORS[h.tag] ?? "#666",
                            }}
                          >
                            {TAG_LABELS[h.tag] ?? h.tag}
                          </span>
                          <span className="text-[14px] text-[#5b5b5b] leading-[1.55]">
                            {h.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href={`/releases/${release.slug}`}
                    className="inline-block text-[12px] text-[#FA008C] mt-4"
                  >
                    Release notes →
                  </Link>
                </article>
              </FadeIn>
            ))}
          </div>

          {releases.length === 0 && (
            <p className="text-center text-[15px] text-[#999] mt-12">
              No releases published yet — check back soon.
            </p>
          )}
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}

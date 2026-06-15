import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@summation/shared";
import {
  getAll,
  type SavedExtraction,
} from "../lib/extractions-db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Every DESIGN.md the AI has analyzed",
  description:
    "Browse every website the DESIGN.md Generator has analyzed. Each card is a real generated DESIGN.md you can open, copy, and download instantly.",
  alternates: {
    canonical: "https://www.masumi.network/tools/design-md/gallery",
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  let entries: SavedExtraction[] = [];
  try {
    entries = getAll(120);
  } catch {
    entries = [];
  }

  return (
    <>
      <Header product="masumi" />
      <main className="pt-[130px] md:pt-[140px] pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-4 mb-8 border-b border-black/[0.06]">
            <div>
              <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-1.5">
                Gallery
              </p>
              <h1 className="text-[22px] md:text-[26px] font-normal tracking-[-0.5px] text-black">
                Every DESIGN.md the AI has analyzed
              </h1>
              <p className="text-[13px] text-[#666] mt-1">
                {entries.length} brand{entries.length === 1 ? "" : "s"} —
                click any card to open its rendered DESIGN.md
              </p>
            </div>
            <Link
              href="/tools/design-md"
              className="text-[13px] text-[#666] hover:text-black underline-offset-2 hover:underline transition-colors self-start sm:self-auto"
            >
              ← Back to the tool
            </Link>
          </header>

          {entries.length === 0 ? (
            <div className="border border-dashed border-black/[0.1] rounded-[12px] py-20 text-center">
              <p className="text-[14px] text-[#666]">
                No entries yet. Be the first —{" "}
                <Link
                  href="/tools/design-md"
                  className="underline underline-offset-2 hover:text-black"
                >
                  generate one
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {entries.map((e) => (
                <GalleryCard key={e.id} entry={e} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}

function GalleryCard({ entry }: { entry: SavedExtraction }) {
  const fallbackBg = entry.primaryColor ?? "#f0f0f0";
  const created = relativeTime(entry.createdAt);
  return (
    <Link
      href={`/tools/design-md?cached=${entry.id}`}
      className="group block bg-white border border-black/[0.06] rounded-[10px] overflow-hidden hover:border-black/30 transition-colors"
    >
      <div
        className="aspect-[16/10] relative overflow-hidden"
        style={{ background: fallbackBg }}
      >
        {entry.hasScreenshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/tools/design-md/api/screenshots/${entry.id}`}
            alt={`${entry.hostname} screenshot`}
            loading="lazy"
            className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/70 text-[12px]">
            no preview
          </div>
        )}
      </div>
      <div className="p-3 md:p-4 flex items-start gap-2 min-w-0">
        {entry.primaryColor && (
          <span
            className="w-3 h-3 rounded-full flex-shrink-0 border border-black/[0.06] mt-0.5"
            style={{ background: entry.primaryColor }}
            aria-hidden
          />
        )}
        <div className="min-w-0 flex-1">
          <p
            className="text-[13px] font-medium text-black truncate"
            title={entry.name ?? entry.hostname}
          >
            {entry.name ?? entry.hostname}
          </p>
          <p className="text-[11px] text-[#999] truncate font-mono">
            {entry.hostname}
          </p>
          <p className="text-[10px] text-[#bbb] mt-0.5">{created}</p>
        </div>
      </div>
    </Link>
  );
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

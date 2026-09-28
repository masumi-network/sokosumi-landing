import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@summation/shared";
import { getAllPosts, getPostBySlug, type Category } from "@/lib/blog";
import { type Locale, localePath, alternatesFor, ui3, ui4, formatLongDate } from "@/lib/i18n";
import { LocaleSwitch } from "@/components/LocaleSwitch";

const categoryColors: Record<Category, string> = {
  announcements: "#FA008C",
  articles: "#460A23",
  "press-releases": "#FF6400",
};

const CATEGORY_KEY = {
  announcements: "catAnnouncements",
  articles: "catArticles",
  "press-releases": "catPressReleases",
} as const;

export async function blogParams() {
  try {
    return (await getAllPosts()).map((post) => ({ slug: post.slug }));
  } catch {
    // CMS unreachable at build time — pages render on demand instead.
    return [];
  }
}

export async function buildPostMetadata(
  locale: Locale,
  params: Promise<{ slug: string }>,
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, locale);
  if (!post) return { title: ui4(locale)("postNotFound") };
  return {
    alternates: alternatesFor(locale, `/blogs/${post.slug}`),
    title: post.title,
    description: post.description,
    openGraph: {
      title: `${post.title} - Masumi Blog`,
      description: post.description,
      locale: locale === "de" ? "de_DE" : "en_US",
    },
  };
}

export async function BlogPostView({
  locale,
  params,
}: {
  locale: Locale;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, locale);
  if (!post) notFound();

  return (
    <>
      <Header product="masumi" locale={locale} />
      <main className="pt-[160px] pb-24">
        <div className="max-w-[720px] mx-auto px-4 md:px-8">
          <Link
            href={localePath(locale, "/blogs")}
            className="inline-flex items-center gap-1.5 text-[13px] text-[#999] hover:text-black transition-colors mb-8"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {ui4(locale)("backToBlog")}
          </Link>

          <div>
            <span
              className="text-[11px] font-medium px-2.5 py-1 rounded-full inline-block mb-4"
              style={{
                backgroundColor: `${categoryColors[post.category]}15`,
                color: categoryColors[post.category],
              }}
            >
              {ui3(locale)(CATEGORY_KEY[post.category])}
            </span>
            <h1 className="text-[32px] md:text-[44px] font-normal tracking-[-0.8px] leading-[1.15] text-black mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-[13px] text-[#999] mb-12">
              <span>{post.author}</span>
              <span className="w-1 h-1 rounded-full bg-[#ccc]" />
              <span>
                {formatLongDate(locale, post.date)}
              </span>
            </div>
          </div>

          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.htmlContent }}
          />

          <div className="mt-14 pt-8 border-t border-black/[0.06]">
            <LocaleSwitch locale={locale} path={`/blogs/${post.slug}`} />
          </div>
        </div>
      </main>
      <Footer product="masumi" locale={locale} />
    </>
  );
}

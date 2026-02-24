import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, FadeIn } from "@summation/shared";
import { getAllPosts, getCategories, type Category } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "News, technical deep-dives, and product updates from the Masumi team. The payment network for AI agents.",
  openGraph: {
    title: "Blog | Masumi",
    description: "News, technical deep-dives, and product updates from the Masumi team.",
  },
};

const categoryColors: Record<Category, string> = {
  announcements: "#FA008C",
  articles: "#460A23",
  "press-releases": "#FF6400",
};

const categoryLabels: Record<Category, string> = {
  announcements: "Announcements",
  articles: "Articles",
  "press-releases": "Press Releases",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: activeCategory } = await searchParams;
  const allPosts = getAllPosts();
  const categories = getCategories();
  const posts = activeCategory
    ? allPosts.filter((p) => p.category === activeCategory)
    : allPosts;

  return (
    <>
      <Header product="masumi" />
      <main className="pt-[160px] pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <FadeIn>
            <h1 className="text-[40px] md:text-[56px] font-normal tracking-[-1px] leading-[1.15] text-black text-center mb-4">
              Blog
            </h1>
            <p className="text-[16px] md:text-[18px] text-[#5b5b5b] text-center max-w-[500px] mx-auto mb-12 leading-[1.5]">
              Updates, guides, and ideas from the team.
            </p>
          </FadeIn>

          {/* Category tabs */}
          <FadeIn delay={100}>
            <div className="flex items-center justify-center gap-2 mb-12">
              <Link
                href="/blogs"
                className={`text-[13px] font-medium px-4 py-2 rounded-full transition-colors ${
                  !activeCategory
                    ? "bg-black text-white"
                    : "bg-white border border-black/[0.08] text-[#666] hover:border-black/20"
                }`}
              >
                All ({allPosts.length})
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/blogs?category=${cat.name}`}
                  className={`text-[13px] font-medium px-4 py-2 rounded-full transition-colors ${
                    activeCategory === cat.name
                      ? "text-white"
                      : "bg-white border border-black/[0.08] text-[#666] hover:border-black/20"
                  }`}
                  style={
                    activeCategory === cat.name
                      ? { backgroundColor: categoryColors[cat.name] }
                      : undefined
                  }
                >
                  {categoryLabels[cat.name]} ({cat.count})
                </Link>
              ))}
            </div>
          </FadeIn>

          {/* Post grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post, i) => (
              <FadeIn key={post.slug} delay={i * 80}>
                <Link
                  href={`/blogs/${post.slug}`}
                  className="bg-white border border-black/[0.04] p-6 flex flex-col hover:border-black/10 transition-colors h-full group"
                >
                  <span
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full w-fit mb-4"
                    style={{
                      backgroundColor: `${categoryColors[post.category]}15`,
                      color: categoryColors[post.category],
                    }}
                  >
                    {categoryLabels[post.category]}
                  </span>
                  <h2 className="text-[18px] font-medium text-black leading-snug mb-2 group-hover:text-black/80 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[13px] text-[#919191] leading-[1.5] mb-4 flex-1">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-black/[0.04]">
                    <span className="text-[12px] text-[#bbb]">
                      {post.author}
                    </span>
                    <span className="text-[12px] text-[#bbb]">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>

          {posts.length === 0 && (
            <p className="text-center text-[15px] text-[#999] mt-12">
              No posts in this category yet.
            </p>
          )}
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}

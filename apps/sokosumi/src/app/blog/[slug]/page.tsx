import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, FadeIn } from "@summation/shared";
import { getAllPosts, getPostBySlug, type Category } from "@/lib/blog";

const categoryColors: Record<Category, string> = {
  announcements: "#FF6400",
  articles: "#6400FF",
};

const categoryLabels: Record<Category, string> = {
  announcements: "Announcements",
  articles: "Articles",
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} | Sokosumi Blog`,
    description: post.description,
    openGraph: {
      title: `${post.title} - Sokosumi Blog`,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <Header product="sokosumi" />
      <main className="pt-[160px] pb-24">
        <div className="max-w-[720px] mx-auto px-4 md:px-8">
          <FadeIn>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-[13px] text-[#999] hover:text-[#6400FF] transition-colors mb-8"
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
              Back to Blog
            </Link>
          </FadeIn>

          <FadeIn delay={50}>
            <span
              className="text-[11px] font-medium px-2.5 py-1 rounded-full inline-block mb-4"
              style={{
                backgroundColor: `${categoryColors[post.category]}15`,
                color: categoryColors[post.category],
              }}
            >
              {categoryLabels[post.category]}
            </span>
            <h1 className="text-[32px] md:text-[44px] font-normal tracking-[-0.8px] leading-[1.15] text-black mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-[13px] text-[#999] mb-12">
              <span>{post.author}</span>
              <span className="w-1 h-1 rounded-full bg-[#ccc]" />
              <span>
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: post.htmlContent }}
            />
          </FadeIn>
        </div>
      </main>
      <Footer product="sokosumi" />
    </>
  );
}

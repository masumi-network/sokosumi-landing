import { cmsFetch } from "./cms";

const categories = ["announcements", "articles", "press-releases"] as const;
export type Category = (typeof categories)[number];

export type PostMeta = {
  title: string;
  description: string;
  date: string;
  author: string;
  category: Category;
  slug: string;
};

export type Post = PostMeta & {
  htmlContent: string;
};

type CmsPost = {
  title: string;
  description: string;
  date: string;
  author: string;
  category: Category;
  slug: string;
  contentHtml?: string;
};

type CmsList = { docs: CmsPost[] };

function toMeta(doc: CmsPost): PostMeta {
  return {
    title: doc.title,
    description: doc.description,
    date: (doc.date || "").slice(0, 10),
    author: doc.author,
    category: doc.category,
    slug: doc.slug,
  };
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const res = await cmsFetch<CmsList>(
    "/posts?where[site][equals]=masumi&limit=100&sort=-date&depth=0",
  );
  return (res?.docs ?? []).map(toMeta);
}

export async function getPostsByCategory(category: Category): Promise<PostMeta[]> {
  return (await getAllPosts()).filter((p) => p.category === category);
}

export async function getCategories(): Promise<{ name: Category; count: number }[]> {
  const all = await getAllPosts();
  return categories.map((name) => ({
    name,
    count: all.filter((p) => p.category === name).length,
  }));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const res = await cmsFetch<CmsList>(
    `/posts?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=0`,
  );
  const doc = res?.docs?.[0];
  if (!doc) return null;
  return { ...toMeta(doc), htmlContent: doc.contentHtml ?? "" };
}

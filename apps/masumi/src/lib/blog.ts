import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const contentDir = path.join(process.cwd(), "content");

const categories = ["announcements", "tutorials", "blogs"] as const;
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

function readPostMeta(filePath: string, category: Category): PostMeta {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  const slug = path.basename(filePath, ".md");
  return {
    title: data.title ?? "",
    description: data.description ?? "",
    date: data.date ?? "",
    author: data.author ?? "",
    category,
    slug,
  };
}

export function getAllPosts(): PostMeta[] {
  const posts: PostMeta[] = [];
  for (const category of categories) {
    const dir = path.join(contentDir, category);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      posts.push(readPostMeta(path.join(dir, file), category));
    }
  }
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostsByCategory(category: Category): PostMeta[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getCategories(): { name: Category; count: number }[] {
  const all = getAllPosts();
  return categories.map((name) => ({
    name,
    count: all.filter((p) => p.category === name).length,
  }));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  for (const category of categories) {
    const filePath = path.join(contentDir, category, `${slug}.md`);
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(content);
    return {
      title: data.title ?? "",
      description: data.description ?? "",
      date: data.date ?? "",
      author: data.author ?? "",
      category,
      slug,
      htmlContent: String(result),
    };
  }
  return null;
}

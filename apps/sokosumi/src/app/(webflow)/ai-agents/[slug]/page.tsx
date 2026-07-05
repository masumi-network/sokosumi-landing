import type { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import { listAiAgentSlugs, loadWebflowPage } from "@/lib/webflow";
import { WebflowRender } from "@/components/WebflowRender";

const CONTENT_DIR = path.join(process.cwd(), "src/content/webflow/ai-agents");

function htmlExists(slug: string): boolean {
  return fs.existsSync(path.join(CONTENT_DIR, `${slug}.html`));
}

export function generateStaticParams(): { slug: string }[] {
  return listAiAgentSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!htmlExists(slug)) return {};
  const data = loadWebflowPage(`ai-agents/${slug}.html`);
  return { title: data.title, description: data.description };
}

export default async function AiAgentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!htmlExists(slug)) notFound();
  const data = loadWebflowPage(`ai-agents/${slug}.html`);
  return <WebflowRender data={data} />;
}

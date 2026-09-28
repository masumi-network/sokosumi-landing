import type { Metadata } from "next";
import { BlogPostView, buildPostMetadata, blogParams } from "./view";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = blogParams;

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildPostMetadata("en", params);
}

export default function Page({ params }: Props) {
  return <BlogPostView locale="en" params={params} />;
}

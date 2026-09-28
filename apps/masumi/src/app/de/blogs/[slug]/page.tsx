import type { Metadata } from "next";
import { BlogPostView, buildPostMetadata, blogParams } from "../../../blogs/[slug]/view";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = blogParams;

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildPostMetadata("de", params);
}

export default function Page({ params }: Props) {
  return <BlogPostView locale="de" params={params} />;
}

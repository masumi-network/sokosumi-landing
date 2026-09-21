import { BlogIndexView, buildMetadata } from "./view";

type Props = { searchParams: Promise<{ category?: string }> };

export const metadata = buildMetadata("en");

export default function Page({ searchParams }: Props) {
  return <BlogIndexView locale="en" searchParams={searchParams} />;
}

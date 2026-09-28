import { BlogIndexView, buildMetadata } from "../../blogs/view";

type Props = { searchParams: Promise<{ category?: string }> };

export const metadata = buildMetadata("de");

export default function Page({ searchParams }: Props) {
  return <BlogIndexView locale="de" searchParams={searchParams} />;
}

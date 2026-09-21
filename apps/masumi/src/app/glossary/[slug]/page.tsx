import type { Metadata } from "next";
import { GlossaryTermView, buildTermMetadata, glossaryParams } from "./view";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = glossaryParams;

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildTermMetadata("en", params);
}

export default function Page({ params }: Props) {
  return <GlossaryTermView locale="en" params={params} />;
}

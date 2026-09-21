import type { Metadata } from "next";
import { GlossaryTermView, buildTermMetadata, glossaryParams } from "../../../glossary/[slug]/view";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = glossaryParams;

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildTermMetadata("de", params);
}

export default function Page({ params }: Props) {
  return <GlossaryTermView locale="de" params={params} />;
}

import type { Metadata } from "next";
import { loadWebflowPage } from "@/lib/webflow";
import { WebflowRender } from "@/components/WebflowRender";

const SOURCE = "imprint.html";

export async function generateMetadata(): Promise<Metadata> {
  const data = loadWebflowPage(SOURCE);
  return { title: data.title, description: data.description };
}

export default function Page() {
  return <WebflowRender data={loadWebflowPage(SOURCE)} />;
}

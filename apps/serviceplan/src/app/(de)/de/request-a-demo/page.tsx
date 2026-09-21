import DemoPage from "@/components/DemoPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  route: "demo",
  locale: "de",
  title: "Demo anfragen | Serviceplan Agents",
  description:
    "Sehen Sie die Serviceplan Agents an Ihrer eigenen Marke arbeiten. Eine Live-Demo entlang der aktuellen Marketingfragen Ihres Teams — ohne Verkaufsgespräch.",
});

export default function Page() {
  return <DemoPage locale="de" />;
}

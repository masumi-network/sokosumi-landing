import DemoPage from "@/components/DemoPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  route: "demo",
  locale: "en",
  title: "Request a Demo | Serviceplan Agents",
  description:
    "See Serviceplan Agents run against your own brand and workflow. A live walkthrough built around your team's current marketing questions — no sales pitch.",
});

export default function Page() {
  return <DemoPage locale="en" />;
}

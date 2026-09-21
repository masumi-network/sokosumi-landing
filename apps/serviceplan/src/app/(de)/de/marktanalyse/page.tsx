import LandingPage from "@/components/landing/LandingPage";
import content from "@/content/landing/marketAnalysis";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  route: "marketAnalysis",
  locale: "de",
  title: content.de.title,
  description: content.de.description,
});

export default function Page() {
  return <LandingPage content={content.de} locale="de" route="marketAnalysis" />;
}

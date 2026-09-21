import LandingPage from "@/components/landing/LandingPage";
import content from "@/content/landing/marketAnalysis";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  route: "marketAnalysis",
  locale: "en",
  title: content.en.title,
  description: content.en.description,
});

export default function Page() {
  return <LandingPage content={content.en} locale="en" route="marketAnalysis" />;
}

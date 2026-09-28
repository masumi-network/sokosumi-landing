import LandingPage from "@/components/landing/LandingPage";
import content from "@/content/landing/freeAnalysis";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  route: "freeAnalysis",
  locale: "en",
  title: content.en.title,
  description: content.en.description,
});

export default function Page() {
  return <LandingPage content={content.en} locale="en" route="freeAnalysis" />;
}

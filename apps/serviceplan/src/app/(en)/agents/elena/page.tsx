import LandingPage from "@/components/landing/LandingPage";
import content from "@/content/landing/agentElena";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  route: "agentElena",
  locale: "en",
  title: content.en.title,
  description: content.en.description,
});

export default function Page() {
  return <LandingPage content={content.en} locale="en" route="agentElena" />;
}

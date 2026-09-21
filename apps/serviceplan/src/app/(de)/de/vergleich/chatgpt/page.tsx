import LandingPage from "@/components/landing/LandingPage";
import content from "@/content/landing/vsChatgpt";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  route: "vsChatgpt",
  locale: "de",
  title: content.de.title,
  description: content.de.description,
});

export default function Page() {
  return <LandingPage content={content.de} locale="de" route="vsChatgpt" />;
}

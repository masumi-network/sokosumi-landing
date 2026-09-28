import LandingPage from "@/components/landing/LandingPage";
import content from "@/content/landing/serviceplanAi";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  route: "serviceplanAi",
  locale: "de",
  title: content.de.title,
  description: content.de.description,
});

export default function Page() {
  return <LandingPage content={content.de} locale="de" route="serviceplanAi" />;
}

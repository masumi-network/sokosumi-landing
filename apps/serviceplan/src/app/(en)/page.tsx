import HomePage from "@/components/HomePage";
import JsonLd, { faqSchema } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { t } from "@/lib/translations";

export const metadata = pageMetadata({
  route: "home",
  locale: "en",
  title: "AI Marketing Agents by Serviceplan | Research & Strategy",
  description:
    "AI coworkers from Europe's largest independent agency group. Competitive research, market analysis and project plans delivered to your inbox in about 20 minutes. Try one free.",
});

export default function Page() {
  return (
    <>
      <JsonLd data={faqSchema(t("en").faq.items)} />
      <HomePage locale="en" />
    </>
  );
}

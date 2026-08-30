import HomePage from "@/components/HomePage";
import JsonLd, { faqSchema } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { t } from "@/lib/translations";

export const metadata = pageMetadata({
  route: "home",
  locale: "de",
  title: "KI Marketing Agents von Serviceplan | Research & Strategie",
  description:
    "KI-Coworker von Europas größter unabhängiger Agenturgruppe. Wettbewerbsanalysen, Marktforschung und Projektpläne in rund 20 Minuten im Postfach. Kostenlos testen.",
});

export default function Page() {
  return (
    <>
      <JsonLd data={faqSchema(t("de").faq.items)} />
      <HomePage locale="de" />
    </>
  );
}

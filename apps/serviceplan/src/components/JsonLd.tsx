import { SITE_URL, absolute } from "@/lib/seo";
import { ROUTES, Locale } from "@/lib/routes";

type Json = Record<string, unknown>;

export default function JsonLd({ data }: { data: Json | Json[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export function organizationSchema(locale: Locale): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "Serviceplan Agents",
    url: absolute(ROUTES.home[locale]),
    logo: absolute("/images/sp-logo.png"),
    description:
      locale === "de"
        ? "KI-Coworker fuer Marketing-Research, Projektmanagement und Strategie, entwickelt von Plan.Net Studios der Serviceplan Group."
        : "AI coworkers for marketing research, project management and strategy, built by Plan.Net Studios of the Serviceplan Group.",
    email: "support@serviceplan-agents.com",
    parentOrganization: {
      "@type": "Organization",
      name: "Serviceplan Group",
      url: "https://www.house-of-communication.com/",
    },
    sameAs: [
      "https://www.sokosumi.com/",
      "https://www.house-of-communication.com/",
    ],
  };
}

export function websiteSchema(locale: Locale): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: absolute(ROUTES.home[locale]),
    name: "Serviceplan Agents",
    inLanguage: locale,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function faqSchema(
  items: readonly { readonly question: string; readonly answer: string }[]
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbSchema(
  trail: readonly { name: string; path: string }[]
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  };
}

export function serviceSchema({
  name,
  description,
  path,
  locale,
}: {
  name: string;
  description: string;
  path: string;
  locale: Locale;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: absolute(path),
    inLanguage: locale,
    provider: { "@id": ORGANIZATION_ID },
    areaServed: ["DE", "AT", "CH", "EU"],
  };
}

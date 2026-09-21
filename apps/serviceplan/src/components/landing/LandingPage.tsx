import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnalysisForm from "@/components/landing/AnalysisForm";
import JsonLd, {
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
} from "@/components/JsonLd";
import { ROUTES, RouteKey, Locale } from "@/lib/routes";
import type { LandingContent, Section } from "@/lib/landing/types";

function SectionBlock({
  section,
  locale,
}: {
  section: Section;
  locale: Locale;
}) {
  switch (section.type) {
    case "prose":
      return (
        <section className="lp-section">
          <h2 className="lp-h2">{section.heading}</h2>
          {section.body.map((p, i) => (
            <p key={i} className="lp-body">
              {p}
            </p>
          ))}
        </section>
      );

    case "cards":
      return (
        <section className="lp-section">
          <h2 className="lp-h2">{section.heading}</h2>
          {section.intro && <p className="lp-body">{section.intro}</p>}
          <div className="lp-cards">
            {section.items.map((item) => (
              <div key={item.title} className="lp-card">
                <h3 className="lp-card-title">{item.title}</h3>
                <p className="lp-card-text">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      );

    case "steps":
      return (
        <section className="lp-section">
          <h2 className="lp-h2">{section.heading}</h2>
          {section.intro && <p className="lp-body">{section.intro}</p>}
          <ol className="lp-steps">
            {section.items.map((item, i) => (
              <li key={item.title} className="lp-step">
                <span className="lp-step-num">{i + 1}</span>
                <div>
                  <h3 className="lp-card-title">{item.title}</h3>
                  <p className="lp-card-text">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      );

    case "spec":
      return (
        <section className="lp-section">
          <h2 className="lp-h2">{section.heading}</h2>
          {section.intro && <p className="lp-body">{section.intro}</p>}
          <dl className="lp-spec">
            {section.rows.map((row) => (
              <div key={row.label} className="lp-spec-row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      );

    case "faq":
      return (
        <section className="lp-section">
          <h2 className="lp-h2">{section.heading}</h2>
          <div className="lp-faq">
            {section.items.map((item) => (
              <div key={item.question} className="lp-faq-item">
                <h3 className="lp-faq-q">{item.question}</h3>
                <p className="lp-card-text">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      );

    case "quote":
      return (
        <figure className="lp-quote">
          <blockquote>{section.text}</blockquote>
          <figcaption>{section.attribution}</figcaption>
        </figure>
      );

    case "links":
      return (
        <section className="lp-section">
          <h2 className="lp-h2">{section.heading}</h2>
          {section.intro && <p className="lp-body">{section.intro}</p>}
          <div className="lp-cards">
            {section.items.map((item) => (
              <a
                key={item.route}
                href={ROUTES[item.route][locale]}
                className="lp-card lp-card-link"
              >
                <h3 className="lp-card-title">{item.label}</h3>
                <p className="lp-card-text">{item.text}</p>
              </a>
            ))}
          </div>
        </section>
      );
  }
}

export default function LandingPage({
  content,
  locale,
  route,
}: {
  content: LandingContent;
  locale: Locale;
  route: RouteKey;
}) {
  const home = ROUTES.home[locale];
  const path = ROUTES[route][locale];
  const faq = content.sections.find((s) => s.type === "faq");

  const schemas = [
    serviceSchema({
      name: content.h1,
      description: content.description,
      path,
      locale,
    }),
    ...(faq && faq.type === "faq" ? [faqSchema(faq.items)] : []),
    ...(content.breadcrumb
      ? [
          breadcrumbSchema([
            { name: "Serviceplan Agents", path: home },
            {
              name: content.breadcrumb.parentName,
              path: ROUTES[content.breadcrumb.parent][locale],
            },
            { name: content.breadcrumb.name, path },
          ]),
        ]
      : [
          breadcrumbSchema([
            { name: "Serviceplan Agents", path: home },
            { name: content.h1, path },
          ]),
        ]),
  ];

  return (
    <div className="page-wrapper">
      <JsonLd data={schemas} />
      <div className="main-wrapper">
        <div className="section_demo-hero">
          <div className="her-section-wrap-demo">
            <Navbar locale={locale} homeHref={home} variant="static" />
            <header className="lp-hero">
              {content.eyebrow && (
                <p className="lp-eyebrow">{content.eyebrow}</p>
              )}
              <h1 className="lp-h1">{content.h1}</h1>
              <p className="lp-lede">{content.lede}</p>
            </header>
          </div>
        </div>

        <main className="lp-main">
          {content.sections.map((section, i) => (
            <SectionBlock key={i} section={section} locale={locale} />
          ))}
        </main>

        <section id="free-analysis">
          <div className="padding-global">
            <div className="padding-section-medium">
              <div className="container-large">
                <div className="lp-cta">
                  <div className="lp-cta-inner">
                    <h2 className="lp-cta-heading">{content.cta.heading}</h2>
                    <p className="lp-cta-text">{content.cta.text}</p>
                    <AnalysisForm locale={locale} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer locale={locale} />
      </div>
    </div>
  );
}

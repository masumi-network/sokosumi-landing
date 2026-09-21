import { Locale, t } from "@/lib/translations";
import { ROUTES } from "@/lib/routes";
import { NAV_LABEL, FOOTER_PRODUCT, FOOTER_RESOURCES } from "@/lib/landing/nav";

export default function Footer({ locale = "en" }: { locale?: Locale }) {
  const tt = t(locale).footer;
  const home = locale === "de" ? "/de" : "/";
  const link = (key: (typeof FOOTER_PRODUCT)[number]) => (
    <a key={key} href={ROUTES[key][locale]} className="footer-links">
      {NAV_LABEL[key]![locale]}
    </a>
  );

  return (
    <div className="div-block-38">
      <div className="padding-global">
        <div className="padding-section-large">
          <div className="container-large">
            <div className="grid-container-3x1">
              <div className="footer-content-wrat">
                <div className="fiiter-link-header">{tt.column1Header}</div>
                <div className="spacer-large"></div>
                {FOOTER_PRODUCT.map(link)}
                <a href={`${home}#pricing`} className="footer-links">
                  {tt.pricing}
                </a>
                <a
                  href="https://www.sokosumi.com/"
                  target="_blank"
                  className="footer-links"
                >
                  Sokosumi
                </a>
              </div>
              <div className="footer-content-wrat">
                <div className="fiiter-link-header">{tt.column2Header}</div>
                <div className="spacer-large"></div>
                {FOOTER_RESOURCES.map(link)}
                <a href={`${home}#faq`} className="footer-links">
                  FAQ
                </a>
                <a href={tt.contactHref} className="footer-links">
                  {tt.contact}
                </a>
              </div>
              <div className="footer-content-wrat">
                <div className="fiiter-link-header">{tt.column3Header}</div>
                <div className="spacer-large"></div>
                <a
                  href="https://www.sokosumi.com/imprint"
                  target="_blank"
                  className="footer-links"
                >
                  {tt.imprint}
                </a>
                <a
                  href="https://www.sokosumi.com/privacy-policy"
                  target="_blank"
                  className="footer-links"
                >
                  {tt.privacyPolicy}
                </a>
                <a
                  href="https://www.sokosumi.com/terms-of-service"
                  target="_blank"
                  className="footer-links"
                >
                  {tt.termsOfService}
                </a>
                <a
                  href="https://www.sokosumi.com/cookie-policy"
                  target="_blank"
                  className="footer-links"
                >
                  {tt.cookiePolicy}
                </a>
                <a
                  href="https://www.house-of-communication.com/de/en/brands/plan-net/landingpages/agentic-services/legal-ai-coworkers.html"
                  target="_blank"
                  className="footer-links"
                >
                  Serviceplan Agents Legal
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="container-large">
          <div className="text-size-regular is-white">
            Serviceplan Agents – Ihre KI-gest&uuml;tzten Agenten f&uuml;r smarte
            Kommunikation und digitale Transformation.
          </div>
          <div className="spacer-medium"></div>
          <div className="text-size-regular is-white">
            &copy; 2026 Plan.Net Studios GmbH &amp; Co. KG — A Serviceplan
            Group company
          </div>
          <div className="spacer-medium"></div>
        </div>
      </div>
    </div>
  );
}

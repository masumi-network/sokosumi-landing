"use client";

import { FormEvent } from "react";
import { submitAnalysisForm } from "@/lib/submitForm";
import { Locale, t } from "@/lib/translations";

const DashIcon = () => (
  <svg width="21" height="2" viewBox="0 0 21 2" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 1H5" stroke="#060606" strokeWidth="2" />
    <path d="M8 1H13" stroke="#060606" strokeWidth="2" />
    <path d="M16 1H21" stroke="#060606" strokeWidth="2" />
  </svg>
);

export default function Comparison({ locale = "en" }: { locale?: Locale }) {
  const tt = t(locale).comparison;

  const normalizeUrl = (url: string): string => {
    const trimmed = url.trim();
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    let websiteUrl = formData.get("URL") as string;
    if (websiteUrl) {
      websiteUrl = normalizeUrl(websiteUrl);
    }
    await submitAnalysisForm(
      formData.get("Email") as string,
      websiteUrl,
    );
    window.dispatchEvent(new Event("showThankYouModal"));
    form.reset();
  };

  return (
    <>
      <div className="container-40">
        <div className="header-style">
          <div className="title-style-3">
            <strong>{tt.heading}</strong>
          </div>
          <div className="sub-text-price">
            {tt.subheading}
          </div>
        </div>
        <div className="table-style">
          <div className="row">
            <div className="table-item">
              <div className="column-title">{tt.columnFeature}</div>
            </div>
            <div className="table-item-2">
              <div className="column-title">{tt.columnServiceplan}</div>
            </div>
            <div className="table-item-2">
              <div className="column-title">
                {tt.columnChatgpt}<br />
              </div>
            </div>
          </div>
          {tt.features.map((feature, index) => {
            const isLast = index === tt.features.length - 1;
            return (
              <div key={feature.name} className="row-2">
                <div className={isLast ? "table-item-3" : "table-item-3"}>
                  <div className="column-title">{feature.name}</div>
                  <div className="description-3">{feature.description}</div>
                </div>
                <div className={isLast ? "table-item-5" : "table-item-4"}>
                  <div className="plus w-embed">
                    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M16 2.1143L5.33333 13.3906L0 7.75243L2 5.63813L5.33333 9.16196L14 0L16 2.1143Z" fill="#8FC49F"/>
                    </svg>
                  </div>
                </div>
                <div className={isLast ? "table-item-5" : "table-item-4"}>
                  <div className="dash w-embed">
                    <DashIcon />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="spacer-xlarge"></div>
      <div className="mid-cta-wrapper">
        <div className="mid-cta-text-wrap">
          <h3 className="heading-style-h2 is-white">
            {tt.midCtaHeading}
          </h3>
          <div className="text-size-regular is-white">
            {tt.midCtaDescription}<br />
          </div>
          <div className="form-glass-wrap mid-cta">
            <div id="get-free-analysis" className="glass-effect-form-new">
              <form
                id="wf-form-Get-Free-Analysis-mid"
                name="wf-form-Get-Free-Analysis-mid-2"
                method="get"
                className="form"
                onSubmit={handleSubmit}
              >
                <div>
                  <div>
                    <div className="spacer-small"></div>
                    <div className="div-block-9">
                      <div>
                        <div className="email-form-content-wrap">
                          <div className="form-input-wrap">
                            <label htmlFor="URL" className="form_label">
                              {tt.midCtaUrlLabel}
                            </label>
                            <input
                              className="form_input w-input"
                              maxLength={256}
                              name="URL"
                              placeholder={tt.midCtaUrlPlaceholder}
                              type="text"
                              id="URL"
                              required
                            />
                          </div>
                          <div className="form-input-wrap">
                            <label htmlFor="Email" className="form_label">
                              {tt.midCtaEmailLabel}
                            </label>
                            <input
                              className="form_input w-input"
                              maxLength={256}
                              name="Email"
                              placeholder={tt.midCtaEmailPlaceholder}
                              type="email"
                              id="Email"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="div-block-10">
                        <input
                          type="submit"
                          className="button is-red w-button"
                          value={tt.midCtaButton}
                        />
                        <div className="spacer-small"></div>
                        <div className="text-size-tiny text-style-italic is-white" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' }}>
                          {tt.midCtaDisclaimer}{" "}
                          <a
                            href="https://www.sokosumi.com/privacy-policy"
                            target="_blank"
                            className="links-legal"
                            rel="noreferrer"
                          >
                            {tt.midCtaDisclaimerPrivacy}
                          </a>
                          {" "}{tt.midCtaDisclaimerAnd}{" "}
                          <a
                            href="https://www.sokosumi.com/terms-of-service"
                            target="_blank"
                            className="links-legal"
                            rel="noreferrer"
                          >
                            {tt.midCtaDisclaimerTos}
                          </a>
                          {" · "}
                          <a
                            href="https://www.house-of-communication.com/de/en/brands/plan-net/landingpages/agentic-services/legal-ai-coworkers.html"
                            target="_blank"
                            className="links-legal"
                            rel="noreferrer"
                          >
                            Serviceplan Agents Legal
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

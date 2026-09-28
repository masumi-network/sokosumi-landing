"use client";

import { FormEvent, useState } from "react";
import { submitAnalysisForm } from "@/lib/submitForm";
import { Locale, t } from "@/lib/translations";

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed && !/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

/** The free-analysis capture form, reused as the CTA on every landing page. */
export default function AnalysisForm({ locale }: { locale: Locale }) {
  const tt = t(locale).comparison;
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const url = (form.elements.namedItem("URL") as HTMLInputElement).value;
    const email = (form.elements.namedItem("Email") as HTMLInputElement).value;
    await submitAnalysisForm(email, normalizeUrl(url));
    setSent(true);
    form.reset();
  }

  if (sent) {
    return (
      <div className="lp-form-done text-size-regular is-white">
        {t(locale).modal.heading} {t(locale).modal.subheading}
      </div>
    );
  }

  return (
    <form className="lp-form" onSubmit={handleSubmit}>
      <div className="lp-form-fields">
        <div className="form-input-wrap">
          <label htmlFor="lp-url" className="form_label">
            {tt.midCtaUrlLabel}
          </label>
          <input
            className="form_input w-input"
            maxLength={256}
            name="URL"
            id="lp-url"
            type="text"
            placeholder={tt.midCtaUrlPlaceholder}
            required
          />
        </div>
        <div className="form-input-wrap">
          <label htmlFor="lp-email" className="form_label">
            {tt.midCtaEmailLabel}
          </label>
          <input
            className="form_input w-input"
            maxLength={256}
            name="Email"
            id="lp-email"
            type="email"
            placeholder={tt.midCtaEmailPlaceholder}
            required
          />
        </div>
      </div>
      <input type="submit" className="button is-red w-button" value={tt.midCtaButton} />
      <p className="lp-form-legal">
        {tt.midCtaDisclaimer}{" "}
        <a href="https://www.sokosumi.com/privacy-policy" target="_blank" rel="noopener">
          {tt.midCtaDisclaimerPrivacy}
        </a>{" "}
        {tt.midCtaDisclaimerAnd}{" "}
        <a href="https://www.sokosumi.com/terms-of-service" target="_blank" rel="noopener">
          {tt.midCtaDisclaimerTos}
        </a>
      </p>
    </form>
  );
}

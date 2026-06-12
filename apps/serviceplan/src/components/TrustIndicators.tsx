import { Locale, t } from "@/lib/translations";

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 16C3.58125 16 0 12.4187 0 8C0 3.58125 3.58125 0 8 0C12.4187 0 16 3.58125 16 8C16 12.4187 12.4187 16 8 16ZM11.6875 4.55312C11.3531 4.30937 10.8844 4.38438 10.6406 4.71875L6.90938 9.85L5.28125 8.22188C4.9875 7.92813 4.5125 7.92813 4.22188 8.22188C3.93125 8.51563 3.92813 8.99062 4.22188 9.28125L6.47188 11.5312C6.62813 11.6875 6.84062 11.7656 7.05937 11.75C7.27812 11.7344 7.47812 11.6219 7.60625 11.4438L11.8531 5.6C12.0969 5.26562 12.0219 4.79687 11.6875 4.55312Z" fill="white"/>
  </svg>
);

export default function TrustIndicators({ locale = "en" }: { locale?: Locale }) {
  const tt = t(locale).trustIndicators;

  return (
    <div className="key-features">
      <div className="grid-container-5x1">
        {/* 1. Largest in Europe */}
        <div>
          <div className="div-block-3-copy">
            <div className="icon w-embed">
              <CheckIcon />
            </div>
            <div className="features-head">{tt.largestInEurope}</div>
          </div>
          <div className="spacer-xsmall"></div>
          <div className="trust-logos w-embed">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/trust-serviceplan-group.svg" alt="Serviceplan Group Communications" />
          </div>
        </div>

        {/* 2. Hosted in Germany */}
        <div>
          <div className="div-block-3-copy">
            <div className="icon w-embed">
              <CheckIcon />
            </div>
            <div className="features-head">{tt.hostedInGermany}</div>
          </div>
          <div className="spacer-xsmall"></div>
          <div className="trust-logos w-embed">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/trust-microsoft-azure.svg" alt="Microsoft Azure" />
          </div>
        </div>

        {/* 3. Fully GDPR-compliant */}
        <div>
          <div className="div-block-3-copy">
            <div className="icon w-embed">
              <CheckIcon />
            </div>
            <div className="features-head">{tt.gdprCompliant}</div>
          </div>
          <div className="spacer-xsmall"></div>
          <div className="trust-logos w-embed">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/trust-gdpr-compliant.svg" alt="GDPR Compliant" />
          </div>
        </div>

        {/* 4. Identity & Accountability */}
        <div>
          <div className="div-block-3-copy">
            <div className="icon w-embed">
              <CheckIcon />
            </div>
            <div className="features-head">{tt.identityAccountability}</div>
          </div>
          <div className="spacer-xsmall"></div>
          <div className="trust-logos w-embed">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/trust-masumi.svg" alt="Masumi Network" />
          </div>
        </div>

        {/* 5. EU AI Act compliant */}
        <div>
          <div className="div-block-3-copy">
            <div className="icon w-embed">
              <CheckIcon />
            </div>
            <div className="features-head">{tt.euAiAct}</div>
          </div>
          <div className="spacer-xsmall"></div>
          <div className="trust-logos w-embed">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/trust-eu-ai-act.svg" alt="EU AI Act" />
          </div>
        </div>
      </div>
    </div>
  );
}

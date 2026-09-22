"use client";

import { FormEvent, useState } from "react";
import { submitLpAnalysis, sendDemoNotification } from "@/lib/submitForm";
import SpLogo from "@/components/SpLogo";
import { COMPANY_LOGOS } from "@/components/lp/logos";
import type { LpContent } from "@/components/lp/types";

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed && !/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function scrollToForm() {
  document
    .getElementById("starten")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ArrowCircle() {
  return (
    <span className="ag-arrow-circle" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12h14m0 0-6-6m6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function LpPage({ content: c }: { content: LpContent }) {
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [taskState, setTaskState] = useState<
    "idle" | "sending" | "done" | "error"
  >("idle");

  const [demo, setDemo] = useState({ name: "", org: "", email: "", topic: "" });
  const [demoState, setDemoState] = useState<
    "idle" | "sending" | "done" | "error"
  >("idle");

  async function handleAnalysisSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (taskState === "sending") return;
    setTaskState("sending");
    const ok = await submitLpAnalysis(
      email,
      normalizeUrl(websiteUrl),
      c.source,
      c.locale
    );
    setTaskState(ok ? "done" : "error");
  }

  async function handleDemoSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (demoState === "sending") return;
    setDemoState("sending");
    const ok = await sendDemoNotification({
      name: demo.name,
      email: demo.email,
      websiteUrl: demo.org,
      category: demo.topic || `Demo (${c.source} LP, ${c.locale})`,
      source: c.source,
      locale: c.locale,
    });
    setDemoState(ok ? "done" : "error");
  }

  const otherLocale = c.locale === "de" ? "en" : "de";

  return (
    <div className="ag">
      {/* ===== 1 Header ===== */}
      <div className="ag-stage">
        <div className="ag-stage-inner">
          <div className="ag-topbar">
            <a
              href={c.locale === "de" ? "/de" : "/"}
              className="ag-lockup"
              aria-label="Serviceplan Agents Startseite"
            >
              <SpLogo />
            </a>
            <div className="ag-topbar-cta">
              <a href={c.paths[otherLocale]} className="ag-navlink ag-langlink">
                {otherLocale.toUpperCase()}
              </a>
              <a href="#demo" className="ag-navlink">
                {c.topbar.demoLink}
              </a>
              <a href="#starten" className="ag-btn ag-btn-red ag-btn-nav">
                {c.topbar.cta}
              </a>
            </div>
          </div>

          <section className="ag-header">
            <div className="ag-hdr">
              <div className="ag-hdr-copy">
                <p className="ag-eyebrow">{c.hero.eyebrow}</p>
                <h1>
                  {c.hero.h1}
                  <span className="ag-soft">{c.hero.h1Sub}</span>
                </h1>
                <ul className="ag-bullets">
                  {c.hero.bullets.map((b) => (
                    <li key={b.lead}>
                      {b.lead} <span>{b.rest}</span>
                    </li>
                  ))}
                </ul>
                <div className="ag-btn-row">
                  <a href="#starten" className="ag-btn ag-btn-red">
                    {c.hero.ctaPrimary}
                  </a>
                  <a href="#demo" className="ag-btn ag-btn-white">
                    {c.hero.ctaSecondary}
                    <ArrowCircle />
                  </a>
                </div>
                <div className="ag-badges">
                  {c.hero.badges.map((b) => (
                    <span key={b} className="ag-badge">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="ag-hdr-visual" aria-hidden="true">
                <div className="ag-hero-img">
                  <div className="ag-hero-blob">
                    <svg viewBox="0 0 1273 970" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g filter="url(#ag_blob_green)">
                        <circle cx="915.243" cy="638.244" r="238.301" transform="rotate(57.6859 915.243 638.244)" fill="#8FC49F" />
                      </g>
                      <g filter="url(#ag_blob_red)">
                        <circle cx="500.467" cy="500.467" r="252.234" transform="rotate(57.6859 500.467 500.467)" fill="url(#ag_blob_red_grad)" />
                      </g>
                      <defs>
                        <filter id="ag_blob_green" x="428.712" y="151.712" width="973.064" height="973.063" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                          <feFlood floodOpacity="0" result="BackgroundImageFix" />
                          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                          <feGaussianBlur stdDeviation="124.1" result="effect1_foregroundBlur" />
                        </filter>
                        <filter id="ag_blob_red" x="0" y="0" width="1000.93" height="1000.93" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                          <feFlood floodOpacity="0" result="BackgroundImageFix" />
                          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                          <feGaussianBlur stdDeviation="124.1" result="effect1_foregroundBlur" />
                        </filter>
                        <linearGradient id="ag_blob_red_grad" x1="406.101" y1="282.331" x2="616.487" y2="968.052" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#FF9194" />
                          <stop offset="1" stopColor="#FF4B4F" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/agents.webp"
                    alt=""
                    loading="eager"
                    className="ag-agents-img"
                  />
                </div>
              </div>
            </div>

            <div className="ag-seq" aria-hidden="true">
              <div className="ag-seq-node">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="14" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
                {c.hero.seq[0]}
              </div>
              <div className="ag-seq-arrow">→</div>
              <div className="ag-seq-node">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20c1.2-3.4 3.9-5 7-5s5.8 1.6 7 5" />
                </svg>
                {c.hero.seq[1]}
              </div>
              <div className="ag-seq-arrow">→</div>
              <div className="ag-seq-node">
                <svg viewBox="0 0 24 24">
                  <path d="M6 3h8l4 4v14H6z" />
                  <path d="M14 3v4h4" />
                  <path d="M9 13h6M9 16h6" />
                </svg>
                {c.hero.seq[2]}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ===== 2 Use Cases ===== */}
      <section id="cases" className="ag-section">
        <div className="ag-wrap">
          <div className="ag-band">
            <h2 className="ag-h2">{c.problem.h2}</h2>
            <p className="ag-lead">{c.problem.lead}</p>
            <div className="ag-band-grid">
              {c.problem.items.map((item) => (
                <p key={item.ref} className="ag-band-item">
                  {item.text}
                  <span>{item.ref}</span>
                </p>
              ))}
            </div>
            <p className="ag-bridge">{c.problem.bridge}</p>
          </div>

          <div className="ag-rail-hint">
            <h3 className="ag-h3">{c.rail.heading}</h3>
            <span>{c.rail.hint}</span>
          </div>

          <div className="ag-rail">
            {c.cases.map((k) => (
              <article key={k.num} className="ag-case">
                <div className="ag-case-head">
                  <div className="ag-case-topline">
                    <p className="ag-case-num">{k.num}</p>
                    <span className="ag-case-agents">
                      {k.agents.map((a) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={a.src} src={a.src} alt={a.alt} />
                      ))}
                      <small>{k.agentLabel}</small>
                    </span>
                  </div>
                  <h3 className="ag-h3">{k.title}</h3>
                  <p className="ag-case-benefit">{k.benefit}</p>
                </div>
                <div className="ag-case-body">
                  <h4>{k.mailHeading}</h4>
                  <div className="ag-mail">
                    <div className="ag-mail-hdr">
                      <b>{c.locale === "de" ? "An:" : "To:"}</b> {k.mailTo}
                      <br />
                      <b>{c.locale === "de" ? "Betreff:" : "Subject:"}</b>{" "}
                      {k.mailSubject}
                    </div>
                    <p className="ag-mail-body">
                      {k.mailBody}
                      {k.mailForwarded && (
                        <>
                          <br />
                          <br />
                          <span className="ag-faint">
                            {c.locale === "de"
                              ? "--- Weitergeleitete Nachricht ---"
                              : "--- Forwarded message ---"}
                            <br />
                            {k.mailForwarded}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <h4>{k.stepsHeading}</h4>
                  <ol className="ag-steps">
                    {k.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                  <h4>{k.resultHeading}</h4>
                  <ul className="ag-result">
                    {k.results.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                  <p className="ag-case-facts">
                    {k.facts.map((f) => (
                      <span key={f.label}>
                        <b>{f.label}</b> {f.value}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="ag-case-foot">
                  {k.foot.kind === "start" ? (
                    <button
                      type="button"
                      className="ag-btn ag-btn-red ag-btn-case"
                      onClick={scrollToForm}
                    >
                      {k.foot.label}
                    </button>
                  ) : (
                    <>
                      <p className="ag-case-later">{k.foot.note}</p>
                      <a href="#demo" className="ag-textlink">
                        {k.foot.linkLabel}
                      </a>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4 Free start (primary conversion) ===== */}
      <section id="starten" className="ag-section">
        <div className="ag-wrap">
          <div className="ag-form-stage">
            <div className="ag-form-wrap">
              <div className="ag-head ag-center">
                <p className="ag-eyebrow">{c.form.eyebrow}</p>
                <h2 className="ag-h2 ag-h2-ondark">{c.form.h2}</h2>
                <p className="ag-lead ag-lead-ondark">{c.form.lead}</p>
              </div>

              {taskState === "done" ? (
                <div className="ag-success">
                  <b>{c.form.successTitle}</b>
                  <p>
                    {c.form.successBefore} {email} {c.form.successAfter}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAnalysisSubmit}>
                  <p className="ag-picker-label">{c.form.pickerLabel}</p>
                  <div className="ag-chips">
                    {c.form.topics.map((t) =>
                      t.available ? (
                        <span key={t.label} className="ag-chip is-active">
                          {t.label}
                        </span>
                      ) : (
                        <span key={t.label} className="ag-chip is-locked">
                          {t.label}
                          <small>{c.form.lockedTag}</small>
                        </span>
                      )
                    )}
                  </div>
                  <p className="ag-picker-hint">{c.form.pickerHint}</p>

                  <div className="ag-form-fields">
                    <div className="ag-field">
                      <label htmlFor="ag-mail">{c.form.emailLabel}</label>
                      <input
                        type="email"
                        id="ag-mail"
                        required
                        maxLength={256}
                        placeholder={c.form.emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="ag-field">
                      <label htmlFor="ag-url">{c.form.urlLabel}</label>
                      <input
                        type="text"
                        id="ag-url"
                        required
                        maxLength={256}
                        placeholder={c.form.urlPlaceholder}
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                      />
                      <p className="ag-field-hint">{c.form.urlHint}</p>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="ag-btn ag-btn-red ag-btn-lg"
                    disabled={taskState === "sending"}
                  >
                    {taskState === "sending" ? c.form.submitting : c.form.submit}
                  </button>
                  {taskState === "error" && (
                    <p className="ag-error">{c.form.error}</p>
                  )}
                </form>
              )}

              <div className="ag-trust-logos">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/trust-serviceplan-group.svg" alt="Serviceplan Group" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/trust-microsoft-azure.svg" alt="Microsoft Azure" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/trust-gdpr-compliant.svg" alt="GDPR" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/trust-eu-ai-act.svg" alt="EU AI Act" />
              </div>
              <div className="ag-form-trust">
                <span className="ag-badge">{c.form.trustBadge}</span>
              </div>
              <p className="ag-form-note">{c.form.freeNote}</p>
              <p className="ag-demo-line ag-demo-line-ondark">
                {c.form.demoLinePre} <a href="#demo">{c.form.demoLineLink}</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5 Pricing ===== */}
      <section id="preise" className="ag-section">
        <div className="ag-wrap">
          <div className="ag-head ag-center">
            <p className="ag-eyebrow">{c.pricing.eyebrow}</p>
            <h2 className="ag-h2">{c.pricing.h2}</h2>
            <p className="ag-lead">{c.pricing.lead}</p>
          </div>

          <div className="ag-plans">
            {c.pricing.plans.map((p) => (
              <div
                key={p.name}
                className={`ag-plan${p.featured ? " is-featured" : ""}`}
              >
                <p className="ag-plan-name">{p.name}</p>
                <p className="ag-plan-price">
                  {p.price}
                  {p.period && <small> {p.period}</small>}
                </p>
                <p className="ag-plan-credits">{p.credits || " "}</p>
                <p className="ag-plan-claim">{p.claim}</p>
                <ul className="ag-plan-feats">
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="ag-plan-note">{c.pricing.note}</p>

          <h3 className="ag-h3 ag-tbl-heading">{c.pricing.tableHeading}</h3>
          <div className="ag-tbl-scroll">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>{c.pricing.tableCols[0]}</th>
                  <th>{c.pricing.tableCols[1]}</th>
                </tr>
              </thead>
              <tbody>
                {c.pricing.tableRows.map((row) => (
                  <tr key={row.dim}>
                    <td className="ag-dimension">{row.dim}</td>
                    <td className="ag-generic">{row.generic}</td>
                    <td className="ag-ours">{row.ours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a href="#starten" className="ag-backlink">
            {c.backlink}
          </a>
        </div>
      </section>

      {/* ===== 6 Spread ===== */}
      <section id="kunden" className="ag-section ag-section-tight">
        <div className="ag-wrap">
          <div className="ag-head ag-center">
            <p className="ag-eyebrow">{c.spread.eyebrow}</p>
            <h2 className="ag-h2">{c.spread.h2}</h2>
            <p className="ag-lead">{c.spread.lead}</p>
          </div>
          <div className="sp-logo-grid ag-logo-grid">
            {COMPANY_LOGOS.map((logo) => (
              <div key={logo.name} className="sp-logo-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.src} alt={logo.name} loading="lazy" />
              </div>
            ))}
          </div>
          <a href="#starten" className="ag-backlink">
            {c.backlink}
          </a>
        </div>
      </section>

      {/* ===== 7 Demo (secondary conversion) ===== */}
      <section id="demo" className="ag-section">
        <div className="ag-wrap">
          <div className="ag-demo-box">
            <p className="ag-eyebrow">{c.demo.eyebrow}</p>
            <h3 className="ag-h3 ag-demo-heading">{c.demo.h3}</h3>
            <p className="ag-dim">{c.demo.body}</p>
            <div className="ag-demo-facts">
              {c.demo.facts.map((f) => (
                <div key={f.label}>
                  <b>{f.label}</b>
                  <span>{f.value}</span>
                </div>
              ))}
            </div>

            {demoState === "done" ? (
              <div className="ag-success ag-success-light">
                <b>{c.demo.successTitle}</b>
                <p>
                  {c.demo.successBefore} {demo.email} {c.demo.successAfter}
                </p>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit}>
                <div className="ag-demo-fields">
                  <div className="ag-field ag-field-light">
                    <label htmlFor="ag-d-name">{c.demo.nameLabel}</label>
                    <input
                      type="text"
                      id="ag-d-name"
                      required
                      maxLength={256}
                      placeholder={c.demo.namePlaceholder}
                      value={demo.name}
                      onChange={(e) =>
                        setDemo({ ...demo, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="ag-field ag-field-light">
                    <label htmlFor="ag-d-org">{c.demo.orgLabel}</label>
                    <input
                      type="text"
                      id="ag-d-org"
                      required
                      maxLength={256}
                      placeholder={c.demo.orgPlaceholder}
                      value={demo.org}
                      onChange={(e) => setDemo({ ...demo, org: e.target.value })}
                    />
                  </div>
                </div>
                <div className="ag-field ag-field-light">
                  <label htmlFor="ag-d-mail">{c.demo.emailLabel}</label>
                  <input
                    type="email"
                    id="ag-d-mail"
                    required
                    maxLength={256}
                    placeholder={c.demo.emailPlaceholder}
                    value={demo.email}
                    onChange={(e) => setDemo({ ...demo, email: e.target.value })}
                  />
                </div>
                <div className="ag-field ag-field-light">
                  <label htmlFor="ag-d-thema">
                    {c.demo.topicLabel}{" "}
                    <span className="ag-faint">{c.demo.topicOptional}</span>
                  </label>
                  <input
                    type="text"
                    id="ag-d-thema"
                    maxLength={256}
                    placeholder={c.demo.topicPlaceholder}
                    value={demo.topic}
                    onChange={(e) => setDemo({ ...demo, topic: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="ag-btn ag-btn-black ag-btn-lg"
                  disabled={demoState === "sending"}
                >
                  {demoState === "sending" ? c.demo.submitting : c.demo.submit}
                </button>
                {demoState === "error" && (
                  <p className="ag-error">{c.demo.error}</p>
                )}
              </form>
            )}
            <p className="ag-demo-line">
              {c.demo.backLinePre} <a href="#starten">{c.demo.backLineLink}</a>
            </p>
          </div>
        </div>
      </section>

      {/* ===== 8 FAQ ===== */}
      <section id="faq" className="ag-section">
        <div className="ag-wrap ag-wrap-narrow">
          <div className="ag-head ag-center">
            <p className="ag-eyebrow">{c.faq.eyebrow}</p>
            <h2 className="ag-h2">{c.faq.h2}</h2>
          </div>

          {c.faq.items.map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}

          <div className="ag-faq-cta">
            <a href="#starten" className="ag-btn ag-btn-red">
              {c.faqCta.button}
            </a>
            <p className="ag-demo-line">
              {c.faqCta.linePre} <a href="#demo">{c.faqCta.lineLink}</a>
            </p>
          </div>
        </div>
      </section>

      <div className="ag-legal">
        <a href="https://www.sokosumi.com/imprint" target="_blank" rel="noopener">
          {c.legal.imprint}
        </a>
        {" · "}
        <a
          href="https://www.sokosumi.com/privacy-policy"
          target="_blank"
          rel="noopener"
        >
          {c.legal.privacy}
        </a>
        {" · "}
        <a
          href="https://www.house-of-communication.com/de/en/brands/plan-net/landingpages/agentic-services/legal-ai-coworkers.html"
          target="_blank"
          rel="noopener"
        >
          {c.legal.agentsLegal}
        </a>
        <br />© 2026 Plan.Net Studios GmbH &amp; Co. KG — A Serviceplan Group
        Company
      </div>
    </div>
  );
}

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

/* Der weiße Kreis-Pfeil des Navigations-Demo-Buttons der Startseite. */
function NavArrow() {
  return (
    <svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="45" height="45" rx="22.5" fill="white" />
      <path d="M17.0161 18.1188L18.0536 17.0813C18.3733 17.0914 18.5094 17.048 18.8047 17.0314C19.5267 16.9908 20.2406 16.9114 20.9611 16.8464L26.0857 16.4123L27.6002 16.286C27.7662 16.2728 28.0385 16.2248 28.1915 16.249C28.3582 16.4057 28.6132 16.6207 28.7365 16.8045C28.7458 16.8185 28.7547 16.8313 28.7597 16.8474C28.7846 16.9296 28.5661 19.1708 28.5422 19.4465L28.0473 25.0788C28.0146 25.4404 28.001 25.8053 27.9667 26.1663C27.9563 26.2755 27.9097 26.8805 27.8789 26.934C27.8625 26.9625 27.8463 26.9905 27.8272 27.0173C27.7388 27.1412 26.9701 27.9043 26.8704 27.9214L26.8542 27.9095C26.9352 27.3589 26.9526 26.7569 27.0122 26.199L27.4765 21.4242C27.4875 21.3002 27.4863 21.1763 27.4967 21.054C27.5797 19.9997 27.6873 18.9475 27.8194 17.8983C27.8246 17.8587 27.817 17.8153 27.7922 17.7832C27.7441 17.8122 27.3648 18.1956 27.3001 18.2601L26.0284 19.5295L20.7127 24.845L18.0323 27.5251L17.2723 28.285C17.1426 28.4149 16.9178 28.6277 16.815 28.7685C16.6139 28.581 16.426 28.3748 16.2312 28.1959C16.5431 27.9104 16.911 27.5218 17.2138 27.219L19.0694 25.3634L24.7142 19.7182L26.4694 17.9621L26.9237 17.504C27.0175 17.4092 27.1511 17.2614 27.2578 17.1923C27.0057 17.1792 26.7842 17.239 26.5372 17.2554C26.1008 17.2845 25.6629 17.3409 25.228 17.3762L19.1671 17.9296L17.9339 18.048C17.7746 18.0645 17.1569 18.1339 17.0161 18.1188Z" fill="black" />
    </svg>
  );
}

/* DE|EN — dieselbe Optik wie der Startseiten-Toggle, aber mit den festen
   LP-Pfaden (alternatePath kennt die noindex-LPs nicht). */
function LangToggle({
  paths,
  locale,
}: {
  paths: Record<"de" | "en", string>;
  locale: "de" | "en";
}) {
  const remember = (l: string) => {
    document.cookie = `locale=${l}; path=/; max-age=31536000`;
  };
  return (
    <div className="language-toggle">
      <a
        href={paths.de}
        hrefLang="de"
        onClick={() => remember("de")}
        className={locale === "de" ? "active" : "inactive"}
      >
        DE
      </a>
      <span className="separator">|</span>
      <a
        href={paths.en}
        hrefLang="en"
        onClick={() => remember("en")}
        className={locale === "en" ? "active" : "inactive"}
      >
        EN
      </a>
    </div>
  );
}

/* Das Hero-Visual der Startseite: Farb-Blobs + Agenten-Trio + Grau-Ebene.
   suffix hält die SVG-Filter-Ids je Instanz (Desktop/Mobile) eindeutig. */
function HeroVisual({ suffix }: { suffix: string }) {
  const g = (n: string) => `lp_${suffix}_${n}`;
  return (
    <>
      <div className="color-bg w-embed">
        <svg width="1273" height="970" viewBox="0 0 1273 970" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter={`url(#${g("green")})`}>
            <circle cx="915.243" cy="638.244" r="238.301" transform="rotate(57.6859 915.243 638.244)" fill="#8FC49F" />
          </g>
          <g filter={`url(#${g("red")})`}>
            <circle cx="500.467" cy="500.467" r="252.234" transform="rotate(57.6859 500.467 500.467)" fill={`url(#${g("grad")})`} />
          </g>
          <defs>
            <filter id={g("green")} x="428.712" y="151.712" width="973.064" height="973.063" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="124.1" result="effect1_foregroundBlur" />
            </filter>
            <filter id={g("red")} x="0" y="0" width="1000.93" height="1000.93" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="124.1" result="effect1_foregroundBlur" />
            </filter>
            <linearGradient id={g("grad")} x1="406.101" y1="282.331" x2="616.487" y2="968.052" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF9194" />
              <stop offset="1" stopColor="#FF4B4F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/agents.webp" loading="lazy" alt="" className="elena-hannah-alex" />
      <div className="gray-layer w-embed">
        <svg width="1302" height="800" viewBox="0 0 1302 537" fill="none" xmlns="http://www.w3.org/2000/svg">
          {[
            [1140.3, 330.3],
            [933.3, 380.3],
            [702.3, 424.3],
            [561.3, 410.3],
            [330.3, 410.3],
          ].map(([cx, cy], i) => (
            <g key={i} filter={`url(#${g("gray" + i)})`}>
              <circle cx={cx} cy={cy} r="231" fill="#363636" />
            </g>
          ))}
          <defs>
            {[
              [810, 0],
              [603, 50],
              [372, 94],
              [231, 80],
              [0, 80],
            ].map(([x, y], i) => (
              <filter key={i} id={g("gray" + i)} x={x} y={y} width="660.6" height="660.6" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="49.65" result="effect1_foregroundBlur" />
              </filter>
            ))}
          </defs>
        </svg>
      </div>
    </>
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

  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const home = c.locale === "de" ? "/de" : "/";
  const navCases = c.locale === "de" ? "Anwendungsfälle" : "Use cases";
  const navPricing = c.locale === "de" ? "Preise" : "Pricing";

  return (
    <div className="ag">
      {/* ===== 1 Header — Navbar und Hero-Bühne der Startseite ===== */}
      <div className="section_demo-hero">
        <div className="hero-section-wrapper">
          <div className="navbar_component jhn w-nav" data-collapse="medium" role="banner">
            <div className="nabvar-header">
              <a href={home} className="logo_sokosumi w-nav-brand" aria-label="Serviceplan Agents">
                <div className="logo-component">
                  <div className="code-embed-4 w-embed">
                    <SpLogo />
                  </div>
                </div>
              </a>
              <nav
                role="navigation"
                className="navbar-menu-content-wrap w-nav-menu"
                {...(menuOpen ? { "data-nav-menu-open": "" } : {})}
              >
                <div className="navigation-link-wrap">
                  <a href="#cases" className="nav-menu is-white w-nav-link" onClick={closeMenu}>
                    {navCases}
                  </a>
                  <a href="#preise" className="nav-menu is-white w-nav-link" onClick={closeMenu}>
                    {navPricing}
                  </a>
                  <a href="#faq" className="nav-menu is-white w-nav-link" onClick={closeMenu}>
                    FAQ
                  </a>
                </div>
                <div className="nav-cta-links">
                  <div
                    className="button-group nav-button"
                    style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
                  >
                    <a
                      href="#starten"
                      className="button is-cta-red navigation w-inline-block"
                      onClick={closeMenu}
                    >
                      <div>{c.topbar.cta}</div>
                    </a>
                    <a
                      href="#demo"
                      className="button navigation w-inline-block"
                      onClick={closeMenu}
                    >
                      <div>{c.topbar.demoLink}</div>
                      <div className="arrow-icon w-embed">
                        <NavArrow />
                      </div>
                    </a>
                  </div>
                  <LangToggle paths={c.paths} locale={c.locale} />
                </div>
              </nav>
              <div className="language-toggle-mobile" style={{ display: "none" }}>
                <LangToggle paths={c.paths} locale={c.locale} />
              </div>
              <div
                className={`menu-icon-wrap w-nav-button${menuOpen ? " w--open" : ""}`}
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ cursor: "pointer" }}
              >
                <div className="menu-icon">
                  <div className="menu-line-top"></div>
                  <div className="menu-line-middle">
                    <div className="menu-inner-line"></div>
                  </div>
                  <div className="menu-line-bottom"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="margin-top margin-xlarge">
            <div className="padding-global">
              <div className="hero-content">
                <div className="hero-text-wrap">
                  <p className="ag-eyebrow">{c.hero.eyebrow}</p>
                  <div className="margin-bottom margin-large">
                    <h1>{c.hero.h1}</h1>
                  </div>
                  <div className="hero-description">
                    <div className="text-size-regular is-white">{c.hero.h1Sub}</div>
                  </div>
                  <div className="mobile-only">
                    <div className="heroimage-wrapper mobile">
                      <HeroVisual suffix="m" />
                    </div>
                  </div>
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

                <div className="heroimage-wrapper" aria-hidden="true">
                  <HeroVisual suffix="d" />
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
            </div>
          </div>
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
        {" · "}
        <a href="#" data-cc-open>
          {c.locale === "de" ? "Cookie-Einstellungen" : "Cookie settings"}
        </a>
        <br />© 2026 Plan.Net Studios GmbH &amp; Co. KG — A Serviceplan Group
        Company
      </div>
    </div>
  );
}

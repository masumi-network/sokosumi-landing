/* Content model for the audience landing pages (/agencies, /enterprise,
   DE and EN). One shape, four content objects — the markup lives once in
   LpPage.tsx. */

export type LpLocale = "de" | "en";
export type LpSource = "agencies" | "enterprise";

/** The two conversion paths. Each has one label per page, used everywhere
 *  (hero, nav, links), except the short hero labels on mobile. */
export type LpPath = "demo" | "start";

export type LpSectionId =
  | "cases"
  | "start"
  | "demo"
  | "compare"
  | "pricing"
  | "logos"
  | "faq";

export interface LpCase {
  num: string;
  title: string;
  /** Short subline; shown on desktop only. */
  benefit: string;
  mailHeading: string;
  mailTo: string;
  mailSubject: string;
  mailBody: string;
  mailForwarded?: string;
  resultHeading: string;
  results: string[];
  facts: { label: string; value: string }[];
  /** Text the case button writes into the demo form's topic field. */
  demoTopic: string;
}

export interface LpContent {
  locale: LpLocale;
  source: LpSource;
  /** Paths of this page in both locales, for the language toggle. */
  paths: Record<LpLocale, string>;
  /** Primary conversion: drives the red buttons and the section order. */
  primary: LpPath;
  order: LpSectionId[];

  labels: Record<LpPath, string>;
  nav: { cases: string; pricing: string; menu: string };

  hero: {
    eyebrow: string;
    h1: string;
    h1Sub: string;
    bullets: { lead: string; rest: string }[];
    /** Mobile hero labels, short enough to sit side by side at 390 px. */
    short: Record<LpPath, string>;
    badges: string[];
    seq: string[];
  };

  cases: {
    h2: string;
    items: LpCase[];
    button: string;
    next: string;
    prev: string;
  };

  form: {
    eyebrow: string;
    h2: string;
    lead: string;
    emailLabel: string;
    emailPlaceholder: string;
    urlLabel: string;
    urlPlaceholder: string;
    urlHint: string;
    submit: string;
    submitting: string;
    successTitle: string;
    /** Rendered as: successBefore {email} successAfter */
    successBefore: string;
    successAfter: string;
    error: string;
  };

  compare: {
    heading: string;
    cols: [string, string];
    rows: string[];
    note: string;
  };

  pricing: {
    eyebrow: string;
    h2: string;
    lead: string;
    plans: {
      name: string;
      price: string;
      period?: string;
      credits: string;
      claim: string;
      features: string[];
      featured?: boolean;
    }[];
    note: string;
    more: string;
  };

  spread: { eyebrow: string; h2: string; lead: string };
  backlink: string;

  demo: {
    eyebrow: string;
    h3: string;
    body: string;
    facts: { label: string; value: string }[];
    nameLabel: string;
    namePlaceholder: string;
    orgLabel: string;
    orgPlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    /** Optional topic chips that prefill the topic field. */
    chips?: { lead: string; hint: string; items: { label: string; text: string }[] };
    topicLabel: string;
    topicOptional?: string;
    topicPlaceholder: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBefore: string;
    successAfter: string;
    error: string;
  };

  faq: { eyebrow: string; h2: string; items: { q: string; a: string }[] };
  closing: { linePre: string };
  legal: { imprint: string; privacy: string; agentsLegal: string };
}

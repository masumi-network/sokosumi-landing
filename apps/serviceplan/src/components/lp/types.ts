/* Content model for the audience landing pages (/agencies, /enterprise,
   DE and EN). One shape, four content objects — the markup lives once in
   LpPage.tsx. */

export type LpLocale = "de" | "en";
export type LpSource = "agencies" | "enterprise";

export interface LpCase {
  num: string;
  title: string;
  benefit: string;
  agents: { src: string; alt: string }[];
  agentLabel: string;
  mailHeading: string;
  mailTo: string;
  mailSubject: string;
  mailBody: string;
  mailForwarded?: string;
  stepsHeading: string;
  steps: string[];
  resultHeading: string;
  results: string[];
  facts: { label: string; value: string }[];
  foot:
    | { kind: "start"; label: string }
    | { kind: "demo"; note: string; linkLabel: string };
}

export interface LpContent {
  locale: LpLocale;
  source: LpSource;
  /** Paths of this page in both locales, for the language toggle. */
  paths: Record<LpLocale, string>;

  topbar: { demoLink: string; cta: string };

  hero: {
    eyebrow: string;
    h1: string;
    h1Sub: string;
    bullets: { lead: string; rest: string }[];
    ctaPrimary: string;
    ctaSecondary: string;
    badges: string[];
    seq: string[];
  };

  problem: {
    h2: string;
    lead: string;
    items: { text: string; ref: string }[];
    bridge: string;
  };

  rail: { heading: string; hint: string };
  cases: LpCase[];

  form: {
    eyebrow: string;
    h2: string;
    lead: string;
    pickerLabel: string;
    topics: { label: string; available: boolean }[];
    lockedTag: string;
    pickerHint: string;
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
    trustBadge: string;
    freeNote: string;
    demoLinePre: string;
    demoLineLink: string;
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
    tableHeading: string;
    tableCols: [string, string];
    tableRows: { dim: string; generic: string; ours: string }[];
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
    topicLabel: string;
    topicOptional: string;
    topicPlaceholder: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBefore: string;
    successAfter: string;
    error: string;
    backLinePre: string;
    backLineLink: string;
  };

  faq: { eyebrow: string; h2: string; items: { q: string; a: string }[] };
  faqCta: { button: string; linePre: string; lineLink: string };
  legal: { imprint: string; privacy: string; agentsLegal: string };
}

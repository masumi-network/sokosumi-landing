import type { LpContent } from "@/components/lp/types";

/* Enterprise-Variante der Audience-LP: gleiche Struktur und Claim-Grenzen
   wie /agencies (LP-Briefing advalyze 2026-09-01), Zielgruppe sind
   Marketing-Teams in Unternehmen. Im Pricing ist hier Enterprise
   hervorgehoben statt Standard. */

const PATHS = { de: "/de/enterprise", en: "/enterprise" };

const HANNAH = { src: "/images/user-image.png", alt: "Hannah" };
const ELENA = { src: "/images/elena.png", alt: "Elena" };
const ALEX = { src: "/images/alex-2.png", alt: "Alex" };

export const enterpriseDe: LpContent = {
  locale: "de",
  source: "enterprise",
  paths: PATHS,

  topbar: { demoLink: "Demo-Termin", cta: "Kostenlos starten" },

  hero: {
    eyebrow: "Für Unternehmen",
    h1: "AI-Coworker, die Sie bei Ihren Aufgaben unterstützen.",
    h1Sub: "Recherche, Analysen, Reportings, interaktive Dashboards.",
    bullets: [
      { lead: "Kommunikation per E-Mail.", rest: "Kein Prompt, keine Einarbeitung." },
      { lead: "Entwickelt von Serviceplan.", rest: "Über 50 Jahre Marketing-Expertise." },
      { lead: "Einfach ausprobieren.", rest: "200 Credits im Monat, ohne Kreditkarte." },
    ],
    ctaPrimary: "Erste Aufgabe kostenlos starten",
    ctaSecondary: "Demo-Termin buchen",
    badges: ["Hosting in Deutschland", "DSGVO", "EU AI Act"],
    seq: ["Aufgabe per Mail", "AI-Coworker arbeitet", "Ergebnis im Postfach"],
  },

  problem: {
    h2: "Das kennt jedes Marketing-Team.",
    lead: "Die Anforderungen wachsen. Das Team nicht.",
    items: [
      {
        text: "Der Strategie-Termin steht. Die Marktrecherche fehlt noch.",
        ref: "→ Fall 1",
      },
      {
        text: "„Was macht der Wettbewerb gerade?“ Die Frage aus der Geschäftsführung kostet jedes Mal einen Nachmittag.",
        ref: "→ Fall 2",
      },
      {
        text: "Das Monats-Reporting baut wieder jemand von Hand.",
        ref: "→ Fall 3",
      },
    ],
    bridge:
      "Für keines dieser drei Probleme brauchen Sie ein Projekt, eine Agentur oder ein neues Tool-Budget. Sie brauchen jemanden, dem Sie die Aufgabe geben können.",
  },

  rail: {
    heading: "Drei Fälle aus dem Marketing-Alltag",
    hint: "seitlich scrollen →",
  },

  cases: [
    {
      num: "Fall 1: Strategie-Vorbereitung",
      title: "Die komplette Recherche für den Strategie-Termin",
      benefit:
        "Ein Auftrag: Wettbewerbsanalyse, Zielgruppe und strategische Ableitung.",
      agents: [HANNAH, ELENA],
      agentLabel: "Hannah → Elena",
      mailHeading: "Die Mail, die Sie schreiben",
      mailTo: "hannah@serviceplan-agents.com",
      mailSubject: "Recherche Strategie [Marke]",
      mailBody:
        "„Hannah, wir überarbeiten die Positionierung von [Marke] in [Kategorie]. Ich brauche drei Dinge: die relevantesten Wettbewerber mit Positionierung und laufenden Kampagnen, eine Zielgruppenanalyse sowie daraus abgeleitet einen Vorschlag für die Kommunikationsstrategie. Als Dokument für den Termin.“",
      stepsHeading: "Was passiert",
      steps: [
        "Hannah recherchiert Wettbewerber und Zielgruppe in Statista, GWI und DataForSEO. Lizenzierter Direktzugriff, keine Web-Suche.",
        "Elena leitet daraus die Kommunikationsstrategie ab. Sie wählt das passende Framework.",
        "Läuft es in die falsche Richtung, lenken Sie per Kommentar um. Kein Neustart nötig.",
      ],
      resultHeading: "Was zurückkommt",
      results: [
        "Wettbewerber-Set mit Positionierung und Kernbotschaften",
        "Zielgruppenanalyse: Demografie, Einstellungen, Kaufverhalten",
        "Kommunikationsstrategie mit Begründung",
        "Quellenverzeichnis, jede Aussage belegt",
      ],
      facts: [
        { label: "Lieferung", value: "~15 Minuten" },
        { label: "Output", value: "PDF oder PowerPoint" },
      ],
      foot: { kind: "start", label: "Mit der Wettbewerbsanalyse starten" },
    },
    {
      num: "Fall 2: Die Frage aus der Geschäftsführung",
      title: "Das Wettbewerbs-Update, das zwischendurch erwartet wird",
      benefit: "Die Mail weiterleiten reicht. Kein Prompt, kein Briefing.",
      agents: [HANNAH],
      agentLabel: "Hannah",
      mailHeading: "Die Mail, die Sie weiterleiten",
      mailTo: "hannah@serviceplan-agents.com",
      mailSubject: "WG: Wettbewerb [Wettbewerber]",
      mailBody:
        "„Hannah, weiter unten: die Geschäftsführung will wissen, was [Wettbewerber] gerade macht. Zwei Seiten reichen.“",
      mailForwarded: "„Was macht [Wettbewerber] eigentlich gerade? Kurzer Überblick bis Freitag?“",
      stepsHeading: "Was passiert",
      steps: [
        "Die weitergeleitete Mail ist das Briefing",
        "Marke, Markt und Kernwettbewerber liegen bereits in der Wissensbibliothek. Die zweite Anfrage ist kürzer als die erste.",
        "Den Stand fragen Sie zwischendurch per WhatsApp ab",
      ],
      resultHeading: "Was zurückkommt",
      results: [
        "Zwei Seiten, direkt weiterleitbar",
        "Was der Wettbewerber aktuell kommuniziert, mit Belegen",
        "Einordnung: was davon für Ihre Marke zählt",
        "Quellen für den nächsten Termin",
      ],
      facts: [
        { label: "Lieferung", value: "~15 Minuten" },
        { label: "Output", value: "PDF oder PowerPoint" },
      ],
      foot: { kind: "start", label: "Mit der Wettbewerbsanalyse starten" },
    },
    {
      num: "Fall 3: Quick Dashboard",
      title: "Das Reporting-Dashboard fürs Monatsmeeting",
      benefit: "Einmal erstellt, danach immer aktuell.",
      agents: [ALEX],
      agentLabel: "Alex",
      mailHeading: "Die Mail, die Sie schreiben",
      mailTo: "alex@serviceplan-agents.com",
      mailSubject: "Dashboard Monatsmeeting",
      mailBody:
        "„Alex, Search Console und Analytics sind verbunden. Erstelle ein Dashboard mit Sichtbarkeit, Traffic und Top-Landingpages, filterbar nach Zeitraum, teilbar per Link.“",
      stepsHeading: "Was passiert",
      steps: [
        "Google Search Console und Google Analytics einmal in wenigen Schritten verbinden, mit Leserechten. Danach für alle Agenten verfügbar.",
        "Alex baut ein interaktives Dashboard. Kein Screenshot, keine Zahlenliste.",
        "Jede Kennzahl ist bis zur Quelle nachvollziehbar",
      ],
      resultHeading: "Was zurückkommt",
      results: [
        "Filterbares Dashboard statt statischem Report",
        "Sichtbarkeit, Traffic und Top-Landingpages in einer Ansicht",
        "Teilbar per Link mit Leserechten. Das Management klickt selbst.",
        "Nächsten Monat wiederholbar, ohne neues Briefing",
      ],
      facts: [
        { label: "Verbunden", value: "Search Console, Analytics" },
        { label: "Output", value: "interaktives Dashboard" },
      ],
      foot: {
        kind: "demo",
        note: "In der Plattform beauftragbar — der kostenlose Einstieg startet mit der Wettbewerbsanalyse.",
        linkLabel: "Diesen Fall im Demo-Termin ansehen",
      },
    },
  ],

  form: {
    eyebrow: "Kostenlos starten",
    h2: "Ihre erste Aufgabe: eine Wettbewerbsanalyse.",
    lead: "Zwei Felder. Kein Passwort, keine Firmendaten, keine Kreditkarte.",
    pickerLabel: "Womit Sie starten — und was danach möglich ist:",
    topics: [
      { label: "Wettbewerbsanalyse", available: true },
      { label: "Recherche für eine Kampagne", available: false },
      { label: "Kurzes Wettbewerbs-Update", available: false },
      { label: "Reporting-Dashboard", available: false },
      { label: "Marktüberblick & Trends", available: false },
      { label: "Zielgruppen-Insights", available: false },
      { label: "GEO- & KI-Sichtbarkeit", available: false },
      { label: "Content- & Social-Media-Audit", available: false },
    ],
    lockedTag: "danach",
    pickerHint:
      "Der kostenlose Einstieg startet mit der Wettbewerbsanalyse. Alle weiteren Aufgaben beauftragen Sie danach direkt per E-Mail — so wie in den drei Fällen oben.",
    emailLabel: "Ihre Arbeits-E-Mail",
    emailPlaceholder: "vorname.nachname@ihr-unternehmen.de",
    urlLabel: "Website, deren Wettbewerb analysiert werden soll",
    urlPlaceholder: "https://ihr-unternehmen.de",
    urlHint: "Ihre eigene Website oder die einer Ihrer Marken.",
    submit: "Kostenlose Wettbewerbsanalyse starten",
    submitting: "Wird gestartet …",
    successTitle: "Ihre Wettbewerbsanalyse läuft.",
    successBefore: "Ihr AI-Coworker hat die Aufgabe angenommen und meldet sich per E-Mail an",
    successAfter:
      "— in der Regel mit dem Ergebnis in etwa 15 Minuten. Ihr kostenloser Zugang mit 200 Credits pro Monat ist damit eingerichtet.",
    error:
      "Das hat gerade nicht geklappt. Bitte versuchen Sie es noch einmal, oder buchen Sie unten einen Demo-Termin.",
    trustBadge: "Gebaut von Serviceplan. Für Marketing-Teams.",
    freeNote:
      "Kostenlos starten mit 200 Credits im Monat. Keine Kreditkarte, keine Follow-up-Anrufe.",
    demoLinePre: "Lieber erst sprechen?",
    demoLineLink: "Demo-Termin buchen",
  },

  pricing: {
    eyebrow: "Preise",
    h2: "Kostenlos anfangen. Danach ein Paket, das zum Volumen passt.",
    lead: "Jedes Paket enthält ein monatliches Credit-Kontingent. Vor dem Start jeder Aufgabe geben Ihnen die Agenten eine Kostenschätzung.",
    plans: [
      {
        name: "Free",
        price: "0 €",
        period: "/ Monat",
        credits: "200 Credits pro Monat*",
        claim: "Der Einstieg in die Arbeit mit Marketing-Agenten",
        features: ["Zugang zu den Agenten per E-Mail und WhatsApp"],
      },
      {
        name: "Starter",
        price: "25 €",
        period: "/ Monat",
        credits: "1.500 Credits pro Monat*",
        claim: "Ihr Marketing-Research-Team",
        features: [
          "Credits bei Bedarf nachkaufen",
          "Office-Dokumente lesen und erstellen",
        ],
      },
      {
        name: "Standard",
        price: "75 €",
        period: "/ Monat",
        credits: "5.000 Credits pro Monat*",
        claim: "Das komplette Marketing-Team an AI-Coworkern",
        features: ["Wiederkehrende Aufgaben planen"],
      },
      {
        name: "Pro",
        price: "200 €",
        period: "/ Monat",
        credits: "15.000 Credits pro Monat*",
        claim: "Mehr schaffen mit Premium Skills",
        features: [
          "Zugang zu Premium Skills",
          "Eigene Vorlagen für Ausgabedateien",
          "Früher Zugang zu neuen Agenten und Features",
        ],
      },
      {
        name: "Enterprise",
        price: "Custom",
        credits: "",
        claim: "AI-Coworker auf Ihren Bedarf zugeschnitten",
        features: [
          "Enterprise-Support und SLAs",
          "Individuelle Daten- und Tool-Integrationen",
          "Erweiterte Sicherheitsfunktionen",
          "Zugang zu allen Premium Skills",
          "VPC- und On-Premise-Deployment",
        ],
        featured: true,
      },
    ],
    note: "* Pakete bauen aufeinander auf: jedes höhere enthält alles aus dem darunter.",
    tableHeading: "Was ist der Unterschied zu anderen AI-Lösungen?",
    tableCols: ["Generische AI-Assistenten", "Serviceplan Agents"],
    tableRows: [
      {
        dim: "Wissen über Marke, Markt, Wettbewerber",
        generic:
          "Gedächtnis je Nutzerkonto, keine geteilte und verwaltbare Grundlage fürs Team",
        ours: "Wissensbibliothek für das ganze Team: einsehbar, korrigierbar, löschbar",
      },
      {
        dim: "Was zurückkommt",
        generic:
          "Eine Antwort im Chat, die Sie noch in Form bringen, oder ein generisches Dokument",
        ours: "PDF, PowerPoint, Excel oder ein interaktives Dashboard",
      },
      {
        dim: "Datenquellen",
        generic:
          "Web-Recherche und Trainingsdaten. Lizenzierte Marktforschung ist nicht enthalten",
        ours: "Premium-Daten von Statista, GWI, DataForSEO etc. im Direktzugriff. Integration in andere Systeme, bspw. Search Console und Analytics.",
      },
      {
        dim: "Nachvollziehbarkeit",
        generic: "Sie sehen das Ergebnis, nicht durchgängig den Weg dorthin",
        ours: "Jeder Arbeitsschritt einsehbar, jede Aussage bis zur Quelle nachvollziehbar",
      },
      {
        dim: "Wo die Daten liegen",
        generic: "Je Anbieter unterschiedlich, häufig außerhalb der EU",
        ours: "Hosting in Deutschland, DSGVO-konform, EU AI Act konform",
      },
      {
        dim: "Wie beauftragt wird",
        generic: "Ein Fenster, das Sie öffnen und in dem Sie formulieren",
        ours: "E-Mail, Weiterleitung, ins CC setzen, WhatsApp, OneDrive",
      },
    ],
  },

  spread: {
    eyebrow: "Verbreitung",
    h2: "Über 500 Unternehmen nutzen Serviceplan Agents.",
    lead: "Kein Pilotprojekt mit drei Testkunden.",
  },
  backlink: "Zurück zum Formular: kostenlos starten",

  demo: {
    eyebrow: "Lieber sprechen?",
    h3: "Kein Pitch, keine Folien. Wir arbeiten an einer Ihrer Aufgaben.",
    body: "Sie bringen eine Aufgabe mit, die gerade ansteht. Wir richten sie gemeinsam ein. Sie gehen mit dem Ergebnis aus dem Termin.",
    facts: [
      { label: "Dauer", value: "30 Minuten" },
      {
        label: "Womit Sie rausgehen",
        value: "Sie gehen mit einem konkreten Ergebnis aus dem Termin.",
      },
    ],
    nameLabel: "Name",
    namePlaceholder: "Vor- und Nachname",
    orgLabel: "Unternehmen",
    orgPlaceholder: "Name des Unternehmens",
    emailLabel: "Arbeits-E-Mail",
    emailPlaceholder: "vorname.nachname@ihr-unternehmen.de",
    topicLabel: "Worüber möchten Sie sprechen?",
    topicOptional: "(optional)",
    topicPlaceholder: "z. B. Wettbewerbsbeobachtung für unsere Marke",
    submit: "Demo-Termin anfragen",
    submitting: "Wird gesendet …",
    successTitle: "Ihre Anfrage ist angekommen.",
    successBefore: "Wir melden uns per E-Mail an",
    successAfter: ", um einen Termin zu finden.",
    error: "Das hat gerade nicht geklappt. Bitte versuchen Sie es noch einmal.",
    backLinePre: "Wollen Sie es einfach ausprobieren?",
    backLineLink: "Kostenlos starten, ohne Termin",
  },

  faq: {
    eyebrow: "Offene Fragen",
    h2: "Was Marketing-Teams vorher wissen wollen.",
    items: [
      {
        q: "Was kostet das, und was passiert, wenn die Credits aufgebraucht sind?",
        a: "Der Einstieg ist kostenlos mit 200 Credits pro Monat. Danach gibt es Pakete ab 25 € im Monat mit größerem Kontingent, ab Starter lassen sich Credits bei Bedarf nachkaufen. Vor dem Start einer Aufgabe sehen Sie eine Kostenschätzung und können sie abbrechen oder ändern.",
      },
      {
        q: "Wo liegen unsere Daten, und wird damit trainiert?",
        a: "Das Hosting liegt in Deutschland, DSGVO-konform und EU AI Act konform. Zugriffe erteilen Sie gezielt und können sie jederzeit widerrufen. Freigegebene Dateien überschreibt niemand. Die Agenten legen immer eine neue Version an.",
      },
      {
        q: "Wie unterscheiden sich die Serviceplan Agents von anderen AI-Lösungen?",
        a: "In drei Punkten: Sie bekommen ein fertiges Dokument oder ein interaktives Dashboard statt einer Chat-Antwort. Die Recherche läuft über lizenzierte Quellen (Statista, GWI, DataForSEO) statt über Web-Suche. Das Wissen über Ihre Marke und Ihren Markt liegt als Bibliothek für das ganze Team, nicht als Gedächtnis in einem einzelnen Konto.",
      },
      {
        q: "Welche Tools lassen sich verbinden?",
        a: "Live verbindbar sind Google Search Console und Google Analytics mit Leserechten. Beauftragen und Dateien austauschen können Sie über E-Mail, WhatsApp und OneDrive. Weitere Verbindungen kommen.",
      },
      {
        q: "Was, wenn das Ergebnis nicht taugt?",
        a: "Dann lenken Sie um, statt neu zu starten. Eine laufende Aufgabe korrigieren Sie per Kommentar und schicken sie in eine andere Richtung. Der Mensch bleibt in der Schleife. Was zurückkommt, ist eine Arbeitsgrundlage, die Sie prüfen und freigeben. Keine Fertiglieferung ohne Ihre Kontrolle.",
      },
      {
        q: "Müssen wir unsere Arbeitsweise umstellen?",
        a: "Nein. Kein Login fürs Team, keine Schulung, kein Prompt-Training. Sie schreiben eine Mail, setzen den AI-Coworker ins CC oder leiten eine Anfrage weiter. Genau das zeigen die drei Fälle weiter oben.",
      },
      {
        q: "DSGVO und EU AI Act: Was können wir intern zusagen?",
        a: "Die Verarbeitung läuft in Deutschland. Jeder Arbeitsschritt ist einsehbar und korrigierbar. Jede Aussage lässt sich bis zur Quelle nachprüfen. Gegenüber Datenschutz und Compliance zeigen Sie nicht nur das Ergebnis, sondern auch den Weg dorthin.",
      },
      {
        q: "Wer steht dahinter?",
        a: "Serviceplan ist Europas größte inhabergeführte Agenturgruppe, mit über 50 Jahren Marketing-Expertise. Die AI-Coworker sind für Marketingarbeit gebaut, weil sie in einer Agentur entstanden sind — aus denselben Aufgaben, die Ihr Team jeden Tag hat.",
      },
    ],
  },
  faqCta: {
    button: "Erste Aufgabe kostenlos starten",
    linePre: "Noch Fragen?",
    lineLink: "Demo-Termin buchen",
  },
  legal: {
    imprint: "Impressum",
    privacy: "Datenschutz",
    agentsLegal: "Serviceplan Agents Legal",
  },
};

export const enterpriseEn: LpContent = {
  locale: "en",
  source: "enterprise",
  paths: PATHS,

  topbar: { demoLink: "Book a demo", cta: "Start for free" },

  hero: {
    eyebrow: "For enterprises",
    h1: "AI coworkers that help with your tasks.",
    h1Sub: "Research, analyses, reports, interactive dashboards.",
    bullets: [
      { lead: "Brief them by email.", rest: "No prompts, no onboarding." },
      { lead: "Built by Serviceplan.", rest: "50+ years of marketing expertise." },
      { lead: "Just try it.", rest: "200 credits a month, no credit card." },
    ],
    ctaPrimary: "Start your first task for free",
    ctaSecondary: "Book a demo",
    badges: ["Hosted in Germany", "GDPR", "EU AI Act"],
    seq: ["Task by email", "AI coworker at work", "Result in your inbox"],
  },

  problem: {
    h2: "Every marketing team knows this.",
    lead: "The workload grows. The team doesn't.",
    items: [
      {
        text: "The strategy meeting is set. The market research isn't.",
        ref: "→ Case 1",
      },
      {
        text: "“What are our competitors doing right now?” That question from management costs an afternoon every time.",
        ref: "→ Case 2",
      },
      {
        text: "Someone is building the monthly report by hand again.",
        ref: "→ Case 3",
      },
    ],
    bridge:
      "None of these three problems needs a project, an agency or a new tool budget. You need someone you can hand the task to.",
  },

  rail: {
    heading: "Three cases from marketing life",
    hint: "scroll sideways →",
  },

  cases: [
    {
      num: "Case 1: Strategy prep",
      title: "The complete research for the strategy meeting",
      benefit: "One brief: competitive analysis, audience, and strategy.",
      agents: [HANNAH, ELENA],
      agentLabel: "Hannah → Elena",
      mailHeading: "The email you write",
      mailTo: "hannah@serviceplan-agents.com",
      mailSubject: "Research for [brand] strategy",
      mailBody:
        "“Hannah, we're reworking the positioning of [brand] in [category]. I need three things: the most relevant competitors with positioning and current campaigns, an audience analysis, and a communication strategy derived from both. As a document for the meeting.”",
      stepsHeading: "What happens",
      steps: [
        "Hannah researches competitors and audience in Statista, GWI and DataForSEO. Licensed direct access, no web search.",
        "Elena derives the communication strategy and picks the right framework.",
        "Heading the wrong way? Redirect with a comment. No restart.",
      ],
      resultHeading: "What comes back",
      results: [
        "Competitor set with positioning and key messages",
        "Audience analysis: demographics, attitudes, buying behavior",
        "Communication strategy with the reasoning behind it",
        "Source list — every claim backed",
      ],
      facts: [
        { label: "Delivery", value: "~15 minutes" },
        { label: "Output", value: "PDF or PowerPoint" },
      ],
      foot: { kind: "start", label: "Start with the competitive analysis" },
    },
    {
      num: "Case 2: The question from management",
      title: "The competitor update everyone expects on the side",
      benefit: "Forwarding the email is enough. No prompt, no brief.",
      agents: [HANNAH],
      agentLabel: "Hannah",
      mailHeading: "The email you forward",
      mailTo: "hannah@serviceplan-agents.com",
      mailSubject: "Fwd: Competitors [competitor]",
      mailBody:
        "“Hannah, see below: management wants to know what [competitor] is doing right now. Two pages are enough.”",
      mailForwarded:
        "“What is [competitor] actually up to? Quick overview by Friday?”",
      stepsHeading: "What happens",
      steps: [
        "The forwarded email is the brief",
        "Brand, market and core competitors are already in the knowledge library. The second request is shorter than the first.",
        "Check on progress in between via WhatsApp",
      ],
      resultHeading: "What comes back",
      results: [
        "Two pages, ready to forward",
        "What the competitor is currently communicating, with evidence",
        "What of it matters for your brand",
        "Sources for the next meeting",
      ],
      facts: [
        { label: "Delivery", value: "~15 minutes" },
        { label: "Output", value: "PDF or PowerPoint" },
      ],
      foot: { kind: "start", label: "Start with the competitive analysis" },
    },
    {
      num: "Case 3: Quick dashboard",
      title: "The reporting dashboard for the monthly meeting",
      benefit: "Built once, current from then on.",
      agents: [ALEX],
      agentLabel: "Alex",
      mailHeading: "The email you write",
      mailTo: "alex@serviceplan-agents.com",
      mailSubject: "Dashboard for the monthly meeting",
      mailBody:
        "“Alex, Search Console and Analytics are connected. Build a dashboard with visibility, traffic and top landing pages, filterable by date range, shareable by link.”",
      stepsHeading: "What happens",
      steps: [
        "Connect Google Search Console and Google Analytics once, read-only, in a few steps. From then on every agent can use them.",
        "Alex builds an interactive dashboard. No screenshot, no list of numbers.",
        "Every metric traces back to its source",
      ],
      resultHeading: "What comes back",
      results: [
        "A filterable dashboard instead of a static report",
        "Visibility, traffic and top landing pages in one view",
        "Shareable by link, read-only. Management clicks through it themselves.",
        "Repeatable next month, no new brief",
      ],
      facts: [
        { label: "Connected", value: "Search Console, Analytics" },
        { label: "Output", value: "interactive dashboard" },
      ],
      foot: {
        kind: "demo",
        note: "Available in the platform — the free start begins with the competitive analysis.",
        linkLabel: "See this case in a demo",
      },
    },
  ],

  form: {
    eyebrow: "Start for free",
    h2: "Your first task: a competitive analysis.",
    lead: "Two fields. No password, no company data, no credit card.",
    pickerLabel: "What you start with — and what comes after:",
    topics: [
      { label: "Competitive analysis", available: true },
      { label: "Campaign research", available: false },
      { label: "Quick competitor update", available: false },
      { label: "Reporting dashboard", available: false },
      { label: "Market overview & trends", available: false },
      { label: "Audience insights", available: false },
      { label: "GEO & AI visibility", available: false },
      { label: "Content & social media audit", available: false },
    ],
    lockedTag: "later",
    pickerHint:
      "The free start begins with the competitive analysis. Everything after that you brief directly by email — like the three cases above.",
    emailLabel: "Your work email",
    emailPlaceholder: "first.last@your-company.com",
    urlLabel: "Website whose competition should be analyzed",
    urlPlaceholder: "https://your-company.com",
    urlHint: "Your own website or one of your brands'.",
    submit: "Start your free competitive analysis",
    submitting: "Starting …",
    successTitle: "Your competitive analysis is running.",
    successBefore: "Your AI coworker has taken the task and will email",
    successAfter:
      "— usually with the result in about 15 minutes. Your free account with 200 credits a month is now set up.",
    error: "That didn't go through. Please try again, or book a demo below.",
    trustBadge: "Built by Serviceplan. For marketing teams.",
    freeNote:
      "Start free with 200 credits a month. No credit card, no follow-up calls.",
    demoLinePre: "Rather talk first?",
    demoLineLink: "Book a demo",
  },

  pricing: {
    eyebrow: "Pricing",
    h2: "Start free. Then a plan that fits your volume.",
    lead: "Every plan includes a monthly credit quota. Before each task starts, the agents give you a cost estimate.",
    plans: [
      {
        name: "Free",
        price: "€0",
        period: "/ month",
        credits: "200 credits per month*",
        claim: "Your entry into working with marketing agents",
        features: ["Access to the agents via email and WhatsApp"],
      },
      {
        name: "Starter",
        price: "€25",
        period: "/ month",
        credits: "1,500 credits per month*",
        claim: "Your marketing research team",
        features: [
          "Buy extra credits on demand",
          "Read and create Office documents",
        ],
      },
      {
        name: "Standard",
        price: "€75",
        period: "/ month",
        credits: "5,000 credits per month*",
        claim: "The complete marketing team of AI coworkers",
        features: ["Schedule recurring tasks"],
      },
      {
        name: "Pro",
        price: "€200",
        period: "/ month",
        credits: "15,000 credits per month*",
        claim: "Get more done with premium skills",
        features: [
          "Access to premium skills",
          "Your own templates for output files",
          "Early access to new agents and features",
        ],
      },
      {
        name: "Enterprise",
        price: "Custom",
        credits: "",
        claim: "AI coworkers tailored to your needs",
        features: [
          "Enterprise support and SLAs",
          "Custom data and tool integrations",
          "Advanced security features",
          "Access to all premium skills",
          "VPC and on-premise deployment",
        ],
        featured: true,
      },
    ],
    note: "* Plans build on each other: every tier includes everything below it.",
    tableHeading: "How is this different from other AI tools?",
    tableCols: ["Generic AI assistants", "Serviceplan Agents"],
    tableRows: [
      {
        dim: "Knowledge of brand, market, competitors",
        generic:
          "Memory per user account, no shared and manageable base for the team",
        ours: "A knowledge library for the whole team: visible, correctable, deletable",
      },
      {
        dim: "What comes back",
        generic:
          "A chat answer you still have to shape, or a generic document",
        ours: "PDF, PowerPoint, Excel or an interactive dashboard",
      },
      {
        dim: "Data sources",
        generic:
          "Web search and training data. Licensed market research is not included",
        ours: "Premium data from Statista, GWI, DataForSEO and more, accessed directly. Plus connections to systems like Search Console and Analytics.",
      },
      {
        dim: "Traceability",
        generic: "You see the result, not consistently the path to it",
        ours: "Every working step visible, every claim traceable to its source",
      },
      {
        dim: "Where the data lives",
        generic: "Varies by provider, often outside the EU",
        ours: "Hosted in Germany, GDPR-compliant, EU AI Act compliant",
      },
      {
        dim: "How you brief",
        generic: "A window you open and type into",
        ours: "Email, forwarding, CC, WhatsApp, OneDrive",
      },
    ],
  },

  spread: {
    eyebrow: "Adoption",
    h2: "Over 500 companies use Serviceplan Agents.",
    lead: "Not a pilot with three test clients.",
  },
  backlink: "Back to the form: start for free",

  demo: {
    eyebrow: "Rather talk?",
    h3: "No pitch, no slides. We work on one of your tasks.",
    body: "Bring a task that's on your desk right now. We set it up together. You leave with the result.",
    facts: [
      { label: "Length", value: "30 minutes" },
      {
        label: "What you leave with",
        value: "You leave the call with a concrete result.",
      },
    ],
    nameLabel: "Name",
    namePlaceholder: "First and last name",
    orgLabel: "Company",
    orgPlaceholder: "Name of your company",
    emailLabel: "Work email",
    emailPlaceholder: "first.last@your-company.com",
    topicLabel: "What would you like to talk about?",
    topicOptional: "(optional)",
    topicPlaceholder: "e.g. competitor monitoring for our brand",
    submit: "Request a demo",
    submitting: "Sending …",
    successTitle: "Your request has arrived.",
    successBefore: "We'll email",
    successAfter: "to find a time.",
    error: "That didn't go through. Please try again.",
    backLinePre: "Want to just try it?",
    backLineLink: "Start for free, no meeting",
  },

  faq: {
    eyebrow: "Open questions",
    h2: "What marketing teams want to know first.",
    items: [
      {
        q: "What does it cost, and what happens when the credits run out?",
        a: "The start is free with 200 credits per month. After that, plans start at €25 a month with a larger quota; from Starter up you can buy extra credits on demand. Before a task starts you see a cost estimate and can cancel or change it.",
      },
      {
        q: "Where does our data live, and is it used for training?",
        a: "Hosting is in Germany, GDPR-compliant and EU AI Act compliant. You grant access deliberately and can revoke it at any time. Nobody overwrites shared files — the agents always create a new version.",
      },
      {
        q: "How is Serviceplan Agents different from other AI tools?",
        a: "In three ways: you get a finished document or an interactive dashboard instead of a chat answer. Research runs on licensed sources (Statista, GWI, DataForSEO) instead of web search. And the knowledge about your brand and market lives in a library for the whole team, not in the memory of one account.",
      },
      {
        q: "Which tools can be connected?",
        a: "Live today: Google Search Console and Google Analytics, read-only. You can brief and exchange files via email, WhatsApp and OneDrive. More connections are coming.",
      },
      {
        q: "What if the result isn't good enough?",
        a: "Then you redirect instead of restarting. You correct a running task with a comment and send it in a different direction. A human stays in the loop. What comes back is a working draft you review and approve — nothing goes out without your sign-off.",
      },
      {
        q: "Do we have to change how we work?",
        a: "No. No team logins, no training, no prompt courses. You write an email, put the AI coworker in CC, or forward a request. That's exactly what the three cases above show.",
      },
      {
        q: "GDPR and the EU AI Act: what can we promise internally?",
        a: "Processing runs in Germany. Every working step is visible and correctable. Every claim can be checked back to its source. You can show privacy and compliance not just the result, but how it was made.",
      },
      {
        q: "Who is behind this?",
        a: "Serviceplan is Europe's largest owner-managed agency group, with over 50 years of marketing expertise. The AI coworkers are built for marketing work because they were built inside an agency — on the same tasks your team has every day.",
      },
    ],
  },
  faqCta: {
    button: "Start your first task for free",
    linePre: "Still have questions?",
    lineLink: "Book a demo",
  },
  legal: {
    imprint: "Imprint",
    privacy: "Privacy Policy",
    agentsLegal: "Serviceplan Agents Legal",
  },
};

import type { LpContent } from "@/components/lp/types";

/* Enterprise-Variante der Audience-LP. Zielgruppe: kleine Marketing-Teams
   in größeren Unternehmen. Copy-Quelle: Tayas Wireframe „Mittelstand“
   (Anhang an Daniels Mail vom 24.09.) und Tayas Änderungsdokument vom
   06.10. Die Demo ist hier die primäre Conversion, die kostenlose
   Wettbewerbsanalyse die sekundäre. */

const PATHS = { de: "/de/enterprise", en: "/enterprise" };

const CHIPS_DE = [
  {
    label: "Kampagne für einen Messeauftritt",
    text: "Kampagnenplan für unseren Auftritt auf der [Messe] im [Monat]: welche Kanäle, welche Botschaften je Zielgruppe, wie das Budget über die acht Wochen davor und vier danach aufgeteilt wird. Als Dokument für die Geschäftsführung.",
  },
  {
    label: "Markt- oder Länderentscheidung",
    text: "Entscheidungsgrundlage für [Produktlinie] in [Markt]: Marktvolumen, Wachstumsprognose, wer dort bereits stark ist, und welche Zielgruppe wir realistisch erreichen. Mit Quellen und Erhebungsjahr.",
  },
  {
    label: "Reporting-Dashboard",
    text: "Reporting-Dashboard aus Search Console und Analytics: Sichtbarkeit, Traffic und Top-Landingpages, filterbar nach Zeitraum, teilbar per Link mit Leserechten.",
  },
  {
    label: "Zielgruppen-Insights",
    text: "Zielgruppen-Insights für [Produkt/Markt]: Demografie, Einstellungen und Kaufverhalten der Kernzielgruppe, auf Basis echter Verbraucherdaten.",
  },
  {
    label: "Vorlage für die Geschäftsführung",
    text: "Vorlage für die Geschäftsführung zum Thema [Thema]: Ausgangslage, Zahlen, Optionen und eine begründete Empfehlung. Als PowerPoint, maximal zehn Seiten.",
  },
  {
    label: "Landingpage für eine Produkteinführung",
    text: "Landingpage für die Einführung von [Produkt]: Konzept, Struktur, Texte und Visuals. Zielgruppe ist [Zielgruppe].",
  },
  {
    label: "Wettbewerbsbeobachtung",
    text: "Wettbewerbsbeobachtung für [Branche]: was unsere drei wichtigsten Wettbewerber aktuell kommunizieren, wie sie positioniert sind, und was davon für uns relevant ist. Mit Quellen.",
  },
  { label: "Eigenes Beispiel", text: "" },
];

const CHIPS_EN = [
  {
    label: "Trade fair campaign",
    text: "Campaign plan for our presence at [trade fair] in [month]: which channels, which messages per audience, and how the budget is split across the eight weeks before and four after. As a document for management.",
  },
  {
    label: "Market or country decision",
    text: "Decision basis for [product line] in [market]: market size, growth forecast, who is already strong there, and which audience we can realistically reach. With sources and survey year.",
  },
  {
    label: "Reporting dashboard",
    text: "Reporting dashboard from Search Console and Analytics: visibility, traffic and top landing pages, filterable by date range, shareable by read-only link.",
  },
  {
    label: "Audience insights",
    text: "Audience insights for [product/market]: demographics, attitudes and buying behavior of the core audience, based on real consumer data.",
  },
  {
    label: "Management presentation",
    text: "Presentation for management on [topic]: starting point, numbers, options and a reasoned recommendation. As PowerPoint, ten slides at most.",
  },
  {
    label: "Product launch landing page",
    text: "Landing page for the launch of [product]: concept, structure, copy and visuals. The audience is [audience].",
  },
  {
    label: "Competitor monitoring",
    text: "Competitor monitoring for [industry]: what our three most important competitors are communicating right now, how they are positioned, and what of it matters for us. With sources.",
  },
  { label: "Your own example", text: "" },
];

export const enterpriseDe: LpContent = {
  locale: "de",
  source: "enterprise",
  paths: PATHS,
  primary: "demo",
  order: ["cases", "demo", "compare", "pricing", "logos", "start", "faq"],

  labels: {
    demo: "Demo-Termin an Ihrem Beispiel",
    start: "Kostenlose Wettbewerbsanalyse",
  },
  nav: { cases: "Beispiele", pricing: "Preise", menu: "Menü" },

  hero: {
    eyebrow: "Für kleine Marketing-Teams",
    h1: "AI-Coworker, die Sie bei Ihren Aufgaben unterstützen.",
    h1Sub: "Kampagnenplanung, Marktanalysen, Präsentationen, interaktive Dashboards.",
    bullets: [
      { lead: "Kommunikation per E-Mail.", rest: "Kein Prompt, keine Einarbeitung." },
      { lead: "Entwickelt von Serviceplan.", rest: "Über 50 Jahre Marketing-Expertise." },
      {
        lead: "Erst an einem eigenen Beispiel sehen.",
        rest: "30 Minuten, kein Pitch, keine Folien.",
      },
    ],
    short: { demo: "Demo an Ihrem Beispiel", start: "Kostenlose Analyse" },
    badges: ["Hosting in Deutschland", "DSGVO", "EU AI Act"],
    seq: ["Aufgabe per Mail", "AI-Coworker arbeitet", "Ergebnis im Postfach"],
  },

  cases: {
    h2: "Das kennt jedes kleine Marketing-Team.",
    button: "Dieses Beispiel in die Demo mitbringen",
    next: "Nächstes Beispiel",
    prev: "Vorheriges Beispiel",
    items: [
      {
        num: "Beispiel 1: Messeauftritt",
        title: "Der Kampagnenplan für den Messeauftritt",
        benefit: "Ein Auftrag: Zielgruppe, Botschaften, Kanäle und Budgetaufteilung.",
        mailHeading: "Die Mail, die Sie schreiben",
        mailTo: "elena@serviceplan-agents.com",
        mailSubject: "Kampagne Messeauftritt [Messe]",
        mailBody:
          "„Hallo Elena, wir stehen im [Monat] auf der [Messe]. Ich brauche einen Kampagnenplan für die acht Wochen davor und die vier danach: welche Kanäle, welche Botschaften je Zielgruppe, und wie das Budget aufgeteilt wird. Als Dokument für die Geschäftsführung.“",
        resultHeading: "Was zurückkommt",
        results: [
          "Kampagnenplan über zwölf Wochen, Kanal für Kanal",
          "Botschaften je Zielgruppe, mit Begründung",
          "Vorschlag zur Budgetaufteilung",
          "Quellenverzeichnis, jede Aussage belegt",
        ],
        facts: [
          { label: "Lieferung", value: "~15 Minuten" },
          { label: "Output", value: "PDF oder PowerPoint" },
        ],
        demoTopic: CHIPS_DE[0].text,
      },
      {
        num: "Beispiel 2: Die Entscheidung",
        title: "Die Entscheidungsgrundlage für einen neuen Markt",
        benefit: "Zahlen statt Bauchgefühl. Mit Quellen, die Sie vertreten können.",
        mailHeading: "Die Mail, die Sie schreiben",
        mailTo: "hannah@serviceplan-agents.com",
        mailSubject: "Marktanalyse [Markt / Produktlinie]",
        mailBody:
          "„Hallo Hannah, wir überlegen, [Produktlinie] in [Markt] auszubauen. Ich brauche eine Einordnung: Marktvolumen, Wachstum, wer dort bereits stark ist, und welche Zielgruppe wir realistisch erreichen. Als Entscheidungsgrundlage für die Geschäftsführung.“",
        resultHeading: "Was zurückkommt",
        results: [
          "Marktvolumen und Wachstumsprognose, mit Quelle und Erhebungsjahr",
          "Wer dort bereits stark ist, und womit",
          "Zielgruppenprofil: Demografie, Einstellungen, Kaufverhalten",
          "Eine Empfehlung, die Sie in der Sitzung vertreten können",
        ],
        facts: [
          { label: "Lieferung", value: "~15 Minuten" },
          { label: "Output", value: "PDF oder PowerPoint" },
        ],
        demoTopic: CHIPS_DE[1].text,
      },
      {
        num: "Beispiel 3: Quick Dashboard",
        title: "Das Reporting-Dashboard für die Geschäftsführung",
        benefit: "Einmal erstellt, danach immer aktuell.",
        mailHeading: "Die Mail, die Sie schreiben",
        mailTo: "alex@serviceplan-agents.com",
        mailSubject: "Dashboard Monatsbericht",
        mailBody:
          "„Hallo Alex, Search Console und Analytics sind verbunden. Bitte ein Dashboard mit Sichtbarkeit, Traffic und Top-Landingpages, filterbar nach Zeitraum, teilbar per Link.“",
        resultHeading: "Was zurückkommt",
        results: [
          "Filterbares Dashboard statt statischem Report",
          "Sichtbarkeit, Traffic und Top-Landingpages in einer Ansicht",
          "Teilbar per Link mit Leserechten. Die Geschäftsführung klickt selbst.",
          "Nächsten Monat wiederholbar, ohne neues Briefing",
        ],
        facts: [
          { label: "Verbunden", value: "Search Console, Analytics" },
          { label: "Output", value: "interaktives Dashboard" },
        ],
        demoTopic: CHIPS_DE[2].text,
      },
    ],
  },

  form: {
    eyebrow: "Oder ohne Termin",
    h2: "Ihre erste Aufgabe: eine Wettbewerbsanalyse.",
    lead: "Zwei Felder. Kein Passwort, keine Firmendaten, keine Kreditkarte.",
    emailLabel: "Ihre geschäftliche E-Mail",
    emailPlaceholder: "vorname.nachname@ihr-unternehmen.de",
    urlLabel: "Website, deren Wettbewerb analysiert werden soll",
    urlPlaceholder: "ihr-unternehmen.de",
    urlHint: "Ihre eigene Website oder die einer Ihrer Marken.",
    submit: "Kostenlose Wettbewerbsanalyse starten",
    submitting: "Wird gestartet …",
    successTitle: "Ihre Wettbewerbsanalyse läuft.",
    successBefore: "Ihr AI-Coworker hat die Aufgabe angenommen und meldet sich per E-Mail an",
    successAfter:
      "— in der Regel mit dem Ergebnis in etwa 15 Minuten. Ihr kostenloser Zugang mit 200 Credits pro Monat ist damit eingerichtet.",
    error:
      "Das hat gerade nicht geklappt. Bitte versuchen Sie es noch einmal, oder fragen Sie einen Demo-Termin an.",
  },

  compare: {
    heading: "Was ist der Unterschied zu anderen AI-Lösungen?",
    cols: ["Generische AI-Assistenten", "Serviceplan Agents"],
    rows: [
      "Gemeinsame Wissensbasis zu Marke, Markt und Wettbewerb fürs ganze Team",
      "Fertiges Dokument statt Chat-Antwort (PDF, PowerPoint, Excel, Dashboard)",
      "Lizenzierte Marktdaten direkt angebunden (Statista, GWI, DataForSEO)",
      "Jeder Arbeitsschritt sichtbar, jede Aussage mit Quelle",
      "Hosting in Deutschland, DSGVO- und EU-AI-Act-konform",
      "Beauftragung per E-Mail, Weiterleitung, WhatsApp, OneDrive",
      "Betrieb im eigenen Netz (VPC und On-Premise im Enterprise-Paket)",
    ],
    note: "Die Kreuze beziehen sich auf die Standardversionen generischer Assistenten; einzelne Business-Tarife decken manche Punkte ab.",
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
    more: "Leistungen anzeigen",
  },

  spread: {
    eyebrow: "Verbreitung",
    h2: "Über 500 Unternehmen nutzen Serviceplan Agents.",
    lead: "Kein Pilotprojekt mit drei Testkunden.",
  },
  backlink: "Zurück zum Demo-Termin",

  demo: {
    eyebrow: "Kostenlose Demo",
    h3: "Kein Pitch, keine Folien. Wir arbeiten an einer Ihrer Aufgaben.",
    body: "Sie bringen ein Beispiel mit, das bei Ihnen gerade ansteht. Wir richten es gemeinsam ein. Sie gehen mit dem Ergebnis aus dem Termin.",
    facts: [
      { label: "Dauer", value: "30 Minuten" },
      {
        label: "Womit Sie rausgehen",
        value: "Mit dem Ergebnis Ihres eigenen Beispiels, nicht mit einer Präsentation.",
      },
    ],
    nameLabel: "Name",
    namePlaceholder: "Vor- und Nachname",
    orgLabel: "Unternehmen",
    orgPlaceholder: "Name des Unternehmens",
    emailLabel: "Arbeits-E-Mail",
    emailPlaceholder: "vorname.nachname@ihr-unternehmen.de",
    chips: {
      lead: "Was steht bei Ihnen gerade an? Ein Klick befüllt das Feld.",
      hint: "Vorbefüllt und jederzeit änderbar. Je konkreter das Beispiel, desto mehr nehmen Sie aus dem Termin mit.",
      items: CHIPS_DE,
    },
    topicLabel: "Welchen Fall bringen Sie mit?",
    topicPlaceholder: "Beschreiben Sie kurz die Aufgabe, die gerade ansteht.",
    submit: "Demo-Termin anfragen",
    submitting: "Wird gesendet …",
    successTitle: "Ihre Anfrage ist angekommen.",
    successBefore: "Wir melden uns per E-Mail an",
    successAfter: ", um einen Termin zu finden.",
    error: "Das hat gerade nicht geklappt. Bitte versuchen Sie es noch einmal.",
  },

  faq: {
    eyebrow: "Offene Fragen",
    h2: "Was Marketing-Teams vorher wissen wollen.",
    items: [
      {
        q: "Müssen wir unsere Arbeitsweise umstellen?",
        a: "Nein. Kein Login fürs Team, keine Schulung, kein Prompt-Training. Sie schreiben eine Mail, setzen den AI-Coworker ins CC oder leiten eine Mail weiter. Genau das zeigen die drei Beispiele weiter oben.",
      },
      {
        q: "Braucht das eine IT-Freigabe oder ein Rollout?",
        a: "Für den Einstieg nicht: die Beauftragung läuft über E-Mail und WhatsApp, es wird nichts installiert. Sobald Datenquellen wie Search Console oder Analytics verbunden werden, erteilen Sie den Zugriff gezielt und mit Leserechten, und können ihn jederzeit widerrufen. Wenn Ihre IT den Betrieb im eigenen Netz voraussetzt, gibt es im Enterprise-Paket VPC- und On-Premise-Deployment.",
      },
      {
        q: "Wo liegen unsere Daten, und wird damit trainiert?",
        a: "Das Hosting liegt in Deutschland, DSGVO-konform und EU AI Act konform. Zugriffe erteilen Sie gezielt und können sie jederzeit widerrufen. Freigegebene Dateien überschreibt niemand. Die Agenten legen immer eine neue Version an. Es erfolgt kein Training auf Kundendaten.",
      },
      {
        q: "Was kostet das, und was passiert, wenn die Credits aufgebraucht sind?",
        a: "Der Einstieg ist kostenlos mit 200 Credits pro Monat. Danach gibt es Pakete ab 25 € im Monat mit größerem Kontingent, ab Starter lassen sich Credits bei Bedarf nachkaufen. Für größeren oder abweichenden Bedarf gibt es das Enterprise-Paket mit individuellem Preis. Vor dem Start einer Aufgabe sehen Sie eine Kostenschätzung und können sie abbrechen oder ändern.",
      },
      {
        q: "Wie unterscheiden sich die Serviceplan Agents von anderen AI-Lösungen?",
        a: "In drei Punkten: Sie bekommen ein fertiges Dokument oder ein interaktives Dashboard statt einer Chat-Antwort. Die Recherche läuft über lizenzierte Quellen (Statista, GWI, DataForSEO) statt über Web-Suche. Und Ihr Unternehmen erklären Sie einmal: Marke, Produkte, Tonalität und Regeln liegen als Bibliothek für das ganze Team, nicht als Gedächtnis in einem einzelnen Konto.",
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
        q: "Was können wir der Geschäftsführung sagen?",
        a: "Dass die Verarbeitung in Deutschland läuft, jeder Arbeitsschritt einsehbar und korrigierbar ist und jede Aussage bis zur Quelle nachprüfbar bleibt. In der Sitzung zeigen Sie nicht nur das Ergebnis, sondern auch, woher die Zahlen kommen — inklusive Quelle und Erhebungsjahr.",
      },
      {
        q: "Wer steht dahinter?",
        a: "Serviceplan ist Europas größte inhabergeführte Agenturgruppe, mit über 50 Jahren Marketing-Expertise. Die AI-Coworker sind für Marketingarbeit gebaut, weil sie in einer Agentur entstanden sind — aus denselben Aufgaben, die Ihr Team jeden Tag hat.",
      },
    ],
  },
  closing: { linePre: "Noch nicht so weit?" },
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
  primary: "demo",
  order: ["cases", "demo", "compare", "pricing", "logos", "start", "faq"],

  labels: {
    demo: "Book a demo with your own example",
    start: "Free competitive analysis",
  },
  nav: { cases: "Examples", pricing: "Pricing", menu: "Menu" },

  hero: {
    eyebrow: "For small marketing teams",
    h1: "AI coworkers that help with your tasks.",
    h1Sub: "Campaign plans, market analyses, presentations, interactive dashboards.",
    bullets: [
      { lead: "Brief them by email.", rest: "No prompts, no onboarding." },
      { lead: "Built by Serviceplan.", rest: "50+ years of marketing expertise." },
      {
        lead: "See it on your own example first.",
        rest: "30 minutes, no pitch, no slides.",
      },
    ],
    short: { demo: "Book a demo", start: "Free analysis" },
    badges: ["Hosted in Germany", "GDPR", "EU AI Act"],
    seq: ["Task by email", "AI coworker at work", "Result in your inbox"],
  },

  cases: {
    h2: "Every small marketing team knows this.",
    button: "Bring this example to the demo",
    next: "Next example",
    prev: "Previous example",
    items: [
      {
        num: "Example 1: Trade fair",
        title: "The campaign plan for the trade fair",
        benefit: "One brief: audience, messages, channels and budget split.",
        mailHeading: "The email you write",
        mailTo: "elena@serviceplan-agents.com",
        mailSubject: "Trade fair campaign [trade fair]",
        mailBody:
          "“Hi Elena, we're exhibiting at [trade fair] in [month]. I need a campaign plan for the eight weeks before and the four after: which channels, which messages per audience, and how to split the budget. As a document for management.”",
        resultHeading: "What comes back",
        results: [
          "A twelve-week campaign plan, channel by channel",
          "Messages per audience, with the reasoning",
          "A proposed budget split",
          "Source list — every claim backed",
        ],
        facts: [
          { label: "Delivery", value: "~15 minutes" },
          { label: "Output", value: "PDF or PowerPoint" },
        ],
        demoTopic: CHIPS_EN[0].text,
      },
      {
        num: "Example 2: The decision",
        title: "The decision basis for a new market",
        benefit: "Numbers instead of gut feeling. With sources you can stand behind.",
        mailHeading: "The email you write",
        mailTo: "hannah@serviceplan-agents.com",
        mailSubject: "Market analysis [market / product line]",
        mailBody:
          "“Hi Hannah, we're thinking about expanding [product line] in [market]. I need an assessment: market size, growth, who is already strong there, and which audience we can realistically reach. As a decision basis for management.”",
        resultHeading: "What comes back",
        results: [
          "Market size and growth forecast, with source and survey year",
          "Who is already strong there, and with what",
          "Audience profile: demographics, attitudes, buying behavior",
          "A recommendation you can defend in the meeting",
        ],
        facts: [
          { label: "Delivery", value: "~15 minutes" },
          { label: "Output", value: "PDF or PowerPoint" },
        ],
        demoTopic: CHIPS_EN[1].text,
      },
      {
        num: "Example 3: Quick dashboard",
        title: "The reporting dashboard for management",
        benefit: "Built once, current from then on.",
        mailHeading: "The email you write",
        mailTo: "alex@serviceplan-agents.com",
        mailSubject: "Dashboard for the monthly report",
        mailBody:
          "“Hi Alex, Search Console and Analytics are connected. Please build a dashboard with visibility, traffic and top landing pages, filterable by date range, shareable by link.”",
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
        demoTopic: CHIPS_EN[2].text,
      },
    ],
  },

  form: {
    eyebrow: "Or without a meeting",
    h2: "Your first task: a competitive analysis.",
    lead: "Two fields. No password, no company data, no credit card.",
    emailLabel: "Your business email",
    emailPlaceholder: "first.last@your-company.com",
    urlLabel: "Website whose competition should be analyzed",
    urlPlaceholder: "your-company.com",
    urlHint: "Your own website or one of your brands'.",
    submit: "Start your free competitive analysis",
    submitting: "Starting …",
    successTitle: "Your competitive analysis is running.",
    successBefore: "Your AI coworker has taken the task and will email",
    successAfter:
      "— usually with the result in about 15 minutes. Your free account with 200 credits a month is now set up.",
    error: "That didn't go through. Please try again, or request a demo.",
  },

  compare: {
    heading: "How is this different from other AI tools?",
    cols: ["Generic AI assistants", "Serviceplan Agents"],
    rows: [
      "A shared knowledge base on brand, market and competitors for the whole team",
      "A finished document instead of a chat answer (PDF, PowerPoint, Excel, dashboard)",
      "Licensed market data connected directly (Statista, GWI, DataForSEO)",
      "Every working step visible, every claim sourced",
      "Hosted in Germany, GDPR and EU AI Act compliant",
      "Briefing by email, forwarding, WhatsApp, OneDrive",
      "Runs in your own network (VPC and on-premise in the Enterprise plan)",
    ],
    note: "The crosses refer to the standard versions of generic assistants; some business plans cover some of these points.",
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
    more: "Show what's included",
  },

  spread: {
    eyebrow: "Adoption",
    h2: "Over 500 companies use Serviceplan Agents.",
    lead: "Not a pilot with three test clients.",
  },
  backlink: "Back to booking a demo",

  demo: {
    eyebrow: "Free demo",
    h3: "No pitch, no slides. We work on one of your tasks.",
    body: "Bring an example that's on your desk right now. We set it up together. You leave with the result.",
    facts: [
      { label: "Length", value: "30 minutes" },
      {
        label: "What you leave with",
        value: "The result of your own example, not a presentation.",
      },
    ],
    nameLabel: "Name",
    namePlaceholder: "First and last name",
    orgLabel: "Company",
    orgPlaceholder: "Name of your company",
    emailLabel: "Work email",
    emailPlaceholder: "first.last@your-company.com",
    chips: {
      lead: "What's on your desk right now? One click fills in the field.",
      hint: "Prefilled and editable at any time. The more concrete the example, the more you take away from the call.",
      items: CHIPS_EN,
    },
    topicLabel: "Which example are you bringing?",
    topicPlaceholder: "Briefly describe the task that's coming up.",
    submit: "Request a demo",
    submitting: "Sending …",
    successTitle: "Your request has arrived.",
    successBefore: "We'll email",
    successAfter: "to find a time.",
    error: "That didn't go through. Please try again.",
  },

  faq: {
    eyebrow: "Open questions",
    h2: "What marketing teams want to know first.",
    items: [
      {
        q: "Do we have to change how we work?",
        a: "No. No team logins, no training, no prompt courses. You write an email, put the AI coworker in CC, or forward an email. That's exactly what the three examples above show.",
      },
      {
        q: "Does this need IT approval or a rollout?",
        a: "Not to get started: briefing runs over email and WhatsApp, nothing gets installed. Once you connect data sources like Search Console or Analytics, you grant read-only access deliberately and can revoke it at any time. If your IT requires running in your own network, the Enterprise plan offers VPC and on-premise deployment.",
      },
      {
        q: "Where does our data live, and is it used for training?",
        a: "Hosting is in Germany, GDPR-compliant and EU AI Act compliant. You grant access deliberately and can revoke it at any time. Nobody overwrites shared files — the agents always create a new version. Customer data is not used for training.",
      },
      {
        q: "What does it cost, and what happens when the credits run out?",
        a: "The start is free with 200 credits per month. After that, plans start at €25 a month with a larger quota; from Starter up you can buy extra credits on demand. For larger or different needs there is the Enterprise plan with custom pricing. Before a task starts you see a cost estimate and can cancel or change it.",
      },
      {
        q: "How is Serviceplan Agents different from other AI tools?",
        a: "In three ways: you get a finished document or an interactive dashboard instead of a chat answer. Research runs on licensed sources (Statista, GWI, DataForSEO) instead of web search. And you explain your company once: brand, products, tone and rules live in a library for the whole team, not in the memory of one account.",
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
        q: "What can we tell management?",
        a: "That processing runs in Germany, every working step is visible and correctable, and every claim can be checked back to its source. In the meeting you show not just the result but where the numbers come from — including source and survey year.",
      },
      {
        q: "Who is behind this?",
        a: "Serviceplan is Europe's largest owner-managed agency group, with over 50 years of marketing expertise. The AI coworkers are built for marketing work because they were built inside an agency — on the same tasks your team has every day.",
      },
    ],
  },
  closing: { linePre: "Not ready yet?" },
  legal: {
    imprint: "Imprint",
    privacy: "Privacy Policy",
    agentsLegal: "Serviceplan Agents Legal",
  },
};

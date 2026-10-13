import type { LpContent } from "@/components/lp/types";

/* Copy-Quelle DE: Textmanuskript v3 (2026-09-02) + LP-Briefing (advalyze,
   2026-09-01), Free Tier 200 Credits (Briefing-Entscheidung #6 + Website).
   Struktur und Kürzungen: Tayas Änderungsdokument vom 06.10.
   EN ist eine eigenständige Übersetzung nach der Obvious-Adams-Regel in
   AGENTS.md, keine Wort-für-Wort-Spiegelung. */

const PATHS = { de: "/de/agencies", en: "/agencies" };


export const agenciesDe: LpContent = {
  locale: "de",
  source: "agencies",
  paths: PATHS,
  primary: "start",
  order: ["cases", "start", "compare", "pricing", "logos", "demo", "faq"],

  labels: {
    start: "Erste Aufgabe kostenlos starten",
    demo: "Demo-Termin buchen",
  },
  nav: { cases: "Anwendungsfälle", pricing: "Preise", menu: "Menü" },

  hero: {
    eyebrow: "Für Agenturen",
    h1: "AI-Coworker, die Sie bei Ihren Aufgaben unterstützen.",
    h1Sub: "Recherche, Analysen, Reportings, interaktive Dashboards.",
    bullets: [
      { lead: "Kommunikation per E-Mail.", rest: "Kein Prompt, keine Einarbeitung." },
      { lead: "Entwickelt von Serviceplan.", rest: "Über 50 Jahre Marketing-Expertise." },
      { lead: "Einfach ausprobieren.", rest: "200 Credits im Monat, ohne Kreditkarte." },
    ],
    short: { start: "Kostenlos starten", demo: "Demo-Termin" },
    badges: ["Hosting in Deutschland", "DSGVO", "EU AI Act"],
    seq: ["Aufgabe per Mail", "AI-Coworker arbeitet", "Ergebnis im Postfach"],
  },

  cases: {
    h2: "Das kennt jede Agentur.",
    button: "Diesen Fall in die Demo mitbringen",
    next: "Nächster Fall",
    prev: "Vorheriger Fall",
    items: [
      {
        num: "Fall 1: Pitch-Vorbereitung",
        title: "Die komplette Recherche fürs Pitch-Deck",
        benefit:
          "Ein Auftrag: Wettbewerbsanalyse, Zielgruppe und strategische Ableitung.",
        mailHeading: "Die Mail, die Sie schreiben",
        mailTo: "hannah@serviceplan-agents.com",
        mailSubject: "Recherche Pitch [Kunde]",
        mailBody:
          "„Hannah, wir pitchen Donnerstag bei [Kunde], Kategorie [Branche]. Ich brauche drei Dinge: die relevantesten Wettbewerber mit Positionierung und laufenden Kampagnen, eine Zielgruppenanalyse sowie daraus abgeleitet einen Vorschlag für die Kampagnenstrategie. Als Dokument fürs Deck.“",
        resultHeading: "Was zurückkommt",
        results: [
          "Wettbewerber-Set mit Positionierung und Kernbotschaften",
          "Zielgruppenanalyse: Demografie, Einstellungen, Kaufverhalten",
          "Kampagnenstrategie mit Begründung",
          "Quellenverzeichnis, jede Aussage belegt",
        ],
        facts: [
          { label: "Lieferung", value: "~15 Minuten" },
          { label: "Output", value: "PDF oder PowerPoint" },
        ],
        demoTopic:
          "Pitch-Vorbereitung für [Kunde], Kategorie [Branche]: Wettbewerber mit Positionierung und laufenden Kampagnen, Zielgruppenanalyse und ein Vorschlag für die Kampagnenstrategie.",
      },
      {
        num: "Fall 2: Die Anfrage zwischendurch",
        title: "Das Wettbewerbs-Update, das der Kunde nebenbei erwartet",
        benefit: "Kundenmail weiterleiten. Kein Prompt, kein neues Briefing.",
        mailHeading: "Die Mail, die Sie weiterleiten",
        mailTo: "hannah@serviceplan-agents.com",
        mailSubject: "WG: Kurze Frage zum Wettbewerb",
        mailBody:
          "„Hannah, weiter unten: [Kunde] will wissen, was [Wettbewerber] gerade macht. Zwei Seiten reichen.“",
        mailForwarded: "„Können Sie mir kurz was zum Wettbewerb schicken?“",
        resultHeading: "Was zurückkommt",
        results: [
          "Zwei Seiten, direkt weiterleitbar",
          "Was der Wettbewerber aktuell kommuniziert, mit Belegen",
          "Einordnung: was davon für den Kunden zählt",
          "Quellen für den nächsten Termin",
        ],
        facts: [
          { label: "Lieferung", value: "~15 Minuten" },
          { label: "Output", value: "PDF oder PowerPoint" },
        ],
        demoTopic:
          "Wettbewerbs-Update für [Kunde]: was [Wettbewerber] gerade kommuniziert und was davon für den Kunden zählt. Zwei Seiten, direkt weiterleitbar.",
      },
      {
        num: "Fall 3: Quick Dashboard",
        title: "Das Reporting-Dashboard für den monatlichen Jour Fixe",
        benefit: "Einmal erstellt, danach immer aktuell.",
        mailHeading: "Die Mail, die Sie schreiben",
        mailTo: "alex@serviceplan-agents.com",
        mailSubject: "Dashboard Monatsmeeting [Kunde]",
        mailBody:
          "„Alex, Search Console und Analytics sind verbunden. Erstelle ein Dashboard mit Sichtbarkeit, Traffic und Top-Landingpages, filterbar nach Zeitraum, teilbar per Link.“",
        resultHeading: "Was zurückkommt",
        results: [
          "Filterbares Dashboard statt statischem Report",
          "Sichtbarkeit, Traffic und Top-Landingpages in einer Ansicht",
          "Teilbar per Link mit Leserechten. Der Kunde klickt selbst.",
          "Nächsten Monat wiederholbar, ohne neues Briefing",
        ],
        facts: [
          { label: "Verbunden", value: "Search Console, Analytics" },
          { label: "Output", value: "interaktives Dashboard" },
        ],
        demoTopic:
          "Reporting-Dashboard für [Kunde] aus Search Console und Analytics: Sichtbarkeit, Traffic und Top-Landingpages, filterbar nach Zeitraum, teilbar per Link.",
      },
    ],
  },

  form: {
    eyebrow: "Kostenlos starten",
    h2: "Ihre erste Aufgabe: eine Wettbewerbsanalyse.",
    lead: "Zwei Felder. Kein Passwort, keine Firmendaten, keine Kreditkarte.",
    emailLabel: "Ihre geschäftliche E-Mail",
    emailPlaceholder: "vorname.nachname@ihre-agentur.de",
    urlLabel: "Website, deren Wettbewerb analysiert werden soll",
    urlPlaceholder: "ihr-kunde.de",
    urlHint: "Ihre eigene Website oder die eines Kunden.",
    submit: "Kostenlose Wettbewerbsanalyse starten",
    submitting: "Wird gestartet …",
    successTitle: "Ihre Wettbewerbsanalyse läuft.",
    successBefore: "Ihr AI-Coworker hat die Aufgabe angenommen und meldet sich per E-Mail an",
    successAfter:
      "— in der Regel mit dem Ergebnis in etwa 15 Minuten. Ihr kostenloser Zugang mit 200 Credits pro Monat ist damit eingerichtet.",
    error:
      "Das hat gerade nicht geklappt. Bitte versuchen Sie es noch einmal, oder buchen Sie unten einen Demo-Termin.",
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
        featured: true,
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
  backlink: "Zurück zum Formular: kostenlos starten",

  demo: {
    eyebrow: "Lieber erst sprechen?",
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
    orgLabel: "Agentur",
    orgPlaceholder: "Name der Agentur",
    emailLabel: "Arbeits-E-Mail",
    emailPlaceholder: "vorname.nachname@ihre-agentur.de",
    topicLabel: "Worüber möchten Sie sprechen?",
    topicOptional: "(optional)",
    topicPlaceholder: "z. B. Wettbewerbsanalysen für Pitches",
    submit: "Demo-Termin anfragen",
    submitting: "Wird gesendet …",
    successTitle: "Ihre Anfrage ist angekommen.",
    successBefore: "Wir melden uns per E-Mail an",
    successAfter: ", um einen Termin zu finden.",
    error: "Das hat gerade nicht geklappt. Bitte versuchen Sie es noch einmal.",
  },

  faq: {
    eyebrow: "Offene Fragen",
    h2: "Was Agenturen vorher wissen wollen.",
    items: [
      {
        q: "Was kostet das, und was passiert, wenn die Credits aufgebraucht sind?",
        a: "Der Einstieg ist kostenlos mit 200 Credits pro Monat. Danach gibt es Pakete ab 25 € im Monat mit größerem Kontingent, ab Starter lassen sich Credits bei Bedarf nachkaufen. Vor dem Start einer Aufgabe sehen Sie eine Kostenschätzung und können sie abbrechen oder ändern.",
      },
      {
        q: "Wo liegen unsere Daten, und wird damit trainiert?",
        a: "Das Hosting liegt in Deutschland, DSGVO-konform und EU AI Act konform. Zugriffe erteilen Sie gezielt und können sie jederzeit widerrufen. Freigegebene Dateien überschreibt niemand. Die Agenten legen immer eine neue Version an. Es erfolgt kein Training auf Kundendaten.",
      },
      {
        q: "Wie unterscheiden sich die Serviceplan Agents von anderen AI-Lösungen?",
        a: "In drei Punkten: Sie bekommen ein fertiges Dokument oder ein interaktives Dashboard statt einer Chat-Antwort. Die Recherche läuft über lizenzierte Quellen (Statista, GWI, DataForSEO) statt über Web-Suche. Das Wissen über Ihre Marke und Ihre Kunden liegt als Bibliothek für das ganze Team, nicht als Gedächtnis in einem einzelnen Konto.",
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
        a: "Nein. Kein Login fürs Team, keine Schulung, kein Prompt-Training. Sie schreiben eine Mail, setzen den AI-Coworker ins CC oder leiten die Kundenmail weiter. Genau das zeigen die drei Fälle weiter oben.",
      },
      {
        q: "DSGVO und EU AI Act: Was können wir dem Kunden sagen?",
        a: "Die Verarbeitung läuft in Deutschland. Jeder Arbeitsschritt ist einsehbar und korrigierbar. Jede Aussage lässt sich bis zur Quelle nachprüfen. Im Kundengespräch zeigen Sie nicht nur das Ergebnis, sondern auch den Weg dorthin.",
      },
      {
        q: "Wer steht dahinter?",
        a: "Serviceplan ist Europas größte inhabergeführte Agenturgruppe, mit über 50 Jahren Marketing-Expertise. Die AI-Coworker sind für Marketingarbeit gebaut, weil sie in einer Agentur entstanden sind. Von einer Agentur gebaut. Für Agenturen.",
      },
    ],
  },
  closing: { linePre: "Noch Fragen?" },
  legal: {
    imprint: "Impressum",
    privacy: "Datenschutz",
    agentsLegal: "Serviceplan Agents Legal",
  },
};

export const agenciesEn: LpContent = {
  locale: "en",
  source: "agencies",
  paths: PATHS,
  primary: "start",
  order: ["cases", "start", "compare", "pricing", "logos", "demo", "faq"],

  labels: {
    start: "Start your first task for free",
    demo: "Book a demo",
  },
  nav: { cases: "Use cases", pricing: "Pricing", menu: "Menu" },

  hero: {
    eyebrow: "For agencies",
    h1: "AI coworkers that help with your tasks.",
    h1Sub: "Research, analyses, reports, interactive dashboards.",
    bullets: [
      { lead: "Brief them by email.", rest: "No prompts, no onboarding." },
      { lead: "Built by Serviceplan.", rest: "50+ years of marketing expertise." },
      { lead: "Just try it.", rest: "200 credits a month, no credit card." },
    ],
    short: { start: "Start for free", demo: "Book a demo" },
    badges: ["Hosted in Germany", "GDPR", "EU AI Act"],
    seq: ["Task by email", "AI coworker at work", "Result in your inbox"],
  },

  cases: {
    h2: "Every agency knows this.",
    button: "Bring this case to the demo",
    next: "Next case",
    prev: "Previous case",
    items: [
      {
        num: "Case 1: Pitch prep",
        title: "The complete research for your pitch deck",
        benefit: "One brief: competitive analysis, audience, and strategy.",
        mailHeading: "The email you write",
        mailTo: "hannah@serviceplan-agents.com",
        mailSubject: "Research for [client] pitch",
        mailBody:
          "“Hannah, we're pitching [client] on Thursday, category [industry]. I need three things: the most relevant competitors with positioning and current campaigns, an audience analysis, and a campaign strategy derived from both. As a document for the deck.”",
        resultHeading: "What comes back",
        results: [
          "Competitor set with positioning and key messages",
          "Audience analysis: demographics, attitudes, buying behavior",
          "Campaign strategy with the reasoning behind it",
          "Source list — every claim backed",
        ],
        facts: [
          { label: "Delivery", value: "~15 minutes" },
          { label: "Output", value: "PDF or PowerPoint" },
        ],
        demoTopic:
          "Pitch prep for [client], category [industry]: competitors with positioning and current campaigns, an audience analysis and a proposed campaign strategy.",
      },
      {
        num: "Case 2: The in-between request",
        title: "The competitor update your client expects on the side",
        benefit: "Forward the client's email. No prompt, no new brief.",
        mailHeading: "The email you forward",
        mailTo: "hannah@serviceplan-agents.com",
        mailSubject: "Fwd: Quick question about competitors",
        mailBody:
          "“Hannah, see below: [client] wants to know what [competitor] is doing right now. Two pages are enough.”",
        mailForwarded: "“Could you send me a quick competitor overview?”",
        resultHeading: "What comes back",
        results: [
          "Two pages, ready to forward",
          "What the competitor is currently communicating, with evidence",
          "What of it matters for your client",
          "Sources for the next meeting",
        ],
        facts: [
          { label: "Delivery", value: "~15 minutes" },
          { label: "Output", value: "PDF or PowerPoint" },
        ],
        demoTopic:
          "Competitor update for [client]: what [competitor] is communicating right now and what of it matters for the client. Two pages, ready to forward.",
      },
      {
        num: "Case 3: Quick dashboard",
        title: "The reporting dashboard for the monthly check-in",
        benefit: "Built once, current from then on.",
        mailHeading: "The email you write",
        mailTo: "alex@serviceplan-agents.com",
        mailSubject: "Dashboard for [client] monthly meeting",
        mailBody:
          "“Alex, Search Console and Analytics are connected. Build a dashboard with visibility, traffic and top landing pages, filterable by date range, shareable by link.”",
        resultHeading: "What comes back",
        results: [
          "A filterable dashboard instead of a static report",
          "Visibility, traffic and top landing pages in one view",
          "Shareable by link, read-only. The client clicks through it themselves.",
          "Repeatable next month, no new brief",
        ],
        facts: [
          { label: "Connected", value: "Search Console, Analytics" },
          { label: "Output", value: "interactive dashboard" },
        ],
        demoTopic:
          "Reporting dashboard for [client] from Search Console and Analytics: visibility, traffic and top landing pages, filterable by date range, shareable by link.",
      },
    ],
  },

  form: {
    eyebrow: "Start for free",
    h2: "Your first task: a competitive analysis.",
    lead: "Two fields. No password, no company data, no credit card.",
    emailLabel: "Your business email",
    emailPlaceholder: "first.last@your-agency.com",
    urlLabel: "Website whose competition should be analyzed",
    urlPlaceholder: "your-client.com",
    urlHint: "Your own website or a client's.",
    submit: "Start your free competitive analysis",
    submitting: "Starting …",
    successTitle: "Your competitive analysis is running.",
    successBefore: "Your AI coworker has taken the task and will email",
    successAfter:
      "— usually with the result in about 15 minutes. Your free account with 200 credits a month is now set up.",
    error: "That didn't go through. Please try again, or book a demo below.",
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
        featured: true,
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
  backlink: "Back to the form: start for free",

  demo: {
    eyebrow: "Rather talk first?",
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
    orgLabel: "Agency",
    orgPlaceholder: "Name of your agency",
    emailLabel: "Work email",
    emailPlaceholder: "first.last@your-agency.com",
    topicLabel: "What would you like to talk about?",
    topicOptional: "(optional)",
    topicPlaceholder: "e.g. competitive analyses for pitches",
    submit: "Request a demo",
    submitting: "Sending …",
    successTitle: "Your request has arrived.",
    successBefore: "We'll email",
    successAfter: "to find a time.",
    error: "That didn't go through. Please try again.",
  },

  faq: {
    eyebrow: "Open questions",
    h2: "What agencies want to know first.",
    items: [
      {
        q: "What does it cost, and what happens when the credits run out?",
        a: "The start is free with 200 credits per month. After that, plans start at €25 a month with a larger quota; from Starter up you can buy extra credits on demand. Before a task starts you see a cost estimate and can cancel or change it.",
      },
      {
        q: "Where does our data live, and is it used for training?",
        a: "Hosting is in Germany, GDPR-compliant and EU AI Act compliant. You grant access deliberately and can revoke it at any time. Nobody overwrites shared files — the agents always create a new version. Customer data is not used for training.",
      },
      {
        q: "How is Serviceplan Agents different from other AI tools?",
        a: "In three ways: you get a finished document or an interactive dashboard instead of a chat answer. Research runs on licensed sources (Statista, GWI, DataForSEO) instead of web search. And the knowledge about your brand and clients lives in a library for the whole team, not in the memory of one account.",
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
        a: "No. No team logins, no training, no prompt courses. You write an email, put the AI coworker in CC, or forward the client's email. That's exactly what the three cases above show.",
      },
      {
        q: "GDPR and the EU AI Act: what can we tell our clients?",
        a: "Processing runs in Germany. Every working step is visible and correctable. Every claim can be checked back to its source. In the client meeting you show not just the result, but how it was made.",
      },
      {
        q: "Who is behind this?",
        a: "Serviceplan is Europe's largest owner-managed agency group, with over 50 years of marketing expertise. The AI coworkers are built for marketing work because they were built inside an agency. Built by an agency. For agencies.",
      },
    ],
  },
  closing: { linePre: "Still have questions?" },
  legal: {
    imprint: "Imprint",
    privacy: "Privacy Policy",
    agentsLegal: "Serviceplan Agents Legal",
  },
};

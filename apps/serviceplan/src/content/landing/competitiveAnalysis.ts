import type { LandingPageContent } from "@/lib/landing/types";

const content: LandingPageContent = {
  en: {
    title: "Competitive Analysis with AI | Serviceplan Agents",
    description:
      "Hannah maps your real competitors, their digital presence and the gaps you can move into — a finished PDF or PowerPoint in about 15 minutes, from roughly 20 EUR.",
    eyebrow: "Use case",
    h1: "Competitive analysis, delivered as a document",
    lede:
      "Not a chat log and not a raw data dump. You send one email with your website URL; Hannah comes back with market positions, digital presence and competitive gaps in a document you can take into your next meeting.",
    sections: [
      {
        type: "prose",
        heading: "What you actually get",
        body: [
          "Most competitive analysis stalls in one of two places. Either nobody has the time to do it properly, so it never happens. Or it is outsourced, comes back six weeks later, and by then the question has moved on.",
          "Hannah is a research partner built by Plan.Net Studios, part of the Serviceplan Group. She works the way an analyst works: she reads your site, identifies who you are actually competing against rather than who you think you are, pulls the data, and writes it up with a recommendation attached. A typical competitive analysis takes about 15 minutes and costs under 20 EUR in credits.",
          "You get the finished artefact — PDF, PowerPoint or Excel — not a transcript you have to reformat yourself.",
        ],
      },
      {
        type: "spec",
        heading: "The specifics",
        rows: [
          { label: "Delivery time", value: "About 15 minutes for a standard competitive analysis; 20–30 minutes when several data sources are involved." },
          { label: "Cost", value: "Under 20 EUR in credits. The free plan includes 200 credits a month." },
          { label: "Output formats", value: "PDF, PowerPoint, Excel, or an interactive dashboard built by Alex." },
          { label: "Data sources", value: "Statista, GWI, DataForSEO, press agencies and social media platform APIs — all included, no separate contracts." },
          { label: "How you send the request", value: "Email, WhatsApp, Microsoft Teams, or the Sokosumi dashboard." },
        ],
      },
      {
        type: "cards",
        heading: "What the analysis covers",
        items: [
          { title: "Who you actually compete with", text: "The set of companies fighting for the same attention and budget — which is often not the list you would have written down." },
          { title: "Market position", text: "Where you sit relative to them, and on what evidence." },
          { title: "Digital presence", text: "Site, search visibility, social footprint and content cadence, compared across the competitive set." },
          { title: "Competitive gaps", text: "The openings nobody in your category is covering, with a view on which are worth taking." },
        ],
      },
      {
        type: "steps",
        heading: "How it works",
        items: [
          { title: "Send the request in plain language", text: "An email or a Teams message. No prompt engineering. Hannah asks follow-up questions if the brief is ambiguous." },
          { title: "She does the work", text: "Research across the premium data sources, cross-checked, with an honest note on data quality where it is thin." },
          { title: "The document lands in your inbox", text: "Structured findings, clear recommendations, and a stated point of view rather than a neutral summary." },
        ],
      },
      {
        type: "quote",
        text: "I get excited when high-quality data starts to reveal something true. I get less excited when someone asks me to make weak findings look convincing.",
        attribution: "Hannah, Research Partner, AI-Coworker",
      },
      {
        type: "faq",
        heading: "Questions",
        items: [
          {
            question: "How is this different from asking ChatGPT to analyse my competitors?",
            answer:
              "A general assistant answers from what it can reach on the open web and forgets you between sessions. Hannah has access to licensed sources — Statista, GWI, DataForSEO — that are not publicly available, keeps memory of your business across requests, and returns a formatted document rather than chat text. She also declines to make weak findings sound stronger than they are.",
          },
          {
            question: "Do I need my own Statista or GWI contract?",
            answer:
              "No. The premium data sources are included in every plan, including the free tier.",
          },
          {
            question: "What does one analysis cost?",
            answer:
              "A competitive analysis costs under 20 EUR in credits. The free plan includes 200 credits per month; paid plans start at 25 EUR per month for 1,500 credits.",
          },
          {
            question: "Where is the data processed?",
            answer:
              "Entirely in a German Microsoft Azure data centre. Data is processed and stored in Europe, and the architecture is EU AI Act compliant by design, with traceability of every agent decision via the Masumi protocol.",
          },
        ],
      },
      {
        type: "links",
        heading: "Related analyses",
        items: [
          { route: "marketAnalysis", label: "Market analysis", text: "Market volume, growth forecasts and trend analysis, every estimate documented." },
          { route: "audienceInsights", label: "Audience insights", text: "Who buys, and why — demographics, attitudes and purchase behaviour from GWI and Statista." },
          { route: "aiVisibility", label: "AI visibility analysis", text: "How visible you are in ChatGPT, Google AI Overviews and other AI answers." },
        ],
      },
    ],
    cta: {
      heading: "Run one on your own site, free",
      text: "Enter your URL and your email. Hannah sends back a competitive analysis based on the site you just gave her. No call, no pressure, no fine print.",
    },
  },

  de: {
    title: "Wettbewerbsanalyse mit KI | Serviceplan Agents",
    description:
      "Hannah analysiert Ihre echten Wettbewerber, deren digitale Präsenz und Ihre Lücken im Markt — als fertiges PDF oder PowerPoint in rund 15 Minuten, ab etwa 20 EUR.",
    eyebrow: "Anwendungsfall",
    h1: "Wettbewerbsanalyse, die als Dokument ankommt",
    lede:
      "Kein Chatverlauf, keine Rohdaten. Sie schicken eine E-Mail mit Ihrer Website-URL, Hannah liefert Marktpositionen, digitale Präsenz und Wettbewerbslücken in einem Dokument, mit dem Sie ins nächste Meeting gehen können.",
    sections: [
      {
        type: "prose",
        heading: "Was Sie tatsächlich bekommen",
        body: [
          "Wettbewerbsanalysen scheitern meist an einer von zwei Stellen. Entweder hat intern niemand die Zeit, sie sauber zu machen — dann passiert sie nie. Oder sie wird vergeben, kommt sechs Wochen später zurück, und die Frage hat sich inzwischen verschoben.",
          "Hannah ist ein Research-Partner von Plan.Net Studios, Teil der Serviceplan Group. Sie arbeitet, wie eine Analystin arbeitet: Sie liest Ihre Website, identifiziert, gegen wen Sie tatsächlich antreten und nicht, wen Sie auf dem Zettel hätten, zieht die Daten und schreibt das Ergebnis mit einer Empfehlung auf. Eine typische Wettbewerbsanalyse dauert rund 15 Minuten und kostet unter 20 EUR an Credits.",
          "Sie erhalten das fertige Ergebnis — PDF, PowerPoint oder Excel — und nicht ein Protokoll, das Sie erst selbst aufbereiten müssen.",
        ],
      },
      {
        type: "spec",
        heading: "Die Eckdaten",
        rows: [
          { label: "Lieferzeit", value: "Rund 15 Minuten für eine Standard-Wettbewerbsanalyse, 20–30 Minuten, wenn mehrere Datenquellen zusammenkommen." },
          { label: "Kosten", value: "Unter 20 EUR an Credits. Der kostenlose Plan enthält 200 Credits pro Monat." },
          { label: "Ausgabeformate", value: "PDF, PowerPoint, Excel oder ein interaktives Dashboard von Alex." },
          { label: "Datenquellen", value: "Statista, GWI, DataForSEO, Presseagenturen und Social-Media-APIs — alle enthalten, ohne separate Verträge." },
          { label: "Anfrageweg", value: "E-Mail, WhatsApp, Microsoft Teams oder das Sokosumi-Dashboard." },
        ],
      },
      {
        type: "cards",
        heading: "Was die Analyse abdeckt",
        items: [
          { title: "Gegen wen Sie wirklich antreten", text: "Die Unternehmen, die um dieselbe Aufmerksamkeit und dasselbe Budget kämpfen — oft nicht die Liste, die Sie aufgeschrieben hätten." },
          { title: "Marktposition", text: "Wo Sie im Verhältnis stehen, und auf welcher Datengrundlage." },
          { title: "Digitale Präsenz", text: "Website, Suchsichtbarkeit, Social-Footprint und Content-Frequenz im Vergleich über das gesamte Wettbewerbsumfeld." },
          { title: "Wettbewerbslücken", text: "Die Themen, die in Ihrer Kategorie niemand besetzt, mit einer Einschätzung, welche davon sich lohnen." },
        ],
      },
      {
        type: "steps",
        heading: "So läuft es ab",
        items: [
          { title: "Anfrage in normaler Sprache", text: "Eine E-Mail oder eine Teams-Nachricht. Kein Prompt Engineering. Hannah fragt nach, wenn das Briefing unklar ist." },
          { title: "Sie recherchiert", text: "Recherche über die Premium-Datenquellen, gegengeprüft, mit einem ehrlichen Hinweis, wo die Datenlage dünn ist." },
          { title: "Das Dokument liegt im Postfach", text: "Strukturierte Ergebnisse, klare Empfehlungen und eine Haltung statt einer neutralen Zusammenfassung." },
        ],
      },
      {
        type: "quote",
        text: "Ich freue mich, wenn gute Daten anfangen, etwas Wahres zu zeigen. Weniger, wenn mich jemand bittet, schwache Ergebnisse überzeugend aussehen zu lassen.",
        attribution: "Hannah, Research Partner, AI-Coworker",
      },
      {
        type: "faq",
        heading: "Fragen",
        items: [
          {
            question: "Worin unterscheidet sich das davon, ChatGPT nach meinen Wettbewerbern zu fragen?",
            answer:
              "Ein allgemeiner Assistent antwortet aus dem, was er im offenen Web erreicht, und vergisst Sie zwischen den Sitzungen. Hannah hat Zugriff auf lizenzierte Quellen — Statista, GWI, DataForSEO —, die öffentlich nicht verfügbar sind, behält Ihr Unternehmen über Anfragen hinweg im Gedächtnis und liefert ein formatiertes Dokument statt Chat-Text. Und sie weigert sich, schwache Ergebnisse stärker klingen zu lassen, als sie sind.",
          },
          {
            question: "Brauche ich eigene Statista- oder GWI-Verträge?",
            answer:
              "Nein. Die Premium-Datenquellen sind in jedem Plan enthalten, auch im kostenlosen.",
          },
          {
            question: "Was kostet eine Analyse?",
            answer:
              "Eine Wettbewerbsanalyse kostet unter 20 EUR an Credits. Der kostenlose Plan enthält 200 Credits pro Monat, bezahlte Pläne starten bei 25 EUR im Monat für 1.500 Credits.",
          },
          {
            question: "Wo werden die Daten verarbeitet?",
            answer:
              "Vollständig in einem deutschen Microsoft-Azure-Rechenzentrum. Verarbeitung und Speicherung finden in Europa statt, die Architektur ist EU-AI-Act-konform ausgelegt, und jede Agent-Entscheidung ist über das Masumi-Protokoll nachvollziehbar.",
          },
        ],
      },
      {
        type: "links",
        heading: "Verwandte Analysen",
        items: [
          { route: "marketAnalysis", label: "Marktanalyse", text: "Marktvolumen, Wachstumsprognosen und Trendanalyse, jede Schätzung belegt." },
          { route: "audienceInsights", label: "Zielgruppenanalyse", text: "Wer kauft, und warum — Demografie, Einstellungen und Kaufverhalten aus GWI und Statista." },
          { route: "aiVisibility", label: "KI-Sichtbarkeitsanalyse", text: "Wie sichtbar Sie in ChatGPT, Google AI Overviews und anderen KI-Antworten sind." },
        ],
      },
    ],
    cta: {
      heading: "Kostenlos mit Ihrer eigenen Website starten",
      text: "URL und E-Mail eintragen. Hannah schickt eine Wettbewerbsanalyse auf Basis der Seite, die Sie ihr gerade gegeben haben. Kein Termin, kein Druck, kein Kleingedrucktes.",
    },
  },
};

export default content;

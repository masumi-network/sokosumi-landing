import type { LandingPageContent } from "@/lib/landing/types";

const content: LandingPageContent = {
  en: {
    title: "Free Competitive Analysis Tool | Serviceplan Agents",
    description:
      "Enter your website URL and get a competitive analysis back by email — free, no call, no credit card. Built on Statista, GWI and DataForSEO by Serviceplan's AI research partner.",
    eyebrow: "Free tool",
    h1: "Free competitive analysis",
    lede:
      "Give Hannah one URL. She works out who you are actually competing against, pulls the data from licensed sources, and emails back a written analysis. No call, no credit card, no fine print.",
    sections: [
      {
        type: "steps",
        heading: "How it works",
        items: [
          { title: "Enter your URL and email", text: "That is the entire input. Hannah reads the site herself rather than asking you to describe your category." },
          { title: "She researches", text: "Competitor set, market position, digital presence and gaps — drawn from Statista, GWI, DataForSEO and social platform data." },
          { title: "The analysis arrives", text: "A written document with findings, a stated point of view and concrete suggestions. Typically within about 15 minutes." },
        ],
      },
      {
        type: "prose",
        heading: "Why it is free",
        body: [
          "Because the fastest way to judge research is to read some. Descriptions of AI output all sound the same; the document either tells you something you did not know about your own market or it does not.",
          "There is no follow-up call attached to this, and no sales sequence. If the analysis is useful you can keep going on the free plan, which includes 200 credits a month.",
        ],
      },
      {
        type: "cards",
        heading: "What comes back",
        items: [
          { title: "Your real competitor set", text: "Often not the list you would have written down, and that difference is usually the useful part." },
          { title: "Where you stand", text: "Market position and digital presence measured against that set rather than described in general terms." },
          { title: "Open gaps", text: "The positions nobody in your category is holding, with a view on which are worth taking." },
          { title: "An honest data note", text: "Where the evidence is thin, the document says so instead of rounding it up into confidence." },
        ],
      },
      {
        type: "faq",
        heading: "Questions",
        items: [
          {
            question: "Do I need a credit card?",
            answer: "No. The free analysis needs a URL and an email address. The free plan afterwards also has no card requirement.",
          },
          {
            question: "How long does it take?",
            answer: "A competitive analysis typically takes about 15 minutes. Hannah emails you when it is ready.",
          },
          {
            question: "What happens to my data?",
            answer:
              "It is processed in a German Microsoft Azure data centre and stays in Europe. You are agreeing to the privacy policy and terms of use linked below the form, and there is no sales call attached.",
          },
          {
            question: "Can I ask for something other than a competitive analysis?",
            answer:
              "Yes, once you are on the platform. Market analysis, audience insights, AI visibility and content audits are all part of the same free plan — just send the request by email.",
          },
        ],
      },
      {
        type: "links",
        heading: "The other analyses",
        items: [
          { route: "competitiveAnalysis", label: "Competitive analysis in full", text: "What the finished document covers, and what it costs beyond the free run." },
          { route: "marketAnalysis", label: "Market analysis", text: "Market volume, forecasts and trends with documented sources." },
          { route: "aiVisibility", label: "AI visibility analysis", text: "Whether AI answer engines cite you or a competitor." },
        ],
      },
    ],
    cta: {
      heading: "Run it now",
      text: "URL and email. That is all Hannah needs to get started.",
    },
  },

  de: {
    title: "Kostenlose Wettbewerbsanalyse — Tool | Serviceplan Agents",
    description:
      "Website-URL eingeben und eine Wettbewerbsanalyse per E-Mail erhalten — kostenlos, ohne Termin, ohne Kreditkarte. Auf Basis von Statista, GWI und DataForSEO.",
    eyebrow: "Kostenloses Tool",
    h1: "Kostenlose Wettbewerbsanalyse",
    lede:
      "Geben Sie Hannah eine URL. Sie ermittelt, gegen wen Sie tatsächlich antreten, zieht die Daten aus lizenzierten Quellen und schickt eine geschriebene Analyse per E-Mail zurück. Kein Termin, keine Kreditkarte, kein Kleingedrucktes.",
    sections: [
      {
        type: "steps",
        heading: "So läuft es ab",
        items: [
          { title: "URL und E-Mail eintragen", text: "Mehr Eingabe braucht es nicht. Hannah liest die Seite selbst, statt Sie Ihre Kategorie beschreiben zu lassen." },
          { title: "Sie recherchiert", text: "Wettbewerbsumfeld, Marktposition, digitale Präsenz und Lücken — aus Statista, GWI, DataForSEO und Social-Plattform-Daten." },
          { title: "Die Analyse kommt an", text: "Ein geschriebenes Dokument mit Ergebnissen, einer klaren Haltung und konkreten Vorschlägen. In der Regel innerhalb von rund 15 Minuten." },
        ],
      },
      {
        type: "prose",
        heading: "Warum das kostenlos ist",
        body: [
          "Weil man Research am schnellsten beurteilt, indem man welchen liest. Beschreibungen von KI-Output klingen alle gleich. Das Dokument sagt Ihnen entweder etwas über Ihren eigenen Markt, das Sie nicht wussten, oder eben nicht.",
          "Daran hängt kein Rückruf und keine Vertriebsstrecke. Wenn die Analyse nützlich ist, können Sie im kostenlosen Plan weitermachen, der 200 Credits pro Monat enthält.",
        ],
      },
      {
        type: "cards",
        heading: "Was zurückkommt",
        items: [
          { title: "Ihr echtes Wettbewerbsumfeld", text: "Oft nicht die Liste, die Sie aufgeschrieben hätten — und genau dieser Unterschied ist meist der nützliche Teil." },
          { title: "Wo Sie stehen", text: "Marktposition und digitale Präsenz gemessen an diesem Umfeld, nicht allgemein beschrieben." },
          { title: "Offene Lücken", text: "Die Positionen, die in Ihrer Kategorie niemand besetzt, mit einer Einschätzung, welche sich lohnen." },
          { title: "Ein ehrlicher Datenhinweis", text: "Wo die Belege dünn sind, steht das im Dokument, statt zu Zuversicht aufgerundet zu werden." },
        ],
      },
      {
        type: "faq",
        heading: "Fragen",
        items: [
          {
            question: "Brauche ich eine Kreditkarte?",
            answer: "Nein. Für die kostenlose Analyse genügen URL und E-Mail-Adresse. Auch der kostenlose Plan danach verlangt keine Karte.",
          },
          {
            question: "Wie lange dauert es?",
            answer: "Eine Wettbewerbsanalyse dauert in der Regel rund 15 Minuten. Hannah schickt eine E-Mail, sobald sie fertig ist.",
          },
          {
            question: "Was passiert mit meinen Daten?",
            answer:
              "Sie werden in einem deutschen Microsoft-Azure-Rechenzentrum verarbeitet und bleiben in Europa. Sie stimmen der Datenschutzerklärung und den Nutzungsbedingungen zu, die unter dem Formular verlinkt sind. Ein Vertriebsanruf ist damit nicht verbunden.",
          },
          {
            question: "Kann ich etwas anderes als eine Wettbewerbsanalyse anfragen?",
            answer:
              "Ja, sobald Sie auf der Plattform sind. Marktanalyse, Zielgruppen-Insights, KI-Sichtbarkeit und Content-Audits gehören alle zum selben kostenlosen Plan — einfach per E-Mail anfragen.",
          },
        ],
      },
      {
        type: "links",
        heading: "Die anderen Analysen",
        items: [
          { route: "competitiveAnalysis", label: "Wettbewerbsanalyse im Detail", text: "Was das fertige Dokument abdeckt und was es über den kostenlosen Lauf hinaus kostet." },
          { route: "marketAnalysis", label: "Marktanalyse", text: "Marktvolumen, Prognosen und Trends mit belegten Quellen." },
          { route: "aiVisibility", label: "KI-Sichtbarkeitsanalyse", text: "Ob KI-Antwortmaschinen Sie zitieren oder einen Wettbewerber." },
        ],
      },
    ],
    cta: {
      heading: "Jetzt starten",
      text: "URL und E-Mail. Mehr braucht Hannah nicht.",
    },
  },
};

export default content;

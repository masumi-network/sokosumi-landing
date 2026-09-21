import type { LandingPageContent } from "@/lib/landing/types";

const content: LandingPageContent = {
  en: {
    title: "Market Analysis with AI | Serviceplan Agents",
    description:
      "Market volume, growth forecasts and trend analysis with every estimate documented and traceable. A finished market analysis in about 15 minutes, from under 20 EUR.",
    eyebrow: "Use case",
    h1: "Market analysis you can show a board",
    lede:
      "How big is the market, and where is it heading? Hannah pulls market volume, growth forecasts and trend analysis from licensed sources — and documents where every number came from, so the estimates survive being questioned.",
    sections: [
      {
        type: "prose",
        heading: "Estimates that hold up",
        body: [
          "The problem with fast market sizing is rarely the speed. It is that the number arrives without a chain of reasoning behind it, and the first person to ask \"where does that come from?\" ends the conversation.",
          "Hannah works from Statista market data and GWI consumer research rather than from whatever is reachable on the open web, and she documents each estimate so it can be traced back. Where the underlying data is thin, she says so in the document instead of smoothing it over.",
          "A market analysis takes about 15 minutes and costs under 20 EUR in credits. You get it as a PDF or PowerPoint, ready to present.",
        ],
      },
      {
        type: "spec",
        heading: "The specifics",
        rows: [
          { label: "Delivery time", value: "About 15 minutes; 20–30 minutes for research spanning several sources." },
          { label: "Cost", value: "Under 20 EUR in credits. 200 credits a month are included free." },
          { label: "Output formats", value: "PDF, PowerPoint, Excel, or an interactive dashboard." },
          { label: "Data sources", value: "Statista for market data and statistics, GWI for consumer behaviour, press agencies for news research, plus search and social data." },
          { label: "Traceability", value: "Every estimate is documented with its source, and data-quality caveats are stated rather than hidden." },
        ],
      },
      {
        type: "cards",
        heading: "What a market analysis covers",
        items: [
          { title: "Market volume", text: "Current size of the market you are actually in, with the definition used to bound it made explicit." },
          { title: "Growth forecasts", text: "Where the market is heading, and on whose projections." },
          { title: "Trend analysis", text: "The shifts that are moving the category, separated from the ones that are only being talked about." },
          { title: "Documented assumptions", text: "The reasoning behind each figure, so the analysis can be defended rather than just presented." },
        ],
      },
      {
        type: "steps",
        heading: "How it works",
        items: [
          { title: "Describe the market in plain language", text: "\"How big is the German market for refurbished laptops, and where is it going?\" is enough of a brief. Hannah asks follow-up questions if the boundaries are unclear." },
          { title: "She researches and sources", text: "Licensed data first, cross-checked, with the definition of the market stated so the number means something." },
          { title: "The document arrives", text: "Findings, forecast, and an honest note on how firm the underlying data is." },
        ],
      },
      {
        type: "faq",
        heading: "Questions",
        items: [
          {
            question: "Can I use this for a business plan?",
            answer:
              "Yes — market sizing with documented sources is exactly the section of a business plan that gets questioned hardest, and the traceability is the point. You can ask Hannah to structure the output for that use.",
          },
          {
            question: "Which markets can she cover?",
            answer:
              "Coverage follows the underlying data. Statista and GWI are broad across consumer and B2B categories in Europe and globally; where a market is too narrow to be covered well, Hannah says so rather than producing a confident-looking guess.",
          },
          {
            question: "Do I need a Statista licence?",
            answer:
              "No. The premium data sources are included in every plan, including the free tier — no separate contracts.",
          },
        ],
      },
      {
        type: "links",
        heading: "Related analyses",
        items: [
          { route: "competitiveAnalysis", label: "Competitive analysis", text: "Who you actually compete with, where you stand and which gaps are open." },
          { route: "audienceInsights", label: "Audience insights", text: "Demographics, attitudes and purchase behaviour from global consumer data." },
          { route: "agentHannah", label: "Meet Hannah", text: "The research partner behind every analysis on this page." },
        ],
      },
    ],
    cta: {
      heading: "Start with a free analysis",
      text: "Give Hannah your website URL and she will come back with a competitive analysis for your market — free, and without a follow-up call.",
    },
  },

  de: {
    title: "Marktanalyse mit KI | Serviceplan Agents",
    description:
      "Marktvolumen, Wachstumsprognosen und Trendanalyse — jede Schätzung belegt und nachvollziehbar. Fertige Marktanalyse in rund 15 Minuten, ab unter 20 EUR.",
    eyebrow: "Anwendungsfall",
    h1: "Marktanalyse, die einer Nachfrage standhält",
    lede:
      "Wie groß ist der Markt, und wohin bewegt er sich? Hannah zieht Marktvolumen, Wachstumsprognosen und Trendanalyse aus lizenzierten Quellen — und belegt jede Zahl, damit die Schätzung auch die erste kritische Rückfrage übersteht.",
    sections: [
      {
        type: "prose",
        heading: "Schätzungen, die tragen",
        body: [
          "Das Problem an schneller Marktdimensionierung ist selten das Tempo. Es ist, dass die Zahl ohne Herleitung ankommt — und die erste Person, die fragt „woher kommt das?“, beendet die Diskussion.",
          "Hannah arbeitet mit Statista-Marktdaten und GWI-Konsumentenforschung statt mit dem, was im offenen Web gerade greifbar ist, und dokumentiert jede Schätzung so, dass sie zurückverfolgt werden kann. Wo die Datenlage dünn ist, steht das im Dokument, statt geglättet zu werden.",
          "Eine Marktanalyse dauert rund 15 Minuten und kostet unter 20 EUR an Credits. Sie kommt als PDF oder PowerPoint, präsentationsfertig.",
        ],
      },
      {
        type: "spec",
        heading: "Die Eckdaten",
        rows: [
          { label: "Lieferzeit", value: "Rund 15 Minuten, 20–30 Minuten bei Recherche über mehrere Quellen." },
          { label: "Kosten", value: "Unter 20 EUR an Credits. 200 Credits pro Monat sind kostenlos enthalten." },
          { label: "Ausgabeformate", value: "PDF, PowerPoint, Excel oder ein interaktives Dashboard." },
          { label: "Datenquellen", value: "Statista für Marktdaten und Statistiken, GWI für Konsumverhalten, Presseagenturen für News-Recherche, dazu Such- und Social-Daten." },
          { label: "Nachvollziehbarkeit", value: "Jede Schätzung ist mit Quelle dokumentiert, Einschränkungen der Datenqualität werden benannt statt versteckt." },
        ],
      },
      {
        type: "cards",
        heading: "Was eine Marktanalyse abdeckt",
        items: [
          { title: "Marktvolumen", text: "Die aktuelle Größe des Marktes, in dem Sie tatsächlich sind — mit der Abgrenzung, die dabei zugrunde gelegt wurde." },
          { title: "Wachstumsprognosen", text: "Wohin sich der Markt entwickelt, und auf wessen Projektionen." },
          { title: "Trendanalyse", text: "Die Verschiebungen, die die Kategorie wirklich bewegen — getrennt von denen, über die nur geredet wird." },
          { title: "Belegte Annahmen", text: "Die Herleitung hinter jeder Zahl, damit die Analyse verteidigt und nicht nur vorgetragen werden kann." },
        ],
      },
      {
        type: "steps",
        heading: "So läuft es ab",
        items: [
          { title: "Markt in normaler Sprache beschreiben", text: "„Wie groß ist der deutsche Markt für refurbished Laptops, und wohin geht er?“ reicht als Briefing. Hannah fragt nach, wenn die Abgrenzung unklar ist." },
          { title: "Sie recherchiert und belegt", text: "Lizenzierte Daten zuerst, gegengeprüft, mit expliziter Marktdefinition, damit die Zahl etwas bedeutet." },
          { title: "Das Dokument kommt an", text: "Ergebnisse, Prognose und ein ehrlicher Hinweis darauf, wie belastbar die Datenbasis ist." },
        ],
      },
      {
        type: "faq",
        heading: "Fragen",
        items: [
          {
            question: "Kann ich das für einen Businessplan nutzen?",
            answer:
              "Ja — die Marktdimensionierung mit belegten Quellen ist genau der Abschnitt eines Businessplans, der am härtesten hinterfragt wird, und die Nachvollziehbarkeit ist hier der Punkt. Sie können Hannah bitten, die Ausgabe entsprechend zu strukturieren.",
          },
          {
            question: "Welche Märkte kann sie abdecken?",
            answer:
              "Die Abdeckung folgt der Datenbasis. Statista und GWI sind breit über Consumer- und B2B-Kategorien in Europa und weltweit aufgestellt. Wo ein Markt zu eng für eine belastbare Abdeckung ist, sagt Hannah das, statt eine selbstbewusst wirkende Schätzung zu liefern.",
          },
          {
            question: "Brauche ich eine Statista-Lizenz?",
            answer:
              "Nein. Die Premium-Datenquellen sind in jedem Plan enthalten, auch im kostenlosen — ohne separate Verträge.",
          },
        ],
      },
      {
        type: "links",
        heading: "Verwandte Analysen",
        items: [
          { route: "competitiveAnalysis", label: "Wettbewerbsanalyse", text: "Gegen wen Sie wirklich antreten, wo Sie stehen und welche Lücken offen sind." },
          { route: "audienceInsights", label: "Zielgruppenanalyse", text: "Demografie, Einstellungen und Kaufverhalten aus globalen Konsumentendaten." },
          { route: "agentHannah", label: "Hannah kennenlernen", text: "Der Research-Partner hinter jeder Analyse auf dieser Seite." },
        ],
      },
    ],
    cta: {
      heading: "Mit einer kostenlosen Analyse starten",
      text: "Geben Sie Hannah Ihre Website-URL, und sie liefert eine Wettbewerbsanalyse für Ihren Markt — kostenlos und ohne Rückruf.",
    },
  },
};

export default content;

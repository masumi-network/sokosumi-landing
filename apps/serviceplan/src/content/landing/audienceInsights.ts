import type { LandingPageContent } from "@/lib/landing/types";

const content: LandingPageContent = {
  en: {
    title: "Audience Insights from GWI and Statista | Serviceplan Agents",
    description:
      "Who buys your products and why. Demographics, attitudes and purchase behaviour from global consumer data, delivered as a document in about 15 minutes for roughly 15 EUR.",
    eyebrow: "Use case",
    h1: "Audience insights, without the licence",
    lede:
      "Demographics, attitudes and purchasing behaviour drawn from GWI and Statista global consumer data. Hannah writes it up as a document — and the data licences are already included in your plan.",
    sections: [
      {
        type: "prose",
        heading: "The data most teams cannot reach",
        body: [
          "Good audience work usually stalls on access. GWI and Statista are the sources that answer attitudinal questions properly, and both sit behind licences priced for large research departments. Teams without one fall back on platform analytics, which describe the people who already found you, not the people you are trying to reach.",
          "Every Serviceplan Agents plan includes those sources, including the free tier. You ask the question in an email; Hannah queries the data and returns a written analysis with a point of view.",
          "An audience analysis takes about 15 minutes and costs roughly 15 EUR in credits.",
        ],
      },
      {
        type: "spec",
        heading: "The specifics",
        rows: [
          { label: "Delivery time", value: "About 15 minutes." },
          { label: "Cost", value: "Approximately 15 EUR in credits. The free plan includes 200 credits a month." },
          { label: "Output formats", value: "PDF or PowerPoint; Excel and dashboards on request." },
          { label: "Data sources", value: "GWI for audience insights and consumer behaviour, Statista for market context, plus social platform data." },
          { label: "Contracts required", value: "None. All sources are included in the plan." },
        ],
      },
      {
        type: "cards",
        heading: "What you can ask",
        items: [
          { title: "Who buys, and why", text: "The demographic and attitudinal profile of the people actually converting in your category." },
          { title: "B2B decision makers", text: "Role, seniority and the media they actually consume, rather than the ones a persona template assumes." },
          { title: "Attitudes and values", text: "What the segment believes and prioritises — the part that shapes messaging rather than targeting." },
          { title: "Channel behaviour", text: "Where the audience spends attention, so the media plan follows evidence." },
        ],
      },
      {
        type: "steps",
        heading: "How it works",
        items: [
          { title: "Ask in plain language", text: "\"Who buys premium pet food in Germany, and what do they care about?\" Hannah narrows the segment with you if it is too broad to be useful." },
          { title: "She queries the licensed data", text: "GWI and Statista first, cross-referenced with social and search behaviour where it adds something." },
          { title: "You get a written analysis", text: "Segments, evidence and a recommendation — not a table of percentages you still have to interpret." },
        ],
      },
      {
        type: "faq",
        heading: "Questions",
        items: [
          {
            question: "Is this the same as the audience data in Meta or Google Ads?",
            answer:
              "No. Platform analytics describe people who already interacted with you on that platform. GWI is survey-based global consumer research, which is what lets you ask about attitudes, values and behaviour across a whole market rather than within one channel.",
          },
          {
            question: "Do I need my own GWI licence?",
            answer:
              "No. GWI and Statista access is included in every plan, including the free tier.",
          },
          {
            question: "Can she build personas from it?",
            answer:
              "Yes — ask for the output as personas and she will structure it that way. She will also tell you where a segment is too thinly evidenced to support one.",
          },
        ],
      },
      {
        type: "links",
        heading: "Related analyses",
        items: [
          { route: "marketAnalysis", label: "Market analysis", text: "Market volume, growth forecasts and trends with documented sources." },
          { route: "competitiveAnalysis", label: "Competitive analysis", text: "Who you compete with, where you stand and which gaps are open." },
          { route: "aiVisibility", label: "AI visibility analysis", text: "Whether your audience finds you in ChatGPT and AI search results." },
        ],
      },
    ],
    cta: {
      heading: "Start with a free analysis",
      text: "Enter your URL and Hannah returns a free competitive analysis for your category. From there, audience work is one email away.",
    },
  },

  de: {
    title: "Zielgruppenanalyse mit GWI und Statista | Serviceplan Agents",
    description:
      "Wer kauft Ihre Produkte und warum. Demografie, Einstellungen und Kaufverhalten aus globalen Konsumentendaten — als Dokument in rund 15 Minuten für etwa 15 EUR.",
    eyebrow: "Anwendungsfall",
    h1: "Zielgruppenanalyse, ohne eigene Lizenz",
    lede:
      "Demografie, Einstellungen und Kaufverhalten aus den globalen Konsumentendaten von GWI und Statista. Hannah schreibt daraus eine Analyse — und die Datenlizenzen sind in Ihrem Plan bereits enthalten.",
    sections: [
      {
        type: "prose",
        heading: "Die Daten, an die die meisten Teams nicht kommen",
        body: [
          "Gute Zielgruppenarbeit scheitert meist am Zugang. GWI und Statista sind die Quellen, die Einstellungsfragen sauber beantworten, und beide liegen hinter Lizenzen, die für große Research-Abteilungen kalkuliert sind. Teams ohne solche Lizenz weichen auf Plattform-Analytics aus — und die beschreiben die Menschen, die Sie schon gefunden haben, nicht die, die Sie erreichen wollen.",
          "Jeder Plan der Serviceplan Agents enthält diese Quellen, auch der kostenlose. Sie stellen die Frage per E-Mail, Hannah fragt die Daten ab und liefert eine geschriebene Analyse mit einer Haltung.",
          "Eine Zielgruppenanalyse dauert rund 15 Minuten und kostet etwa 15 EUR an Credits.",
        ],
      },
      {
        type: "spec",
        heading: "Die Eckdaten",
        rows: [
          { label: "Lieferzeit", value: "Rund 15 Minuten." },
          { label: "Kosten", value: "Etwa 15 EUR an Credits. Der kostenlose Plan enthält 200 Credits pro Monat." },
          { label: "Ausgabeformate", value: "PDF oder PowerPoint, auf Wunsch Excel und Dashboards." },
          { label: "Datenquellen", value: "GWI für Zielgruppen-Insights und Konsumverhalten, Statista für Marktkontext, dazu Social-Plattform-Daten." },
          { label: "Nötige Verträge", value: "Keine. Alle Quellen sind im Plan enthalten." },
        ],
      },
      {
        type: "cards",
        heading: "Was Sie fragen können",
        items: [
          { title: "Wer kauft, und warum", text: "Das demografische und einstellungsbezogene Profil der Menschen, die in Ihrer Kategorie tatsächlich konvertieren." },
          { title: "B2B-Entscheider", text: "Rolle, Seniorität und die Medien, die sie wirklich nutzen — nicht die, die eine Persona-Vorlage unterstellt." },
          { title: "Einstellungen und Werte", text: "Woran das Segment glaubt und was es priorisiert — der Teil, der die Botschaft prägt, nicht das Targeting." },
          { title: "Kanalverhalten", text: "Wo die Zielgruppe Aufmerksamkeit verbringt, damit der Mediaplan der Evidenz folgt." },
        ],
      },
      {
        type: "steps",
        heading: "So läuft es ab",
        items: [
          { title: "In normaler Sprache fragen", text: "„Wer kauft in Deutschland Premium-Tierfutter, und was ist diesen Menschen wichtig?“ Hannah grenzt das Segment mit Ihnen ein, wenn es zu breit ist, um nützlich zu sein." },
          { title: "Sie fragt die lizenzierten Daten ab", text: "GWI und Statista zuerst, abgeglichen mit Social- und Suchverhalten, wo das etwas beiträgt." },
          { title: "Sie erhalten eine geschriebene Analyse", text: "Segmente, Belege und eine Empfehlung — keine Prozenttabelle, die Sie noch interpretieren müssen." },
        ],
      },
      {
        type: "faq",
        heading: "Fragen",
        items: [
          {
            question: "Ist das dasselbe wie die Zielgruppendaten in Meta oder Google Ads?",
            answer:
              "Nein. Plattform-Analytics beschreiben Menschen, die bereits auf dieser Plattform mit Ihnen interagiert haben. GWI ist befragungsbasierte globale Konsumentenforschung — und genau das erlaubt Fragen zu Einstellungen, Werten und Verhalten über einen ganzen Markt hinweg statt innerhalb eines Kanals.",
          },
          {
            question: "Brauche ich eine eigene GWI-Lizenz?",
            answer:
              "Nein. Der Zugang zu GWI und Statista ist in jedem Plan enthalten, auch im kostenlosen.",
          },
          {
            question: "Kann sie daraus Personas bauen?",
            answer:
              "Ja — fragen Sie die Ausgabe als Personas an, dann strukturiert sie es so. Sie sagt Ihnen auch, wenn ein Segment zu dünn belegt ist, um eine Persona zu tragen.",
          },
        ],
      },
      {
        type: "links",
        heading: "Verwandte Analysen",
        items: [
          { route: "marketAnalysis", label: "Marktanalyse", text: "Marktvolumen, Wachstumsprognosen und Trends mit belegten Quellen." },
          { route: "competitiveAnalysis", label: "Wettbewerbsanalyse", text: "Gegen wen Sie antreten, wo Sie stehen und welche Lücken offen sind." },
          { route: "aiVisibility", label: "KI-Sichtbarkeitsanalyse", text: "Ob Ihre Zielgruppe Sie in ChatGPT und AI-Suchergebnissen findet." },
        ],
      },
    ],
    cta: {
      heading: "Mit einer kostenlosen Analyse starten",
      text: "URL eintragen, und Hannah liefert eine kostenlose Wettbewerbsanalyse für Ihre Kategorie. Von dort ist die Zielgruppenarbeit eine E-Mail entfernt.",
    },
  },
};

export default content;

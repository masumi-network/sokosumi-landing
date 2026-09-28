import type { LandingPageContent } from "@/lib/landing/types";

const content: LandingPageContent = {
  en: {
    title: "AI Visibility Analysis — GEO for ChatGPT and AI Search",
    description:
      "How visible is your company in ChatGPT, Google AI Overviews and other AI answers? Local rankings, AI mentions and visibility gaps against competitors, in about 15 minutes.",
    eyebrow: "Use case",
    h1: "AI visibility analysis",
    lede:
      "Search is no longer only ten blue links. Hannah checks how your company shows up in ChatGPT, Google AI Overviews and other AI answer engines — where you are cited, where a competitor is cited instead, and where nobody in your category is.",
    sections: [
      {
        type: "prose",
        heading: "The question behind GEO",
        body: [
          "Generative engine optimisation gets discussed as if it were a new discipline. In practice the useful question is narrower and older: when someone asks an AI assistant the question your customers ask, does your company appear in the answer, and if not, who does?",
          "That is measurable. Hannah runs the category questions, records which sources the answer engines actually cite, and compares your presence against the competitive set. She combines that with classic search visibility from DataForSEO, so you see both surfaces in one document rather than arguing about which one matters.",
          "The analysis takes about 15 minutes and costs under 20 EUR in credits.",
        ],
      },
      {
        type: "spec",
        heading: "The specifics",
        rows: [
          { label: "Delivery time", value: "About 15 minutes." },
          { label: "Cost", value: "Under 20 EUR in credits; 200 credits a month are included free." },
          { label: "Output formats", value: "PDF or PowerPoint, or an interactive dashboard built by Alex." },
          { label: "Data sources", value: "AI answer engines, DataForSEO search data, plus social and press signals." },
          { label: "Comparison", value: "Your visibility measured against the competitors identified in the analysis, not a list you supply from memory." },
        ],
      },
      {
        type: "cards",
        heading: "What the analysis reports",
        items: [
          { title: "AI mentions", text: "Where your company is named in AI answers to the questions your buyers actually ask." },
          { title: "Citation share", text: "Which sources the answer engines lean on in your category — often trade press and comparison sites rather than vendor pages." },
          { title: "Local and organic rankings", text: "Conventional search visibility alongside the AI picture, so you can see where the two disagree." },
          { title: "Visibility gaps", text: "The questions where a competitor is cited and you are not, ranked by whether the gap is worth closing." },
        ],
      },
      {
        type: "steps",
        heading: "How it works",
        items: [
          { title: "Send your URL", text: "Hannah derives the category and the question set from your site rather than asking you to guess at keywords." },
          { title: "She runs the checks", text: "Answer engines and search data, with the competitive set drawn from the same research rather than assumed." },
          { title: "You get the gaps, ranked", text: "Where you are invisible, who is visible instead, and which of those gaps is worth acting on first." },
        ],
      },
      {
        type: "faq",
        heading: "Questions",
        items: [
          {
            question: "What is GEO, and is it different from SEO?",
            answer:
              "Generative engine optimisation is the work of being found and cited inside AI-generated answers rather than inside a ranked list of links. It overlaps heavily with SEO — the same content quality and source authority signals matter — but the measurement is different, because there is no ranking position to check. What you measure instead is whether you are cited, and by which engine, for which question.",
          },
          {
            question: "Which AI systems does it cover?",
            answer:
              "The analysis covers the major AI answer surfaces alongside conventional search results. Coverage moves as the engines change; Hannah states in each report which surfaces she checked and when.",
          },
          {
            question: "Can nobody guarantee AI citations?",
            answer:
              "Correct, and you should be wary of anyone who says otherwise. This analysis measures your current visibility and identifies gaps. It does not promise placement in any AI answer.",
          },
        ],
      },
      {
        type: "links",
        heading: "Related analyses",
        items: [
          { route: "competitiveAnalysis", label: "Competitive analysis", text: "Who you compete with, where you stand and which gaps are open." },
          { route: "audienceInsights", label: "Audience insights", text: "Who is asking the questions, and what they care about." },
          { route: "aiMarketingAgency", label: "AI marketing agency", text: "What it means to have Europe's largest independent agency group behind the agents." },
        ],
      },
    ],
    cta: {
      heading: "Check your own AI visibility, free",
      text: "Enter your URL and email. Hannah runs a free analysis on the site you give her and sends it back — no call, no pressure.",
    },
  },

  de: {
    title: "KI-Sichtbarkeit und GEO-Analyse | Serviceplan Agents",
    description:
      "Wie sichtbar ist Ihr Unternehmen in ChatGPT, Google AI Overviews und anderen KI-Antworten? Rankings, KI-Erwähnungen und Sichtbarkeitslücken zum Wettbewerb in rund 15 Minuten.",
    eyebrow: "Anwendungsfall",
    h1: "KI-Sichtbarkeit und GEO-Analyse",
    lede:
      "Suche sind längst nicht mehr nur zehn blaue Links. Hannah prüft, wie Ihr Unternehmen in ChatGPT, Google AI Overviews und anderen KI-Antwortmaschinen auftaucht — wo Sie zitiert werden, wo stattdessen ein Wettbewerber steht und wo in Ihrer Kategorie niemand steht.",
    sections: [
      {
        type: "prose",
        heading: "Die Frage hinter GEO",
        body: [
          "Generative Engine Optimization wird diskutiert, als wäre sie eine neue Disziplin. In der Praxis ist die nützliche Frage enger und älter: Wenn jemand einen KI-Assistenten das fragt, was Ihre Kundinnen und Kunden fragen — taucht Ihr Unternehmen in der Antwort auf, und wenn nicht, wer dann?",
          "Das ist messbar. Hannah stellt die Kategoriefragen, protokolliert, welche Quellen die Antwortmaschinen tatsächlich zitieren, und vergleicht Ihre Präsenz mit dem Wettbewerbsumfeld. Dazu kommt die klassische Suchsichtbarkeit aus DataForSEO, sodass Sie beide Oberflächen in einem Dokument sehen, statt zu diskutieren, welche zählt.",
          "Die Analyse dauert rund 15 Minuten und kostet unter 20 EUR an Credits.",
        ],
      },
      {
        type: "spec",
        heading: "Die Eckdaten",
        rows: [
          { label: "Lieferzeit", value: "Rund 15 Minuten." },
          { label: "Kosten", value: "Unter 20 EUR an Credits, 200 Credits pro Monat sind kostenlos enthalten." },
          { label: "Ausgabeformate", value: "PDF oder PowerPoint, oder ein interaktives Dashboard von Alex." },
          { label: "Datenquellen", value: "KI-Antwortmaschinen, DataForSEO-Suchdaten sowie Social- und Pressesignale." },
          { label: "Vergleich", value: "Ihre Sichtbarkeit gemessen an den Wettbewerbern aus der Analyse, nicht an einer aus dem Gedächtnis gelieferten Liste." },
        ],
      },
      {
        type: "cards",
        heading: "Was die Analyse berichtet",
        items: [
          { title: "KI-Erwähnungen", text: "Wo Ihr Unternehmen in KI-Antworten auf die Fragen genannt wird, die Ihre Käufer wirklich stellen." },
          { title: "Zitationsanteil", text: "Auf welche Quellen sich die Antwortmaschinen in Ihrer Kategorie stützen — oft Fachpresse und Vergleichsseiten statt Anbieterseiten." },
          { title: "Lokale und organische Rankings", text: "Klassische Suchsichtbarkeit neben dem KI-Bild, damit sichtbar wird, wo beide auseinanderlaufen." },
          { title: "Sichtbarkeitslücken", text: "Die Fragen, bei denen ein Wettbewerber zitiert wird und Sie nicht — sortiert danach, ob sich das Schließen lohnt." },
        ],
      },
      {
        type: "steps",
        heading: "So läuft es ab",
        items: [
          { title: "URL schicken", text: "Hannah leitet Kategorie und Fragenset aus Ihrer Website ab, statt Sie nach Keywords raten zu lassen." },
          { title: "Sie führt die Prüfungen durch", text: "Antwortmaschinen und Suchdaten, mit einem Wettbewerbsumfeld aus derselben Recherche statt aus Annahmen." },
          { title: "Sie erhalten die Lücken, priorisiert", text: "Wo Sie unsichtbar sind, wer stattdessen sichtbar ist, und welche Lücke sich zuerst lohnt." },
        ],
      },
      {
        type: "faq",
        heading: "Fragen",
        items: [
          {
            question: "Was ist GEO, und unterscheidet es sich von SEO?",
            answer:
              "Generative Engine Optimization ist die Arbeit daran, in KI-generierten Antworten gefunden und zitiert zu werden statt in einer Rankingliste von Links. Es überschneidet sich stark mit SEO — dieselben Signale für Inhaltsqualität und Quellenautorität zählen —, aber die Messung ist eine andere, weil es keine Rankingposition gibt. Gemessen wird stattdessen, ob Sie zitiert werden, von welcher Engine und zu welcher Frage.",
          },
          {
            question: "Welche KI-Systeme deckt die Analyse ab?",
            answer:
              "Die Analyse deckt die relevanten KI-Antwortoberflächen neben den klassischen Suchergebnissen ab. Die Abdeckung verschiebt sich, wenn sich die Engines verändern. Hannah nennt in jedem Report, welche Oberflächen sie wann geprüft hat.",
          },
          {
            question: "Kann niemand KI-Zitationen garantieren?",
            answer:
              "Richtig, und Sie sollten misstrauisch werden, wenn jemand etwas anderes behauptet. Diese Analyse misst Ihre aktuelle Sichtbarkeit und benennt Lücken. Sie verspricht keine Platzierung in irgendeiner KI-Antwort.",
          },
        ],
      },
      {
        type: "links",
        heading: "Verwandte Analysen",
        items: [
          { route: "competitiveAnalysis", label: "Wettbewerbsanalyse", text: "Gegen wen Sie antreten, wo Sie stehen und welche Lücken offen sind." },
          { route: "audienceInsights", label: "Zielgruppenanalyse", text: "Wer die Fragen stellt, und was diesen Menschen wichtig ist." },
          { route: "aiMarketingAgency", label: "KI-Marketing-Agentur", text: "Was es bedeutet, Europas größte unabhängige Agenturgruppe hinter den Agents zu haben." },
        ],
      },
    ],
    cta: {
      heading: "Eigene KI-Sichtbarkeit kostenlos prüfen",
      text: "URL und E-Mail eintragen. Hannah führt eine kostenlose Analyse für die Seite durch, die Sie ihr geben, und schickt sie zurück — ohne Termin, ohne Druck.",
    },
  },
};

export default content;

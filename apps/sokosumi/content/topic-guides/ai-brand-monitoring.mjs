import { topic } from "../topic-guide-builder.mjs";

const sources = [
  ["Generative AI performance report (Search) — Google Search Console Help", "https://support.google.com/webmasters/answer/16984139"],
  ["Search generative AI control — Google Search Console Help", "https://support.google.com/webmasters/answer/16908024"],
  ["New AI Visibility Insights in Bing Webmaster Tools: Intents, Topics, Citation Share", "https://blogs.bing.com/search/June-2026/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare"],
  ["Introducing AI Performance in Bing Webmaster Tools (public preview)", "https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview"],
  ["AI features and your website — Google Search Central", "https://developers.google.com/search/docs/appearance/ai-features"],
];

const quellen = [
  ["Bericht zur Leistung generativer KI (Suche) — Google Search Console-Hilfe", "https://support.google.com/webmasters/answer/16984139"],
  ["Steuerung für generative KI in der Suche — Google Search Console-Hilfe", "https://support.google.com/webmasters/answer/16908024"],
  ["New AI Visibility Insights in Bing Webmaster Tools: Intents, Topics, Citation Share", "https://blogs.bing.com/search/June-2026/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare"],
  ["Introducing AI Performance in Bing Webmaster Tools (Public Preview)", "https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview"],
  ["KI-Funktionen und deine Website — Google Search Central", "https://developers.google.com/search/docs/appearance/ai-features"],
];

export default {
  slug: "ai-brand-monitoring",
  category: "advanced",
  order: 201,
  en: {
    title: "AI brand monitoring: what the platforms actually report",
    description:
      "Google and Microsoft both publish AI-answer visibility data, and they measure different things. What each report contains, what neither contains, and how to build a defensible baseline.",
    body: topic("en", {
      intro: [
        "Classic media monitoring counts mentions. AI answer engines mostly do not expose mentions — they expose **citations**, which is a narrower thing: a link to your site shown as a source. Before buying a tool or setting a target, it is worth knowing exactly which numbers the platforms themselves publish, because that is the only first-party evidence you will get.",
        "Two platforms publish anything at all today. They disagree about what is worth counting, and the gap between them is where most confusion about \"AI share of voice\" comes from.",
      ],
      stateIntro: [
        "Everything below is from the platforms' own documentation, not from vendor benchmarks.",
      ],
      state: [
        "**Google reports impressions only.** The Generative AI performance report counts \"how many times links to your site were shown to a user in a generative AI feature on Google Search,\" across AI Overviews and AI Mode. It breaks down by pages, countries, dates and devices.",
        "**Google gives you no query data there.** The report has no clicks, no CTR, no position and no query dimension. AI-feature traffic is also folded into the ordinary Performance report under search type \"Web\" rather than split out.",
        "**Not every property has it.** Google states the report is rolling out over time, so an empty report is not evidence of zero visibility.",
        "**Microsoft reports citations, and one share metric.** Bing Webmaster Tools' AI Performance covers Copilot, AI-generated summaries in Bing and select partner integrations, with Total Citations, Average Cited Pages and page-level citation activity.",
        "**\"Grounding queries\" are not user prompts.** Microsoft defines them as the phrases the AI used when retrieving content — the retrieval layer, not what a person typed. Treating them as keyword data is a category error.",
        "**Citation Share is the closest thing to share of voice** — \"the percentage of citations attributed to your site out of all citations shown across all sites for that same grounding query.\" Microsoft is explicit that it is \"designed as an observational metric – not a ranking system or a competitive scoreboard. It does not expose competitor domains, represent traffic share, or assign quality scores.\"",
        "**Opting out is scoped and reversible.** Google's Search generative AI control governs appearance in AI Overviews, AI Mode and generative AI in Discover; opting out forfeits impressions and traffic from those surfaces, is not a ranking signal elsewhere, and does not affect AI training.",
      ],
      workIntro: [
        "The aim is a baseline you can defend in a review, not a dashboard number nobody can source.",
      ],
      work: [
        "Turn on both reports before you need them. Neither backfills, so the first month you look is the earliest month you will ever have.",
        "Record Google impressions by page, not by brand. That is the only dimension Google gives you, so build the reporting around it rather than around queries you cannot see.",
        "Record Bing Total Citations and, where available, Citation Share by grounding query. Label these clearly as citations, never as mentions.",
        "Keep the two sources separate in every report. They count different events on different surfaces; a combined \"AI visibility score\" destroys the only property that makes them useful — knowing what was measured.",
        "For anything the platforms do not report — whether a model names your brand in prose, and how it characterises you — run your own prompt sample on a fixed prompt set, a fixed date and a stated model version, and label it as sampling.",
        "Re-run that sample on the same prompts each month. A moving prompt set produces a moving number that means nothing.",
      ],
      measureIntro: [
        "Pick metrics you can point at a source for.",
      ],
      measure: [
        "AI-feature impressions per page, per month, from Search Console — the trend matters more than the absolute number.",
        "Total Citations and Average Cited Pages from Bing Webmaster Tools.",
        "Citation Share per grounding query, read as an observation about that query, not as a competitive standing.",
        "Your own prompt-sample results, versioned by model and date, reported as a sample with its size stated.",
        "Assisted outcomes: branded search volume and direct traffic, which are the places where answer-engine exposure without a click tends to surface.",
      ],
      risks: [
        "Reporting citations as \"mentions.\" Neither platform reports whether a model said your name in the answer text; both report link citations.",
        "Buying a \"competitor share of voice in LLM answers\" number and treating it as platform data. Microsoft explicitly does not expose competitor domains, and Google exposes nothing at query level — so a named-competitor figure comes from a vendor's own prompt sampling, with that vendor's prompt set and sampling error.",
        "Reading an empty Google report as zero visibility while the feature is still rolling out to properties.",
        "Treating grounding queries as search keywords and briefing content against them.",
        "Blocking crawlers to \"protect\" the brand without checking which surface each token governs — the controls are not interchangeable, and one of them costs you search visibility while another does not.",
      ],
      sources,
    }),
    faqHeading: "AI brand monitoring: common questions",
    faq: [
      [
        "Can I see which prompts caused my brand to appear?",
        "Not from Google — the generative AI report has no query dimension. Bing publishes grounding queries, but those are the phrases the AI used to retrieve content, not what the user typed. Anything prompt-level beyond that comes from your own sampling.",
      ],
      [
        "Is there an official share-of-voice metric?",
        "Microsoft's Citation Share is the only one, and it is share of citations for a grounding query, not share of traffic or of brand mentions. Microsoft states it is observational and does not expose competitor domains.",
      ],
      [
        "Do OpenAI or Perplexity give publishers visibility analytics?",
        "We found no first-party visibility reporting from either that we could verify on their own documentation. Treat any figure about ChatGPT or Perplexity visibility as third-party sampling unless the platform documents it.",
      ],
      [
        "Should we opt out of AI features to protect the brand?",
        "Google's control removes your content from AI Overviews, AI Mode and generative AI in Discover, and you lose the impressions and traffic from those surfaces with it. It is not a ranking signal elsewhere and it does not affect AI training, so it is a distribution decision, not a safety one.",
      ],
    ],
  },
  de: {
    title: "KI-Markenmonitoring: was die Plattformen wirklich berichten",
    description:
      "Google und Microsoft veröffentlichen beide Daten zur Sichtbarkeit in KI-Antworten — und messen Unterschiedliches. Was in den Berichten steht, was in keinem steht, und wie eine belastbare Baseline entsteht.",
    body: topic("de", {
      intro: [
        "Klassisches Medienmonitoring zählt Erwähnungen. KI-Antwortmaschinen zeigen meist keine Erwähnungen, sondern **Zitationen**: einen Link auf die eigene Seite als Quelle. Bevor ein Tool gekauft oder ein Ziel gesetzt wird, lohnt der Blick darauf, welche Zahlen die Plattformen selbst herausgeben — mehr First-Party-Evidenz gibt es nicht.",
        "Genau zwei Plattformen veröffentlichen überhaupt etwas. Sie sind sich uneinig, was zählenswert ist, und aus dieser Lücke entsteht der Großteil der Verwirrung um „Share of Voice in KI“.",
      ],
      stateIntro: ["Alles Folgende stammt aus der Dokumentation der Plattformen, nicht aus Anbieter-Benchmarks."],
      state: [
        "**Google berichtet ausschließlich Impressionen.** Der Bericht zur Leistung generativer KI zählt, wie oft Links auf die eigene Seite in einer generativen KI-Funktion der Google Suche gezeigt wurden — über AI Overviews und AI Mode. Aufschlüsselung nach Seiten, Ländern, Daten und Geräten.",
        "**Query-Daten gibt es dort nicht.** Keine Klicks, keine CTR, keine Position, keine Suchanfragen. Traffic aus KI-Funktionen läuft im normalen Leistungsbericht unter dem Suchtyp „Web“ mit und wird nicht separat ausgewiesen.",
        "**Nicht jede Property hat den Bericht.** Laut Google erfolgt der Rollout schrittweise. Ein leerer Bericht ist also kein Beleg für fehlende Sichtbarkeit.",
        "**Microsoft berichtet Zitationen und eine Share-Metrik.** AI Performance in den Bing Webmaster Tools deckt Copilot, KI-Zusammenfassungen in Bing und ausgewählte Partnerintegrationen ab: Total Citations, Average Cited Pages und Zitationen auf Seitenebene.",
        "**„Grounding Queries“ sind keine Nutzer-Prompts.** Microsoft definiert sie als die Phrasen, mit denen die KI Inhalte abgerufen hat — die Retrieval-Ebene, nicht die Eingabe eines Menschen.",
        "**Citation Share kommt Share of Voice am nächsten:** der Anteil der Zitationen der eigenen Seite an allen Zitationen zur selben Grounding Query. Microsoft stellt ausdrücklich klar, dass es sich um eine beobachtende Kennzahl handelt, nicht um ein Ranking oder eine Wettbewerbstabelle, und dass keine Wettbewerber-Domains offengelegt werden.",
        "**Das Opt-out ist eng umrissen.** Googles Steuerung betrifft AI Overviews, AI Mode und generative KI in Discover. Wer aussteigt, verliert Impressionen und Traffic dieser Flächen, beeinflusst damit aber kein Ranking an anderer Stelle und auch kein KI-Training.",
      ],
      workIntro: ["Ziel ist eine Baseline, die im Review standhält — keine Kennzahl ohne Quelle."],
      work: [
        "Beide Berichte aktivieren, bevor sie gebraucht werden. Keiner liefert Daten rückwirkend.",
        "Google-Impressionen pro Seite erfassen, nicht pro Marke. Mehr Dimensionen gibt Google nicht her.",
        "Bing Total Citations und, wo verfügbar, Citation Share je Grounding Query erfassen — klar als Zitationen benennen, nie als Erwähnungen.",
        "Beide Quellen getrennt halten. Sie zählen unterschiedliche Ereignisse auf unterschiedlichen Flächen; ein zusammengerechneter „KI-Sichtbarkeitswert“ zerstört genau die Eigenschaft, die sie brauchbar macht.",
        "Was die Plattformen nicht berichten — ob ein Modell die Marke im Fließtext nennt und wie es sie beschreibt —, über eine eigene Prompt-Stichprobe erheben: fester Prompt-Satz, festes Datum, genannte Modellversion, als Stichprobe gekennzeichnet.",
        "Diese Stichprobe monatlich mit denselben Prompts wiederholen. Ein wechselnder Prompt-Satz erzeugt eine Zahl ohne Aussage.",
      ],
      measureIntro: ["Nur Kennzahlen wählen, für die sich eine Quelle benennen lässt."],
      measure: [
        "Impressionen aus KI-Funktionen je Seite und Monat aus der Search Console — der Verlauf zählt mehr als der Absolutwert.",
        "Total Citations und Average Cited Pages aus den Bing Webmaster Tools.",
        "Citation Share je Grounding Query, gelesen als Beobachtung zu dieser Query, nicht als Wettbewerbsposition.",
        "Ergebnisse der eigenen Prompt-Stichprobe, versioniert nach Modell und Datum, mit ausgewiesener Stichprobengröße.",
        "Assistierte Effekte: Suchvolumen auf die Marke und Direct Traffic — dort zeigt sich Sichtbarkeit ohne Klick am ehesten.",
      ],
      risks: [
        "Zitationen als „Erwähnungen“ berichten. Keine der Plattformen misst, ob ein Modell den Markennamen im Antworttext nennt.",
        "Eine gekaufte „Wettbewerbs-Share-of-Voice in LLM-Antworten“ für Plattformdaten halten. Microsoft legt keine Wettbewerber-Domains offen, Google gibt auf Query-Ebene gar nichts heraus — eine solche Zahl stammt aus dem Prompt-Sampling eines Anbieters.",
        "Einen leeren Google-Bericht als Null-Sichtbarkeit lesen, während der Rollout noch läuft.",
        "Grounding Queries als Such-Keywords behandeln und Content danach briefen.",
        "Crawler blockieren, ohne zu prüfen, welche Fläche das jeweilige Token überhaupt steuert.",
      ],
      sources: quellen,
    }),
    faqHeading: "KI-Markenmonitoring: häufige Fragen",
    faq: [
      [
        "Sehe ich, welche Prompts zu einer Nennung geführt haben?",
        "Bei Google nicht — der Bericht hat keine Query-Dimension. Bing zeigt Grounding Queries, das sind aber die Abrufphrasen der KI, nicht die Nutzereingabe. Alles darüber hinaus stammt aus eigener Stichprobenerhebung.",
      ],
      [
        "Gibt es eine offizielle Share-of-Voice-Kennzahl?",
        "Nur Microsofts Citation Share, und das ist der Anteil an Zitationen zu einer Grounding Query — nicht am Traffic und nicht an Markenerwähnungen. Microsoft bezeichnet sie ausdrücklich als beobachtend.",
      ],
      [
        "Liefern OpenAI oder Perplexity Sichtbarkeitsdaten für Publisher?",
        "In deren eigener Dokumentation ließ sich nichts dergleichen bestätigen. Zahlen zur Sichtbarkeit in ChatGPT oder Perplexity sind bis auf Weiteres Drittanbieter-Stichproben.",
      ],
      [
        "Sollten wir KI-Funktionen zum Schutz der Marke abschalten?",
        "Googles Steuerung entfernt die Inhalte aus AI Overviews, AI Mode und generativer KI in Discover — samt der Impressionen und des Traffics dieser Flächen. Rankings an anderer Stelle und das KI-Training bleiben unberührt. Es ist eine Distributions-, keine Sicherheitsentscheidung.",
      ],
    ],
  },
};

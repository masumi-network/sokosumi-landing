import { article } from "../tool-guide-builder.mjs";

const sources = [
  ["How Perplexity works", "https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work"],
  ["Projects in Perplexity", "https://www.perplexity.ai/help-center/en/articles/10352961-what-are-spaces"],
  ["Understanding source labels", "https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels"],
];

export default {
  slug: "how-to-use-perplexity-for-competitor-research",
  tool: { key: "perplexity", name: "Perplexity" },
  job: "competitor research",
  compare: "perplexity-vs-chatgpt",
  coworker: "hannah",
  category: "workflows",
  order: 109,
  en: {
    title: "How to use Perplexity for competitor research",
    description: "Build a dated, cited competitor evidence matrix in Perplexity and separate product facts from positioning inferences.",
    body: article("en", {
      intro: [
        "Perplexity is built around web search and citations, which makes it useful for discovering current competitor evidence. The discipline is to treat the answer as a map to sources, not as the source itself.",
        "Research one decision and one market at a time. A comparison matrix should show dates, plans, caveats and missing evidence rather than forcing every cell to look complete.",
      ],
      fit: [
        "Finding official product, pricing, documentation and announcement pages across a competitor set.",
        "Running a deeper multi-source investigation for a well-bounded market question.",
        "Keeping files, instructions and related searches together in a Project.",
        "Producing an initial evidence matrix for positioning, sales enablement or product research.",
      ],
      setup: [
        "Define competitors by domain and product, including exclusions for namesakes and parent companies.",
        "Write the decision the research must support, the market, currency, customer segment and cutoff date.",
        "Define source priority: current official page, official documentation or filing, then reputable independent evidence. Use reviews only for clearly labelled experience signals.",
        "Create matrix fields before searching: claim, exact evidence, URL, date, plan, market, confidence and reviewer.",
      ],
      workflow: [
        "Create a Project with the scope and matrix schema so follow-up searches use the same definitions.",
        "Ask a separate factual question for each matrix row. Broad prompts tend to blur product tiers and dates.",
        "Open every citation and copy the supported fact into the matrix in your own words. Leave unsupported cells blank.",
        "Run a second search specifically for contradictions, recent changes and regional exceptions.",
        "Separate observed positioning language from your inference about the competitor's strategy.",
        "Date the finished matrix and schedule refreshes for volatile rows such as pricing and limits.",
      ],
      prompt: [
        "Research [competitors] for this decision: [decision]. Market and currency: [market]. Evidence cutoff: [date].",
        "For each company, return only facts supported by current sources: target customer, core workflow, pricing basis, relevant feature, stated limitation and official positioning.",
        "Prefer official product, pricing and documentation pages. Include exact URL, page date when visible, access date, market or plan caveat and confidence for every row.",
        "Do not infer missing prices or features. Put NOT VERIFIED in unsupported cells and separate factual evidence from strategic interpretation.",
      ],
      checks: [
        "Open the original page and confirm that a citation supports the nearby row, not merely the general topic.",
        "Check plan, geography, billing period, taxes and whether pricing requires sales contact.",
        "Verify that apparently independent articles do not repeat the same press release.",
        "Treat source labels as context about a domain, not proof that an individual claim is correct.",
        "Have product or sales owners review comparisons before external use.",
      ],
      limitIntro: ["Search results can miss gated pages, misread dynamic pricing or surface old documentation. An empty cell is safer than a plausible guess."],
      limits: [
        "Competitor research can date quickly; attach an access date to every volatile claim.",
        "Citations improve traceability but do not eliminate interpretation errors.",
        "Do not copy competitor wording or turn an internal inference into a public comparative claim.",
        "Respect terms, access controls and copyright; summarize facts rather than collecting full page text.",
      ],
      sources,
    }),
    faqHeading: "Perplexity for competitor research: common questions",
    faq: [
      ["Should I use regular Search or Deep Research?", "Use regular searches for narrow facts and Deep Research for a bounded question that needs a broader source set. Review citations in both cases."],
      ["What are Perplexity Projects useful for?", "They keep related searches, files and instructions together so a recurring competitor study retains its scope and definitions."],
      ["Are source labels a quality guarantee?", "No. Perplexity says labels describe the domain, not the accuracy of a specific claim. Read and evaluate the original page."],
      ["How often should the matrix be refreshed?", "Refresh pricing, plans and limits frequently and after major launches. More stable company or category facts can use a longer review interval."],
    ],
  },
  de: {
    title: "Perplexity für Wettbewerbsrecherche nutzen",
    description: "Erstelle in Perplexity eine datierte, zitierte Wettbewerbsmatrix und trenne Produktfakten von Positionierungsannahmen.",
    body: article("de", {
      intro: [
        "Perplexity verbindet Websuche und Zitate und eignet sich deshalb zur Entdeckung aktueller Wettbewerbsbelege. Betrachte die Antwort als Wegweiser zu Quellen, nicht selbst als Quelle.",
        "Untersuche jeweils eine Entscheidung und einen Markt. Eine Matrix soll Daten, Tarife, Einschränkungen und Lücken zeigen, statt jedes Feld künstlich zu füllen.",
      ],
      fit: [
        "Offizielle Produkt-, Preis-, Dokumentations- und Ankündigungsseiten mehrerer Wettbewerber finden.",
        "Eine tiefere Mehrquellenrecherche für eine klar begrenzte Marktfrage durchführen.",
        "Dateien, Anweisungen und Suchläufe in einem Project zusammenhalten.",
        "Eine erste Evidenzmatrix für Positionierung, Vertrieb oder Produktforschung erstellen.",
      ],
      setup: [
        "Definiere Wettbewerber über Domain und Produkt und schließe Namensgleiche oder falsche Tochterfirmen aus.",
        "Formuliere Entscheidung, Markt, Währung, Kundensegment und Stichtag.",
        "Priorisiere aktuelle offizielle Seite, Dokumentation oder Bericht und dann seriöse unabhängige Evidenz. Nutzerberichte bleiben gekennzeichnete Erfahrungssignale.",
        "Lege Matrixfelder vor der Suche fest: Aussage, Beleg, URL, Datum, Tarif, Markt, Konfidenz und Prüfer.",
      ],
      workflow: [
        "Erstelle ein Project mit Scope und Matrixschema für konsistente Folgesuchen.",
        "Stelle je Matrixzeile eine eigene Faktenfrage. Breite Prompts vermischen schnell Tarife und Daten.",
        "Öffne jedes Zitat und übertrage nur den tatsächlich gestützten Fakt in eigenen Worten. Lücken bleiben leer.",
        "Suche in einem zweiten Durchlauf gezielt nach Widersprüchen, Änderungen und regionalen Ausnahmen.",
        "Trenne beobachtete Positionierungssprache von deiner strategischen Interpretation.",
        "Datiere die Matrix und plane Aktualisierungen für Preise und Limits.",
      ],
      prompt: [
        "Recherchiere [Wettbewerber] für diese Entscheidung: [Entscheidung]. Markt und Währung: [Markt]. Stichtag: [Datum].",
        "Liefere je Unternehmen nur aktuell belegte Fakten zu Zielkunde, Kernablauf, Preismodell, relevanter Funktion, genannter Grenze und offizieller Positionierung.",
        "Priorisiere offizielle Produkt-, Preis- und Dokumentationsseiten. Nenne URL, sichtbares Seitendatum, Zugriffsdatum, Markt- oder Tarifhinweis und Konfidenz je Zeile.",
        "Errate keine fehlenden Preise oder Funktionen. Schreibe NICHT VERIFIZIERT und trenne Fakten von strategischer Interpretation.",
      ],
      checks: [
        "Öffne die Originalseite und prüfe, ob das Zitat die konkrete Zeile statt nur das Thema stützt.",
        "Prüfe Tarif, Region, Abrechnungszeitraum, Steuern und mögliche Vertriebspflicht.",
        "Stelle sicher, dass unabhängige Artikel nicht nur dieselbe Pressemitteilung wiederholen.",
        "Quellenlabels beschreiben Domains, beweisen aber keine einzelne Aussage.",
        "Lass Produkt oder Vertrieb Vergleiche vor externer Nutzung prüfen.",
      ],
      limitIntro: ["Suchergebnisse können geschützte Seiten verpassen, dynamische Preise falsch lesen oder alte Dokumentation finden. Eine Lücke ist sicherer als eine plausible Vermutung."],
      limits: [
        "Wettbewerbsdaten altern schnell; versehe volatile Aussagen mit Zugriffsdatum.",
        "Zitate verbessern Nachvollziehbarkeit, verhindern aber keine Fehlinterpretation.",
        "Kopiere keine Wettbewerbertexte und veröffentliche interne Schlüsse nicht als Vergleichsfakten.",
        "Achte auf Nutzungsbedingungen, Zugriffsgrenzen und Urheberrecht; fasse Fakten zusammen.",
      ],
      sources,
    }),
    faqHeading: "Häufige Fragen zu Perplexity für Wettbewerbsrecherche",
    faq: [
      ["Normale Suche oder Deep Research?", "Nutze normale Suche für enge Fakten und Deep Research für breitere, klar begrenzte Fragen. Prüfe in beiden Fällen die Zitate."],
      ["Wozu dienen Perplexity Projects?", "Sie halten Suchen, Dateien und Anweisungen zusammen, damit wiederkehrende Recherche denselben Scope nutzt."],
      ["Garantieren Quellenlabels Qualität?", "Nein. Laut Perplexity beschreiben sie die Domain, nicht die Richtigkeit einer einzelnen Aussage. Prüfe die Originalseite."],
      ["Wie oft sollte die Matrix aktualisiert werden?", "Preise, Tarife und Limits häufig und nach großen Launches; stabilere Unternehmensfakten in längeren Intervallen."],
    ],
  },
};

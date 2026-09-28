import { article } from "../tool-guide-builder.mjs";

const sources = [
  ["Manus Wide Research", "https://help.manus.im/en/articles/11960169-what-is-wide-research"],
  ["Manus Agent mode", "https://help.manus.im/en/articles/11711128-what-are-the-differences-between-chat-mode-and-agent-mode"],
  ["Manus data analysis and visualization", "https://manus.im/docs/features/data-visualization"],
];

export default {
  slug: "how-to-use-manus-for-market-research",
  tool: { key: "manus", name: "Manus" },
  job: "market research deliverables",
  compare: "manus-vs-genspark",
  coworker: "hannah",
  category: "workflows",
  order: 113,
  en: {
    title: "How to use Manus for market research deliverables",
    description: "Scope a market question, use Manus for parallel research and analysis, then audit the evidence before sharing a report, deck or dashboard.",
    body: article("en", {
      intro: [
        "Manus Agent mode can plan a complex task and produce files such as reports, presentations or web outputs. Wide Research may split suitable work into parallel subtasks. That makes a precise research frame essential: parallel agents can multiply ambiguity as easily as coverage.",
        "Start with the decision and evidence standard, not the desired number of slides. The output format comes after the source ledger and conclusions survive review.",
      ],
      fit: [
        "Scanning several market segments, regions or competitors that can be researched independently.",
        "Combining a supplied dataset with sourced market context and visual analysis.",
        "Producing a first report, presentation or dashboard for expert review.",
        "Turning a repeatable research method into a documented project workflow.",
      ],
      setup: [
        "Define the decision, audience, geography, period, category boundaries and terms that are commonly confused.",
        "Write the evidence hierarchy and exclusions. Require primary sources for company facts and original methodology for market estimates.",
        "Specify the source ledger fields before research: claim, URL, publisher, publication date, access date, geography, method and caveat.",
        "Set a credit boundary and output checkpoints because Agent mode and Wide Research consume credits.",
      ],
      workflow: [
        "Ask Manus to restate the scope, assumptions and proposed subtask split. Correct overlaps before execution.",
        "Run the research and require each subtask to return the same evidence schema so results can be compared.",
        "Deduplicate sources and trace repeated market figures back to their earliest available methodology.",
        "Upload a clean dataset only when its fields, dates and units are documented; request analysis before visual styling.",
        "Review the evidence ledger and conclusions before asking for a deck, report or dashboard.",
        "Export the deliverable with a methods page, source appendix, data date and owner.",
      ],
      prompt: [
        "Research this market decision: [decision]. Audience: [audience]. Geography: [market]. Period: [dates]. Category definition: [definition].",
        "If parallel research is appropriate, propose non-overlapping subtasks first. Every subtask must return the same evidence ledger and distinguish source fact from inference.",
        "Prefer primary sources and original studies. Do not repeat a market-size number without finding its methodology, scope, currency and forecast date. Mark missing evidence.",
        "After the evidence review, prepare [report/deck/dashboard] with executive conclusion, counterevidence, caveats, method and source appendix.",
      ],
      checks: [
        "Inspect whether subtasks used independent evidence or repeated the same syndicated source.",
        "Open material citations and verify figure, period, unit, geography and methodology.",
        "Recalculate key totals and charts from the supplied data.",
        "Check that the final visual does not imply precision beyond the evidence.",
        "Remove unsupported recommendations and identify the expert owner for each decision.",
      ],
      limitIntro: ["A polished file can hide weak research. Judge the deliverable by its evidence chain, not its visual completeness."],
      limits: [
        "Wide Research availability and credit use depend on the current plan and task; consult the live account before budgeting.",
        "Parallel subtasks need mutually exclusive scopes or they create duplicated noise.",
        "Agent mode can perform broader actions than chat; review requested permissions and outputs.",
        "Generated charts and decks require data, accessibility, brand and claim review before presentation.",
      ],
      sources,
    }),
    faqHeading: "Manus for market research: common questions",
    faq: [
      ["What is Wide Research?", "Manus describes it as a paid feature that can automatically split suitable complex work into parallel subtasks. Availability and credit behavior may change."],
      ["Should I ask for a deck immediately?", "No. Approve the scope, evidence ledger and conclusions first. Then generate the presentation from reviewed material."],
      ["Can Manus analyze uploaded data?", "Its documentation describes analysis and visualization from structured files with outputs such as reports, slides, dashboards or web pages. Validate calculations independently."],
      ["How do I control research cost?", "Set scope, checkpoints and a credit boundary before Agent work; remove unnecessary subtasks and review the proposed split."],
    ],
  },
  de: {
    title: "Manus für Marktforschungs-Ergebnisse nutzen",
    description: "Begrenzen Sie die Marktfrage, nutzen Sie Manus für parallele Recherche und Analyse und prüfen Sie Belege vor Bericht, Präsentation oder Dashboard.",
    body: article("de", {
      intro: [
        "Manus Agent Mode kann komplexe Aufgaben planen und Dateien wie Berichte, Präsentationen oder Webausgaben erzeugen. Wide Research teilt geeignete Arbeit in parallele Teilaufgaben. Deshalb ist ein präziser Rahmen entscheidend: Parallelität vervielfacht auch Unklarheit.",
        "Beginnen Sie mit Entscheidung und Evidenzstandard, nicht mit der Folienzahl. Das Ausgabeformat folgt erst nach Prüfung von Quellenregister und Schlüssen.",
      ],
      fit: [
        "Mehrere Marktsegmente, Regionen oder Wettbewerber unabhängig untersuchen.",
        "Einen bereitgestellten Datensatz mit belegtem Marktkontext und visueller Analyse verbinden.",
        "Einen ersten Bericht, eine Präsentation oder ein Dashboard zur Expertenprüfung erstellen.",
        "Eine wiederholbare Recherchemethodik als Projektablauf dokumentieren.",
      ],
      setup: [
        "Definieren Sie Entscheidung, Publikum, Geografie, Zeitraum, Kategoriegrenzen und leicht verwechselte Begriffe.",
        "Legen Sie Quellenhierarchie und Ausschlüsse fest. Unternehmensfakten brauchen Primärquellen, Marktwerte nachvollziehbare Methodik.",
        "Definieren Sie die Felder im Quellenregister: Aussage, URL, Herausgeber, Datum, Zugriff, Geografie, Methode und Einschränkung.",
        "Setzen Sie eine Kreditgrenze und Zwischenprüfungen, da Agent Mode und Wide Research Credits verbrauchen.",
      ],
      workflow: [
        "Lassen Sie Scope, Annahmen und vorgeschlagene Teilaufgaben wiederholen. Korrigieren Sie Überschneidungen vor der Ausführung.",
        "Verlangen Sie von jeder Teilaufgabe dasselbe Evidenzschema und die Trennung von Fakt und Schluss.",
        "Entfernen Sie doppelte Quellen und verfolgen Sie wiederholte Marktwerte zur frühesten verfügbaren Methodik.",
        "Laden Sie nur dokumentierte Datensätze hoch und fordern Sie die Analyse vor der visuellen Gestaltung.",
        "Prüfen Sie Quellenregister und Schlüsse vor Bericht, Präsentation oder Dashboard.",
        "Exportieren Sie mit Methodik, Quellenanhang, Datenstand und Verantwortlichem.",
      ],
      prompt: [
        "Recherchiere diese Marktentscheidung: [Entscheidung]. Publikum: [Zielgruppe]. Geografie: [Markt]. Zeitraum: [Daten]. Kategoriedefinition: [Definition].",
        "Falls parallele Recherche passt, schlage zuerst überschneidungsfreie Teilaufgaben vor. Jede liefert dasselbe Quellenregister und trennt Quellenfakt von Schluss.",
        "Priorisiere Primärquellen und Originalstudien. Übernimm keine Marktgröße ohne Methodik, Scope, Währung und Prognosedatum. Markiere Lücken.",
        "Erstelle nach Evidenzprüfung [Bericht/Präsentation/Dashboard] mit Schluss, Gegenbelegen, Einschränkungen, Methode und Quellenanhang.",
      ],
      checks: [
        "Prüfen Sie, ob Teilaufgaben unabhängige Evidenz oder dieselbe syndizierte Quelle nutzen.",
        "Öffnen Sie wesentliche Zitate und verifizieren Sie Zahl, Zeitraum, Einheit, Geografie und Methodik.",
        "Rechnen Sie Schlüsselsummen und Diagramme aus den Daten nach.",
        "Vermeiden Sie visuell vorgetäuschte Präzision über die Evidenz hinaus.",
        "Entfernen Sie unbelegte Empfehlungen und ordnen Sie jeder Entscheidung einen Experten zu.",
      ],
      limitIntro: ["Eine polierte Datei kann schwache Recherche verdecken. Entscheidend ist die Belegkette, nicht die visuelle Vollständigkeit."],
      limits: [
        "Wide-Research-Verfügbarkeit und Credits hängen von Tarif und Aufgabe ab; prüfen Sie das Live-Konto.",
        "Parallele Teilaufgaben brauchen exklusive Scopes, sonst entsteht doppelte Information.",
        "Agent Mode kann breiter handeln als Chat; prüfen Sie Rechte und Ausgaben.",
        "Diagramme und Präsentationen brauchen Daten-, Barrierefreiheits-, Marken- und Claim-Prüfung.",
      ],
      sources,
    }),
    faqHeading: "Häufige Fragen zu Manus für Marktforschung",
    faq: [
      ["Was ist Wide Research?", "Manus beschreibt eine Bezahlfunktion, die geeignete komplexe Arbeit automatisch in parallele Teilaufgaben zerlegen kann. Verfügbarkeit und Credits können sich ändern."],
      ["Soll ich sofort eine Präsentation anfordern?", "Nein. Geben Sie zuerst Scope, Quellenregister und Schlüsse frei und erzeugen Sie dann die Präsentation aus geprüftem Material."],
      ["Kann Manus hochgeladene Daten analysieren?", "Die Dokumentation beschreibt Analyse und Visualisierung strukturierter Dateien in Berichten, Slides, Dashboards oder Webseiten. Prüfen Sie Berechnungen unabhängig."],
      ["Wie kontrolliere ich Recherchekosten?", "Setzen Sie Scope, Prüfpunkte und Kreditgrenze vor der Agent-Arbeit fest und entfernen Sie unnötige Teilaufgaben."],
    ],
  },
};

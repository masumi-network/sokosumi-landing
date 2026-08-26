import { article } from "../tool-guide-builder.mjs";

const sources = [
  ["ChatGPT Projects", "https://help.openai.com/en/articles/10169521-projects-in-chatgpt"],
  ["Deep research in ChatGPT", "https://help.openai.com/en/articles/10500283-deep-research"],
  ["OpenAI Academy for marketing", "https://openai.com/academy/marketing/"],
];

export default {
  slug: "how-to-use-chatgpt-for-marketing",
  tool: { key: "chatgpt", name: "ChatGPT" },
  job: "marketing strategy",
  compare: "chatgpt-vs-claude",
  coworker: "elena",
  category: "workflows",
  order: 101,
  en: {
    title: "How to use ChatGPT for marketing strategy",
    description: "Build a sourced marketing brief in ChatGPT, turn it into a campaign plan, and review every claim before your team ships the work.",
    body: article("en", {
      intro: [
        "ChatGPT is useful for marketing when you give it a bounded decision to support, the evidence it may use, and the format your team needs. Treat it as a working session for research, synthesis and drafting—not as the owner of the strategy.",
        "The workflow below starts with a campaign brief and ends with a reviewable plan. It works best inside a dedicated Project so the brief, source files, instructions and follow-up chats stay together.",
      ],
      fitIntro: ["Use ChatGPT where iteration is more valuable than one perfect first answer."],
      fit: [
        "Turning customer notes, product material and positioning into a structured campaign brief.",
        "Using deep research for a cited market or category scan when current web evidence matters.",
        "Generating several message territories, objections and channel adaptations from one approved proposition.",
        "Analyzing a clean table of campaign results and proposing questions for a human analyst to test.",
      ],
      setup: [
        "Create one Project for the campaign. Add the current brief, approved claims, audience research, brand voice and channel constraints rather than mixing unrelated work in one chat.",
        "Write Project instructions that define the market, audience, spelling convention, forbidden claims, approval owner and the exact output format.",
        "Separate facts from hypotheses. Label internal evidence with a date and owner; ask ChatGPT to mark unsupported statements instead of filling gaps.",
        "For current market questions, use deep research, review its proposed research plan and limit or add sources before the run.",
      ],
      workflow: [
        "Ask for a one-page evidence map: audience problem, trigger, current alternative, proof, objections and unknowns. Resolve important unknowns before ideation.",
        "Request three genuinely different strategic routes. Require a named audience, single promise, reason to believe, tension and channel implication for each route.",
        "Choose one route yourself. Ask ChatGPT to challenge it against the brief and list what could make it fail.",
        "Expand the chosen route into a campaign plan with deliverables, owners, dependencies, review gates and success measures.",
        "Draft channel copy only after the plan is approved. Keep each asset linked to the approved promise and proof.",
        "Save the final brief outside the chat in the system your team actually governs. Record which claims still require legal, product or brand approval.",
      ],
      prompt: [
        "Act as a rigorous campaign strategist. Use only the attached brief and the sources I explicitly approve.",
        "Audience: [specific buyer]. Business goal: [goal]. Market: [country]. Decision we need: [decision].",
        "First produce an evidence map with Facts, Assumptions and Missing Evidence. Then propose three distinct campaign routes. For each include the human tension, one promise, proof, objections, channel role and the main risk.",
        "Do not invent statistics, customer quotes or product capabilities. Cite every external factual claim. End with five questions the team must answer before production.",
      ],
      checks: [
        "Open every cited source and confirm that it supports the exact nearby claim.",
        "Compare all product statements with the current approved product page or sales material.",
        "Remove routes that differ only in wording rather than strategy.",
        "Have the channel owner, brand owner and any required legal reviewer approve the final brief.",
        "Define a measurable test and a stopping rule; do not call predicted performance a result.",
      ],
      limitIntro: ["A fluent plan can still be strategically weak. The model sees the context you provide, not the conversations and constraints you forgot to include."],
      limits: [
        "Do not upload confidential customer or company data unless your organization has approved the product, plan and data controls.",
        "Deep research citations improve traceability, but citation presence is not proof of source quality or correct interpretation.",
        "Keep pricing, legal, health, financial and comparative claims under human review.",
        "Plan availability and usage limits vary; check the current product interface before promising a workflow to a team.",
      ],
      sources,
    }),
    faqHeading: "ChatGPT for marketing: common questions",
    faq: [
      ["Should ChatGPT write the entire campaign?", "No. Use it to organize evidence, explore routes and draft assets. A marketer should choose the strategy, verify claims and approve what ships."],
      ["Should I use a Project or a normal chat?", "Use a Project for an ongoing campaign because it keeps relevant chats, files and instructions together. Use a normal chat for an isolated, low-context task."],
      ["When should I use deep research?", "Use it for current market, competitor or category questions that need web evidence and citations. Skip it when the answer should come only from approved internal material."],
      ["Can ChatGPT predict campaign performance?", "It can help form hypotheses, but its estimate is not evidence. Define a test, measurement window and stopping rule in your actual analytics stack."],
    ],
  },
  de: {
    title: "ChatGPT für die Marketingstrategie nutzen",
    description: "Erstelle mit ChatGPT ein belegtes Marketing-Briefing, entwickle daraus einen Kampagnenplan und prüfe jede Aussage vor der Veröffentlichung.",
    body: article("de", {
      intro: [
        "ChatGPT ist im Marketing dann hilfreich, wenn du eine klar begrenzte Entscheidung, zulässige Belege und das benötigte Ausgabeformat vorgibst. Nutze es als Arbeitssitzung für Recherche, Synthese und Entwürfe – nicht als Eigentümer der Strategie.",
        "Der folgende Ablauf beginnt mit dem Kampagnenbriefing und endet mit einem prüfbaren Plan. In einem eigenen Project bleiben Briefing, Quelldateien, Anweisungen und Folgegespräche zusammen.",
      ],
      fitIntro: ["Setze ChatGPT dort ein, wo Iteration wichtiger ist als eine vermeintlich perfekte erste Antwort."],
      fit: [
        "Kundennotizen, Produktmaterial und Positionierung in ein strukturiertes Kampagnenbriefing überführen.",
        "Mit Deep Research einen zitierten Markt- oder Kategorieüberblick erstellen, wenn aktuelle Webquellen nötig sind.",
        "Aus einer freigegebenen Kernbotschaft mehrere Botschaftsrichtungen, Einwände und Kanalanpassungen entwickeln.",
        "Eine bereinigte Tabelle mit Kampagnendaten untersuchen und Hypothesen für die menschliche Analyse formulieren.",
      ],
      setup: [
        "Lege für die Kampagne ein eigenes Project an. Füge aktuelles Briefing, freigegebene Aussagen, Zielgruppenwissen, Tonalität und Kanalgrenzen hinzu.",
        "Definiere in den Project-Anweisungen Markt, Zielgruppe, Schreibweise, verbotene Aussagen, Freigabeverantwortung und Ausgabeformat.",
        "Trenne Fakten und Hypothesen. Kennzeichne interne Belege mit Datum und Verantwortlichen; fehlende Informationen soll ChatGPT markieren statt ergänzen.",
        "Nutze für aktuelle Marktfragen Deep Research, prüfe den vorgeschlagenen Rechercheplan und begrenze oder ergänze die Quellen vor dem Start.",
      ],
      workflow: [
        "Lass zuerst eine einseitige Evidenzkarte erstellen: Problem, Auslöser, heutige Alternative, Beleg, Einwände und offene Fragen. Kläre kritische Lücken vor der Ideenphase.",
        "Fordere drei tatsächlich unterschiedliche strategische Richtungen. Jede braucht Zielgruppe, ein Versprechen, Begründung, Spannung und Kanalwirkung.",
        "Wähle die Richtung selbst. Lass ChatGPT sie anschließend gegen das Briefing prüfen und mögliche Fehlerursachen benennen.",
        "Baue die gewählte Richtung zu einem Kampagnenplan mit Ergebnissen, Verantwortlichen, Abhängigkeiten, Freigaben und Messgrößen aus.",
        "Erstelle Kanaltexte erst nach der Planfreigabe. Jedes Asset muss auf das freigegebene Versprechen und den Beleg zurückführen.",
        "Speichere das finale Briefing im tatsächlich verwalteten Teamsystem. Halte fest, welche Aussagen noch Recht, Produkt oder Marke freigeben müssen.",
      ],
      prompt: [
        "Arbeite als kritischer Kampagnenstratege. Nutze nur das angehängte Briefing und ausdrücklich freigegebene Quellen.",
        "Zielgruppe: [konkreter Käufer]. Geschäftsziel: [Ziel]. Markt: [Land]. Benötigte Entscheidung: [Entscheidung].",
        "Erstelle zuerst eine Evidenzkarte mit Fakten, Annahmen und fehlenden Belegen. Entwickle danach drei unterschiedliche Kampagnenrichtungen. Nenne jeweils menschliche Spannung, ein Versprechen, Beleg, Einwände, Kanalrolle und Hauptrisiko.",
        "Erfinde keine Statistiken, Kundenzitate oder Produktfunktionen. Belege jede externe Tatsachenbehauptung. Schließe mit fünf Fragen, die das Team vor der Produktion beantworten muss.",
      ],
      checks: [
        "Öffne jede zitierte Quelle und prüfe, ob sie die konkrete Aussage wirklich stützt.",
        "Vergleiche alle Produktangaben mit der aktuellen freigegebenen Produkt- oder Vertriebsinformation.",
        "Streiche Richtungen, die sich nur sprachlich und nicht strategisch unterscheiden.",
        "Lass Kanal-, Marken- und gegebenenfalls Rechtsverantwortliche das finale Briefing freigeben.",
        "Definiere einen messbaren Test und eine Abbruchregel; eine Prognose ist noch kein Ergebnis.",
      ],
      limitIntro: ["Ein flüssig formulierter Plan kann strategisch schwach sein. Das Modell kennt nur den bereitgestellten Kontext, nicht vergessene Gespräche und Zwänge."],
      limits: [
        "Lade vertrauliche Kunden- oder Unternehmensdaten nur hoch, wenn Produkt, Tarif und Datenkontrollen intern freigegeben sind.",
        "Zitate aus Deep Research erhöhen die Nachvollziehbarkeit, beweisen aber weder Quellenqualität noch korrekte Interpretation.",
        "Preis-, Rechts-, Gesundheits-, Finanz- und Vergleichsaussagen bleiben unter menschlicher Kontrolle.",
        "Verfügbarkeit und Nutzungslimits unterscheiden sich je Tarif; prüfe die aktuelle Oberfläche, bevor du einen Teamprozess zusagst.",
      ],
      sources,
    }),
    faqHeading: "Häufige Fragen zu ChatGPT im Marketing",
    faq: [
      ["Soll ChatGPT die gesamte Kampagne schreiben?", "Nein. Nutze es zum Ordnen der Belege, Erkunden von Richtungen und Entwerfen von Assets. Ein Mensch wählt die Strategie, prüft Aussagen und gibt Veröffentlichungen frei."],
      ["Project oder normaler Chat?", "Nutze ein Project für laufende Kampagnen, weil Chats, Dateien und Anweisungen zusammenbleiben. Ein normaler Chat genügt für eine isolierte Aufgabe mit wenig Kontext."],
      ["Wann ist Deep Research sinnvoll?", "Für aktuelle Markt-, Wettbewerbs- oder Kategoriefragen mit Webbelegen und Zitaten. Nicht, wenn die Antwort ausschließlich aus freigegebenem internem Material kommen soll."],
      ["Kann ChatGPT Kampagnenerfolg vorhersagen?", "Es kann Hypothesen formulieren, aber eine Schätzung ist kein Beleg. Definiere Test, Messfenster und Abbruchregel in deinem Analysesystem."],
    ],
  },
};

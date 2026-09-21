import { article } from "../tool-guide-builder.mjs";

const sources = [
  ["Research in Claude", "https://www.anthropic.com/news/research"],
  ["Google Workspace connectors in Claude", "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors"],
  ["Claude integrations", "https://www.anthropic.com/news/integrations"],
];

export default {
  slug: "how-to-use-claude-for-campaign-research",
  tool: { key: "claude", name: "Claude" },
  job: "campaign research",
  compare: "chatgpt-vs-claude",
  coworker: "hannah",
  category: "workflows",
  order: 105,
  en: {
    title: "How to use Claude for campaign research",
    description: "Combine approved internal context and current web research in Claude, then turn the evidence into a decision-ready campaign dossier.",
    body: article("en", {
      intro: [
        "Claude can research across the web and connected work context, then synthesize a long evidence set. The productive unit is not a generic market report; it is a dossier for one campaign decision with sources, uncertainty and implications kept visible.",
        "Decide first whether the task may use the public web, connected Google Workspace content or only supplied files. Mixing those scopes without a rule makes claims hard to audit.",
      ],
      fit: [
        "Building a cited category, audience or competitor dossier around one decision.",
        "Comparing current public evidence with an approved internal brief or research archive.",
        "Finding contradictions, stale assumptions and gaps that require interviews or original research.",
        "Turning a large source set into a concise briefing for creative or media teams.",
      ],
      setup: [
        "Write the decision at the top: for example which audience tension the next campaign should test. Add market, time window and exclusions.",
        "Choose the allowed source scope. If using connected Workspace, select only documents and accounts approved for this research.",
        "Create an evidence standard: primary sources for company claims, named methodology for studies, publication date and a confidence label.",
        "Provide the current campaign brief and mark internal beliefs as hypotheses unless evidence supports them.",
      ],
      workflow: [
        "Ask Claude to propose a research plan and source priorities before it researches. Remove branches that do not inform the decision.",
        "Run Research for current external evidence. Keep first-party documentation, filings and original studies ahead of summaries where available.",
        "Ask for an evidence ledger with claim, source, date, direct support, caveat and confidence.",
        "Synthesize patterns only after reviewing the ledger. Require a counterargument and evidence that would change each conclusion.",
        "Translate findings into implications for audience, promise, proof, channel and test—not finished creative copy.",
        "Export the dossier and store it with a research date and owner so the campaign can be audited later.",
      ],
      prompt: [
        "Research this decision: [decision]. Market: [market]. Time window: [dates]. Allowed internal sources: [scope].",
        "Before researching, propose a short plan and the source hierarchy. Then produce an evidence ledger followed by findings, contradictions, missing evidence and campaign implications.",
        "Cite every external factual claim at sentence level. Distinguish facts, source interpretations and your inferences. Prefer primary sources and explain when only secondary evidence exists.",
        "Do not write final campaign copy. End with the three safest conclusions, three risky assumptions and the next research action for each gap.",
      ],
      checks: [
        "Open each high-impact citation and confirm entity, date, geography, sample and claim.",
        "Check whether a source is independent evidence, vendor marketing or a repetition of another source.",
        "Look for evidence against the preferred strategy and preserve material disagreement.",
        "Remove internal information that should not appear in a shareable export.",
        "Have a market or subject expert approve conclusions before they enter a creative brief.",
      ],
      limitIntro: ["Long context and citations make review easier, not optional. Connected content can also surface information beyond the intended campaign scope if permissions are broad."],
      limits: [
        "Use the narrowest practical connector and document scope for confidential work.",
        "A citation can be real while the interpretation is wrong; read the source around the cited passage.",
        "Do not turn correlation, anecdotes or vendor claims into audience truth.",
        "Product features and limits change, so verify the current interface and plan before standardizing the workflow.",
      ],
      sources,
    }),
    faqHeading: "Claude for campaign research: common questions",
    faq: [
      ["When should I use Claude Research?", "Use it when the decision needs current web evidence across several sources. Use supplied files only when public web material would add noise or create a data-scope problem."],
      ["Can Claude search Google Workspace?", "Anthropic documents integrations and Research with Google Workspace. Availability and access depend on the account, plan, connector setup and existing permissions."],
      ["What should the deliverable contain?", "Include the decision, method, source ledger, findings, contradictions, caveats, campaign implications, missing evidence, date and owner."],
      ["Can the dossier go directly to creative production?", "Not yet. A strategist should approve the implications and convert them into a focused creative brief with permitted claims."],
    ],
  },
  de: {
    title: "Claude für Kampagnenrecherche nutzen",
    description: "Verbinde freigegebenen internen Kontext und aktuelle Webrecherche in Claude zu einem entscheidungsreifen Kampagnendossier.",
    body: article("de", {
      intro: [
        "Claude kann im Web und in verbundenem Arbeitskontext recherchieren und umfangreiche Evidenz zusammenführen. Das sinnvolle Ergebnis ist kein allgemeiner Marktbericht, sondern ein Dossier für eine Kampagnenentscheidung mit sichtbaren Quellen, Unsicherheiten und Folgen.",
        "Lege zuerst fest, ob die Aufgabe das öffentliche Web, verbundene Google-Workspace-Inhalte oder nur bereitgestellte Dateien nutzen darf. Ohne diese Grenze sind Aussagen schwer prüfbar.",
      ],
      fit: [
        "Ein zitiertes Kategorie-, Zielgruppen- oder Wettbewerbsdossier für eine konkrete Entscheidung erstellen.",
        "Aktuelle öffentliche Belege mit einem freigegebenen internen Briefing vergleichen.",
        "Widersprüche, alte Annahmen und Lücken für Interviews oder eigene Forschung finden.",
        "Viele Quellen in ein knappes Briefing für Kreativ- oder Mediateams überführen.",
      ],
      setup: [
        "Formuliere die Entscheidung zuerst, etwa welche Zielgruppenspannung getestet werden soll. Ergänze Markt, Zeitraum und Ausschlüsse.",
        "Wähle den erlaubten Quellenumfang. Bei Workspace-Verbindungen nur freigegebene Dokumente und Konten nutzen.",
        "Definiere Evidenzstandards: Primärquellen für Unternehmensangaben, Methodik für Studien, Datum und Konfidenz.",
        "Stelle das aktuelle Briefing bereit und markiere interne Überzeugungen ohne Beleg als Hypothesen.",
      ],
      workflow: [
        "Lass Claude vor der Recherche einen Plan und Quellenprioritäten vorschlagen. Entferne Zweige ohne Entscheidungsbezug.",
        "Nutze Research für aktuelle externe Belege und priorisiere Originaldokumente, Berichte und Studien.",
        "Fordere ein Evidenzregister mit Aussage, Quelle, Datum, direkter Stütze, Einschränkung und Konfidenz.",
        "Bilde Muster erst nach der Registerprüfung. Verlange Gegenargumente und Belege, die Schlussfolgerungen ändern würden.",
        "Übersetze Ergebnisse in Auswirkungen auf Zielgruppe, Versprechen, Beleg, Kanal und Test – noch nicht in finale Werbetexte.",
        "Exportiere das Dossier mit Datum und Verantwortlichem in das verwaltete Teamsystem.",
      ],
      prompt: [
        "Recherchiere diese Entscheidung: [Entscheidung]. Markt: [Markt]. Zeitraum: [Daten]. Erlaubte interne Quellen: [Umfang].",
        "Schlage zuerst einen kurzen Plan und eine Quellenhierarchie vor. Erstelle dann Evidenzregister, Erkenntnisse, Widersprüche, fehlende Belege und Kampagnenfolgen.",
        "Zitiere jede externe Tatsachenbehauptung satznah. Trenne Fakten, Quelleninterpretationen und eigene Schlüsse. Bevorzuge Primärquellen und kennzeichne Sekundärbelege.",
        "Schreibe keine finalen Kampagnentexte. Schließe mit drei sicheren Erkenntnissen, drei riskanten Annahmen und der nächsten Rechercheaktion je Lücke.",
      ],
      checks: [
        "Öffne jede wichtige Quelle und prüfe Organisation, Datum, Geografie, Stichprobe und Aussage.",
        "Unterscheide unabhängige Evidenz, Anbieterwerbung und wiederholte Sekundärquellen.",
        "Suche Gegenbelege zur bevorzugten Strategie und erhalte wesentliche Uneinigkeit.",
        "Entferne interne Informationen, die nicht in einen teilbaren Export gehören.",
        "Lass Markt- oder Fachexperten Schlüsse vor dem Kreativbriefing freigeben.",
      ],
      limitIntro: ["Langer Kontext und Zitate erleichtern die Prüfung, ersetzen sie aber nicht. Breite Verbindungen können Informationen außerhalb des Kampagnenumfangs finden."],
      limits: [
        "Nutze für vertrauliche Arbeit den engsten praktikablen Connector- und Dokumentumfang.",
        "Ein echtes Zitat kann falsch interpretiert sein; lies den Kontext in der Originalquelle.",
        "Mache aus Korrelation, Anekdoten oder Anbieterbehauptungen keine Zielgruppenwahrheit.",
        "Funktionen und Limits ändern sich; prüfe Oberfläche und Tarif vor der Standardisierung.",
      ],
      sources,
    }),
    faqHeading: "Häufige Fragen zu Claude für Kampagnenrecherche",
    faq: [
      ["Wann sollte ich Claude Research nutzen?", "Wenn die Entscheidung aktuelle Webbelege aus mehreren Quellen braucht. Nutze nur bereitgestellte Dateien, wenn Webmaterial unnötig oder datenschutzkritisch wäre."],
      ["Kann Claude Google Workspace durchsuchen?", "Anthropic dokumentiert Integrationen und Research mit Google Workspace. Zugriff hängt von Konto, Tarif, Einrichtung und vorhandenen Berechtigungen ab."],
      ["Was gehört in das Ergebnis?", "Entscheidung, Methode, Evidenzregister, Erkenntnisse, Widersprüche, Einschränkungen, Kampagnenfolgen, Lücken, Datum und Verantwortlicher."],
      ["Kann das Dossier direkt in die Produktion?", "Noch nicht. Strategieverantwortliche müssen die Folgen freigeben und daraus ein fokussiertes Briefing mit zulässigen Aussagen machen."],
    ],
  },
};

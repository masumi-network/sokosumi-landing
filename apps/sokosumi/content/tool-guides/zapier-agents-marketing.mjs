import { article } from "../tool-guide-builder.mjs";

const sources = [
  ["What is Zapier?", "https://help.zapier.com/hc/en-us/articles/37518970271245-What-is-Zapier"],
  ["Build an agent in Zapier Agents", "https://help.zapier.com/hc/en-us/articles/24393442652557-Build-an-agent-in-Zapier-Agents"],
  ["Migrating Agents to AI by Zapier", "https://help.zapier.com/hc/en-us/articles/47402591569805-Migrating-from-Agents-to-AI-by-Zapier"],
];

export default {
  slug: "how-to-use-zapier-agents-for-marketing",
  tool: { key: "zapier", name: "Zapier Agents" },
  job: "campaign operations",
  compare: "n8n-vs-zapier",
  coworker: "alex",
  category: "advanced",
  order: 112,
  en: {
    title: "How to use Zapier Agents for campaign operations",
    description: "Automate a bounded campaign handoff across apps, with explicit triggers, tools, approvals and activity review around the AI step.",
    body: article("en", {
      intro: [
        "Zapier can combine deterministic triggers and actions with AI steps that summarize, classify or choose among allowed tools. For campaign operations, start with one repetitive handoff whose source and destination are already governed.",
        "Zapier's product is changing: its July 2026 documentation describes migration from standalone Agents to AI by Zapier inside Zaps. Check the current account interface before building and preserve the control principles below whichever surface you use.",
      ],
      fit: [
        "Turning an approved campaign request into a structured task across forms, tables and project tools.",
        "Classifying a bounded inbound item and routing it through explicit paths.",
        "Summarizing approved context before a human review step.",
        "Using connected app actions while keeping an activity history for investigation.",
      ],
      setup: [
        "Name one trigger, one successful end state and every app the flow may read or write.",
        "Give each connection a dedicated owner and least-privilege account where the app supports it.",
        "Define fields that AI may interpret and fields that deterministic steps must validate, such as IDs, dates, budgets and approval state.",
        "Create test records for success, missing data, duplicate trigger, unsafe request, app failure and required approval.",
      ],
      workflow: [
        "Create the trigger and normalize incoming fields before the AI step.",
        "Configure the AI instructions with allowed tools, knowledge sources, output schema and explicit forbidden actions.",
        "Use filters and paths to stop incomplete, duplicate or unapproved records.",
        "Add an approval before external publication, messaging, budget change or destructive update.",
        "Test every branch with non-production data and inspect all values passed between steps.",
        "Publish the smallest version, review activity frequently and version changes to prompts or tools.",
      ],
      prompt: [
        "For each approved campaign request, summarize the brief and prepare the next internal task using only the connected brief and asset table.",
        "Return campaign_id, channel, deliverable, owner, due_date, source_links, missing_fields and risk_flags. Do not change budgets, publish assets, contact external people or invent an owner.",
        "If approval_status is not approved or any required field is missing, stop and route to review with the reason.",
        "Use only the tools configured for this workflow and record the source item for every created task.",
      ],
      checks: [
        "Confirm triggers cannot loop back into themselves or create duplicate downstream items.",
        "Inspect activity history for input, chosen action, app response and errors.",
        "Test expired connections, rate limits and partial app outages.",
        "Verify approval is enforced by workflow state, not merely requested in prose.",
        "Track correction rate, failed runs, duplicate actions, time saved and cost by version.",
      ],
      limitIntro: ["Natural-language configuration does not remove the need to understand triggers, actions and data movement."],
      limits: [
        "Standalone Agents, AI by Zapier and other surfaces can differ; use current official documentation for migration and availability.",
        "Connected apps expand the blast radius of a bad instruction, so expose only required actions.",
        "Daily messages, activities, tasks or other usage limits depend on the current product and plan.",
        "Keep customer-facing sends and material account changes behind a verifiable approval step.",
      ],
      sources,
    }),
    faqHeading: "Zapier Agents for marketing: common questions",
    faq: [
      ["Are Zapier Agents still a standalone product?", "Zapier's July 2026 documentation describes migration of Agents into AI by Zapier inside Zaps. Check the current interface and migration guidance for your account."],
      ["What should the AI step decide?", "Let it summarize or classify bounded text and choose only among explicitly allowed tools. Keep required fields, approvals and consequential routing deterministic."],
      ["How do I prevent accidental actions?", "Limit connected tools, add filters and approval states, test every branch and review activity before expanding scope."],
      ["What is a good first workflow?", "Choose an internal handoff such as turning an approved brief into a project task. Avoid external sending or budget changes in the first version."],
    ],
  },
  de: {
    title: "Zapier Agents für Kampagnenprozesse nutzen",
    description: "Automatisiere eine begrenzte Kampagnenübergabe zwischen Apps mit klaren Triggern, Tools, Freigaben und Aktivitätsprüfung.",
    body: article("de", {
      intro: [
        "Zapier verbindet deterministische Trigger und Aktionen mit KI-Schritten für Zusammenfassung, Klassifizierung oder Auswahl erlaubter Tools. Beginne im Kampagnenbetrieb mit einer wiederkehrenden Übergabe zwischen bereits verwalteten Systemen.",
        "Das Produkt verändert sich: Zapiers Dokumentation vom Juli 2026 beschreibt die Migration eigenständiger Agents zu AI by Zapier in Zaps. Prüfe die aktuelle Oberfläche und erhalte die folgenden Kontrollprinzipien.",
      ],
      fit: [
        "Eine freigegebene Kampagnenanfrage in strukturierte Aufgaben über Formulare, Tabellen und Projekttools überführen.",
        "Begrenzte Eingangselemente klassifizieren und über explizite Pfade routen.",
        "Freigegebenen Kontext vor einer menschlichen Prüfung zusammenfassen.",
        "App-Aktionen nutzen und eine Aktivitätshistorie für Untersuchungen behalten.",
      ],
      setup: [
        "Definiere einen Trigger, einen erfolgreichen Endzustand und jede App mit Lese- oder Schreibzugriff.",
        "Gib jeder Verbindung einen Verantwortlichen und möglichst minimale Berechtigungen.",
        "Trenne KI-Felder von deterministisch geprüften Feldern wie IDs, Daten, Budgets und Freigabestatus.",
        "Erstelle Testfälle für Erfolg, fehlende Daten, Duplikat, unsichere Anfrage, App-Fehler und Freigabe.",
      ],
      workflow: [
        "Erstelle Trigger und normalisiere Eingabefelder vor dem KI-Schritt.",
        "Konfiguriere KI-Anweisungen mit erlaubten Tools, Wissensquellen, Ausgabeschema und verbotenen Aktionen.",
        "Stoppe unvollständige, doppelte oder nicht genehmigte Datensätze mit Filtern und Pfaden.",
        "Setze eine Freigabe vor Veröffentlichung, externem Versand, Budget- oder destruktiver Änderung.",
        "Teste jeden Zweig mit Nichtproduktionsdaten und prüfe alle Werte zwischen Schritten.",
        "Veröffentliche die kleinste Version, prüfe Aktivitäten und versioniere Prompt- oder Tooländerungen.",
      ],
      prompt: [
        "Fasse für jede freigegebene Kampagnenanfrage das Briefing zusammen und bereite die nächste interne Aufgabe nur aus Briefing und Asset-Tabelle vor.",
        "Gib campaign_id, channel, deliverable, owner, due_date, source_links, missing_fields und risk_flags zurück. Ändere keine Budgets, veröffentliche nichts, kontaktiere niemanden extern und erfinde keine Verantwortlichen.",
        "Wenn approval_status nicht approved ist oder Pflichtfelder fehlen, stoppe und route mit Begründung zur Prüfung.",
        "Nutze nur konfigurierte Tools und verknüpfe jedes erstellte Element mit seiner Quelle.",
      ],
      checks: [
        "Stelle sicher, dass Trigger keine Schleife oder doppelte Elemente erzeugen.",
        "Prüfe in der Aktivität Eingabe, Aktion, App-Antwort und Fehler.",
        "Teste abgelaufene Verbindungen, Limits und Teilausfälle.",
        "Erzwinge Freigabe durch Workflowstatus statt nur durch Text.",
        "Messe Korrekturquote, Fehler, Duplikate, Zeit und Kosten je Version.",
      ],
      limitIntro: ["Konfiguration in Alltagssprache ersetzt nicht das Verständnis von Triggern, Aktionen und Datenbewegung."],
      limits: [
        "Standalone Agents, AI by Zapier und andere Oberflächen unterscheiden sich; nutze aktuelle offizielle Migrationshinweise.",
        "Verbundene Apps vergrößern die Auswirkung schlechter Anweisungen; stelle nur nötige Aktionen bereit.",
        "Limits für Nachrichten, Aktivitäten oder Tasks hängen von Produkt und Tarif ab.",
        "Externe Kommunikation und wesentliche Kontoänderungen brauchen eine prüfbare Freigabe.",
      ],
      sources,
    }),
    faqHeading: "Häufige Fragen zu Zapier Agents im Marketing",
    faq: [
      ["Sind Zapier Agents noch eigenständig?", "Zapiers Dokumentation vom Juli 2026 beschreibt die Migration zu AI by Zapier in Zaps. Prüfe Oberfläche und Hinweise für dein Konto."],
      ["Was sollte der KI-Schritt entscheiden?", "Er darf begrenzten Text zusammenfassen oder klassifizieren und nur erlaubte Tools wählen. Pflichtfelder, Freigaben und wichtige Pfade bleiben deterministisch."],
      ["Wie verhindere ich versehentliche Aktionen?", "Begrenze Tools, setze Filter und Freigaben, teste jeden Zweig und prüfe Aktivitäten vor der Erweiterung."],
      ["Was ist ein guter erster Ablauf?", "Eine interne Übergabe vom freigegebenen Briefing zur Projektaufgabe. Vermeide zunächst externen Versand und Budgetänderungen."],
    ],
  },
};

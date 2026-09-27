import { article } from "../tool-guide-builder.mjs";

const sources = [
  ["What is Notion AI?", "https://www.notion.com/help/notion-ai-faqs"],
  ["Enterprise Search in Notion", "https://www.notion.com/help/enterprise-search"],
  ["Find answers and generate reports", "https://www.notion.com/help/guides/find-answers-and-generate-reports-with-enterprise-search"],
];

export default {
  slug: "how-to-use-notion-ai-for-campaign-planning",
  tool: { key: "notion", name: "Notion AI" },
  job: "campaign planning",
  compare: "notion-vs-chatgpt",
  coworker: "elena",
  category: "workflows",
  order: 114,
  en: {
    title: "How to use Notion AI for campaign planning",
    description: "Turn approved workspace knowledge into a campaign database, decision log and research brief without losing source ownership.",
    body: article("en", {
      intro: [
        "Notion AI sits beside project plans, pages and databases, so it can help turn existing workspace knowledge into a campaign operating system. The value is not another generated strategy document; it is keeping deliverables, evidence and decisions connected.",
        "Clean the workspace before asking AI to search it. Conflicting pages and abandoned plans will otherwise appear alongside approved knowledge.",
      ],
      fit: [
        "Finding answers across a Notion workspace and approved connected apps with source citations.",
        "Building or editing a campaign database with owners, dates, channels and approvals.",
        "Using Research Mode to synthesize workspace, connected and web context into a report.",
        "Creating a decision log and meeting follow-up that links back to source pages.",
      ],
      setup: [
        "Create one campaign home with links to the approved brief, claims, audience evidence, asset database and decision log.",
        "Archive or label superseded pages and name owners for sources that remain active.",
        "Configure connectors only for required apps and review their existing access. Use search scope controls for sensitive work.",
        "Define database properties before generation: deliverable, channel, audience, owner, due date, status, approval, source and dependency.",
      ],
      workflow: [
        "Use Enterprise Search to find relevant prior decisions and source pages. Open the citations and choose the current material.",
        "Ask Notion AI to create or refine the campaign database with the fixed property schema. Inspect every generated record.",
        "Run Research Mode for a bounded planning question and separate internal evidence, external evidence and inference.",
        "Convert approved implications into deliverables and dependencies, assigning real owners and dates yourself.",
        "Capture meeting decisions in the log with decision, rationale, source, owner and review date.",
        "Use database views for production, approvals and risks; keep the final status in properties rather than prose summaries.",
      ],
      prompt: [
        "Using only the approved pages under [campaign home], create a campaign planning database with the defined properties.",
        "For each deliverable, link the source brief, audience evidence and approved claim. Use unassigned rather than inventing an owner or date.",
        "List contradictions and missing approvals before creating records. Do not use archived pages or web sources unless I explicitly approve them.",
        "After creation, return a review table of missing source, owner, due date, dependency and approval fields.",
      ],
      checks: [
        "Open cited workspace and connector sources and confirm they are current and accessible to the intended team.",
        "Inspect every generated database property, formula and relation before relying on views.",
        "Verify that no archived plan silently became a current task.",
        "Keep owner, due date and approval as explicit properties with human accountability.",
        "Review connector scope and remove access that the campaign no longer needs.",
      ],
      limitIntro: ["Notion notes that AI answers should be checked for accuracy. Model choice and search scope can also affect whether workspace, app or web context is used."],
      limits: [
        "Notion AI availability depends on the current plan; verify access for every collaborator.",
        "Source citations make a workspace answer traceable but do not make an obsolete page authoritative.",
        "Do not let generated prose replace database state for deadlines, owners or approvals.",
        "Connected apps increase useful context and the importance of permission hygiene.",
      ],
      sources,
    }),
    faqHeading: "Notion AI for campaign planning: common questions",
    faq: [
      ["Can Notion AI build a campaign database?", "Notion documents an Agent that can create and edit pages and databases, plus database AI features. Inspect properties, relations and records before use."],
      ["Can it search connected tools?", "Notion Enterprise Search can use approved connectors such as Slack, Google Drive, Jira and others, depending on plan, setup and permissions."],
      ["What should stay human-owned?", "Strategy choices, owners, deadlines, approvals, sensitive access and final interpretation of evidence."],
      ["How do I avoid stale workspace context?", "Archive superseded pages, label current sources, assign owners and constrain search to the campaign home or selected sources."],
    ],
  },
  de: {
    title: "Notion AI für Kampagnenplanung nutzen",
    description: "Überführen Sie freigegebenes Workspace-Wissen in Kampagnendatenbank, Entscheidungslog und Recherchebriefing mit klarer Quellenverantwortung.",
    body: article("de", {
      intro: [
        "Notion AI arbeitet neben Projektplänen, Seiten und Datenbanken und kann vorhandenes Wissen in ein Kampagnenbetriebssystem überführen. Der Nutzen ist nicht ein weiterer Strategietext, sondern die Verbindung von Ergebnissen, Belegen und Entscheidungen.",
        "Bereinigen Sie den Workspace vor der Suche. Widersprüchliche Seiten und aufgegebene Pläne erscheinen sonst neben freigegebenem Wissen.",
      ],
      fit: [
        "Antworten in Workspace und freigegebenen verbundenen Apps mit Quellenhinweisen finden.",
        "Eine Kampagnendatenbank mit Verantwortlichen, Daten, Kanälen und Freigaben bauen oder bearbeiten.",
        "Mit Research Mode Workspace-, App- und Webkontext zu einem Bericht verbinden.",
        "Entscheidungsprotokoll und Meeting-Nachbereitung mit Quellenlinks erstellen.",
      ],
      setup: [
        "Erstellen Sie eine Kampagnenzentrale mit freigegebenem Briefing, Claims, Zielgruppenbelegen, Asset-Datenbank und Entscheidungslog.",
        "Archivieren oder markieren Sie ersetzte Seiten und benennen Sie Verantwortliche für aktive Quellen.",
        "Verbinden Sie nur nötige Apps, prüfen Sie deren Zugriffe und begrenzen Sie die Suche für sensible Arbeit.",
        "Definieren Sie die Datenbankfelder vorab: Ergebnis, Kanal, Zielgruppe, verantwortlich, Termin, Status, Freigabe, Quelle und Abhängigkeit.",
      ],
      workflow: [
        "Finden Sie mit Enterprise Search frühere Entscheidungen und Quellseiten. Öffnen Sie Zitate und wählen Sie aktuelles Material.",
        "Lassen Sie Notion AI die Kampagnendatenbank mit festem Schema erstellen oder verfeinern. Prüfen Sie jeden Datensatz.",
        "Nutzen Sie Research Mode für eine begrenzte Planungsfrage und trennen Sie interne Evidenz, externe Evidenz und Schluss.",
        "Überführen Sie freigegebene Folgen in Ergebnisse und Abhängigkeiten; echte Verantwortliche und Termine setzen Sie selbst.",
        "Dokumentieren Sie Entscheidungen mit Begründung, Quelle, Verantwortlichem und Prüfdatum.",
        "Nutzen Sie Views für Produktion, Freigaben und Risiken; der verbindliche Status bleibt in Properties.",
      ],
      prompt: [
        "Erstelle ausschließlich aus freigegebenen Seiten unter [Kampagnenzentrale] eine Kampagnendatenbank mit den definierten Properties.",
        "Verknüpfe je Ergebnis Quellbriefing, Zielgruppenbeleg und freigegebene Aussage. Nutze unassigned statt Verantwortliche oder Daten zu erfinden.",
        "Liste Widersprüche und fehlende Freigaben vor der Erstellung. Nutze keine archivierten Seiten oder Webquellen ohne Zustimmung.",
        "Gib danach eine Prüftabelle für fehlende Quelle, Verantwortung, Termin, Abhängigkeit und Freigabe aus.",
      ],
      checks: [
        "Öffnen Sie zitierte Workspace- und Connector-Quellen und bestätigen Sie Aktualität und Teamzugriff.",
        "Prüfen Sie alle erzeugten Properties, Formeln und Relationen vor der Nutzung von Views.",
        "Stellen Sie sicher, dass kein archivierter Plan zur aktuellen Aufgabe wurde.",
        "Halten Sie Verantwortung, Termin und Freigabe als explizite Properties mit menschlicher Zuständigkeit.",
        "Prüfen Sie den Connector-Scope und entfernen Sie nicht mehr benötigten Zugriff.",
      ],
      limitIntro: ["Notion weist darauf hin, KI-Antworten auf Richtigkeit zu prüfen. Modellwahl und Suchscope beeinflussen zudem Workspace-, App- oder Webkontext."],
      limits: [
        "Verfügbarkeit hängt vom aktuellen Tarif ab; prüfen Sie den Zugang aller Beteiligten.",
        "Quellenhinweise machen Antworten nachvollziehbar, aber alte Seiten nicht verbindlich.",
        "Ersetzen Sie den Datenbankstatus für Termine, Verantwortliche oder Freigaben nicht durch Fließtext.",
        "Verbundene Apps erhöhen Kontext und Bedeutung sauberer Berechtigungen.",
      ],
      sources,
    }),
    faqHeading: "Häufige Fragen zu Notion AI für Kampagnenplanung",
    faq: [
      ["Kann Notion AI eine Kampagnendatenbank bauen?", "Notion dokumentiert einen Agenten für Seiten und Datenbanken sowie KI-Datenbankfunktionen. Prüfen Sie Properties, Relationen und Einträge."],
      ["Kann es verbundene Tools durchsuchen?", "Enterprise Search kann freigegebene Connectoren wie Slack, Google Drive oder Jira nutzen, abhängig von Tarif, Einrichtung und Rechten."],
      ["Was bleibt menschliche Aufgabe?", "Strategie, Verantwortliche, Termine, Freigaben, sensible Zugriffe und finale Interpretation."],
      ["Wie vermeide ich alten Workspace-Kontext?", "Archivieren Sie ersetzte Seiten, kennzeichnen Sie aktuelle Quellen, ordnen Sie Verantwortliche zu und begrenzen Sie die Suche."],
    ],
  },
};

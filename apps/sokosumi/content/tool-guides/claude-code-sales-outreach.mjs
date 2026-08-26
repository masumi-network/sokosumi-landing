import { article } from "../tool-guide-builder.mjs";

const sources = [
  ["Claude Code CLI reference", "https://docs.anthropic.com/en/docs/claude-code/cli-usage"],
  ["Model Context Protocol in Claude Code", "https://docs.anthropic.com/en/docs/claude-code/mcp"],
  ["Claude Code for data infrastructure", "https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf"],
];

export default {
  slug: "how-to-use-claude-code-for-sales-outreach",
  tool: { key: "claude-code", name: "Claude Code" },
  job: "sales outreach operations",
  compare: "codex-vs-claude-code",
  coworker: "alex",
  category: "advanced",
  order: 106,
  en: {
    title: "How to use Claude Code for sales outreach operations",
    description: "Build a controlled local pipeline that validates account inputs and prepares outreach drafts without turning an agent into an unsafe sender.",
    body: article("en", {
      intro: [
        "Claude Code can help non-developers operate repeatable data workflows from a repository. For outreach, the safe use case is preparing and validating research or draft files—not letting an agent scrape indiscriminately or send messages on its own.",
        "Keep the workflow local and reviewable first. Every account should retain its source, transformation result and rejection reason.",
      ],
      fit: [
        "Validating account CSVs against a documented schema and producing a rejected-row report.",
        "Joining approved research fields with message templates while preserving provenance.",
        "Generating draft files for human review with predictable JSON or CSV output.",
        "Connecting narrowly scoped internal tools through MCP when security owners approve them.",
      ],
      setup: [
        "Create a repository with a CLAUDE.md that defines field meanings, approved sources, forbidden actions, output schema and review commands.",
        "Use redacted fixtures. Keep CRM, enrichment and email credentials out of the repository and do not connect them until the offline pipeline passes review.",
        "Define deterministic validation before model work: required fields, allowed regions, suppression status, source URL, source date and maximum text length.",
        "Require print or structured-output mode for automation so another process can validate the result before use.",
      ],
      workflow: [
        "Ask Claude Code to inspect the schema and create a validator with tests for valid, missing, stale and suppressed records.",
        "Normalize approved fields without guessing missing company names, roles or URLs. Send failures to a review file.",
        "For valid rows, produce a research brief that separates source fact from business hypothesis.",
        "Generate one draft per account in a structured format with character count, evidence URL and review status.",
        "Run tests and reconcile counts: input equals approved plus rejected, with no silent drops.",
        "Import only approved drafts into the sending system through the team's governed process.",
      ],
      prompt: [
        "Build a local, review-only outreach preparation pipeline for [input.csv]. Follow CLAUDE.md and do not send messages or access production systems.",
        "Validate required fields, permitted market, source URL and date, and suppression status before any generated text. Never infer a missing identity or contact field.",
        "Output approved-drafts.json and rejected-rows.csv. Every draft must include account_id, verified_signal, source_url, hypothesis, message, character_count and review_status=pending.",
        "Add tests for valid, stale, missing and suppressed records. Report input, approved and rejected counts and stop if they do not reconcile.",
      ],
      checks: [
        "Inspect the command permissions and every MCP server before connection; grant only the tools needed for this task.",
        "Run with fixtures first and confirm no hidden network or send step exists.",
        "Reconcile counts and manually review samples from every rejection category.",
        "Verify each draft's source and ensure hypotheses are not presented as facts.",
        "Keep final contact compliance and sending controls in the CRM or outreach platform.",
      ],
      limitIntro: ["A CLI agent can modify files and call connected tools. That makes configuration and permissions part of the marketing workflow, not an engineering footnote."],
      limits: [
        "Do not connect unrestricted CRM or email tools merely for convenience.",
        "MCP standardizes connections but does not make every server or action trustworthy.",
        "Structured output improves validation but does not verify the underlying fact.",
        "Human review is still required for identity, relevance, claims, compliance and final send.",
      ],
      sources,
    }),
    faqHeading: "Claude Code for outreach operations: common questions",
    faq: [
      ["Why use Claude Code instead of Claude chat?", "Use Claude Code when the task needs repeatable work across local files, scripts, tests or narrowly connected tools. Use chat for an isolated draft or discussion."],
      ["Should Claude Code send the emails?", "This guide keeps sending outside the agent. Import only human-approved drafts into a governed outreach platform with suppression and compliance controls."],
      ["What belongs in CLAUDE.md?", "Document the schema, source policy, forbidden actions, style constraints, output contract, tests and review process."],
      ["Is MCP safe by default?", "No. Review each server and tool, authenticate through approved methods and grant the narrowest permissions required."],
    ],
  },
  de: {
    title: "Claude Code für Sales-Outreach-Prozesse nutzen",
    description: "Baue eine kontrollierte lokale Pipeline, die Account-Daten prüft und Entwürfe vorbereitet, ohne den Agenten zum riskanten Versender zu machen.",
    body: article("de", {
      intro: [
        "Claude Code kann auch Nichtentwicklern helfen, wiederholbare Datenabläufe in einem Repository zu betreiben. Für Outreach ist das sichere Einsatzfeld die Vorbereitung und Prüfung von Recherche- oder Entwurfsdateien – nicht unkontrolliertes Scraping oder selbstständiger Versand.",
        "Halte den Ablauf zunächst lokal und prüfbar. Für jeden Account müssen Quelle, Transformation und Ablehnungsgrund erhalten bleiben.",
      ],
      fit: [
        "Account-CSVs gegen ein dokumentiertes Schema prüfen und abgelehnte Zeilen ausgeben.",
        "Freigegebene Recherchefelder mit Vorlagen verbinden und die Herkunft bewahren.",
        "Entwurfsdateien mit vorhersehbarem JSON- oder CSV-Format für menschliche Prüfung erzeugen.",
        "Eng begrenzte interne Tools über MCP verbinden, wenn Sicherheitsverantwortliche zustimmen.",
      ],
      setup: [
        "Lege ein Repository mit CLAUDE.md für Feldbedeutung, erlaubte Quellen, verbotene Aktionen, Ausgabeschema und Prüfkommandos an.",
        "Nutze anonymisierte Testdaten. Halte CRM-, Enrichment- und E-Mail-Zugänge aus dem Repository und verbinde sie erst nach Offline-Prüfung.",
        "Definiere deterministische Regeln vor Modellarbeit: Pflichtfelder, Regionen, Sperrstatus, Quellen-URL, Datum und Textlänge.",
        "Nutze für Automation Print- oder strukturierte Ausgabe, damit ein weiterer Prozess das Ergebnis validieren kann.",
      ],
      workflow: [
        "Lass Claude Code Schema und Tests für gültige, unvollständige, veraltete und gesperrte Datensätze erstellen.",
        "Normalisiere freigegebene Felder, ohne fehlende Firma, Rolle oder URL zu raten. Fehler gehen in eine Prüfdatei.",
        "Erstelle je gültiger Zeile ein Recherchebriefing, das Quellenfakt und Geschäftshypothese trennt.",
        "Erzeuge je Account einen strukturierten Entwurf mit Zeichenzahl, Beleg-URL und Prüfstatus.",
        "Führe Tests aus und gleiche Mengen ab: Eingang entspricht Freigaben plus Ablehnungen, ohne stillen Verlust.",
        "Importiere nur freigegebene Entwürfe über den verwalteten Prozess ins Versandsystem.",
      ],
      prompt: [
        "Baue eine lokale, nur zur Prüfung gedachte Outreach-Pipeline für [input.csv]. Befolge CLAUDE.md, versende nichts und greife nicht auf Produktion zu.",
        "Prüfe Pflichtfelder, erlaubten Markt, Quellen-URL und -Datum sowie Sperrstatus vor jeder Textgenerierung. Errate keine Identitäts- oder Kontaktdaten.",
        "Erzeuge approved-drafts.json und rejected-rows.csv. Jeder Entwurf enthält account_id, verified_signal, source_url, hypothesis, message, character_count und review_status=pending.",
        "Ergänze Tests für gültige, alte, fehlende und gesperrte Datensätze. Melde Ein-, Freigabe- und Ablehnungszahlen und stoppe bei Differenzen.",
      ],
      checks: [
        "Prüfe Kommandorechte und jeden MCP-Server vor der Verbindung; erlaube nur benötigte Tools.",
        "Teste zuerst mit Beispieldaten und bestätige, dass kein versteckter Netzwerk- oder Versandschritt existiert.",
        "Gleiche Mengen ab und prüfe Stichproben jeder Ablehnungskategorie.",
        "Öffne jede Entwurfsquelle und stelle Hypothesen nicht als Fakten dar.",
        "Belasse Kontakt-Compliance und Versandkontrollen im CRM oder Outreach-System.",
      ],
      limitIntro: ["Ein CLI-Agent kann Dateien ändern und verbundene Tools aufrufen. Konfiguration und Berechtigungen sind deshalb Teil des Marketingprozesses."],
      limits: [
        "Verbinde nicht aus Bequemlichkeit uneingeschränkte CRM- oder E-Mail-Tools.",
        "MCP standardisiert Verbindungen, macht aber nicht jeden Server oder jede Aktion vertrauenswürdig.",
        "Strukturierte Ausgabe erleichtert Prüfung, bestätigt aber nicht den zugrunde liegenden Fakt.",
        "Identität, Relevanz, Aussagen, Compliance und Versand brauchen menschliche Freigabe.",
      ],
      sources,
    }),
    faqHeading: "Häufige Fragen zu Claude Code für Outreach-Prozesse",
    faq: [
      ["Warum Claude Code statt Claude Chat?", "Claude Code eignet sich für wiederholbare Arbeit mit lokalen Dateien, Skripten, Tests oder begrenzt verbundenen Tools. Chat genügt für einen einzelnen Entwurf."],
      ["Soll Claude Code E-Mails versenden?", "Dieser Ablauf trennt den Versand. Nur menschlich freigegebene Entwürfe kommen in ein verwaltetes System mit Sperr- und Compliance-Kontrollen."],
      ["Was gehört in CLAUDE.md?", "Schema, Quellenregeln, verbotene Aktionen, Stilvorgaben, Ausgabevertrag, Tests und Prüfprozess."],
      ["Ist MCP automatisch sicher?", "Nein. Prüfe jeden Server und jedes Tool, authentifiziere genehmigt und vergebe nur die nötigen Rechte."],
    ],
  },
};

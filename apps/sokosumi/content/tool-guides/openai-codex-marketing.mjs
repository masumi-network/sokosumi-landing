import { article } from "../tool-guide-builder.mjs";

const sources = [
  ["Codex use cases", "https://developers.openai.com/codex/use-cases"],
  ["Codex CLI features", "https://developers.openai.com/codex/cli/features"],
  ["How OpenAI uses Codex", "https://cdn.openai.com/pdf/6a2631dc-783e-479b-b1a4-af0cfbd38630/how-openai-uses-codex.pdf"],
];

export default {
  slug: "how-to-use-openai-codex-for-marketing",
  tool: { key: "chatgpt", name: "OpenAI Codex" },
  job: "marketing operations",
  compare: "codex-vs-claude-code",
  coworker: "alex",
  category: "advanced",
  order: 104,
  en: {
    title: "How to use OpenAI Codex for marketing operations",
    description: "Give Codex a bounded repository task to clean campaign data, update content safely, or build a small internal marketing workflow.",
    body: article("en", {
      intro: [
        "Codex is a coding agent, so its marketing value appears when the work touches files, data, scripts or an internal tool. It can inspect a repository, change code and run checks; it should not be used as an unsupervised publisher or a source of invented campaign facts.",
        "Start with a narrow task that has a testable finish line. A clean CSV transformation or one content-template change is better than a vague instruction to improve all marketing.",
      ],
      fit: [
        "Cleaning and joining repeatable campaign exports with a checked script.",
        "Updating structured content across localized pages while preserving the site's schema.",
        "Building a small internal report, calculator or approval utility around existing data.",
        "Investigating broken links, metadata gaps or tracking regressions and showing the evidence.",
      ],
      setup: [
        "Use a version-controlled repository and start from a clean, recoverable branch. Document the commands that test the affected area.",
        "Give Codex the business goal, exact files in scope, acceptance criteria and operations it must not perform.",
        "Use a small redacted fixture instead of a production customer export. Keep credentials in approved environment variables or secret stores.",
        "Define the review gate: which diff, output sample, test and owner are required before merge or publication.",
      ],
      workflow: [
        "Ask Codex to inspect the relevant files and explain the current data flow before editing.",
        "Have it propose the smallest change and name assumptions. Resolve any assumption that could alter data or external state.",
        "Implement against a representative fixture. Require explicit types, simple functions and no unrelated refactor.",
        "Run focused tests, formatting and a sample command. Compare row counts, required fields and totals with the source.",
        "Review the diff yourself. For content, inspect rendered pages; for data, reconcile a manual sample.",
        "Merge or deploy through the team's normal process and preserve a rollback path.",
      ],
      prompt: [
        "In this repository, build a repeatable script that transforms [input file] into [required output].",
        "Scope: [files]. Required fields: [fields]. Acceptance criteria: [tests and sample totals]. Do not access production systems, send messages, publish content or change unrelated files.",
        "First inspect the repository conventions and describe the current flow. Then implement the smallest change, run the relevant checks and report exact files changed, commands run and unresolved risks.",
        "Never print or commit secrets. Stop before any irreversible or external action.",
      ],
      checks: [
        "Inspect the complete diff and reject unrelated dependency, configuration or formatting churn.",
        "Run the transformation twice and confirm stable output where determinism is expected.",
        "Reconcile input and output row counts, missing values, duplicates, dates, currencies and locale formats.",
        "Check that logs, fixtures and generated files contain no personal data or secrets.",
        "For website changes, verify the actual route on desktop and mobile before deployment.",
      ],
      limitIntro: ["Repository access is powerful. Permissions, review and a bounded task matter more than the cleverness of the prompt."],
      limits: [
        "Do not give a coding agent broad production credentials for a task that can be completed on local fixtures.",
        "Generated tests can repeat the same mistaken assumption as generated code; include independent expected values.",
        "A passing script does not prove marketing correctness. A domain owner must review mappings, claims and intended use.",
        "Keep external writes, deploys and sends behind explicit approval unless the task already authorizes them.",
      ],
      sources,
    }),
    faqHeading: "Codex for marketing operations: common questions",
    faq: [
      ["Do marketers need to know how to code?", "They need to define inputs, outputs and acceptance criteria. A technical reviewer should still own changes that affect production code or sensitive data."],
      ["What is a good first Codex task?", "Choose a bounded, reversible task such as validating UTM fields in a sample export or updating one structured content template with tests."],
      ["Can Codex publish website changes?", "It can work within a deployment workflow, but publication should follow repository permissions, review and explicit authorization."],
      ["How should secrets be handled?", "Use an approved secret store or environment variable, scope access narrowly, and ensure commands, logs and commits never expose the value."],
    ],
  },
  de: {
    title: "OpenAI Codex für Marketing Operations nutzen",
    description: "Geben Sie Codex eine klar begrenzte Repository-Aufgabe für Kampagnendaten, sichere Content-Updates oder einen kleinen internen Marketingablauf.",
    body: article("de", {
      intro: [
        "Codex ist ein Coding-Agent. Sein Marketingnutzen entsteht bei Dateien, Daten, Skripten oder internen Tools. Er kann ein Repository untersuchen, Code ändern und Prüfungen ausführen; er sollte weder unbeaufsichtigt veröffentlichen noch Kampagnenfakten erfinden.",
        "Beginnen Sie mit einer engen Aufgabe und überprüfbarem Endzustand. Eine saubere CSV-Transformation oder eine Content-Vorlage ist besser als der Auftrag, das gesamte Marketing zu verbessern.",
      ],
      fit: [
        "Wiederkehrende Kampagnenexporte mit einem geprüften Skript bereinigen und verbinden.",
        "Strukturierte Inhalte über lokalisierte Seiten aktualisieren, ohne das Seitenschema zu brechen.",
        "Einen kleinen internen Bericht, Rechner oder Freigabehelfer auf vorhandenen Daten bauen.",
        "Defekte Links, Metadatenlücken oder Tracking-Regressionen untersuchen und belegen.",
      ],
      setup: [
        "Nutzen Sie ein versioniertes Repository und einen sauberen, wiederherstellbaren Branch. Dokumentieren Sie die Prüfkommandos für den Bereich.",
        "Nennen Sie Geschäftsziel, Dateien im Scope, Akzeptanzkriterien und ausdrücklich verbotene Aktionen.",
        "Verwenden Sie einen kleinen anonymisierten Testdatensatz statt eines produktiven Kundenexports. Halten Sie Zugangsdaten in freigegebenen Secret-Systemen.",
        "Definieren Sie den Freigabepunkt: benötigter Diff, Beispieloutput, Test und verantwortliche Person.",
      ],
      workflow: [
        "Lassen Sie Codex zuerst relevante Dateien untersuchen und den bestehenden Datenfluss erklären.",
        "Fordern Sie die kleinste Änderung samt Annahmen. Klären Sie jede Annahme, die Daten oder externe Systeme beeinflusst.",
        "Lassen Sie Codex gegen einen repräsentativen Testdatensatz implementieren, mit expliziten Typen, einfachen Funktionen und ohne Refactoring nebenbei.",
        "Führen Sie fokussierte Tests, Formatierung und einen Beispielaufruf aus. Vergleichen Sie Zeilen, Pflichtfelder und Summen.",
        "Prüfen Sie den Diff selbst, bei Content zusätzlich die gerenderte Seite, bei Daten eine manuelle Stichprobe.",
        "Nutzen Sie den normalen Merge- und Deploymentprozess und halten Sie einen Rollback-Pfad bereit.",
      ],
      prompt: [
        "Erstelle in diesem Repository ein wiederholbares Skript, das [Eingabedatei] in [benötigte Ausgabe] überführt.",
        "Scope: [Dateien]. Pflichtfelder: [Felder]. Akzeptanzkriterien: [Tests und Beispielsummen]. Greife nicht auf Produktion zu, versende nichts, veröffentliche nichts und ändere keine fremden Dateien.",
        "Untersuche zuerst Konventionen und bestehenden Ablauf. Implementiere dann die kleinste Änderung, führe relevante Prüfungen aus und nenne exakte Dateien, Kommandos und offene Risiken.",
        "Gib Secrets niemals aus und committe sie nicht. Stoppe vor irreversiblen oder externen Aktionen.",
      ],
      checks: [
        "Prüfen Sie den vollständigen Diff und lehnen Sie fremde Abhängigkeits-, Konfigurations- oder Formatierungsänderungen ab.",
        "Führen Sie die Transformation zweimal aus und prüfen Sie bei erwarteter Deterministik identische Ergebnisse.",
        "Gleichen Sie Zeilenzahl, fehlende Werte, Duplikate, Datums-, Währungs- und Locale-Formate ab.",
        "Stellen Sie sicher, dass Logs, Testdaten und generierte Dateien keine Personendaten oder Secrets enthalten.",
        "Prüfen Sie Website-Änderungen vor dem Deployment auf der echten Route in Desktop und Mobile.",
      ],
      limitIntro: ["Repository-Zugriff ist mächtig. Berechtigungen, Prüfung und ein klarer Scope sind wichtiger als ein raffinierter Prompt."],
      limits: [
        "Geben Sie einem Coding-Agent keine breiten Produktionsrechte, wenn lokale Testdaten genügen.",
        "Generierte Tests können dieselbe falsche Annahme wie der Code wiederholen; nutzen Sie unabhängige Sollwerte.",
        "Ein laufendes Skript beweist keine fachliche Marketingrichtigkeit. Fachverantwortliche prüfen Mappings, Aussagen und Nutzung.",
        "Externe Schreibaktionen, Deployments und Versand bleiben hinter expliziter Freigabe.",
      ],
      sources,
    }),
    faqHeading: "Häufige Fragen zu Codex für Marketing Operations",
    faq: [
      ["Müssen Marketingteams programmieren können?", "Sie müssen Eingaben, Ausgaben und Akzeptanzkriterien definieren. Produktionscode und sensible Daten brauchen weiterhin technische Prüfung."],
      ["Was ist eine gute erste Codex-Aufgabe?", "Eine begrenzte, reversible Aufgabe wie UTM-Felder in einem Testexport prüfen oder eine strukturierte Content-Vorlage samt Tests aktualisieren."],
      ["Kann Codex Website-Änderungen veröffentlichen?", "Es kann in einem Deploymentprozess arbeiten, aber Veröffentlichungen folgen Repository-Rechten, Review und expliziter Freigabe."],
      ["Wie gehe ich mit Secrets um?", "Nutzen Sie freigegebene Secret Stores oder Umgebungsvariablen, begrenzen Sie den Zugriff und verhindern Sie Werte in Kommandos, Logs und Commits."],
    ],
  },
};

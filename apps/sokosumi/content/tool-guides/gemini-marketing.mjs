import { article } from "../tool-guide-builder.mjs";

const sources = [
  ["Gemini in Google Sheets", "https://support.google.com/docs/answer/14356410"],
  ["Gemini for marketing", "https://support.google.com/a/users/answer/14196644"],
  ["Deep Research in Gemini Apps", "https://support.google.com/gemini/answer/15719111"],
];

export default {
  slug: "how-to-use-gemini-for-marketing",
  tool: { key: "gemini", name: "Gemini" },
  job: "marketing in Google Workspace",
  compare: "claude-vs-gemini",
  coworker: "elena",
  category: "workflows",
  order: 107,
  en: {
    title: "How to use Gemini for marketing in Google Workspace",
    description: "Use Gemini in Sheets and Workspace to organize a campaign, analyze approved data, and keep plans connected to the files your team uses.",
    body: article("en", {
      intro: [
        "Gemini is most useful to a Workspace-based marketing team when it reduces copying between a brief, spreadsheet and working documents. Keep the source of truth in the files; use Gemini to create structure, formulas, summaries and questions around them.",
        "This workflow builds a campaign control sheet from an approved brief and data. It does not ask the model to invent budgets, benchmarks or results.",
      ],
      fit: [
        "Creating a campaign table with owners, dates, budget fields, status and dependencies.",
        "Generating or explaining formulas and surfacing patterns in a well-structured Sheet.",
        "Summarizing relevant Drive or Gmail context when the Workspace connection and permissions are approved.",
        "Using Deep Research for a current cited report that can be exported to Docs.",
      ],
      setup: [
        "Clean the source Sheet: one header row, stable column names, consistent dates and currencies, no merged cells in the data range.",
        "Define which file owns each fact. Keep budget actuals in the finance-approved Sheet and approved claims in the controlled brief.",
        "Restrict sharing before adding sensitive information. Gemini follows product and account availability, but your file permissions still define who can see the work.",
        "Write the campaign outcome, market, period and review owner at the top of the brief.",
      ],
      workflow: [
        "Ask Gemini in Sheets to create or refine the campaign table with explicit column names. Inspect before inserting.",
        "Add deterministic formulas for pacing, variance and overdue status. Verify formulas against two manual examples.",
        "Ask for observations about supplied performance data, requiring the cell ranges behind every observation.",
        "Use Docs or Gmail support for drafts grounded in the approved brief, then revise tone and claims manually.",
        "For external questions, run Deep Research with an edited plan and selected sources; export the report to Docs for review.",
        "Record decisions back in the control sheet instead of leaving the final answer only in chat.",
      ],
      prompt: [
        "Help me build a campaign control table in this Sheet for [campaign]. Use only the brief and existing sheet data.",
        "Columns: deliverable, audience, channel, owner, start_date, due_date, budget_planned, budget_actual, status, dependency, approval_owner and source_link.",
        "Suggest formulas for budget variance, days remaining and overdue flag. Explain each formula and reference the exact columns. Do not invent values or fill missing owners.",
        "Before inserting anything, show the proposed table and list ambiguities that require a human decision.",
      ],
      checks: [
        "Verify every formula with known inputs, especially date, currency and percentage behavior.",
        "Trace summaries back to exact cells, email threads or Drive files.",
        "Confirm generated tables do not overwrite protected ranges or formulas.",
        "Review all external claims and citations in the exported research report.",
        "Keep owners and approvals explicit; a generated status is not a project decision.",
      ],
      limitIntro: ["Gemini features, supported languages and limits depend on the eligible Workspace or Google AI plan. The UI is the source of truth for your account."],
      limits: [
        "Use native Google Sheets where possible; Google's help notes that Gemini works best there rather than directly in an Excel file.",
        "Do not accept formulas or charts without checking the selected range and denominator.",
        "Connected mail and files can contain sensitive context; apply least-privilege sharing and approved data policy.",
        "Research reports still need source review before their findings become campaign claims.",
      ],
      sources,
    }),
    faqHeading: "Gemini for Workspace marketing: common questions",
    faq: [
      ["What can Gemini do in Google Sheets?", "Google documents table creation, formulas, analysis, charts and several sheet actions. Availability depends on the plan and language."],
      ["Can it use Gmail and Drive context?", "Google documents Workspace connections for relevant features. Access depends on connection setup, plan and the user's existing permissions."],
      ["Should Gemini set the campaign budget?", "No. It can structure and analyze approved budget inputs. A responsible owner should set and approve the numbers."],
      ["Can I export Deep Research?", "Google documents sharing, copying and export to Docs for research reports. Review citations and conclusions after export."],
    ],
  },
  de: {
    title: "Gemini für Marketing in Google Workspace nutzen",
    description: "Organisiere mit Gemini in Sheets und Workspace Kampagnen, analysiere freigegebene Daten und halte Pläne an den Teamdateien verankert.",
    body: article("de", {
      intro: [
        "Gemini ist für ein Workspace-Marketingteam besonders nützlich, wenn es Kopierarbeit zwischen Briefing, Tabelle und Arbeitsdokumenten reduziert. Die Dateien bleiben Quelle der Wahrheit; Gemini hilft bei Struktur, Formeln, Zusammenfassungen und Fragen.",
        "Dieser Ablauf erstellt aus freigegebenem Briefing und Daten eine Kampagnensteuerung. Budgets, Benchmarks oder Ergebnisse werden nicht erfunden.",
      ],
      fit: [
        "Eine Kampagnentabelle mit Verantwortlichen, Daten, Budgetfeldern, Status und Abhängigkeiten erstellen.",
        "Formeln erzeugen oder erklären und Muster in einer sauber strukturierten Tabelle finden.",
        "Relevanten Drive- oder Gmail-Kontext zusammenfassen, wenn Verbindung und Berechtigungen freigegeben sind.",
        "Mit Deep Research einen aktuellen zitierten Bericht erstellen und nach Docs exportieren.",
      ],
      setup: [
        "Bereinige die Quelltabelle: eine Kopfzeile, feste Spaltennamen, einheitliche Daten und Währungen, keine verbundenen Zellen im Datenbereich.",
        "Definiere die Quelle jedes Fakts. Budget-Istwerte bleiben in der freigegebenen Finanzdatei, Aussagen im kontrollierten Briefing.",
        "Begrenze Freigaben vor sensiblen Inhalten. Dateirechte bestimmen weiterhin, wer die Arbeit sehen kann.",
        "Schreibe Kampagnenziel, Markt, Zeitraum und Prüfverantwortung an den Anfang.",
      ],
      workflow: [
        "Lass Gemini in Sheets die Kampagnentabelle mit expliziten Spalten vorschlagen oder verfeinern. Prüfe vor dem Einfügen.",
        "Ergänze deterministische Formeln für Pacing, Abweichung und Überfälligkeit. Prüfe sie an zwei manuellen Beispielen.",
        "Fordere Beobachtungen zu vorhandenen Leistungsdaten und die Zellbereiche hinter jeder Beobachtung.",
        "Nutze Docs oder Gmail für Entwürfe aus dem freigegebenen Briefing und überarbeite Ton und Aussagen selbst.",
        "Nutze für externe Fragen Deep Research mit geprüftem Plan und ausgewählten Quellen; exportiere nach Docs.",
        "Trage Entscheidungen in die Steuertabelle ein, statt das Endergebnis nur im Chat zu lassen.",
      ],
      prompt: [
        "Hilf mir, in diesem Sheet eine Kampagnensteuertabelle für [Kampagne] zu erstellen. Nutze nur Briefing und vorhandene Tabellendaten.",
        "Spalten: Ergebnis, Zielgruppe, Kanal, verantwortlich, start_date, due_date, budget_planned, budget_actual, status, dependency, approval_owner und source_link.",
        "Schlage Formeln für Budgetabweichung, Resttage und Überfälligkeit vor. Erkläre jede Formel und nenne Spalten. Erfinde keine Werte oder Verantwortlichen.",
        "Zeige vor dem Einfügen die vorgeschlagene Tabelle und liste Unklarheiten für menschliche Entscheidungen auf.",
      ],
      checks: [
        "Prüfe jede Formel mit bekannten Werten, besonders Datums-, Währungs- und Prozentlogik.",
        "Führe Zusammenfassungen auf konkrete Zellen, E-Mail-Threads oder Drive-Dateien zurück.",
        "Stelle sicher, dass generierte Tabellen keine geschützten Bereiche oder Formeln überschreiben.",
        "Prüfe externe Aussagen und Zitate im exportierten Recherchebericht.",
        "Halte Verantwortung und Freigabe explizit; ein generierter Status ist keine Projektentscheidung.",
      ],
      limitIntro: ["Funktionen, Sprachen und Limits hängen vom berechtigten Workspace- oder Google-AI-Tarif ab. Die Kontooberfläche ist maßgeblich."],
      limits: [
        "Nutze möglichst native Google Sheets; laut Google arbeitet Gemini dort besser als direkt in Excel-Dateien.",
        "Übernimm Formeln oder Diagramme nie ohne Datenbereich und Nenner zu prüfen.",
        "Verbundene Mails und Dateien können sensible Inhalte enthalten; nutze minimale Freigaben und genehmigte Datenregeln.",
        "Rechercheberichte brauchen Quellenprüfung, bevor Erkenntnisse zu Kampagnenaussagen werden.",
      ],
      sources,
    }),
    faqHeading: "Häufige Fragen zu Gemini für Workspace-Marketing",
    faq: [
      ["Was kann Gemini in Google Sheets?", "Google dokumentiert Tabellen, Formeln, Analyse, Diagramme und mehrere Tabellenaktionen. Verfügbarkeit hängt von Tarif und Sprache ab."],
      ["Kann es Gmail- und Drive-Kontext nutzen?", "Google dokumentiert Workspace-Verbindungen für passende Funktionen. Zugriff hängt von Einrichtung, Tarif und bestehenden Nutzerrechten ab."],
      ["Soll Gemini das Kampagnenbudget festlegen?", "Nein. Es kann freigegebene Zahlen strukturieren und analysieren. Eine verantwortliche Person setzt und genehmigt das Budget."],
      ["Kann ich Deep Research exportieren?", "Google dokumentiert Teilen, Kopieren und Export nach Docs. Prüfe danach Zitate und Schlüsse."],
    ],
  },
};

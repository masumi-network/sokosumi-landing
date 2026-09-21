import { article } from "../tool-guide-builder.mjs";

const sources = [
  ["Microsoft 365 Copilot overview", "https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-overview"],
  ["Copilot Chat in Microsoft 365 apps", "https://support.microsoft.com/en-us/microsoft-365-copilot/how-copilot-chat-works-in-microsoft-365-apps"],
  ["Microsoft 365 Copilot for marketing", "https://adoption.microsoft.com/en-us/scenario-library/marketing/"],
];

export default {
  slug: "how-to-use-microsoft-copilot-for-marketing",
  tool: { key: "copilot", name: "Microsoft 365 Copilot" },
  job: "B2B marketing in Microsoft 365",
  compare: "copilot-vs-chatgpt",
  coworker: "elena",
  category: "workflows",
  order: 108,
  en: {
    title: "How to use Microsoft 365 Copilot for B2B marketing",
    description: "Move an approved campaign brief through Word, Excel, PowerPoint, Outlook and Teams while preserving owners, evidence and review gates.",
    body: article("en", {
      intro: [
        "Microsoft 365 Copilot is strongest when the campaign already lives in Microsoft 365. It can help draft in Word, inspect data in Excel, build a presentation and summarize work in Outlook or Teams while respecting the user's accessible work context.",
        "Treat Microsoft Graph grounding as access to relevant context, not automatic approval of every old file it finds. Start from named, current sources.",
      ],
      fit: [
        "Drafting and revising a campaign brief in Word from approved source files.",
        "Exploring campaign data in Excel with suggested formulas, charts and questions.",
        "Creating a stakeholder deck in PowerPoint from an approved Word document.",
        "Summarizing meetings or email threads and extracting actions with owners.",
      ],
      setup: [
        "Put the current brief, claim sheet, budget and timeline in a controlled campaign location with clear filenames and owners.",
        "Archive or label obsolete versions so they are not mistaken for current evidence.",
        "Review sharing and sensitivity before asking Copilot to use organizational context. It can only be as well governed as the underlying permissions.",
        "Define the target audience, desired decision and approval stage for every output.",
      ],
      workflow: [
        "In Word, ask Copilot to create a brief from named files. Require a source list and mark any contradiction between them.",
        "In Excel, analyze the approved performance table. Request formulas or visualizations, then verify selected ranges and calculations manually.",
        "Revise the brief with actual findings and owner decisions; do not let the presentation become a separate source of truth.",
        "Create a PowerPoint draft from the approved Word file and apply the organization's template. Review narrative, numbers and slide notes.",
        "Use Outlook or Teams to draft the review message and summarize decisions. Confirm owners and due dates before distribution.",
        "Save the approved version and decision log in the governed campaign location.",
      ],
      prompt: [
        "Using only [named Word brief], [named Excel file] and [approved claims document], prepare a B2B campaign review for [audience].",
        "Decision required: [decision]. Return a concise executive summary, evidence table, performance observations with exact Excel ranges, risks, open decisions and actions with proposed owners.",
        "Flag conflicting or stale files. Do not invent targets, budget, customer quotes or product capabilities. Label every inference.",
        "Before creating slides or sending a message, show the proposed narrative and ask for approval.",
      ],
      checks: [
        "Open each source file and confirm it is the approved version and within its validity date.",
        "Recalculate material Excel observations and inspect chart ranges, filters and hidden rows.",
        "Check that PowerPoint preserves meaning instead of shortening away caveats.",
        "Review recipients and attachments before any Outlook action.",
        "Record final decisions in a shared document rather than relying on generated meeting summaries alone.",
      ],
      limitIntro: ["Copilot capabilities vary by app, license and account configuration. Permissions prevent some unauthorized access, but over-broad sharing still creates over-broad context."],
      limits: [
        "Do not assume every document surfaced through organizational context is current or authoritative.",
        "Generated Excel formulas and insights require independent checking.",
        "A generated deck is not an approved narrative until owners review data, claims and emphasis.",
        "Check current licensing and feature availability for the intended users before designing the process.",
      ],
      sources,
    }),
    faqHeading: "Microsoft 365 Copilot for marketing: common questions",
    faq: [
      ["Which Microsoft 365 apps can support this workflow?", "Microsoft documents Copilot capabilities across apps including Word, Excel, PowerPoint, Outlook and Teams, with access varying by license and account."],
      ["Does Copilot respect file permissions?", "Microsoft says responses use work data the user has permission to access. Teams should still correct over-broad permissions and stale shared files."],
      ["Can Copilot create a deck from a Word brief?", "Microsoft documents creating PowerPoint drafts from prompts or Word files. Review the chosen source, template, figures and narrative before use."],
      ["Should Copilot send campaign emails?", "Use it to draft, but review recipient, claims, attachments, tone and approval before sending."],
    ],
  },
  de: {
    title: "Microsoft 365 Copilot für B2B-Marketing nutzen",
    description: "Führe ein freigegebenes Kampagnenbriefing durch Word, Excel, PowerPoint, Outlook und Teams und erhalte Belege und Freigaben.",
    body: article("de", {
      intro: [
        "Microsoft 365 Copilot ist besonders stark, wenn die Kampagne bereits in Microsoft 365 lebt. Es unterstützt Entwürfe in Word, Datenarbeit in Excel, Präsentationen und Zusammenfassungen in Outlook oder Teams im zugänglichen Arbeitskontext.",
        "Graph-Kontext bedeutet Zugriff auf relevante Informationen, nicht automatische Freigabe jeder alten Datei. Beginne mit benannten, aktuellen Quellen.",
      ],
      fit: [
        "Ein Kampagnenbriefing in Word aus freigegebenen Quelldateien entwerfen und überarbeiten.",
        "Kampagnendaten in Excel mit Formeln, Diagrammen und Analysefragen untersuchen.",
        "Aus einem freigegebenen Word-Dokument eine Stakeholder-Präsentation erstellen.",
        "Meetings oder E-Mail-Threads zusammenfassen und Aufgaben mit Verantwortlichen ableiten.",
      ],
      setup: [
        "Lege aktuelles Briefing, Claim-Liste, Budget und Zeitplan mit klaren Namen und Verantwortlichen an einem verwalteten Ort ab.",
        "Archiviere oder markiere alte Versionen, damit sie nicht als aktuelle Evidenz gelten.",
        "Prüfe Freigaben und Vertraulichkeit vor der Nutzung von Organisationskontext. Die Governance hängt von den zugrunde liegenden Rechten ab.",
        "Definiere für jede Ausgabe Zielgruppe, benötigte Entscheidung und Freigabestufe.",
      ],
      workflow: [
        "Lass in Word aus benannten Dateien ein Briefing erstellen. Fordere Quellenliste und Kennzeichnung von Widersprüchen.",
        "Analysiere die freigegebene Leistungstabelle in Excel. Prüfe vorgeschlagene Formeln, Datenbereiche und Berechnungen manuell.",
        "Aktualisiere das Briefing mit echten Erkenntnissen und Entscheidungen; die Präsentation bleibt nicht eigene Wahrheitsquelle.",
        "Erstelle in PowerPoint einen Entwurf aus der freigegebenen Word-Datei und nutze das Unternehmenstemplate. Prüfe Erzählung und Zahlen.",
        "Entwirf in Outlook oder Teams Prüfkommunikation und fasse Entscheidungen zusammen. Bestätige Verantwortliche und Termine.",
        "Speichere freigegebene Version und Entscheidungsprotokoll am verwalteten Kampagnenort.",
      ],
      prompt: [
        "Erstelle ausschließlich aus [benanntem Word-Briefing], [benannter Excel-Datei] und [freigegebenem Claim-Dokument] eine B2B-Kampagnenprüfung für [Zielgruppe].",
        "Benötigte Entscheidung: [Entscheidung]. Liefere Management-Zusammenfassung, Evidenztabelle, Leistungsbeobachtungen mit exakten Excel-Bereichen, Risiken, offene Entscheidungen und Aufgaben mit vorgeschlagenen Verantwortlichen.",
        "Markiere widersprüchliche oder alte Dateien. Erfinde keine Ziele, Budgets, Kundenzitate oder Funktionen. Kennzeichne jeden Schluss.",
        "Zeige vor Folienerstellung oder Versand die vorgeschlagene Erzählung und warte auf Freigabe.",
      ],
      checks: [
        "Öffne jede Quelldatei und bestätige Freigabestatus und Gültigkeit.",
        "Berechne wesentliche Excel-Erkenntnisse nach und prüfe Bereiche, Filter und ausgeblendete Zeilen.",
        "Stelle sicher, dass PowerPoint beim Kürzen keine Einschränkungen verliert.",
        "Prüfe Empfänger und Anhänge vor jeder Outlook-Aktion.",
        "Dokumentiere Entscheidungen gemeinsam statt nur in generierten Meeting-Zusammenfassungen.",
      ],
      limitIntro: ["Funktionen hängen von App, Lizenz und Konto ab. Berechtigungen verhindern manchen Fremdzugriff, aber zu breite Freigaben erzeugen zu breiten Kontext."],
      limits: [
        "Betrachte nicht jedes gefundene Organisationsdokument als aktuell oder verbindlich.",
        "Generierte Excel-Formeln und Erkenntnisse müssen unabhängig geprüft werden.",
        "Eine erzeugte Präsentation ist erst nach Prüfung von Daten, Aussagen und Gewichtung freigegeben.",
        "Prüfe aktuelle Lizenz und Verfügbarkeit für die vorgesehenen Nutzer.",
      ],
      sources,
    }),
    faqHeading: "Häufige Fragen zu Microsoft 365 Copilot im Marketing",
    faq: [
      ["Welche Microsoft-365-Apps unterstützen den Ablauf?", "Microsoft dokumentiert Funktionen unter anderem in Word, Excel, PowerPoint, Outlook und Teams. Zugriff hängt von Lizenz und Konto ab."],
      ["Beachtet Copilot Dateiberechtigungen?", "Microsoft zufolge nutzt es Arbeitsdaten, auf die der Nutzer zugreifen darf. Teams sollten dennoch zu breite Rechte und alte Dateien bereinigen."],
      ["Kann Copilot aus Word eine Präsentation erstellen?", "Microsoft dokumentiert PowerPoint-Entwürfe aus Prompts oder Word-Dateien. Prüfe Quelle, Vorlage, Zahlen und Erzählung."],
      ["Soll Copilot Kampagnenmails versenden?", "Nutze es für Entwürfe, aber prüfe Empfänger, Aussagen, Anhänge, Ton und Freigabe vor dem Versand."],
    ],
  },
};

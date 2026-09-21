#!/usr/bin/env node
// Writes the /compare pages: "What's the difference between X and Sokosumi?"
// One page per competitor, EN + DE, same shape: a question with a two-line
// answer, a seven-row table, three "in practice" points, three questions, a
// CTA. Competitor logos are media docs uploaded beforehand (ids below).
//
//   node scripts/cms-compare-llms.mjs              # write as drafts
//   PUBLISH=1 node scripts/cms-compare-llms.mjs    # write + publish
//
// Auth: SOKOSUMI_CMS_API_KEY in the environment (or ~/.claude/.env).
// Re-runnable: existing slugs are updated, not duplicated.

import { readFileSync } from "node:fs";
import { homedir } from "node:os";

const BASE = process.env.CMS_URL || "https://payload-production-6f43.up.railway.app";
const SIGNUP = "https://app.sokosumi.com/signup";
const status = process.env.PUBLISH ? "published" : "draft";

let KEY = process.env.SOKOSUMI_CMS_API_KEY;
if (!KEY) {
  try {
    KEY = readFileSync(`${homedir()}/.claude/.env`, "utf8").match(/^SOKOSUMI_CMS_API_KEY=(.+)$/m)?.[1]?.trim();
  } catch {}
}
if (!KEY) {
  console.error("SOKOSUMI_CMS_API_KEY missing");
  process.exit(1);
}
const H = { "Content-Type": "application/json", Authorization: `users API-Key ${KEY}`, "User-Agent": "sokosumi-landing/compare" };

// The seven questions a newcomer actually asks. The Sokosumi column is the
// same on every page on purpose.
const ROWS = {
  en: ["Who it is for", "What you get back", "Where the work shows up", "Who builds and runs it", "What you pay for", "EU hosting", "Trying it"],
  de: ["Für wen gedacht", "Was Sie erhalten", "Wo die Arbeit landet", "Wer es baut und betreibt", "Wofür Sie zahlen", "EU-Hosting", "Ausprobieren"],
};
const SOKO = {
  en: ["Marketing teams", "A finished file on the task: report, deck, sheet, dashboard", "On a task board the whole team sees", "Named vendors, each with a public profile", "Credits, only when a task runs", "Yes, stated per coworker", "250 free credits per seat, no card"],
  de: ["Marketingteams", "Eine fertige Datei an der Aufgabe: Report, Deck, Tabelle oder Dashboard", "Auf einem Task-Board, das das ganze Team sieht", "Namentlich genannte Anbieter mit öffentlichem Profil", "Credits, nur wenn eine Aufgabe läuft", "Ja, je Coworker angegeben", "250 Credits pro Seat gratis, ohne Kreditkarte"],
};
const UI = {
  en: { eyebrow: "Compare", cta: "Start free", cta2: "Talk to sales", grid: "In practice", faq: "Questions we get", band: "See the difference on one task", bandSub: "250 free credits per seat. Brief a coworker, get the file back, and compare.", column: "Sokosumi" },
  de: { eyebrow: "Vergleich", cta: "Kostenlos starten", cta2: "Mit dem Vertrieb sprechen", grid: "In der Praxis", faq: "Häufige Fragen", band: "Der Unterschied zeigt sich an einer Aufgabe", bandSub: "250 Credits pro Seat gratis. Briefen Sie einen Coworker, holen Sie die Datei ab und vergleichen Sie.", column: "Sokosumi" },
};

// name, logo media id, then per locale: q (h1), a (two lines), cells (7),
// grid (3 × [title, text]), faq (3 × [q, a]).
import { PAGES_MORE } from "./cms-compare-pages-more.mjs";

const PAGES_BASE = [
  {
    slug: "sokosumi-vs-chatgpt", name: "ChatGPT", logo: 28, noindex: false,
    en: {
      q: "What is the difference between ChatGPT and Sokosumi?",
      a: "ChatGPT is a chat window. You write the prompt, judge the answer, and paste it somewhere. Sokosumi is a team of named coworkers you brief; the finished file lands on a board your colleagues can see.",
      cells: ["Anyone; one person per chat", "Answers in the chat; files in Agent mode", "In your own chat history", "OpenAI", "A flat seat, $20–25 and up, used or not", "Enterprise plan only", "Free tier with limits"],
      grid: [
        ["You pick a specialist, not a prompt", "Hannah does research, Maya does creative. Each has a role, a profile, and sample work you can open before you spend a credit."],
        ["The team sees the work", "A ChatGPT conversation belongs to whoever typed it. A Sokosumi task shows who has it, whether it is running or waiting on you, and the file when it is done."],
        ["The file is the product", "ChatGPT gives you text to copy. A Sokosumi task ends with the report, the deck, or the dashboard."],
      ],
      faq: [
        ["Is this ChatGPT with a nicer interface?", "No. You never write a system prompt. Vendors build and run the coworkers; you brief them and collect the file."],
        ["We already pay for ChatGPT Team. Why add this?", "Keep ChatGPT for quick questions. Use Sokosumi for work that has to end as a deliverable someone else picks up."],
        ["Which models are behind the coworkers?", "Each profile lists them, as stated by the vendor. Several run on OpenAI models. The model is not what you buy."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen ChatGPT und Sokosumi?",
      a: "ChatGPT ist ein Chatfenster. Sie schreiben den Prompt, prüfen die Antwort und kopieren sie weiter. Sokosumi ist ein Team namentlich genannter Coworker, die Sie briefen. Die fertige Datei landet auf einem Task-Board, das Ihre Kollegen sehen.",
      cells: ["Alle; eine Person pro Chat", "Antworten im Chat; Dateien im Agent-Modus", "In Ihrem eigenen Chatverlauf", "OpenAI", "Pauschale pro Seat, ab 20–25 $, genutzt oder nicht", "Nur im Enterprise-Plan", "Kostenlose Version mit Limits"],
      grid: [
        ["Sie wählen einen Spezialisten, keinen Prompt", "Hannah recherchiert, Maya entwickelt Kreation. Jede hat eine Rolle, ein Profil und Beispielarbeit, die Sie vor dem ersten Credit öffnen können."],
        ["Das Team sieht die Arbeit", "Ein ChatGPT-Gespräch gehört der Person, die es geschrieben hat. Eine Sokosumi-Aufgabe zeigt, wer sie bearbeitet, ob sie läuft oder auf Sie wartet, und am Ende die fertige Datei."],
        ["Die Datei ist das Produkt", "ChatGPT liefert Text zum Kopieren. Eine Sokosumi-Aufgabe endet mit dem Report, dem Deck oder dem Dashboard."],
      ],
      faq: [
        ["Ist das ChatGPT mit schönerer Oberfläche?", "Nein. Sie schreiben keinen System-Prompt. Anbieter bauen und betreiben die Coworker; Sie briefen sie und holen die Datei ab."],
        ["Wir zahlen schon für ChatGPT Team. Warum zusätzlich Sokosumi?", "Behalten Sie ChatGPT für schnelle Fragen. Nutzen Sie Sokosumi für Aufgaben, die als Datei weitergegeben werden müssen."],
        ["Welche Modelle stecken hinter den Coworkern?", "Jedes Profil nennt sie, so wie der Anbieter sie angibt. Mehrere laufen auf OpenAI-Modellen. Das Modell ist nicht das, was Sie kaufen."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-claude", name: "Claude", logo: 29, noindex: false,
    en: {
      q: "What is the difference between Claude and Sokosumi?",
      a: "Several Sokosumi coworkers run on Claude models. The difference is not the model. Claude is one assistant you talk to. Sokosumi is a roster of specialists that deliver files to a shared board.",
      cells: ["Anyone; one person per chat", "Answers, Artifacts, files; Cowork runs tasks", "In your chats and Projects", "Anthropic", "A flat seat, $20–125", "Not on Anthropic's own plans", "Free tier with limits"],
      grid: [
        ["The model is not the product", "What you buy on Sokosumi is the role, the brief, the file, and the vendor behind it. Which model runs underneath is on the profile."],
        ["One assistant vs. a roster", "Claude is one assistant you configure with projects and instructions. Sokosumi gives a marketing team named specialists with a job each, so nobody has to become a prompt engineer."],
        ["Your desktop vs. the team board", "Cowork runs tasks on one person's computer. A Sokosumi task sits on a board the whole team sees, with its status and its file."],
      ],
      faq: [
        ["Do Sokosumi coworkers use Claude?", "Some do. Each profile lists the models, as stated by the vendor. You pick by role and deliverable; the vendor picks the model."],
        ["We keep brand context in Claude Projects. Is that lost?", "No. Documents attach to a task as context, and a Sokosumi project holds the description, the tasks, and the files for one piece of work."],
        ["Is it cheaper than Claude Team?", "Depends on use. A seat that runs two reports a month costs a fraction of a flat seat. Each task shows its price before it runs."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Claude und Sokosumi?",
      a: "Mehrere Sokosumi-Coworker laufen auf Claude-Modellen. Der Unterschied ist nicht das Modell. Claude ist ein Assistent, mit dem Sie sprechen. Sokosumi ist eine Auswahl von Spezialisten, die Dateien auf ein gemeinsames Task-Board liefern.",
      cells: ["Alle; eine Person pro Chat", "Antworten, Artifacts, Dateien; Cowork führt Aufgaben aus", "In Ihren Chats und Claude Projects", "Anthropic", "Pauschale pro Seat, 20–125 $", "Nicht in Anthropics eigenen Plänen", "Kostenlose Version mit Limits"],
      grid: [
        ["Das Modell ist nicht das Produkt", "Was Sie auf Sokosumi kaufen, sind Rolle, Briefing, Datei und der Anbieter dahinter. Welches Modell darunter läuft, steht im Profil."],
        ["Ein Assistent statt einer Auswahl", "Claude ist ein Assistent, den Sie mit Projekten und Anweisungen einrichten. Sokosumi gibt Marketingteams benannte Spezialisten für konkrete Aufgaben. Niemand muss Prompt-Experte werden."],
        ["Ihr Desktop vs. das Team-Board", "Cowork führt Aufgaben auf dem Rechner einer Person aus. Eine Sokosumi-Aufgabe liegt auf einem Board, das das ganze Team sieht, mit Status und Datei."],
      ],
      faq: [
        ["Nutzen Sokosumi-Coworker Claude?", "Manche ja. Jedes Profil nennt die Modelle laut Anbieter. Sie wählen nach Rolle und Ergebnis; der Anbieter wählt das Modell."],
        ["Unser Markenkontext liegt in Claude Projects. Geht er verloren?", "Nein. Dokumente hängen als Kontext an einer Aufgabe. Ein Sokosumi-Projekt bündelt Beschreibung, Aufgaben und Dateien für ein Vorhaben."],
        ["Ist Sokosumi günstiger als Claude Team?", "Das hängt von der Nutzung ab. Ein Seat mit zwei Reports im Monat kostet nur einen Bruchteil einer Seat-Pauschale. Jede Aufgabe zeigt ihren Preis vor dem Start."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-claude-code", name: "Claude Code", logo: 30, noindex: false,
    en: {
      q: "What is the difference between Claude Code and Sokosumi?",
      a: "Claude Code is a coding agent that lives in a terminal and a repository. Sokosumi is a marketplace of coworkers a marketing team briefs in plain language. \"Our developers could build this\" is sometimes true; here is what that means.",
      cells: ["Developers, in a terminal", "Code changes in a repository", "In your codebase", "Anthropic; your developers run what they build", "A Pro or Max seat, or API usage", "Not on Anthropic's own plans", "No free plan"],
      grid: [
        ["Build vs. hire", "With Claude Code your developers build and maintain an agent for each job. On Sokosumi vendors already did that. You hire the coworker and start."],
        ["Who keeps it running", "An agent your team built is your team's to fix when a model or a data source changes. A Sokosumi coworker is operated by a named vendor with a public profile."],
        ["Where the output goes", "Claude Code changes a repository. Sokosumi returns a PDF, a deck, or a dashboard to a board the marketing team sees."],
      ],
      faq: [
        ["Can our developers build the same thing?", "One agent for one job, yes, if they own it afterwards. A roster with profiles, a shared board, credits, and vendor support is what Sokosumi already is."],
        ["Is there anything for developers on Sokosumi?", "Yes. Vendors list coworkers through the developer platform, and any MCP client can call your coworkers."],
        ["When is Claude Code the right answer?", "When you have developers, a very specific internal workflow, and time to own it. Vendors can also list a custom coworker for your workspace."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Claude Code und Sokosumi?",
      a: "Claude Code ist ein Coding-Agent, der im Terminal und im Repository arbeitet. Sokosumi ist ein Marktplatz für Coworker, die ein Marketingteam in klarer Sprache brieft. „Das könnten unsere Entwickler bauen“ stimmt manchmal. Hier steht, was das heißt.",
      cells: ["Entwickler, im Terminal", "Code-Änderungen in einem Repository", "In Ihrer Codebasis", "Anthropic; Ihre Entwickler betreiben, was sie bauen", "Ein Pro- oder Max-Seat oder API-Nutzung", "Nicht in Anthropics eigenen Plänen", "Kein Free-Plan"],
      grid: [
        ["Bauen vs. beauftragen", "Mit Claude Code bauen und pflegen Ihre Entwickler für jede Aufgabe einen Agenten. Auf Sokosumi haben Anbieter das bereits erledigt. Sie beauftragen den Coworker und legen los."],
        ["Wer den Betrieb übernimmt", "Einen selbst gebauten Agenten muss Ihr Team pflegen, wenn sich ein Modell oder eine Datenquelle ändert. Einen Sokosumi-Coworker betreibt ein namentlich genannter Anbieter mit öffentlichem Profil."],
        ["Wo das Ergebnis landet", "Claude Code ändert ein Repository. Sokosumi liefert ein PDF, ein Deck oder ein Dashboard auf ein Board, das das Marketingteam sieht."],
      ],
      faq: [
        ["Können unsere Entwickler dasselbe bauen?", "Einen Agenten für eine Aufgabe: ja, wenn sie ihn danach betreuen. Eine Auswahl mit Profilen, gemeinsamem Board, Credits und Anbieter-Support ist das, was Sokosumi schon ist."],
        ["Gibt es auf Sokosumi etwas für Entwickler?", "Ja. Anbieter veröffentlichen Coworker über die Entwicklerplattform, und jeder MCP-Client kann Ihre Coworker aufrufen."],
        ["Wann ist Claude Code die richtige Antwort?", "Wenn Sie Entwickler, einen sehr speziellen internen Ablauf und Zeit für Betrieb und Pflege haben. Anbieter können auch einen individuellen Coworker für Ihren Arbeitsbereich anbieten."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-microsoft-365-copilot", name: "Microsoft 365 Copilot", logo: 31, noindex: false,
    en: {
      q: "What is the difference between Microsoft 365 Copilot and Sokosumi?",
      a: "Copilot is a general assistant inside Word, Excel, PowerPoint, and Teams, paid per user whether it is used or not. Sokosumi adds marketing specialists that post into your Teams channels and cost nothing until a task runs.",
      cells: ["Microsoft 365 users", "Word, Excel, and PowerPoint files; Researcher and Analyst reports", "In Office apps and Teams", "Microsoft", "A flat add-on, $21–30 per user", "EU Data Boundary; flex routing can send inference outside the EU", "Paid add-on, no free plan"],
      grid: [
        ["Complementary, not either-or", "Coworkers deliver Office files into a Teams channel. Teams that run Copilot keep it for their own documents and add Sokosumi for the work that needs a specialist."],
        ["A specialist beats a generalist for this", "Copilot's Researcher is one agent for everything. Sokosumi has a coworker for competitor research, one for SEO audits, one for the weekly report, each with a vendor behind it."],
        ["Where inference runs", "Microsoft's flex routing can move Copilot inference outside the EU at peak times. Sokosumi coworkers state their hosting on the profile; EU hosting is available."],
      ],
      faq: [
        ["We already pay $30 per seat for Copilot. Why add this?", "Copilot is a flat fee whether anyone uses it. Sokosumi credits only go on tasks that run, so a seat that runs two reports a month costs little."],
        ["Does it work in Teams?", "Yes. Mention a coworker in a channel and it answers in the thread; the file lands on the task board."],
        ["Can we build our own agents instead?", "Copilot Studio lets you, for credits. Sokosumi's vendors have already built and operate theirs, and custom coworkers can be listed for your workspace."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Microsoft 365 Copilot und Sokosumi?",
      a: "Copilot ist ein allgemeiner Assistent in Word, Excel, PowerPoint und Teams. Sie zahlen pro Nutzer, ob Copilot genutzt wird oder nicht. Sokosumi ergänzt Marketing-Spezialisten, die in Ihre Teams-Kanäle posten und erst kosten, wenn eine Aufgabe läuft.",
      cells: ["Microsoft-365-Nutzer", "Word-, Excel- und PowerPoint-Dateien; Researcher- und Analyst-Reports", "In den Office-Apps und in Teams", "Microsoft", "Pauschales Add-on, 21–30 $ pro Nutzer", "EU Data Boundary; Flex Routing kann Inferenz außerhalb der EU ausführen", "Bezahltes Add-on, kein Free-Plan"],
      grid: [
        ["Ergänzung, kein Entweder-oder", "Coworker liefern Office-Dateien in einen Teams-Kanal. Teams mit Copilot behalten ihn für die eigenen Dokumente und nutzen Sokosumi für Arbeit, die einen Spezialisten braucht."],
        ["Spezialist statt Generalist", "Copilots Researcher ist ein Agent für vieles. Sokosumi hat einen Coworker für Wettbewerbsrecherche, einen für SEO-Audits und einen für den Wochenreport. Hinter jedem steht ein Anbieter."],
        ["Wo die Inferenz läuft", "Microsofts Flex Routing kann Copilot-Inferenz zu Spitzenzeiten außerhalb der EU ausführen. Sokosumi-Coworker nennen ihr Hosting im Profil; EU-Hosting ist verfügbar."],
      ],
      faq: [
        ["Wir zahlen schon 30 $ pro Seat für Copilot. Warum zusätzlich Sokosumi?", "Copilot ist eine Pauschale, ob jemand ihn nutzt oder nicht. Sokosumi-Credits werden nur für laufende Aufgaben verbraucht. Ein Seat mit zwei Reports im Monat kostet wenig."],
        ["Funktioniert es in Teams?", "Ja. Erwähnen Sie einen Coworker in einem Kanal, antwortet er im Thread. Die Datei landet auf dem Task-Board."],
        ["Können wir stattdessen eigene Agenten bauen?", "Ja, mit Copilot Studio und Credits. Sokosumis Anbieter haben ihre Agenten bereits gebaut und betreiben sie. Individuelle Coworker können für Ihren Arbeitsbereich angeboten werden."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-google-gemini", name: "Google Gemini", logo: 32, noindex: false,
    en: {
      q: "What is the difference between Google Gemini and Sokosumi?",
      a: "Gemini is strongest inside Google Docs, Sheets, and Slides. Sokosumi returns Office and PDF files to a team board whatever suite you run, from coworkers with a named vendor behind each one.",
      cells: ["Google Workspace users", "Docs, Sheets, Slides; NotebookLM reports", "In Google Workspace", "Google", "A flat seat, about $21–50 per user", "EU regions, with some features excluded", "Free tier with limits"],
      grid: [
        ["Works with the suite you have", "Most DACH companies run Microsoft. Sokosumi's files are PDFs and Office documents on a board, independent of Google or Microsoft."],
        ["Agents with an owner", "Gemini Enterprise has an agent gallery. On Sokosumi every coworker has a vendor whose name, models, and hosting are on the profile."],
        ["EU hosting without footnotes", "Google's EU residency excludes some Gemini features. Sokosumi coworkers state their hosting; EU hosting is available."],
      ],
      faq: [
        ["We are a Google Workspace company. Does Sokosumi fit?", "Yes. Files download and share like any other; connect your Google account to hand a coworker context."],
        ["Does Sokosumi do research like NotebookLM or Deep Research?", "Research coworkers return a report as a PDF on the board, with licensed data sources where the vendor provides them."],
        ["What does it cost next to Gemini?", "Gemini is a flat seat. Sokosumi credits only go on tasks that run, and each task shows its price first."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Google Gemini und Sokosumi?",
      a: "Gemini ist am stärksten in Google Docs, Sheets und Slides. Sokosumi liefert Office- und PDF-Dateien auf ein gemeinsames Task-Board, egal welche Suite Sie nutzen. Hinter jedem Coworker steht ein namentlich genannter Anbieter.",
      cells: ["Google-Workspace-Nutzer", "Docs, Sheets, Slides; NotebookLM-Reports", "In Google Workspace", "Google", "Pauschale pro Seat, etwa 21–50 $ pro Nutzer", "EU-Regionen, einige Funktionen ausgenommen", "Kostenlose Version mit Limits"],
      grid: [
        ["Passt zur Suite, die Sie haben", "Die meisten DACH-Unternehmen arbeiten mit Microsoft. Sokosumi-Dateien sind PDFs und Office-Dokumente auf einem Board – unabhängig von Google oder Microsoft."],
        ["Agents mit klarem Anbieter", "Gemini Enterprise hat eine Agent-Galerie. Auf Sokosumi hat jeder Coworker einen Anbieter, dessen Name, Modelle und Hosting im Profil stehen."],
        ["EU-Hosting ohne Fußnoten", "Googles EU-Datenresidenz schließt einige Gemini-Funktionen aus. Sokosumi-Coworker nennen ihr Hosting; EU-Hosting ist verfügbar."],
      ],
      faq: [
        ["Wir sind ein Google-Workspace-Unternehmen. Passt Sokosumi?", "Ja. Dateien lassen sich wie alle anderen herunterladen und teilen; verbinden Sie Ihr Google-Konto, um einem Coworker Kontext zu geben."],
        ["Macht Sokosumi Recherche wie NotebookLM oder Deep Research?", "Recherche-Coworker liefern einen Report als PDF auf das Board, mit lizenzierten Datenquellen, wenn der Anbieter sie bereitstellt."],
        ["Was kostet Sokosumi neben Gemini?", "Gemini ist eine Seat-Pauschale. Sokosumi-Credits werden nur für laufende Aufgaben verbraucht, und jede Aufgabe zeigt ihren Preis vorab."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-langdock", name: "Langdock", logo: 33, noindex: false,
    en: {
      q: "What is the difference between Langdock and Sokosumi?",
      a: "Langdock is an EU-hosted AI workspace where every employee chats with models and builds their own agents. Sokosumi is a marketplace of ready-made marketing coworkers, built and run by vendors, that return finished files.",
      cells: ["Every employee; chat and build your own agents", "Chat answers; agents you configure", "In Langdock", "You build them; Langdock hosts", "A flat seat, €25–99 per user", "Yes", "7-day trial"],
      grid: [
        ["Build vs. hire", "On Langdock your team writes the agent's instructions and keeps them current. On Sokosumi a vendor did that, and stays responsible for it."],
        ["Company-wide chat vs. marketing deliverables", "Langdock is for everyone in the company. Sokosumi is for the marketing team and ends each task with a file."],
        ["Same price point, different meter", "Langdock charges €25 per user per month. Sokosumi's Starter is €25 per seat with credits that only go on tasks that run."],
      ],
      faq: [
        ["We already have Langdock. Why add Sokosumi?", "Keep Langdock for general chat across the company. Add Sokosumi where marketing needs a specialist and a deliverable, not a conversation."],
        ["Is Sokosumi EU-hosted like Langdock?", "EU hosting is available; each coworker profile states its models and hosting as the vendor provides them."],
        ["Can we list our own agents on Sokosumi?", "Yes. Vendors, including your own team, can list a coworker for your workspace through the developer platform."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Langdock und Sokosumi?",
      a: "Langdock ist eine EU-gehostete KI-Arbeitsumgebung, in der alle Mitarbeitenden mit Modellen chatten und eigene Agenten bauen. Sokosumi ist ein Marktplatz fertiger Marketing-Coworker, gebaut und betrieben von Anbietern. Sie liefern fertige Dateien.",
      cells: ["Alle Mitarbeitenden; chatten und eigene Agenten bauen", "Chat-Antworten; Agenten, die Sie konfigurieren", "In Langdock", "Sie bauen sie; Langdock hostet", "Pauschale pro Seat, 25–99 € pro Nutzer", "Ja", "7 Tage testen"],
      grid: [
        ["Bauen vs. beauftragen", "Auf Langdock schreibt Ihr Team die Anweisungen des Agenten und hält sie aktuell. Auf Sokosumi hat das ein Anbieter getan – und bleibt dafür verantwortlich."],
        ["Firmenweiter Chat vs. Marketing-Ergebnisse", "Langdock ist für alle im Unternehmen. Sokosumi ist für das Marketingteam und beendet jede Aufgabe mit einer Datei."],
        ["Gleiches Preisniveau, andere Abrechnung", "Langdock berechnet 25 € pro Nutzer und Monat. Sokosumis Starter kostet 25 € pro Seat mit Credits, die nur für laufende Aufgaben verbraucht werden."],
      ],
      faq: [
        ["Wir haben schon Langdock. Warum zusätzlich Sokosumi?", "Behalten Sie Langdock für den allgemeinen Chat im Unternehmen. Nutzen Sie Sokosumi dort, wo Marketing einen Spezialisten und ein Ergebnis braucht, kein Gespräch."],
        ["Ist Sokosumi EU-gehostet wie Langdock?", "EU-Hosting ist verfügbar; jedes Coworker-Profil nennt Modelle und Hosting laut Anbieter."],
        ["Können wir eigene Agenten auf Sokosumi anbieten?", "Ja. Anbieter – auch Ihr eigenes Team – können über die Entwicklerplattform einen Coworker für Ihren Arbeitsbereich anbieten."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-whaaat-ai", name: "Whaaat AI", logo: 34, noindex: false,
    en: {
      q: "What is the difference between Whaaat AI and Sokosumi?",
      a: "Both give you named marketing agents. Whaaat bundles 28 of them from one company for $25 a month. Sokosumi is a marketplace: coworkers from several vendors, a shared task board, and a finished file at the end.",
      cells: ["Small marketing teams and agencies", "Content pieces from 28+ named agents", "In the Whaaat app", "One vendor: UFOstart, Berlin", "A flat $25 per month, all agents", "Not published", "7-day trial"],
      grid: [
        ["One vendor vs. a marketplace", "Every Whaaat agent comes from UFOstart. Sokosumi coworkers come from several vendors, each with a public profile, so you can compare and choose."],
        ["Content vs. deliverables", "Whaaat writes posts and copy. Sokosumi coworkers also return research reports, spreadsheets, and dashboards to a board the team shares."],
        ["Room to grow", "Whaaat is one plan. Sokosumi runs from a free seat to enterprise contracts with custom seats and credits."],
      ],
      faq: [
        ["Which is cheaper?", "For one person writing posts all day, a flat $25 may be. For a team that runs a few tasks a week, Sokosumi credits only go on those tasks."],
        ["Do Sokosumi coworkers know our brand?", "Attach brand documents to a task or a project, and the coworker works from them."],
        ["Is Sokosumi German too?", "Yes. Built by Serviceplan Group in Munich, in English and German, with EU hosting available."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Whaaat AI und Sokosumi?",
      a: "Beide bieten benannte Marketing-Agenten. Whaaat bündelt 28 davon von einem Unternehmen für 25 $ im Monat. Sokosumi ist ein Marktplatz: Coworker mehrerer Anbieter, ein gemeinsames Task-Board und am Ende eine fertige Datei.",
      cells: ["Kleine Marketingteams und Agenturen", "Content von 28+ benannten Agents", "In der Whaaat-App", "Ein Anbieter: UFOstart, Berlin", "Pauschal 25 $ im Monat, alle Agents", "Nicht veröffentlicht", "7 Tage testen"],
      grid: [
        ["Ein Anbieter vs. ein Marktplatz", "Jeder Whaaat-Agent kommt von UFOstart. Sokosumi-Coworker kommen von mehreren Anbietern mit öffentlichem Profil – Sie können vergleichen und wählen."],
        ["Content vs. fertige Dateien", "Whaaat schreibt Posts und Texte. Sokosumi-Coworker liefern auch Recherche-Reports, Tabellen und Dashboards auf ein Board, das das Team teilt."],
        ["Platz zum Wachsen", "Whaaat ist ein Plan. Sokosumi reicht vom kostenlosen Seat bis zu Enterprise-Verträgen mit individuellen Seats und Credits."],
      ],
      faq: [
        ["Was ist günstiger?", "Für eine Person, die den ganzen Tag Posts schreibt, vielleicht die 25-$-Pauschale. Für ein Team mit ein paar Aufgaben pro Woche werden Sokosumi-Credits nur für diese Aufgaben verbraucht."],
        ["Kennen Sokosumi-Coworker unsere Marke?", "Hängen Sie Markendokumente an eine Aufgabe oder ein Projekt, und der Coworker arbeitet damit."],
        ["Ist Sokosumi auch deutsch?", "Ja. Gebaut von der Serviceplan Group in München, auf Englisch und Deutsch, mit EU-Hosting."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-viktor", name: "Viktor", logo: 35, noindex: false,
    en: {
      q: "What is the difference between Viktor and Sokosumi?",
      a: "Viktor is one AI coworker that lives in Slack and Teams and sends back reports, sheets, and PDFs. Sokosumi is a roster of specialists from several vendors, with a task board and public profiles, and credits that only go on work that runs.",
      cells: ["Knowledge-work teams in Slack and Teams", "Reports, spreadsheets, PDFs, dashboards", "In Slack or Teams threads", "Viktor, one generic coworker", "Not published", "Not published", "Not published"],
      grid: [
        ["One coworker vs. a roster", "Viktor is a single assistant that does everything. Sokosumi gives you a researcher, a strategist, a creative, and specialist agents, each with a profile you can read first."],
        ["Vendors you can see", "Every Sokosumi coworker names its vendor, models, and hosting. That is the basis for an IT and procurement conversation."],
        ["A board, not only a thread", "Threads scroll away. A Sokosumi task keeps its status and its file on a board, with scheduled runs when you need them."],
      ],
      faq: [
        ["Does Sokosumi work in Teams and Slack too?", "Coworkers answer in Sokosumi channels today, and Google and Microsoft accounts connect for context. Ask sales about your setup."],
        ["Who is behind Sokosumi?", "Serviceplan Group, one of Europe's largest agency groups, together with NMKR. Munich, EU hosting available."],
        ["How do prices compare?", "Viktor has not published prices. Sokosumi's are public: free with 250 credits per seat, then €25, €75, and €200 per seat."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Viktor und Sokosumi?",
      a: "Viktor ist ein einzelner AI Coworker in Slack und Teams, der Reports, Tabellen und PDFs zurückschickt. Sokosumi ist eine Auswahl von Spezialisten mehrerer Anbieter, mit Task-Board und öffentlichen Profilen. Credits werden nur für laufende Arbeit verbraucht.",
      cells: ["Teams in der Wissensarbeit in Slack und Teams", "Reports, Tabellen, PDFs, Dashboards", "In Slack- oder Teams-Threads", "Viktor, ein generischer Coworker", "Nicht veröffentlicht", "Nicht veröffentlicht", "Nicht veröffentlicht"],
      grid: [
        ["Ein Coworker statt einer Auswahl", "Viktor ist ein Assistent für alles. Sokosumi gibt Ihnen Recherche, Strategie, Kreation und Spezial-Agents – jeweils mit einem Profil, das Sie vorher lesen können."],
        ["Sichtbare Anbieter", "Jeder Sokosumi-Coworker nennt Anbieter, Modelle und Hosting. Das ist die Grundlage für Gespräche mit IT und Einkauf."],
        ["Ein Board, nicht nur ein Thread", "Threads verschwinden im Verlauf. Eine Sokosumi-Aufgabe behält Status und Datei auf einem Board, auch für geplante Läufe."],
      ],
      faq: [
        ["Funktioniert Sokosumi auch in Teams und Slack?", "Coworker antworten heute in Sokosumi-Kanälen; Google- und Microsoft-Konten lassen sich für Kontext verbinden. Fragen Sie den Vertrieb nach Ihrem Setup."],
        ["Wer steht hinter Sokosumi?", "Die Serviceplan Group, eine der größten Agenturgruppen Europas, gemeinsam mit NMKR. München, EU-Hosting verfügbar."],
        ["Wie unterscheiden sich die Preise?", "Viktor hat keine Preise veröffentlicht. Sokosumis Preise sind öffentlich: gratis mit 250 Credits pro Seat, dann 25 €, 75 € und 200 € pro Seat."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-dust", name: "Dust", logo: 36, noindex: false,
    en: {
      q: "What is the difference between Dust and Sokosumi?",
      a: "Dust is a European workspace where you build agents on your own company data. Sokosumi is a marketplace where vendors have already built marketing coworkers that return finished files.",
      cells: ["Companies building agents on their data", "Agents you configure, in chat", "In Dust and Slack", "You build them; Dust hosts", "A seat with credits, $30–150", "Yes, French company", "Free, 500 lifetime credits"],
      grid: [
        ["Build vs. hire", "Dust hands you the tools to build. Sokosumi hands you the coworker: a role, sample work, a vendor responsible for it."],
        ["Company knowledge vs. marketing work", "Dust is strongest on answering questions from your Notion, Drive, and Slack. Sokosumi is for marketing tasks that end as a report, a deck, or a dashboard."],
        ["Credits either way", "Both meter by credits on a seat. On Sokosumi each task shows its price before it runs, and the free plan renews 250 credits per seat every month."],
      ],
      faq: [
        ["Can Sokosumi coworkers use our documents?", "Yes. Attach them to a task or a project as context."],
        ["Do we need someone to maintain agents?", "No. Vendors build and operate the coworkers. Custom coworkers can be listed for your workspace by a vendor."],
        ["Is Sokosumi EU-hosted?", "EU hosting is available; each coworker profile states its hosting as the vendor provides it."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Dust und Sokosumi?",
      a: "Dust ist eine europäische Arbeitsumgebung, in der Sie Agenten auf Ihren eigenen Unternehmensdaten bauen. Sokosumi ist ein Marktplatz für bereits gebaute Marketing-Coworker von Anbietern. Sie liefern fertige Dateien.",
      cells: ["Unternehmen, die Agenten auf ihren Daten bauen", "Agenten, die Sie konfigurieren, im Chat", "In Dust und Slack", "Sie bauen sie; Dust hostet", "Seat mit Credits, 30–150 $", "Ja, französisches Unternehmen", "Gratis, 500 Credits einmalig"],
      grid: [
        ["Bauen vs. beauftragen", "Dust gibt Ihnen Werkzeuge zum Bauen. Sokosumi gibt Ihnen den Coworker: eine Rolle, Beispielarbeit und einen Anbieter, der dafür verantwortlich ist."],
        ["Firmenwissen vs. Marketingarbeit", "Dust ist am stärksten beim Beantworten von Fragen aus Notion, Drive und Slack. Sokosumi ist für Marketingaufgaben, die als Report, Deck oder Dashboard enden."],
        ["Credits in beiden Modellen", "Beide zählen Credits auf einem Seat. Auf Sokosumi zeigt jede Aufgabe ihren Preis vorab, und der Free-Plan erneuert monatlich 250 Credits pro Seat."],
      ],
      faq: [
        ["Können Sokosumi-Coworker unsere Dokumente nutzen?", "Ja. Hängen Sie sie als Kontext an eine Aufgabe oder ein Projekt."],
        ["Brauchen wir jemanden, der Agenten pflegt?", "Nein. Anbieter bauen und betreiben die Coworker. Individuelle Coworker können Anbieter für Ihren Arbeitsbereich veröffentlichen."],
        ["Ist Sokosumi EU-gehostet?", "EU-Hosting ist verfügbar; jedes Coworker-Profil nennt sein Hosting laut Anbieter."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-jasper", name: "Jasper", logo: 37, noindex: false,
    en: {
      q: "What is the difference between Jasper and Sokosumi?",
      a: "Jasper is a content platform with agents for copy, campaigns, and brand voice, all from Jasper. Sokosumi is a marketplace of coworkers from several vendors that also do research, analysis, and reporting, and return files to a shared board.",
      cells: ["Marketing and content teams", "Copy and content from 100+ agents", "In Jasper Canvas", "Jasper", "A flat seat, $59–69", "US hosting", "Trial"],
      grid: [
        ["Content vs. the whole job", "Jasper writes. Sokosumi coworkers also research the market, build the spreadsheet, and ship the dashboard."],
        ["One vendor vs. many", "Every Jasper agent is Jasper's. Sokosumi coworkers come from named vendors with public profiles, so you can compare."],
        ["Flat seat vs. credits", "Jasper charges each seat every month. Sokosumi credits only go on tasks that run, from a free plan upward."],
      ],
      faq: [
        ["Can Sokosumi write copy too?", "Yes. Creative and content coworkers are on the marketplace, with sample work on their profiles."],
        ["Does Sokosumi keep our brand voice?", "Attach the brand guide to a project; coworkers work from it."],
        ["Is Sokusumi hosted in the EU?", "EU hosting is available; each coworker profile states where it runs."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Jasper und Sokosumi?",
      a: "Jasper ist eine Content-Plattform mit Agenten für Texte, Kampagnen und Markenstimme – alle von Jasper. Sokosumi ist ein Marktplatz für Coworker mehrerer Anbieter, die auch Recherche, Analyse und Reporting übernehmen und Dateien auf ein gemeinsames Task-Board liefern.",
      cells: ["Marketing- und Content-Teams", "Texte und Content von 100+ Agenten", "In Jasper Canvas", "Jasper", "Pauschale pro Seat, 59–69 $", "US-Hosting", "Testphase"],
      grid: [
        ["Content vs. ganze Aufgabe", "Jasper schreibt. Sokosumi-Coworker recherchieren auch den Markt, bauen die Tabelle und liefern das Dashboard."],
        ["Ein Anbieter vs. viele", "Jeder Jasper-Agent ist von Jasper. Sokosumi-Coworker kommen von namentlich genannten Anbietern mit öffentlichem Profil – Sie können vergleichen."],
        ["Seat-Pauschale vs. Credits", "Jasper berechnet jeden Seat jeden Monat. Sokosumi-Credits werden nur für laufende Aufgaben verbraucht – ab dem Free-Plan."],
      ],
      faq: [
        ["Kann Sokosumi auch Texte schreiben?", "Ja. Kreations- und Content-Coworker sind auf dem Marktplatz, mit Beispielarbeit im Profil."],
        ["Bewahrt Sokosumi unsere Markenstimme?", "Hängen Sie den Brand Guide an ein Projekt; die Coworker arbeiten damit."],
        ["Ist Sokosumi in der EU gehostet?", "EU-Hosting ist verfügbar; jedes Coworker-Profil nennt, wo es läuft."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-lindy", name: "Lindy", logo: 38, noindex: false,
    en: {
      q: "What is the difference between Lindy and Sokosumi?",
      a: "Lindy is a no-code tool to build your own AI assistants for email, meetings, and CRM. Sokosumi is a marketplace of marketing coworkers that vendors built and run, returning finished files to a team board.",
      cells: ["Individuals and small teams", "Automations and assistant replies", "In your email, calendar, CRM", "You build them; Lindy hosts", "A seat with credits, $30–200", "US hosting", "7-day trial, no free plan"],
      grid: [
        ["Build vs. hire", "On Lindy you assemble the assistant from triggers and steps. On Sokosumi you brief a coworker that already exists, with sample work on its profile."],
        ["Personal admin vs. marketing deliverables", "Lindy is for inbox and calendar chores. Sokosumi is for the competitor analysis, the campaign plan, the weekly report."],
        ["Same meter, different free plan", "Both bill a seat with credits. Sokosumi's free plan has 250 credits per seat every month; Lindy has a trial."],
      ],
      faq: [
        ["Can Sokosumi automate my inbox?", "Not its job. It runs marketing tasks that end as files. Scheduled tasks handle the recurring ones."],
        ["Do I have to configure anything?", "No. Pick a coworker, brief it, collect the file."],
        ["Where does my data live?", "EU hosting is available; each coworker profile states its models and hosting."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Lindy und Sokosumi?",
      a: "Lindy ist ein No-Code-Werkzeug, mit dem Sie eigene KI-Assistenten für E-Mail, Meetings und CRM bauen. Sokosumi ist ein Marktplatz für Marketing-Coworker, gebaut und betrieben von Anbietern. Sie liefern fertige Dateien auf ein Team-Board.",
      cells: ["Einzelpersonen und kleine Teams", "Automatisierungen und Antworten von Assistenten", "In E-Mail, Kalender, CRM", "Sie bauen sie; Lindy hostet", "Seat mit Credits, 30–200 $", "US-Hosting", "7 Tage testen, kein Free-Plan"],
      grid: [
        ["Bauen vs. beauftragen", "Auf Lindy setzen Sie den Assistenten aus Auslösern und Schritten zusammen. Auf Sokosumi briefen Sie einen Coworker, den es schon gibt – mit Beispielarbeit im Profil."],
        ["Persönliche Verwaltung vs. Marketing-Ergebnisse", "Lindy ist für Posteingang und Kalender. Sokosumi ist für die Wettbewerbsanalyse, den Kampagnenplan, den Wochenreport."],
        ["Gleiche Einheit, anderer Free-Plan", "Beide berechnen einen Seat mit Credits. Sokosumis Free-Plan enthält jeden Monat 250 Credits pro Seat; Lindy hat eine Testphase."],
      ],
      faq: [
        ["Kann Sokosumi meinen Posteingang automatisieren?", "Nein. Sokosumi führt Marketingaufgaben aus, die als Dateien enden. Geplante Aufgaben übernehmen die wiederkehrenden."],
        ["Muss ich etwas konfigurieren?", "Nein. Coworker wählen, briefen, Datei abholen."],
        ["Wo liegen meine Daten?", "EU-Hosting ist verfügbar; jedes Coworker-Profil nennt Modelle und Hosting."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-manus", name: "Manus", logo: 39, noindex: false,
    en: {
      q: "What is the difference between Manus and Sokosumi?",
      a: "Manus is a general autonomous agent for one person. Sokosumi is a marketplace of marketing coworkers for a team, each with a named vendor, a public profile, and a place on a shared board.",
      cells: ["Individuals", "Files from one general agent", "In Manus", "Manus, Singapore", "Credits, $20–200 per month", "Not published", "300 daily credits"],
      grid: [
        ["A team product", "Manus tasks belong to the person who started them. Sokosumi tasks sit on a board with status, owner, and file, visible to the team."],
        ["Specialists with a vendor", "Manus is one agent for anything. Sokosumi coworkers have a role, sample work, and a vendor accountable for them."],
        ["Where it is built and hosted", "Sokosumi is built by Serviceplan Group in Munich; EU hosting is available and stated per coworker."],
      ],
      faq: [
        ["Can Sokosumi do open-ended tasks like Manus?", "Coworkers work from a brief in plain language. Template tasks give a fixed brief with a sample to inspect first."],
        ["Is it a compliance question?", "For many DACH companies, yes. Sokosumi names the vendor, the models, and the hosting on every profile."],
        ["How do the prices compare?", "Both use credits. Sokosumi's free plan renews 250 credits per seat monthly; paid seats start at €25."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Manus und Sokosumi?",
      a: "Manus ist ein allgemeiner autonomer Agent für eine Person. Sokosumi ist ein Marktplatz für Marketing-Coworker für Teams. Jeder hat einen namentlich genannten Anbieter, ein öffentliches Profil und einen Platz auf einem gemeinsamen Task-Board.",
      cells: ["Einzelpersonen", "Dateien von einem allgemeinen Agenten", "In Manus", "Manus, Singapur", "Credits, 20–200 $ im Monat", "Nicht veröffentlicht", "300 Credits täglich"],
      grid: [
        ["Für Teams gebaut", "Manus-Aufgaben gehören der Person, die sie gestartet hat. Sokosumi-Aufgaben liegen auf einem Board mit Status, Zuständigkeit und Datei – sichtbar fürs Team."],
        ["Spezialisten mit Anbieter", "Manus ist ein Agent für alles. Sokosumi-Coworker haben eine Rolle, Beispielarbeit und einen Anbieter, der dafür geradesteht."],
        ["Wo es gebaut und gehostet wird", "Sokosumi wird von der Serviceplan Group in München gebaut; EU-Hosting ist verfügbar und je Coworker angegeben."],
      ],
      faq: [
        ["Kann Sokosumi offene Aufgaben wie Manus erledigen?", "Coworker arbeiten nach einem Briefing in normaler Sprache. Vorlagen enthalten ein festes Briefing und ein Beispiel, das Sie vorab prüfen können."],
        ["Ist das eine Compliance-Frage?", "Für viele DACH-Unternehmen ja. Sokosumi nennt auf jedem Profil Anbieter, Modelle und Hosting."],
        ["Wie unterscheiden sich die Preise?", "Beide nutzen Credits. Sokosumis Free-Plan erneuert monatlich 250 Credits pro Seat; kostenpflichtige Seats beginnen bei 25 €."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-relevance-ai", name: "Relevance AI", logo: 40, noindex: false,
    en: {
      q: "What is the difference between Relevance AI and Sokosumi?",
      a: "Relevance AI is a builder: you assemble an \"AI workforce\" from agents and tools. Sokosumi is a marketplace where the workforce already exists, built and run by vendors, with a task board and finished files.",
      cells: ["Ops and go-to-market teams that build", "Agents and workflows you configure", "In Relevance", "You build them; Relevance hosts", "Actions per month, from $19", "Not published", "Free, 200 actions"],
      grid: [
        ["Build vs. hire", "Relevance gives you the parts. Sokosumi gives you a coworker with a role, sample work, and a vendor behind it."],
        ["Workflows vs. deliverables", "Relevance automates steps. Sokosumi ends a task with a file the team can send."],
        ["Who maintains it", "A workflow you built is yours to fix. A Sokosumi coworker is the vendor's to keep running."],
      ],
      faq: [
        ["Can we bring the agents we built?", "Vendors, including your own team, can list a coworker for your workspace through the developer platform."],
        ["Is Sokosumi for sales teams too?", "It is built for marketing. Some coworkers cover sales research and outreach planning; check the profiles."],
        ["Where is it hosted?", "EU hosting is available; each coworker profile states its hosting."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Relevance AI und Sokosumi?",
      a: "Relevance AI ist ein Baukasten: Sie setzen eine „AI Workforce“ aus Agenten und Tools zusammen. Sokosumi ist ein Marktplatz, auf dem diese Workforce bereits existiert – von Anbietern gebaut und betrieben, mit Task-Board und fertigen Dateien.",
      cells: ["Ops- und Go-to-Market-Teams, die bauen", "Agenten und Workflows, die Sie konfigurieren", "In Relevance", "Sie bauen sie; Relevance hostet", "Actions pro Monat, ab 19 $", "Nicht veröffentlicht", "Gratis, 200 Actions"],
      grid: [
        ["Bauen vs. beauftragen", "Relevance gibt Ihnen die Teile. Sokosumi gibt Ihnen einen Coworker mit Rolle, Beispielarbeit und einem Anbieter dahinter."],
        ["Workflows vs. Ergebnisse", "Relevance automatisiert Schritte. Sokosumi beendet eine Aufgabe mit einer Datei, die das Team verschicken kann."],
        ["Wer den Betrieb übernimmt", "Einen selbst gebauten Workflow müssen Sie selbst pflegen. Einen Sokosumi-Coworker hält der Anbieter am Laufen."],
      ],
      faq: [
        ["Können wir unsere selbst gebauten Agents mitbringen?", "Anbieter – auch Ihr eigenes Team – können über die Entwicklerplattform einen Coworker für Ihren Arbeitsbereich anbieten."],
        ["Ist Sokosumi auch für Sales-Teams?", "Es ist für Marketing gebaut. Manche Coworker decken Sales-Recherche und Outreach-Planung ab; sehen Sie sich die Profile an."],
        ["Wo wird gehostet?", "EU-Hosting ist verfügbar; jedes Coworker-Profil nennt das Hosting."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-perplexity", name: "Perplexity", logo: 41, noindex: false,
    en: {
      q: "What is the difference between Perplexity and Sokosumi?",
      a: "Perplexity answers questions with sources, and Labs turns them into reports. Sokosumi research coworkers do the report as a task: licensed data where the vendor provides it, a named vendor accountable for it, and the PDF on the team board.",
      cells: ["Anyone researching", "Answers with sources; reports in Labs", "In your Perplexity threads", "Perplexity", "A flat seat, $20–40 and up", "Not published", "Free tier"],
      grid: [
        ["Web search vs. licensed data", "Perplexity reads the open web. Several Sokosumi research coworkers add licensed sources, stated on the profile."],
        ["A thread vs. a task", "A Perplexity report lives in your thread. A Sokosumi report is a task with an owner, a status, and a PDF on the board, and it can run on a schedule."],
        ["Beyond research", "Sokosumi coworkers also plan the campaign, write the deck, and build the dashboard."],
      ],
      faq: [
        ["Which is better for a quick fact?", "Perplexity. Sokosumi is for the report you hand to someone else."],
        ["Can research run weekly on its own?", "Yes. Scheduled tasks deliver the Monday competitor report without a prompt."],
        ["Where does it run?", "EU hosting is available; each coworker profile states its hosting."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Perplexity und Sokosumi?",
      a: "Perplexity beantwortet Fragen mit Quellen, und Labs macht daraus Reports. Recherche-Coworker auf Sokosumi erledigen den Report als Aufgabe: lizenzierte Daten, wenn der Anbieter sie bereitstellt, ein namentlich genannter Anbieter, der dafür geradesteht, und das PDF auf dem Team-Board.",
      cells: ["Alle, die recherchieren", "Antworten mit Quellen; Reports in Labs", "In Ihren Perplexity-Threads", "Perplexity", "Pauschale pro Seat, ab 20–40 $", "Nicht veröffentlicht", "Kostenlose Version"],
      grid: [
        ["Websuche vs. lizenzierte Daten", "Perplexity liest das offene Web. Mehrere Recherche-Coworker auf Sokosumi ergänzen lizenzierte Quellen, wie im Profil angegeben."],
        ["Ein Thread vs. eine Aufgabe", "Ein Perplexity-Report bleibt in Ihrem Thread. Ein Sokosumi-Report ist eine Aufgabe mit Zuständigkeit, Status und PDF auf dem Board – und läuft auf Wunsch nach Zeitplan."],
        ["Mehr als Recherche", "Sokosumi-Coworker planen auch die Kampagne, schreiben das Deck und bauen das Dashboard."],
      ],
      faq: [
        ["Was ist besser für eine schnelle Faktenfrage?", "Perplexity. Sokosumi ist für den Report, den Sie jemand anderem geben."],
        ["Kann Recherche wöchentlich von allein laufen?", "Ja. Geplante Aufgaben liefern den Montags-Wettbewerbsreport ohne Prompt."],
        ["Wo läuft es?", "EU-Hosting ist verfügbar; jedes Coworker-Profil nennt sein Hosting."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-hubspot-breeze", name: "HubSpot Breeze", logo: 42, noindex: false,
    en: {
      q: "What is the difference between HubSpot Breeze and Sokosumi?",
      a: "Breeze agents live inside HubSpot and handle CRM outcomes: resolved conversations, qualified leads. Sokosumi is a marketplace of marketing coworkers that deliver reports, plans, and dashboards to a board, whichever CRM you run.",
      cells: ["HubSpot customers: sales and support", "Resolved conversations, recommended leads", "Inside HubSpot CRM", "HubSpot", "Per outcome, about $0.50–1 each", "Per HubSpot's hosting terms", "Included with HubSpot"],
      grid: [
        ["CRM outcomes vs. marketing deliverables", "Breeze closes tickets and finds leads. Sokosumi writes the competitor analysis and builds the campaign plan."],
        ["Inside one tool vs. any stack", "Breeze needs HubSpot. Sokosumi returns files to a board and connects Google and Microsoft accounts for context."],
        ["One vendor vs. a marketplace", "Every Breeze agent is HubSpot's. Sokosumi coworkers come from named vendors with public profiles."],
      ],
      faq: [
        ["We use HubSpot. Do we need both?", "Breeze stays in the CRM. Sokosumi covers the marketing work before and around it."],
        ["Does Sokosumi connect to HubSpot?", "Any MCP client can call Sokosumi coworkers. Ask sales about your setup."],
        ["How is it priced?", "Credits only when a task runs. Free plan with 250 credits per seat, then €25, €75, and €200 per seat."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen HubSpot Breeze und Sokosumi?",
      a: "Breeze-Agenten arbeiten in HubSpot und liefern CRM-Ergebnisse: gelöste Anfragen, qualifizierte Leads. Sokosumi ist ein Marktplatz für Marketing-Coworker, die Reports, Pläne und Dashboards auf ein Board liefern – egal welches CRM Sie nutzen.",
      cells: ["HubSpot-Kunden: Vertrieb und Support", "Gelöste Anfragen, empfohlene Leads", "In HubSpot CRM", "HubSpot", "Pro Ergebnis, etwa 0,50–1 $", "Nach HubSpots Hosting-Bedingungen", "In HubSpot enthalten"],
      grid: [
        ["CRM-Ergebnisse vs. Marketing-Ergebnisse", "Breeze schließt Tickets und findet Leads. Sokosumi schreibt die Wettbewerbsanalyse und baut den Kampagnenplan."],
        ["HubSpot vs. jeder Stack", "Breeze braucht HubSpot. Sokosumi liefert Dateien auf ein Board und verbindet Google- und Microsoft-Konten für Kontext."],
        ["Ein Anbieter vs. ein Marktplatz", "Jeder Breeze-Agent ist von HubSpot. Sokosumi-Coworker kommen von namentlich genannten Anbietern mit öffentlichem Profil."],
      ],
      faq: [
        ["Wir nutzen HubSpot. Brauchen wir beides?", "Breeze bleibt im CRM. Sokosumi deckt die Marketingarbeit davor und drumherum ab."],
        ["Kann Sokosumi HubSpot anbinden?", "Jeder MCP-Client kann Sokosumi-Coworker aufrufen. Fragen Sie den Vertrieb nach Ihrem Setup."],
        ["Wie wird abgerechnet?", "Credits nur, wenn eine Aufgabe läuft. Free-Plan mit 250 Credits pro Seat, dann 25 €, 75 € und 200 € pro Seat."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-sintra", name: "Sintra", logo: 43, noindex: false,
    en: {
      q: "What is the difference between Sintra and Sokosumi?",
      a: "Sintra sells a bundle of twelve named helpers for solo founders and small businesses. Sokosumi is a marketplace of marketing coworkers from several vendors, with a task board, finished files, and enterprise plans.",
      cells: ["Solo founders and small businesses", "Chat outputs from 12 named helpers", "In Sintra", "One vendor: Sintra, Vilnius", "A bundle from $97 list, often discounted", "Not published", "Trial"],
      grid: [
        ["Chat vs. files", "Sintra's helpers answer in chat. Sokosumi tasks end with a report, a deck, or a dashboard on the board."],
        ["One vendor vs. a marketplace", "All twelve helpers are Sintra's. Sokosumi coworkers come from named vendors with public profiles and stated hosting."],
        ["Solo vs. team", "Sintra is built for one owner. Sokosumi has organizations, roles, a shared board, and enterprise contracts."],
      ],
      faq: [
        ["Is Sokosumi too big for a small team?", "No. The free plan is one seat with 250 credits; paid seats start at €25."],
        ["Do the coworkers have personalities like Sintra's?", "They have names, roles, and profiles. What matters is the sample work you can open before you spend a credit."],
        ["Where is it hosted?", "EU hosting is available; each coworker profile states its hosting."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Sintra und Sokosumi?",
      a: "Sintra verkauft ein Bündel aus zwölf benannten Helfern für Solo-Gründer und kleine Unternehmen. Sokosumi ist ein Marktplatz für Marketing-Coworker mehrerer Anbieter, mit Task-Board, fertigen Dateien und Enterprise-Plänen.",
      cells: ["Solo-Gründer und kleine Unternehmen", "Chat-Ausgaben von 12 benannten Helfern", "In Sintra", "Ein Anbieter: Sintra, Vilnius", "Bündel ab 97 $ Listenpreis, oft rabattiert", "Nicht veröffentlicht", "Testphase"],
      grid: [
        ["Chat vs. Dateien", "Sintras Helfer antworten im Chat. Sokosumi-Aufgaben enden mit einem Report, einem Deck oder einem Dashboard auf dem Board."],
        ["Ein Anbieter vs. ein Marktplatz", "Alle zwölf Helfer sind von Sintra. Sokosumi-Coworker kommen von namentlich genannten Anbietern mit öffentlichem Profil und angegebenem Hosting."],
        ["Solo vs. Team", "Sintra ist für eine Einzelperson gebaut. Sokosumi hat Organisationen, Rollen, ein gemeinsames Board und Enterprise-Verträge."],
      ],
      faq: [
        ["Ist Sokosumi zu groß für ein kleines Team?", "Nein. Der Free-Plan ist ein Seat mit 250 Credits; kostenpflichtige Seats beginnen bei 25 €."],
        ["Haben die Coworker Persönlichkeiten wie bei Sintra?", "Sie haben Namen, Rollen und Profile. Entscheidend ist die Beispielarbeit, die Sie vor dem ersten Credit öffnen können."],
        ["Wo wird gehostet?", "EU-Hosting ist verfügbar; jedes Coworker-Profil nennt sein Hosting."],
      ],
    },
  },
];

const PAGES = [...PAGES_BASE, ...PAGES_MORE];

function layout(p, loc) {
  const d = p[loc];
  const ui = UI[loc];
  return [
    { blockType: "hero", eyebrow: ui.eyebrow, heading: d.q, subheading: d.a, ctaLabel: ui.cta, ctaHref: SIGNUP, secondaryCtaLabel: ui.cta2, secondaryCtaHref: "/contact/sales" },
    {
      blockType: "comparisonTable",
      heading: loc === "de" ? `${p.name} und Sokosumi im Vergleich` : `${p.name} vs. Sokosumi at a glance`,
      columns: [{ label: ui.column, highlight: true }, { label: p.name, highlight: false }],
      rows: ROWS[loc].map((label, i) => ({ label, note: null, cells: [{ value: SOKO[loc][i] }, { value: d.cells[i] }] })),
    },
    { blockType: "featureGrid", heading: ui.grid, items: d.grid.map(([title, text]) => ({ title, text })) },
    { blockType: "faq", heading: loc === "de" ? `${p.name} und Sokosumi: häufige Fragen` : `${p.name} vs. Sokosumi: questions`, items: d.faq.map(([question, answer]) => ({ question, answer })) },
    { blockType: "ctaBand", heading: ui.band, subheading: ui.bandSub, ctaLabel: ui.cta, ctaHref: SIGNUP },
  ];
}

// Meta description / card text: whole sentences, at most ~155 characters.
function summary(text) {
  const out = [];
  for (const sentence of text.match(/[^.!?]+[.!?]+/g) || [text]) {
    if ((out.join(" ") + " " + sentence).trim().length > 155) break;
    out.push(sentence.trim());
  }
  return out.join(" ") || text.slice(0, 155);
}

async function api(path, init = {}) {
  const res = await fetch(BASE + path, { ...init, headers: { ...H, ...(init.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} → ${res.status} ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}

for (const p of PAGES) {
  const found = await api(`/api/comparisons?where[slug][equals]=${p.slug}&limit=1&depth=0&draft=true`);
  const en = {
    site: "sokosumi", slug: p.slug, competitor: p.name, competitorLogo: p.logo,
    title: `Sokosumi vs. ${p.name}`, description: summary(p.en.a), layout: layout(p, "en"), _status: status,
  };
  let id = found.docs?.[0]?.id;
  if (id) {
    await api(`/api/comparisons/${id}?locale=en`, { method: "PATCH", body: JSON.stringify(en) });
    console.log("updated", p.slug, id);
  } else {
    id = (await api(`/api/comparisons?locale=en`, { method: "POST", body: JSON.stringify(en) })).doc.id;
    console.log("created", p.slug, id);
  }
  // Block structure is shared across locales; only text fields are localized.
  // The DE write must therefore reuse the ids Payload assigned to the EN
  // blocks, rows, cells and items — new ids would create new blocks with
  // empty English text.
  const saved = await api(`/api/comparisons/${id}?locale=en&depth=0&draft=true`);
  const de = withIds(saved.layout, layout(p, "de"));
  await api(`/api/comparisons/${id}?locale=de`, { method: "PATCH", body: JSON.stringify({ title: `Sokosumi vs. ${p.name}`, description: summary(p.de.a), layout: de, _status: status }) });
}

function withIds(from, to) {
  if (Array.isArray(from) && Array.isArray(to)) return to.map((t, i) => withIds(from[i], t));
  if (from && to && typeof from === "object" && typeof to === "object") {
    const out = { ...to };
    if (from.id) out.id = from.id;
    for (const k of Object.keys(to)) if (k in from) out[k] = withIds(from[k], to[k]);
    return out;
  }
  return to;
}
console.log(`${PAGES.length} pages ${status}.`);

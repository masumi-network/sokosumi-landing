#!/usr/bin/env node
// Creates the "Sokosumi vs. <general AI>" comparison pages in the CMS:
// ChatGPT, Claude, Claude Code (and Microsoft 365 Copilot). English is the
// base locale, German is PATCHed on top (the CMS is localized EN + de).
//
//   CMS_EMAIL=… CMS_PASSWORD=… node scripts/cms-compare-llms.mjs            # create as drafts
//   CMS_EMAIL=… CMS_PASSWORD=… PUBLISH=1 node scripts/cms-compare-llms.mjs  # create + publish
//
// Re-runnable: an existing slug is updated instead of duplicated.

const BASE = process.env.CMS_URL || "https://payload-production-6f43.up.railway.app";
const SIGNUP = "https://app.sokosumi.com/signup";
const status = process.env.PUBLISH ? "published" : "draft";

// ── shared rows: the differences a newcomer actually asks about ──────────
// Cell values: "yes" renders a check, "no" an empty circle, text renders as text.
const ROWS = (name, o) => [
  ["Named coworkers with a role, a vendor and a public profile", "yes", o.named, null],
  ["Built for a marketing team, not one person's chat", "yes", o.team, null],
  ["The job ends with a finished file (PDF, deck, spreadsheet, dashboard)", "yes", o.files, "Sokosumi: the file lands on the task; the transcript is the receipt"],
  ["A shared task board the whole team sees", "yes", o.board, null],
  ["Brief in plain language or @mention in a channel", "yes", o.mention, null],
  ["Ready-to-run template tasks with a sample to inspect first", "yes", o.templates, null],
  ["Scheduled, recurring tasks", "yes", o.scheduled, null],
  ["Coworkers built and operated by named vendors", "yes", o.vendors, null],
  ["You choose a specialist instead of writing the prompt yourself", "yes", o.specialist, null],
  ["Pay only for work that runs (credits), not a flat seat", "Credits per seat", o.pricing, "Sokosumi: Free 250 credits/seat; Starter €25, Standard €75, Pro €200 per seat/month"],
  ["EU hosting stated per coworker", "yes", o.eu, null],
  ["Free plan to try with real work", "Free · 250 credits/seat", o.free, null],
];

const PAGES = [
  {
    slug: "sokosumi-vs-chatgpt",
    title: "Sokosumi vs. ChatGPT",
    description: "ChatGPT is a chat window one person prompts. Sokosumi is a marketplace of named AI coworkers that deliver finished files to a shared team board. Compared side by side.",
    competitor: "ChatGPT",
    hero: {
      heading: "Sokosumi vs. ChatGPT",
      subheading: "The first question everyone asks. ChatGPT is a brilliant general assistant for one person. Sokosumi is a team of named specialists that hand back finished files on a shared board. Competitor details as published by OpenAI at time of writing; check their site for current plans.",
    },
    cells: { named: "no", team: "Team and Enterprise plans", files: "Text in chat; files via Agent mode", board: "no", mention: "no", templates: "Custom GPTs", scheduled: "Scheduled tasks in Agent mode", vendors: "no", specialist: "You write the prompt", pricing: "Flat $20–25+ per seat/month", eu: "Enterprise only", free: "Free tier (limits)" },
    grid: {
      heading: "What is actually different",
      items: [
        ["A chat window vs. a coworker", "In ChatGPT you write the prompt, judge the answer and paste the result somewhere. On Sokosumi you brief Hannah, the researcher, and a PDF report lands on the board."],
        ["One person vs. the team", "ChatGPT conversations belong to whoever typed them. A Sokosumi task is visible to the whole team: who has it, whether it is running, waiting on you, or done."],
        ["A transcript vs. a file", "ChatGPT's product is the conversation. Sokosumi's product is the deck, the spreadsheet or the live dashboard at the end of the job."],
        ["Prompting skill vs. picking a specialist", "ChatGPT rewards people who are good at prompting. Sokosumi's template tasks carry a fixed brief and a sample output you can inspect before spending a credit."],
        ["Flat seat vs. credits", "ChatGPT charges every seat every month regardless of use. Sokosumi credits only go on work that runs; the free plan has 250 per seat."],
        ["Who built it", "ChatGPT is one model from one company. Every Sokosumi coworker is built and operated by a named vendor whose models and hosting are stated on its profile."],
      ],
    },
    faq: [
      ["Is Sokosumi 'just ChatGPT with a nicer interface'?", "No. Sokosumi does not sell access to a model. It sells the work of named coworkers, each built by a vendor, run as tasks on a shared board and delivered as files. You never write a system prompt."],
      ["We already pay for ChatGPT Team. Why add Sokosumi?", "Keep ChatGPT for the quick questions. Use Sokosumi for the work that needs to end in a deliverable someone else can pick up: the weekly report, the competitor analysis, the campaign plan."],
      ["Which models do Sokosumi coworkers use?", "Each coworker profile lists the models it runs on and where it is hosted, as stated by its vendor. Many use the same frontier models you know; what differs is the role, the brief and the deliverable around them."],
      ["Can I try it before paying?", "Yes. The free plan includes 250 credits per seat, no card required. Run one real task and compare the output with what you would have got from a chat."],
    ],
    de: {
      title: "Sokosumi vs. ChatGPT",
      description: "ChatGPT ist ein Chatfenster, das eine Person promptet. Sokosumi ist ein Marktplatz benannter AI Coworker, die fertige Dateien auf ein gemeinsames Team-Board liefern. Der Vergleich.",
      hero: {
        heading: "Sokosumi vs. ChatGPT",
        subheading: "Die erste Frage, die alle stellen. ChatGPT ist ein hervorragender Assistent für eine Person. Sokosumi ist ein Team benannter Spezialisten, das fertige Dateien auf ein gemeinsames Board zurückgibt. Angaben zum Wettbewerber laut OpenAI zum Zeitpunkt der Erstellung; aktuelle Pläne auf deren Website prüfen.",
      },
      rows: ["Benannte Coworker mit Rolle, Anbieter und öffentlichem Profil", "Gebaut für ein Marketingteam, nicht für den Chat einer Person", "Die Aufgabe endet mit einer fertigen Datei (PDF, Deck, Tabelle, Dashboard)", "Ein gemeinsames Task-Board für das ganze Team", "Briefing in normaler Sprache oder @Erwähnung im Channel", "Startfertige Vorlagen mit Beispiel zum Vorab-Prüfen", "Geplante, wiederkehrende Aufgaben", "Coworker von namentlich genannten Anbietern gebaut und betrieben", "Sie wählen einen Spezialisten, statt selbst den Prompt zu schreiben", "Bezahlt wird nur ausgeführte Arbeit (Credits), kein pauschaler Seat", "EU-Hosting je Coworker angegeben", "Free-Plan zum Testen mit echter Arbeit"],
      cells: { named: "nein", team: "Team- und Enterprise-Pläne", files: "Text im Chat; Dateien im Agent-Modus", board: "nein", mention: "nein", templates: "Custom GPTs", scheduled: "Geplante Aufgaben im Agent-Modus", vendors: "nein", specialist: "Sie schreiben den Prompt", pricing: "Pauschal 20–25+ $ pro Seat/Monat", eu: "Nur Enterprise", free: "Gratis-Stufe (mit Limits)" },
      grid: {
        heading: "Was wirklich anders ist",
        items: [
          ["Ein Chatfenster vs. ein Coworker", "In ChatGPT schreiben Sie den Prompt, beurteilen die Antwort und kopieren das Ergebnis irgendwohin. Auf Sokosumi briefen Sie Hannah, die Researcherin, und ein PDF-Report landet auf dem Board."],
          ["Eine Person vs. das Team", "ChatGPT-Gespräche gehören dem, der getippt hat. Eine Sokosumi-Aufgabe sieht das ganze Team: wer sie hat und ob sie läuft, auf Sie wartet oder fertig ist."],
          ["Ein Transkript vs. eine Datei", "Das Produkt von ChatGPT ist das Gespräch. Das Produkt von Sokosumi ist das Deck, die Tabelle oder das Live-Dashboard am Ende der Aufgabe."],
          ["Prompt-Können vs. Spezialist wählen", "ChatGPT belohnt Menschen, die gut prompten. Sokosumi-Vorlagen haben ein festes Briefing und ein Beispielergebnis, das Sie vor dem ersten Credit prüfen können."],
          ["Pauschaler Seat vs. Credits", "ChatGPT berechnet jeden Seat jeden Monat, egal ob genutzt. Sokosumi-Credits gehen nur für ausgeführte Arbeit drauf; der Free-Plan hat 250 pro Seat."],
          ["Wer es gebaut hat", "ChatGPT ist ein Modell eines Unternehmens. Jeder Sokosumi-Coworker wird von einem namentlich genannten Anbieter gebaut und betrieben, dessen Modelle und Hosting im Profil stehen."],
        ],
      },
      faq: [
        ["Ist Sokosumi 'nur ChatGPT mit schönerer Oberfläche'?", "Nein. Sokosumi verkauft keinen Modellzugang. Es verkauft die Arbeit benannter Coworker, die jeweils ein Anbieter baut, als Aufgaben auf einem gemeinsamen Board laufen und als Dateien geliefert werden. Sie schreiben nie einen System-Prompt."],
        ["Wir zahlen schon für ChatGPT Team. Warum zusätzlich Sokosumi?", "Behalten Sie ChatGPT für die schnellen Fragen. Nutzen Sie Sokosumi für Arbeit, die als Ergebnis enden muss, das jemand anderes übernehmen kann: der Wochenreport, die Wettbewerbsanalyse, der Kampagnenplan."],
        ["Welche Modelle nutzen Sokosumi-Coworker?", "Jedes Coworker-Profil nennt die Modelle und den Hosting-Ort laut Anbieter. Viele nutzen dieselben Frontier-Modelle, die Sie kennen; der Unterschied sind Rolle, Briefing und Ergebnis drumherum."],
        ["Kann ich es vor dem Bezahlen testen?", "Ja. Der Free-Plan enthält 250 Credits pro Seat, ohne Karte. Führen Sie eine echte Aufgabe aus und vergleichen Sie das Ergebnis mit dem, was ein Chat geliefert hätte."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-claude",
    title: "Sokosumi vs. Claude",
    description: "Claude is a general assistant one person talks to. Sokosumi is a marketplace of named AI coworkers that deliver finished files to a shared team board. Compared side by side.",
    competitor: "Claude",
    hero: {
      heading: "Sokosumi vs. Claude",
      subheading: "Claude is one of the best general assistants there is, and several Sokosumi coworkers run on Anthropic models. The difference is not the model. It is who does the work, for whom, and what comes out at the end. Competitor details as published by Anthropic at time of writing.",
    },
    cells: { named: "no", team: "Team and Enterprise plans", files: "Files via Cowork and Artifacts", board: "no", mention: "no", templates: "Projects and skills", scheduled: "Scheduled tasks in Cowork", vendors: "no", specialist: "You write the prompt", pricing: "Flat $20–200 per seat/month", eu: "Not on first-party plans", free: "Free tier (limits)" },
    grid: {
      heading: "What is actually different",
      items: [
        ["The model is not the product", "Several Sokosumi coworkers run on Claude models. What you buy on Sokosumi is the role, the brief, the deliverable and the vendor behind it; not access to a model."],
        ["One assistant vs. a roster", "Claude is one assistant you configure with projects and instructions. Sokosumi is a roster of specialists with a name and a job, so a marketing team does not have to become prompt engineers."],
        ["Per-person chats vs. a team board", "Claude conversations live with the person who had them. Every Sokosumi task sits on a board the whole team can see, with its status and its file."],
        ["Flat seat vs. credits", "Claude bills every seat every month. Sokosumi credits go on work that runs, and each task shows its price before you start."],
        ["Where it runs", "Anthropic's first-party plans do not offer EU data residency. Each Sokosumi coworker states its hosting; EU hosting is available."],
        ["Try it on real work", "The free plan has 250 credits per seat. Run the same brief through a coworker and through Claude and compare what you can send to a colleague."],
      ],
    },
    faq: [
      ["Do Sokosumi coworkers use Claude?", "Some do. Each coworker profile lists the models it runs on, as stated by its vendor. You choose by role and deliverable; the vendor chooses the model."],
      ["We use Claude Projects for our brand context. Is that lost?", "No. Your documents attach to a task as context, and a project on Sokosumi holds the description, the tasks and the files for one piece of work."],
      ["Is this cheaper than Claude Team?", "It depends on use. A seat that runs two reports a month costs a fraction of a flat seat; a seat that runs all day costs more. The task price is shown before you run it."],
      ["Can I try it before paying?", "Yes. 250 free credits per seat, no card required."],
    ],
    de: {
      title: "Sokosumi vs. Claude",
      description: "Claude ist ein Assistent, mit dem eine Person spricht. Sokosumi ist ein Marktplatz benannter AI Coworker, die fertige Dateien auf ein gemeinsames Team-Board liefern. Der Vergleich.",
      hero: {
        heading: "Sokosumi vs. Claude",
        subheading: "Claude gehört zu den besten Assistenten, die es gibt, und mehrere Sokosumi-Coworker laufen auf Anthropic-Modellen. Der Unterschied ist nicht das Modell, sondern wer die Arbeit macht, für wen, und was am Ende herauskommt. Angaben zum Wettbewerber laut Anthropic zum Zeitpunkt der Erstellung.",
      },
      rows: ["Benannte Coworker mit Rolle, Anbieter und öffentlichem Profil", "Gebaut für ein Marketingteam, nicht für den Chat einer Person", "Die Aufgabe endet mit einer fertigen Datei (PDF, Deck, Tabelle, Dashboard)", "Ein gemeinsames Task-Board für das ganze Team", "Briefing in normaler Sprache oder @Erwähnung im Channel", "Startfertige Vorlagen mit Beispiel zum Vorab-Prüfen", "Geplante, wiederkehrende Aufgaben", "Coworker von namentlich genannten Anbietern gebaut und betrieben", "Sie wählen einen Spezialisten, statt selbst den Prompt zu schreiben", "Bezahlt wird nur ausgeführte Arbeit (Credits), kein pauschaler Seat", "EU-Hosting je Coworker angegeben", "Free-Plan zum Testen mit echter Arbeit"],
      cells: { named: "nein", team: "Team- und Enterprise-Pläne", files: "Dateien über Cowork und Artifacts", board: "nein", mention: "nein", templates: "Projects und Skills", scheduled: "Geplante Aufgaben in Cowork", vendors: "nein", specialist: "Sie schreiben den Prompt", pricing: "Pauschal 20–200 $ pro Seat/Monat", eu: "Nicht in den eigenen Plänen", free: "Gratis-Stufe (mit Limits)" },
      grid: {
        heading: "Was wirklich anders ist",
        items: [
          ["Das Modell ist nicht das Produkt", "Mehrere Sokosumi-Coworker laufen auf Claude-Modellen. Was Sie auf Sokosumi kaufen, sind Rolle, Briefing, Ergebnis und der Anbieter dahinter – nicht den Zugang zu einem Modell."],
          ["Ein Assistent vs. ein Roster", "Claude ist ein Assistent, den Sie mit Projekten und Anweisungen konfigurieren. Sokosumi ist ein Roster von Spezialisten mit Namen und Aufgabe, damit ein Marketingteam keine Prompt-Ingenieure werden muss."],
          ["Einzel-Chats vs. Team-Board", "Claude-Gespräche bleiben bei der Person, die sie geführt hat. Jede Sokosumi-Aufgabe liegt auf einem Board, das das ganze Team sieht – mit Status und Datei."],
          ["Pauschaler Seat vs. Credits", "Claude berechnet jeden Seat jeden Monat. Sokosumi-Credits gehen für ausgeführte Arbeit drauf, und jede Aufgabe zeigt ihren Preis vor dem Start."],
          ["Wo es läuft", "Anthropics eigene Pläne bieten keine EU-Datenresidenz. Jeder Sokosumi-Coworker nennt sein Hosting; EU-Hosting ist verfügbar."],
          ["Mit echter Arbeit testen", "Der Free-Plan hat 250 Credits pro Seat. Geben Sie dasselbe Briefing einem Coworker und Claude und vergleichen Sie, was Sie einer Kollegin schicken können."],
        ],
      },
      faq: [
        ["Nutzen Sokosumi-Coworker Claude?", "Manche ja. Jedes Coworker-Profil nennt die Modelle laut Anbieter. Sie wählen nach Rolle und Ergebnis; der Anbieter wählt das Modell."],
        ["Wir nutzen Claude Projects für unseren Markenkontext. Geht das verloren?", "Nein. Ihre Dokumente hängen als Kontext an einer Aufgabe, und ein Projekt auf Sokosumi bündelt Beschreibung, Aufgaben und Dateien für ein Vorhaben."],
        ["Ist das günstiger als Claude Team?", "Kommt auf die Nutzung an. Ein Seat mit zwei Reports im Monat kostet einen Bruchteil eines pauschalen Seats; ein Seat, der den ganzen Tag arbeitet, mehr. Der Preis einer Aufgabe steht vor dem Start."],
        ["Kann ich es vor dem Bezahlen testen?", "Ja. 250 Credits pro Seat gratis, ohne Karte."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-claude-code",
    title: "Sokosumi vs. Claude Code",
    description: "Claude Code is an agent for developers working in a codebase. Sokosumi is a marketplace of AI coworkers for marketing teams that deliver finished files. Different jobs, compared plainly.",
    competitor: "Claude Code",
    hero: {
      heading: "Sokosumi vs. Claude Code",
      subheading: "\"Our developers could just build this with Claude Code.\" Sometimes true. Claude Code is a coding agent that lives in a terminal and a repository. Sokosumi is a marketplace of coworkers a marketing team briefs in plain language. Competitor details as published by Anthropic at time of writing.",
    },
    cells: { named: "no", team: "Built for developers", files: "Code and files in a repository", board: "no", mention: "Via integrations, set up by developers", templates: "Skills and commands you write", scheduled: "Via your own automation", vendors: "no", specialist: "You write the instructions", pricing: "Flat $20–200 per seat/month or API usage", eu: "Not on first-party plans", free: "No" },
    grid: {
      heading: "What is actually different",
      items: [
        ["Who it is for", "Claude Code is for people who read and write code. Sokosumi is for the marketing team: you brief Hannah in a sentence, you do not open a terminal."],
        ["Build vs. hire", "With Claude Code your developers build and maintain an agent for each job. On Sokosumi vendors already did that; you hire the coworker and start."],
        ["Who keeps it running", "An agent your team built is your team's to fix when a model changes. A Sokosumi coworker is operated by a named vendor with a public profile and stated hosting."],
        ["Where the work shows up", "Claude Code's output is a change in a repository. Sokosumi's output is a PDF, a deck or a dashboard on a board the whole marketing team sees."],
        ["What it costs to get to the first result", "Claude Code needs a developer, a plan and time. A Sokosumi template task has a fixed brief, a sample to inspect and a credit price shown before you run it."],
        ["When Claude Code is the right answer", "If you have developers, a very specific internal workflow and time to own it, build it. Vendors can also list a custom coworker for your workspace on Sokosumi."],
      ],
    },
    faq: [
      ["Can our developers build the same thing with Claude Code?", "A single agent for a single job, yes, if they own it afterwards. A roster of specialists with profiles, a shared board, credits and vendor support is what Sokosumi already is."],
      ["Does Sokosumi have anything for developers?", "Yes. Vendors list coworkers through the developer platform (API keys, OAuth clients), and any MCP client can call your coworkers."],
      ["Can we use both?", "Yes. Teams keep Claude Code for engineering and use Sokosumi for marketing deliverables. The two do not overlap much."],
      ["Can I try it before paying?", "Yes. 250 free credits per seat, no card required."],
    ],
    de: {
      title: "Sokosumi vs. Claude Code",
      description: "Claude Code ist ein Agent für Entwickler in einer Codebasis. Sokosumi ist ein Marktplatz für AI Coworker, die Marketingteams fertige Dateien liefern. Zwei verschiedene Jobs, klar verglichen.",
      hero: {
        heading: "Sokosumi vs. Claude Code",
        subheading: "„Das könnten unsere Entwickler doch mit Claude Code bauen.“ Manchmal stimmt das. Claude Code ist ein Coding-Agent, der im Terminal und im Repository lebt. Sokosumi ist ein Marktplatz für Coworker, die ein Marketingteam in normaler Sprache brieft. Angaben zum Wettbewerber laut Anthropic zum Zeitpunkt der Erstellung.",
      },
      rows: ["Benannte Coworker mit Rolle, Anbieter und öffentlichem Profil", "Gebaut für ein Marketingteam, nicht für den Chat einer Person", "Die Aufgabe endet mit einer fertigen Datei (PDF, Deck, Tabelle, Dashboard)", "Ein gemeinsames Task-Board für das ganze Team", "Briefing in normaler Sprache oder @Erwähnung im Channel", "Startfertige Vorlagen mit Beispiel zum Vorab-Prüfen", "Geplante, wiederkehrende Aufgaben", "Coworker von namentlich genannten Anbietern gebaut und betrieben", "Sie wählen einen Spezialisten, statt selbst den Prompt zu schreiben", "Bezahlt wird nur ausgeführte Arbeit (Credits), kein pauschaler Seat", "EU-Hosting je Coworker angegeben", "Free-Plan zum Testen mit echter Arbeit"],
      cells: { named: "nein", team: "Für Entwickler gebaut", files: "Code und Dateien im Repository", board: "nein", mention: "Über Integrationen, von Entwicklern eingerichtet", templates: "Skills und Befehle, die Sie schreiben", scheduled: "Über eigene Automatisierung", vendors: "nein", specialist: "Sie schreiben die Anweisungen", pricing: "Pauschal 20–200 $ pro Seat/Monat oder API-Nutzung", eu: "Nicht in den eigenen Plänen", free: "Nein" },
      grid: {
        heading: "Was wirklich anders ist",
        items: [
          ["Für wen es ist", "Claude Code ist für Menschen, die Code lesen und schreiben. Sokosumi ist für das Marketingteam: Sie briefen Hannah in einem Satz und öffnen kein Terminal."],
          ["Bauen vs. beauftragen", "Mit Claude Code bauen und pflegen Ihre Entwickler für jeden Job einen Agenten. Auf Sokosumi haben Anbieter das schon getan; Sie beauftragen den Coworker und legen los."],
          ["Wer es am Laufen hält", "Einen selbst gebauten Agenten muss Ihr Team reparieren, wenn sich ein Modell ändert. Einen Sokosumi-Coworker betreibt ein namentlich genannter Anbieter mit öffentlichem Profil und angegebenem Hosting."],
          ["Wo die Arbeit auftaucht", "Das Ergebnis von Claude Code ist eine Änderung im Repository. Das Ergebnis von Sokosumi ist ein PDF, ein Deck oder ein Dashboard auf einem Board, das das ganze Marketingteam sieht."],
          ["Was der Weg zum ersten Ergebnis kostet", "Claude Code braucht einen Entwickler, einen Plan und Zeit. Eine Sokosumi-Vorlage hat ein festes Briefing, ein Beispiel zum Prüfen und einen Credit-Preis vor dem Start."],
          ["Wann Claude Code die richtige Antwort ist", "Wenn Sie Entwickler, einen sehr spezifischen internen Workflow und Zeit dafür haben: bauen. Anbieter können auf Sokosumi auch einen individuellen Coworker für Ihren Workspace listen."],
        ],
      },
      faq: [
        ["Können unsere Entwickler dasselbe mit Claude Code bauen?", "Einen Agenten für einen Job – ja, wenn sie ihn danach betreuen. Ein Roster von Spezialisten mit Profilen, ein gemeinsames Board, Credits und Anbieter-Support ist das, was Sokosumi schon ist."],
        ["Hat Sokosumi etwas für Entwickler?", "Ja. Anbieter listen Coworker über die Developer-Plattform (API-Keys, OAuth-Clients), und jeder MCP-Client kann Ihre Coworker aufrufen."],
        ["Können wir beides nutzen?", "Ja. Teams behalten Claude Code für Engineering und nutzen Sokosumi für Marketing-Ergebnisse. Die beiden überschneiden sich kaum."],
        ["Kann ich es vor dem Bezahlen testen?", "Ja. 250 Credits pro Seat gratis, ohne Karte."],
      ],
    },
  },
];

function layout(p, loc) {
  const d = loc === "de" ? p.de : p;
  const rows = ROWS(p.competitor, d.cells).map(([label, a, b, note], i) => ({
    label: loc === "de" ? d.rows[i] : label,
    note: loc === "de" ? null : note,
    cells: [{ value: a === "yes" ? "yes" : loc === "de" && a === "Credits per seat" ? "Credits pro Seat" : loc === "de" && a.startsWith("Free") ? "Free · 250 Credits/Seat" : a }, { value: b }],
  }));
  return [
    { blockType: "hero", eyebrow: loc === "de" ? "Vergleich" : "Comparison", heading: d.hero.heading, subheading: d.hero.subheading, ctaLabel: loc === "de" ? "Kostenlos mit Sokosumi starten" : "Start free with Sokosumi", ctaHref: SIGNUP, secondaryCtaLabel: loc === "de" ? "Mit dem Vertrieb sprechen" : "Talk to sales", secondaryCtaHref: "/contact/sales" },
    { blockType: "comparisonTable", columns: [{ label: "Sokosumi", highlight: true }, { label: p.competitor, highlight: false }], rows },
    { blockType: "featureGrid", heading: d.grid.heading, items: d.grid.items.map(([title, text]) => ({ title, text })) },
    { blockType: "faq", heading: loc === "de" ? "Fragen, die wir bekommen" : "Questions we get", items: d.faq.map(([question, answer]) => ({ question, answer })) },
    { blockType: "ctaBand", heading: loc === "de" ? "Sokosumi kostenlos testen" : "Try Sokosumi free", subheading: loc === "de" ? "Nutzen Sie die 250 Credits pro Seat für eine echte Aufgabe und prüfen Sie das Ergebnis." : "Use the 250 free credits per seat to run a task and inspect the result.", ctaLabel: loc === "de" ? "Kostenlos starten" : "Start free", ctaHref: SIGNUP },
  ];
}

async function api(path, init = {}, token) {
  const res = await fetch(BASE + path, { ...init, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `JWT ${token}` } : {}), ...(init.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} → ${res.status} ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}

const { CMS_EMAIL, CMS_PASSWORD } = process.env;
if (!CMS_EMAIL || !CMS_PASSWORD) {
  console.error("Set CMS_EMAIL and CMS_PASSWORD.");
  process.exit(1);
}
const { token } = await api("/api/users/login", { method: "POST", body: JSON.stringify({ email: CMS_EMAIL, password: CMS_PASSWORD }) });

for (const p of PAGES) {
  const existing = await api(`/api/comparisons?where[slug][equals]=${p.slug}&where[site][equals]=sokosumi&limit=1&depth=0&draft=true`, {}, token);
  const en = { site: "sokosumi", slug: p.slug, title: p.title, description: p.description, layout: layout(p, "en"), _status: status };
  let id = existing.docs?.[0]?.id;
  if (id) {
    await api(`/api/comparisons/${id}?locale=en`, { method: "PATCH", body: JSON.stringify(en) }, token);
    console.log("updated", p.slug, id);
  } else {
    const created = await api(`/api/comparisons?locale=en`, { method: "POST", body: JSON.stringify(en) }, token);
    id = created.doc.id;
    console.log("created", p.slug, id);
  }
  const de = { title: p.de.title, description: p.de.description, layout: layout(p, "de"), _status: status };
  await api(`/api/comparisons/${id}?locale=de`, { method: "PATCH", body: JSON.stringify(de) }, token);
  console.log("  de written;", status);
}
console.log(`Done. ${status === "published" ? "Live within ~5 minutes at /compare/<slug>." : "Drafts — review in the admin, then PUBLISH=1 to go live."}`);

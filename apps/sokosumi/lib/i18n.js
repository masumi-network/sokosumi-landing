// The locale layer for the Sokosumi site. Zero-dependency, like everything
// else here.
//
// How it works:
//   * server.js detects a leading /de segment, strips it, and wraps the rest
//     of the request in run({ locale, path }, …). AsyncLocalStorage carries
//     the locale across every await, so concurrent EN and DE requests can
//     never bleed into each other (a module-level variable would race the
//     moment a template awaits the CMS mid-render).
//   * Templates call t("English string") for every piece of UI chrome. The
//     English string IS the key: for EN it comes back unchanged, for DE it is
//     looked up in the dictionary below and falls back to English when a
//     translation is missing — a German page can never render a blank where
//     a label should be.
//   * localizeHtml() rewrites root-relative links (/pricing → /de/pricing)
//     on German pages after render, so templates keep writing plain English
//     paths and no handler is duplicated. /assets is never prefixed; /api IS
//     (the server strips /de before the API branch, so /de/api/* works and
//     form redirects stay in-locale). A href written as /en/<path> is the
//     language switcher's escape hatch: it survives the rewrite untouched and
//     is then collapsed to /<path> on every locale.
//
// Glossary decisions (per the brand owner): Sokosumi, AI Coworker(s),
// coworker names, vendor names, and model names stay English. Established
// German marketing loanwords (Briefing, Task, Credits, Use Case, Research,
// Social) stay as-is. Formal "Sie" throughout — this is a B2B site.

const { AsyncLocalStorage } = require("async_hooks");

const als = new AsyncLocalStorage();

const LOCALES = ["en", "de"];
const DEFAULT_LOCALE = "en";

function run(store, fn) {
  return als.run({ locale: DEFAULT_LOCALE, path: "/", ...store }, fn);
}

function store() {
  return als.getStore() || null;
}

function locale() {
  const s = als.getStore();
  return (s && s.locale) || DEFAULT_LOCALE;
}

// Path of the CURRENT page, locale-stripped ("/pricing" on /de/pricing).
function currentPath() {
  const s = als.getStore();
  return (s && s.path) || "/";
}

// "/de" on German requests, "" otherwise.
function prefix(loc) {
  return (loc || locale()) === "de" ? "/de" : "";
}

// The same page in another locale: localizePath("/pricing", "de") → "/de/pricing".
function localizePath(p, loc) {
  const pre = prefix(loc);
  if (!pre) return p || "/";
  return p === "/" || !p ? pre : pre + p;
}

const missing = new Set();

function interpolate(s, vars) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] == null ? m : String(vars[k])));
}

// t("English string", vars?) — the workhorse. English in, current locale out.
function t(key, vars) {
  if (locale() !== "de") return interpolate(key, vars);
  const hit = DE[key];
  if (hit === undefined) {
    // Dynamic values (names, CMS titles) pass through here by design; only
    // log strings that look like sentences so real gaps surface in dev.
    if (!missing.has(key) && /\s/.test(key)) {
      missing.add(key);
      if (process.env.I18N_DEBUG) console.error(`[i18n] missing de: ${JSON.stringify(key)}`);
    }
    return interpolate(key, vars);
  }
  return interpolate(hit, vars);
}

// Plural helper: tp(n, "{n} coworker", "{n} coworkers")
function tp(n, singular, plural, vars) {
  return t(n === 1 ? singular : plural, { n, ...(vars || {}) });
}

// ── link rewriting ───────────────────────────────────────────────────────
// Root-relative href/action attributes get the /de prefix on German pages.
// Never touched: /assets (shared files), anything already /de, the /en
// switcher marker, and pure fragments/absolute URLs (they don't start "/").
const LINK_RE = /\b(href|action)="\/(?!de(?:\/|"))(?!en(?:\/|"))(?!assets\/)([^"]*)"/g;

function localizeHtml(html) {
  let out = html;
  if (locale() === "de") {
    out = out.replace(LINK_RE, (m, a, rest) => (rest ? `${a}="/de/${rest}"` : `${a}="/de"`));
  }
  // Collapse the switcher marker on every locale: /en/<path> → /<path>.
  out = out.replace(/\b(href|action)="\/en(\/[^"]*)?"/g, (m, a, rest) => `${a}="${rest || "/"}"`);
  return out;
}

// ── the German dictionary ────────────────────────────────────────────────
// Keys are the exact English strings the templates use.
const DE = {
  "Writing":
    "Text",
  "Planning":
    "Planung",
  "Data":
    "Daten",
  "Presentations":
    "Pr\u00e4sentationen",
  "Coordination":
    "Koordination",
  "Other":
    "Sonstiges",
  "Articles, announcements, and press from the team behind your AI coworkers \u2014 how the marketplace works, what teams brief, and what shipped recently.":
    "Artikel, Ank\u00fcndigungen und Presse vom Team hinter Ihren AI Coworkern \u2014 wie der Marktplatz funktioniert, was Teams briefen und was zuletzt erschienen ist.",
  "How Sokosumi compares to other AI platforms and agent tools, side by side: what each one does, how you brief it, and what you actually get back.":
    "Wie sich Sokosumi im direkten Vergleich mit anderen AI-Plattformen und Agent-Tools schl\u00e4gt: was jedes davon leistet, wie Sie es briefen und was zur\u00fcckkommt.",
  "Every Sokosumi release in order: new capabilities, improvements and fixes, with the date each one shipped and what changed for your coworkers.":
    "Jedes Sokosumi-Release der Reihe nach: neue Funktionen, Verbesserungen und Fehlerbehebungen, mit Datum und dem, was sich f\u00fcr Ihre Coworker ge\u00e4ndert hat.",
  "How to get the most out of your AI coworkers: setup, briefing patterns, workflows, and the details that decide whether a task comes back usable.":
    "So holen Sie das Beste aus Ihren AI Coworkern heraus: Einrichtung, Briefing-Muster, Workflows und die Details, die entscheiden, ob ein Task brauchbar zur\u00fcckkommt.",
  "This page's content is briefly unavailable while our content service recovers. It still exists \u2014 try again in a minute or two.":
    "Der Inhalt dieser Seite ist kurzzeitig nicht verf\u00fcgbar, w\u00e4hrend unser Content-Service wiederhergestellt wird. Die Seite existiert weiterhin \u2014 versuchen Sie es in ein bis zwei Minuten erneut.",
  "Named specialists you can hire today, each with a real role and a public profile. Synced nightly from the live marketplace.":
    "Benannte Spezialisten, die Sie heute engagieren können \\u2014 jeder mit einer echten Rolle und einem öffentlichen Profil. Nächtlich mit dem Marktplatz synchronisiert.",
  "Back in a moment":
    "Gleich wieder da",
  "Back in a moment | Sokosumi":
    "Gleich wieder da | Sokosumi",
  "This Sokosumi page is temporarily unavailable while our content service recovers.":
    "Diese Sokosumi-Seite ist vorübergehend nicht verfügbar, während unser Content-Service wiederhergestellt wird.",
  "Back to the homepage":
    "Zurück zur Startseite",
  // ---- shared chrome (templates/shell.js) ----
  "Skip to content": "Zum Inhalt springen",
  "Log In": "Anmelden",
  "Sign Up": "Registrieren",
  "Talk to Sales": "Vertrieb kontaktieren",
  "Talk to sales": "Vertrieb kontaktieren",
  "Open menu": "Menü öffnen",
  Home: "Startseite",

  // mobile drawer
  "Named specialists you can hire": "Benannte Spezialisten, die Sie einstellen können",
  Vendors: "Anbieter",
  "The teams behind them": "Die Teams dahinter",
  "Template tasks": "Template-Tasks",
  "Ready-to-run work": "Sofort startklare Aufgaben",
  Product: "Produkt",
  "How it works, end to end": "So funktioniert es – von Anfang bis Ende",
  "Use cases": "Use Cases",
  "By job and by industry": "Nach Aufgabe und Branche",
  Pricing: "Preise",
  "Plans and credits per seat": "Pläne und Credits pro Seat",

  // nav panels
  "Specialist AI agents with a name, a role and a vendor behind them. Brief one like a colleague and get finished work back.":
    "Spezialisierte AI Agents mit Namen, Rolle und einem Anbieter dahinter. Briefen Sie sie wie Kolleginnen und Kollegen – und erhalten Sie fertige Arbeit zurück.",
  "Show all vendors": "Alle Anbieter anzeigen",
  "Show all coworkers": "Alle Coworker anzeigen",
  "How work moves through Sokosumi: brief a coworker, follow it on the task board, collect the output.":
    "So läuft Arbeit durch Sokosumi: Coworker briefen, auf dem Task Board verfolgen, Ergebnis abholen.",
  "Product overview": "Produktübersicht",
  "Real jobs, start to finished file, organized by industry. Pick one and the coworkers behind it already know the brief.":
    "Echte Aufgaben – vom Start bis zur fertigen Datei, geordnet nach Branche. Wählen Sie eine aus, die Coworker dahinter kennen das Briefing bereits.",
  "Browse by industry": "Nach Branche filtern",
  "All use cases": "Alle Use Cases",

  // footer
  "The marketplace where you hire AI coworkers for real marketing work — research, social, planning, and writing, delivered as finished files.":
    "Der Marktplatz, auf dem Sie AI Coworker für echte Marketingarbeit einstellen – Research, Social, Planung und Texte, geliefert als fertige Dateien.",
  Marketplace: "Marktplatz",
  "AI Coworkers": "AI Coworkers",
  "List your agent": "Eigenen Agent listen",
  "How it works": "So funktioniert es",
  Compare: "Vergleich",
  Resources: "Ressourcen",
  Guides: "Guides",
  Blog: "Blog",
  Releases: "Releases",
  Developers: "Entwickler",
  Company: "Unternehmen",
  Contact: "Kontakt",
  Support: "Support",
  Press: "Presse",
  "Some of the content on this site is AI generated.": "Ein Teil der Inhalte auf dieser Website ist KI-generiert.",
  "All rights reserved.": "Alle Rechte vorbehalten.",
  Terms: "AGB",
  Privacy: "Datenschutz",
  Cookies: "Cookies",
  Imprint: "Impressum",
  "All legal": "Alle Rechtstexte",
  "Cookie settings": "Cookie-Einstellungen",
  Legal: "Rechtliches",

  // CTA band defaults + fine print
  "Put an AI coworker on it": "Geben Sie die Aufgabe einem AI Coworker",
  "Start free": "Kostenlos starten",
  "Get started": "Jetzt starten",
  "*No Credit Card required": "*Keine Kreditkarte erforderlich",
  "Give a coworker a task.": "Geben Sie einem Coworker eine Aufgabe.",
  "Sign up on the free plan and send the first brief today.":
    "Registrieren Sie sich im kostenlosen Plan und senden Sie noch heute das erste Briefing.",

  // output-type labels
  Document: "Dokument",
  Slides: "Slides",
  Sheet: "Tabelle",
  Image: "Bild",
  Text: "Text",
  Web: "Web",

  // ---- misc.js (404 / 500 / press) ----
  "Not found | Sokosumi": "Nicht gefunden | Sokosumi",
  "The page you are looking for does not exist on Sokosumi, the marketplace for AI coworkers.":
    "Die gesuchte Seite existiert nicht auf Sokosumi, dem Marktplatz für AI Coworker.",
  "We couldn't find that": "Diese Seite konnten wir nicht finden",
  "This page may have moved, or it isn't published yet.":
    "Diese Seite wurde möglicherweise verschoben oder ist noch nicht veröffentlicht.",
  "Back to the homepage": "Zurück zur Startseite",
  "Something went wrong | Sokosumi": "Etwas ist schiefgelaufen | Sokosumi",
  "An unexpected error occurred while rendering this Sokosumi page.":
    "Beim Rendern dieser Sokosumi-Seite ist ein unerwarteter Fehler aufgetreten.",
  "Something went wrong": "Etwas ist schiefgelaufen",
  "We hit a snag rendering this page. Try again in a moment.":
    "Beim Aufbau dieser Seite ist etwas schiefgelaufen. Versuchen Sie es gleich noch einmal.",
  "Press | Sokosumi": "Presse | Sokosumi",
  "Press information and media contact for Sokosumi, the AI coworker marketplace by Serviceplan Group.":
    "Presseinformationen und Medienkontakt für Sokosumi, den AI-Coworker-Marktplatz der Serviceplan Group.",
  "Sokosumi is the marketplace for AI coworkers, built by Serviceplan Group. For interviews, background, or assets, reach out and we will get back to you quickly.":
    "Sokosumi ist der Marktplatz für AI Coworker, entwickelt von der Serviceplan Group. Für Interviews, Hintergrundgespräche oder Material melden Sie sich gern – wir antworten schnell.",
  "Media inquiries": "Presseanfragen",
  "Interviews, comments, and background conversations with the Sokosumi team.":
    "Interviews, Statements und Hintergrundgespräche mit dem Sokosumi-Team.",
  "Email the team": "E-Mail an das Team",
  Facts: "Fakten",
  "Sokosumi gives marketing teams AI coworkers with real roles that deliver finished files. It is built by Serviceplan Group, one of the world's leading agency groups, together with NMKR.":
    "Sokosumi gibt Marketingteams AI Coworker mit echten Rollen, die fertige Dateien liefern. Entwickelt von der Serviceplan Group, einer der führenden Agenturgruppen der Welt, gemeinsam mit NMKR.",
  "Product imagery": "Produktbilder",
  "Screenshots of the live product, free to use in coverage of Sokosumi. Please credit Sokosumi.":
    "Screenshots des Live-Produkts, zur freien Verwendung in der Berichterstattung über Sokosumi. Bitte Sokosumi als Quelle nennen.",
  "See the product for yourself": "Sehen Sie sich das Produkt selbst an",
  "The whole marketplace is browsable before you spend a credit.":
    "Der gesamte Marktplatz lässt sich durchstöbern, bevor Sie einen einzigen Credit ausgeben.",

  // ---- coworkers.js ----
  "AI coworkers on Sokosumi": "AI Coworker auf Sokosumi",
  "Browse every AI coworker on Sokosumi: named specialists with real roles and public profiles, most with ready-to-run work.":
    "Alle AI Coworker auf Sokosumi: benannte Spezialisten mit echten Rollen und öffentlichen Profilen, die meisten mit sofort startklarer Arbeit.",
  "Meet your AI coworkers": "Das sind Ihre AI Coworker",
  "{n} specialists you can hire today, each with a real role and a public profile. Most carry ready-to-run work. Synced nightly from the live marketplace.":
    "{n} Spezialisten, die Sie heute einstellen können – jeder mit einer echten Rolle und einem öffentlichen Profil. Die meisten bringen sofort startklare Aufgaben mit. Jede Nacht mit dem Live-Marktplatz synchronisiert.",
  "What makes a coworker different from an agent": "Was einen Coworker von einem Agent unterscheidet",
  "Sokosumi lists both, and they are not the same unit of work. An agent is a tool you run. A coworker is a specialist you delegate to.":
    "Sokosumi listet beide, und sie sind nicht dieselbe Arbeitseinheit. Ein Agent ist ein Werkzeug, das Sie ausführen. Ein Coworker ist ein Spezialist, an den Sie delegieren.",
  "An agent": "Ein Agent",
  "A single-purpose tool you run on demand. Each listing does one job, names the vendor that operates it, and shows its run count and rating. You hand it an input and collect the output.":
    "Ein Werkzeug für genau eine Aufgabe, das Sie bei Bedarf ausführen. Jedes Listing erledigt einen Job, nennt den betreibenden Anbieter und zeigt Ausführungen und Bewertung. Sie geben einen Input hinein und holen den Output ab.",
  "A coworker": "Ein Coworker",
  "A named specialist with a role and a public profile; most state the model they run on. You brief a coworker the way you brief a colleague: many carry template tasks they can start today, and coworkers delegate work among themselves.":
    "Ein benannter Spezialist mit Rolle und öffentlichem Profil; die meisten nennen das Modell, auf dem sie laufen. Sie briefen einen Coworker wie eine Kollegin oder einen Kollegen: Viele bringen Template-Tasks mit, die sie sofort starten können, und Coworker delegieren Arbeit untereinander.",
  Independent: "Unabhängig",
  Featured: "Empfohlen",
  "{n} coworker": "{n} Coworker",
  "{n} coworkers": "{n} Coworker",
  " from {vendor}.": " von {vendor}.",
  " without a listed vendor.": " ohne gelisteten Anbieter.",
  "{n} template task": "{n} Template-Task",
  "{n} template tasks": "{n} Template-Tasks",
  "Meet the coworker": "Coworker kennenlernen",
  "Specialist Agents": "Spezialisierte Agents",
  "{n} specialist agents from {vendors} vendors, ready to run in the app.":
    "{n} spezialisierte Agents von {vendors} Anbietern, sofort in der App einsatzbereit.",
  View: "Ansehen",
  "Hire your first AI coworker": "Stellen Sie Ihren ersten AI Coworker ein",
  "One account, one balance, and every specialist on the marketplace.":
    "Ein Konto, ein Guthaben und jeder Spezialist auf dem Marktplatz.",

  // profile
  "{n} runs": "{n} Ausführungen",
  runs: "Ausführungen",
  rating: "Bewertung",
  "credits per run": "Credits pro Ausführung",
  "AI coworker": "AI Coworker",
  "{name} | {role} on Sokosumi": "{name} | {role} auf Sokosumi",
  "Hire {name}, an AI coworker on Sokosumi.": "Stellen Sie {name} ein, einen AI Coworker auf Sokosumi.",
  "On the marketplace": "Auf dem Marktplatz",
  "Featured coworker": "Empfohlener Coworker",
  "Try {name} on Sokosumi": "{name} auf Sokosumi ausprobieren",
  "No template tasks yet": "Noch keine Template-Tasks",
  "{name} works from your brief instead. Start a task in the app and brief {name} directly.":
    "{name} arbeitet stattdessen direkt nach Ihrem Briefing. Starten Sie einen Task in der App und briefen Sie {name} direkt.",
  "Ready-to-run work {name} can pick up today. Open one to see what you get.":
    "Sofort startklare Aufgaben, die {name} heute übernehmen kann. Öffnen Sie eine, um zu sehen, was Sie bekommen.",
  "Put {name} to work": "Lassen Sie {name} für sich arbeiten",
  "Sign up free, brief the task, and collect the finished file. Credits only go on work you run.":
    "Registrieren Sie sich kostenlos, briefen Sie den Task und holen Sie die fertige Datei ab. Credits fallen nur für Arbeit an, die Sie ausführen.",
  "Try {name} free": "{name} kostenlos testen",
  Task: "Task",
  "View task": "Task ansehen",

  // ---- tasks.js ----
  "Template tasks | Sokosumi": "Template-Tasks | Sokosumi",
  "Browse ready-to-run template tasks from Sokosumi's AI coworkers. Filter by category and open any task to see its brief and deliverable.":
    "Sofort startklare Template-Tasks der AI Coworker auf Sokosumi. Nach Kategorie filtern und jeden Task öffnen, um Briefing und Ergebnis zu sehen.",
  "Template tasks, ready to run": "Template-Tasks, sofort startklar",
  "Every task is a fixed brief with a clear deliverable, and most include a sample output you can inspect before you start. Pick one, add your details, and the coworker takes it from there.":
    "Jeder Task ist ein festes Briefing mit einem klaren Ergebnis, und die meisten enthalten ein Beispiel-Ergebnis, das Sie vor dem Start prüfen können. Wählen Sie einen aus, ergänzen Sie Ihre Angaben – den Rest übernimmt der Coworker.",
  "{n} ready-to-run task across {c} coworker": "{n} startklarer Task bei {c} Coworker",
  "{n} ready-to-run tasks across {c} coworkers": "{n} startklare Tasks bei {c} Coworkern",
  "Search template tasks…": "Template-Tasks durchsuchen …",
  "Search template tasks": "Template-Tasks durchsuchen",
  All: "Alle",
  "No tasks match your filters.": "Keine Tasks entsprechen Ihren Filtern.",
  "Clear filters": "Filter zurücksetzen",
  "Template tasks are on the way. In the meantime,": "Template-Tasks sind in Arbeit. Bis dahin:",
  "meet the coworkers": "lernen Sie die Coworker kennen",
  "Run your first task today": "Starten Sie noch heute Ihren ersten Task",
  "Pick a template, add your brief, and get the finished file back. Signing up is free.":
    "Wählen Sie ein Template, ergänzen Sie Ihr Briefing und erhalten Sie die fertige Datei zurück. Die Registrierung ist kostenlos.",
  "Loading the sample…": "Beispiel wird geladen …",
  "The sample output is generated when you run this task.":
    "Das Beispiel-Ergebnis entsteht, wenn Sie diesen Task ausführen.",
  "Sample outputs for this task": "Beispiel-Ergebnisse für diesen Task",
  "What you get": "Das bekommen Sie",
  "Delivered as {what}.": "Geliefert als {what}.",
  "a finished PDF, ready to share or print": "fertiges PDF, bereit zum Teilen oder Drucken",
  "an editable document file": "bearbeitbare Dokumentdatei",
  "a slide deck": "Slide-Deck",
  "a spreadsheet": "Tabelle",
  "an image file": "Bilddatei",
  "a written text deliverable": "ausformulierter Text",
  "a working web page that runs in your browser": "funktionierende Webseite, die direkt im Browser läuft",
  "A real sample is on this page, so you can inspect the output before you run the task.":
    "Ein echtes Beispiel ist auf dieser Seite – so können Sie das Ergebnis prüfen, bevor Sie den Task ausführen.",
  "Real samples are on this page, so you can inspect the output before you run the task.":
    "Echte Beispiele sind auf dieser Seite – so können Sie das Ergebnis prüfen, bevor Sie den Task ausführen.",
  "The sample output appears on this page after the task's first run.":
    "Das Beispiel-Ergebnis erscheint auf dieser Seite nach der ersten Ausführung des Tasks.",
  "A fixed brief run by {who} — add your details and collect the finished file from your task board.":
    "Ein festes Briefing, ausgeführt von {who} – ergänzen Sie Ihre Angaben und holen Sie die fertige Datei von Ihrem Task Board ab.",
  "Delivered by": "Ausgeführt von",
  "Try this task on Sokosumi": "Diesen Task auf Sokosumi ausprobieren",
  "Open sample output": "Beispiel-Ergebnis öffnen",
  "{title}, a template task run by {name} on Sokosumi.":
    "{title}, ein Template-Task, ausgeführt von {name} auf Sokosumi.",
  'Run "{title}" with {name}': "Starten Sie „{title}“ mit {name}",
  "Pick a template, add your brief, and collect the finished file.":
    "Wählen Sie ein Template, ergänzen Sie Ihr Briefing und holen Sie die fertige Datei ab.",
  "Try this task free": "Diesen Task kostenlos testen",

  // ---- vendors.js ----
  "AI Coworker & Agent Vendors | Sokosumi": "Anbieter von AI Coworkern & Agents | Sokosumi",
  "Meet the vendors behind Sokosumi's AI coworkers and agents: the teams that build them, operate them, and stand behind their work.":
    "Die Anbieter hinter den AI Coworkern und Agents auf Sokosumi: die Teams, die sie entwickeln, betreiben und für ihre Arbeit einstehen.",
  "The vendors behind the AI coworkers": "Die Anbieter hinter den AI Coworkern",
  "Every AI coworker and agent on Sokosumi is built and operated by a vendor: a team that ships it, keeps it running, and stands behind its work. Pick a vendor to see who they ship, what their listings can do, and the models and hosting on file.":
    "Jeder AI Coworker und jeder Agent auf Sokosumi wird von einem Anbieter entwickelt und betrieben: einem Team, das ihn liefert, am Laufen hält und für seine Arbeit einsteht. Wählen Sie einen Anbieter, um zu sehen, wen er liefert, was seine Listings können und welche Modelle und Hosting-Regionen hinterlegt sind.",
  "{n} vendors": "{n} Anbieter",
  "{n} AI coworkers": "{n} AI Coworker",
  "{n} marketplace agents": "{n} Marktplatz-Agents",
  "Vendor profiles are on the way. In the meantime,": "Anbieterprofile sind in Arbeit. Bis dahin:",
  "Hire from any of them, in one place": "Stellen Sie bei allen ein – an einem Ort",
  "One account, one credit balance, every vendor on the marketplace. Signing up is free.":
    "Ein Konto, ein Credit-Guthaben, jeder Anbieter auf dem Marktplatz. Die Registrierung ist kostenlos.",
  "{n} agent": "{n} Agent",
  "{n} agents": "{n} Agents",
  "Vendor on Sokosumi": "Anbieter auf Sokosumi",
  "on Sokosumi": "auf Sokosumi",
  "AI coworkers &amp; agents": "AI Coworker &amp; Agents",
  "AI agents": "AI Agents",
  "AI coworkers from {vendor}": "AI Coworker von {vendor}",
  "Named specialists with real roles and public profiles. Brief them like colleagues; most carry ready-to-run work.":
    "Benannte Spezialisten mit echten Rollen und öffentlichen Profilen. Briefen Sie sie wie Kolleginnen und Kollegen; die meisten bringen sofort startklare Aufgaben mit.",
  "What {vendor}’s listings can do": "Das können die Listings von {vendor}",
  "{tasks} across {cats}. Open one to see the deliverable; most include a sample of the output.":
    "{tasks} in {cats}. Öffnen Sie einen, um das Ergebnis zu sehen; die meisten enthalten ein Beispiel des Outputs.",
  "{n} ready-to-run template task": "{n} sofort startklarer Template-Task",
  "{n} ready-to-run template tasks": "{n} sofort startklare Template-Tasks",
  "{n} category": "{n} Kategorie",
  "{n} categories": "{n} Kategorien",
  "+ {n} more": "+ {n} weitere",
  "Browse all template tasks": "Alle Template-Tasks ansehen",
  "Models and hosting, stated up front": "Modelle und Hosting, offen ausgewiesen",
  Models: "Modelle",
  Hosting: "Hosting",
  "The {what} on file for {vendor}’s listings — visible before you spend a credit.":
    "{what} der Listings von {vendor} – sichtbar, bevor Sie einen Credit ausgeben.",
  "models and hosting regions": "Die hinterlegten Modelle und Hosting-Regionen",
  models: "Die hinterlegten Modelle",
  "hosting regions": "Die hinterlegten Hosting-Regionen",
  "{vendor} AI agents on the marketplace": "AI Agents von {vendor} auf dem Marktplatz",
  "{n} single-purpose specialist agent": "{n} spezialisierter Agent",
  "{n} single-purpose specialist agents": "{n} spezialisierte Agents",
  "{agents} from {vendor}{runs}. Each one does one job and shows its price in credits before you start.":
    "{agents} von {vendor}{runs}. Jeder erledigt genau einen Job und zeigt seinen Preis in Credits, bevor Sie starten.",
  ", with {n} tasks run between them": ", mit zusammen {n} ausgeführten Tasks",
  "{vendor} has no listings on Sokosumi yet. In the meantime,":
    "{vendor} hat noch keine Listings auf Sokosumi. Bis dahin:",
  "rated {r}/5": "bewertet mit {r}/5",
  "{n} credits per run": "{n} Credits pro Ausführung",
  "{n} tasks run": "{n} ausgeführte Tasks",
  "Put {vendor}’s AI coworkers to work": "Lassen Sie die AI Coworker von {vendor} für sich arbeiten",
  "Run {vendor}’s AI agents on Sokosumi": "Starten Sie die AI Agents von {vendor} auf Sokosumi",
  "Meet the AI coworkers on Sokosumi": "Lernen Sie die AI Coworker auf Sokosumi kennen",
  "One free account covers every vendor on the marketplace. Credits only go on work you run.":
    "Ein kostenloses Konto deckt jeden Anbieter auf dem Marktplatz ab. Credits fallen nur für Arbeit an, die Sie ausführen.",
  "Browse AI coworkers": "AI Coworker ansehen",

  // ---- vendors.js (computed sentences) ----
  "{n} AI coworker": "{n} AI Coworker",
  "{n} specialist AI agent": "{n} spezialisierter AI Agent",
  "{n} specialist AI agents": "{n} spezialisierte AI Agents",
  "{n} named AI coworker": "{n} benannter AI Coworker",
  "{n} named AI coworkers": "{n} benannte AI Coworker",
  "{n} marketplace agent": "{n} Marktplatz-Agent",
  "Builds and operates {what}{tasks} on Sokosumi.": "Entwickelt und betreibt {what}{tasks} auf Sokosumi.",
  " and ": " und ",
  ", with {n} ready-to-run template tasks": ", mit {n} sofort startklaren Template-Tasks",
  "marketplace agents": "Marktplatz-Agents",
  "tasks run": "ausgeführte Tasks",
  "{vendor} builds and operates {what} on the Sokosumi marketplace — hire them with one free account and pay only for the work they run.":
    "{vendor} entwickelt und betreibt {what} auf dem Sokosumi-Marktplatz – stellen Sie sie mit einem kostenlosen Konto ein und zahlen Sie nur für die Arbeit, die sie ausführen.",
  "{vendor} | Vendors on Sokosumi": "{vendor} | Anbieter auf Sokosumi",
  "Hire {what} built and operated by {vendor} on the Sokosumi marketplace. Free to sign up; credits only go on work you run.":
    "Stellen Sie {what} ein, entwickelt und betrieben von {vendor} auf dem Sokosumi-Marktplatz. Die Registrierung ist kostenlos; Credits fallen nur für ausgeführte Arbeit an.",
  "{vendor} is a vendor on Sokosumi, the AI coworker marketplace.":
    "{vendor} ist ein Anbieter auf Sokosumi, dem Marktplatz für AI Coworker.",
  " instead.": ".",

  // ---- form validation + rate-limit messages (lib/leads.js / server.js);
  // they arrive as query-param text and are translated at render time ----
  "Please add your name.": "Bitte geben Sie Ihren Namen an.",
  "Please add a valid email address.": "Bitte geben Sie eine gültige E-Mail-Adresse an.",
  "Please tell us a little about what you need.": "Bitte beschreiben Sie kurz, was Sie brauchen.",
  "Please describe what happened.": "Bitte beschreiben Sie, was passiert ist.",
  "We could not record that right now. Please email info@sokosumi.com directly.":
    "Das konnten wir gerade nicht speichern. Bitte schreiben Sie direkt an info@sokosumi.com.",
  "Too many requests just now. Please try again shortly.":
    "Gerade zu viele Anfragen. Bitte versuchen Sie es gleich noch einmal.",
  "That message is too long.": "Diese Nachricht ist zu lang.",
  "That submission is too long.": "Diese Einreichung ist zu lang.",

  // ---- useCases.js ----
  "Use cases | Sokosumi": "Use Cases | Sokosumi",
  "What teams get done with AI coworkers on Sokosumi, organized by industry: real workflows with the coworkers and template tasks to run them.":
    "Was Teams mit AI Coworkern auf Sokosumi erledigen, geordnet nach Branche: echte Workflows mit den Coworkern und Template-Tasks, um sie auszuführen.",
  "What teams get done with Sokosumi": "Was Teams mit Sokosumi erledigen",
  "Real workflows, mapped to your industry and handed to coworkers that already know the job.":
    "Echte Workflows, zugeordnet zu Ihrer Branche und übergeben an Coworker, die die Aufgabe bereits kennen.",
  "Filter by industry": "Nach Branche filtern",
  "One workflow": "Ein Workflow",
  "{n} workflows": "{n} Workflows",
  "Each one is a real job, start to finished file, run by a team of coworkers.":
    "Jeder ist eine echte Aufgabe – vom Start bis zur fertigen Datei, ausgeführt von einem Team aus Coworkern.",
  "Use cases are on the way. In the meantime,": "Use Cases sind in Arbeit. Bis dahin:",
  "browse the template tasks": "stöbern Sie in den Template-Tasks",
  "How a use case runs": "So läuft ein Use Case ab",
  "Every use case on this page is a real workflow you can start today.":
    "Jeder Use Case auf dieser Seite ist ein echter Workflow, den Sie heute starten können.",
  "Pick the work": "Aufgabe auswählen",
  "Start from a use case that matches the job, not from a blank prompt.":
    "Starten Sie mit einem Use Case, der zur Aufgabe passt – nicht mit einem leeren Prompt.",
  "Hand it over": "Übergeben",
  "The coworkers behind it already know the brief, the sources, and the format.":
    "Die Coworker dahinter kennen bereits das Briefing, die Quellen und das Format.",
  "Get the file": "Datei erhalten",
  "A finished deliverable lands in the app: a report, a deck, a sheet, a dashboard.":
    "Ein fertiges Ergebnis landet in der App: ein Report, ein Deck, eine Tabelle, ein Dashboard.",
  "What it is like once they are running": "So fühlt es sich an, wenn sie erst einmal laufen",
  "Put a coworker on one of these this week": "Setzen Sie diese Woche einen Coworker auf eine dieser Aufgaben an",
  "Create an account, pick the use case closest to your job, and hand over the first brief.":
    "Erstellen Sie ein Konto, wählen Sie den Use Case, der Ihrer Aufgabe am nächsten kommt, und übergeben Sie das erste Briefing.",
  "Use case": "Use Case",
  "{n} coworkers on it": "{n} Coworker daran",
  "{n} coworker on it": "{n} Coworker daran",
  "Read the workflow": "Workflow lesen",
  "{name} use cases | Sokosumi": "Use Cases für {name} | Sokosumi",
  "How {name} teams put AI coworkers to work on Sokosumi.":
    "Wie Teams aus dem Bereich {name} AI Coworker auf Sokosumi einsetzen.",
  "Use cases for": "Use Cases für",
  "{n} of the {total} workflows on Sokosumi apply here.":
    "{n} der {total} Workflows auf Sokosumi passen hierher.",
  "See all use cases": "Alle Use Cases ansehen",
  "Use cases for this industry are on the way. In the meantime,":
    "Use Cases für diese Branche sind in Arbeit. Bis dahin:",
  "browse all use cases": "sehen Sie sich alle Use Cases an",
  "Bring a coworker into your {industry} team": "Holen Sie einen Coworker in Ihr Team ({industry})",
  "Create an account and hand over the first brief today.":
    "Erstellen Sie ein Konto und übergeben Sie noch heute das erste Briefing.",
  "{title} | Sokosumi use cases": "{title} | Sokosumi Use Cases",
  "The coworkers who run it": "Die Coworker, die ihn ausführen",
  "Each one comes with template tasks behind this workflow, ready to brief. Open a task to see the deliverable before you start.":
    "Jeder bringt Template-Tasks hinter diesem Workflow mit, bereit zum Briefen. Öffnen Sie einen Task, um das Ergebnis vor dem Start zu sehen.",
  "Related use cases": "Verwandte Use Cases",
  "Put a coworker on this": "Setzen Sie einen Coworker darauf an",
  "Create an account, pick this use case, and hand over the first brief.":
    "Erstellen Sie ein Konto, wählen Sie diesen Use Case und übergeben Sie das erste Briefing.",

  // ---- pricing.js ----
  "Pricing | Sokosumi": "Preise | Sokosumi",
  "Sokosumi plans: a free tier with 250 credits per seat, Starter at €25, Standard at €75, Pro at €200 per month, and a tailored Enterprise plan.":
    "Sokosumi-Pläne: ein kostenloser Plan mit 250 Credits pro Seat, Starter für 25 €, Standard für 75 €, Pro für 200 € pro Monat sowie ein individueller Enterprise-Plan.",
  "Plans that scale with the work": "Pläne, die mit der Arbeit wachsen",
  "Every plan includes credits per seat. Start free, move up when your team runs more work, or talk to us about a tailored plan.":
    "Jeder Plan enthält Credits pro Seat. Starten Sie kostenlos, wechseln Sie nach oben, wenn Ihr Team mehr Arbeit ausführt, oder sprechen Sie mit uns über einen individuellen Plan.",
  "Getting started to work with Marketing Agents.": "Der Einstieg in die Arbeit mit Marketing-Agents.",
  "For freelancers and micro companies.": "Für Freelancer und Kleinstunternehmen.",
  "Full set of marketing agents for small companies.": "Das volle Set an Marketing-Agents für kleine Unternehmen.",
  "Get more access to our Marketing Agents and Services.": "Mehr Zugriff auf unsere Marketing-Agents und Services.",
  "Custom plan for organizations with tailored seats, credits, and support.":
    "Individueller Plan für Organisationen mit maßgeschneiderten Seats, Credits und Support.",
  Free: "Kostenlos",
  Custom: "Individuell",
  "per month": "pro Monat",
  "Most popular": "Am beliebtesten",
  Tailored: "Individuell",
  "credits per seat": "Credits pro Seat",
  "Need tailored seats, credits, or support?": "Sie brauchen individuelle Seats, Credits oder Support?",
  "Teams already on a plan": "Teams, die bereits einen Plan nutzen",
  "Get started on the free plan": "Starten Sie mit dem kostenlosen Plan",
  "250 credits per seat, no card, and every agent on the marketplace to try them on.":
    "250 Credits pro Seat, keine Kreditkarte – und jeder Agent auf dem Marktplatz zum Ausprobieren.",

  // ---- contact.js ----
  "Contact | Sokosumi": "Kontakt | Sokosumi",
  "Get in touch with Sokosumi: sales for teams and vendors, product support for everyone already working with a coworker.":
    "Kontaktieren Sie Sokosumi: Vertrieb für Teams und Anbieter, Produkt-Support für alle, die bereits mit einem Coworker arbeiten.",
  "Talk to us": "Sprechen Sie mit uns",
  "Sales for teams and vendors, support for everyone already working with a coworker.":
    "Vertrieb für Teams und Anbieter, Support für alle, die bereits mit einem Coworker arbeiten.",
  "Rolling Sokosumi out to a team, or want to list your own coworkers as a vendor? Tell us what you have in mind and we will get back within a day.":
    "Sie führen Sokosumi in einem Team ein oder möchten als Anbieter eigene Coworker listen? Sagen Sie uns, was Sie vorhaben – wir melden uns innerhalb eines Tages.",
  "Product support": "Produkt-Support",
  "Questions about your account, credits, or a task that did not go as planned. Include the task link if you have one, it speeds things up.":
    "Fragen zu Ihrem Konto, zu Credits oder zu einem Task, der nicht wie geplant lief? Fügen Sie den Task-Link bei, wenn Sie einen haben – das beschleunigt die Antwort.",
  "Go to Support": "Zum Support",
  "In a hurry? Write straight to": "Eilig? Schreiben Sie direkt an den",
  support: "Support",
  ", or open": ", oder öffnen Sie",
  "the app": "die App",
  "— most answers are one click away there.": "– die meisten Antworten sind dort nur einen Klick entfernt.",
  "Prefer to look around first?": "Möchten Sie sich erst umsehen?",
  "Every coworker, task, and sample output on the marketplace is public. Nothing here is behind a form.":
    "Jeder Coworker, jeder Task und jedes Beispiel-Ergebnis auf dem Marktplatz ist öffentlich. Nichts davon liegt hinter einem Formular.",
  Coworkers: "Coworker",
  "Every AI coworker on Sokosumi, each with a real role and a public profile.":
    "Alle AI Coworker auf Sokosumi, jeder mit echter Rolle und öffentlichem Profil.",
  "Ready-to-run work with a clear brief and a known deliverable.":
    "Sofort startklare Aufgaben mit klarem Briefing und bekanntem Ergebnis.",
  "Setup, workflows, and patterns for getting the most out of your coworkers.":
    "Einrichtung, Workflows und Muster, um das Beste aus Ihren Coworkern herauszuholen.",
  Browse: "Stöbern",
  Read: "Lesen",

  // ---- sales.js ----
  "Talk to Sales | Sokosumi": "Vertrieb kontaktieren | Sokosumi",
  "Book a walkthrough of Sokosumi or ask us anything about putting AI coworkers to work in your marketing team.":
    "Buchen Sie eine Sokosumi-Demo oder stellen Sie uns Ihre Fragen zum Einsatz von AI Coworkern in Ihrem Marketingteam.",
  Sales: "Vertrieb",
  "Put AI coworkers to work in your team": "Bringen Sie AI Coworker in Ihrem Team zum Einsatz",
  "Tell us what you want to get done and we will show you exactly how Sokosumi handles it. Book a walkthrough, or just ask your questions and we will answer by email.":
    "Sagen Sie uns, was Sie erledigen möchten, und wir zeigen Ihnen genau, wie Sokosumi das übernimmt. Buchen Sie eine Demo – oder stellen Sie einfach Ihre Fragen, wir antworten per E-Mail.",
  "Your name": "Ihr Name",
  "Work email": "Geschäftliche E-Mail",
  "Team size": "Teamgröße",
  Select: "Bitte wählen",
  "1 to 10": "1 bis 10",
  "11 to 50": "11 bis 50",
  "51 to 200": "51 bis 200",
  "What would you like?": "Was wünschen Sie sich?",
  "A meeting": "Ein Gespräch",
  "30 minutes, we walk you through Sokosumi with your use case in mind.":
    "30 Minuten – wir führen Sie durch Sokosumi, mit Blick auf Ihren Use Case.",
  "Just a reply": "Nur eine Antwort",
  "Answer my questions by email, no call needed.": "Beantworten Sie meine Fragen per E-Mail, kein Termin nötig.",
  "What do you want to get done?": "Was möchten Sie erledigen?",
  "The work you would hand to a coworker, the team it is for, and anything we should know.":
    "Die Arbeit, die Sie einem Coworker übergeben würden, das Team, für das sie gedacht ist, und alles, was wir wissen sollten.",
  "Send request": "Anfrage senden",
  "We reply within one working day. No newsletter, no sharing your details.":
    "Wir antworten innerhalb eines Werktags. Kein Newsletter, keine Weitergabe Ihrer Daten.",
  "Request received": "Anfrage erhalten",
  "Thanks, that is on its way.": "Danke, Ihre Anfrage ist unterwegs.",
  "We have your request and will come back to you within one working day. If it is urgent, write to":
    "Wir haben Ihre Anfrage erhalten und melden uns innerhalb eines Werktags. Wenn es dringend ist, schreiben Sie an",
  "and it reaches the same inbox.": "– das erreicht dasselbe Postfach.",
  "Start a task in the app": "Task in der App starten",
  "Meet the coworkers": "Coworker kennenlernen",
  "Every specialist on the platform, what they do, and who builds them.":
    "Jeder Spezialist auf der Plattform, was er tut und wer ihn entwickelt.",
  "Ready-made briefings you can hand over today, with the files they return.":
    "Fertige Briefings, die Sie heute übergeben können, samt der Dateien, die zurückkommen.",
  "See it by use case": "Nach Use Case ansehen",
  "How teams in your industry put coworkers to work, end to end.":
    "Wie Teams in Ihrer Branche Coworker einsetzen – von Anfang bis Ende.",
  "What to expect": "Was Sie erwartet",
  "A reply within one working day, from someone who knows the product.":
    "Eine Antwort innerhalb eines Werktags – von jemandem, der das Produkt kennt.",
  "A walkthrough against your own use case, not a generic demo.":
    "Eine Demo entlang Ihres eigenen Use Cases, keine generische Präsentation.",
  "Straight answers on pricing, data residency, and what coworkers can and cannot do.":
    "Klare Antworten zu Preisen, Datenhaltung und dazu, was Coworker können und was nicht.",
  "Already exploring on your own?": "Schon auf eigene Faust unterwegs?",

  // ---- support.js ----
  "Support | Sokosumi": "Support | Sokosumi",
  "Get help with Sokosumi: email product support, find the guides and release notes, or reach sales about a plan.":
    "Hilfe zu Sokosumi: Produkt-Support per E-Mail, Guides und Release Notes finden oder den Vertrieb zu einem Plan kontaktieren.",
  "Something not working?": "Etwas funktioniert nicht?",
  "Tell us what happened and we will get back to you. If you are still deciding whether Sokosumi is right for your team,":
    "Sagen Sie uns, was passiert ist, und wir melden uns. Wenn Sie noch überlegen, ob Sokosumi das Richtige für Ihr Team ist,",
  "talk to sales": "sprechen Sie mit dem Vertrieb",
  instead: "",
  Email: "E-Mail",
  "Task or job link": "Task- oder Job-Link",
  "Optional, but it is the fastest way for us to see what you saw.":
    "Optional, aber der schnellste Weg für uns, zu sehen, was Sie gesehen haben.",
  "What happened?": "Was ist passiert?",
  "What you expected, what you got instead, and anything you already tried.":
    "Was Sie erwartet haben, was stattdessen kam und was Sie bereits versucht haben.",
  "Send to support": "An den Support senden",
  "Goes straight to {email}. We reply within one working day.":
    "Geht direkt an {email}. Wir antworten innerhalb eines Werktags.",
  "Thanks — that is with support.": "Danke – Ihre Anfrage ist beim Support.",
  "We have it and will come back to you within one working day. If it is urgent, write to":
    "Wir haben sie erhalten und melden uns innerhalb eines Werktags. Wenn es dringend ist, schreiben Sie an",
  "Open the app": "App öffnen",
  "Read the guides": "Guides lesen",
  "What to include": "Was Sie mitschicken sollten",
  "The link to the task or job, if it is about a specific run":
    "Den Link zum Task oder Job, wenn es um eine konkrete Ausführung geht",
  "What you expected to get back, and what you actually got":
    "Was Sie erwartet haben – und was Sie tatsächlich bekommen haben",
  "The account or workspace you are working in": "Das Konto oder den Workspace, in dem Sie arbeiten",
  "A screenshot, if it is something you can see": "Einen Screenshot, wenn es etwas Sichtbares ist",
  "Prefer your own mail client?": "Lieber Ihr eigenes Mailprogramm?",
  "Answer it yourself, faster": "Schneller: selbst nachschlagen",
  "Most of what people write in about is already written down.":
    "Das meiste, wozu uns Menschen schreiben, ist bereits dokumentiert.",
  "Developer documentation": "Entwicklerdokumentation",
  "Building on Sokosumi, or listing your own agent? The API reference and integration guides live in the Masumi dev hub.":
    "Sie bauen auf Sokosumi auf oder listen einen eigenen Agent? Die API-Referenz und Integrationsanleitungen liegen im Masumi Dev Hub.",
  "Open the docs": "Doku öffnen",
  "How to brief a coworker, what a good task looks like, and the workflows that get the most out of them.":
    "Wie Sie einen Coworker briefen, wie ein guter Task aussieht und welche Workflows das meiste herausholen.",
  "Plans and credits": "Pläne und Credits",
  "What each plan includes, how credits per seat work, and what happens when a task does not complete.":
    "Was jeder Plan enthält, wie Credits pro Seat funktionieren und was passiert, wenn ein Task nicht abgeschlossen wird.",
  "See pricing": "Preise ansehen",
  "What changed and when. If something behaves differently than it did last week, start here.":
    "Was sich wann geändert hat. Wenn sich etwas anders verhält als letzte Woche, beginnen Sie hier.",
  "Read the release notes": "Release Notes lesen",
  "Every task shows its brief and its deliverable; most include a real sample output before you run it.":
    "Jeder Task zeigt sein Briefing und sein Ergebnis; die meisten enthalten ein echtes Beispiel, bevor Sie ihn ausführen.",
  "Not a support question?": "Keine Support-Frage?",
  "Rolling Sokosumi out to a team, or listing your own coworkers as a vendor — that one is for sales.":
    "Sokosumi im Team einführen oder als Anbieter eigene Coworker listen – das ist ein Fall für den Vertrieb.",

  // ---- guides.js ----
  "Guides | Sokosumi": "Guides | Sokosumi",
  "How to get the most out of your AI coworkers: setup, workflows, and advanced patterns.":
    "So holen Sie das Beste aus Ihren AI Coworkern heraus: Einrichtung, Workflows und fortgeschrittene Muster.",
  "How to get the most out of your AI coworkers, from the first briefing to advanced workflows.":
    "So holen Sie das Beste aus Ihren AI Coworkern heraus – vom ersten Briefing bis zu fortgeschrittenen Workflows.",
  "It starts with one good brief": "Es beginnt mit einem guten Briefing",
  "Say what you want done in plain language. Sokosumi points you at the coworkers who do that job, and most of them show sample work before you commit a credit.":
    "Sagen Sie in einfachen Worten, was erledigt werden soll. Sokosumi zeigt Ihnen die Coworker, die diese Aufgabe übernehmen – und die meisten zeigen Beispielarbeit, bevor Sie einen Credit einsetzen.",
  "Browse template tasks": "Template-Tasks ansehen",
  "Guides are on the way. In the meantime,": "Guides sind in Arbeit. Bis dahin:",
  "Try it on a real task": "Probieren Sie es an einem echten Task aus",
  "The fastest way through any guide is to run the thing it describes. Signing up is free.":
    "Der schnellste Weg durch jeden Guide ist, das Beschriebene einfach auszuführen. Die Registrierung ist kostenlos.",
  "Getting started": "Erste Schritte",
  Integrations: "Integrationen",
  Workflows: "Workflows",
  Advanced: "Fortgeschritten",
  Guide: "Guide",
  "{title} | Sokosumi guides": "{title} | Sokosumi Guides",
  "Related guides": "Verwandte Guides",
  "Put this into practice": "Setzen Sie das in die Praxis um",
  "Brief a coworker with what you just read and see what comes back. Signing up is free.":
    "Briefen Sie einen Coworker mit dem, was Sie gerade gelesen haben, und sehen Sie, was zurückkommt. Die Registrierung ist kostenlos.",

  // ---- blog.js ----
  "Blog | Sokosumi": "Blog | Sokosumi",
  "Articles, announcements, and press from the team behind your AI coworkers.":
    "Artikel, Ankündigungen und Presse vom Team hinter Ihren AI Coworkern.",
  "The Sokosumi blog": "Der Sokosumi-Blog",
  "Posts are on the way. In the meantime,": "Beiträge sind in Arbeit. Bis dahin:",
  "read the guides": "lesen Sie die Guides",
  "Meet the coworkers we write about": "Lernen Sie die Coworker kennen, über die wir schreiben",
  "Every specialist on the marketplace has a public profile and work you can inspect first.":
    "Jeder Spezialist auf dem Marktplatz hat ein öffentliches Profil und Arbeit, die Sie vorab prüfen können.",
  "Browse the roster": "Roster ansehen",
  Article: "Artikel",
  Announcement: "Ankündigung",
  "Press release": "Pressemitteilung",
  "{title} | Sokosumi blog": "{title} | Sokosumi Blog",
  "All posts": "Alle Beiträge",
  "See it for yourself": "Überzeugen Sie sich selbst",
  "Run one real task and judge the output for yourself.":
    "Führen Sie einen echten Task aus und beurteilen Sie das Ergebnis selbst.",

  // ---- releases.js ----
  "Releases | Sokosumi": "Releases | Sokosumi",
  "Every Sokosumi release: new capabilities, improvements, and fixes, in order.":
    "Jedes Sokosumi-Release: neue Funktionen, Verbesserungen und Fehlerbehebungen, in Reihenfolge.",
  "What's new in Sokosumi": "Was ist neu in Sokosumi",
  "New capabilities, improvements, and fixes, straight from the team.":
    "Neue Funktionen, Verbesserungen und Fehlerbehebungen, direkt vom Team.",
  "Release notes are on the way. In the meantime,": "Release Notes sind in Arbeit. Bis dahin:",
  "read the blog": "lesen Sie den Blog",
  "Every release lands in your account": "Jedes Release landet direkt in Ihrem Konto",
  "Nothing to install and nothing to upgrade.": "Nichts zu installieren, nichts zu aktualisieren.",
  Details: "Details",
  Highlights: "Highlights",
  "{title} | Sokosumi releases": "{title} | Sokosumi Releases",
  "Try it in your account": "Probieren Sie es in Ihrem Konto aus",
  "Every release is already live in the product.": "Jedes Release ist bereits live im Produkt.",

  // ---- compare.js ----
  "Compare | Sokosumi": "Vergleich | Sokosumi",
  "How Sokosumi compares to other AI platforms and agent tools, side by side.":
    "Wie sich Sokosumi im direkten Vergleich mit anderen AI-Plattformen und Agent-Tools schlägt.",
  "How Sokosumi compares": "Sokosumi im Vergleich",
  "Honest, side by side looks at Sokosumi and the tools you might be weighing it against.":
    "Ehrliche direkte Vergleiche zwischen Sokosumi und den Tools, die Sie vielleicht abwägen.",
  "What you are actually comparing": "Was Sie eigentlich vergleichen",
  "Not a chat window and not a prompt library. Named coworkers with real roles, a task board your whole team can see, and finished files at the end of it.":
    "Kein Chatfenster und keine Prompt-Bibliothek. Benannte Coworker mit echten Rollen, ein Task Board, das Ihr ganzes Team sieht, und am Ende fertige Dateien.",
  "Side by side": "Im direkten Vergleich",
  "Comparison pages are on the way. In the meantime,": "Vergleichsseiten sind in Arbeit. Bis dahin:",
  "Read the comparison": "Vergleich lesen",
  "The shortest comparison is a trial": "Der kürzeste Vergleich ist ein Test",
  Yes: "Ja",
  No: "Nein",

  // ---- pagesCms.js / product hub ----
  "Product | Sokosumi": "Produkt | Sokosumi",
  "Deep dives into what your AI coworkers can do: the surfaces, workflows, and guarantees behind Sokosumi.":
    "Tiefe Einblicke in das, was Ihre AI Coworker können: die Oberflächen, Workflows und Garantien hinter Sokosumi.",
  "The Sokosumi product": "Das Sokosumi-Produkt",
  "What an AI coworker is, how you brief one, where the work shows up, and what you get back.":
    "Was ein AI Coworker ist, wie Sie ihn briefen, wo die Arbeit auftaucht und was Sie zurückbekommen.",
  "Read more": "Mehr lesen",
  "Explore the platform": "Die Plattform entdecken",
  Explore: "Entdecken",
  "Named specialists with real roles, public profiles, and work you can inspect before you hire.":
    "Benannte Spezialisten mit echten Rollen, öffentlichen Profilen und Arbeit, die Sie vor dem Einstellen prüfen können.",
  "Ready-to-run work with a fixed brief, a known output, and a sample you can open first.":
    "Sofort startklare Aufgaben mit festem Briefing, bekanntem Output und einem Beispiel, das Sie vorab öffnen können.",
  "The teams behind the coworkers on the marketplace, with everything they ship in one place.":
    "Die Teams hinter den Coworkern auf dem Marktplatz – mit allem, was sie liefern, an einem Ort.",
  "What it looks like": "So sieht es aus",
  "Four views of the same working day: the roster, the briefing bar, the task board, and the channel your coworkers answer in.":
    "Vier Ansichten desselben Arbeitstags: das Roster, die Briefing-Leiste, das Task Board und der Channel, in dem Ihre Coworker antworten.",
  "Start with one task": "Starten Sie mit einem Task",
  "Brief a coworker today and see what comes back.":
    "Briefen Sie noch heute einen Coworker und sehen Sie, was zurückkommt.",

  // ---- legal.js ----
  "Legal | Sokosumi": "Rechtliches | Sokosumi",
  "Terms of Service, Privacy Policy, Cookie Policy, data processing agreements, acceptable use, and the imprint for Sokosumi.":
    "Terms of Service, Privacy Policy, Cookie Policy, Datenverarbeitungsverträge, Acceptable Use und das Impressum von Sokosumi.",
  "Terms, privacy and the small print": "AGB, Datenschutz und das Kleingedruckte",
  "The agreements that govern Sokosumi, published in full.":
    "Die Vereinbarungen, die für Sokosumi gelten – vollständig veröffentlicht. Die Dokumente selbst liegen derzeit auf Englisch vor.",
  "The agreement for using Sokosumi, and for selling agentic services on it.":
    "Die Vereinbarung für die Nutzung von Sokosumi und den Verkauf agentischer Services darauf.",
  "What personal data Sokosumi processes, why, and the rights you have over it.":
    "Welche personenbezogenen Daten Sokosumi verarbeitet, warum – und welche Rechte Sie daran haben.",
  "The cookies Sokosumi sets, what each one is for, and how to control them.":
    "Welche Cookies Sokosumi setzt, wofür jedes einzelne da ist und wie Sie sie steuern.",
  "Data processing agreements for the agents on the marketplace, one per agent.":
    "Datenverarbeitungsverträge für die Agents auf dem Marktplatz, einer pro Agent.",
  "What agentic services on Sokosumi may and may not be used for.":
    "Wofür agentische Services auf Sokosumi genutzt werden dürfen – und wofür nicht.",
  "Company details and the legally responsible entity behind Sokosumi.":
    "Unternehmensangaben und die rechtlich verantwortliche Gesellschaft hinter Sokosumi.",
  "Legal documents": "Rechtsdokumente",
};

// ── the German homepage ──────────────────────────────────────────────────
// index.html is a hand-tuned static file; its German version is produced by
// exact-string replacement at serve time (server.js serveIndex), so the two
// locales can never structurally drift. Every pair below matches the file
// verbatim — if index.html copy changes, the English side here must change
// with it or that string simply stays English (never breaks the page).
const HOME_DE = [
  // <head>
  ['<html lang="en">', '<html lang="de">'],
  [
    "Sokosumi | AI Coworkers for your marketing team",
    "Sokosumi | AI Coworkers für Ihr Marketingteam",
  ],
  [
    "Hire AI coworkers and run template marketing tasks on Sokosumi. A marketplace for marketing work that arrives as a file. Built by Serviceplan Group.",
    "Stellen Sie AI Coworker ein und starten Sie Template-Marketing-Tasks auf Sokosumi. Ein Marktplatz für Marketingarbeit, die als Datei ankommt. Entwickelt von der Serviceplan Group.",
  ],
  ['<meta property="og:url" content="https://www.sokosumi.com/" />', '<meta property="og:url" content="https://www.sokosumi.com/de" />'],
  ['<meta property="og:locale" content="en_US" />', '<meta property="og:locale" content="de_DE" />\n    <meta property="og:locale:alternate" content="en_US" />'],
  ["Sokosumi, AI coworkers for marketing teams", "Sokosumi, AI Coworker für Marketingteams"],
  ['"inLanguage":"en"', '"inLanguage":"de"'],

  // skip link + hero
  [">Skip to content</a>", ">Zum Inhalt springen</a>"],
  ["AI Coworkers for <span", "AI Coworkers für <span"],
  [
    "Brief an AI coworker and what comes back is a finished file, not a chat log.",
    "Briefen Sie einen AI Coworker – zurück kommt eine fertige Datei, kein Chatverlauf.",
  ],
  [">Talk to Sales</a>", ">Vertrieb kontaktieren</a>"],
  [">Sign Up</a>", ">Registrieren</a>"],
  ["*No Credit Card required", "*Keine Kreditkarte erforderlich"],
  ['aria-label="Pause background video"', 'aria-label="Hintergrundvideo pausieren"'],
  [">On desks at</span>", ">Im Einsatz bei</span>"],

  // roster section
  [">From the live roster</span>", ">Aus dem Live-Roster</span>"],
  [
    "These are your <span class=\"serif-accent\">AI coworkers</span>",
    "Das sind Ihre <span class=\"serif-accent\">AI Coworkers</span>",
  ],
  [
    "Named specialists, each with a public profile and a role. Serviceplan Group and utxo AG both have coworkers here, and other vendors do too. A lot of them ship template tasks you can run; some list Claude or Mistral, and a few don't name a model at all.",
    "Benannte Spezialisten, jeder mit öffentlichem Profil und Rolle. Die Serviceplan Group und die utxo AG haben hier Coworker, andere Anbieter ebenfalls. Viele bringen Template-Tasks mit, die Sie ausführen können; einige nennen Claude oder Mistral, ein paar geben gar kein Modell an.",
  ],
  ["Loading coworkers…", "Coworker werden geladen …"],

  // how it works
  [
    "You write one briefing. <span class=\"serif-accent\">They do the rest.</span>",
    "Sie schreiben ein Briefing. <span class=\"serif-accent\">Den Rest erledigen sie.</span>",
  ],
  [
    "A lead coworker can break the brief up and send pieces out. What you get back is files.",
    "Ein Lead-Coworker kann das Briefing aufteilen und Teile weitergeben. Zurück kommen Dateien.",
  ],
  [">Your briefing</span>", ">Ihr Briefing</span>"],
  [">New briefing</span>", ">Neues Briefing</span>"],
  ["Summer product line launch", "Launch der Sommer-Produktlinie"],
  [
    "Who is this for, and what does the July campaign say first?",
    "Für wen ist das – und was sagt die Juli-Kampagne zuerst?",
  ],
  [">Assignee</span>", ">Zuständig</span>"],
  ["Elena, lead strategist", "Elena, Lead-Strategin"],
  [">Attachment</span>", ">Anhang</span>"],
  ["Send briefing <svg", "Briefing senden <svg"],
  [
    "You file one ticket and skip the setup forms; the lead coworker takes it from there.",
    "Sie geben ein Ticket auf und sparen sich die Einrichtungsformulare; der Lead-Coworker übernimmt ab dort.",
  ],
  [">Split &amp; delegated</span>", ">Aufgeteilt &amp; delegiert</span>"],
  [">Delegated</span>", ">Delegiert</span>"],
  ["splits the brief into work packages", "teilt das Briefing in Arbeitspakete auf"],
  [">Audience research</span>", ">Zielgruppen-Research</span>"],
  [">Social rollout</span>", ">Social-Rollout</span>"],
  [">Campaign dashboard</span>", ">Kampagnen-Dashboard</span>"],
  [
    "Elena hands the packages to the people who do that work, and they run at the same time.",
    "Elena übergibt die Pakete an die Spezialisten für genau diese Arbeit – und sie laufen gleichzeitig.",
  ],
  [">Files back</span>", ">Dateien zurück</span>"],
  [">Done</span>", ">Fertig</span>"],
  [">Audience report</span>", ">Zielgruppen-Report</span>"],
  [">Campaign strategy</span>", ">Kampagnenstrategie</span>"],
  [">Live dashboard</span>", ">Live-Dashboard</span>"],
  ["Ready to review", "Bereit zur Durchsicht"],
  [
    "You get files, not a chat log. Most tasks already show a sample so you can see the shape of the output before you spend credits.",
    "Sie bekommen Dateien, keinen Chatverlauf. Die meisten Tasks zeigen vorab ein Beispiel, sodass Sie die Form des Ergebnisses sehen, bevor Sie Credits einsetzen.",
  ],

  // product carousel
  [
    "A look inside <span class=\"serif-accent\">Sokosumi</span>",
    "Ein Blick in <span class=\"serif-accent\">Sokosumi</span>",
  ],
  [
    "A roster of named specialists and a board that shows who picked up what.",
    "Ein Roster benannter Spezialisten und ein Board, das zeigt, wer was übernommen hat.",
  ],
  [
    "The roster. Names, roles, a profile. If a coworker lists models or a hosting region, that is where they show up.",
    "Das Roster. Namen, Rollen, ein Profil. Wenn ein Coworker Modelle oder eine Hosting-Region angibt, stehen sie hier.",
  ],
  [
    "Start from the job. Type what you want done and the bar points at coworkers who do that kind of work.",
    "Starten Sie bei der Aufgabe. Tippen Sie ein, was erledigt werden soll, und die Leiste zeigt auf Coworker, die genau das tun.",
  ],
  [
    "A task on the board shows who has it and whether it is running, waiting on you, or done.",
    "Ein Task auf dem Board zeigt, wer ihn hat und ob er läuft, auf Sie wartet oder fertig ist.",
  ],
  [
    "Mention a coworker in the channel and it answers in the same thread as everyone else.",
    "Erwähnen Sie einen Coworker im Channel, und er antwortet im selben Thread wie alle anderen.",
  ],
  ['aria-label="Previous screenshot"', 'aria-label="Vorheriger Screenshot"'],
  ['aria-label="Next screenshot"', 'aria-label="Nächster Screenshot"'],

  // trust band
  [
    "Built by Serviceplan&nbsp;Group in <span class=\"serif-accent\">Munich</span>.",
    "Entwickelt von der Serviceplan&nbsp;Group in <span class=\"serif-accent\">München</span>.",
  ],
  [
    "Serviceplan Group builds and runs Sokosumi. Their strategists write the Serviceplan coworkers on the roster; other vendors write theirs.",
    "Die Serviceplan Group entwickelt und betreibt Sokosumi. Ihre Strategen schreiben die Serviceplan-Coworker im Roster; andere Anbieter schreiben ihre eigenen.",
  ],
  ["Visit Serviceplan Agents", "Serviceplan Agents besuchen"],

  // org chart
  [
    "They report to <span class=\"serif-accent\">your team</span>",
    "Sie berichten an <span class=\"serif-accent\">Ihr Team</span>",
  ],
  [
    "Coworkers are not a replacement for your people. They sit under someone you already have and send the work back for review.",
    "Coworker ersetzen Ihre Leute nicht. Sie arbeiten jemandem zu, den Sie bereits haben, und geben die Arbeit zur Durchsicht zurück.",
  ],
  ['<span class="org-ava">You</span>', '<span class="org-ava">Sie</span>'],
  ["<strong>You</strong><small>Head of Marketing</small>", "<strong>Sie</strong><small>Head of Marketing</small>"],
  ["<strong>Lena</strong><small>Brand &amp; Strategy</small>", "<strong>Lena</strong><small>Brand &amp; Strategie</small>"],
  ["<strong>Elena</strong><small>Strategy</small>", "<strong>Elena</strong><small>Strategie</small>"],

  // FAQ (each string exists twice — in the HTML and in the FAQPage JSON-LD —
  // and both must say the same thing, so plain replaceAll is exactly right)
  [
    "Questions we <span class=\"serif-accent\">get</span>",
    "Fragen, die wir <span class=\"serif-accent\">oft hören</span>",
  ],
  ["What is Sokosumi?", "Was ist Sokosumi?"],
  [
    "Sokosumi is a marketplace where you hire AI coworkers for marketing work. A coworker has a name, a role, and a vendor. You brief it the way you'd brief a colleague, and it sends back a file: a PDF, a Word doc, a slide deck, a dashboard.",
    "Sokosumi ist ein Marktplatz, auf dem Sie AI Coworker für Marketingarbeit einstellen. Ein Coworker hat einen Namen, eine Rolle und einen Anbieter. Sie briefen ihn wie eine Kollegin oder einen Kollegen, und er schickt eine Datei zurück: ein PDF, ein Word-Dokument, ein Slide-Deck, ein Dashboard.",
  ],
  ["How is this different from a chatbot?", "Was unterscheidet das von einem Chatbot?"],
  [
    "A chatbot answers in the window you're already in. A coworker can take a brief, split it, pass pieces to other coworkers, and return files. Most of the roster ships template tasks, and most of those tasks include a sample so you can see the output before you run them.",
    "Ein Chatbot antwortet in dem Fenster, in dem Sie ohnehin gerade sind. Ein Coworker kann ein Briefing annehmen, aufteilen, Teile an andere Coworker weitergeben und Dateien zurückliefern. Der Großteil des Rosters bringt Template-Tasks mit, und die meisten davon enthalten ein Beispiel, sodass Sie das Ergebnis sehen, bevor Sie sie ausführen.",
  ],
  ["Who builds the coworkers?", "Wer entwickelt die Coworker?"],
  [
    "A named vendor builds and runs every coworker. Serviceplan Group writes its own set; utxo AG writes another; other vendors are on the marketplace too. Every coworker has a public profile. Most profiles name the models, Claude and Mistral among them.",
    "Jeder Coworker wird von einem benannten Anbieter entwickelt und betrieben. Die Serviceplan Group schreibt ein eigenes Set; die utxo AG ein weiteres; auch andere Anbieter sind auf dem Marktplatz. Jeder Coworker hat ein öffentliches Profil. Die meisten Profile nennen die Modelle, darunter Claude und Mistral.",
  ],
  ["What do the template tasks cover?", "Was decken die Template-Tasks ab?"],
  [
    "Research, social, planning, writing, engineering, and prototyping. Open a task and you'll see the brief and the deliverable. Most of them include a sample you can look at before you run the task on your own brief.",
    "Research, Social, Planung, Texte, Engineering und Prototyping. Öffnen Sie einen Task, und Sie sehen das Briefing und das Ergebnis. Die meisten enthalten ein Beispiel, das Sie sich ansehen können, bevor Sie den Task mit Ihrem eigenen Briefing ausführen.",
  ],
  ["How much does it cost?", "Was kostet das?"],
  [
    "The free plan is 250 credits per seat. Paid plans start at €25 a month for 1,500 credits per seat. Enterprise is quoted. The pricing page lists what sits in each plan.",
    "Der kostenlose Plan umfasst 250 Credits pro Seat. Bezahlte Pläne beginnen bei 25 € im Monat für 1.500 Credits pro Seat. Enterprise wird individuell angeboten. Die Preisseite listet, was in jedem Plan steckt.",
  ],

  // CEO quote (the original statement is German-market copy; this is the
  // published German wording of the same claim, not an invention)
  [
    "Sokosumi complements and connects our established agency offerings. Agentic services enable interaction, and with it the thread that ties together all of our AI applications and services.",
    "Sokosumi ergänzt und verbindet unsere etablierten Agenturangebote. Agentische Services ermöglichen Interaktion – und damit den roten Faden, der alle unsere KI-Anwendungen und -Services zusammenhält.",
  ],
  ["<small>CEO, Serviceplan Group</small>", "<small>CEO, Serviceplan Group</small>"],

  // inline script strings (visible UI text only)
  ['"+ Agents"', '"+ Agents"'],
  ["The live marketplace is unreachable right now.", "Der Live-Marktplatz ist gerade nicht erreichbar."],
  ["'<span class=\"label\">Meet all '", "'<span class=\"label\">Alle '"],
  ['" AI Coworkers" +', '" AI Coworkers kennenlernen" +'],
];

function translateHomepage(html) {
  let out = html;
  for (const [en, de] of HOME_DE) {
    if (en === de) continue;
    out = out.split(en).join(de);
  }
  return out;
}

// German is SERVED but not yet INDEXED. The UI layer is translated; the CMS
// bodies (use-case/page/comparison `layout`, and every Offers field) are not
// localizable yet, so /de pages still render English content. Advertising
// those to Google as hreflang="de" invites a thin-duplicate judgement on the
// English originals that actually rank. So: /de is reachable, excluded from
// the sitemap, and noindex — until the content lands. Flip this ONE constant
// to true when the CMS translation is done, and hreflang + sitemap light up
// together.
const DE_INDEXABLE = false;

module.exports = {
  run,
  DE_INDEXABLE,
  store,
  locale,
  currentPath,
  prefix,
  localizePath,
  localizeHtml,
  translateHomepage,
  t,
  tp,
  LOCALES,
  DEFAULT_LOCALE,
  DE,
};

// Per-coworker SEO enrichment, keyed by slug.
//
// The coworker profiles are built from the nightly catalog sync: name, role,
// description, portrait, credits and runs all arrive from the product, and the
// page around them is one template shared by 50+ pages. That is the right
// default — a new agent appears overnight with a working page and nobody has to
// write anything — but it means every page is named after the SKU rather than
// after anything a person searches for, and every heading on it is scaffolding.
//
// `/ai-coworkers/youtube-channel-analysis` is the case in point: 240 GSC
// impressions in a week from position 64.6, on a query (`youtube channel
// analyzer`, KD 3, no SERP features) that nothing was structurally blocking.
// Its <title> was "YouTube Channel Analysis | AI coworker on Sokosumi" — the
// product name, which nobody types.
//
// This file is the layer that fixes that WITHOUT taking the automation away.
// Three rules make that true:
//
//   1. Additive only. A slug with no entry here renders exactly as it does
//      today. Adding a coworker never requires touching this file.
//   2. The CMS still wins. Anything an editor writes in the CMS (seoTitle when
//      that field exists, seoDescription, longBio) takes precedence over the
//      value here, so this never fights a human.
//   3. Named slots. An entry may only fill slots the template knows about. It
//      cannot restructure a page, so one bad entry cannot break the others.
//
// Same idea as templates/serviceplanFigures.js — template-owned data keyed by
// slug — and it replaces the hardcoded `slug === "instagram-page-analysis"`
// ternary that used to sit inline in the title of templates/coworkers.js.
//
// Only add an entry where keyword research says a real query exists. There are
// 53 of these pages averaging position 36; enriching all of them would just be
// 53 doorway pages. Enrich the handful that can win.

const BOOST = {
  "youtube-channel-analysis": {
    // The query is "youtube channel analyzer" (200 US / 1.1K global, KD 3),
    // not the product's name.
    seoTitle: {
      en: "YouTube channel analyzer: free metrics from any public channel | Sokosumi",
      de: "YouTube-Kanal-Analyzer: Kennzahlen für jeden öffentlichen Kanal | Sokosumi",
    },
    seoDescription: {
      en: "A YouTube channel analyzer that reads a public channel's 30 most recent videos and returns views, engagement, posting cadence and title patterns as a file you can hand on.",
      de: "Ein YouTube-Kanal-Analyzer, der die 30 neuesten Videos eines öffentlichen Kanals ausliest und Views, Engagement, Posting-Rhythmus und Titelmuster als fertige Datei zurückgibt.",
    },
    // Replaces the templated "What {name} does" heading, which carries no
    // keyword surface at all.
    aboutHeading: {
      en: "What the YouTube channel analyzer measures",
      de: "Was der YouTube-Kanal-Analyzer misst",
    },
    intro: {
      en: "Point it at any public YouTube channel and it pulls the 30 most recent uploads by default, reads the performance signals off them, and writes the result to a file. Ask for more and it takes more. No login to the channel, no API key of your own, nothing to install — it reads what YouTube already shows publicly.",
      de: "Auf einen beliebigen öffentlichen YouTube-Kanal richten: Er liest standardmäßig die 30 neuesten Uploads, wertet ihre Performance-Signale aus und schreibt das Ergebnis in eine Datei. Auf Wunsch auch mehr. Kein Kanal-Login, kein eigener API-Key, nichts zu installieren — er liest nur, was YouTube ohnehin öffentlich zeigt.",
    },
    // A real table of what comes back. This is the substance the templated
    // page was missing; it is also the part most likely to be quoted by an
    // AI Overview, which is how a page at KD 3 gets pulled onto page one.
    spec: {
      heading: { en: "What comes back", de: "Was zurückkommt" },
      columns: [{ en: "Signal", de: "Signal" }, { en: "What you get", de: "Was Sie bekommen" }],
      rows: [
        [{ en: "Reach", de: "Reichweite" }, { en: "View count per video across the uploads analysed, plus the channel's median", de: "Views pro Video über die ausgewerteten Uploads, dazu der Median des Kanals" }],
        [{ en: "Engagement", de: "Engagement" }, { en: "Likes and comments per video, and each as a rate against views", de: "Likes und Kommentare pro Video, jeweils auch als Rate gegen die Views" }],
        [{ en: "Cadence", de: "Rhythmus" }, { en: "Days between uploads, and whether the gap is widening or tightening", de: "Tage zwischen den Uploads und ob der Abstand größer oder kleiner wird" }],
        [{ en: "Titles", de: "Titel" }, { en: "Recurring words, lengths and formats in the titles that performed best", de: "Wiederkehrende Wörter, Längen und Formate in den erfolgreichsten Titeln" }],
        [{ en: "Formats", de: "Formate" }, { en: "Long-form against Shorts, and how each performs on this channel", de: "Long-Form gegen Shorts und wie beide auf diesem Kanal abschneiden" }],
        [{ en: "Outliers", de: "Ausreißer" }, { en: "The uploads well above and well below the channel's own median", de: "Die Uploads deutlich über und deutlich unter dem Median des Kanals" }],
      ],
    },
    faq: [
      {
        question: { en: "What does a YouTube channel analyzer do?", de: "Was macht ein YouTube-Kanal-Analyzer?" },
        answer: {
          en: "It reads the public data on a channel — recent uploads, views, likes, comments, titles and upload dates — and turns it into a summary you can act on: what is working, how often they post, and which videos beat the channel's own average. This one covers the 30 most recent uploads by default, on any public channel, and takes a higher number if you ask for one.",
          de: "Er liest die öffentlichen Daten eines Kanals — aktuelle Uploads, Views, Likes, Kommentare, Titel und Veröffentlichungsdaten — und macht daraus eine Zusammenfassung, mit der sich arbeiten lässt: was funktioniert, wie oft veröffentlicht wird und welche Videos über dem Schnitt des Kanals liegen. Dieser hier deckt standardmäßig die 30 neuesten Uploads jedes öffentlichen Kanals ab — auf Wunsch auch mehr.",
        },
      },
      {
        question: { en: "Do I need access to the channel to analyse it?", de: "Brauche ich Zugang zum Kanal?" },
        answer: {
          en: "No. It only reads what YouTube already shows publicly, so you can point it at a competitor's channel as easily as your own. There is nothing to connect and no API key to supply.",
          de: "Nein. Er liest nur, was YouTube ohnehin öffentlich zeigt — der Kanal eines Wettbewerbers geht also genauso wie der eigene. Es gibt nichts zu verbinden und keinen API-Key anzugeben.",
        },
      },
      {
        question: { en: "Can I analyse a competitor's YouTube channel?", de: "Kann ich den YouTube-Kanal eines Wettbewerbers analysieren?" },
        answer: {
          en: "Yes, and that is the common use. Run it on two or three channels in your category and the comparison shows you posting cadence, which formats earn engagement, and the title patterns that travel.",
          de: "Ja, und das ist der häufigste Fall. Über zwei oder drei Kanäle der eigenen Kategorie laufen lassen: Der Vergleich zeigt Posting-Rhythmus, welche Formate Engagement bringen und welche Titelmuster tragen.",
        },
      },
      {
        question: { en: "How many videos does it analyse?", de: "Wie viele Videos wertet er aus?" },
        answer: {
          en: "Thirty of the most recent uploads by default, and you can ask for more in the brief. Thirty is enough to show a channel's current pattern without averaging in a strategy it abandoned two years ago. Channels with fewer than ten videos give low-confidence results.",
          de: "Standardmäßig die 30 neuesten Uploads, im Briefing lassen sich mehr anfordern. Dreißig reichen, um das aktuelle Muster eines Kanals zu zeigen, ohne eine vor zwei Jahren aufgegebene Strategie mit einzurechnen. Kanäle mit weniger als zehn Videos liefern wenig belastbare Ergebnisse.",
        },
      },
      {
        question: { en: "What do I get back — a dashboard or a file?", de: "Was bekomme ich zurück — ein Dashboard oder eine Datei?" },
        answer: {
          en: "A file. The task runs on a shared board and comes back as a document you can put in front of a client or paste into a deck. There is no dashboard to log into and no seat to keep paying for.",
          de: "Eine Datei. Die Aufgabe läuft auf einem gemeinsamen Board und kommt als Dokument zurück, das direkt zum Kunden oder in eine Präsentation kann. Kein Dashboard zum Einloggen und kein Seat, der weiterläuft.",
        },
      },
      {
        question: { en: "What does it cost to run?", de: "Was kostet ein Lauf?" },
        answer: {
          en: "It is priced per run in credits, shown on this page before you start, and the free plan includes credits — so the first runs cost nothing. You only spend on work you actually run.",
          de: "Der Preis gilt pro Lauf in Credits und steht auf dieser Seite, bevor Sie starten. Der kostenlose Plan enthält Credits, die ersten Läufe kosten also nichts. Bezahlt wird nur, was tatsächlich läuft.",
        },
      },
    ],
    // Hand-picked internal links. The templated "More in {category}" rail is
    // ordered by the catalog, so it rarely points anywhere related.
    related: [
      { href: "/ai-coworkers/instagram-page-analysis", label: { en: "Instagram page analysis", de: "Instagram-Seitenanalyse" }, note: { en: "The same read, for Instagram", de: "Dieselbe Auswertung für Instagram" } },
      { href: "/ai-coworkers", label: { en: "All AI coworkers", de: "Alle KI-Mitarbeiter" }, note: { en: "The full marketplace", de: "Der komplette Marktplatz" } },
      { href: "/use-cases", label: { en: "Use cases", de: "Use Cases" }, note: { en: "What teams run this alongside", de: "Womit Teams das kombinieren" } },
    ],
  },

  "instagram-page-analysis": {
    // Was a hardcoded ternary in templates/coworkers.js. Same value, now
    // sitting where the rest of the overrides live.
    seoTitle: "Instagram analyzer for posts and pages | Sokosumi",
  },

  "seo-geo-researcher": {
    // The query is "ai seo agent" (400 US, KD 0, 2026-09-12). The listing
    // audits organic rankings AND AI-answer visibility, which is exactly
    // what that searcher wants and what the product name doesn't say.
    seoTitle: {
      en: "AI SEO agent: rankings, content gaps, AI visibility | Sokosumi",
      de: "KI-SEO-Agent: Rankings, Content-Lücken, KI-Sichtbarkeit | Sokosumi",
    },
    aboutHeading: {
      en: "What this AI SEO agent audits",
      de: "Was dieser KI-SEO-Agent prüft",
    },
    intro: {
      en: "Give it a domain and a topic and it audits where the site stands in Google and in AI answers: keyword clusters with performance per cluster, content gaps against competitors, and whether ChatGPT and AI Overviews mention the brand at all. It runs on any industry and any DataForSEO-supported market, and comes back as a report, not a dashboard.",
      de: "Domain und Thema angeben, und er prüft, wo die Website in Google und in KI-Antworten steht: Keyword-Cluster mit Performance pro Cluster, Content-Lücken gegenüber Wettbewerbern und ob ChatGPT und AI Overviews die Marke überhaupt erwähnen. Er läuft für jede Branche und jeden von DataForSEO abgedeckten Markt — und liefert einen Report, kein Dashboard.",
    },
    faq: [
      {
        question: { en: "What is an AI SEO agent?", de: "Was ist ein KI-SEO-Agent?" },
        answer: {
          en: "Software that runs an SEO analysis on its own from a brief: it pulls ranking data, clusters keywords, compares competitors and writes up where a domain should invest next. This one also checks visibility in AI answers — brand mentions in LLM responses and AI Overview presence — which a classic rank tracker doesn't see.",
          de: "Software, die eine SEO-Analyse eigenständig nach Briefing durchführt: Sie zieht Ranking-Daten, clustert Keywords, vergleicht Wettbewerber und schreibt auf, wo eine Domain als Nächstes investieren sollte. Dieser hier prüft zusätzlich die Sichtbarkeit in KI-Antworten — Markennennungen in LLM-Antworten und AI-Overview-Präsenz — was ein klassischer Rank-Tracker nicht sieht.",
        },
      },
      {
        question: { en: "What do I need to provide?", de: "Was muss ich liefern?" },
        answer: {
          en: "Either a domain plus topic keywords, or a list of up to 100 URLs as CSV or Excel. Competitor domains are auto-discovered if you don't name them.",
          de: "Entweder eine Domain plus Themen-Keywords oder eine Liste von bis zu 100 URLs als CSV oder Excel. Wettbewerber-Domains findet er selbst, wenn Sie keine nennen.",
        },
      },
      {
        question: { en: "What does a run cost?", de: "Was kostet ein Lauf?" },
        answer: {
          en: "The credit price is on this page before you start. A full audit is a deep run, so it costs more credits than the free plan's monthly allowance covers on its own — the free credits offset part of it. You pay per run, not per seat.",
          de: "Der Credit-Preis steht auf dieser Seite, bevor Sie starten. Ein vollständiges Audit ist ein tiefer Lauf und kostet mehr Credits, als das Monatsguthaben des Gratis-Plans allein abdeckt — die freien Credits senken den Preis anteilig. Bezahlt wird pro Lauf, nicht pro Seat.",
        },
      },
    ],
    related: [
      { href: "/ai-coworkers/page-ranking-insights", label: { en: "Page ranking insights", de: "Page Ranking Insights" }, note: { en: "The quick spot-check version", de: "Die schnelle Stichprobe" } },
      { href: "/tools/llms-txt", label: { en: "llms.txt checker", de: "llms.txt-Checker" }, note: { en: "Free tool for AI-search readiness", de: "Kostenloses Tool für AI-Search-Readiness" } },
      { href: "/ai-coworkers", label: { en: "All AI coworkers", de: "Alle KI-Mitarbeiter" }, note: { en: "The full marketplace", de: "Der komplette Marktplatz" } },
    ],
  },

  "company-researcher": {
    // The query is "ai competitor analysis" (200 US, KD 12, 2026-09-12).
    // The listing's own copy leads with due-diligence profiles; the
    // competitive-landscape section is the part that query wants surfaced.
    seoTitle: {
      en: "AI competitor analysis and company research | Sokosumi",
      de: "KI-Wettbewerbsanalyse und Unternehmens-Research | Sokosumi",
    },
    aboutHeading: {
      en: "What comes back from a company or competitor run",
      de: "Was ein Unternehmens- oder Wettbewerber-Lauf zurückliefert",
    },
    intro: {
      en: "Give it a company's name, website, industry and headquarters, and it researches the public record: products and business model, leadership, market position, financials from public filings, recent moves — and the competitive landscape around it. The result is a structured report with source citations you can hand to a client or paste into a deck. Run it on your own company's competitors one at a time to build a competitor file that is actually sourced.",
      de: "Name, Website, Branche und Hauptsitz eines Unternehmens angeben, und er recherchiert die öffentliche Faktenlage: Produkte und Geschäftsmodell, Führung, Marktposition, Finanzkennzahlen aus öffentlichen Quellen, jüngste Schritte — und das Wettbewerbsumfeld darum herum. Das Ergebnis ist ein strukturierter Report mit Quellenangaben, der direkt zum Kunden oder in eine Präsentation kann. Auf die eigenen Wettbewerber einzeln angewendet, entsteht eine Wettbewerber-Akte, die wirklich belegt ist.",
    },
    faq: [
      {
        question: { en: "Can AI do competitor analysis?", de: "Kann KI eine Wettbewerbsanalyse erstellen?" },
        answer: {
          en: "For the research half, yes: collecting what is publicly known about a competitor — offering, positioning, leadership, financial signals — and writing it up with sources. What it does not replace is deciding what your team should do about it; the report ends where your strategy starts.",
          de: "Für die Research-Hälfte ja: sammeln, was über einen Wettbewerber öffentlich bekannt ist — Angebot, Positionierung, Führung, Finanzsignale — und es mit Quellen aufschreiben. Was sie nicht ersetzt: die Entscheidung, was Ihr Team daraus macht. Der Report endet, wo Ihre Strategie beginnt.",
        },
      },
      {
        question: { en: "Where does the information come from?", de: "Woher stammen die Informationen?" },
        answer: {
          en: "Public sources only — company sites, filings, news, directories — and every claim in the report carries its citation, so you can check anything before it goes in front of a client.",
          de: "Nur aus öffentlichen Quellen — Unternehmensseiten, Pflichtveröffentlichungen, Nachrichten, Verzeichnisse — und jede Aussage im Report trägt ihre Quelle, sodass sich alles prüfen lässt, bevor es zum Kunden geht.",
        },
      },
      {
        question: { en: "What does a run cost?", de: "Was kostet ein Lauf?" },
        answer: {
          en: "The credit price is shown on this page before you start — currently a fraction of an hour of anyone's time — and the free plan includes credits for the first runs.",
          de: "Der Credit-Preis steht auf dieser Seite, bevor Sie starten — aktuell ein Bruchteil einer Arbeitsstunde — und der kostenlose Plan enthält Credits für die ersten Läufe.",
        },
      },
    ],
    related: [
      { href: "/ai-coworkers/website-traffic-analysis", label: { en: "Website traffic analysis", de: "Website-Traffic-Analyse" }, note: { en: "The traffic side of a competitor file", de: "Die Traffic-Seite der Wettbewerber-Akte" } },
      { href: "/ai-coworkers/statista-research", label: { en: "Statista research", de: "Statista-Research" }, note: { en: "Sourced market statistics", de: "Belegte Marktstatistiken" } },
      { href: "/ai-coworkers", label: { en: "All AI coworkers", de: "Alle KI-Mitarbeiter" }, note: { en: "The full marketplace", de: "Der komplette Marktplatz" } },
    ],
  },

  "pheme-beta": {
    // The query is "ai social media manager" (900 US, KD 0, 2026-09-12).
    // Pheme is in beta and posts to connected personal X and LinkedIn
    // profiles only — the title and intro say so before anything else, so
    // the page earns the query without overclaiming (see the file header:
    // the limits stay above the fold or the entry comes out).
    seoTitle: {
      en: "AI social media manager for X and LinkedIn (beta) | Sokosumi",
      de: "KI-Social-Media-Manager für X und LinkedIn (Beta) | Sokosumi",
    },
    aboutHeading: {
      en: "What Pheme does, and what it doesn't yet",
      de: "Was Pheme kann — und was noch nicht",
    },
    intro: {
      en: "Pheme drafts social posts and schedules them to the personal X or LinkedIn profiles you connect. That is the current scope, and it is in beta: no company pages yet, no Instagram or TikTok, no community management. Within that scope it works like a coworker — brief it on your topics and tone, review the drafts, and let it keep the calendar filled.",
      de: "Pheme entwirft Social-Media-Posts und plant sie auf den persönlichen X- oder LinkedIn-Profilen ein, die Sie verbinden. Das ist der aktuelle Umfang, und er ist Beta: noch keine Unternehmensseiten, kein Instagram oder TikTok, kein Community-Management. Innerhalb dieses Rahmens arbeitet Pheme wie ein Mitarbeiter — Themen und Tonalität briefen, Entwürfe prüfen, Kalender gefüllt halten.",
    },
    faq: [
      {
        question: { en: "What does an AI social media manager do?", de: "Was macht ein KI-Social-Media-Manager?" },
        answer: {
          en: "The recurring half of the job: turning your topics into drafts, keeping a posting schedule, and adapting tone per channel. Pheme covers that for personal X and LinkedIn profiles today. Strategy, community replies and paid social stay with you.",
          de: "Die wiederkehrende Hälfte des Jobs: aus Ihren Themen Entwürfe machen, einen Posting-Plan einhalten und die Tonalität pro Kanal anpassen. Pheme deckt das heute für persönliche X- und LinkedIn-Profile ab. Strategie, Community-Antworten und Paid Social bleiben bei Ihnen.",
        },
      },
      {
        question: { en: "Which platforms does Pheme support?", de: "Welche Plattformen unterstützt Pheme?" },
        answer: {
          en: "Connected personal X and LinkedIn profiles, in beta. Company pages and other networks are not supported yet — if you need those today, Pheme is not the right hire yet.",
          de: "Verbundene persönliche X- und LinkedIn-Profile, im Beta-Stadium. Unternehmensseiten und andere Netzwerke werden noch nicht unterstützt — wer das heute braucht, für den ist Pheme noch nicht die richtige Wahl.",
        },
      },
      {
        question: { en: "What does the beta label mean?", de: "Was bedeutet das Beta-Label?" },
        answer: {
          en: "That the scope is still moving. What is supported today: drafting posts and scheduling them to connected personal X and LinkedIn profiles. Check the listing for what has been added since.",
          de: "Dass der Umfang sich noch bewegt. Heute unterstützt: Posts entwerfen und auf verbundenen persönlichen X- und LinkedIn-Profilen einplanen. Was seither dazugekommen ist, zeigt das Listing.",
        },
      },
    ],
    related: [
      { href: "/ai-coworkers/instagram-page-analysis", label: { en: "Instagram page analysis", de: "Instagram-Seitenanalyse" }, note: { en: "Research a channel before you post to it", de: "Kanal analysieren, bevor Sie posten" } },
      { href: "/ai-coworkers/youtube-channel-analysis", label: { en: "YouTube channel analyzer", de: "YouTube-Kanal-Analyzer" }, note: { en: "The same read, for YouTube", de: "Dieselbe Auswertung für YouTube" } },
      { href: "/ai-coworkers", label: { en: "All AI coworkers", de: "Alle KI-Mitarbeiter" }, note: { en: "The full marketplace", de: "Der komplette Marktplatz" } },
    ],
  },
};

// Any string in an entry may instead be an { en, de } object. Germany is the
// site's largest market by impressions and /de carries a quarter of them, so an
// overlay that only spoke English would have put English headings on the German
// page — which is exactly what the first version of this did.
//
// A missing locale falls back to English rather than to the generated default,
// because a hand-written English heading still beats a templated one.
function pick(value, locale) {
  if (value == null) return value;
  if (typeof value !== "object" || Array.isArray(value)) return value;
  if (!("en" in value || "de" in value)) return value;
  return value[locale] ?? value.en ?? "";
}

// Walk one level into the shapes an entry can hold (strings, the spec table,
// the FAQ list, the link list) resolving every localisable leaf.
function localise(entry, locale) {
  const out = {};
  for (const [key, value] of Object.entries(entry)) {
    if (key === "faq" && Array.isArray(value)) {
      out.faq = value.map((f) => ({ question: pick(f.question, locale), answer: pick(f.answer, locale) }));
    } else if (key === "related" && Array.isArray(value)) {
      out.related = value.map((l) => ({ href: l.href, label: pick(l.label, locale), note: pick(l.note, locale) }));
    } else if (key === "spec" && value && typeof value === "object") {
      out.spec = {
        heading: pick(value.heading, locale),
        columns: (value.columns || []).map((h) => pick(h, locale)),
        rows: (value.rows || []).map((r) => r.map((cell) => pick(cell, locale))),
      };
    } else {
      out[key] = pick(value, locale);
    }
  }
  return out;
}

// The whole public surface. Returns an empty object for any slug with no
// entry, so callers never need to null-check.
function forSlug(slug, locale) {
  const entry = BOOST[String(slug || "")];
  return entry ? localise(entry, locale === "de" ? "de" : "en") : {};
}

const slugs = () => Object.keys(BOOST);

module.exports = { forSlug, slugs };

// German-first head-term guide (Ahrefs DE, 2026-09-27): "ki im marketing" 900,
// "ki marketing" 900, "künstliche intelligenz marketing" 250, "marketing ki"
// 250, "ki für marketing" 200, "ki agenten beispiele" 200, "ki im marketing
// beispiele" 150, plus the rising "was sind ki agenten" question. EN twin:
// "how to use ai in marketing" 1,800 / "how to use ai for marketing" 500.
// "ai agents for marketing" belongs to /ai-coworkers; this page links there
// and does not compete for it.
//
// EVIDENCE DISCIPLINE. Every example describes a live Sokosumi use case or
// listing as published on 2026-09-27 (inputs, outputs and limits taken from
// those pages). The two adoption numbers come from Destatis and Eurostat.
// The legal section quotes Regulation (EU) 2024/1689 as amended by
// Regulation (EU) 2026/1744, both read on EUR-Lex on 2026-09-27; the
// consolidated version (27 Jul 2026) is linked as the current text.
// Deliverables are attributed to the workflow pages that list them: a
// listing describes a workflow, it does not prove every run's output.
//
// Free-form body (like will-ai-replace-marketers) rather than topic():
// the page is organised by job, and each job needs its own h3.

const sources = [
  ["EUR-Lex: Regulation (EU) 2024/1689 (AI Act), Articles 4, 50 and 113", "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng"],
  ["EUR-Lex: AI Act, consolidated text as of 27 July 2026", "https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27/eng"],
  ["EUR-Lex: Regulation (EU) 2026/1744 (Digital Omnibus on AI), amending the AI Act", "https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng"],
  ["EUR-Lex: Regulation (EU) 2016/679 (GDPR), Articles 4, 5, 6 and 28", "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679"],
  ["Eurostat: Use of artificial intelligence in enterprises (2025 data)", "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Use_of_artificial_intelligence_in_enterprises"],
  ["Statistisches Bundesamt: Unternehmen mit Nutzung von Technologien der künstlichen Intelligenz (2025)", "https://www.destatis.de/DE/Themen/Branchen-Unternehmen/Unternehmen/IKT-in-Unternehmen-IKT-Branche/Tabellen/ikti-unternehmen-kuenstliche-intelligenz.html"],
];

const list = (items) => items.map(([label, url]) => `- [${label}](${url})`).join("\n");

const relatedEn = [
  ["Will AI replace marketing jobs? What's changing in 2026", "/guides/will-ai-replace-marketers"],
  ["Best AI marketing tools in 2026: 16 picks", "/guides/best-ai-marketing-tools"],
  ["Answer engine optimization (AEO): Google's own guidance", "/guides/answer-engine-optimization"],
  ["AI brand monitoring: what Google and Bing report", "/guides/ai-brand-monitoring"],
];

const relatedDe = [
  ["Ersetzt KI Marketing-Jobs? Was sich 2026 ändert", "/guides/will-ai-replace-marketers"],
  ["Die besten KI-Marketing-Tools 2026: 16 Empfehlungen", "/guides/best-ai-marketing-tools"],
  ["Answer Engine Optimization (AEO): was Google dazu schreibt", "/guides/answer-engine-optimization"],
  ["KI-Markenmonitoring: was Google und Bing auswerten", "/guides/ai-brand-monitoring"],
];

export default {
  slug: "ai-in-marketing",
  category: "advanced",
  order: 211,
  en: {
    title: "How to use AI in marketing: 11 examples by job",
    description:
      "11 marketing tasks teams hand to AI today, grouped by job: what you brief, what comes back, what a person must check. Plus the EU AI Act and GDPR rules.",
    body: [
      "Using AI in marketing rarely means \"the AI runs our campaign\". In practice, a clearly scoped task goes out with a brief, a file comes back, and someone on the team checks it before it's used. This guide walks through 11 of those tasks, grouped by job: what you put in, what you get back and where a person has to look before anything ships.",
      "The examples come from Sokosumi, a marketplace where marketing teams brief AI coworkers. We sell these tasks, so read accordingly. What each example says comes back is what the linked workflow page lists; a listing describes the workflow, it doesn't promise that every run is complete or correctly sourced.",
      "## AI adoption in businesses",
      "In 2025, 26% of German companies with ten or more employees used AI, and 57% of those with 250 or more, according to the Federal Statistical Office (Destatis). Across the EU the share was 19.95%, and 34.7% of the companies that used AI used it for marketing or sales (Eurostat). These figures cover businesses in general, not marketing teams, and they don't say which tasks work. The examples below do.",
      "## What is an AI agent?",
      "An AI agent is software that performs a defined task from a brief and returns a result, instead of waiting in a chat for your next question. An AI coworker covers a role, such as research or creative, and usually combines several agents. What's available: [AI agents for marketing](/ai-coworkers). How the coworker model works: [AI employees](/ai-employees).",
      "## 11 examples, grouped by job",
      "### Research and market analysis",
      "**Example 1: the recurring market briefing.** Leadership asks the same market questions every week, and someone starts the search from scratch every time. You set up a topic field once: markets, competitors, regulatory topics and the questions each briefing must answer. The workflow lists a short document that opens with what changed since the last run, a source for each claim and figures from the Statista database. Check the numbers at their source and the \"why this matters to us\" line before the briefing goes to a distribution list. The news research covers English-language coverage, so German trade press may be missing. Use case: [market intelligence briefings](/use-cases/market-intelligence-briefings).",
      "**Example 2: know a company before you call it.** Agencies do this before a pitch, sales teams before a first meeting. The input can be as little as a company name; the brief and the URLs you want assessed make it sharper. The workflow lists a document on market, competition and positioning, plus the prospect's current Meta ads and named weak spots on its website. Verify each fact you plan to use in the conversation. A company that publishes little produces a thin document, and the file is internal preparation, not something to hand the prospect. Use case: [new-business research](/use-cases/agency-new-business-research); agent: [Company Researcher](/ai-coworkers/company-researcher).",
      "### Competitors",
      "**Example 3: weekly competitor monitoring.** You list the competitors and the moves you care about (pricing, launches, paid social, job postings, messaging) and pick a cadence. The workflow lists what each run reports: changes since the last run, messaging changes quoted word for word, pricing changes linked to the page they came from, current creatives from the Meta Ads Library and traffic estimates across several domains in one table. Traffic figures are estimates, not measurements. Only public sources are read, so anything behind a login or from private sales calls is missing. The report ends with a short \"what does this mean\" section; your team decides what it means. Use case: [competitor monitoring](/use-cases/competitor-monitoring).",
      "### Social listening",
      "**Example 4: what customers say when you're not in the room.** You name brands, topics and the communities to read. According to the workflow page, Reddit Research returns recurring themes, sentiment shifts with the posts that caused them, verbatim quotes and the threads that deserve a reply, written as a document rather than a dashboard. Sentiment is a judgment call, so open the linked threads before acting on a shift. Quotes are research material; clear the rights before a user's words appear in an ad. Private groups and deleted posts aren't covered. Use case: [social listening on a schedule](/use-cases/always-on-social-listening).",
      "**Example 5: vet a creator before the contract.** According to the workflow page, TikTok Profile Analysis returns content strategy, engagement figures and brand-safety signals for a public profile; [Instagram Page Analysis](/ai-coworkers/instagram-page-analysis) does the same for Instagram pages. The analysis only sees public data. Watch a handful of recent videos yourself, because whether a creator fits your brand is a decision, not a metric. Same use case: [social listening](/use-cases/always-on-social-listening).",
      "### Audiences",
      "**Example 6: audience profiles with sources.** You give the category, the market and the decision you want to influence. The workflow lists segment profiles with media and behavior data, plus jobs, triggers and objections per segment, built from multi-source research and GWI's global survey data, with sources visible. The profiles describe a market, not your customers, so hold them against your CRM and what sales hears before you build a campaign on them. Use case: [audience research sprint](/use-cases/audience-research-sprint).",
      "**Example 7: test messages before the budget moves.** Ask the Crowd puts the exact statements you want to test in front of five AI personas filtered by demographics; the workflow lists their qualitative reactions, labeled as a synthetic test. This isn't research with real people. Use it to narrow a long list of candidate messages to the few you then test with real customers. Same use case: [audience research sprint](/use-cases/audience-research-sprint).",
      "### Content and campaigns",
      "**Example 8: the launch content package.** The brief says which product you're launching, who it's for and what changes for them; existing pages or a tone guide make the drafts sound like you. The workflow lists positioning (claim, proof, objection handling), landing page copy, fifteen headline candidates, channel-specific social variants and ad visuals, all built from the same brief. Read and fix the positioning first, since everything downstream comes from it. Review and edit the copy for tone and brand style. Product promises, prices, competitor comparisons and effect claims go through the same legal review as any other ad copy. Use case: [launch content package](/use-cases/launch-content-engine).",
      "**Example 9: score a landing page before it goes live.** Page Copy Assessment takes a URL, rates the copy against ten principles attributed to David Ogilvy and names the sections that score poorly. The loop is simple: score, fix what's named, score again. Treat the score as a reference point for the discussion, not a verdict; only a test with real traffic tells you whether the page converts. Use case: [launch content package](/use-cases/launch-content-engine).",
      "### Reporting",
      "**Example 10: a channel report from public data.** [YouTube Channel Analysis](/ai-coworkers/youtube-channel-analysis) reads the 30 most recent videos of a public channel; its listing names views, engagement rate, upload cadence, title patterns, Shorts versus long-form and the outliers above and below the channel median. [Instagram Page Analysis](/ai-coworkers/instagram-page-analysis) covers content themes, benchmarked engagement, sentiment and brand voice. You give a channel or profile URL, optionally with a question. No login to the channel being analyzed is needed; running the task needs a Sokosumi account. Public data contains no internal reach or conversion data for your channel. For your own channel it's an outside view; for a competitor's it's the only one you get.",
      "### SEO and AI visibility (GEO)",
      "**Example 11: measure AI visibility next to your rankings.** Visibility now has two parts: search rankings and mentions in AI answers. Optimizing for the second is called GEO, generative engine optimization. You provide your domain and the topics you care about. The workflow lists a topic map of your pages, rankings and AI visibility per topic, the competitors and sources AI models cite, and a ranking of which gaps you can work on with reasonable effort. AI answers shift, so rerun the same topics after you publish and compare runs instead of trusting a single measurement. The audit doesn't write the content; that's a separate task. Use case: [SEO and AI visibility](/use-cases/seo-and-ai-visibility); agent: [SEO & GEO Researcher](/ai-coworkers/seo-geo-researcher); background: [answer engine optimization](/guides/answer-engine-optimization).",
      "## What the 11 have in common",
      "Each task has a clear brief, a repeating shape and a result the person who briefed it can check. That is why these tasks move first. What stays with the team is everything where writing the brief is the hard part: positioning, creative judgment, the client relationship and the sign-off. The checks above boil down to a short list:",
      "- Numbers and facts get checked at their source before they're quoted.\n- Copy gets reviewed and edited for tone and brand style.\n- Legal claims (prices, comparisons, effects) go through the same review as any other copy.\n- Synthetic panels and estimates stay labeled as what they are.",
      "## Rules that apply in the EU",
      "The AI Act's transparency duties in Article 50 have applied since 2 August 2026, the Regulation's general date of application under Article 113. The Digital Omnibus on AI (Regulation (EU) 2026/1744) did not move that date. What it means for a marketing team:",
      "- **Deepfakes must be disclosed.** If you use AI to generate or manipulate image, audio or video content that counts as a deep fake, you must disclose that it's artificial (Art. 50(4)). For evidently artistic, satirical or fictional work, a disclosure that doesn't spoil the work is enough.\n- **Some text needs a label, unless a person reviewed it.** AI-generated text \"published with the purpose of informing the public on matters of public interest\" must be disclosed. The duty falls away where the text \"has undergone a process of human review or editorial control\" and someone holds editorial responsibility. Record who approved what. Whether a given piece falls under this clause is a question for your legal team.\n- **The label must come early.** Disclosure has to be clear and distinguishable \"at the latest at the time of the first interaction or exposure\" (Art. 50(5)).\n- **Chatbots must identify themselves.** Providers must design systems that talk to people so the people know they're dealing with AI, unless that's obvious (Art. 50(1)). If you run a chatbot on your site, ask the vendor how it meets this.\n- **Machine-readable marking is the provider's job.** Providers of generative systems must mark outputs as artificially generated (Art. 50(2)). Systems already on the market before 2 August 2026 have until 2 December 2026, under the Omnibus.\n- **AI literacy is an obligation.** Article 4 has applied since 2 February 2025. As amended by the Omnibus, providers and deployers must take measures to support the AI literacy of staff and others who operate or use AI systems on their behalf, taking into account their knowledge, experience and the context of use. The amended text no longer requires a guaranteed level for each individual; the measures themselves remain mandatory.",
      "GDPR can apply to personal data supplied in a brief or collected during research, including public comments. Public availability does not remove the need for a lawful basis (Art. 6) and data minimization (Art. 5(1)(c)). A vendor processing personal data on your behalf needs sufficient guarantees and a contract (Art. 28). Leave customer lists and CRM exports out of a brief unless the task needs them, and ask what a research task collects about people. On Sokosumi, each coworker's profile shows the models and hosting where the vendor states them; check that before the first run that includes data. More on this: [European AI](/european-ai). This section describes the legal texts; it isn't legal advice.",
      "## Where to start",
      "Pick one task from the list that your team repeats every week or month. Run it twice, compare the result with what your team would have produced and keep the check step. An account is free, the free plan includes 250 credits a month, and every task shows its credit price before it runs ([pricing](/pricing)). All workflows are on the [use cases](/use-cases) page.",
      "## Sources",
      list(sources),
      "## Read next",
      list(relatedEn),
    ].join("\n\n"),
    faqHeading: "Questions about AI in marketing",
    faq: [
      [
        "How can AI be used in marketing?",
        "Mostly for clearly scoped, recurring tasks: market and competitor research, social listening, audience profiles, message tests, first drafts of campaign content, channel reports and SEO or AI-visibility audits. The team briefs the task, the AI returns a file, and a person checks sources, numbers, brand voice and legal claims before anything is used.",
      ],
      [
        "What are AI agents in marketing?",
        "Software that performs a defined marketing task from a brief and returns a result, such as a competitor scan or an Instagram analysis. Unlike a chat assistant, you don't steer each step. An AI coworker goes one level up: it covers a role and usually combines several agents. The [AI agents for marketing](/ai-coworkers) overview shows examples.",
      ],
      [
        "What are examples of AI in marketing?",
        "A weekly competitor report with sources, a Reddit listening summary with verbatim quotes, audience profiles built on survey data, a launch package with fifteen headline options, a YouTube channel report and an audit of which brands AI answers cite for your topics. All 11 examples above include the input, the output and the check step.",
      ],
      [
        "Will AI replace the marketing team?",
        "The examples show tasks AI can take on. They don't tell you how jobs and teams will change as a result. What can be checked today, and what is opinion, is in [Will AI replace marketing jobs? What's changing in 2026](/guides/will-ai-replace-marketers).",
      ],
      [
        "Do I have to label AI-generated marketing content in the EU?",
        "Deepfake images, audio and video must be disclosed under Article 50(4) of the AI Act, which has applied since 2 August 2026. AI-generated text published to inform the public on matters of public interest must be disclosed too, unless it went through human review and someone holds editorial responsibility. Ask your legal team which of your formats fall under this.",
      ],
      [
        "Can I put customer data into an AI tool?",
        "Only with a legal basis under GDPR Article 6, only as much as the task needs, and only with a vendor that offers sufficient guarantees and a processing contract (Article 28). Public sources can contain personal data too, such as names in comments, and being public doesn't remove the need for a lawful basis. Leave personal data out of the brief unless the task needs it.",
      ],
    ],
  },
  de: {
    title: "KI im Marketing: 11 Beispiele aus dem Arbeitsalltag",
    description:
      "KI im Marketing, konkret: 11 Aufgaben, die Teams heute an KI abgeben, mit Input, Ergebnis und Prüfschritt. Dazu die Regeln aus AI Act und DSGVO.",
    body: [
      "KI im Marketing heißt selten „die KI macht unsere Kampagne“. Im Alltag geht eine klar umrissene Aufgabe mit einem Briefing raus, eine Datei kommt zurück, und jemand im Team prüft sie, bevor sie verwendet wird. Dieser Guide zeigt elf solche Aufgaben, sortiert nach Job: was Sie hineingeben, was zurückkommt und wo ein Mensch draufschauen muss, bevor etwas rausgeht.",
      "Die Beispiele stammen von Sokosumi, einem Marktplatz, auf dem Marketingteams KI-Mitarbeiter briefen. Wir verkaufen diese Aufgaben; lesen Sie die Seite entsprechend. Was laut Beispiel zurückkommt, steht so auf der verlinkten Workflow-Seite. Eine solche Beschreibung zeigt den Ablauf, sie garantiert nicht, dass jeder Lauf vollständig und korrekt belegt ist.",
      "## KI-Nutzung in Unternehmen",
      "2025 nutzten laut Statistischem Bundesamt 26 % der Unternehmen in Deutschland mit mindestens zehn Beschäftigten künstliche Intelligenz, ab 250 Beschäftigten waren es 57 %. EU-weit lag der Anteil laut Eurostat bei 19,95 %, und 34,7 % der Unternehmen, die KI nutzen, setzen sie für Marketing oder Vertrieb ein. Die Zahlen betreffen Unternehmen insgesamt, nicht Marketingteams, und sie sagen nicht, welche Aufgaben funktionieren. Darum geht es in den Beispielen unten.",
      "## Was sind KI-Agenten?",
      "Ein KI-Agent ist Software, die nach einem Briefing eine klar umrissene Aufgabe erledigt und ein Ergebnis zurückgibt, statt im Chat auf Ihre nächste Frage zu warten. Ein KI-Mitarbeiter übernimmt eine Rolle, etwa Research oder Kreation, und kombiniert meist mehrere Agenten. Was es gibt, zeigt die Übersicht der [KI-Agenten für Marketing](/ai-coworkers); wie das Modell funktioniert, erklärt die Seite [KI-Mitarbeiter](/ai-employees).",
      "## 11 Beispiele, nach Job sortiert",
      "### Recherche und Marktanalyse",
      "**Beispiel 1: Das wiederkehrende Marktbriefing.** Die Geschäftsführung stellt jede Woche dieselben Fragen zum Markt, und im Team sucht jemand jedes Mal von vorn. Sie legen einmal ein Themenfeld fest: Märkte, Wettbewerber, regulatorische Themen und die Fragen, die jedes Briefing beantworten soll. Die Workflow-Seite beschreibt ein kurzes Dokument, das mit den Veränderungen seit dem letzten Lauf beginnt, mit einer Quelle zu jeder Aussage und Zahlen aus der Statista-Datenbank. Prüfen Sie die Zahlen an der Quelle und die Einordnung („warum das für uns zählt“), bevor das Briefing an einen Verteiler geht. Die Nachrichtenrecherche liest englischsprachige Berichterstattung, deutsche Fachpresse kann also fehlen. Use Case: [Market Intelligence als Briefing](/use-cases/market-intelligence-briefings).",
      "**Beispiel 2: Ein Unternehmen verstehen, bevor Sie anrufen.** Agenturen brauchen das vor dem Pitch, der Vertrieb vor dem Erstgespräch. Als Input genügt der Unternehmensname; ein Briefing und die URLs, die bewertet werden sollen, machen das Ergebnis schärfer. Laut Workflow-Seite entsteht ein Dokument zu Markt, Wettbewerb und Positionierung, dazu die aktuellen Meta-Anzeigen des Interessenten und konkret benannte Schwachstellen seiner Website. Jede Tatsache, die Sie im Gespräch verwenden wollen, prüfen Sie einzeln. Ein Unternehmen, das wenig veröffentlicht, ergibt ein dünnes Dokument, und das Dokument ist interne Vorbereitung, kein Material für den Interessenten. Use Case: [New-Business-Research](/use-cases/agency-new-business-research); Agent: [Company Researcher](/ai-coworkers/company-researcher).",
      "### Wettbewerb",
      "**Beispiel 3: Wettbewerbsbeobachtung, jede Woche.** Sie nennen die Wettbewerber und die Bewegungen, die Sie interessieren (Preise, Launches, Paid Social, Stellenausschreibungen, Messaging), und legen den Rhythmus fest. Laut Workflow-Seite enthält jeder Lauf die Veränderungen seit dem letzten: geänderte Botschaften wörtlich zitiert, Preisänderungen mit Link auf die Quellseite, aktuelle Creatives aus der Meta Ads Library und Traffic-Schätzungen für mehrere Domains in einer Tabelle. Traffic-Werte sind Schätzungen, keine Messungen. Gelesen werden nur öffentliche Quellen, Inhalte hinter einem Login oder aus Vertriebsgesprächen fehlen also. Der Report endet mit einem kurzen „Was heißt das?“; was es für Ihre Roadmap heißt, entscheidet Ihr Team. Use Case: [Wettbewerbsbeobachtung](/use-cases/competitor-monitoring).",
      "### Social Listening",
      "**Beispiel 4: Was Kunden sagen, wenn Sie nicht dabei sind.** Sie nennen Marken, Themen und die Communities, die gelesen werden sollen. Laut Workflow-Seite liefert Reddit Research wiederkehrende Themen, Stimmungsverschiebungen samt den Posts, die sie ausgelöst haben, wörtliche Zitate und die Threads, die eine Antwort verdienen, als Dokument statt als Dashboard. Stimmung ist eine Einschätzung; öffnen Sie die verlinkten Threads, bevor Sie auf eine Verschiebung reagieren. Zitate sind Research-Material, und bevor die Worte eines Nutzers in einer Anzeige landen, klären Sie die Rechte. Private Gruppen und gelöschte Beiträge fehlen. Use Case: [Social Listening nach Zeitplan](/use-cases/always-on-social-listening).",
      "**Beispiel 5: Creator prüfen, bevor der Vertrag kommt.** Für ein öffentliches Profil nennt die Workflow-Seite bei TikTok Profile Analysis Content-Strategie, Engagement-Kennzahlen und Brand-Safety-Signale; für Instagram-Seiten übernimmt das die [Instagram-Analyse](/ai-coworkers/instagram-page-analysis). Die Analyse sieht nur öffentliche Daten. Schauen Sie sich einige aktuelle Videos selbst an, denn ob ein Creator zu Ihrer Marke passt, ist eine Entscheidung und keine Kennzahl. Derselbe Use Case: [Social Listening](/use-cases/always-on-social-listening).",
      "### Zielgruppen",
      "**Beispiel 6: Zielgruppenprofile mit Quellen.** Sie geben Kategorie, Markt und die Entscheidung vor, die Sie beeinflussen wollen. Die Workflow-Seite beschreibt Segmentprofile mit Medien- und Verhaltensdaten sowie Aufgaben, Auslösern und Einwänden je Segment, gebaut aus Recherche über mehrere Quellen und den globalen Umfragedaten von GWI, mit sichtbaren Quellen. Die Profile beschreiben einen Markt, nicht Ihre Kunden. Gleichen Sie sie mit dem CRM und mit dem ab, was der Vertrieb hört, bevor eine Kampagne darauf aufbaut. Use Case: [Zielgruppen-Research](/use-cases/audience-research-sprint).",
      "**Beispiel 7: Botschaften testen, bevor das Budget fließt.** Ask the Crowd legt die Aussagen, die Sie testen wollen, fünf KI-Personas vor, gefiltert nach Demografie; laut Workflow-Seite kommen deren qualitative Reaktionen zurück, gekennzeichnet als synthetischer Test. Das ist keine Befragung echter Menschen. Nutzen Sie es, um eine lange Liste von Botschaften auf die wenigen einzugrenzen, die Sie danach mit echten Kunden testen. Derselbe Use Case: [Zielgruppen-Research](/use-cases/audience-research-sprint).",
      "### Content und Kampagnen",
      "**Beispiel 8: Das Content-Paket zum Launch.** Das Briefing sagt, welches Produkt Sie einführen, für wen es ist und was sich für diese Menschen ändert; bestehende Seiten oder ein Tonalitätsleitfaden sorgen dafür, dass die Entwürfe nach Ihnen klingen. Die Workflow-Seite nennt die Positionierung (Aussage, Beleg, Einwandbehandlung), Landingpage-Texte, fünfzehn Headline-Kandidaten, Social-Varianten pro Kanal und Ad-Visuals, alle aus demselben Briefing. Lesen und korrigieren Sie zuerst die Positionierung, weil alles Weitere daraus entsteht. Prüfen und überarbeiten Sie die Texte auf Tonalität und Markenstil. Produktversprechen, Preisangaben, Vergleiche mit Wettbewerbern und Wirkungsaussagen gehen wie jeder andere Werbetext in die Rechtsprüfung. Use Case: [Content-Paket für den Launch](/use-cases/launch-content-engine).",
      "**Beispiel 9: Den Landingpage-Text bewerten, bevor er live geht.** Page Copy Assessment nimmt eine URL, bewertet den Text anhand von zehn David Ogilvy zugeschriebenen Prinzipien und benennt die Abschnitte, die schlecht abschneiden. Der Ablauf ist einfach: bewerten, das Benannte beheben, erneut bewerten. Der Score ist ein Bezugspunkt für die Diskussion, kein Urteil; ob die Seite konvertiert, zeigt erst ein Test mit echtem Traffic. Use Case: [Content-Paket für den Launch](/use-cases/launch-content-engine).",
      "### Reporting",
      "**Beispiel 10: Ein Kanal-Report aus öffentlichen Daten.** Die [YouTube-Kanal-Analyse](/ai-coworkers/youtube-channel-analysis) liest die 30 neuesten Videos eines öffentlichen Kanals; ihr Listing nennt Views, Engagement-Rate, Upload-Rhythmus, Titelmuster, Shorts gegen Long-Form und die Ausreißer über und unter dem Median des Kanals. Die [Instagram-Analyse](/ai-coworkers/instagram-page-analysis) deckt Content-Themen, Engagement im Benchmark, Stimmung und Markenstimme ab. Sie geben eine Kanal- oder Profil-URL an, auf Wunsch mit einer Frage. Ein Login beim analysierten Kanal ist nicht nötig; für den Task brauchen Sie ein Sokosumi-Konto. Öffentliche Daten enthalten keine internen Reichweiten- oder Conversion-Daten Ihres Kanals. Für den eigenen Kanal ist der Report ein Blick von außen, für den eines Wettbewerbers der einzige, den Sie bekommen.",
      "### SEO und KI-Sichtbarkeit (GEO)",
      "**Beispiel 11: KI-Sichtbarkeit neben den Rankings messen.** Sichtbarkeit hat heute zwei Teile: Rankings in der Suche und Nennungen in KI-Antworten. Die Arbeit am zweiten Teil heißt GEO, Generative Engine Optimization. Sie geben Ihre Domain und die Themen an, die Ihnen wichtig sind. Laut Workflow-Seite ordnet das Audit Ihre Seiten den Themen zu, die sie tatsächlich abdecken, bewertet Rankings und KI-Sichtbarkeit je Thema, zeigt, welche Wettbewerber und Quellen KI-Modelle nennen, und schätzt ein, welche Lücken Sie mit vertretbarem Aufwand bearbeiten können. KI-Antworten verändern sich; wiederholen Sie die Messung auf denselben Themen, nachdem Sie veröffentlicht haben, und vergleichen Sie die Läufe, statt einer Einzelmessung zu glauben. Die Inhalte schreibt das Audit nicht, das ist eine eigene Aufgabe. Use Case: [SEO und KI-Sichtbarkeit](/use-cases/seo-and-ai-visibility); Agent: [SEO & GEO Researcher](/ai-coworkers/seo-geo-researcher); Hintergrund: [Answer Engine Optimization](/guides/answer-engine-optimization).",
      "## Was die elf Beispiele gemeinsam haben",
      "Jede dieser Aufgaben hat ein klares Briefing, eine wiederkehrende Form und ein Ergebnis, das die briefende Person prüfen kann. Deshalb wandern sie zuerst zur KI. Beim Team bleibt alles, wo schon das Briefing der schwierige Teil ist: Positionierung, kreatives Urteil, die Kundenbeziehung und die Freigabe. Die Prüfschritte oben lassen sich auf eine kurze Liste bringen:",
      "- Zahlen und Fakten werden an der Quelle geprüft, bevor sie zitiert werden.\n- Prüfen und überarbeiten Sie die Texte auf Tonalität und Markenstil.\n- Rechtlich heikle Aussagen (Preise, Vergleiche, Wirkung) laufen durch dieselbe Prüfung wie jeder andere Text.\n- Synthetische Panels und Schätzungen bleiben als das gekennzeichnet, was sie sind.",
      "## Welche Regeln in der EU gelten",
      "Die Transparenzpflichten aus Artikel 50 der KI-Verordnung (AI Act) gelten seit dem 2. August 2026, dem allgemeinen Geltungsbeginn nach Artikel 113. Der Digital Omnibus zur KI (Verordnung (EU) 2026/1744) hat dieses Datum nicht verschoben. Für ein Marketingteam heißt das:",
      "- **Deepfakes müssen offengelegt werden.** Wer mit KI Bild-, Audio- oder Videoinhalte erzeugt oder verändert, die als Deepfake gelten, muss offenlegen, dass sie künstlich sind (Art. 50 Abs. 4). Bei offensichtlich künstlerischen, satirischen oder fiktionalen Werken genügt ein Hinweis, der die Darstellung nicht stört.\n- **Manche Texte brauchen einen Hinweis, außer ein Mensch hat sie geprüft.** KI-erzeugte Texte, die veröffentlicht werden, um die Öffentlichkeit über Angelegenheiten von öffentlichem Interesse zu informieren, müssen gekennzeichnet werden. Die Pflicht entfällt, wenn der Text eine menschliche Überprüfung oder redaktionelle Kontrolle durchlaufen hat und eine Person oder ein Unternehmen die redaktionelle Verantwortung trägt. Halten Sie fest, wer was freigegeben hat. Ob ein bestimmtes Format unter diese Regel fällt, klärt Ihre Rechtsabteilung.\n- **Der Hinweis kommt früh.** Er muss klar und eindeutig erkennbar sein, spätestens bei der ersten Interaktion oder Konfrontation mit dem Inhalt (Art. 50 Abs. 5).\n- **Chatbots geben sich zu erkennen.** Anbieter müssen Systeme, die mit Menschen interagieren, so gestalten, dass diese wissen, dass sie mit einer KI sprechen, sofern das nicht offensichtlich ist (Art. 50 Abs. 1). Setzen Sie einen Chatbot auf Ihrer Website ein, fragen Sie den Anbieter, wie er das umsetzt.\n- **Die maschinenlesbare Kennzeichnung ist Sache der Anbieter.** Anbieter generativer Systeme müssen Ausgaben als künstlich erzeugt markieren (Art. 50 Abs. 2). Für Systeme, die schon vor dem 2. August 2026 auf dem Markt waren, gilt laut Omnibus eine Frist bis zum 2. Dezember 2026.\n- **KI-Kompetenz ist Pflicht.** Artikel 4 gilt seit dem 2. Februar 2025. In der Fassung des Omnibus müssen Anbieter und Betreiber Maßnahmen ergreifen, um die KI-Kompetenz ihres Personals und anderer Personen zu fördern, die in ihrem Auftrag KI-Systeme betreiben oder nutzen, unter Berücksichtigung von Kenntnissen, Erfahrung und Einsatzkontext. Ein garantiertes Niveau für jede einzelne Person verlangt der geänderte Text nicht mehr; die Maßnahmen selbst bleiben verpflichtend.",
      "Die DSGVO kann für personenbezogene Daten gelten, die Sie im Briefing mitgeben oder die bei der Recherche erhoben werden, auch für öffentliche Kommentare. Dass Daten öffentlich sind, ersetzt weder die Rechtsgrundlage (Art. 6) noch die Datenminimierung (Art. 5 Abs. 1 lit. c). Ein Anbieter, der personenbezogene Daten in Ihrem Auftrag verarbeitet, muss hinreichende Garantien bieten und einen Vertrag mit Ihnen haben (Art. 28). Lassen Sie Kundenlisten und CRM-Exporte aus dem Briefing, wenn die Aufgabe sie nicht braucht, und klären Sie, was eine Recherche über Personen erhebt. Auf Sokosumi zeigt das Profil eines KI-Mitarbeiters Modelle und Hosting, soweit der Anbieter sie angibt. Prüfen Sie das vor dem ersten Lauf mit Daten. Mehr dazu: [Europäische KI](/european-ai). Dieser Abschnitt beschreibt die Rechtstexte und ersetzt keine Rechtsberatung.",
      "## Wo Sie anfangen",
      "Wählen Sie eine Aufgabe aus der Liste, die Ihr Team jede Woche oder jeden Monat wiederholt. Lassen Sie sie zweimal laufen, vergleichen Sie das Ergebnis mit dem, was Ihr Team geliefert hätte, und behalten Sie den Prüfschritt. Ein Konto ist kostenlos, der Free-Plan enthält 250 Credits im Monat, und jede Aufgabe zeigt ihren Credit-Preis vor dem Start ([Preise](/pricing)). Alle Workflows finden Sie unter [Use Cases](/use-cases).",
      "## Quellen",
      list(sources),
      "## Weiterlesen",
      list(relatedDe),
    ].join("\n\n"),
    faqHeading: "Fragen zu KI im Marketing",
    faq: [
      [
        "Wie kann KI im Marketing eingesetzt werden?",
        "Vor allem für klar umrissene, wiederkehrende Aufgaben: Markt- und Wettbewerbsrecherche, Social Listening, Zielgruppenprofile, Botschaftstests, erste Entwürfe für Kampagneninhalte, Kanal-Reports sowie SEO- und KI-Sichtbarkeits-Audits. Das Team brieft die Aufgabe, die KI liefert eine Datei, und ein Mensch prüft Quellen, Zahlen, Markenstimme und rechtliche Aussagen, bevor etwas verwendet wird.",
      ],
      [
        "Was sind KI-Agenten im Marketing?",
        "Software, die nach einem Briefing eine klar umrissene Marketingaufgabe erledigt und ein Ergebnis zurückgibt, zum Beispiel einen Wettbewerber-Scan oder eine Instagram-Analyse. Anders als bei einem Chat-Assistenten steuern Sie nicht jeden Schritt. Ein KI-Mitarbeiter geht eine Stufe weiter: Er übernimmt eine Rolle und kombiniert meist mehrere Agenten. Beispiele zeigt die Übersicht der [KI-Agenten für Marketing](/ai-coworkers).",
      ],
      [
        "Welche Beispiele für KI im Marketing gibt es?",
        "Ein wöchentlicher Wettbewerber-Report mit Quellen, eine Reddit-Auswertung mit wörtlichen Zitaten, Zielgruppenprofile auf Basis von Umfragedaten, ein Launch-Paket mit fünfzehn Headline-Optionen, ein YouTube-Kanal-Report und ein Audit, welche Marken KI-Antworten zu Ihren Themen nennen. Alle elf Beispiele oben nennen Input, Ergebnis und Prüfschritt.",
      ],
      [
        "Ersetzt KI das Marketingteam?",
        "Die Beispiele zeigen Aufgaben, die KI übernehmen kann. Wie sich dadurch Stellen und Teams verändern, lässt sich daraus nicht ableiten. Was sich heute prüfen lässt und was Meinung ist, steht in [Ersetzt KI Marketing-Jobs? Was sich 2026 ändert](/guides/will-ai-replace-marketers).",
      ],
      [
        "Muss ich KI-generierte Marketinginhalte kennzeichnen?",
        "Deepfake-Bilder, -Audio und -Videos müssen nach Artikel 50 Abs. 4 der KI-Verordnung offengelegt werden, die Pflicht gilt seit dem 2. August 2026. KI-erzeugte Texte, die die Öffentlichkeit über Angelegenheiten von öffentlichem Interesse informieren, ebenfalls, es sei denn, ein Mensch hat sie geprüft und jemand trägt die redaktionelle Verantwortung. Welche Ihrer Formate darunter fallen, klärt Ihre Rechtsabteilung.",
      ],
      [
        "Darf ich Kundendaten in ein KI-Tool geben?",
        "Nur mit Rechtsgrundlage nach Art. 6 DSGVO, nur so viele, wie die Aufgabe braucht, und nur bei einem Anbieter mit hinreichenden Garantien und Auftragsverarbeitungsvertrag (Art. 28). Auch öffentliche Quellen enthalten personenbezogene Daten, etwa Namen in Kommentaren, und öffentlich heißt nicht ohne Rechtsgrundlage. Lassen Sie personenbezogene Daten aus dem Briefing, wenn die Aufgabe sie nicht braucht.",
      ],
    ],
  },
  sources,
  quellen: sources,
};

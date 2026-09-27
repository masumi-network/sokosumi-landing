import { topic } from "../topic-guide-builder.mjs";

const sources = [
  ["Profound: pricing", "https://www.tryprofound.com/pricing"],
  ["Profound: Answer Engine Insights", "https://www.tryprofound.com/features/answer-engine-insights"],
  ["Peec AI: pricing", "https://peec.ai/pricing"],
  ["Peec AI docs: welcome to Peec AI", "https://docs.peec.ai/intro-to-peec-ai"],
  ["Peec AI: imprint", "https://peec.ai/legal/imprint"],
  ["OtterlyAI: pricing", "https://otterly.ai/pricing"],
  ["OtterlyAI: product overview", "https://otterly.ai/"],
  ["OtterlyAI: imprint", "https://otterly.ai/imprint"],
  ["Semrush Knowledge Base: AI Visibility Toolkit", "https://www.semrush.com/kb/1493-ai-visibility-toolkit"],
  ["Semrush: pricing", "https://www.semrush.com/pricing/"],
  ["Ahrefs: Brand Radar", "https://ahrefs.com/brand-radar"],
  ["Ahrefs: Brand Radar (German page)", "https://ahrefs.com/de/brand-radar"],
  ["Ahrefs: pricing", "https://ahrefs.com/pricing"],
  ["Ahrefs Help Center: what is Brand Radar", "https://help.ahrefs.com/en/articles/11064852-what-is-brand-radar-and-how-to-use-it"],
  ["Scrunch: pricing", "https://scrunch.com/pricing"],
  ["Scrunch: product overview", "https://scrunch.com/"],
  ["Scrunch FAQ: international prompt tracking and languages", "https://scrunch.com/faqs/does-scrunch-support-international-prompt-tracking-and-multiple-languages"],
  ["Rankscale: pricing", "https://rankscale.ai/pricing"],
  ["Rankscale: product overview", "https://rankscale.ai/"],
  ["Knowatoa: pricing", "https://knowatoa.com/pricing"],
  ["Knowatoa: product overview", "https://knowatoa.com/"],
  ["Google Search Console Help: generative AI performance report", "https://support.google.com/webmasters/answer/16984139"],
  ["Google Search Console Help: about Search Console", "https://support.google.com/webmasters/answer/9128668"],
  ["Bing: new AI visibility insights in Bing Webmaster Tools", "https://blogs.bing.com/search/June-2026/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare"],
  ["Bing Webmaster Tools: about", "https://www.bing.com/webmasters/about"],
];

const quellen = [
  ["Profound: Preise", "https://www.tryprofound.com/pricing"],
  ["Profound: Answer Engine Insights", "https://www.tryprofound.com/features/answer-engine-insights"],
  ["Peec AI: Preise", "https://peec.ai/pricing"],
  ["Peec AI Docs: Welcome to Peec AI", "https://docs.peec.ai/intro-to-peec-ai"],
  ["Peec AI: Impressum", "https://peec.ai/legal/imprint"],
  ["OtterlyAI: Preise", "https://otterly.ai/pricing"],
  ["OtterlyAI: Produktübersicht", "https://otterly.ai/"],
  ["OtterlyAI: Impressum", "https://otterly.ai/imprint"],
  ["Semrush Knowledge Base: AI Visibility Toolkit", "https://www.semrush.com/kb/1493-ai-visibility-toolkit"],
  ["Semrush: Preise", "https://www.semrush.com/pricing/"],
  ["Ahrefs: Brand Radar", "https://ahrefs.com/brand-radar"],
  ["Ahrefs: Brand Radar (deutsche Seite)", "https://ahrefs.com/de/brand-radar"],
  ["Ahrefs: Preise", "https://ahrefs.com/pricing"],
  ["Ahrefs Help Center: What is Brand Radar", "https://help.ahrefs.com/en/articles/11064852-what-is-brand-radar-and-how-to-use-it"],
  ["Scrunch: Preise", "https://scrunch.com/pricing"],
  ["Scrunch: Produktübersicht", "https://scrunch.com/"],
  ["Scrunch FAQ: internationales Prompt-Tracking und Sprachen", "https://scrunch.com/faqs/does-scrunch-support-international-prompt-tracking-and-multiple-languages"],
  ["Rankscale: Preise", "https://rankscale.ai/pricing"],
  ["Rankscale: Produktübersicht", "https://rankscale.ai/"],
  ["Knowatoa: Preise", "https://knowatoa.com/pricing"],
  ["Knowatoa: Produktübersicht", "https://knowatoa.com/"],
  ["Google Search Console-Hilfe: Bericht zur Leistung generativer KI", "https://support.google.com/webmasters/answer/16984139"],
  ["Google Search Console-Hilfe: Über die Search Console", "https://support.google.com/webmasters/answer/9128668"],
  ["Bing: New AI Visibility Insights in Bing Webmaster Tools", "https://blogs.bing.com/search/June-2026/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare"],
  ["Bing Webmaster Tools: About", "https://www.bing.com/webmasters/about"],
];

const glance = [
  "**At a glance** (AI engines · entry price and billing term · German and DACH coverage · one limit):",
  "- **Google Search Console:** AI Overviews, AI Mode · free · report breaks down by country · counts links shown, not brand mentions",
  "- **Bing Webmaster Tools:** Copilot, Bing, partner AI experiences · free · country coverage not stated in the source checked · counts citations, not brand mentions",
  "- **Profound:** up to nine engines on Enterprise · free seven-day trial, then custom Enterprise pricing · 30+ languages, 150+ regions · no paid plan with a listed price",
  "- **Peec AI:** three of ChatGPT, AI Mode, AI Overviews, Copilot, Gemini, Naver AI · €85 a month, monthly billing · FAQ says countries and languages cost nothing extra · \"multi country\" listed only from Advanced",
  "- **Otterly.AI:** ChatGPT, AI Overviews, Perplexity, Copilot, others as paid add-ons · $29 a month, monthly billing · Germany, Austria, Switzerland in its country list · 15 prompts",
  "- **Semrush AI Visibility Toolkit:** ChatGPT and Google AI Mode named for prompt tracking · $99 a month · Germany among 41 countries, interface available in German · 25 tracked prompts, no free trial",
  "- **Ahrefs Brand Radar:** AI Overviews, AI Mode, ChatGPT, Perplexity, Gemini, Copilot, Grok, Claude · $199 a month per AI index, custom prompts from $50 a month · index questions asked from each keyword's location · custom tracking is priced in checks, not prompts",
  "- **Scrunch:** ChatGPT, Claude, Gemini, Perplexity, AI Mode, AI Overviews, Meta AI · $250 a month billed annually, $300 month to month · prompts in any language and country · highest self-serve entry price here",
  "- **Rankscale:** nine engines · Pro at €99 a month, monthly billing (currency shown varied) · 240+ regions and languages · Essentials' included credits unclear",
  "- **Knowatoa:** seven services, no Copilot · $59 a month · \"every language and market\" · prompt allowance not stated",
  "- **Sokosumi SEO & GEO Researcher:** ChatGPT, AI Overviews · 900 credits per run · country and language chosen per run · one snapshot per run, not ongoing tracking",
].join("\n");

const ueberblick = [
  "**Auf einen Blick** (KI-Dienste · Einstiegspreis und Abrechnung · deutsche Prompts und DACH-Abdeckung · eine Grenze):",
  "- **Google Search Console:** AI Overviews, AI Mode · kostenlos · Bericht nach Ländern aufschlüsselbar · zählt angezeigte Links, keine Markennennungen",
  "- **Bing Webmaster Tools:** Copilot, Bing, KI-Angebote von Partnern · kostenlos · Länderabdeckung in der geprüften Quelle nicht angegeben · zählt Zitationen, keine Markennennungen",
  "- **Profound:** bis zu neun KI-Dienste im Enterprise-Tarif · kostenloser Test über sieben Tage, danach individuelle Enterprise-Preise · über 30 Sprachen, über 150 Regionen · kein Bezahltarif mit ausgewiesenem Preis",
  "- **Peec AI:** drei aus ChatGPT, AI Mode, AI Overviews, Copilot, Gemini, Naver AI · 85 € im Monat, monatliche Abrechnung · laut FAQ keine Aufpreise für Länder und Sprachen · „Multi country“ in der Tarifliste erst ab Advanced",
  "- **Otterly.AI:** ChatGPT, AI Overviews, Perplexity, Copilot, weitere gegen Aufpreis · 29 $ im Monat, monatliche Abrechnung · Deutschland, Österreich und Schweiz in der Länderliste · 15 Prompts",
  "- **Semrush AI Visibility Toolkit:** für Prompt-Tracking werden ChatGPT und Google AI Mode genannt · 99 $ im Monat · Deutschland unter 41 Ländern, Oberfläche auf Deutsch verfügbar · 25 getrackte Prompts, kein kostenloser Test",
  "- **Ahrefs Brand Radar:** AI Overviews, AI Mode, ChatGPT, Perplexity, Gemini, Copilot, Grok, Claude · 199 $ im Monat pro KI-Index, eigene Prompts ab 50 $ im Monat · Index-Fragen vom Standort des jeweiligen Keywords gestellt · eigenes Tracking wird in Checks abgerechnet, nicht in Prompts",
  "- **Scrunch:** ChatGPT, Claude, Gemini, Perplexity, AI Mode, AI Overviews, Meta AI · 250 $ im Monat bei jährlicher Zahlung, 300 $ bei monatlicher · Prompts in jeder Sprache und jedem Land · teuerster buchbarer Einstieg in diesem Vergleich",
  "- **Rankscale:** neun KI-Dienste · Pro für 99 € im Monat, monatliche Abrechnung (angezeigte Währung schwankte) · über 240 Regionen und Sprachen · enthaltene Credits bei Essentials unklar",
  "- **Knowatoa:** sieben Dienste, kein Copilot · 59 $ im Monat · „alle Sprachen und Märkte“ · Prompt-Kontingent nicht angegeben",
  "- **SEO & GEO Researcher auf Sokosumi:** ChatGPT, AI Overviews · 900 Credits pro Durchlauf · Land und Sprache pro Durchlauf wählbar · eine Momentaufnahme pro Durchlauf, kein laufendes Tracking",
].join("\n");

export default {
  slug: "best-ai-visibility-tools",
  category: "advanced",
  order: 206,
  en: {
    title: "Best AI visibility tools in 2026: what each one measures",
    description:
      "Profound, Peec AI, Otterly, Semrush, Ahrefs and more: which AI engines each tracks, entry price, German prompts, country coverage and limits.",
    body: topic("en", {
      intro: [
        "An AI visibility tool tells you how often ChatGPT, Perplexity, Gemini, Google AI Overviews and AI Mode, Copilot or Claude name your brand, which sources they cite and which competitors appear instead. Many tools sample answers to a defined prompt set on a schedule. Others also use large prompt indexes built from search data. The first-party reports from Google and Microsoft measure a different set of observations: links to your site, not brand names. Prompt sampling estimates how often your brand appears in the answers tested.",
        "This guide compares eight paid tools on their own pricing pages and documentation as of September 2026, plus the two free first-party reports. Some teams call the work generative engine optimization (GEO), others answer engine optimization (AEO); the measurement problem is the same either way.",
        glance,
      ],
      stateIntro: [
        "Every fact below comes from the vendor's own site. Prices are the lowest listed entry point, in the currency the page showed us, with the billing term, as of September 2026.",
      ],
      state: [
        "**Google Search Console and Bing Webmaster Tools (free).** Start here, because this is the only data that comes from the engines themselves. Search Console is a free Google service; its generative AI performance report counts impressions of links to your site in AI Overviews and AI Mode, broken down by page, country, date and device. Google's help page says the report was rolled out to all websites worldwide as of 31 August 2026, but a site with few impressions in these features may still see no data, so availability can differ by property. Bing Webmaster Tools' AI Performance reports citations in Copilot, Bing and partner AI experiences, with grounding queries and a Citation Share metric. Limitation: both count links to your site rather than whether a model names your brand, and neither covers ChatGPT, Perplexity or Claude. Our [AI brand monitoring guide](/guides/ai-brand-monitoring) explains what each number means.",
        "**Profound.** Reports visibility scores, share of voice, the sites cited in answers about you, and sentiment (how AI describes your brand). The Enterprise plan tracks up to nine engines: ChatGPT, Perplexity, Google AI Mode, Gemini, Microsoft Copilot, DeepSeek, Claude, Google AI Overviews and Exa Search, in 30+ languages and 150+ regions. Profound lists no paid plan with a public price: there's a free seven-day trial with 50 prompts on ChatGPT, Gemini and AI Overviews in one language and one region, and paid use is custom Enterprise pricing after a demo. Suits enterprise marketing teams that want a managed platform and don't mind a sales process. Limitation: you won't see a price before you talk to sales.",
        "**Peec AI.** Peec AI GmbH is based in Berlin. It measures visibility (how often your brand is mentioned), your position against other brands, sentiment, and the sources models cite. Starter costs €85 a month on monthly billing for 50 prompts tracked daily on three models you pick from ChatGPT, AI Mode, AI Overviews, Microsoft Copilot, Gemini and Naver AI; further models are a paid add-on. Pro costs €205 for 150 prompts and Advanced €425 for 350. Suits SEO and content teams in DACH that want a European vendor, euro pricing and a self-serve start. Limitation: Peec's FAQ says extra countries and languages cost nothing because price follows prompts, yet its plan list names \"multi country\" only from Advanced, so ask which applies before you buy Starter for Germany, Austria and Switzerland.",
        "**Otterly.AI.** OtterlyAI GmbH is registered in Persenbeug, Austria. It counts brand mentions and citations, shows your share of citations against competitors, and adds a GEO audit with crawlability checks and content briefs. Lite costs $29 a month on monthly billing for 15 prompts on ChatGPT, Google AI Overviews, Perplexity and Microsoft Copilot, with Claude, Google AI Mode and Gemini as paid add-ons; Standard costs $189 for 100 prompts. Every plan includes 50+ countries, and Germany, Austria and Switzerland are in its country list. Suits small teams that want a low-cost first baseline. Limitation: Lite fits only if your prompt count (see step 1 below) stays at 15 or fewer, and three of the seven engines cost extra.",
        "**Semrush AI Visibility Toolkit.** Costs $99 a month on its own, including 25 prompts for prompt tracking, or comes bundled with SEO in the Semrush One plans. It covers a visibility overview, competitor and prompt research, brand performance and sentiment, daily prompt tracking and an AI search site audit. The knowledge base names ChatGPT and Google AI Mode for prompt tracking; the suite-wide pricing page lists \"Google Search, ChatGPT, Perplexity, Gemini & more\", so check which engines each report uses. Visibility Overview covers 41 countries including Germany, prompt tracking covers 220+ countries and territories, and the interface is available in German. Suits teams already paying for Semrush. Limitation: 25 tracked prompts, and Semrush's own documentation says the toolkit has no free trial.",
        "**Ahrefs Brand Radar.** Works in two modes. The AI index runs questions taken from Ahrefs' keyword database (People Also Ask questions, asked from the keyword's location) through Google AI Overviews and AI Mode, ChatGPT, Perplexity, Gemini, Copilot, Grok and Claude, then reports mentions and citations for any brand, including competitors; one index costs $199 a month and all of them $699. Custom prompt tracking runs your own questions and starts at $50 a month for 2,500 checks; the $699 bundle includes 2,500 of those checks. Suits teams that want to benchmark a whole category before writing a prompt set, then track their own wording. Limitation: custom tracking is priced in checks, not prompts, so ask Ahrefs how many checks one prompt uses across engines and runs before you estimate coverage.",
        "**Scrunch.** Tracks prompts, topics and entities with citations, competitors and rankings, plus a live feed of AI bots crawling your site. Its Agent Experience Platform serves machine-readable versions of your pages to AI agents. Starter costs $250 a month on annual billing, or $300 on monthly billing, for 350 prompts on ChatGPT, Claude, Gemini, Perplexity, Google AI Mode and AI Overviews, and Meta AI. Scrunch says it records responses for prompts written in any language in every country, and you can set up personas per region. Suits brands that want tracking and changes for AI crawlers from one vendor. Limitation: on either billing term, it's the highest self-serve entry price in this list.",
        "**Rankscale.** Rankscale GmbH is based in Vienna. It reports an AI visibility score, rankings, sentiment and citations, and runs an AI-readiness audit against 94+ checkpoints, across ChatGPT, Perplexity, Google AI Mode, Gemini, DeepSeek, Mistral, Claude, Grok and Copilot, in 240+ regions and languages. Billing runs on credits, typically 0.25 credits per engine per prompt. The Pro card lists 1,200 credits and 10 brand dashboards at €99 a month on monthly billing in the rendered pricing page we checked; a text copy of the same page showed dollar amounts, so the currency may depend on where you open it. Essentials starts at €20, but the comparison table is inconsistent about its included credits; confirm its allowance before buying. Suits agencies running several client brands. Limitation: your real prompt count depends on how many engines you switch on, so do the arithmetic before you pick a plan.",
        "**Knowatoa.** Checks seven services (ChatGPT, AI Overviews, AI Mode, Claude, Gemini, Meta AI and Perplexity) and reports competitor visibility gaps, citations and brand sentiment alerts. Starter costs $59 a month; Growth costs $199 and adds API, MCP and Looker Studio. It says you can track every language and market. Suits small marketing teams and SaaS founders. Limitation: the pricing table doesn't say how many questions each plan includes, and Copilot isn't on its list.",
        "**Sokosumi's SEO & GEO Researcher.** This is an audit you run when you need one, not a tracker. The [SEO & GEO Researcher](/ai-coworkers/seo-geo-researcher), built by Serviceplan Group, takes a domain with 3 to 6 keyword stems (or a file of up to 100 URLs), a country and a language, and returns an Excel workbook of keyword clusters, content gaps against competitors and opportunities, plus a written report that sorts recommendations by effort. On the AI side it checks ChatGPT and Google AI Overviews: brand mention counts in LLM responses, the top citing sources, AI Overview presence and live ChatGPT spot-checks. A run costs 900 credits, shown before it starts. Limitation: it only surfaces pages that already rank for a relevant keyword, and it gives you a snapshot per run; for a daily trend line, use one of the trackers above.",
      ],
      workIntro: [
        "Answer these questions in order before you compare prices. Check German-language results and the countries you need before choosing a plan.",
      ],
      work: [
        "Write the prompt set before you open a single tool, then count it. List the questions a buyer would type into an assistant about each product or service, in the buyer's language, weighted towards unbranded ones (\"best CRM for a 20-person agency\"), because branded prompts mostly return your own site. Then multiply: products × questions per product × languages × countries, if the vendor counts each language and country as its own prompt (Peec's FAQ says it doesn't; ask the others). A narrow second product with five questions can fit in a small plan; one product with ten questions asked in German and English across Germany, Austria and Switzerland is already 60. Compare the total with the plan: Otterly Lite 15, Semrush 25, Peec Starter 50, Scrunch Starter 350.",
        "Pick the engines your buyers use, then check that the plan you'd actually buy covers them, not the Enterprise plan. Knowatoa has no Copilot, Peec's Starter lets you choose three models, and Otterly charges extra for Claude, AI Mode and Gemini.",
        "Check what \"German support\" means for you. It can mean four things: prompts written in German, Germany, Austria or Switzerland as the query location, a German-language interface, and customer support in German. A country list proves only the second. In our check, Semrush offers its interface in German and Ahrefs publishes its Brand Radar page in German; the other vendors' websites are in English, and we didn't verify German-language customer support for any of them. During the trial, run your German prompts with the location set and check whether the answers look like what a buyer in Munich or Vienna would see.",
        "Decide what you're counting: mentions or citations. A mention is your brand named in the answer text; a citation is a link to your site as a source. Google's and Microsoft's reports only count links, and most paid tools report both, so find out which one sits behind the headline \"visibility score\".",
        "Compare price last, per prompt and per engine, and compare like with like on billing terms (Scrunch's Starter is $250 a month on annual billing and $300 on monthly billing; most other prices here are monthly).",
      ],
      measureIntro: [
        "Once a tool is running, report numbers you can explain to someone who has never logged into it.",
      ],
      measure: [
        "Mention rate: the share of your prompts where an engine named your brand, per engine, with prompt count and date stated.",
        "Citation rate: the share of prompts where your domain appeared as a source.",
        "Which competitors appear in the same answers, and how often.",
        "Google AI-feature impressions and Bing citations, kept separate and labelled as first-party data.",
        "Branded search volume and direct traffic as secondary indicators only. Other channels move them too, so they can't show that an AI answer caused a visit.",
      ],
      risks: [
        "Comparing visibility scores across tools. Each vendor builds its score from its own prompts and its own formula, so a 40 in one tool and a 40 in another measure different things.",
        "Changing the prompt set every month, which turns the trend line into a record of your edits.",
        "Buying on the Enterprise feature list. Profound lists its nine engines on the custom plan, while its trial covers three.",
        "Tracking English prompts for a German market. A US-English prompt set tells you nothing verified about what a buyer asking in German sees.",
        "Treating measurement as improvement. Tracking shows where you're missing and who gets cited instead; on its own it doesn't change the answers. Some products include action features (Otterly's GEO audit and content briefs, Scrunch's Agent Experience Platform, Rankscale's readiness audit), so check whether those are in the plan you're buying or sold separately.",
      ],
      sources,
      related: [
        ["AI brand monitoring: what Google and Bing report", "/guides/ai-brand-monitoring"],
        ["Answer engine optimization (AEO): Google's own guidance", "/guides/answer-engine-optimization"],
        ["SEO and AI visibility with AI coworkers", "/use-cases/seo-and-ai-visibility"],
        ["Best AI marketing tools", "/guides/best-ai-marketing-tools"],
      ],
    }),
    faqHeading: "AI visibility tools: common questions",
    faq: [
      [
        "What does an AI visibility tool actually do?",
        "It estimates how often assistants such as ChatGPT, Perplexity, Gemini and Google AI Overviews name your brand, which sources they cite and which competitors appear. Many tools do this by sampling answers to a defined prompt set on a schedule; some also use large prompt indexes. The result is an estimate from the answers tested, not platform data.",
      ],
      [
        "Which AI visibility tool is best?",
        "It depends on your team. A DACH team that wants a European vendor and a self-serve start should look at Peec AI (Berlin) or Otterly.AI (Austria). Teams already on Semrush or Ahrefs can add those vendors' AI modules. For larger programmes, compare enterprise coverage, exports and contract terms against your requirements.",
      ],
      [
        "Is there a free AI visibility tool?",
        "Google Search Console's generative AI performance report and Bing Webmaster Tools' AI Performance cost nothing, but they count links to your site, not brand mentions, and cover only Google's and Microsoft's own surfaces. Profound and Rankscale (Pro) offer free seven-day trials; Semrush's toolkit has no free trial.",
      ],
      [
        "How do I rank in ChatGPT?",
        "Tracking alone won't make ChatGPT mention you; it shows whether it does. Use a tool to find the prompts where you're missing and the sources cited instead, then work on those pages and sources. Our [answer engine optimization guide](/guides/answer-engine-optimization) covers what Google documents about its own AI features.",
      ],
      [
        "Which tools track German prompts?",
        "For prompts and markets: Profound supports 30+ languages, Scrunch says it records prompts in any language, Rankscale lists 240+ regions and languages, Knowatoa says every language and market, and Otterly and Semrush both list Germany as a country. Peec includes countries and languages at no extra cost per its FAQ, but lists multi-country only from its Advanced plan. A German interface we could confirm only for Semrush, and we didn't verify German-language support for any vendor. Test with your own German prompts during a trial.",
      ],
      [
        "Is AI visibility the same as generative engine optimization?",
        "No. Generative engine optimization (GEO) is the work of changing how AI answers describe and cite you; AI visibility is the measurement that tells you whether that work moved anything.",
      ],
    ],
  },
  de: {
    title: "KI-Sichtbarkeits-Tools im Vergleich: Preise und Grenzen",
    description:
      "Profound, Peec AI, Otterly, Semrush, Ahrefs und mehr: welche KI-Dienste jedes Tool prüft, Einstiegspreis, deutsche Prompts, Länderabdeckung und Grenzen.",
    body: topic("de", {
      intro: [
        "Ein Tool für KI-Sichtbarkeit zeigt, wie oft ChatGPT, Perplexity, Gemini, Google AI Overviews und AI Mode, Copilot oder Claude Ihre Marke nennen, welche Quellen sie zitieren und welche Wettbewerber stattdessen auftauchen. Viele Tools fragen dafür in festen Abständen ein definiertes Prompt-Set ab. Andere nutzen zusätzlich große Prompt-Indizes aus Suchdaten. Die Berichte von Google und Microsoft messen etwas anderes: Links auf Ihre Website, keine Markennamen. Eine Prompt-Stichprobe schätzt, wie oft Ihre Marke in den geprüften Antworten vorkommt.",
        "Dieser Vergleich stellt acht kostenpflichtige Tools nebeneinander, auf Basis ihrer eigenen Preisseiten und Dokumentation, Stand September 2026. Dazu kommen die beiden kostenlosen Berichte von Google und Microsoft. Ob Sie die Arbeit GEO-Optimierung (Generative Engine Optimization) oder AEO nennen, ändert an der Messfrage nichts.",
        ueberblick,
      ],
      stateIntro: [
        "Alle Angaben stammen von den Websites der Anbieter. Preise sind der niedrigste ausgewiesene Einstieg, in der Währung, die uns die Seite angezeigt hat, mit Abrechnungsart, Stand September 2026.",
      ],
      state: [
        "**Google Search Console und Bing Webmaster Tools (kostenlos).** Hier sollten Sie anfangen, denn nur diese Daten kommen von den Suchmaschinen selbst. Die Search Console ist ein kostenloser Google-Dienst. Ihr Bericht zur Leistung generativer KI zählt, wie oft Links auf Ihre Website in AI Overviews und AI Mode angezeigt wurden, aufgeschlüsselt nach Seite, Land, Datum und Gerät. Laut Google-Hilfe wurde der Bericht zum 31. August 2026 für alle Websites weltweit eingeführt; bei wenigen Impressionen in diesen Funktionen kann er trotzdem leer bleiben, die Verfügbarkeit unterscheidet sich also je Property. AI Performance in den Bing Webmaster Tools meldet Zitationen in Copilot, Bing und KI-Angeboten von Partnern, mit Grounding Queries und der Kennzahl Citation Share. Grenze: Beide zählen Links auf Ihre Seite, nicht ob ein Modell Ihre Marke nennt, und keiner deckt ChatGPT, Perplexity oder Claude ab. Was die einzelnen Zahlen bedeuten, erklärt unser [Leitfaden zum KI-Markenmonitoring](/guides/ai-brand-monitoring).",
        "**Profound.** Misst Visibility Scores, Share of Voice, die in Antworten über Sie zitierten Websites und die Tonalität, also wie KI Ihre Marke beschreibt. Der Enterprise-Tarif trackt bis zu neun KI-Dienste: ChatGPT, Perplexity, Google AI Mode, Gemini, Microsoft Copilot, DeepSeek, Claude, Google AI Overviews und Exa Search, in über 30 Sprachen und über 150 Regionen. Einen Bezahltarif mit öffentlichem Preis gibt es nicht: Angeboten wird ein kostenloser Test über sieben Tage mit 50 Prompts auf ChatGPT, Gemini und AI Overviews, in einer Sprache und einer Region; die bezahlte Nutzung läuft über individuelle Enterprise-Preise nach einer Demo. Passt zu Marketingabteilungen in Konzernen, die eine betreute Plattform wollen und ein Verkaufsgespräch in Kauf nehmen. Grenze: Einen Preis sehen Sie erst im Gespräch mit dem Vertrieb.",
        "**Peec AI.** Die Peec AI GmbH sitzt in Berlin. Das Tool misst Sichtbarkeit (wie oft Ihre Marke genannt wird), Ihre Position im Vergleich zu anderen Marken, Tonalität und die Quellen, auf die sich die Modelle stützen. Starter kostet 85 € im Monat bei monatlicher Abrechnung für 50 Prompts, täglich getrackt auf drei Modellen Ihrer Wahl aus ChatGPT, AI Mode, AI Overviews, Microsoft Copilot, Gemini und Naver AI; weitere Modelle gibt es gegen Aufpreis. Pro kostet 205 € für 150 Prompts, Advanced 425 € für 350. Passt zu SEO- und Content-Teams in der DACH-Region, die einen europäischen Anbieter, Preise in Euro und einen Start ohne Vertrieb wollen. Grenze: Laut FAQ kosten weitere Länder und Sprachen nichts extra, weil sich der Preis nach Prompts richtet; in der Tarifliste steht „Multi country“ aber erst ab Advanced. Klären Sie das, bevor Sie Starter für Deutschland, Österreich und die Schweiz buchen.",
        "**Otterly.AI.** Die OtterlyAI GmbH ist in Persenbeug in Österreich eingetragen. Das Tool zählt Markennennungen und Zitationen, zeigt Ihren Anteil an den Zitationen im Vergleich zu Wettbewerbern und bietet ein GEO-Audit mit Crawlability-Prüfung und Content-Briefings. Lite kostet 29 $ im Monat bei monatlicher Abrechnung für 15 Prompts auf ChatGPT, Google AI Overviews, Perplexity und Microsoft Copilot; Claude, Google AI Mode und Gemini gibt es gegen Aufpreis. Standard kostet 189 $ für 100 Prompts. Jeder Tarif umfasst über 50 Länder, darunter Deutschland, Österreich und die Schweiz. Passt zu kleinen Teams, die günstig eine erste Baseline wollen. Grenze: Lite reicht nur, wenn Ihr Prompt-Bedarf (siehe Schritt 1 unten) bei höchstens 15 liegt, und drei der sieben KI-Dienste kosten extra.",
        "**Semrush AI Visibility Toolkit.** Kostet einzeln 99 $ im Monat, inklusive 25 Prompts für das Prompt-Tracking, oder steckt zusammen mit SEO in den Semrush-One-Tarifen. Es umfasst eine Sichtbarkeitsübersicht, Wettbewerbs- und Prompt-Recherche, Markenperformance mit Tonalität, tägliches Prompt-Tracking und ein Site-Audit für die KI-Suche. Die Wissensdatenbank nennt für das Prompt-Tracking ChatGPT und Google AI Mode; die Preisseite für die gesamte Suite listet „Google Search, ChatGPT, Perplexity, Gemini & more“. Prüfen Sie also, welche KI-Dienste in welchem Bericht stecken. Die Visibility Overview deckt 41 Länder ab, darunter Deutschland, das Prompt-Tracking über 220 Länder und Gebiete, und die Oberfläche gibt es auf Deutsch. Passt zu Teams, die Semrush ohnehin nutzen. Grenze: 25 getrackte Prompts, und laut eigener Dokumentation gibt es für das Toolkit keinen kostenlosen Test.",
        "**Ahrefs Brand Radar.** Arbeitet in zwei Modi. Der KI-Index stellt Fragen aus der Keyword-Datenbank von Ahrefs („People Also Ask“-Fragen, gestellt vom Standort des jeweiligen Keywords) an Google AI Overviews und AI Mode, ChatGPT, Perplexity, Gemini, Copilot, Grok und Claude und wertet Nennungen und Zitationen für jede beliebige Marke aus, auch für Wettbewerber; ein Index kostet 199 $ im Monat, alle zusammen 699 $. Das eigene Prompt-Tracking fragt Ihre Formulierungen ab und beginnt bei 50 $ im Monat für 2.500 Checks; im 699-$-Paket sind 2.500 solcher Checks enthalten. Passt zu Teams, die erst eine ganze Kategorie vergleichen und danach die eigenen Fragen tracken wollen. Grenze: Das eigene Tracking wird in Checks abgerechnet, nicht in Prompts. Fragen Sie Ahrefs, wie viele Checks ein Prompt über alle KI-Dienste und Durchläufe verbraucht, bevor Sie die Abdeckung schätzen.",
        "**Scrunch.** Trackt Prompts, Themen und Entitäten mit Zitationen, Wettbewerbern und Rankings und zeigt live, welche KI-Bots Ihre Website crawlen. Die Agent Experience Platform liefert KI-Agenten maschinenlesbare Versionen Ihrer Seiten aus. Starter kostet 250 $ im Monat bei jährlicher Abrechnung oder 300 $ bei monatlicher, für 350 Prompts auf ChatGPT, Claude, Gemini, Perplexity, Google AI Mode und AI Overviews sowie Meta AI. Nach eigener Aussage erfasst Scrunch Prompts in jeder Sprache und in jedem Land; Personas lassen sich pro Region anlegen. Passt zu Marken, die Tracking und Anpassungen für KI-Crawler von einem Anbieter wollen. Grenze: Bei beiden Abrechnungsarten ist das der teuerste buchbare Einstieg in diesem Vergleich.",
        "**Rankscale.** Die Rankscale GmbH sitzt in Wien. Das Tool zeigt einen KI-Sichtbarkeitswert, Rankings, Tonalität und Zitationen und prüft die KI-Tauglichkeit Ihrer Seiten an über 94 Punkten, über ChatGPT, Perplexity, Google AI Mode, Gemini, DeepSeek, Mistral, Claude, Grok und Copilot, in über 240 Regionen und Sprachen. Abgerechnet wird in Credits, in der Regel 0,25 Credits pro KI-Dienst und Prompt. Auf der von uns im Browser geprüften Preisseite nennt die Pro-Karte 1.200 Credits und 10 Marken-Dashboards für 99 € im Monat bei monatlicher Abrechnung; eine Textfassung derselben Seite zeigte Dollarbeträge, die Währung hängt also womöglich davon ab, von wo Sie die Seite öffnen. Essentials beginnt bei 20 €, die Vergleichstabelle ist bei den enthaltenen Credits aber widersprüchlich; klären Sie das Kontingent vor dem Kauf. Passt zu Agenturen mit mehreren Kundenmarken. Grenze: Wie viele Prompts Sie wirklich bekommen, hängt davon ab, wie viele KI-Dienste Sie einschalten. Rechnen Sie das vor der Tarifwahl durch.",
        "**Knowatoa.** Fragt sieben Dienste ab (ChatGPT, AI Overviews, AI Mode, Claude, Gemini, Meta AI und Perplexity) und meldet Sichtbarkeitslücken gegenüber Wettbewerbern, Zitationen und Warnungen zur Tonalität. Starter kostet 59 $ im Monat, Growth 199 $ mit API, MCP und Looker Studio. Laut Anbieter lassen sich alle Sprachen und Märkte tracken. Passt zu kleinen Marketingteams und SaaS-Gründern. Grenze: Die Preistabelle nennt nicht, wie viele Fragen ein Tarif enthält, und Copilot fehlt in der Liste.",
        "**Der SEO & GEO Researcher auf Sokosumi.** Das ist ein Audit, das Sie bei Bedarf beauftragen, kein laufendes Tracking. Der [SEO & GEO Researcher](/ai-coworkers/seo-geo-researcher) von der Serviceplan Group bekommt eine Domain mit 3 bis 6 Keyword-Stämmen (oder eine Datei mit bis zu 100 URLs), ein Land und eine Sprache. Zurück kommen eine Excel-Arbeitsmappe mit Keyword-Clustern, Content-Lücken gegenüber Wettbewerbern und Chancen sowie ein schriftlicher Bericht, der die Empfehlungen nach Aufwand ordnet. Auf der KI-Seite prüft er ChatGPT und Google AI Overviews: wie oft die Marke in LLM-Antworten genannt wird, welche Quellen am häufigsten zitiert werden, ob Sie in AI Overviews vorkommen, dazu Stichproben live in ChatGPT. Ein Durchlauf kostet 900 Credits, die vor dem Start angezeigt werden. Grenze: Er findet nur Seiten, die bereits für ein passendes Keyword ranken, und liefert pro Durchlauf eine Momentaufnahme. Wenn Sie eine tägliche Verlaufskurve brauchen, nehmen Sie eines der Tools oben.",
      ],
      workIntro: [
        "Klären Sie diese Punkte der Reihe nach, bevor Sie Preise vergleichen. Prüfen Sie deutschsprachige Ergebnisse und die benötigten Länder, bevor Sie einen Tarif wählen.",
      ],
      work: [
        "Schreiben Sie das Prompt-Set, bevor Sie das erste Tool öffnen, und zählen Sie es dann. Sammeln Sie für jedes Produkt oder jede Leistung die Fragen, die Ihre Käufer einem KI-Assistenten stellen würden, in deren Sprache und mit Schwerpunkt auf Fragen ohne Markennamen („bestes CRM für eine Agentur mit 20 Leuten“); Fragen mit Markennamen liefern meist nur Ihre eigene Website zurück. Dann rechnen Sie: Produkte × Fragen pro Produkt × Sprachen × Länder, falls der Anbieter jede Sprache und jedes Land als eigenen Prompt zählt (laut Peec-FAQ tut Peec das nicht; fragen Sie die anderen). Ein schmales zweites Produkt mit fünf Fragen passt noch in einen kleinen Tarif; ein einziges Produkt mit zehn Fragen, auf Deutsch und Englisch in Deutschland, Österreich und der Schweiz gestellt, ergibt bereits 60. Vergleichen Sie die Summe mit dem Tarif: Otterly Lite 15, Semrush 25, Peec Starter 50, Scrunch Starter 350.",
        "Wählen Sie die KI-Dienste, die Ihre Käufer nutzen, und prüfen Sie, ob der Tarif, den Sie tatsächlich buchen würden, sie abdeckt, nicht der Enterprise-Tarif. Knowatoa hat kein Copilot, bei Peec Starter wählen Sie drei Modelle, und Otterly berechnet Claude, AI Mode und Gemini extra.",
        "Klären Sie, was „Deutsch-Support“ für Sie heißt. Gemeint sein können vier Dinge: Prompts auf Deutsch, Deutschland, Österreich oder die Schweiz als Standort der Abfrage, eine deutschsprachige Oberfläche und Kundenservice auf Deutsch. Eine Länderliste belegt nur den zweiten Punkt. In unserer Prüfung gibt es bei Semrush die Oberfläche auf Deutsch, und Ahrefs hat eine deutsche Brand-Radar-Seite; die Websites der übrigen Anbieter sind englisch, und deutschsprachigen Kundenservice haben wir bei keinem Anbieter geprüft. Lassen Sie im Probezeitraum Ihre deutschen Prompts mit gesetztem Standort laufen und prüfen Sie, ob die Antworten zu dem passen, was jemand in München oder Wien sehen würde.",
        "Legen Sie fest, ob Sie Nennungen oder Zitationen zählen. Eine Nennung ist Ihr Markenname im Antworttext, eine Zitation ein Link auf Ihre Seite als Quelle. Die Berichte von Google und Microsoft zählen nur Links, die meisten Bezahltools beides. Fragen Sie also nach, was hinter dem „Visibility Score“ auf der Startseite steckt.",
        "Vergleichen Sie den Preis zuletzt, pro Prompt und pro KI-Dienst, und vergleichen Sie gleiche Abrechnungsarten (Scrunch Starter: 250 $ im Monat bei jährlicher, 300 $ bei monatlicher Abrechnung; die meisten anderen Preise hier sind monatlich).",
      ],
      measureIntro: [
        "Sobald ein Tool läuft, berichten Sie Zahlen, die Sie auch jemandem erklären können, der sich nie eingeloggt hat.",
      ],
      measure: [
        "Nennungsrate: der Anteil Ihrer Prompts, in denen ein KI-Dienst Ihre Marke genannt hat, je KI-Dienst, mit Anzahl der Prompts und Datum.",
        "Zitationsrate: der Anteil der Prompts, in denen Ihre Domain als Quelle auftaucht.",
        "Welche Wettbewerber in denselben Antworten vorkommen, und wie oft.",
        "Impressionen aus Googles KI-Funktionen und Zitationen in Bing, getrennt geführt und als Plattformdaten gekennzeichnet.",
        "Suchvolumen auf Ihre Marke und Direct Traffic nur als Nebenindikatoren. Andere Kanäle beeinflussen sie ebenfalls, deshalb belegen sie nicht, dass eine KI-Antwort einen Besuch ausgelöst hat.",
      ],
      risks: [
        "Sichtbarkeitswerte verschiedener Tools vergleichen. Jeder Anbieter berechnet seinen Wert aus eigenen Prompts und eigener Formel; eine 40 im einen Tool ist nicht dasselbe wie eine 40 im anderen.",
        "Das Prompt-Set jeden Monat ändern. Dann misst die Verlaufskurve Ihre Änderungen und nicht Ihre LLM-Sichtbarkeit.",
        "Nach der Enterprise-Featureliste kaufen. Profound nennt seine neun KI-Dienste für den individuellen Tarif; der Test umfasst drei.",
        "Englische Prompts für den deutschen Markt tracken. Ein US-englisches Prompt-Set sagt nichts Belastbares darüber, was jemand sieht, der auf Deutsch fragt.",
        "Messen mit Verbessern verwechseln. Tracking zeigt, wo Sie fehlen und wer stattdessen zitiert wird; allein ändert es die Antworten nicht. Manche Produkte enthalten Funktionen zum Handeln (das GEO-Audit und die Content-Briefings von Otterly, die Agent Experience Platform von Scrunch, das Readiness-Audit von Rankscale). Prüfen Sie, ob diese im gebuchten Tarif enthalten sind oder extra kosten.",
      ],
      sources: quellen,
      related: [
        ["KI-Markenmonitoring: was Google und Bing auswerten", "/guides/ai-brand-monitoring"],
        ["Answer Engine Optimization (AEO): was Google dazu schreibt", "/guides/answer-engine-optimization"],
        ["SEO und KI-Sichtbarkeit mit KI-Mitarbeitern", "/use-cases/seo-and-ai-visibility"],
        ["Die besten KI-Tools fürs Marketing", "/guides/best-ai-marketing-tools"],
      ],
    }),
    faqHeading: "Tools für KI-Sichtbarkeit: häufige Fragen",
    faq: [
      [
        "Was macht ein Tool für KI-Sichtbarkeit genau?",
        "Es schätzt, wie oft KI-Assistenten wie ChatGPT, Perplexity, Gemini und Google AI Overviews Ihre Marke nennen, welche Quellen sie zitieren und welche Wettbewerber vorkommen. Viele Tools fragen dafür in festen Abständen ein definiertes Prompt-Set ab, manche nutzen zusätzlich große Prompt-Indizes. Das Ergebnis ist eine Schätzung aus den geprüften Antworten, keine Plattformstatistik.",
      ],
      [
        "Welches Tool für KI-Sichtbarkeit ist das beste?",
        "Das hängt von Ihrem Team ab. Wer in der DACH-Region einen europäischen Anbieter und einen Start ohne Vertriebsgespräch sucht, schaut sich Peec AI (Berlin) oder Otterly.AI (Österreich) an. Wer bereits mit Semrush oder Ahrefs arbeitet, kann deren KI-Module dazubuchen. Bei größeren Vorhaben vergleichen Sie Enterprise-Abdeckung, Exporte und Vertragsbedingungen mit Ihren Anforderungen.",
      ],
      [
        "Gibt es ein kostenloses Tool für KI-Sichtbarkeit?",
        "Der Bericht zur Leistung generativer KI in der Google Search Console und AI Performance in den Bing Webmaster Tools kosten nichts. Sie zählen aber Links auf Ihre Seite statt Markennennungen und decken nur die Flächen von Google und Microsoft ab. Profound und Rankscale (Pro) bieten kostenlose Tests über sieben Tage, für das Semrush-Toolkit gibt es keinen.",
      ],
      [
        "Wie komme ich in ChatGPT-Antworten vor?",
        "Tracking allein sorgt nicht dafür, dass ChatGPT Sie nennt; es zeigt, ob das passiert. Nutzen Sie ein Tool, um die Prompts zu finden, bei denen Sie fehlen, und die Quellen, die stattdessen zitiert werden, und arbeiten Sie dann an genau diesen Seiten und Quellen. Was Google zu seinen eigenen KI-Funktionen dokumentiert, steht in unserem [Leitfaden zur Answer Engine Optimization](/guides/answer-engine-optimization).",
      ],
      [
        "Welche Tools können deutsche Prompts tracken?",
        "Bei Prompts und Märkten: Profound unterstützt über 30 Sprachen, Scrunch erfasst nach eigener Aussage Prompts in jeder Sprache, Rankscale nennt über 240 Regionen und Sprachen, Knowatoa alle Sprachen und Märkte, und Otterly und Semrush führen Deutschland als Land. Peec berechnet laut FAQ keine Aufpreise für Länder und Sprachen, nennt „Multi country“ in der Tarifliste aber erst ab Advanced. Eine deutsche Oberfläche konnten wir nur bei Semrush bestätigen, deutschsprachigen Kundenservice bei keinem Anbieter. Testen Sie im Probezeitraum mit Ihren eigenen deutschen Prompts.",
      ],
      [
        "Ist KI-Sichtbarkeit dasselbe wie GEO-Optimierung?",
        "Nein. GEO-Optimierung (Generative Engine Optimization) ist die Arbeit daran, wie KI-Antworten Sie beschreiben und zitieren. KI-Sichtbarkeit ist die Messung, die zeigt, ob diese Arbeit etwas bewegt hat.",
      ],
    ],
  },
};

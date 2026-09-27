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
  ["Semrush Knowledge Base: AI Visibility Toolkit", "https://www.semrush.com/kb/1493-ai-toolkit"],
  ["Semrush: pricing", "https://www.semrush.com/pricing/"],
  ["Ahrefs: Brand Radar", "https://ahrefs.com/brand-radar"],
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
  ["Semrush Knowledge Base: AI Visibility Toolkit", "https://www.semrush.com/kb/1493-ai-toolkit"],
  ["Semrush: Preise", "https://www.semrush.com/pricing/"],
  ["Ahrefs: Brand Radar", "https://ahrefs.com/brand-radar"],
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

export default {
  slug: "best-ai-visibility-tools",
  category: "advanced",
  order: 206,
  en: {
    title: "Best AI visibility tools in 2026: what each one measures",
    description:
      "Profound, Peec AI, Otterly, Semrush, Ahrefs Brand Radar and more: which AI engines each tracks, its entry price, German support and one limitation.",
    body: topic("en", {
      intro: [
        "An AI visibility tool sends a fixed set of prompts to ChatGPT, Perplexity, Gemini, Google AI Overviews and AI Mode, Copilot or Claude on a schedule, then records whether your brand was named, which sources were cited and which competitors showed up instead. The engines don't report brand mentions to you themselves, so sampling like this is the only way to get that number. Where the tools differ is in which engines they query, how many prompts you get for the money, and whether they can ask in German for a German market.",
        "This guide compares eight paid tools on their own pricing pages and documentation as of September 2026, plus the two free first-party reports from Google and Microsoft. Some teams call the work generative engine optimization (GEO), others answer engine optimization (AEO); the measurement problem is the same either way.",
      ],
      stateIntro: [
        "Every fact below comes from the vendor's own site. Prices are the cheapest plan that actually tracks prompts, in the vendor's currency, as of September 2026.",
      ],
      state: [
        "**Google Search Console and Bing Webmaster Tools (free).** Start here, because this is the only data that comes from the engines themselves. Search Console is a free Google service; its generative AI performance report counts impressions of links to your site in AI Overviews and AI Mode, broken down by page, country, date and device, and Google says it reached all websites worldwide on 31 August 2026. Bing Webmaster Tools' AI Performance reports citations in Copilot, Bing and partner AI experiences, with grounding queries and a Citation Share metric. Limitation: both count links to your site rather than whether a model names your brand, and neither covers ChatGPT, Perplexity or Claude. Our [AI brand monitoring guide](/guides/ai-brand-monitoring) explains what each number means.",
        "**Profound.** Reports visibility scores, share of voice, the sites cited in answers about you, and sentiment (how AI describes your brand). The Enterprise plan tracks up to nine engines: ChatGPT, Perplexity, Google AI Mode, Gemini, Microsoft Copilot, DeepSeek, Claude, Google AI Overviews and Exa Search, in 30+ languages and 150+ regions. The entry point is a free seven-day trial with 50 prompts on ChatGPT, Gemini and AI Overviews in one language and one region; after that, pricing is custom and starts with a demo. Suits enterprise marketing teams that want a managed platform and don't mind a sales process. Limitation: no self-serve paid plan is listed, so you won't see a price before you talk to sales.",
        "**Peec AI.** Peec AI GmbH is based in Berlin. It measures visibility (how often your brand is mentioned), your position against other brands, sentiment, and the sources models cite. Starter costs €85 a month for 50 prompts tracked daily on three models you pick from ChatGPT, AI Mode, AI Overviews, Microsoft Copilot, Gemini and Naver AI; an extra model is an add-on at €25 a month on Starter. Pro costs €205 for 150 prompts. Suits SEO and content teams in DACH that want a European vendor, euro pricing and a self-serve start. Limitation: Peec's FAQ says extra countries and languages cost nothing because price follows prompts, yet its plan list names \"multi country\" only from Advanced (€425), so ask which applies before you buy Starter for Germany, Austria and Switzerland.",
        "**Otterly.AI.** OtterlyAI GmbH is registered in Persenbeug, Austria. It counts brand mentions and citations, shows your share of citations against competitors, and adds a GEO audit with crawlability checks and content briefs. Lite costs $29 a month for 15 prompts on ChatGPT, Google AI Overviews, Perplexity and Microsoft Copilot, with Claude, Google AI Mode and Gemini as add-ons; Standard costs $189 for 100 prompts. Every plan includes 50+ countries, and Germany, Austria and Switzerland are in its country list. Suits small teams that want a cheap first baseline. Limitation: 15 prompts is enough to learn the tool, but too few to cover more than one product line.",
        "**Semrush AI Visibility Toolkit.** Costs $99 a month on its own, or comes bundled with SEO in the Semrush One plans. It covers a visibility overview, competitor and prompt research, brand performance and sentiment, daily prompt tracking and an AI search site audit. Semrush's knowledge base names ChatGPT and Google AI Mode for prompt tracking, while its pricing page lists \"Google Search, ChatGPT, Perplexity, Gemini & more\". Visibility Overview covers 41 countries including Germany, and prompt tracking covers 220+ countries and territories. Suits teams already paying for Semrush. Limitation: Semrush's own documentation says the toolkit has no free trial.",
        "**Ahrefs Brand Radar.** Instead of your prompts, Brand Radar runs questions taken from Ahrefs' keyword database (People Also Ask questions, asked from the keyword's location) through Google AI Overviews and AI Mode, ChatGPT, Perplexity, Gemini, Copilot, Grok and Claude, then reports mentions and citations for any brand, including competitors. One AI index costs $199 a month and all of them $699, which includes 2,500 custom prompt checks; custom prompt tracking on its own starts at $50 a month for 2,500 checks. Suits teams that want to benchmark a whole category without writing a prompt set first. Limitation: the index prompts are Ahrefs' questions, and tracking your exact wording is a separate purchase.",
        "**Scrunch.** Tracks prompts, topics and entities with citations, competitors and rankings, plus a live feed of AI bots crawling your site. Its Agent Experience Platform serves machine-readable versions of your pages to AI agents. Starter costs $250 a month billed annually, or $300 month to month, for 350 prompts on ChatGPT, Claude, Gemini, Perplexity, Google AI Mode and AI Overviews, and Meta AI. Scrunch says it records responses for prompts written in any language in every country, and you can set up personas per region. Suits brands that want tracking and changes for AI crawlers from one vendor. Limitation: it has the highest entry price of the self-serve plans in this list.",
        "**Rankscale.** Rankscale GmbH is based in Vienna. It reports an AI visibility score, rankings, sentiment and citations, and runs an AI-readiness audit against 94+ checkpoints, across ChatGPT, Perplexity, Google AI Mode, Gemini, DeepSeek, Mistral, Claude, Grok and Copilot, in 240+ regions and languages. Billing runs on credits, typically 0.25 credits per engine per prompt. Essentials starts at $20 a month but lists zero monthly credits, so tracking really starts with Pro at $99 for 1,200 credits and 10 brand dashboards. Suits agencies running several client brands. Limitation: your real prompt count depends on how many engines you switch on, so do the arithmetic before you pick a plan.",
        "**Knowatoa.** Checks seven services (ChatGPT, AI Overviews, AI Mode, Claude, Gemini, Meta AI and Perplexity) and reports competitor visibility gaps, citations and brand sentiment alerts. Starter costs $59 a month; Growth costs $199 and adds API, MCP and Looker Studio. It says you can track every language and market. Suits small marketing teams and SaaS founders. Limitation: the pricing table doesn't say how many questions each plan includes, and Copilot isn't on its list.",
        "**Sokosumi's SEO & GEO Researcher.** This is an audit you run when you need one, not a tracker. The [SEO & GEO Researcher](/ai-coworkers/seo-geo-researcher), built by Serviceplan Group, takes a domain with 3 to 6 keyword stems (or a file of up to 100 URLs), a country and a language, and returns an Excel workbook of keyword clusters, content gaps against competitors and opportunities, plus a written report that sorts recommendations by effort. On the AI side it checks ChatGPT and Google AI Overviews: brand mention counts in LLM responses, the top citing sources, AI Overview presence and live ChatGPT spot-checks. A run costs 900 credits, shown before it starts. Limitation: it only surfaces pages that already rank for a relevant keyword, and it gives you a snapshot per run; for a daily trend line, use one of the trackers above.",
      ],
      workIntro: [
        "Answer these questions in order before you compare prices. The cheapest plan that fails step 3 is wasted money for a DACH team.",
      ],
      work: [
        "Write the prompt set before you open a single tool. List the questions a buyer would type into an assistant about your category, in the buyer's language, and weight them towards unbranded ones (\"best CRM for a 20-person agency\"), because branded prompts mostly return your own site. The number of prompts decides the plan: Otterly's Lite has 15, Peec's Starter 50, Scrunch's Starter 350.",
        "Pick the engines your buyers use, then check that the plan you'd actually buy covers them, not the Enterprise plan. Knowatoa has no Copilot, Peec's Starter lets you choose three models, and Otterly charges extra for Claude, AI Mode and Gemini.",
        "Test German during the trial. Run your German prompts with Germany, Austria or Switzerland as the location and check whether the answers look like what a buyer in Munich or Vienna would see. Most vendors claim multi-country support; only a trial shows whether it holds for your category.",
        "Decide what you're counting: mentions or citations.A mention is your brand named in the answer text; a citation is a link to your site as a source. Google's and Microsoft's reports only count links, and most paid tools report both, so find out which one sits behind the headline \"visibility score\".",
        "Compare price last, per prompt and per engine, and check whether the listed price assumes annual billing (Scrunch's Starter is $250 a month on annual billing and $300 month to month).",
      ],
      measureIntro: [
        "Once a tool is running, report numbers you can explain to someone who has never logged into it.",
      ],
      measure: [
        "Mention rate: the share of your prompts where an engine named your brand, per engine, with prompt count and date stated.",
        "Citation rate: the share of prompts where your domain appeared as a source.",
        "Which competitors appear in the same answers, and how often.",
        "Google AI-feature impressions and Bing citations, kept separate and labelled as first-party data.",
        "Branded search volume and direct traffic, where exposure without a click tends to show up.",
      ],
      risks: [
        "Comparing visibility scores across tools. Each vendor builds its score from its own prompts and its own formula, so a 40 in one tool and a 40 in another measure different things.",
        "Changing the prompt set every month, which turns the trend line into a record of your edits.",
        "Buying on the Enterprise feature list. Profound lists its nine engines on the custom plan, while its trial covers three.",
        "Tracking English prompts for a German market. A US-English prompt set tells you nothing verified about what a buyer asking in German sees.",
        "Expecting the tracker to fix anything. It shows where you're missing and who gets cited instead; the pages, sources and PR that change the answer are separate work.",
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
        "It sends a fixed set of prompts to assistants such as ChatGPT, Perplexity, Gemini and Google AI Overviews on a schedule and records whether your brand is named, which sources are cited and which competitors appear. The number it gives you is a sample of those prompts, not platform data.",
      ],
      [
        "Which AI visibility tool is best?",
        "It depends on your team. A DACH team that wants a European vendor and a self-serve start should look at Peec AI (Berlin) or Otterly.AI (Austria). Teams already on Semrush or Ahrefs can add those vendors' AI modules. Enterprises that need many engines and languages will end up talking to Profound or Scrunch.",
      ],
      [
        "Is there a free AI visibility tool?",
        "Google Search Console's generative AI performance report and Bing Webmaster Tools' AI Performance cost nothing, but they count links to your site, not brand mentions, and cover only Google's and Microsoft's own surfaces. Profound offers a free seven-day trial; Semrush's toolkit has no free trial.",
      ],
      [
        "How do I rank in ChatGPT?",
        "None of these tools can make ChatGPT mention you; they measure whether it does. Use one to find the prompts where you're missing and the sources cited instead, then work on those pages and sources. Our [answer engine optimization guide](/guides/answer-engine-optimization) covers what Google documents about its own AI features.",
      ],
      [
        "Which tools track German prompts?",
        "Profound supports 30+ languages, Scrunch says it records prompts in any language, Rankscale lists 240+ regions and languages, Knowatoa says every language and market, and Otterly and Semrush both list Germany as a country. Peec includes countries and languages at no extra cost per its FAQ, but lists multi-country only from its Advanced plan. Test with your own German prompts during a trial.",
      ],
      [
        "Is AI visibility the same as generative engine optimization?",
        "No. Generative engine optimization (GEO) is the work of changing how AI answers describe and cite you; AI visibility is the measurement that tells you whether that work moved anything.",
      ],
    ],
  },
  de: {
    title: "KI-Sichtbarkeit messen: Tools für GEO im Vergleich",
    description:
      "Profound, Peec AI, Otterly, Semrush, Ahrefs Brand Radar und mehr: welche KI-Suchen jedes Tool abfragt, Einstiegspreis, Deutsch-Support und eine Schwäche.",
    body: topic("de", {
      intro: [
        "Ein Tool für KI-Sichtbarkeit schickt in festen Abständen immer dieselben Prompts an ChatGPT, Perplexity, Gemini, Google AI Overviews und AI Mode, Copilot oder Claude. Danach hält es fest, ob Ihre Marke genannt wurde, welche Quellen zitiert wurden und welche Wettbewerber stattdessen auftauchen. Die KI-Anbieter selbst melden Ihnen keine Markennennungen, deshalb gibt es diese Zahl nur über solche Stichproben. Unterschiede zwischen den Tools liegen darin, welche KI-Suchen sie abfragen, wie viele Prompts Sie fürs Geld bekommen und ob sie auf Deutsch für den deutschen Markt fragen können.",
        "Dieser Vergleich stellt acht kostenpflichtige Tools nebeneinander, auf Basis ihrer eigenen Preisseiten und Dokumentation, Stand September 2026. Dazu kommen die beiden kostenlosen Berichte von Google und Microsoft. Ob Sie die Arbeit GEO-Optimierung (Generative Engine Optimization) oder AEO nennen, ändert an der Messfrage nichts.",
      ],
      stateIntro: [
        "Alle Angaben stammen von den Websites der Anbieter. Preise beziehen sich auf den günstigsten Tarif, der tatsächlich Prompts trackt, in der Währung des Anbieters, Stand September 2026.",
      ],
      state: [
        "**Google Search Console und Bing Webmaster Tools (kostenlos).** Hier sollten Sie anfangen, denn nur diese Daten kommen von den Suchmaschinen selbst. Die Search Console ist ein kostenloser Google-Dienst. Ihr Bericht zur Leistung generativer KI zählt, wie oft Links auf Ihre Website in AI Overviews und AI Mode angezeigt wurden, aufgeschlüsselt nach Seite, Land, Datum und Gerät; laut Google steht er seit dem 31. August 2026 allen Websites weltweit zur Verfügung. AI Performance in den Bing Webmaster Tools meldet Zitationen in Copilot, Bing und KI-Angeboten von Partnern, mit Grounding Queries und der Kennzahl Citation Share. Schwäche: Beide zählen Links auf Ihre Seite, nicht ob ein Modell Ihre Marke nennt, und keiner deckt ChatGPT, Perplexity oder Claude ab. Was die einzelnen Zahlen bedeuten, erklärt unser [Leitfaden zum KI-Markenmonitoring](/guides/ai-brand-monitoring).",
        "**Profound.** Misst Visibility Scores, Share of Voice, die in Antworten über Sie zitierten Websites und die Tonalität, also wie KI Ihre Marke beschreibt. Der Enterprise-Tarif trackt bis zu neun KI-Suchen: ChatGPT, Perplexity, Google AI Mode, Gemini, Microsoft Copilot, DeepSeek, Claude, Google AI Overviews und Exa Search, in über 30 Sprachen und über 150 Regionen. Einstieg ist ein kostenloser Test über sieben Tage mit 50 Prompts auf ChatGPT, Gemini und AI Overviews, in einer Sprache und einer Region; danach gibt es individuelle Preise nach einer Demo. Passt zu Marketingabteilungen in Konzernen, die eine betreute Plattform wollen und ein Verkaufsgespräch in Kauf nehmen. Schwäche: Es gibt keinen buchbaren Bezahltarif, einen Preis sehen Sie erst im Gespräch mit dem Vertrieb.",
        "**Peec AI.** Die Peec AI GmbH sitzt in Berlin. Das Tool misst Sichtbarkeit (wie oft Ihre Marke genannt wird), Ihre Position im Vergleich zu anderen Marken, Tonalität und die Quellen, auf die sich die Modelle stützen. Starter kostet 85 € im Monat für 50 Prompts, täglich getrackt auf drei Modellen Ihrer Wahl aus ChatGPT, AI Mode, AI Overviews, Microsoft Copilot, Gemini und Naver AI; jedes weitere Modell kostet im Starter-Tarif 25 € im Monat extra. Pro kostet 205 € für 150 Prompts. Passt zu SEO- und Content-Teams in der DACH-Region, die einen europäischen Anbieter, Preise in Euro und einen Start ohne Vertrieb wollen. Schwäche: Laut FAQ kosten weitere Länder und Sprachen nichts extra, weil sich der Preis nach Prompts richtet; in der Tarifliste steht „Multi country“ aber erst ab Advanced (425 €). Klären Sie das, bevor Sie Starter für Deutschland, Österreich und die Schweiz buchen.",
        "**Otterly.AI.** Die OtterlyAI GmbH ist in Persenbeug in Österreich eingetragen. Das Tool zählt Markennennungen und Zitationen, zeigt Ihren Anteil an den Zitationen im Vergleich zu Wettbewerbern und bietet ein GEO-Audit mit Crawlability-Prüfung und Content-Briefings. Lite kostet 29 $ im Monat für 15 Prompts auf ChatGPT, Google AI Overviews, Perplexity und Microsoft Copilot; Claude, Google AI Mode und Gemini gibt es gegen Aufpreis. Standard kostet 189 $ für 100 Prompts. Jeder Tarif umfasst über 50 Länder, darunter Deutschland, Österreich und die Schweiz. Passt zu kleinen Teams, die günstig eine erste Baseline wollen. Schwäche: Mit 15 Prompts lernen Sie das Tool kennen, für mehr als eine Produktlinie reichen sie nicht.",
        "**Semrush AI Visibility Toolkit.** Kostet einzeln 99 $ im Monat oder steckt zusammen mit SEO in den Semrush-One-Tarifen. Es umfasst eine Sichtbarkeitsübersicht, Wettbewerbs- und Prompt-Recherche, Markenperformance mit Tonalität, tägliches Prompt-Tracking und ein Site-Audit für die KI-Suche. Die Semrush-Wissensdatenbank nennt für Prompt-Tracking ChatGPT und Google AI Mode, die Preisseite dagegen „Google Search, ChatGPT, Perplexity, Gemini & more“. Die Visibility Overview deckt 41 Länder ab, darunter Deutschland; das Prompt-Tracking über 220 Länder und Gebiete. Passt zu Teams, die Semrush ohnehin nutzen. Schwäche: Laut eigener Dokumentation gibt es für das Toolkit keinen kostenlosen Test.",
        "**Ahrefs Brand Radar.** Brand Radar arbeitet nicht mit Ihren Prompts, sondern mit Fragen aus der Keyword-Datenbank von Ahrefs („People Also Ask“-Fragen, gestellt vom Standort des jeweiligen Keywords). Diese laufen durch Google AI Overviews und AI Mode, ChatGPT, Perplexity, Gemini, Copilot, Grok und Claude; ausgewertet werden Nennungen und Zitationen für jede beliebige Marke, auch die der Wettbewerber. Ein KI-Index kostet 199 $ im Monat, alle zusammen 699 $ inklusive 2.500 Checks für eigene Prompts; eigenes Prompt-Tracking allein beginnt bei 50 $ im Monat für 2.500 Checks. Passt zu Teams, die eine ganze Kategorie vergleichen wollen, ohne vorher Prompts zu schreiben. Schwäche: Die Index-Prompts sind die Fragen von Ahrefs; Ihre eigenen Formulierungen zu tracken, kostet extra.",
        "**Scrunch.** Trackt Prompts, Themen und Entitäten mit Zitationen, Wettbewerbern und Rankings und zeigt live, welche KI-Bots Ihre Website crawlen. Die Agent Experience Platform liefert KI-Agenten maschinenlesbare Versionen Ihrer Seiten aus. Starter kostet 250 $ im Monat bei jährlicher Zahlung oder 300 $ bei monatlicher, für 350 Prompts auf ChatGPT, Claude, Gemini, Perplexity, Google AI Mode und AI Overviews sowie Meta AI. Nach eigener Aussage erfasst Scrunch Prompts in jeder Sprache und in jedem Land; Personas lassen sich pro Region anlegen. Passt zu Marken, die Tracking und Anpassungen für KI-Crawler von einem Anbieter wollen. Schwäche: Unter den buchbaren Tarifen in diesem Vergleich ist das der teuerste Einstieg.",
        "**Rankscale.** Die Rankscale GmbH sitzt in Wien. Das Tool zeigt einen KI-Sichtbarkeitswert, Rankings, Tonalität und Zitationen und prüft die KI-Tauglichkeit Ihrer Seiten an über 94 Punkten, über ChatGPT, Perplexity, Google AI Mode, Gemini, DeepSeek, Mistral, Claude, Grok und Copilot, in über 240 Regionen und Sprachen. Abgerechnet wird in Credits, in der Regel 0,25 Credits pro KI-Suche und Prompt. Essentials beginnt bei 20 $ im Monat, enthält laut Tariftabelle aber keine monatlichen Credits; echtes Tracking beginnt also mit Pro für 99 $ mit 1.200 Credits und 10 Marken-Dashboards. Passt zu Agenturen mit mehreren Kundenmarken. Schwäche: Wie viele Prompts Sie wirklich bekommen, hängt davon ab, wie viele KI-Suchen Sie einschalten. Rechnen Sie das vor der Tarifwahl durch.",
        "**Knowatoa.** Fragt sieben Dienste ab (ChatGPT, AI Overviews, AI Mode, Claude, Gemini, Meta AI und Perplexity) und meldet Sichtbarkeitslücken gegenüber Wettbewerbern, Zitationen und Warnungen zur Tonalität. Starter kostet 59 $ im Monat, Growth 199 $ mit API, MCP und Looker Studio. Laut Anbieter lassen sich alle Sprachen und Märkte tracken. Passt zu kleinen Marketingteams und SaaS-Gründern. Schwäche: Die Preistabelle nennt nicht, wie viele Fragen ein Tarif enthält, und Copilot fehlt in der Liste.",
        "**Der SEO & GEO Researcher auf Sokosumi.** Das ist ein Audit, das Sie bei Bedarf beauftragen, kein laufendes Tracking. Der [SEO & GEO Researcher](/ai-coworkers/seo-geo-researcher) von der Serviceplan Group bekommt eine Domain mit 3 bis 6 Keyword-Stämmen (oder eine Datei mit bis zu 100 URLs), ein Land und eine Sprache. Zurück kommen eine Excel-Arbeitsmappe mit Keyword-Clustern, Content-Lücken gegenüber Wettbewerbern und Chancen sowie ein schriftlicher Bericht, der die Empfehlungen nach Aufwand ordnet. Auf der KI-Seite prüft er ChatGPT und Google AI Overviews: wie oft die Marke in LLM-Antworten genannt wird, welche Quellen am häufigsten zitiert werden, ob Sie in AI Overviews vorkommen, dazu Stichproben live in ChatGPT. Ein Durchlauf kostet 900 Credits, die vor dem Start angezeigt werden. Schwäche: Er findet nur Seiten, die bereits für ein passendes Keyword ranken, und liefert pro Durchlauf eine Momentaufnahme. Wenn Sie eine tägliche Verlaufskurve brauchen, nehmen Sie eines der Tools oben.",
      ],
      workIntro: [
        "Klären Sie diese Punkte der Reihe nach, bevor Sie Preise vergleichen. Der günstigste Tarif nützt einem DACH-Team nichts, wenn er an Schritt 3 scheitert.",
      ],
      work: [
        "Schreiben Sie das Prompt-Set, bevor Sie das erste Tool öffnen. Sammeln Sie die Fragen, die Ihre Käufer einem KI-Assistenten zu Ihrer Kategorie stellen würden, in deren Sprache, und setzen Sie den Schwerpunkt auf Fragen ohne Markennamen („bestes CRM für eine Agentur mit 20 Leuten“); Fragen mit Markennamen liefern meist nur Ihre eigene Website zurück. Die Zahl der Prompts bestimmt den Tarif: Otterly Lite hat 15, Peec Starter 50, Scrunch Starter 350.",
        "Wählen Sie die KI-Suchen, die Ihre Käufer nutzen, und prüfen Sie, ob der Tarif, den Sie tatsächlich buchen würden, sie abdeckt, nicht der Enterprise-Tarif. Knowatoa hat kein Copilot, bei Peec Starter wählen Sie drei Modelle, und Otterly berechnet Claude, AI Mode und Gemini extra.",
        "Testen Sie Deutsch im Probezeitraum. Lassen Sie Ihre deutschen Prompts mit Deutschland, Österreich oder der Schweiz als Standort laufen und prüfen Sie, ob die Antworten zu dem passen, was jemand in München oder Wien sehen würde. Mehrere Länder versprechen die meisten Anbieter; ob das für Ihre Kategorie trägt, zeigt nur der Test.",
        "Legen Sie fest, ob Sie Nennungen oder Zitationen zählen. Eine Nennung ist Ihr Markenname im Antworttext, eine Zitation ein Link auf Ihre Seite als Quelle. Die Berichte von Google und Microsoft zählen nur Links, die meisten Bezahltools beides. Fragen Sie also nach, was hinter dem „Visibility Score“ auf der Startseite steckt.",
        "Vergleichen Sie den Preis zuletzt, pro Prompt und pro KI-Suche, und achten Sie darauf, ob der angegebene Preis jährliche Zahlung voraussetzt (Scrunch Starter: 250 $ im Monat bei jährlicher, 300 $ bei monatlicher Zahlung).",
      ],
      measureIntro: [
        "Sobald ein Tool läuft, berichten Sie Zahlen, die Sie auch jemandem erklären können, der sich nie eingeloggt hat.",
      ],
      measure: [
        "Nennungsrate: der Anteil Ihrer Prompts, in denen eine KI-Suche Ihre Marke genannt hat, je KI-Suche, mit Anzahl der Prompts und Datum.",
        "Zitationsrate: der Anteil der Prompts, in denen Ihre Domain als Quelle auftaucht.",
        "Welche Wettbewerber in denselben Antworten vorkommen, und wie oft.",
        "Impressionen aus Googles KI-Funktionen und Zitationen in Bing, getrennt geführt und als Plattformdaten gekennzeichnet.",
        "Suchvolumen auf Ihre Marke und Direct Traffic, denn dort zeigt sich Sichtbarkeit ohne Klick am ehesten.",
      ],
      risks: [
        "Sichtbarkeitswerte verschiedener Tools vergleichen. Jeder Anbieter berechnet seinen Wert aus eigenen Prompts und eigener Formel; eine 40 im einen Tool ist nicht dasselbe wie eine 40 im anderen.",
        "Das Prompt-Set jeden Monat ändern. Dann misst die Verlaufskurve Ihre Änderungen und nicht Ihre LLM-Sichtbarkeit.",
        "Nach der Enterprise-Featureliste kaufen. Profound nennt seine neun KI-Suchen für den individuellen Tarif; der Test umfasst drei.",
        "Englische Prompts für den deutschen Markt tracken. Ein US-englisches Prompt-Set sagt nichts Belastbares darüber, was jemand sieht, der auf Deutsch fragt.",
        "Vom Tool erwarten, dass es etwas verbessert. Es zeigt, wo Sie fehlen und wer stattdessen zitiert wird; die Seiten, Quellen und Pressearbeit, die die Antwort verändern, sind eine eigene Aufgabe.",
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
        "Es schickt in festen Abständen dieselben Prompts an KI-Assistenten wie ChatGPT, Perplexity, Gemini und Google AI Overviews und hält fest, ob Ihre Marke genannt wird, welche Quellen zitiert werden und welche Wettbewerber vorkommen. Die Zahl, die Sie bekommen, ist eine Stichprobe aus diesen Prompts, keine Plattformstatistik.",
      ],
      [
        "Welches Tool für KI-Sichtbarkeit ist das beste?",
        "Das hängt von Ihrem Team ab. Wer in der DACH-Region einen europäischen Anbieter und einen Start ohne Vertriebsgespräch sucht, schaut sich Peec AI (Berlin) oder Otterly.AI (Österreich) an. Wer bereits mit Semrush oder Ahrefs arbeitet, kann deren KI-Module dazubuchen. Konzerne mit vielen KI-Suchen und Sprachen landen eher bei Profound oder Scrunch.",
      ],
      [
        "Gibt es ein kostenloses Tool für KI-Sichtbarkeit?",
        "Der Bericht zur Leistung generativer KI in der Google Search Console und AI Performance in den Bing Webmaster Tools kosten nichts. Sie zählen aber Links auf Ihre Seite statt Markennennungen und decken nur die Flächen von Google und Microsoft ab. Profound bietet einen kostenlosen Test über sieben Tage, für das Semrush-Toolkit gibt es keinen.",
      ],
      [
        "Wie komme ich in ChatGPT-Antworten vor?",
        "Keines dieser Tools sorgt dafür, dass ChatGPT Sie nennt; es misst nur, ob das passiert. Nutzen Sie es, um die Prompts zu finden, bei denen Sie fehlen, und die Quellen, die stattdessen zitiert werden, und arbeiten Sie dann an genau diesen Seiten und Quellen. Was Google zu seinen eigenen KI-Funktionen dokumentiert, steht in unserem [Leitfaden zur Answer Engine Optimization](/guides/answer-engine-optimization).",
      ],
      [
        "Welche Tools können deutsche Prompts tracken?",
        "Profound unterstützt über 30 Sprachen, Scrunch erfasst nach eigener Aussage Prompts in jeder Sprache, Rankscale nennt über 240 Regionen und Sprachen, Knowatoa alle Sprachen und Märkte, und Otterly und Semrush führen Deutschland als Land. Peec berechnet laut FAQ keine Aufpreise für Länder und Sprachen, nennt „Multi country“ in der Tarifliste aber erst ab Advanced. Testen Sie im Probezeitraum mit Ihren eigenen deutschen Prompts.",
      ],
      [
        "Ist KI-Sichtbarkeit dasselbe wie GEO-Optimierung?",
        "Nein. GEO-Optimierung (Generative Engine Optimization) ist die Arbeit daran, wie KI-Antworten Sie beschreiben und zitieren. KI-Sichtbarkeit ist die Messung, die zeigt, ob diese Arbeit etwas bewegt hat.",
      ],
    ],
  },
};

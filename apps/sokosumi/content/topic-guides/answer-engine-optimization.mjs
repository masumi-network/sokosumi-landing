import { topic } from "../topic-guide-builder.mjs";

const sources = [
  ["AI features and your website — Google Search Central", "https://developers.google.com/search/docs/appearance/ai-features"],
  ["Optimizing your website for generative AI features on Google Search", "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide"],
  ["Robots meta tag, data-nosnippet, and X-Robots-Tag specifications — Google", "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag"],
  ["List of Google's common crawlers", "https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers"],
  ["Overview of OpenAI crawlers", "https://developers.openai.com/api/docs/bots"],
  ["Perplexity crawlers", "https://docs.perplexity.ai/docs/resources/perplexity-crawlers"],
];

const quellen = sources;

export default {
  slug: "answer-engine-optimization",
  category: "advanced",
  order: 202,
  en: {
    title: "Answer engine optimization: what Google actually says",
    description:
      "Google publishes a guide to generative AI features and it contradicts most AEO advice being sold. What the documentation states, which controls really govern AI answers, and what each crawler token does.",
    body: topic("en", {
      intro: [
        "\"Answer engine optimization\" and \"generative engine optimization\" are sold as new disciplines with new techniques. Google publishes documentation on this, and it is unusually blunt: there is no separate lever. That does not make the work pointless — it makes it ordinary, and the ordinary version is checkable.",
        "The confusion that costs teams real visibility is not about content style. It is about crawler tokens: which switch governs which surface. Several of them do the opposite of what their name suggests.",
      ],
      stateIntro: ["Quoted from Google's and the model providers' own documentation."],
      state: [
        "**There is no special optimization.** Google: \"There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.\"",
        "**Eligibility is ordinary search eligibility.** \"To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to be shown in Google Search with a snippet.\"",
        "**No AI-specific files or markup.** \"You don't need to create new machine readable files, AI text files, or markup to appear in these features. There's also no special schema.org structured data that you need to add.\" Google's optimization guide states it ignores llms.txt entirely — it neither harms nor helps.",
        "**Google names the tactics that do not work:** breaking content into tiny pieces for AI, writing in a specific way just for generative AI search, and building inauthentic mentions across the web.",
        "**`nosnippet` is the real off switch for answer inclusion.** It stops the text snippet *and* \"will also prevent the content from being used as a direct input for AI Overviews and AI Mode.\" `max-snippet` limits how much may be used; `data-nosnippet` scopes it to specific elements.",
        "**Google-Extended does not remove you from AI answers.** It governs whether crawled content trains future Gemini models, and Google states it \"does not impact a site's inclusion in Google Search nor is it used as a ranking signal.\" It has no separate user-agent string — it exists only as a robots.txt token.",
        "**OpenAI's tokens are independent.** `OAI-SearchBot` surfaces sites in ChatGPT search; `GPTBot` feeds foundation models; `ChatGPT-User` is user-triggered. OpenAI states a site can allow OAI-SearchBot to appear in search while disallowing GPTBot.",
        "**Perplexity's user fetches ignore robots.txt.** `PerplexityBot` respects robots.txt and is not used for foundation-model training, but `Perplexity-User` is user-triggered and \"generally ignores robots.txt rules.\"",
        "**Structured data still earns nothing by itself.** \"Google does not guarantee that your structured data will show up in search results, even if your page is marked up correctly.\"",
      ],
      workIntro: [
        "What is left, once the invented techniques are removed, is a short and unglamorous list.",
      ],
      work: [
        "Confirm the page is indexed and snippet-eligible. That is the stated entry condition, and it is the one most often broken by an inherited `noindex` or an over-broad robots rule.",
        "Audit your snippet directives before writing any content. A `nosnippet` or a tight `max-snippet` anywhere on a template silently excludes those pages from AI Overviews and AI Mode.",
        "Decide the crawler policy per surface, in writing: search inclusion, model training, and user-triggered fetches are three separate decisions with three separate tokens.",
        "Write the page for a reader who needs the answer, and keep the answer on the page rather than behind an interaction. Google's own priorities list unique, non-commodity content, page experience, and technical requirements.",
        "Use structured data where it maps to a real rich result, and make sure it matches visible content. Do not add it expecting an AI-answer effect.",
        "For commerce and local, keep Merchant Center feeds and Google Business Profiles current — Google names these as inputs that surface products and services in AI responses.",
        "Re-check after any migration or CMS change. Snippet directives and robots rules are exactly the settings that get restored to a default nobody chose.",
      ],
      measureIntro: [
        "Measure the surfaces the platforms report on, and be honest that the click is often not there to count.",
      ],
      measure: [
        "AI-feature impressions from Search Console's generative AI performance report, by page.",
        "Citations and Citation Share from Bing Webmaster Tools, which is the only query-level share metric published by a platform.",
        "Indexed and snippet-eligible coverage as a hygiene metric — the entry condition, tracked as a number.",
        "Visit quality rather than raw clicks. Google's own guidance on succeeding in AI search names this shift explicitly.",
        "Branded search and direct traffic, where exposure without a click tends to land.",
      ],
      risks: [
        "Buying an llms.txt implementation for Google visibility. Google says it ignores the file.",
        "Blocking Google-Extended believing it removes you from AI Overviews. It governs Gemini training and explicitly does not affect Search inclusion.",
        "Shipping a `nosnippet` for brand-safety reasons without realising it also removes the page from AI Overviews and AI Mode.",
        "Chopping pages into fragments \"so AI can parse them\" — a tactic Google names as ineffective.",
        "Assuming a robots.txt block stops Perplexity entirely; user-triggered fetches generally ignore it.",
        "Buying mentions to look authoritative. Google names inauthentic mentions as a tactic that does not work.",
      ],
      sources,
    }),
    faqHeading: "Answer engine optimization: common questions",
    faq: [
      [
        "Is AEO different from SEO?",
        "Per Google's documentation, not in terms of levers: eligibility for AI Overviews and AI Mode is ordinary indexing plus snippet eligibility, with no additional requirements and no special markup. What changes is measurement, because a cited answer often produces no click.",
      ],
      [
        "Should we publish an llms.txt file?",
        "Google states it ignores llms.txt and that the file neither harms nor helps visibility or rankings in Google Search. Other engines may differ, but do not expect a Google effect.",
      ],
      [
        "How do we stop our content appearing in AI answers?",
        "On Google, `nosnippet` prevents content being used as a direct input for AI Overviews and AI Mode, and there is a separate Search generative AI control. Blocking Google-Extended is not the switch — that governs Gemini training only.",
      ],
      [
        "Does structured data help us get cited?",
        "Google states there is no special schema.org markup for generative AI features and that structured data is not required for them. It remains worth adding where it maps to a rich result and matches visible content.",
      ],
    ],
  },
  de: {
    title: "Answer Engine Optimization: was Google tatsächlich sagt",
    description:
      "Google dokumentiert seine generativen KI-Funktionen — und widerspricht damit dem meisten, was als AEO verkauft wird. Was in der Doku steht, welche Regler KI-Antworten wirklich steuern und was jedes Crawler-Token bewirkt.",
    body: topic("de", {
      intro: [
        "„Answer Engine Optimization“ und „Generative Engine Optimization“ werden als neue Disziplinen mit neuen Techniken verkauft. Google dokumentiert das Thema und wird dabei ungewöhnlich deutlich: Es gibt keinen separaten Hebel. Das macht die Arbeit nicht sinnlos — es macht sie gewöhnlich, und die gewöhnliche Variante ist überprüfbar.",
        "Was Teams tatsächlich Sichtbarkeit kostet, ist nicht der Schreibstil, sondern die Crawler-Tokens: welcher Schalter welche Fläche steuert. Mehrere tun das Gegenteil dessen, was ihr Name nahelegt.",
      ],
      stateIntro: ["Zitiert aus der Dokumentation von Google und der Modellanbieter."],
      state: [
        "**Es gibt keine spezielle Optimierung.** Google: Für die Anzeige in AI Overviews oder AI Mode bestehen keine zusätzlichen Anforderungen und keine besonderen Optimierungen.",
        "**Die Voraussetzung ist normale Suchsichtbarkeit.** Eine Seite muss indexiert und mit Snippet in der Google Suche anzeigbar sein.",
        "**Keine KI-spezifischen Dateien oder Markups.** Weder maschinenlesbare Dateien noch spezielles schema.org-Markup sind nötig. llms.txt wird laut Googles Optimierungsleitfaden ignoriert — es schadet weder, noch hilft es.",
        "**Google benennt Taktiken, die nicht funktionieren:** Inhalte in Kleinstteile zerlegen, speziell für generative Suche schreiben und unechte Erwähnungen im Web aufbauen.",
        "**`nosnippet` ist der eigentliche Ausschalter.** Es unterbindet das Text-Snippet und verhindert zugleich, dass der Inhalt als direkter Input für AI Overviews und AI Mode genutzt wird. `max-snippet` begrenzt den nutzbaren Umfang, `data-nosnippet` wirkt auf einzelne Elemente.",
        "**Google-Extended entfernt niemanden aus KI-Antworten.** Es steuert, ob Inhalte künftige Gemini-Modelle trainieren, und beeinflusst laut Google weder die Aufnahme in die Google Suche noch das Ranking. Ein eigener User-Agent existiert nicht; das Token lebt ausschließlich in der robots.txt.",
        "**OpenAIs Tokens sind unabhängig voneinander.** `OAI-SearchBot` sorgt für die Anzeige in der ChatGPT-Suche, `GPTBot` speist Foundation-Modelle, `ChatGPT-User` ist nutzerausgelöst. Beides lässt sich getrennt erlauben oder sperren.",
        "**Perplexitys nutzerausgelöste Abrufe ignorieren robots.txt.** `PerplexityBot` hält sich daran und trainiert keine Foundation-Modelle; `Perplexity-User` ignoriert die Regeln in der Regel.",
        "**Strukturierte Daten allein garantieren nichts.** Google gibt keine Zusicherung, dass strukturierte Daten in den Suchergebnissen erscheinen, selbst bei korrektem Markup.",
      ],
      workIntro: ["Zieht man die erfundenen Techniken ab, bleibt eine kurze, unspektakuläre Liste."],
      work: [
        "Prüfen, ob die Seite indexiert und snippet-fähig ist. Das ist die genannte Eintrittsbedingung — und die, die ein geerbtes `noindex` oder eine zu breite robots-Regel am häufigsten bricht.",
        "Snippet-Direktiven prüfen, bevor Content entsteht. Ein `nosnippet` oder ein enges `max-snippet` im Template schließt diese Seiten still aus AI Overviews und AI Mode aus.",
        "Crawler-Politik pro Fläche schriftlich festlegen: Suchaufnahme, Modelltraining und nutzerausgelöste Abrufe sind drei Entscheidungen mit drei Tokens.",
        "Für Leserinnen und Leser schreiben, die eine Antwort brauchen, und die Antwort auf der Seite lassen statt hinter einer Interaktion. Googles Prioritäten: eigenständige Inhalte, Seitenerlebnis, technische Voraussetzungen.",
        "Strukturierte Daten dort einsetzen, wo sie auf ein echtes Rich Result zielen, und mit dem sichtbaren Inhalt übereinstimmen lassen.",
        "Für Commerce und Local Merchant-Center-Feeds und Google-Unternehmensprofile aktuell halten — Google nennt sie als Quellen für Produkte und Leistungen in KI-Antworten.",
        "Nach jeder Migration erneut prüfen. Genau diese Einstellungen springen auf Defaults zurück, die niemand gewählt hat.",
      ],
      measureIntro: ["Messen, worüber die Plattformen berichten — und ehrlich bleiben, dass der Klick oft fehlt."],
      measure: [
        "Impressionen aus KI-Funktionen im Bericht zur Leistung generativer KI, je Seite.",
        "Zitationen und Citation Share aus den Bing Webmaster Tools — die einzige von einer Plattform veröffentlichte Share-Kennzahl auf Query-Ebene.",
        "Abdeckung „indexiert und snippet-fähig“ als Hygienekennzahl.",
        "Besuchsqualität statt reiner Klickzahl; Google benennt diese Verschiebung selbst.",
        "Markensuche und Direct Traffic, wo sich Sichtbarkeit ohne Klick niederschlägt.",
      ],
      risks: [
        "Eine llms.txt für Google-Sichtbarkeit einkaufen. Google ignoriert die Datei.",
        "Google-Extended sperren in der Annahme, das entferne die Seite aus AI Overviews. Es steuert nur das Gemini-Training.",
        "`nosnippet` aus Markensicherheitsgründen setzen, ohne zu wissen, dass es die Seite zugleich aus AI Overviews und AI Mode nimmt.",
        "Seiten „für die KI“ in Fragmente zerlegen — von Google ausdrücklich als wirkungslos benannt.",
        "Annehmen, eine robots.txt-Sperre stoppe Perplexity vollständig.",
        "Erwähnungen einkaufen, um autoritativ zu wirken.",
      ],
      sources: quellen,
    }),
    faqHeading: "Answer Engine Optimization: häufige Fragen",
    faq: [
      [
        "Ist AEO etwas anderes als SEO?",
        "Laut Googles Dokumentation nicht bei den Hebeln: Voraussetzung für AI Overviews und AI Mode sind Indexierung und Snippet-Fähigkeit, ohne Zusatzanforderungen und ohne Spezial-Markup. Anders ist die Messung, weil eine zitierte Antwort oft keinen Klick erzeugt.",
      ],
      [
        "Sollen wir eine llms.txt veröffentlichen?",
        "Google ignoriert llms.txt nach eigener Aussage; die Datei schadet weder, noch hilft sie in der Google Suche. Andere Engines können abweichen.",
      ],
      [
        "Wie verhindern wir, dass Inhalte in KI-Antworten erscheinen?",
        "Bei Google verhindert `nosnippet`, dass Inhalte als direkter Input für AI Overviews und AI Mode dienen; zusätzlich gibt es die Steuerung für generative KI in der Suche. Google-Extended zu sperren ist nicht dieser Schalter.",
      ],
      [
        "Hilft strukturierte Datenauszeichnung bei Zitationen?",
        "Google nennt kein spezielles schema.org-Markup für generative KI-Funktionen und bezeichnet strukturierte Daten dafür als nicht erforderlich. Für Rich Results bleibt sie sinnvoll.",
      ],
    ],
  },
};

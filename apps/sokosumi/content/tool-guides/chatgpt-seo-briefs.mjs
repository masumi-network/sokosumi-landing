import { article } from "../tool-guide-builder.mjs";

const sources = [
  ["ChatGPT Projects", "https://help.openai.com/en/articles/10169521-projects-in-chatgpt"],
  ["Deep research in ChatGPT", "https://help.openai.com/en/articles/10500283-deep-research"],
  ["Data analysis with ChatGPT", "https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt"],
];

export default {
  slug: "how-to-use-chatgpt-for-seo-content-briefs",
  tool: { key: "chatgpt", name: "ChatGPT" },
  job: "SEO content briefs",
  compare: "perplexity-vs-chatgpt",
  coworker: "elena",
  category: "workflows",
  order: 103,
  en: {
    title: "How to use ChatGPT for SEO content briefs",
    description: "Turn verified keyword and SERP evidence into a useful content brief without outsourcing search intent or facts to a language model.",
    body: article("en", {
      intro: [
        "ChatGPT can organize SEO evidence into a clear writing brief, but it is not a keyword database or a substitute for looking at the current search results. Bring the query data, ranking pages and business constraints yourself.",
        "The useful output is a decision document: who the page serves, what job it completes, which evidence it needs and how it differs from pages that already rank.",
      ],
      fit: [
        "Clustering a supplied list of closely related queries by shared intent.",
        "Comparing the structures and evidence types of ranking pages you have inspected.",
        "Turning product expertise and source material into questions a page must answer.",
        "Producing a writer-ready outline with claim requirements, internal links and review owners.",
      ],
      setup: [
        "Export current query, volume, difficulty, ranking and page data from your approved SEO tools. Keep country, language and date attached.",
        "Inspect the live results yourself. Record page type, audience, dominant intent, recurring subtopics and content formats; do not paste scraped copyrighted articles.",
        "Add first-party expertise: product evidence, customer questions, original data, examples and the conversion action this page may legitimately support.",
        "List existing pages that overlap so the brief improves or consolidates content instead of creating cannibalization.",
      ],
      workflow: [
        "Ask ChatGPT to group only the supplied queries and explain which ones appear to share a search intent. Challenge ambiguous clusters manually.",
        "Create an intent statement with reader, situation, desired outcome and expected page type.",
        "Compare the supplied ranking-page notes. Identify table stakes, unanswered questions and evidence formats—not phrases to imitate.",
        "Build an outline around the reader's decision sequence. Give every section a purpose, question, required source and approximate depth.",
        "Add title options, description, internal-link targets, schema opportunities and a claim-verification checklist.",
        "After publication, compare actual queries and engagement with the brief; revise the page when evidence changes.",
      ],
      prompt: [
        "Create an SEO content brief using only the keyword export, SERP observations and first-party sources below.",
        "Market and language: [market]. Primary business outcome: [outcome]. Existing overlapping URLs: [URLs].",
        "Return: intent statement, primary and secondary query cluster, reader questions in decision order, outline with purpose and evidence per section, differentiation, internal links, title options, meta description and claims requiring review.",
        "Do not invent search volume, difficulty, rankings, quotes or facts. Mark any missing evidence explicitly. Do not copy headings or wording from ranking pages.",
      ],
      checks: [
        "Confirm keyword metrics, geography and freshness in the original SEO export.",
        "Search the target query in the intended market and verify that the proposed page type fits current results.",
        "Ensure the outline resolves one intent instead of collecting every adjacent keyword.",
        "Assign a source to each material factual claim and an owner to each expert assertion.",
        "Check that the page adds firsthand value and has a distinct role in the existing site architecture.",
      ],
      limitIntro: ["A language model may confidently create plausible keywords and SERP patterns. Those are suggestions, not measurements."],
      limits: [
        "Never report model-generated volume, difficulty, ranking or traffic estimates as tool data.",
        "Do not use generated summaries as a reason to skip reading the primary sources.",
        "Avoid mass-producing near-duplicate pages for tiny query variations.",
        "Search results and product facts change; record the research date and plan a refresh trigger.",
      ],
      sources,
    }),
    faqHeading: "ChatGPT for SEO briefs: common questions",
    faq: [
      ["Can ChatGPT do keyword research by itself?", "It can suggest language, but it does not replace current query data from Search Console or an SEO database. Supply measured data with market and date."],
      ["Should I paste competitor articles into ChatGPT?", "No. Record your own observations about intent, structure and evidence. Use primary sources and original expertise rather than copying protected text."],
      ["How many keywords should one brief target?", "Use one coherent intent cluster. The right number depends on whether the queries can be satisfied by the same page for the same reader."],
      ["What makes the brief useful to a writer?", "A clear reader job, evidence requirements, section purpose, examples, internal links, claim owners and a definition of what would make the page better than existing results."],
    ],
  },
  de: {
    title: "ChatGPT für SEO-Content-Briefings nutzen",
    description: "Überführe geprüfte Keyword- und SERP-Daten in ein nützliches Briefing, ohne Suchintention oder Fakten an ein Sprachmodell auszulagern.",
    body: article("de", {
      intro: [
        "ChatGPT kann SEO-Evidenz zu einem klaren Schreibbriefing ordnen, ist aber weder Keyword-Datenbank noch Ersatz für die Prüfung aktueller Suchergebnisse. Bringe Suchdaten, rankende Seiten und Geschäftsziele selbst ein.",
        "Das Ergebnis sollte ein Entscheidungsdokument sein: für wen die Seite gedacht ist, welche Aufgabe sie erfüllt, welche Belege nötig sind und wodurch sie sich von bestehenden Treffern unterscheidet.",
      ],
      fit: [
        "Eine bereitgestellte Liste eng verwandter Suchanfragen nach gemeinsamer Intention gruppieren.",
        "Strukturen und Evidenztypen bereits geprüfter Ranking-Seiten vergleichen.",
        "Produktwissen und Quellenmaterial in Leserfragen übersetzen.",
        "Eine schreibfertige Gliederung mit Beleganforderungen, internen Links und Prüfverantwortlichen erstellen.",
      ],
      setup: [
        "Exportiere aktuelle Suchanfragen, Volumen, Schwierigkeit, Rankings und Seiten aus freigegebenen SEO-Tools. Bewahre Land, Sprache und Datum auf.",
        "Prüfe die Suchergebnisse selbst. Notiere Seitentyp, Zielgruppe, Hauptintention, wiederkehrende Unterthemen und Formate; kopiere keine geschützten Artikel.",
        "Ergänze eigene Expertise: Produktbelege, Kundenfragen, Originaldaten, Beispiele und die legitime Conversion-Aktion.",
        "Liste überschneidende Bestandsseiten auf, damit das Briefing verbessert oder konsolidiert statt Kannibalisierung zu erzeugen.",
      ],
      workflow: [
        "Lass ausschließlich die bereitgestellten Anfragen gruppieren und begründen, welche dieselbe Intention teilen. Prüfe mehrdeutige Cluster manuell.",
        "Formuliere eine Intention aus Leser, Situation, gewünschtem Ergebnis und erwartetem Seitentyp.",
        "Vergleiche die SERP-Notizen und finde Pflichtinhalte, offene Fragen und Belegformate – keine Formulierungen zum Nachahmen.",
        "Ordne die Gliederung entlang der Entscheidungsfolge. Jede Sektion erhält Zweck, Frage, Quelle und ungefähre Tiefe.",
        "Ergänze Titel, Beschreibung, interne Links, mögliche strukturierte Daten und eine Prüfliste für Aussagen.",
        "Vergleiche nach Veröffentlichung echte Suchanfragen und Nutzung mit dem Briefing und aktualisiere bei neuen Belegen.",
      ],
      prompt: [
        "Erstelle ein SEO-Content-Briefing ausschließlich aus Keyword-Export, SERP-Beobachtungen und eigenen Quellen.",
        "Markt und Sprache: [Markt]. Geschäftsziel: [Ziel]. Überschneidende URLs: [URLs].",
        "Liefere Intention, primäres und sekundäres Cluster, Leserfragen in Entscheidungsreihenfolge, Gliederung mit Zweck und Beleg je Abschnitt, Differenzierung, interne Links, Titel, Meta-Beschreibung und prüfpflichtige Aussagen.",
        "Erfinde keine Volumen, Schwierigkeiten, Rankings, Zitate oder Fakten. Markiere fehlende Evidenz. Übernimm keine Überschriften oder Formulierungen rankender Seiten.",
      ],
      checks: [
        "Prüfe Keyword-Werte, Geografie und Aktualität im ursprünglichen SEO-Export.",
        "Suche die Zielanfrage im vorgesehenen Markt und bestätige den passenden Seitentyp.",
        "Stelle sicher, dass die Gliederung eine Intention löst und nicht jedes Nachbarthema sammelt.",
        "Ordne jeder wesentlichen Tatsachenbehauptung eine Quelle und jeder Expertenaussage einen Verantwortlichen zu.",
        "Prüfe den eigenen Mehrwert und die eindeutige Rolle in der Seitenarchitektur.",
      ],
      limitIntro: ["Ein Sprachmodell kann plausible Keywords und SERP-Muster erfinden. Das sind Vorschläge, keine Messwerte."],
      limits: [
        "Gib modellgenerierte Volumen, Schwierigkeiten, Rankings oder Traffic-Schätzungen nie als Tool-Daten aus.",
        "Lies trotz Zusammenfassungen die Primärquellen.",
        "Produziere keine fast identischen Seiten für minimale Suchvarianten.",
        "Suchergebnisse und Produktfakten ändern sich; dokumentiere das Recherchedatum und einen Aktualisierungsanlass.",
      ],
      sources,
    }),
    faqHeading: "Häufige Fragen zu ChatGPT für SEO-Briefings",
    faq: [
      ["Kann ChatGPT allein Keyword-Recherche machen?", "Es kann Begriffe vorschlagen, ersetzt aber keine aktuellen Daten aus Search Console oder SEO-Datenbanken. Liefere Messwerte mit Markt und Datum."],
      ["Soll ich Wettbewerbertexte in ChatGPT einfügen?", "Nein. Dokumentiere eigene Beobachtungen zu Intention, Struktur und Belegen. Nutze Primärquellen und eigene Expertise statt geschützten Text zu kopieren."],
      ["Wie viele Keywords gehören in ein Briefing?", "Ein zusammenhängendes Intent-Cluster. Entscheidend ist, ob dieselbe Seite die Anfragen für denselben Leser vollständig erfüllt."],
      ["Was macht das Briefing für Autoren nützlich?", "Eine klare Leseraufgabe, Beleganforderungen, Abschnittszwecke, Beispiele, interne Links, Verantwortliche und eine Definition des zusätzlichen Nutzens."],
    ],
  },
};

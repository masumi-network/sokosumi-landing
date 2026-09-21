import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { lexical } from "./lib/lexical.mjs";

const BASE = "https://payload-production-6f43.up.railway.app/api";
const COPY = {
  hannah: {
    en: "An AI research coworker that turns competitor, audience and market analysis into decision-ready reports and briefs.",
    de: "KI-Research-Coworker für Wettbewerbs-, Zielgruppen- und Marktanalysen, geliefert als klare Reports und Briefings.",
  },
  elena: {
    en: "An AI strategy coworker that turns messy briefs into lead-generation, go-to-market and brand-strategy plans.",
    de: "KI-Strategie-Coworker, der unklare Briefings in Lead-Generation-, Go-to-Market- und Markenstrategiepläne übersetzt.",
  },
  alex: {
    en: "An AI data coworker that turns spreadsheets and research into interactive dashboards for social, funnel and SEO teams.",
    de: "KI-Daten-Coworker, der Tabellen und Research in interaktive Dashboards für Social, Funnel und SEO verwandelt.",
  },
  jamal: {
    en: "An AI experience coworker that maps customer journeys and creates media, nurturing and search plans from your brief.",
    de: "KI-Experience-Coworker für Customer Journeys sowie Media-, Lead-Nurturing- und Search-Pläne aus Ihrem Briefing.",
  },
  maya: {
    en: "An AI creative coworker that develops brand identities and campaign concepts, including pitch decks and brand books.",
    de: "KI-Kreativ-Coworker für Markenidentitäten und Kampagnenkonzepte, einschließlich Pitch Decks und Brand Books.",
  },
  "instagram-page-analysis": {
    en: "An Instagram analyzer that finds themes, engagement patterns and content trends in public post metadata.",
    de: "Instagram-Analyse für Themen, Engagement-Muster und Content-Trends in öffentlichen Post-Metadaten.",
  },
};

const LONG_BIO = {
  "instagram-page-analysis": {
    en: `Instagram Page Analysis is a specialist agent for reviewing public post metadata across an Instagram page. It groups recurring themes, compares engagement patterns and surfaces content trends so a marketer can see what the account publishes and what appears to resonate.

Use it as an evidence-led starting point for an Instagram content audit, competitor review or editorial plan. The result reflects available post metadata; it does not use private account data or prove why a post performed.`,
    de: `Instagram Page Analysis ist ein spezialisierter Agent für die Auswertung öffentlicher Post-Metadaten einer Instagram-Seite. Er gruppiert wiederkehrende Themen, vergleicht Engagement-Muster und zeigt Content-Trends, damit Marketingteams erkennen, was ein Account veröffentlicht und was Resonanz erzeugt.

Nutzen Sie die Analyse als datenbasierten Ausgangspunkt für einen Instagram-Content-Audit, Wettbewerbsvergleich oder Redaktionsplan. Das Ergebnis beruht auf verfügbaren Post-Metadaten; es verwendet keine privaten Account-Daten und belegt keine Ursache für die Performance eines Posts.`,
  },
};

function apiKey() {
  if (process.env.SOKOSUMI_CMS_API_KEY) return process.env.SOKOSUMI_CMS_API_KEY;
  const env = fs.readFileSync(path.join(os.homedir(), ".claude", ".env"), "utf8");
  const match = env.match(/SOKOSUMI_CMS_API_KEY=(\S+)/);
  if (!match) throw new Error("no SOKOSUMI_CMS_API_KEY");
  return match[1];
}

const headers = { "Content-Type": "application/json", Authorization: `users API-Key ${apiKey()}` };
async function api(method, url, body) {
  const response = await fetch(`${BASE}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${method} ${url} ${response.status}: ${JSON.stringify(json).slice(0, 400)}`);
  return json;
}

for (const [slug, localized] of Object.entries(COPY)) {
  for (const [locale, text] of Object.entries(localized)) {
    if (text.length > 118 || !text.endsWith(".")) throw new Error(`${slug}/${locale} is not card-safe (${text.length})`);
  }
}

const apply = process.argv.includes("--apply");
for (const [slug, localized] of Object.entries(COPY)) {
  const result = await api("GET", `/coworkers?where[slug][equals]=${encodeURIComponent(slug)}&where[site][equals]=sokosumi&limit=1&depth=0&locale=en`);
  const coworker = result.docs?.[0];
  if (!coworker) throw new Error(`missing coworker: ${slug}`);
  if (apply) {
    await api("PATCH", `/coworkers/${coworker.id}?locale=en`, {
      seoDescription: localized.en,
      ...(LONG_BIO[slug] ? { longBio: lexical(LONG_BIO[slug].en) } : {}),
    });
    await api("PATCH", `/coworkers/${coworker.id}?locale=de`, {
      seoDescription: localized.de,
      ...(LONG_BIO[slug] ? { longBio: lexical(LONG_BIO[slug].de) } : {}),
    });
  }
  console.log(`${apply ? "updated" : "would update"} ${slug} #${coworker.id} (${localized.en.length}/${localized.de.length})`);
}

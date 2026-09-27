// Targets the German Langdock cluster (Ahrefs DE, 2026-09): "langdock preise"
// 350/mo, "langdock erfahrungen" 250, "langdock alternative" 150, "langdock
// alternativen" 40. German first; the EN version follows the same facts.
// The pair page /compare/sokosumi-vs-langdock stays; this is the listicle.
//
// EVIDENCE DISCIPLINE. Every vendor fact below was read on the vendor's own
// site on 2026-09-27 and is listed under Sources. Prices are "Stand
// September 2026". Where a vendor does not state something, the page says
// nothing. The "Erfahrungen" section uses only the
// public review counts on G2 and OMR Reviews, read the same day.

const sources = [
  ["Langdock pricing", "https://langdock.com/pricing"],
  ["Langdock imprint (Langdock GmbH, Berlin)", "https://www.langdock.com/imprint"],
  ["Langdock reviews on G2", "https://www.g2.com/products/langdock/reviews"],
  ["Langdock on OMR Reviews", "https://omr.com/de/reviews/product/langdock"],
  ["nele.ai pricing and hosting", "https://www.nele.ai/de/ki-preise"],
  ["Microsoft 365 Copilot Business pricing", "https://www.microsoft.com/en-us/microsoft-365-copilot/pricing"],
  ["Microsoft 365 Copilot enterprise pricing (Germany)", "https://www.microsoft.com/de-de/microsoft-365-copilot/enterprise"],
  ["Data, privacy and security for Microsoft Copilot (EU Data Boundary)", "https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy"],
  ["ChatGPT Business pricing", "https://openai.com/business/pricing/"],
  ["Data residency for ChatGPT", "https://help.openai.com/en/articles/9903489-data-residency-and-inference-residency-for-chatgpt"],
  ["Dust pricing", "https://dust.tt/home/pricing"],
  ["Mistral pricing (Vibe, formerly Le Chat)", "https://mistral.ai/pricing"],
  ["Where Mistral stores data", "https://help.mistral.ai/en/articles/347629-where-do-you-store-my-data-or-my-organization-s-data"],
  ["Sokosumi pricing", "/pricing"],
];

const quellen = [
  ["Langdock: Preise", "https://langdock.com/pricing"],
  ["Langdock: Impressum (Langdock GmbH, Berlin)", "https://www.langdock.com/imprint"],
  ["Langdock-Bewertungen auf G2", "https://www.g2.com/products/langdock/reviews"],
  ["Langdock auf OMR Reviews", "https://omr.com/de/reviews/product/langdock"],
  ["nele.ai: Preise und Hosting", "https://www.nele.ai/de/ki-preise"],
  ["Microsoft 365 Copilot: Preise Business (Deutschland)", "https://www.microsoft.com/de-de/microsoft-365-copilot/pricing"],
  ["Microsoft 365 Copilot: Preise Enterprise (Deutschland)", "https://www.microsoft.com/de-de/microsoft-365-copilot/enterprise"],
  ["Microsoft: Datenschutz und EU Data Boundary bei Copilot", "https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy"],
  ["ChatGPT Business: Preise", "https://openai.com/business/pricing/"],
  ["OpenAI: Datenresidenz für ChatGPT", "https://help.openai.com/en/articles/9903489-data-residency-and-inference-residency-for-chatgpt"],
  ["Dust: Preise", "https://dust.tt/home/pricing"],
  ["Mistral: Preise (Vibe, früher Le Chat)", "https://mistral.ai/pricing"],
  ["Mistral: Wo Daten gespeichert werden", "https://help.mistral.ai/en/articles/347629-where-do-you-store-my-data-or-my-organization-s-data"],
  ["Sokosumi: Preise", "/pricing"],
];

const list = (items) => items.map(([label, url]) => `- [${label}](${url})`).join("\n");

export default {
  slug: "langdock-alternatives",
  category: "advanced",
  order: 212,
  en: {
    title: "Langdock alternatives: 6 options for EU companies",
    description:
      "What Langdock costs as of September 2026, who it fits, and six alternatives for European companies with price and hosting as each vendor states them.",
    body: [
      "Langdock is a Berlin-built AI workspace where every employee chats with several models and builds their own agents, hosted in the EU. If you're looking for an alternative, you're usually asking one of two questions: is there a cheaper or better-fitting workspace, or does the team need something other than a chat window? This page answers both, with prices and hosting as each vendor states them.",
      "## What Langdock is and what it costs",
      "Langdock GmbH is based in Berlin. The product combines chat, custom agents and workflows, and it runs on models from several providers. Langdock says it is GDPR-compliant and hosted in the EU, holds ISO 27001 and SOC 2 Type II, and can be deployed as managed, cloud or on-premises.",
      "Prices as of September 2026, excluding VAT:",
      "- **Business:** €25 per Standard seat per month, or €99 per Business Max seat with five times the usage. Paying yearly takes 20% off. Up to 1,000 users.\n- **Enterprise:** custom price, for more than 1,000 users, with dedicated deployment.\n- **Trial:** 7 days, no credit card, with €5 of model credits.\n- **Add-ons:** Workflows €539 a month per workspace for 40,000 runs; Governance is free until 1 January 2027, then €3.50 per user per month.",
      "## Who Langdock fits",
      "Langdock suits a company that wants to give every employee one EU-hosted place to chat with AI, and that has people willing to write and maintain agents. It suits a marketing team less if that team wants finished work back without writing the instructions itself.",
      "## Langdock reviews: what is public",
      "There isn't much yet. On G2, Langdock has 8 reviews with an average of 5 out of 5. OMR Reviews lists no ratings for Langdock. Both were checked in September 2026. Eight reviews are too few to say anything about typical experience, so run your own trial before you commit.",
      "## Six alternatives for European companies",
      "Prices are entry prices as of September 2026. Hosting is what the vendor itself states.",
      "### 1. nele.ai",
      "A German AI platform for companies from GAL Digital GmbH in Hungen. It offers chat with models from OpenAI, Microsoft Azure and Anthropic, plus Word and Excel add-ins. You buy a credit volume for the whole company: 1,000 credits for €10 a month (net), up to 750,000 credits for €3,750. nele.ai says all data and application components run on servers in the EU. It fits companies that want to meter usage centrally instead of paying per seat.",
      "### 2. Microsoft 365 Copilot",
      "Copilot works inside Word, Excel, PowerPoint, Outlook and Teams and draws on your emails, files and meetings. Microsoft now calls it Microsoft Copilot. Copilot Business costs $18 per user per month on a yearly commitment (discounted until 31 December 2026); the enterprise version is €26 per user per month on annual billing in Germany. Both need a qualifying Microsoft 365 licence on top. For EU customers, Microsoft says Copilot is an EU Data Boundary service, with one exception: Anthropic models inside Copilot are currently outside the EU Data Boundary. It fits companies that already run on Microsoft 365.",
      "### 3. ChatGPT Business and Enterprise",
      "OpenAI's workspace for companies, with connectors to Google Workspace, Microsoft 365, Slack and GitHub. Business costs $20 per user per month billed yearly or $25 monthly, for teams of 2 to 200; Enterprise is priced on request. Data residency in Europe (EEA and Switzerland) is available for new Enterprise and Edu workspaces, not for Business. It fits teams that want OpenAI's models and features first.",
      "### 4. Dust",
      "A platform for building AI agents on top of company knowledge, with connectors to Slack, Notion, Google Drive, Salesforce and more. Pro costs €24 per seat per month billed yearly or €30 monthly; there is a free tier with 500 one-time credits and a custom Enterprise plan. Dust offers US and EU data residency. It fits teams that want to build agents over their own documents and tools.",
      "### 5. Mistral Vibe (formerly Le Chat)",
      "Mistral's assistant for individuals and teams, with research, document work, coding and connections to email, calendar and Slack. The Team plan costs $24.99 per user per month, with a $50 monthly minimum; Enterprise is custom. Mistral says data is hosted in the EU by default unless you explicitly use its US endpoint. It fits companies that want a European model provider.",
      "### 6. Sokosumi",
      "Sokosumi isn't a chat workspace, and it doesn't replace Langdock. It's a marketplace where marketing teams brief named [AI coworkers](/ai-coworkers), built and run by named vendors, and get a finished file back on a shared task board: a [competitor report](/use-cases/competitor-monitoring), an [SEO and AI visibility audit](/use-cases/seo-and-ai-visibility), a campaign plan. It's sold per seat with monthly credits: Free with 250 credits, then Starter €25, Standard €75 and Pro €200 per seat. Each task shows its credit price before it runs. Hosting depends on the coworker; each profile shows models and hosting where the vendor states them. It fits marketing teams that want deliverables, and many run it next to a chat workspace like Langdock.",
      "## Which one to pick",
      "If the question is \"which chat workspace for the whole company\", compare Langdock, nele.ai, Copilot, ChatGPT Enterprise, Dust and Mistral on hosting and on how you want to pay: per seat or as a shared credit pool. If the question is \"who does the marketing team's research and reporting\", that's a different purchase. See [how Sokosumi compares to Langdock](/compare/sokosumi-vs-langdock) and [pricing](/pricing).",
      "## Sources",
      list(sources),
    ].join("\n\n"),
    faqHeading: "Langdock alternatives: common questions",
    faq: [
      [
        "What does Langdock cost?",
        "As of September 2026, Business costs €25 per Standard seat per month or €99 per Business Max seat, excluding VAT, with 20% off for yearly payment. Enterprise is priced on request. There is a 7-day trial without a credit card.",
      ],
      [
        "Where does Langdock host data?",
        "Langdock says it is GDPR-compliant and hosted in the EU. It also offers managed, cloud and on-premises deployment.",
      ],
      [
        "Which Langdock alternative is hosted in Germany or the EU?",
        "nele.ai says all its components run on EU servers. Mistral hosts data in the EU by default. Dust offers EU data residency. ChatGPT offers European data residency on new Enterprise workspaces, and Microsoft names Copilot an EU Data Boundary service for EU customers, with Anthropic models currently excluded.",
      ],
      [
        "Is Sokosumi a Langdock alternative?",
        "Only for part of the job. Sokosumi doesn't give every employee a chat window. It gives the marketing team coworkers that return finished reports, plans and dashboards, and many teams run it next to Langdock.",
      ],
      [
        "Are there Langdock reviews I can trust?",
        "Few so far. In September 2026 G2 listed 8 reviews averaging 5 out of 5, and OMR Reviews had no ratings. That's too little to judge by, so use the 7-day trial.",
      ],
    ],
  },
  de: {
    title: "Langdock-Alternativen: 6 Optionen für Unternehmen",
    description:
      "Was Langdock kostet (Stand September 2026), für wen es passt und sechs Alternativen für Unternehmen in der EU, mit Preis und Hosting laut Anbieter.",
    body: [
      "Langdock ist eine KI-Arbeitsumgebung aus Berlin: Alle Mitarbeitenden chatten mit mehreren Modellen und bauen eigene Agenten, gehostet in der EU. Wer nach einer Alternative sucht, will meist eines von zwei Dingen wissen: Gibt es eine günstigere oder passendere Arbeitsumgebung, oder braucht das Team etwas anderes als ein Chatfenster? Diese Seite beantwortet beides, mit Preisen und Hosting so, wie die Anbieter sie selbst angeben.",
      "## Was Langdock ist und was es kostet",
      "Die Langdock GmbH sitzt in Berlin. Das Produkt verbindet Chat, eigene Agenten und Workflows und nutzt Modelle mehrerer Anbieter. Langdock gibt an, DSGVO-konform und in der EU gehostet zu sein, ist nach ISO 27001 und SOC 2 Type II zertifiziert und lässt sich als Managed-, Cloud- oder On-Premises-Variante betreiben.",
      "Langdock-Preise, Stand September 2026, zzgl. MwSt.:",
      "- **Business:** 25 € pro Standard-Seat und Monat oder 99 € pro Business-Max-Seat mit fünffacher Nutzung. Bei jährlicher Zahlung gibt es 20 % Rabatt. Bis 1.000 Nutzer.\n- **Enterprise:** Preis auf Anfrage, ab 1.000 Nutzern, mit eigenem Deployment.\n- **Testphase:** 7 Tage ohne Kreditkarte, mit 5 € Modell-Credits.\n- **Add-ons:** Workflows 539 € im Monat pro Workspace für 40.000 Durchläufe; Governance ist bis 1. Januar 2027 kostenlos, danach 3,50 € pro Nutzer und Monat.",
      "## Für wen Langdock passt",
      "Langdock passt zu Unternehmen, die allen Mitarbeitenden einen gemeinsamen, EU-gehosteten Ort für KI-Chats geben wollen und Leute haben, die Agenten schreiben und pflegen. Für ein Marketingteam, das fertige Arbeit zurückbekommen will, ohne selbst Anweisungen zu schreiben, passt es weniger.",
      "## Langdock-Erfahrungen: was öffentlich belegt ist",
      "Bisher wenig. Auf G2 hat Langdock 8 Bewertungen mit durchschnittlich 5 von 5 Sternen. OMR Reviews führt für Langdock noch keine Bewertungen. Beides haben wir im September 2026 geprüft. Acht Bewertungen reichen nicht für ein Urteil über typische Erfahrungen, testen Sie also selbst, bevor Sie sich festlegen.",
      "## Sechs Alternativen für Unternehmen in der EU",
      "Die Preise sind Einstiegspreise, Stand September 2026. Beim Hosting steht, was der Anbieter selbst angibt.",
      "### 1. nele.ai",
      "Eine deutsche KI-Plattform für Unternehmen von der GAL Digital GmbH aus Hungen. Sie bietet Chat mit Modellen von OpenAI, Microsoft Azure und Anthropic sowie Add-ins für Word und Excel. Gekauft wird ein Credit-Volumen für das ganze Unternehmen: 1.000 Credits für 10 € im Monat (netto), bis zu 750.000 Credits für 3.750 €. Laut nele.ai laufen alle Daten und Anwendungskomponenten auf Servern in der EU. Passt zu Unternehmen, die die Nutzung zentral abrechnen wollen statt pro Seat.",
      "### 2. Microsoft 365 Copilot",
      "Copilot arbeitet in Word, Excel, PowerPoint, Outlook und Teams und greift auf Ihre E-Mails, Dateien und Meetings zu. Microsoft nennt das Produkt inzwischen Microsoft Copilot. Copilot Business kostet in Deutschland ab 15,60 € pro Nutzer und Monat bei Jahresbindung (Aktionspreis bis 31. Dezember 2026, regulär 18,20 €); die Enterprise-Version kostet 26,00 € pro Nutzer und Monat bei jährlicher Abrechnung. Beide setzen eine berechtigende Microsoft-365-Lizenz voraus. Für Kunden in der EU gilt Copilot laut Microsoft als Dienst innerhalb der EU Data Boundary, mit einer Ausnahme: Anthropic-Modelle in Copilot sind derzeit davon ausgenommen. Passt zu Unternehmen, die ohnehin mit Microsoft 365 arbeiten.",
      "### 3. ChatGPT Business und Enterprise",
      "Die Arbeitsumgebung von OpenAI für Unternehmen, mit Anbindung an Google Workspace, Microsoft 365, Slack und GitHub. Business kostet 20 $ pro Nutzer und Monat bei jährlicher Zahlung oder 25 $ bei monatlicher, für Teams mit 2 bis 200 Personen; Enterprise auf Anfrage. Datenresidenz in Europa (EWR und Schweiz) gibt es für neue Enterprise- und Edu-Workspaces, nicht für Business. Passt zu Teams, denen die Modelle und Funktionen von OpenAI am wichtigsten sind.",
      "### 4. Dust",
      "Eine Plattform, auf der Teams KI-Agenten auf Basis ihres Unternehmenswissens bauen, mit Anbindung an Slack, Notion, Google Drive, Salesforce und weitere Tools. Pro kostet 24 € pro Seat und Monat bei jährlicher Zahlung oder 30 € monatlich; dazu gibt es eine kostenlose Stufe mit einmalig 500 Credits und einen Enterprise-Plan auf Anfrage. Dust bietet Datenresidenz in den USA und in der EU. Passt zu Teams, die Agenten über ihren eigenen Dokumenten und Tools bauen wollen.",
      "### 5. Mistral Vibe (früher Le Chat)",
      "Der Assistent von Mistral für Einzelne und Teams, mit Recherche, Dokumentarbeit, Programmierung und Anbindung an E-Mail, Kalender und Slack. Der Team-Plan kostet 24,99 $ pro Nutzer und Monat, mindestens 50 $ im Monat; Enterprise auf Anfrage. Laut Mistral werden Daten standardmäßig in der EU gehostet, außer Sie nutzen ausdrücklich den US-Endpunkt. Passt zu Unternehmen, die einen europäischen Modellanbieter wollen.",
      "### 6. Sokosumi",
      "Sokosumi ist keine Chat-Arbeitsumgebung und ersetzt Langdock nicht. Es ist ein Marktplatz, auf dem Marketingteams benannte [KI-Mitarbeiter](/ai-coworkers) briefen, die namentlich genannte Anbieter bauen und betreiben. Zurück kommt eine fertige Datei auf einem gemeinsamen Task-Board: ein [Wettbewerbsreport](/use-cases/competitor-monitoring), ein [Audit zu SEO und KI-Sichtbarkeit](/use-cases/seo-and-ai-visibility), ein Kampagnenplan. Abgerechnet wird pro Seat mit monatlichen Credits: Free mit 250 Credits, dann Starter 25 €, Standard 75 € und Pro 200 € pro Seat. Jede Aufgabe zeigt ihren Credit-Preis, bevor sie startet. Das Hosting hängt vom KI-Mitarbeiter ab; jedes Profil nennt Modelle und Hosting, soweit der Anbieter sie angibt. Passt zu Marketingteams, die Ergebnisse brauchen. Viele nutzen es neben einer Chat-Umgebung wie Langdock.",
      "## Welche Alternative passt",
      "Wenn die Frage lautet „Welche Chat-Umgebung für das ganze Unternehmen?“, vergleichen Sie Langdock, nele.ai, Copilot, ChatGPT Enterprise, Dust und Mistral nach Hosting und danach, wie Sie zahlen wollen: pro Seat oder über einen gemeinsamen Credit-Pool. Wenn die Frage lautet „Wer übernimmt Recherche und Reporting im Marketing?“, ist das ein anderer Einkauf. Dazu passen [der Vergleich Sokosumi und Langdock](/compare/sokosumi-vs-langdock) und die [Preise](/pricing).",
      "## Quellen",
      list(quellen),
    ].join("\n\n"),
    faqHeading: "Langdock-Alternativen: häufige Fragen",
    faq: [
      [
        "Was kostet Langdock?",
        "Stand September 2026 kostet Business 25 € pro Standard-Seat und Monat oder 99 € pro Business-Max-Seat, jeweils zzgl. MwSt., mit 20 % Rabatt bei jährlicher Zahlung. Enterprise gibt es auf Anfrage. Die Testphase dauert 7 Tage und braucht keine Kreditkarte.",
      ],
      [
        "Wo hostet Langdock die Daten?",
        "Langdock gibt an, DSGVO-konform und in der EU gehostet zu sein. Dazu gibt es Managed-, Cloud- und On-Premises-Varianten.",
      ],
      [
        "Welche Langdock-Alternative hostet in Deutschland oder der EU?",
        "nele.ai betreibt laut eigener Angabe alle Komponenten auf EU-Servern. Mistral hostet standardmäßig in der EU. Dust bietet EU-Datenresidenz. ChatGPT bietet europäische Datenresidenz für neue Enterprise-Workspaces, und Microsoft führt Copilot für EU-Kunden als Dienst der EU Data Boundary, derzeit ohne die Anthropic-Modelle.",
      ],
      [
        "Ist Sokosumi eine Langdock-Alternative?",
        "Nur für einen Teil der Arbeit. Sokosumi gibt nicht allen Mitarbeitenden ein Chatfenster, sondern dem Marketingteam KI-Mitarbeiter, die fertige Reports, Pläne und Dashboards liefern. Viele Teams nutzen es neben Langdock.",
      ],
      [
        "Welche Langdock-Erfahrungen sind öffentlich belegt?",
        "Bisher wenige. Im September 2026 zeigte G2 8 Bewertungen mit durchschnittlich 5 von 5 Sternen, OMR Reviews noch keine. Das reicht nicht für ein Urteil, nutzen Sie also die 7-tägige Testphase.",
      ],
    ],
  },
};

import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(new URL("../best-ai-marketing-tools.json", import.meta.url), "utf8"));

const german = {
  chatgpt: {
    what: "OpenAIs Allround-Assistent mit Deep Research, Agent Mode, Projekten und Custom GPTs.",
    best: "Einzelne Marketer, die möglichst viele Funktionen in einem Chat-Produkt möchten.",
    price: "Kostenlos; Plus $20/Monat; Business $20 pro Nutzer und Monat bei Jahreszahlung oder $25 monatlich; Enterprise auf Anfrage.",
    hosting: "Für ChatGPT Business wird Datenresidenz je Workspace ausgerollt und betrifft primäre Inhalte im Ruhezustand; für berechtigte Enterprise- und Edu-Workspaces gibt es zusätzlich europäische Inferenzresidenz.",
  },
  claude: {
    what: "Anthropics Assistent für lange Dokumente, Dateierstellung und mehrstufige Arbeit mit Cowork.",
    best: "Sorgfältige Texte und Briefings, die als Word-, Excel- oder PowerPoint-Datei enden sollen.",
    price: "Kostenlos; Pro $17/Monat bei Jahreszahlung oder $20 monatlich; Team ab $20 pro Nutzer und Monat; weitere Tarife nach Nutzung.",
    hosting: "Keine EU-Region im direkten Produkt; EU-Regionen erfordern AWS Bedrock oder Google Vertex.",
  },
  gemini: {
    what: "Googles Assistent in Gmail, Docs, Sheets und Slides sowie als eigene App mit NotebookLM.",
    best: "Teams, deren tägliche Arbeit bereits in Google Workspace stattfindet.",
    price: "Google AI Pro ab CHF 17/Monat; Workspace-Tarife mit Gemini ab CHF 7 pro Nutzer und Monat in der Schweiz.",
    hosting: "Workspace-Kunden können Datenregionen nutzen; die verfügbaren Richtlinien hängen vom Tarif ab.",
  },
  copilot: {
    what: "Microsofts Assistent in Word, Excel, PowerPoint, Outlook und Teams, ergänzt um Researcher- und Analyst-Agenten.",
    best: "Unternehmen auf Microsoft 365, die KI direkt in Office-Dateien und Teams einsetzen möchten.",
    price: "Copilot Business ab $18 pro Nutzer und Monat bei Jahreszahlung; Enterprise Copilot $30 pro Nutzer und Monat.",
    hosting: "EU Data Boundary für EU-Tenants, mit dokumentierten Ausnahmen bei Kapazitätsengpässen und für bestimmte Modelle.",
  },
  langdock: {
    what: "Ein Berliner KI-Workspace mit Chat, eigenen Assistenten und Workflows über mehr als 40 Modelle.",
    best: "Deutsche Unternehmen, die ein zentrales KI-Werkzeug breit ausrollen möchten.",
    price: "Business ab €25 pro Nutzer und Monat; Business Max €99; Workflows ab €539/Monat.",
    hosting: "EU-Hosting; der Anbieter nennt ISO 27001 und SOC 2.",
  },
  dust: {
    what: "Eine Pariser Plattform für eigene Agenten auf Daten aus Notion, Drive, Slack und weiteren Quellen.",
    best: "Teams, die Agenten auf internem Wissen selbst bauen und Zugriffe fein steuern möchten.",
    price: "Kostenloser Einstieg; Pro ab $24 pro Nutzer und Monat bei Jahreszahlung; Max $150.",
    hosting: "EU- oder US-Datenresidenz auf Pro und Max; Enterprise kann wählen.",
  },
  nele: {
    what: "Deutscher Multi-Modell-Chat mit Prompt-Bibliothek und Add-ins für Word und Excel.",
    best: "Kleine deutsche Unternehmen, die einen sicheren ChatGPT-ähnlichen Einstieg suchen.",
    price: "Gemeinsame Credit-Pakete ab €10/Monat; Wissensdatenbank als Zusatzoption.",
    hosting: "Server in der EU; der Anbieter nennt ISO 27001.",
  },
  jasper: {
    what: "Marketing-Content-Plattform mit Brand Voice, Canvas und spezialisierten Marketing-Agenten.",
    best: "Content-Teams, die große Mengen markenkonformer Texte produzieren.",
    price: "Pro ab $59 pro Nutzer und Monat bei Jahreszahlung; Business auf Anfrage.",
    hosting: "Laut Sicherheitsseite werden Daten in US-Rechenzentren gespeichert.",
  },
  canva: {
    what: "Browserbasierte Design-Suite mit Magic Studio für Bilder, Text, Video und Präsentationen.",
    best: "Nicht-Designer, die Social Posts, Präsentationen und Anzeigen schnell umsetzen.",
    price: "Kostenloser Einstieg; Pro und Business pro Nutzer; AI Pass als zusätzliche Option. Preise vor Kauf beim Anbieter prüfen.",
    hosting: "Für die hier verglichenen Tarife ist keine eindeutige EU-Hosting-Zusage veröffentlicht.",
  },
  adobe: {
    what: "Adobes generative Modelle für Bilder, Video und Audio, einzeln oder in Creative Cloud verfügbar.",
    best: "Brand-Teams, die kommerziell nutzbare Visuals brauchen und bereits Adobe verwenden.",
    price: "Kostenloser Einstieg; kostenpflichtige Firefly-Tarife werden nach monatlichen Generative Credits gestaffelt.",
    hosting: "Für die regulären Firefly-Tarife ist keine eindeutige EU-Hosting-Zusage veröffentlicht.",
  },
  perplexity: {
    what: "Suchorientierter Assistent mit Quellen, Deep Research und Werkzeugen für Berichte und Dashboards.",
    best: "Schnelle Markt- und Wettbewerbsrecherche, bei der jede Aussage überprüfbar sein soll.",
    price: "Kostenlos; Pro $20/Monat; Max $200/Monat; Enterprise-Tarife pro Nutzer.",
    hosting: "Standardverarbeitung auf US-Infrastruktur; keine veröffentlichte EU-Rechenzentrumsoption.",
  },
  sokosumi: {
    what: "Marktplatz für benannte AI Coworker und Spezialagenten, die von ausgewiesenen Anbietern betrieben werden.",
    best: "Marketingteams, die einen Bericht, ein Deck oder Dashboard zurückbekommen möchten statt eines weiteren Chats.",
    price: "250 Credits pro Nutzer und Monat kostenlos; Starter €25, Standard €75 und Pro €200 pro Nutzer und Monat; Enterprise auf Anfrage.",
    hosting: "Je Coworker ausgewiesen; darunter EU- und Schweizer Hosting-Optionen.",
  },
  viktor: {
    what: "Ein allgemeiner AI Employee in Slack und Teams mit Integrationen und Datei-Ausgaben.",
    best: "Operations-lastige Teams, die einen Agenten eng mit ihrem bestehenden Tool-Stack verbinden möchten.",
    price: "Kostenloses Startguthaben; Team-Pakete ab $50/Monat; Enterprise auf Anfrage.",
    hosting: "Die Hosting-Region ist nicht veröffentlicht; der Anbieter nennt SOC 2 Type 1.",
  },
  whaaat: {
    what: "Berliner Sammlung benannter Marketing-Agenten für LinkedIn, Blog, Landingpages und SEO.",
    best: "Start-ups und kleine Teams mit regelmäßigem Social- und Blog-Content.",
    price: "$25/Monat für alle Agenten; Testphase ohne Kreditkarte.",
    hosting: "Die Hosting-Region ist nicht veröffentlicht.",
  },
  n8n: {
    what: "Workflow- und AI-Agent-Builder aus Berlin, als Cloud in Frankfurt oder selbst gehostet.",
    best: "Teams mit technischer Betreuung, die Automationen und Datenflüsse selbst kontrollieren möchten.",
    price: "Cloud Starter ab €20/Monat bei Jahreszahlung; Pro €50; Community-Version zum Selbsthosten kostenlos.",
    hosting: "Cloud-Daten in Frankfurt oder in der selbst gewählten Region beim Self-Hosting.",
  },
  zapier: {
    what: "No-Code-Agenten auf Zapiers großem Integrationskatalog; Aktivitäten werden zusätzlich zu Zap-Tasks gezählt.",
    best: "Nicht-technische Marketer, die bereits Zaps betreiben und leichte Agenten ergänzen möchten.",
    price: "Kostenloser Einstieg; Professional ab $19,99/Monat bei Jahreszahlung; Team ab $69.",
    hosting: "Für die verglichenen Tarife ist keine eindeutige EU-Hosting-Zusage veröffentlicht.",
  },
};

const groupNames = {
  "General assistants marketers already use": "Allgemeine Assistenten, die Marketingteams bereits nutzen",
  "EU-hosted AI workspaces": "KI-Workspaces mit EU-Hosting",
  "Content and copy": "Content und Text",
  "Design and creative": "Design und Kreation",
  Research: "Research",
  "AI coworkers and agents that deliver files": "AI Coworker und Agenten, die Dateien liefern",
  "Automation builders": "Automation Builder",
};

function sourceList() {
  return data.sources.map((url, index) => `- [${new URL(url).hostname.replace(/^www\./, "")} ${index + 1}](${url})`).join("\n");
}

function englishBody() {
  const sections = data.en.groups.map((group) => {
    const tools = group.tools.map((tool) => `### [${tool.name}](${tool.url})

${tool.what}

- **Best for:** ${tool.bestFor}
- **Price checked ${data.checked}:** ${tool.price}
- **EU hosting:** ${tool.euHosting}
- **Strengths:** ${tool.strengths.join(" ")}
- **Watch-outs:** ${tool.limits.join(" ")}`).join("\n\n");
    return `## ${group.heading}\n\n${tools}`;
  }).join("\n\n");

  return `${data.en.intro}

## The short answer

Choose the product category before the vendor. Use a general assistant for quick individual work, an EU workspace when company-wide governance matters, a specialist content or design tool for production inside its editor, an automation builder when your team can maintain workflows, and an AI coworker when the brief should come back as a finished deliverable. There is no honest single winner across those jobs.

## How we chose the 16 tools

${data.en.howWeChose}

${sections}

## How to choose without buying twice

1. Write down the output: an answer, an editable file, a scheduled workflow, or a finished deliverable.
2. Decide who owns prompting, quality control and maintenance after launch.
3. Check data location, subprocessors, retention and model-training terms for the exact plan—not only the vendor homepage.
4. Run the same real brief through two finalists and score source quality, edit time and total cost.
5. Keep a human approval step for claims, personal data, regulated work and anything published under your brand.

Prices and plans change. Treat every price above as a dated observation and confirm it on the linked vendor page before purchasing. Sokosumi is our product; it is included because the comparison covers AI coworkers, and it is evaluated with the same fields and explicit limitations as the other tools.

## Sources and review notes

The list was reviewed on ${data.checked}. Official product and pricing pages are preferred; when a vendor blocked automated access, the draft uses a dated third-party capture and labels that limitation.

${sourceList()}`;
}

function germanBody() {
  const sections = data.en.groups.map((group) => {
    const tools = group.tools.map((tool) => {
      const d = german[tool.key];
      return `### [${tool.name}](${tool.url})

${d.what}

- **Geeignet für:** ${d.best}
- **Preis, geprüft am 26. August 2026:** ${d.price}
- **EU-Hosting:** ${d.hosting}`;
    }).join("\n\n");
    return `## ${groupNames[group.heading]}\n\n${tools}`;
  }).join("\n\n");

  return `Die Frage lautet 2026 nicht mehr, ob ein Marketingteam KI verwendet, sondern welche Art von Werkzeug zu welcher Arbeit passt. Chat-Assistenten beantworten Fragen. Builder verbinden Modelle mit Abläufen. AI Coworker und Agenten übernehmen ein Briefing und liefern eine Datei oder einen abgeschlossenen Task zurück. Die meisten Teams brauchen nicht einen Sieger, sondern eine klare Kombination.

## Die kurze Antwort

Wählen Sie zuerst die Produktkategorie. Für schnelle Einzelarbeit reicht oft ein allgemeiner Assistent. Für die unternehmensweite Einführung zählen Governance und Datenresidenz. Content- und Design-Tools sind stark in ihrem eigenen Editor. Automation Builder passen, wenn jemand die Workflows pflegt. AI Coworker passen, wenn aus einem Briefing ein fertiger Bericht, ein Deck, eine Tabelle oder ein Dashboard werden soll.

## So haben wir die 16 Tools ausgewählt

Aufgenommen wurden Produkte, die Marketingteams in Deutschland, Österreich, der Schweiz oder den USA tatsächlich testen können. Verglichen werden Eignung, Ausgabe, veröffentlichter Preis, Teamfunktionen und eine nachvollziehbare Aussage zum Hosting. Preise und Bedingungen wurden am 26. August 2026 geprüft. Wo der Anbieter automatisierte Abfragen blockiert, wird die Einschränkung offengelegt. Sokosumi ist unser eigenes Produkt und wird mit denselben Feldern und sichtbaren Grenzen beschrieben.

${sections}

## So vermeiden Sie einen doppelten Einkauf

1. Definieren Sie das Ergebnis: Antwort, editierbare Datei, automatisierter Ablauf oder fertiges Deliverable.
2. Legen Sie fest, wer Prompting, Qualitätskontrolle und laufende Wartung übernimmt.
3. Prüfen Sie Datenstandort, Unterauftragsverarbeiter, Aufbewahrung und Modelltraining für den konkreten Tarif.
4. Testen Sie zwei Finalisten mit demselben echten Briefing und messen Sie Quellenqualität, Nacharbeit und Gesamtkosten.
5. Behalten Sie eine menschliche Freigabe für Behauptungen, personenbezogene Daten, regulierte Arbeit und Veröffentlichungen.

Preise und Tarife ändern sich. Verstehen Sie jede Preisangabe als datierte Beobachtung und prüfen Sie vor dem Kauf die verlinkte Anbieter-Seite.

## Quellen und Prüfhinweise

Die Liste wurde am 26. August 2026 geprüft. Offizielle Produkt-, Preis- und Sicherheitsseiten haben Vorrang; verwendete Drittquellen sind in der englischen Fassung und in der Quellenliste erkennbar.

${sourceList()}`;
}

export default {
  slug: "best-ai-marketing-tools",
  category: "advanced",
  order: 1,
  en: {
    title: "Best AI marketing tools in 2026: 16 picks",
    description: "Compare 16 AI marketing tools by job, output, price and EU hosting: assistants, workspaces, creative tools, agents, coworkers and builders.",
    body: englishBody(),
    faqHeading: "AI marketing tools: common questions",
    faq: data.en.faq,
  },
  de: {
    title: "Die besten KI-Marketing-Tools 2026: 16 Empfehlungen",
    description: "16 KI-Marketing-Tools nach Aufgabe, Ergebnis, Preis und EU-Hosting: Assistenten, Workspaces, Kreativtools, Agenten, Coworker und Builder.",
    body: germanBody(),
    faqHeading: "Häufige Fragen zu KI-Marketing-Tools",
    faq: [
      ["Was ist ein KI-Agent im Marketing?", "Ein KI-Agent erhält ein Ziel, arbeitet mehrere Schritte selbstständig ab und liefert ein Ergebnis. Ein Chat-Tool zeigt meist Text im persönlichen Verlauf. Eine Coworker-Plattform kann stattdessen eine Datei oder einen Task auf einem gemeinsamen Board zurückgeben."],
      ["Welches KI-Marketing-Tool passt zu einem kleinen Team in Deutschland?", "Für einen sicheren Chat-Einstieg kommen EU-gehostete Workspaces wie Langdock oder nele.ai infrage. Wenn fertige Marketingdateien statt Chats gefragt sind, vergleichen Sie spezialisierte Coworker-Plattformen. Prüfen Sie Hosting und Vertrag immer für den konkreten Tarif."],
      ["Brauche ich ChatGPT zusätzlich zu einer Coworker-Plattform?", "Oft ja. Chat-Assistenten eignen sich für schnelle Fragen und Entwürfe. Coworker sind für Aufgaben mit einem klaren Deliverable gedacht, etwa Wettbewerbsbericht, Kampagnenplan oder monatliches Dashboard."],
      ["Sind KI-Marketing-Tools DSGVO-konform?", "Eine allgemeine Zusage reicht nicht. Prüfen Sie Datenstandort, Unterauftragsverarbeiter, Aufbewahrung, Training und Löschung für Ihren Tarif und Ihren Anwendungsfall. Bei personenbezogenen oder regulierten Daten gehört die Rechts- und Datenschutzprüfung in den Einkauf."],
      ["Was kosten KI-Marketing-Tools 2026?", "Chat- und Workspace-Tarife beginnen häufig bei etwa 20 bis 25 Euro oder Dollar pro Nutzer und Monat. Kreativtools, Agenten und Automationen ergänzen oft Credits, Ausführungen oder Aktivitäten. Vergleichen Sie deshalb die Kosten eines echten Beispiel-Workflows, nicht nur den Einstiegspreis."],
    ],
  },
};

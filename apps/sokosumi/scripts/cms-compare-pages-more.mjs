// Second set of comparison pages. Same shape as cms-compare-llms.mjs:
// question, two-line answer, seven cells, three points, three questions.
// Plain words, one idea per sentence, nothing the reader has to decode.
// Facts from docs/research/sokosumi-competitors-2026-08.md; "Not published"
// where the company has not said.

export const PAGES_MORE = [
  {
    slug: "sokosumi-vs-genspark", name: "Genspark", logo: 44,
    en: {
      q: "What is the difference between Genspark and Sokosumi?",
      a: "Genspark is one super-agent that makes docs, decks and sites for whoever asks it. Sokosumi is a marketplace of named coworkers, built by vendors, that a marketing team briefs and that put the finished file on a shared board.",
      cells: ["Individuals and small teams", "Docs, decks, sites from one agent", "In Genspark", "Genspark, Palo Alto", "Credits; Team $30 per seat", "Enterprise plan only", "Free, 100 credits a day"],
      grid: [
        ["One agent vs. a roster", "Genspark is one agent for everything. On Sokosumi you pick Hannah for research or Maya for creative, and read their sample work first."],
        ["Your window vs. the team's board", "A Genspark task lives in your session. A Sokosumi task sits on a board with an owner, a status and the file."],
        ["Who stands behind it", "Every Sokosumi coworker names its vendor, its models and where it runs. That is what IT asks for."],
      ],
      faq: [
        ["Does Sokosumi also make decks and dashboards?", "Yes. That is what a task ends with: a PDF, a deck, a spreadsheet or a live dashboard on the board."],
        ["Is Sokosumi hosted in the EU?", "The marketplace runs in the EU. Each coworker runs where its vendor hosts it; the profile shows the region when the vendor states it, so check before you send sensitive data."],
        ["Which is cheaper?", "Both use credits. Sokosumi's free plan renews 250 credits per seat every month; each task shows its price before it runs."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Genspark und Sokosumi?",
      a: "Genspark ist ein einzelner Super-Agent, der Dokumente, Decks und Websites für jede Anfrage erstellt. Sokosumi ist ein Marktplatz für benannte Coworker. Anbieter bauen sie; Marketingteams briefen sie, und die fertige Datei landet auf einem gemeinsamen Task-Board.",
      cells: ["Einzelpersonen und kleine Teams", "Dokumente, Decks, Websites von einem Agenten", "In Genspark", "Genspark, Palo Alto", "Credits; Team 30 $ pro Seat", "Nur im Enterprise-Plan", "Gratis, 100 Credits am Tag"],
      grid: [
        ["Ein Agent statt einer Auswahl", "Genspark ist ein Agent für alles. Auf Sokosumi wählen Sie Hannah für Recherche oder Maya für Kreation – und lesen vorher ihre Beispielarbeit."],
        ["Ihre Sitzung vs. das Team-Board", "Eine Genspark-Aufgabe bleibt in Ihrer Sitzung. Eine Sokosumi-Aufgabe liegt auf einem Board mit Zuständigkeit, Status und Datei."],
        ["Wer dahintersteht", "Jeder Sokosumi-Coworker nennt seinen Anbieter, die Modelle und den Hosting-Ort. Danach fragt die IT."],
      ],
      faq: [
        ["Macht Sokosumi auch Decks und Dashboards?", "Ja. Damit endet eine Aufgabe: PDF, Deck, Tabelle oder Live-Dashboard auf dem Board."],
        ["Ist Sokosumi in der EU gehostet?", "Der Marktplatz läuft in der EU. Jeder KI-Mitarbeiter läuft dort, wo sein Anbieter ihn hostet; das Profil zeigt die Region, wenn der Anbieter sie angibt. Prüfen Sie das, bevor Sie sensible Daten senden."],
        ["Was ist günstiger?", "Beide nutzen Credits. Sokosumis Free-Plan erneuert monatlich 250 Credits pro Seat; jede Aufgabe zeigt ihren Preis vor dem Start."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-coworker-ai", name: "Coworker.ai", logo: 45,
    en: {
      q: "What is the difference between Coworker.ai and Sokosumi?",
      a: "Both say \"coworker\". Coworker.ai is one enterprise agent that learns your company's context and makes artifacts. Sokosumi is a marketplace of many named coworkers from several vendors, each with a role, a profile and a file at the end.",
      cells: ["Enterprises, all departments", "Decks, dashboards, code from one agent", "In Coworker.ai", "Coworker.ai, San Francisco", "Flat seat, $30–150 per user", "Not published", "Trial"],
      grid: [
        ["One agent vs. many specialists", "Coworker.ai is a single agent with a context graph. Sokosumi has a researcher, a strategist, a creative and 40 specialist agents, each with sample work."],
        ["Made for marketing", "Sokosumi coworkers do marketing jobs: competitor reports, campaign plans, SEO checks, the weekly report. Not a general agent pointed at marketing."],
        ["Built in Munich", "Serviceplan Group built Sokosumi, and the marketplace runs in the EU. Where a coworker runs depends on its vendor; the profile shows it when the vendor states it."],
      ],
      faq: [
        ["Does Sokosumi learn our company context too?", "Attach your documents to a task or a project. Coworkers work from them."],
        ["Who are the vendors?", "Named companies with public profiles on Sokosumi. Serviceplan Group and utxo are two of them."],
        ["What does it cost?", "Free with 250 credits per seat, then €25, €75 or €200 per seat. Credits only go on tasks that run."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Coworker.ai und Sokosumi?",
      a: "Beide verwenden „Coworker“. Coworker.ai ist ein Enterprise-Agent, der den Kontext Ihres Unternehmens lernt und Artefakte erstellt. Sokosumi ist ein Marktplatz mit vielen benannten Coworkern mehrerer Anbieter. Jeder hat eine Rolle, ein Profil und am Ende eine Datei.",
      cells: ["Unternehmen, alle Abteilungen", "Decks, Dashboards, Code von einem Agenten", "In Coworker.ai", "Coworker.ai, San Francisco", "Pauschale pro Seat, 30–150 $ pro Nutzer", "Nicht veröffentlicht", "Testphase"],
      grid: [
        ["Ein Agent statt vieler Spezialisten", "Coworker.ai ist ein einzelner Agent mit Kontextgraph. Sokosumi hat Recherche, Strategie, Kreation und 40 Spezial-Agents, jeweils mit Beispielarbeit."],
        ["Für Marketing gemacht", "Sokosumi-Coworker erledigen Marketingjobs: Wettbewerbsreports, Kampagnenpläne, SEO-Checks, den Wochenreport. Kein allgemeiner Agent, der nur auf Marketing ausgerichtet wird."],
        ["Gebaut in München", "Die Serviceplan Group hat Sokosumi gebaut, und der Marktplatz läuft in der EU. Wo ein KI-Mitarbeiter läuft, hängt vom Anbieter ab; das Profil zeigt es, wenn der Anbieter es angibt."],
      ],
      faq: [
        ["Lernt Sokosumi auch unseren Unternehmenskontext?", "Hängen Sie Ihre Dokumente an eine Aufgabe oder ein Projekt. Coworker arbeiten damit."],
        ["Wer sind die Anbieter?", "Namentlich genannte Unternehmen mit öffentlichem Profil auf Sokosumi. Serviceplan Group und utxo sind zwei davon."],
        ["Was kostet es?", "Gratis mit 250 Credits pro Seat, dann 25 €, 75 € oder 200 € pro Seat. Credits werden nur für laufende Aufgaben verbraucht."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-salesforce-agentforce", name: "Salesforce Agentforce", logo: 46,
    en: {
      q: "What is the difference between Salesforce Agentforce and Sokosumi?",
      a: "Agentforce puts agents inside Salesforce and bills by action or by user. Sokosumi is a marketplace of marketing coworkers that deliver reports, plans and dashboards to a board, whichever CRM you run.",
      cells: ["Salesforce customers", "Actions inside Salesforce; campaign creation in Marketing Cloud", "Inside Salesforce", "Salesforce", "Flex credits or from $125 per user", "Per Salesforce's hosting terms", "No free plan"],
      grid: [
        ["Inside one suite vs. any stack", "Agentforce needs Salesforce. Sokosumi returns files to a board and connects Google and Microsoft accounts for context."],
        ["Priced for enterprise vs. priced per seat", "Agentforce starts at $125 per user or a $500 credit pack. Sokosumi is free to start and each task shows its credit price."],
        ["One vendor vs. a marketplace", "Every Agentforce agent is Salesforce's. Sokosumi coworkers come from named vendors with public profiles."],
      ],
      faq: [
        ["We run Salesforce. Do we need Sokosumi?", "Agentforce stays in the CRM. Sokosumi does the marketing work before and around it: research, plans, reports, creative."],
        ["Can Sokosumi talk to Salesforce?", "Any MCP client can call Sokosumi coworkers. Ask sales about your setup."],
        ["Is there a free plan?", "Yes. 250 credits per seat every month, no card."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Salesforce Agentforce und Sokosumi?",
      a: "Agentforce setzt Agenten in Salesforce ein und rechnet pro Aktion oder pro Nutzer ab. Sokosumi ist ein Marktplatz für Marketing-Coworker, die Reports, Pläne und Dashboards auf ein Board liefern – egal, welches CRM Sie nutzen.",
      cells: ["Salesforce-Kunden", "Aktionen in Salesforce; Kampagnenerstellung in der Marketing Cloud", "In Salesforce", "Salesforce", "Flex-Credits oder ab 125 $ pro Nutzer", "Gemäß Salesforce-Hosting-Bedingungen", "Kein Free-Plan"],
      grid: [
        ["Salesforce-Suite vs. jeder Stack", "Agentforce braucht Salesforce. Sokosumi liefert Dateien auf ein Board und verbindet Google- und Microsoft-Konten für Kontext."],
        ["Enterprise-Preis vs. Aufgabenpreis", "Agentforce beginnt bei 125 $ pro Nutzer oder einem 500-$-Credit-Paket. Sokosumi ist gratis zum Start, und jede Aufgabe zeigt ihren Credit-Preis."],
        ["Ein Anbieter vs. ein Marktplatz", "Jeder Agentforce-Agent ist von Salesforce. Sokosumi-Coworker kommen von namentlich genannten Anbietern mit öffentlichem Profil."],
      ],
      faq: [
        ["Wir nutzen Salesforce. Brauchen wir Sokosumi?", "Agentforce bleibt im CRM. Sokosumi macht die Marketingarbeit davor und rundherum: Recherche, Pläne, Reports, Kreation."],
        ["Kann Sokosumi mit Salesforce sprechen?", "Jeder MCP-Client kann Sokosumi-Coworker aufrufen. Fragen Sie den Vertrieb nach Ihrem Setup."],
        ["Gibt es einen Free-Plan?", "Ja. 250 Credits pro Seat jeden Monat, ohne Kreditkarte."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-deepl-agent", name: "DeepL Agent", logo: 47,
    en: {
      q: "What is the difference between DeepL Agent and Sokosumi?",
      a: "DeepL Agent is one general assistant from a company you trust for translation, still in beta. Sokosumi is a marketplace of marketing coworkers from several vendors, live today, with a shared board and a file at the end of each task.",
      cells: ["Business users; marketers named as a target", "Agent output in DeepL; beta", "In DeepL", "DeepL, Cologne", "Not published", "DeepL is EU-based; agent hosting not published", "Beta access"],
      grid: [
        ["Live vs. beta", "Sokosumi is live and publishes its prices. DeepL Agent was announced in beta and has not published pricing."],
        ["One agent vs. specialists", "DeepL offers one agent. Sokosumi offers coworkers with a role and sample work you can read before you spend a credit."],
        ["Two German companies", "Both are German and EU-minded. Sokosumi adds named vendors, a task board and prices you can see."],
      ],
      faq: [
        ["Can Sokosumi translate?", "Coworkers work in English and German. For pure translation, DeepL is the better tool."],
        ["Where is Sokosumi hosted?", "The marketplace runs in the EU. Each coworker runs where its vendor hosts it; the profile shows the region when the vendor states it, so check before you send sensitive data."],
        ["What does it cost?", "Free with 250 credits per seat; paid seats from €25. Credits only go on tasks that run."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen DeepL Agent und Sokosumi?",
      a: "DeepL Agent ist ein allgemeiner Assistent eines Unternehmens, dem Sie beim Übersetzen vertrauen – noch in der Beta. Sokosumi ist ein Marktplatz für Marketing-Coworker mehrerer Anbieter, bereits live, mit gemeinsamem Board und einer Datei am Ende jeder Aufgabe.",
      cells: ["Business-Nutzer; Marketer als Zielgruppe genannt", "Ausgaben des Agents in DeepL; Beta", "In DeepL", "DeepL, Köln", "Nicht veröffentlicht", "DeepL sitzt in der EU; Agent-Hosting nicht veröffentlicht", "Beta-Zugang"],
      grid: [
        ["Live vs. Beta", "Sokosumi ist live und veröffentlicht seine Preise. DeepL Agent wurde als Beta angekündigt und hat keine Preise veröffentlicht."],
        ["Ein Agent vs. Spezialisten", "DeepL bietet einen Agenten. Sokosumi bietet Coworker mit Rolle und Beispielarbeit, die Sie vor dem ersten Credit lesen können."],
        ["Zwei deutsche Unternehmen", "Beide sind deutsch und EU-fokussiert. Sokosumi ergänzt benannte Anbieter, ein Task-Board und sichtbare Preise."],
      ],
      faq: [
        ["Kann Sokosumi übersetzen?", "Coworker arbeiten auf Englisch und Deutsch. Für reine Übersetzung ist DeepL das bessere Werkzeug."],
        ["Wo wird Sokosumi gehostet?", "Der Marktplatz läuft in der EU. Jeder KI-Mitarbeiter läuft dort, wo sein Anbieter ihn hostet; das Profil zeigt die Region, wenn der Anbieter sie angibt. Prüfen Sie das, bevor Sie sensible Daten senden."],
        ["Was kostet es?", "Gratis mit 250 Credits pro Seat; kostenpflichtige Seats ab 25 €. Credits werden nur für laufende Aufgaben verbraucht."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-notion-ai", name: "Notion AI", logo: 48,
    en: {
      q: "What is the difference between Notion AI and Sokosumi?",
      a: "Notion AI works inside Notion: it writes pages, searches your workspace and runs custom agents on your databases. Sokosumi coworkers do marketing jobs and return files you can send, whatever tool your notes live in.",
      cells: ["Notion workspaces", "Notion pages and database edits", "Inside Notion", "Notion", "$20 per member plus agent credits", "Enterprise plan, Frankfurt", "Free tier"],
      grid: [
        ["Pages vs. files", "Notion agents produce Notion pages. Sokosumi tasks end with a PDF, a deck, a spreadsheet or a dashboard."],
        ["Agents you author vs. coworkers you hire", "Custom agents in Notion are yours to write and keep. Sokosumi coworkers are built and run by named vendors."],
        ["Inside one tool vs. any stack", "Sokosumi returns files to a board and connects Google and Microsoft accounts for context. Notion is not required."],
      ],
      faq: [
        ["We keep our brand guide in Notion. Can coworkers use it?", "Export it or attach it to a task or a project. Coworkers work from it."],
        ["Does Sokosumi replace Notion?", "No. Keep Notion for notes and wikis. Use Sokosumi for the work that ends as a deliverable."],
        ["What does it cost?", "Free with 250 credits per seat; paid seats from €25. Credits only go on tasks that run."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Notion AI und Sokosumi?",
      a: "Notion AI arbeitet in Notion: schreibt Seiten, durchsucht den Arbeitsbereich und führt eigene Agenten auf Ihren Datenbanken aus. Sokosumi-Coworker erledigen Marketingjobs und liefern Dateien, die Sie verschicken können – egal, wo Ihre Notizen liegen.",
      cells: ["Notion-Workspaces", "Notion-Seiten und Änderungen an Datenbanken", "In Notion", "Notion", "20 $ pro Mitglied plus Agent-Credits", "Enterprise-Plan, Frankfurt", "Kostenlose Version"],
      grid: [
        ["Seiten vs. Dateien", "Notion-Agenten erzeugen Notion-Seiten. Sokosumi-Aufgaben enden mit PDF, Deck, Tabelle oder Dashboard."],
        ["Selbst geschriebene Agenten vs. beauftragte Coworker", "Eigene Agenten in Notion müssen Sie selbst schreiben und pflegen. Sokosumi-Coworker bauen und betreiben namentlich genannte Anbieter."],
        ["Ein Tool vs. jeder Stack", "Sokosumi liefert Dateien auf ein Board und verbindet Google- und Microsoft-Konten für Kontext. Notion ist nicht nötig."],
      ],
      faq: [
        ["Unser Brand Guide liegt in Notion. Können Coworker ihn nutzen?", "Exportieren Sie ihn oder hängen Sie ihn an eine Aufgabe oder ein Projekt. Coworker arbeiten damit."],
        ["Ersetzt Sokosumi Notion?", "Nein. Behalten Sie Notion für Notizen und Wikis. Nutzen Sie Sokosumi für Aufgaben, die mit einer Datei enden."],
        ["Was kostet es?", "Gratis mit 250 Credits pro Seat; kostenpflichtige Seats ab 25 €. Credits werden nur für laufende Aufgaben verbraucht."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-canva-ai", name: "Canva AI", logo: 49,
    en: {
      q: "What is the difference between Canva AI and Sokosumi?",
      a: "Canva makes designs. Sokosumi makes the thinking and the files that come before a design: the research, the plan, the report, the brief. Many teams use both.",
      cells: ["Anyone who designs", "Designs, decks, video", "In Canva", "Canva", "Pro about $18; Business $25 per user", "Not published", "Free tier"],
      grid: [
        ["Design vs. research and strategy", "Canva turns a brief into visuals. Sokosumi coworkers write the brief: Hannah does the market read, Elena the plan, Maya the creative direction."],
        ["A tool you operate vs. work you hand off", "In Canva you do the work with AI help. On Sokosumi you give the task away and get the file back."],
        ["Together", "A Sokosumi research PDF and creative brief go into Canva. Canva's output goes into the next Sokosumi task."],
      ],
      faq: [
        ["Does Sokosumi make images?", "Some coworkers do creative work, such as branded avatars and press kits. For layout and editing, Canva is the tool."],
        ["Is there a free plan?", "Yes. 250 credits per seat every month, no card."],
        ["Where is it hosted?", "The marketplace runs in the EU. Each coworker runs where its vendor hosts it; the profile shows the region when the vendor states it, so check before you send sensitive data."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Canva AI und Sokosumi?",
      a: "Canva macht Designs. Sokosumi liefert die Vorarbeit und die Dateien davor: Recherche, Plan, Report, Briefing. Viele Teams nutzen beides.",
      cells: ["Alle, die gestalten", "Designs, Decks, Videos", "In Canva", "Canva", "Pro etwa 18 $; Business 25 $ pro Nutzer", "Nicht veröffentlicht", "Kostenlose Version"],
      grid: [
        ["Design vs. Recherche und Strategie", "Canva macht aus einem Briefing Visuals. Sokosumi-Coworker schreiben das Briefing: Hannah den Marktüberblick, Elena den Plan, Maya die kreative Richtung."],
        ["Ein Werkzeug, das Sie bedienen, vs. Arbeit, die Sie abgeben", "In Canva machen Sie die Arbeit mit KI-Hilfe. Auf Sokosumi geben Sie die Aufgabe ab und bekommen die Datei zurück."],
        ["Gemeinsam", "Ein Recherche-PDF und ein Kreativ-Briefing aus Sokosumi fließen in Canva ein. Das Canva-Ergebnis fließt in die nächste Sokosumi-Aufgabe."],
      ],
      faq: [
        ["Macht Sokosumi Bilder?", "Manche Coworker machen Kreativarbeit, etwa Marken-Avatare und Pressekits. Für Layout und Bearbeitung ist Canva das Werkzeug."],
        ["Gibt es einen Free-Plan?", "Ja. 250 Credits pro Seat jeden Monat, ohne Kreditkarte."],
        ["Wo wird Sokosumi gehostet?", "Der Marktplatz läuft in der EU. Jeder KI-Mitarbeiter läuft dort, wo sein Anbieter ihn hostet; das Profil zeigt die Region, wenn der Anbieter sie angibt. Prüfen Sie das, bevor Sie sensible Daten senden."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-adobe-genstudio", name: "Adobe GenStudio", logo: 50,
    en: {
      q: "What is the difference between Adobe GenStudio and Sokosumi?",
      a: "GenStudio is Adobe's content supply chain for large enterprises on Adobe stacks, sold by quote. Sokosumi is a self-serve marketplace of marketing coworkers with public prices, built for mid-size teams.",
      cells: ["Large enterprises on Adobe", "Assets and campaign content at scale", "Inside Adobe Experience Cloud", "Adobe", "Enterprise quote; credit-based", "Per Adobe's hosting terms", "No free plan"],
      grid: [
        ["Quote vs. price list", "GenStudio is sold by quote. Sokosumi's prices are public: free, €25, €75, €200 per seat."],
        ["Asset production vs. knowledge work", "GenStudio makes and governs assets. Sokosumi coworkers do research, planning, reporting and creative briefs."],
        ["Adobe stack vs. any stack", "GenStudio expects Adobe Experience Cloud. Sokosumi returns files to a board and works with the tools you have."],
      ],
      faq: [
        ["We are an Adobe shop. Does Sokosumi fit?", "Yes. Sokosumi outputs are files; put them wherever your assets live."],
        ["Is Sokosumi for enterprises?", "Yes, with enterprise contracts for custom seats and credits. It also works for a team of three."],
        ["Where is it hosted?", "The marketplace runs in the EU. Each coworker runs where its vendor hosts it; the profile shows the region when the vendor states it, so check before you send sensitive data."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Adobe GenStudio und Sokosumi?",
      a: "GenStudio ist Adobes Content-Supply-Chain für große Unternehmen mit Adobe-Stacks, verkauft per Angebot. Sokosumi ist ein Self-Service-Marktplatz für Marketing-Coworker mit öffentlichen Preisen, entwickelt für mittelgroße Teams.",
      cells: ["Große Unternehmen mit Adobe-Stack", "Assets und Kampagnen-Content im großen Stil", "In der Adobe Experience Cloud", "Adobe", "Enterprise-Angebot; auf Credit-Basis", "Gemäß Adobe-Hosting-Bedingungen", "Kein Free-Plan"],
      grid: [
        ["Angebot vs. Preisliste", "GenStudio wird per Angebot verkauft. Sokosumis Preise sind öffentlich: gratis, 25 €, 75 €, 200 € pro Seat."],
        ["Asset-Produktion vs. Wissensarbeit", "GenStudio erstellt und verwaltet Assets. Sokosumi-Coworker übernehmen Recherche, Planung, Reporting und Kreativ-Briefings."],
        ["Adobe-Stack vs. jeder Stack", "GenStudio erwartet die Adobe Experience Cloud. Sokosumi liefert Dateien auf ein Board und arbeitet mit den Tools, die Sie bereits nutzen."],
      ],
      faq: [
        ["Wir sind ein Adobe-Haus. Passt Sokosumi?", "Ja. Sokosumi-Ergebnisse sind Dateien; legen Sie sie dorthin, wo Ihre Assets liegen."],
        ["Ist Sokosumi für Unternehmen?", "Ja, mit Enterprise-Verträgen für individuelle Seats und Credits. Es funktioniert auch für ein Team von drei."],
        ["Wo wird Sokosumi gehostet?", "Der Marktplatz läuft in der EU. Jeder KI-Mitarbeiter läuft dort, wo sein Anbieter ihn hostet; das Profil zeigt die Region, wenn der Anbieter sie angibt. Prüfen Sie das, bevor Sie sensible Daten senden."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-writer", name: "Writer", logo: 51,
    en: {
      q: "What is the difference between Writer and Sokosumi?",
      a: "Writer is an enterprise platform with a hundred prebuilt agents and strong governance, priced per user. Sokosumi is a marketplace of marketing coworkers from several vendors, priced per seat with monthly credits, with a file at the end.",
      cells: ["Enterprises, many departments", "Text and agent output in Writer", "In Writer", "Writer, San Francisco", "$39 per user; Enterprise custom", "Not published", "Trial"],
      grid: [
        ["One vendor vs. a marketplace", "All Writer agents are Writer's. Sokosumi coworkers come from named vendors with public profiles, so you can compare."],
        ["What a seat buys", "Writer bills each user every month, and Sokosumi bills each seat. The difference is what the seat buys: Sokosumi's comes with credits for specialist tasks, and the free plan renews 250 of them per seat every month."],
        ["Marketing first", "Sokosumi is built for marketing teams: research, plans, reports, creative. Writer serves the whole enterprise."],
      ],
      faq: [
        ["Does Sokosumi keep our brand voice?", "Attach the brand guide to a project; coworkers work from it."],
        ["Is Sokosumi safe for a regulated company?", "The marketplace runs in the EU. Models and hosting depend on the coworker's vendor and are on the profile where the vendor states them; ask sales for the details your compliance team needs."],
        ["What does it cost?", "Free with 250 credits per seat; paid seats from €25."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Writer und Sokosumi?",
      a: "Writer ist eine Enterprise-Plattform mit 100 vorgefertigten Agenten und starker Governance, bezahlt pro Nutzer. Sokosumi ist ein Marktplatz für Marketing-KI-Mitarbeiter mehrerer Anbieter, bezahlt pro Seat mit monatlichen Credits, mit einer Datei am Ende.",
      cells: ["Unternehmen, viele Abteilungen", "Text- und Agent-Ausgaben in Writer", "In Writer", "Writer, San Francisco", "39 $ pro Nutzer; Enterprise individuell", "Nicht veröffentlicht", "Testphase"],
      grid: [
        ["Ein Anbieter vs. ein Marktplatz", "Alle Writer-Agenten sind von Writer. Sokosumi-Coworker kommen von namentlich genannten Anbietern mit öffentlichem Profil – Sie können vergleichen."],
        ["Was ein Seat enthält", "Writer berechnet jeden Nutzer jeden Monat, Sokosumi jeden Seat. Der Unterschied liegt darin, was der Seat enthält: bei Sokosumi Credits für Spezialisten-Aufgaben, im kostenlosen Plan 250 pro Seat und Monat."],
        ["Marketing zuerst", "Sokosumi ist für Marketingteams gebaut: Recherche, Pläne, Reports, Kreation. Writer bedient das ganze Unternehmen."],
      ],
      faq: [
        ["Bewahrt Sokosumi unsere Markenstimme?", "Hängen Sie den Brand Guide an ein Projekt; Coworker arbeiten damit."],
        ["Ist Sokosumi für ein reguliertes Unternehmen sicher?", "Der Marktplatz läuft in der EU. Modelle und Hosting hängen vom Anbieter des KI-Mitarbeiters ab und stehen im Profil, wo der Anbieter sie angibt; fragen Sie den Vertrieb nach den Details für Ihr Compliance-Team."],
        ["Was kostet es?", "Gratis mit 250 Credits pro Seat; kostenpflichtige Seats ab 25 €."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-copy-ai", name: "Copy.ai", logo: 52,
    en: {
      q: "What is the difference between Copy.ai and Sokosumi?",
      a: "Copy.ai is a go-to-market platform: workflows that write copy and feed sales, priced by the plan. Sokosumi is a marketplace of marketing coworkers you brief one task at a time, with a file back on a shared board.",
      cells: ["Sales and marketing ops teams", "Copy and workflow output", "In Copy.ai", "Copy.ai", "Chat $29; Growth from $1,000 per month", "Not published", "Free tier"],
      grid: [
        ["Workflows you build vs. coworkers you brief", "Copy.ai gives you a workflow builder. Sokosumi gives you Hannah, Elena and Maya, plus specialist agents, ready to brief."],
        ["Plans vs. tasks", "Copy.ai's Growth plan starts at $1,000 a month. Sokosumi is free to start and each task shows its credit price."],
        ["Deliverables, not only copy", "Sokosumi tasks end with reports, decks, spreadsheets and dashboards, not only text."],
      ],
      faq: [
        ["Can Sokosumi write copy?", "Yes. Creative and content coworkers are on the marketplace, with sample work on their profiles."],
        ["Do we have to build workflows?", "No. Pick a coworker or a template task, brief it, collect the file. Scheduled tasks handle the recurring ones."],
        ["Where is it hosted?", "The marketplace runs in the EU. Each coworker runs where its vendor hosts it; the profile shows the region when the vendor states it, so check before you send sensitive data."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Copy.ai und Sokosumi?",
      a: "Copy.ai ist eine Go-to-Market-Plattform: Workflows schreiben Texte und versorgen den Vertrieb mit Material, abgerechnet nach Plan. Sokosumi ist ein Marktplatz für Marketing-Coworker, die Sie Aufgabe für Aufgabe briefen. Die Datei landet auf einem gemeinsamen Board.",
      cells: ["Sales- und Marketing-Ops-Teams", "Texte und Workflow-Ausgaben", "In Copy.ai", "Copy.ai", "Chat 29 $; Growth ab 1.000 $ im Monat", "Nicht veröffentlicht", "Kostenlose Version"],
      grid: [
        ["Workflows, die Sie bauen, vs. Coworker, die Sie briefen", "Copy.ai gibt Ihnen einen Workflow-Baukasten. Sokosumi gibt Ihnen Hannah, Elena und Maya plus Spezial-Agents, bereit fürs Briefing."],
        ["Pläne vs. Aufgaben", "Copy.ais Growth-Plan beginnt bei 1.000 $ im Monat. Sokosumi ist gratis zum Start, und jede Aufgabe zeigt ihren Credit-Preis."],
        ["Ergebnisse, nicht nur Texte", "Sokosumi-Aufgaben enden mit Reports, Decks, Tabellen und Dashboards, nicht nur mit Text."],
      ],
      faq: [
        ["Kann Sokosumi Texte schreiben?", "Ja. Kreations- und Content-Coworker sind auf dem Marktplatz, mit Beispielarbeit im Profil."],
        ["Müssen wir Workflows bauen?", "Nein. Coworker oder Vorlage wählen, briefen, Datei abholen. Geplante Aufgaben übernehmen die wiederkehrenden."],
        ["Wo wird Sokosumi gehostet?", "Der Marktplatz läuft in der EU. Jeder KI-Mitarbeiter läuft dort, wo sein Anbieter ihn hostet; das Profil zeigt die Region, wenn der Anbieter sie angibt. Prüfen Sie das, bevor Sie sensible Daten senden."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-typeface", name: "Typeface", logo: 53,
    en: {
      q: "What is the difference between Typeface and Sokosumi?",
      a: "Typeface is a marketing content engine for Fortune 500 brands, sold by demo. Sokosumi is a self-serve marketplace of marketing coworkers with public prices, for teams that want a file back this afternoon.",
      cells: ["Large enterprises", "Brand-safe content at scale", "In Typeface", "Typeface, US", "Demo only", "Not published", "No free plan"],
      grid: [
        ["Demo vs. sign up and try", "Typeface starts with a sales call. Sokosumi starts with a free seat and 250 credits."],
        ["Content engine vs. coworkers", "Typeface produces content from your brand system. Sokosumi coworkers also research, plan and report, and each names its vendor."],
        ["Public prices", "€25, €75 and €200 per seat, credits only on work that runs. Nothing to negotiate to get started."],
      ],
      faq: [
        ["Is Sokosumi enterprise-ready?", "Yes. Organizations with roles and invites, EU hosting, enterprise contracts with custom seats and credits."],
        ["Does it keep our brand safe?", "Attach the brand guide to a project; coworkers work from it. Review the file before it goes out, like any deliverable."],
        ["What is the fastest way to judge it?", "Run one template task on the free plan and look at the file."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Typeface und Sokosumi?",
      a: "Typeface ist eine Marketing-Content-Engine für Fortune-500-Marken, die nur per Demo verkauft wird. Sokosumi ist ein Self-Service-Marktplatz für Marketing-Coworker mit öffentlichen Preisen – für Teams, die heute Nachmittag eine Datei brauchen.",
      cells: ["Große Unternehmen", "Markensicherer Content im großen Stil", "In Typeface", "Typeface, USA", "Nur per Demo", "Nicht veröffentlicht", "Kein Free-Plan"],
      grid: [
        ["Demo vs. anmelden und testen", "Typeface beginnt mit einem Verkaufsgespräch. Sokosumi beginnt mit einem kostenlosen Seat und 250 Credits."],
        ["Content-Engine vs. Coworker", "Typeface produziert Content aus Ihrem Markensystem. Sokosumi-Coworker recherchieren, planen und berichten auch – und jeder nennt seinen Anbieter."],
        ["Öffentliche Preise", "25 €, 75 € und 200 € pro Seat, Credits nur für laufende Arbeit. Sie müssen nichts verhandeln, um loszulegen."],
      ],
      faq: [
        ["Ist Sokosumi Enterprise-bereit?", "Ja. Organisationen mit Rollen und Einladungen, EU-Hosting, Enterprise-Verträge mit individuellen Seats und Credits."],
        ["Bleibt unsere Marke sicher?", "Hängen Sie den Brand Guide an ein Projekt; Coworker arbeiten damit. Prüfen Sie die Datei, bevor sie veröffentlicht wird – wie jedes Ergebnis."],
        ["Wie prüfen wir Sokosumi am schnellsten?", "Führen Sie eine Vorlage im Free-Plan aus und sehen Sie sich die Datei an."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-beam-ai", name: "Beam AI", logo: 54,
    en: {
      q: "What is the difference between Beam AI and Sokosumi?",
      a: "Beam AI automates back-office processes: finance, insurance, support. Sokosumi is a marketplace of marketing coworkers that return research, plans, reports and creative as files.",
      cells: ["Operations teams", "Processed cases and automations", "In Beam", "Beam AI", "Pro $50 for 200 tasks; Scale $3,990", "Not published", "Free, 20 tasks"],
      grid: [
        ["Back office vs. marketing", "Beam handles invoices and tickets. Sokosumi handles the competitor report, the campaign plan, the weekly performance PDF."],
        ["Processes vs. deliverables", "Beam's unit is a processed case. Sokosumi's unit is a file on the board that someone can send."],
        ["Named coworkers from named vendors", "Sokosumi coworkers have a role, a profile and a vendor. You read the sample work before you spend a credit."],
      ],
      faq: [
        ["Can Sokosumi automate our operations?", "No. It is for marketing work. Beam or similar tools fit operations better."],
        ["Is Sokosumi German too?", "Yes. Built by Serviceplan Group in Munich, with EU hosting available."],
        ["What does it cost?", "Free with 250 credits per seat; paid seats from €25."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Beam AI und Sokosumi?",
      a: "Beam AI automatisiert Backoffice-Prozesse: Finanzen, Versicherung, Support. Sokosumi ist ein Marktplatz für Marketing-Coworker, die Recherche, Pläne, Reports und Kreation als Dateien liefern.",
      cells: ["Operations-Teams", "Bearbeitete Fälle und Automatisierungen", "In Beam", "Beam AI", "Pro 50 $ für 200 Aufgaben; Scale 3.990 $", "Nicht veröffentlicht", "Gratis, 20 Aufgaben"],
      grid: [
        ["Backoffice vs. Marketing", "Beam bearbeitet Rechnungen und Tickets. Sokosumi liefert den Wettbewerbsreport, den Kampagnenplan, das wöchentliche Performance-PDF."],
        ["Prozesse vs. Ergebnisse", "Beams Einheit ist ein bearbeiteter Fall. Sokosumis Einheit ist eine Datei auf dem Board, die jemand verschicken kann."],
        ["Benannte Coworker, klare Anbieter", "Sokosumi-Coworker haben eine Rolle, ein Profil und einen Anbieter. Sie lesen die Beispielarbeit, bevor Sie einen Credit ausgeben."],
      ],
      faq: [
        ["Kann Sokosumi unsere Abläufe automatisieren?", "Nein. Sokosumi ist für Marketingarbeit. Beam oder ähnliche Tools passen besser für Operations."],
        ["Ist Sokosumi auch deutsch?", "Ja. Gebaut von der Serviceplan Group in München, mit EU-Hosting."],
        ["Was kostet es?", "Gratis mit 250 Credits pro Seat; kostenpflichtige Seats ab 25 €."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-motion", name: "Motion", logo: 55,
    en: {
      q: "What is the difference between Motion and Sokosumi?",
      a: "Motion is a calendar and project tool with AI that plans your day and, in a higher tier, \"AI employees\". Sokosumi is a marketplace of marketing coworkers that do the work itself and hand back the file.",
      cells: ["Individuals and teams managing time", "Schedules, task plans, project views", "In Motion", "Motion, US", "$19–29 per seat with credits", "Not published", "Trial"],
      grid: [
        ["Planning the work vs. doing it", "Motion decides when you do a task. Sokosumi does the task: the report, the deck, the dashboard."],
        ["Your calendar vs. the team's board", "Motion is built around one person's schedule. A Sokosumi task sits on a board the marketing team shares."],
        ["Coworkers with a vendor", "Sokosumi coworkers are built and run by named vendors, with sample work on their profiles."],
      ],
      faq: [
        ["Can Sokosumi schedule work?", "Scheduled tasks run once or every week. It does not manage your calendar."],
        ["Do the two work together?", "Yes. Plan in Motion; hand the marketing tasks to Sokosumi coworkers."],
        ["What does it cost?", "Free with 250 credits per seat; paid seats from €25. Credits only go on tasks that run."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Motion und Sokosumi?",
      a: "Motion ist ein Kalender- und Projekt-Tool mit KI, die Ihren Tag plant und in einer höheren Stufe „KI-Mitarbeiter“ bietet. Sokosumi ist ein Marktplatz für Marketing-Coworker, die die Arbeit selbst erledigen und die Datei zurückgeben.",
      cells: ["Einzelpersonen und Teams, die ihre Zeit planen", "Zeitpläne, Aufgabenpläne, Projektansichten", "In Motion", "Motion, USA", "19–29 $ pro Seat mit Credits", "Nicht veröffentlicht", "Testphase"],
      grid: [
        ["Arbeit planen vs. Arbeit erledigen", "Motion entscheidet, wann Sie eine Aufgabe erledigen. Sokosumi erledigt die Aufgabe: Report, Deck, Dashboard."],
        ["Ihr Kalender vs. das Board des Teams", "Motion ist um den Zeitplan einer Person gebaut. Eine Sokosumi-Aufgabe liegt auf einem Board, das das Marketingteam teilt."],
        ["Coworker mit Anbieter", "Sokosumi-Coworker werden von namentlich genannten Anbietern gebaut und betrieben, mit Beispielarbeit im Profil."],
      ],
      faq: [
        ["Kann Sokosumi Arbeit planen?", "Geplante Aufgaben laufen einmal oder jede Woche. Ihren Kalender verwaltet es nicht."],
        ["Passen die beiden zusammen?", "Ja. In Motion planen; die Marketingaufgaben an Sokosumi-Coworker geben."],
        ["Was kostet es?", "Gratis mit 250 Credits pro Seat; kostenpflichtige Seats ab 25 €. Credits werden nur für laufende Aufgaben verbraucht."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-paradigm", name: "Paradigm", logo: 56,
    en: {
      q: "What is the difference between Paradigm and Sokosumi?",
      a: "Paradigm is an AI spreadsheet: agents fill cells with researched data. Sokosumi is a marketplace of marketing coworkers that return whole deliverables, the research report as well as the sheet.",
      cells: ["Analysts and data teams", "Filled spreadsheets", "In Paradigm", "Paradigm, US", "From $20 per month", "Not published", "Free plan"],
      grid: [
        ["A sheet vs. a deliverable", "Paradigm returns rows of data. A Sokosumi research task returns the report, with the data in it, on the board."],
        ["Data enrichment vs. marketing work", "Paradigm is strongest at enriching lists. Sokosumi coworkers also plan the campaign and write the deck."],
        ["Named coworkers from named vendors", "Each Sokosumi coworker has a role, sample work and a vendor behind it."],
      ],
      faq: [
        ["Does Sokosumi enrich lists?", "Research coworkers and agents do research tasks; check the template tasks for what each returns."],
        ["Can we use both?", "Yes. Paradigm for the raw list; Sokosumi for the report and the plan built on it."],
        ["What does it cost?", "Free with 250 credits per seat; paid seats from €25."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Paradigm und Sokosumi?",
      a: "Paradigm ist eine KI-Tabelle: Agenten füllen Zellen mit recherchierten Daten. Sokosumi ist ein Marktplatz für Marketing-Coworker, die vollständige Ergebnisse liefern – den Recherche-Report ebenso wie die Tabelle.",
      cells: ["Analysten und Datenteams", "Gefüllte Tabellen", "In Paradigm", "Paradigm, USA", "Ab 20 $ im Monat", "Nicht veröffentlicht", "Free-Plan"],
      grid: [
        ["Eine Tabelle vs. ein Ergebnis", "Paradigm liefert Datenzeilen. Eine Sokosumi-Rechercheaufgabe liefert den Report mit den Daten auf dem Board."],
        ["Datenanreicherung vs. Marketingarbeit", "Paradigm ist am stärksten beim Anreichern von Listen. Sokosumi-Coworker planen auch die Kampagne und schreiben das Deck."],
        ["Benannte Coworker von benannten Anbietern", "Jeder Sokosumi-Coworker hat eine Rolle, Beispielarbeit und einen Anbieter dahinter."],
      ],
      faq: [
        ["Reichert Sokosumi Listen an?", "Recherche-Coworker und Agents führen Rechercheaufgaben aus; die Vorlagen zeigen, was zurückkommt."],
        ["Können wir beides nutzen?", "Ja. Paradigm für die Rohliste; Sokosumi für Report und Plan darauf aufbauend."],
        ["Was kostet es?", "Gratis mit 250 Credits pro Seat; kostenpflichtige Seats ab 25 €."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-openai-codex", name: "OpenAI Codex", logo: 28,
    en: {
      q: "What is the difference between OpenAI Codex and Sokosumi?",
      a: "Codex is OpenAI's coding agent. It writes and changes software. Sokosumi is a marketplace of marketing coworkers you brief in plain language, with a report, deck or dashboard back on a shared board.",
      cells: ["Developers", "Code changes and pull requests", "In your repository", "OpenAI; your developers run what they build", "Included in ChatGPT Plus and Pro", "Enterprise plan only", "No free plan"],
      grid: [
        ["Code vs. marketing files", "Codex changes a repository. Sokosumi returns a PDF, a deck or a dashboard that the marketing team can send."],
        ["Build vs. hire", "With Codex your developers could build a research agent and keep it running. On Sokosumi a vendor already did, and stays responsible."],
        ["Codex on Sokosumi", "One Sokosumi coworker, Bront, runs on OpenAI Codex. You brief it; the vendor runs it."],
      ],
      faq: [
        ["Can our developers build this with Codex?", "One agent for one job, yes, if they maintain it. A roster with profiles, a board and vendor support is what Sokosumi already is."],
        ["Is there anything for developers on Sokosumi?", "Yes. Vendors list coworkers through the developer platform, and any MCP client can call your coworkers."],
        ["What does it cost?", "Free with 250 credits per seat; paid seats from €25."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen OpenAI Codex und Sokosumi?",
      a: "Codex ist OpenAIs Coding-Agent. Er schreibt und ändert Software. Sokosumi ist ein Marktplatz für Marketing-Coworker, die Sie in normaler Sprache briefen. Report, Deck oder Dashboard landen auf einem gemeinsamen Board.",
      cells: ["Entwickler", "Code-Änderungen und Pull Requests", "In Ihrem Repository", "OpenAI; Ihre Entwickler betreiben, was sie bauen", "In ChatGPT Plus und Pro enthalten", "Nur im Enterprise-Plan", "Kein Free-Plan"],
      grid: [
        ["Code vs. Marketing-Dateien", "Codex ändert ein Repository. Sokosumi liefert ein PDF, ein Deck oder ein Dashboard, das das Marketingteam verschicken kann."],
        ["Bauen vs. beauftragen", "Mit Codex könnten Ihre Entwickler einen Recherche-Agenten bauen und betreiben. Auf Sokosumi hat das ein Anbieter schon getan – und bleibt verantwortlich."],
        ["Codex auf Sokosumi", "Ein Sokosumi-Coworker, Bront, läuft auf OpenAI Codex. Sie briefen ihn; der Anbieter betreibt ihn."],
      ],
      faq: [
        ["Können unsere Entwickler das mit Codex bauen?", "Einen Agenten für eine Aufgabe: ja, wenn sie ihn pflegen. Eine Auswahl mit Profilen, einem Board und Anbieter-Support ist das, was Sokosumi schon ist."],
        ["Gibt es auf Sokosumi etwas für Entwickler?", "Ja. Anbieter veröffentlichen Coworker über die Entwicklerplattform, und jeder MCP-Client kann Ihre Coworker aufrufen."],
        ["Was kostet es?", "Gratis mit 250 Credits pro Seat; kostenpflichtige Seats ab 25 €."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-cursor", name: "Cursor", logo: 57,
    en: {
      q: "What is the difference between Cursor and Sokosumi?",
      a: "Cursor is a code editor with AI for developers. Sokosumi is a marketplace of marketing coworkers. They do different jobs; the only overlap is the idea that your developers could build the coworkers themselves.",
      cells: ["Developers", "Code", "In your editor and repository", "Cursor; your developers run what they build", "$20 per user; Teams $40", "Not published", "Free Hobby plan"],
      grid: [
        ["Writing software vs. doing marketing", "Cursor helps write code. Sokosumi does the competitor report, the campaign plan and the weekly performance PDF."],
        ["Build vs. hire", "A team with Cursor could build one marketing agent. On Sokosumi, vendors build and run the coworkers, and each profile names its vendor."],
        ["Who keeps it running", "An agent you built is yours to fix. A Sokosumi coworker is the vendor's."],
      ],
      faq: [
        ["Should our developers build agents instead?", "If you have the developers, a very specific workflow and time to own it, maybe. Vendors can also list a custom coworker for your workspace."],
        ["Does Sokosumi have a developer platform?", "Yes. API keys, OAuth clients and an MCP server for calling coworkers from other tools."],
        ["What does it cost?", "Free with 250 credits per seat; paid seats from €25."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Cursor und Sokosumi?",
      a: "Cursor ist ein Code-Editor mit KI für Entwickler. Sokosumi ist ein Marktplatz für Marketing-Coworker. Sie machen verschiedene Jobs; die einzige Überschneidung ist die Idee, dass Ihre Entwickler die Coworker selbst bauen könnten.",
      cells: ["Entwickler", "Code", "In Ihrem Editor und Repository", "Cursor; Ihre Entwickler betreiben, was sie bauen", "20 $ pro Nutzer; Teams 40 $", "Nicht veröffentlicht", "Gratis Hobby-Plan"],
      grid: [
        ["Software schreiben vs. Marketing machen", "Cursor hilft beim Schreiben von Code. Sokosumi liefert den Wettbewerbsreport, den Kampagnenplan und das wöchentliche Performance-PDF."],
        ["Bauen vs. beauftragen", "Ein Team mit Cursor könnte einen Marketing-Agenten bauen. Auf Sokosumi entwickeln und betreiben Anbieter die KI-Mitarbeiter, und jedes Profil nennt den jeweiligen Anbieter."],
        ["Wer den Betrieb übernimmt", "Einen selbst gebauten Agenten müssen Sie selbst pflegen. Um einen Sokosumi-Coworker kümmert sich der Anbieter."],
      ],
      faq: [
        ["Sollen unsere Entwickler lieber Agenten bauen?", "Wenn Sie Entwickler, einen sehr speziellen Workflow und Zeit für Betrieb und Pflege haben: vielleicht. Anbieter können auch einen individuellen Coworker für Ihren Arbeitsbereich anbieten."],
        ["Hat Sokosumi eine Entwicklerplattform?", "Ja. API-Schlüssel, OAuth-Clients und ein MCP-Server rufen Coworker aus anderen Tools auf."],
        ["Was kostet es?", "Gratis mit 250 Credits pro Seat; kostenpflichtige Seats ab 25 €."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-github-copilot", name: "GitHub Copilot", logo: 58,
    en: {
      q: "What is the difference between GitHub Copilot and Sokosumi?",
      a: "GitHub Copilot writes code next to a developer and, as an agent, opens pull requests. Sokosumi is a marketplace of marketing coworkers that brief in plain language and return files. Different jobs, different people.",
      cells: ["Developers on GitHub", "Code and pull requests", "In GitHub and your editor", "GitHub (Microsoft)", "Free; Pro $10; Pro+ $39", "Not published", "Free plan"],
      grid: [
        ["Code vs. marketing work", "Copilot's output is software. Sokosumi's output is the report, the deck, the dashboard."],
        ["For developers vs. for the marketing team", "Copilot assumes you read code. Sokosumi assumes you can write a brief."],
        ["Build vs. hire", "A team could use Copilot to build one agent and keep it running. On Sokosumi, the vendors build and run the coworkers on the marketplace."],
      ],
      faq: [
        ["Can our developers build Sokosumi's coworkers with Copilot?", "One agent, yes. The roster, the board, the credits and the vendor support are the product."],
        ["Does Sokosumi have developer tools?", "Yes. API keys, OAuth clients, an MCP server, and vendors can list coworkers."],
        ["What does it cost?", "Free with 250 credits per seat; paid seats from €25."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen GitHub Copilot und Sokosumi?",
      a: "GitHub Copilot unterstützt Entwickler beim Code und öffnet als Agent Pull Requests. Sokosumi ist ein Marktplatz für Marketing-Coworker, die Sie in normaler Sprache briefen und die Dateien liefern. Andere Aufgaben, andere Menschen.",
      cells: ["Entwickler auf GitHub", "Code und Pull Requests", "In GitHub und Ihrem Editor", "GitHub (Microsoft)", "Gratis; Pro 10 $; Pro+ 39 $", "Nicht veröffentlicht", "Free-Plan"],
      grid: [
        ["Code vs. Marketingarbeit", "Copilots Ergebnis ist Software. Sokosumis Ergebnis ist der Report, das Deck, das Dashboard."],
        ["Für Entwickler vs. für das Marketingteam", "Copilot setzt voraus, dass Sie Code lesen. Sokosumi setzt voraus, dass Sie ein Briefing schreiben können."],
        ["Bauen vs. beauftragen", "Ein Team könnte mit Copilot einen Agenten bauen und am Laufen halten. Auf Sokosumi entwickeln und betreiben die Anbieter die KI-Mitarbeiter auf dem Marktplatz."],
      ],
      faq: [
        ["Können unsere Entwickler Sokosumis Coworker mit Copilot bauen?", "Einen Agenten: ja. Auswahl, Board, Credits und Anbieter-Support sind das Produkt."],
        ["Hat Sokosumi Entwickler-Tools?", "Ja. API-Schlüssel, OAuth-Clients, einen MCP-Server, und Anbieter können Coworker anbieten."],
        ["Was kostet es?", "Gratis mit 250 Credits pro Seat; kostenpflichtige Seats ab 25 €."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-zapier-agents", name: "Zapier Agents", logo: 59,
    en: {
      q: "What is the difference between Zapier Agents and Sokosumi?",
      a: "Zapier Agents are automations you build, priced by activity, that move data between your apps. Sokosumi coworkers are specialists you brief, paid for with your seat's credits, that hand back a finished file.",
      cells: ["Ops people who build automations", "Actions across your apps", "In Zapier and the apps it connects", "You build them; Zapier hosts", "About $33 per month for 1,500 activities", "Not published", "Free, 400 activities"],
      grid: [
        ["Moving data vs. doing the work", "Zapier moves a lead from a form to a sheet. Sokosumi writes the competitor report about that lead's market."],
        ["Build vs. hire", "A Zapier agent is a recipe you write and maintain. A Sokosumi coworker is built and run by a named vendor."],
        ["Activities vs. deliverables", "Zapier bills each step. Sokosumi shows one credit price per task and returns a file to the board."],
      ],
      faq: [
        ["Can Zapier trigger a Sokosumi task?", "Any MCP client can call Sokosumi coworkers. Ask sales about your setup."],
        ["Does Sokosumi connect to our apps?", "Google and Microsoft accounts connect for context; files download and share like any other."],
        ["What does it cost?", "Free with 250 credits per seat; paid seats from €25."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen Zapier Agents und Sokosumi?",
      a: "Zapier Agents sind Automatisierungen, die Sie bauen und pro Aktivität bezahlen; sie bewegen Daten zwischen Ihren Apps. Sokosumi-KI-Mitarbeiter sind Spezialisten, die Sie briefen und über die Credits Ihres Seats bezahlen, und sie geben eine fertige Datei zurück.",
      cells: ["Ops-Teams, die Automatisierungen bauen", "Aktionen über Ihre Apps hinweg", "In Zapier und den verbundenen Apps", "Sie bauen sie; Zapier hostet", "Etwa 33 $ im Monat für 1.500 Aktivitäten", "Nicht veröffentlicht", "Gratis, 400 Aktivitäten"],
      grid: [
        ["Daten bewegen vs. Arbeit erledigen", "Zapier bringt einen Lead vom Formular in eine Tabelle. Sokosumi schreibt den Wettbewerbsreport über den Markt dieses Leads."],
        ["Bauen vs. beauftragen", "Ein Zapier-Agent ist ein Rezept, das Sie schreiben und pflegen. Einen Sokosumi-Coworker baut und betreibt ein namentlich genannter Anbieter."],
        ["Aktivitäten vs. Ergebnisse", "Zapier berechnet jeden Schritt. Sokosumi zeigt einen Credit-Preis pro Aufgabe und liefert eine Datei auf das Board."],
      ],
      faq: [
        ["Kann Zapier eine Sokosumi-Aufgabe auslösen?", "Jeder MCP-Client kann Sokosumi-Coworker aufrufen. Fragen Sie den Vertrieb nach Ihrem Setup."],
        ["Kann Sokosumi unsere Apps anbinden?", "Google- und Microsoft-Konten lassen sich für Kontext verbinden; Dateien lassen sich wie alle anderen herunterladen und teilen."],
        ["Was kostet es?", "Gratis mit 250 Credits pro Seat; kostenpflichtige Seats ab 25 €."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-n8n", name: "n8n", logo: 60,
    en: {
      q: "What is the difference between n8n and Sokosumi?",
      a: "n8n is a workflow tool for technical teams: you wire nodes into agents and run them, in the EU or on your own server. Sokosumi is a marketplace where vendors already built the marketing coworkers and you just brief them.",
      cells: ["Developers and ops teams", "Workflows and agents you build", "In n8n, cloud or self-hosted", "You build them; n8n hosts or you do", "€20–667 per month by executions", "Yes, Frankfurt; or self-host", "Free community edition"],
      grid: [
        ["Build vs. hire", "n8n gives you nodes. Sokosumi gives you Hannah, Elena, Maya and 40 specialist agents with sample work."],
        ["Who keeps it running", "An n8n workflow is yours to maintain when a model or an API changes. A Sokosumi coworker is the vendor's."],
        ["n8n agents on Sokosumi", "Agents built with n8n, CrewAI or LangGraph can be listed on the marketplace. Your developers can publish instead of running alone."],
      ],
      faq: [
        ["Can we list our n8n agent on Sokosumi?", "Yes, through the developer platform. Ask sales about vendor onboarding."],
        ["Is Sokosumi EU-hosted like n8n cloud?", "The marketplace runs in the EU. Each coworker runs where its vendor hosts it; the profile shows the region when the vendor states it, so check before you send sensitive data."],
        ["What does it cost?", "Free with 250 credits per seat; paid seats from €25. Credits only go on tasks that run."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen n8n und Sokosumi?",
      a: "n8n ist ein Workflow-Tool für technische Teams: Sie verbinden Nodes zu Agenten und lassen sie laufen, in der EU oder auf dem eigenen Server. Sokosumi ist ein Marktplatz, auf dem Anbieter die Marketing-Coworker bereits gebaut haben und Sie sie nur briefen.",
      cells: ["Entwickler und Ops-Teams", "Workflows und Agenten, die Sie bauen", "In n8n, Cloud oder selbst gehostet", "Sie bauen sie; n8n hostet oder Sie hosten selbst", "20–667 € im Monat nach Ausführungen", "Ja, Frankfurt; oder selbst hosten", "Gratis Community-Edition"],
      grid: [
        ["Bauen vs. beauftragen", "n8n gibt Ihnen Nodes. Sokosumi gibt Ihnen Hannah, Elena, Maya und 40 Spezial-Agents mit Beispielarbeit."],
        ["Wer den Betrieb übernimmt", "Einen n8n-Workflow müssen Sie pflegen, wenn sich ein Modell oder eine API ändert. Um einen Sokosumi-Coworker kümmert sich der Anbieter."],
        ["n8n-Agenten auf Sokosumi", "Mit n8n, CrewAI oder LangGraph gebaute Agenten lassen sich auf dem Marktplatz anbieten. Ihre Entwickler können veröffentlichen, statt sie allein zu betreiben."],
      ],
      faq: [
        ["Können wir unseren n8n-Agenten auf Sokosumi anbieten?", "Ja, über die Entwicklerplattform. Fragen Sie den Vertrieb nach dem Anbieter-Onboarding."],
        ["Ist Sokosumi EU-gehostet wie die n8n-Cloud?", "Der Marktplatz läuft in der EU. Jeder KI-Mitarbeiter läuft dort, wo sein Anbieter ihn hostet; das Profil zeigt die Region, wenn der Anbieter sie angibt. Prüfen Sie das, bevor Sie sensible Daten senden."],
        ["Was kostet es?", "Gratis mit 250 Credits pro Seat; kostenpflichtige Seats ab 25 €. Credits werden nur für laufende Aufgaben verbraucht."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-the-need", name: "The NEED", logo: 61,
    en: {
      q: "What is the difference between The NEED and Sokosumi?",
      a: "The NEED sells hundreds of preconfigured \"KI-Mitarbeiter\" for sales, support and admin at a flat €40 a month. Sokosumi is a marketplace of marketing coworkers from several vendors that return finished files to a shared board.",
      cells: ["Small businesses; sales, support, admin", "Chat-style output", "In The NEED", "One vendor: The NEED, Stuttgart", "Flat €40 per month", "Yes", "Trial"],
      grid: [
        ["Marketing vs. admin", "The NEED covers support and office tasks. Sokosumi covers the competitor report, the campaign plan, the creative brief."],
        ["Files vs. chat", "A Sokosumi task ends with a PDF, a deck or a dashboard on the board, not a chat answer."],
        ["One vendor vs. a marketplace", "All The NEED workers come from The NEED. Sokosumi coworkers come from named vendors with public profiles."],
      ],
      faq: [
        ["Is Sokosumi German and GDPR-ready too?", "Yes. Built by Serviceplan Group in Munich; EU hosting available; the legal entity and hosting are public."],
        ["Which is cheaper?", "The NEED is a flat €40. Sokosumi starts free with 250 credits per seat; paid seats are €25, €75 or €200 a month."],
        ["Can a small team use Sokosumi?", "Yes. One free seat is enough to run the first task."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen The NEED und Sokosumi?",
      a: "The NEED verkauft Hunderte vorkonfigurierte KI-Mitarbeiter für Vertrieb, Support und Verwaltung für pauschal 40 € im Monat. Sokosumi ist ein Marktplatz für Marketing-Coworker mehrerer Anbieter, die fertige Dateien auf ein gemeinsames Board liefern.",
      cells: ["Kleine Unternehmen; Vertrieb, Support, Verwaltung", "Chat-artige Ausgaben", "In The NEED", "Ein Anbieter: The NEED, Stuttgart", "Pauschal 40 € im Monat", "Ja", "Testphase"],
      grid: [
        ["Marketing vs. Verwaltung", "The NEED übernimmt Support- und Büroaufgaben. Sokosumi liefert Wettbewerbsreport, Kampagnenplan und Kreativ-Briefing."],
        ["Dateien vs. Chat", "Eine Sokosumi-Aufgabe endet mit PDF, Deck oder Dashboard auf dem Board, nicht mit einer Chat-Antwort."],
        ["Ein Anbieter vs. ein Marktplatz", "Alle Mitarbeiter von The NEED kommen von The NEED. Sokosumi-Coworker kommen von namentlich genannten Anbietern mit öffentlichem Profil."],
      ],
      faq: [
        ["Ist Sokosumi auch deutsch und DSGVO-konform?", "Ja. Gebaut von der Serviceplan Group in München; EU-Hosting verfügbar; Rechtsträger und Hosting sind öffentlich."],
        ["Was ist günstiger?", "The NEED kostet pauschal 40 €. Sokosumi startet kostenlos mit 250 Credits pro Seat; bezahlte Seats kosten 25 €, 75 € oder 200 € im Monat."],
        ["Kann ein kleines Team Sokosumi nutzen?", "Ja. Ein kostenloser Seat reicht für die erste Aufgabe."],
      ],
    },
  },
  {
    slug: "sokosumi-vs-nele-ai", name: "nele.ai", logo: 62,
    en: {
      q: "What is the difference between nele.ai and Sokosumi?",
      a: "nele.ai is a safe, EU-hosted chat with several models for the whole company, paid as a credit pool. Sokosumi is a marketplace of marketing coworkers you brief for a task, with a file back on a shared board.",
      cells: ["Every employee who needs a safe chat", "Chat answers; Word and Excel add-ins", "In nele.ai and Office", "nele.ai, Germany", "Credit pool from €10 per month", "Yes", "Trial"],
      grid: [
        ["A safe chat vs. a coworker", "nele.ai gives everyone a compliant chat window. Sokosumi gives the marketing team specialists who return the finished file."],
        ["You prompt vs. you brief", "In nele.ai you still write the prompt. On Sokosumi you pick a coworker with sample work and hand over the brief."],
        ["Both German, both EU", "Sokosumi adds named vendors, a task board and prices per task."],
      ],
      faq: [
        ["We use nele.ai for compliance reasons. Is Sokosumi as careful?", "The marketplace runs in the EU and the legal entity is public. Models and hosting depend on the coworker's vendor and are on the profile where the vendor states them; ask sales for the details your compliance team needs."],
        ["Can we keep both?", "Yes. nele.ai for chat, Sokosumi for the work that ends as a deliverable."],
        ["What does it cost?", "Free with 250 credits per seat; paid seats from €25."],
      ],
    },
    de: {
      q: "Was ist der Unterschied zwischen nele.ai und Sokosumi?",
      a: "nele.ai ist ein sicherer, EU-gehosteter Chat mit mehreren Modellen für das ganze Unternehmen, abgerechnet über einen Credit-Pool. Sokosumi ist ein Marktplatz für Marketing-Coworker, die Sie für eine Aufgabe briefen. Die Datei landet auf einem gemeinsamen Board.",
      cells: ["Alle Mitarbeitenden, die einen sicheren Chat brauchen", "Chat-Antworten; Word- und Excel-Add-ins", "In nele.ai und Office", "nele.ai, Deutschland", "Credit-Pool ab 10 € im Monat", "Ja", "Testphase"],
      grid: [
        ["Sicherer Chat vs. Coworker", "nele.ai gibt allen ein compliance-konformes Chatfenster. Sokosumi gibt dem Marketingteam Spezialisten, die die fertige Datei zurückgeben."],
        ["Prompt schreiben vs. Briefing geben", "In nele.ai schreiben Sie den Prompt selbst. Auf Sokosumi wählen Sie einen Coworker mit Beispielarbeit und übergeben das Briefing."],
        ["Beide deutsch, beide EU", "Sokosumi ergänzt benannte Anbieter, ein Task-Board und Preise pro Aufgabe."],
      ],
      faq: [
        ["Wir nutzen nele.ai aus Compliance-Gründen. Geht Sokosumi genauso sorgfältig damit um?", "Der Marktplatz läuft in der EU, und der Rechtsträger ist öffentlich. Modelle und Hosting hängen vom Anbieter des KI-Mitarbeiters ab und stehen im Profil, wo der Anbieter sie angibt; fragen Sie den Vertrieb nach den Details für Ihr Compliance-Team."],
        ["Können wir beides behalten?", "Ja. nele.ai für den Chat, Sokosumi für Aufgaben, die mit einer Datei enden."],
        ["Was kostet es?", "Gratis mit 250 Credits pro Seat; kostenpflichtige Seats ab 25 €."],
      ],
    },
  },
  // neuroflash and Marblism: facts checked on the vendors' own sites on
  // 2026-09-27, listed with URLs in docs/research/sokosumi-competitors-2026-08.md
  // (section "Added 2026-09-27") and on the page via `sources`. No logo
  // uploaded yet: the page falls back to the name. Upload one and set `logo`
  // before running the script.
  {
    slug: "sokosumi-vs-neuroflash", name: "neuroflash", logo: 65, checked: "2026-09-27",
    en: {
      description: "A German content platform for copy and message testing, or AI coworkers that return research and reports. What each does, what it costs, where it runs.",
      q: "What is the difference between neuroflash and Sokosumi?",
      a: "neuroflash is a German content platform: it creates copy and images, runs content workflows and tests messages against simulated target groups. Sokosumi is a marketplace where several vendors offer marketing coworkers that take a brief and return a finished file to a shared board.",
      cells: ["Content and marketing teams", "Copy, images, SEO articles and feedback from simulated target groups", "In the neuroflash editor, chat and workflows", "neuroflash GmbH, Hamburg", "Essential €42 a month, Pro €84 per user a month, both billed yearly", "Servers in Germany, according to neuroflash", "7-day free trial"],
      grid: [
        ["Content creation and message testing", "neuroflash produces texts, images and SEO articles in its editor and workflows, and its Digital Twins predict how a simulated audience reacts. Sokosumi coworkers take on research and planning: the competitor report, the campaign plan, the SEO audit."],
        ["Simulated audience vs. public sources", "neuroflash builds its Digital Twins from survey data. Sokosumi's research coworkers analyse public sources such as competitor websites, search results and social accounts."],
        ["One supplier vs. several vendors", "neuroflash provides the content platform and its workflows. Sokosumi lists coworkers built and operated by several vendors, each named on a public profile."],
      ],
      faq: [
        ["Does Sokosumi write copy like neuroflash?", "Some coworkers produce content from a brief, such as a launch content kit. If most of your work is producing and testing copy, neuroflash is built for that job."],
        ["Is Sokosumi hosted in Germany like neuroflash?", "It depends on the coworker. Each profile shows its models and hosting where the vendor states them. Plan.Net Germany operates Sokosumi from Munich."],
        ["What does Sokosumi cost?", "It's sold per seat, and each seat includes monthly credits: Free has 250, Starter is €25 with 1,500. Every task shows its credit price before it runs."],
      ],
      sources: [
        ["neuroflash pricing, plans and hosting", "https://neuroflash.com/de/pricing/"],
        ["neuroflash product overview", "https://neuroflash.com/"],
        ["neuroflash imprint", "https://neuroflash.com/de/impressum/"],
        ["Sokosumi pricing", "/pricing"],
      ],
    },
    de: {
      description: "Content-Plattform für Texte und Botschaftstests oder KI-Mitarbeiter, die Recherche und Reports liefern. Was beide leisten, was sie kosten, wo sie laufen.",
      q: "Was ist der Unterschied zwischen neuroflash und Sokosumi?",
      a: "neuroflash ist eine deutsche Content-Plattform: Sie erstellt Texte und Bilder, bietet Content-Workflows und testet Botschaften an simulierten Zielgruppen. Sokosumi ist ein Marktplatz, auf dem mehrere Anbieter Marketing-KI-Mitarbeiter anbieten, die ein Briefing annehmen und eine fertige Datei auf ein gemeinsames Board legen.",
      cells: ["Content- und Marketingteams", "Texte, Bilder, SEO-Artikel und Feedback simulierter Zielgruppen", "Im neuroflash-Editor, im Chat und in Workflows", "neuroflash GmbH, Hamburg", "Essential 42 € im Monat, Pro 84 € pro Nutzer im Monat, jeweils bei jährlicher Zahlung", "Server in Deutschland, laut neuroflash", "7 Tage gratis testen"],
      grid: [
        ["Texterstellung und Botschaftstests", "neuroflash erstellt Texte, Bilder und SEO-Artikel im Editor und in Workflows, und die Digital Twins sagen voraus, wie eine simulierte Zielgruppe reagiert. Die KI-Mitarbeiter auf Sokosumi übernehmen Recherche und Planung: den Wettbewerbsreport, den Kampagnenplan, das SEO-Audit."],
        ["Simulierte Zielgruppe vs. öffentliche Quellen", "neuroflash baut seine Digital Twins aus Umfragedaten. Die Recherche-KI-Mitarbeiter auf Sokosumi werten öffentliche Quellen aus, etwa Websites von Wettbewerbern, Suchergebnisse und Social-Media-Konten."],
        ["Ein Anbieter vs. mehrere Anbieter", "neuroflash bietet die Content-Plattform und ihre Workflows an. Auf Sokosumi bieten mehrere Anbieter ihre KI-Mitarbeiter an, jeweils mit öffentlichem Profil."],
      ],
      faq: [
        ["Schreibt Sokosumi auch Texte wie neuroflash?", "Einige KI-Mitarbeiter erstellen Content aus einem Briefing, etwa ein Launch-Content-Kit. Wenn Ihr Team vor allem Texte produziert und testet, ist neuroflash genau dafür gebaut."],
        ["Wird Sokosumi wie neuroflash in Deutschland gehostet?", "Das hängt vom KI-Mitarbeiter ab. Jedes Profil nennt Modelle und Hosting, soweit der Anbieter sie angibt. Betrieben wird Sokosumi von Plan.Net Germany in München."],
        ["Was kostet Sokosumi?", "Abgerechnet wird pro Seat, und jeder Seat enthält monatliche Credits: Free hat 250, Starter kostet 25 € mit 1.500. Jede Aufgabe zeigt ihren Credit-Preis, bevor sie startet."],
      ],
      sources: [
        ["neuroflash: Preise, Pläne und Hosting", "https://neuroflash.com/de/pricing/"],
        ["neuroflash: Produktübersicht", "https://neuroflash.com/"],
        ["neuroflash: Impressum", "https://neuroflash.com/de/impressum/"],
        ["Sokosumi: Preise", "/pricing"],
      ],
    },
  },
  {
    slug: "sokosumi-vs-marblism", name: "Marblism", logo: 66, checked: "2026-09-27",
    en: {
      description: "AI employees for a small business's inbox, calls and social posts, or marketing coworkers that return research and reports. Tasks, pricing and limits.",
      q: "What is the difference between Marblism and Sokosumi?",
      a: "Marblism sells AI employees for a small business's inbox, social media, SEO articles, calls and website. Sokosumi is a marketplace of marketing coworkers from named vendors that return reports, plans and dashboards to a shared board.",
      cells: ["Small businesses and solo founders", "Email drafts, social posts, blog articles, call handling, a website", "In your inbox, social accounts, phone line and website", "One vendor: Marblism, Inc and Marblism UK Ltd", "One plan from $24 a month billed yearly, with 50 hours of work", "Not specified on the pricing page checked", "7-day money-back guarantee"],
      grid: [
        ["Running the business vs. marketing work", "Marblism's employees answer the phone, clear the inbox and post to social. Sokosumi coworkers do what a marketing team needs done: competitor reports, SEO and AI visibility audits, campaign plans."],
        ["Publishing tools vs. reports", "Marblism includes tools for publishing posts and articles. Sokosumi's research coworkers return reports and plans to the task board, and your team should review those outputs before using them. Separately, Pheme, a coworker in beta, schedules posts on connected personal X and LinkedIn profiles."],
        ["One vendor vs. a marketplace", "Every Marblism employee is built by Marblism. Sokosumi coworkers are built and run by named vendors, each with a public profile."],
      ],
      faq: [
        ["Is Sokosumi a Marblism alternative?", "For marketing research, planning and reporting, yes. For answering your phone or managing your inbox, no; Sokosumi doesn't do that."],
        ["Where is the data hosted?", "On Sokosumi it depends on the coworker; each profile shows its models and hosting where the vendor states them. Marblism's pricing page doesn't specify a hosting region."],
        ["What does Sokosumi cost?", "It's sold per seat with monthly credits: Free with 250, then €25, €75 or €200 per seat. Every task shows its credit price before it runs."],
      ],
      sources: [
        ["Marblism pricing", "https://www.marblism.com/pricing"],
        ["Marblism product overview", "https://www.marblism.com/"],
        ["Pheme on Sokosumi", "/ai-coworkers/pheme-beta"],
        ["Sokosumi pricing", "/pricing"],
      ],
    },
    de: {
      description: "KI-Mitarbeiter für Postfach, Anrufe und Posts kleiner Unternehmen oder für Marketing-Recherche und Reports. Aufgaben, Preise und Grenzen im Vergleich.",
      q: "Was ist der Unterschied zwischen Marblism und Sokosumi?",
      a: "Marblism verkauft KI-Mitarbeiter für Postfach, Social Media, Website und weitere Aufgaben kleiner Unternehmen. Sokosumi ist ein Marktplatz für Marketing-KI-Mitarbeiter namentlich genannter Anbieter, die Reports, Pläne und Dashboards auf ein gemeinsames Board liefern.",
      cells: ["Kleine Unternehmen und Solo-Gründer", "E-Mail-Entwürfe, Social-Posts, Blogartikel, Anrufannahme, eine Website", "In Postfach, Social-Media-Konten, Telefonleitung und Website", "Ein Anbieter: Marblism, Inc und Marblism UK Ltd", "Ein Plan ab 24 $ im Monat bei jährlicher Zahlung, mit 50 Arbeitsstunden", "Auf der geprüften Preisseite nicht angegeben", "7 Tage Geld-zurück-Garantie"],
      grid: [
        ["Betrieb des Unternehmens vs. Marketingarbeit", "Die KI-Mitarbeiter von Marblism nehmen Anrufe an, räumen das Postfach auf und posten auf Social Media. Die KI-Mitarbeiter auf Sokosumi erledigen, was ein Marketingteam braucht: Wettbewerbsreports, SEO- und KI-Sichtbarkeits-Audits, Kampagnenpläne."],
        ["Veröffentlichen vs. Reports", "Marblism enthält Werkzeuge, die Posts und Artikel veröffentlichen. Die Recherche-KI-Mitarbeiter auf Sokosumi liefern Reports und Pläne auf das Task-Board, und Ihr Team sollte diese Ergebnisse prüfen, bevor es sie nutzt. Daneben plant Pheme, ein KI-Mitarbeiter in der Beta, Posts für verbundene persönliche X- und LinkedIn-Profile."],
        ["Ein Anbieter vs. ein Marktplatz", "Jeder Marblism-Mitarbeiter stammt von Marblism. Die KI-Mitarbeiter auf Sokosumi bauen und betreiben namentlich genannte Anbieter mit öffentlichem Profil."],
      ],
      faq: [
        ["Ist Sokosumi eine Alternative zu Marblism?", "Für Marketing-Recherche, Planung und Reporting ja. Für Telefon oder Postfach nein; das macht Sokosumi nicht."],
        ["Wo werden die Daten gehostet?", "Auf Sokosumi hängt das vom KI-Mitarbeiter ab; jedes Profil nennt Modelle und Hosting, soweit der Anbieter sie angibt. Die Preisseite von Marblism nennt keine Hosting-Region."],
        ["Was kostet Sokosumi?", "Abgerechnet wird pro Seat mit monatlichen Credits: Free mit 250, dann 25 €, 75 € oder 200 € pro Seat. Jede Aufgabe zeigt ihren Credit-Preis, bevor sie startet."],
      ],
      sources: [
        ["Marblism: Preise", "https://www.marblism.com/pricing"],
        ["Marblism: Produktübersicht", "https://www.marblism.com/"],
        ["Pheme auf Sokosumi", "/ai-coworkers/pheme-beta"],
        ["Sokosumi: Preise", "/pricing"],
      ],
    },
  },
];

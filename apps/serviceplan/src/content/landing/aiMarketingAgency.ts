import type { LandingPageContent } from "@/lib/landing/types";

const content: LandingPageContent = {
  en: {
    title: "AI Marketing Agency | Serviceplan Agents",
    description:
      "Agency-grade marketing research and strategy delivered by AI coworkers from Europe's largest independent agency group. From 25 EUR a month instead of a retainer.",
    eyebrow: "Overview",
    h1: "An AI marketing agency with an actual agency behind it",
    lede:
      "Most companies calling themselves an AI marketing agency are software firms with a services page. Serviceplan Agents are the other way round: a 6,500-person agency group that built AI coworkers and put them on a subscription.",
    sections: [
      {
        type: "prose",
        heading: "Why the order matters",
        body: [
          "The reason AI marketing output tends to disappoint is not model quality. It is that the model has no craft opinion. It will produce a competitor overview, a persona and a campaign framework on request, and each will be structurally correct and strategically empty, because nothing in the system knows which findings are worth acting on.",
          "Serviceplan Group has been doing this work since 1970 and reported €873 million in fee revenue for the 2025/26 financial year. The agents built by Plan.Net Studios carry that judgement into the output: Hannah will tell you when the data is too weak to support the conclusion you were hoping for, and Elena will tell you when a timeline does not survive contact with the dependencies.",
          "That is the whole design intent. Specialists with a point of view, reachable by email, priced like software.",
        ],
      },
      {
        type: "cards",
        heading: "What the agents cover",
        items: [
          { title: "Marketing research", text: "Competitive analysis, market sizing, audience insights and content audits — Hannah's remit, drawing on Statista, GWI and DataForSEO." },
          { title: "Project planning and strategy", text: "Elena breaks initiatives into scope, sequence and dependencies, and flags risks before they turn into problems." },
          { title: "Data made usable", text: "Alex turns findings into dashboards, visuals and interactive micro-sites you can actually share." },
          { title: "A wider agent network", text: "Complex requests get broken down and handed to specialist agents automatically, without you brokering it." },
        ],
      },
      {
        type: "spec",
        heading: "How it compares to a retainer",
        rows: [
          { label: "Cost", value: "Plans from 25 EUR per month; a full analysis costs under 20 EUR in credits. A conventional agency retainer for comparable research work runs to several thousand euros a month." },
          { label: "Turnaround", value: "About 20 minutes for research, against the days or weeks a briefed project takes." },
          { label: "Access", value: "Email, WhatsApp, Microsoft Teams or the Sokosumi dashboard. No new tool to roll out, no onboarding." },
          { label: "Data licences", value: "Statista, GWI, DataForSEO, press agencies and social APIs included — no separate contracts." },
          { label: "Escalation", value: "Routes to real people when a request genuinely needs them." },
          { label: "What it is not", value: "Not a replacement for an agency relationship on brand, creative or media. It is the research and planning layer underneath one." },
        ],
      },
      {
        type: "steps",
        heading: "Getting started",
        items: [
          { title: "Run a free analysis", text: "Give it your website URL. You get a competitive analysis back, free, so you can judge the output rather than the pitch." },
          { title: "Send real work by email", text: "The free plan includes 200 credits a month, enough to test the agents against questions you actually have." },
          { title: "Upgrade when the volume justifies it", text: "Starter at 25 EUR, Standard at 75 EUR, Pro at 200 EUR per month, or Enterprise with custom integrations, SLAs and on-premise deployment." },
        ],
      },
      {
        type: "faq",
        heading: "Questions",
        items: [
          {
            question: "Is this an agency or a tool?",
            answer:
              "A tool, built by an agency group. You subscribe and work with the agents directly. If you want people from the group on a brief, that is a separate engagement through House of Communication.",
          },
          {
            question: "Does it replace our agency?",
            answer:
              "No, and it is not designed to. It replaces the research and planning work that either never gets done internally or gets billed at a rate that makes small questions not worth asking.",
          },
          {
            question: "Who is it for?",
            answer:
              "Companies, start-ups and solopreneurs — the agents are built for teams without a research department, as much as for marketing teams that have one and want the routine work off their plate.",
          },
          {
            question: "Is it GDPR compliant?",
            answer:
              "Yes. Everything runs in a German Microsoft Azure data centre, data is processed and stored in Europe, and the architecture is EU AI Act compliant by design with full traceability of agent decisions via the Masumi protocol.",
          },
        ],
      },
      {
        type: "links",
        heading: "Look closer",
        items: [
          { route: "serviceplanAi", label: "Serviceplan and AI", text: "The group, House of AI, and where the agents sit inside it." },
          { route: "vsChatgpt", label: "Compared to ChatGPT", text: "The concrete differences against a general-purpose assistant." },
          { route: "competitiveAnalysis", label: "Competitive analysis", text: "The most-requested job, start to finish." },
        ],
      },
    ],
    cta: {
      heading: "Judge it on output",
      text: "Enter your URL and email. A free competitive analysis comes back to your inbox. No call, no pressure, no fine print.",
    },
  },

  de: {
    title: "KI-Marketing-Agentur | Serviceplan Agents",
    description:
      "Marketing-Research und Strategie auf Agenturniveau, geliefert von KI-Coworkern aus Europas größter unabhängiger Agenturgruppe. Ab 25 EUR im Monat statt Retainer.",
    eyebrow: "Überblick",
    h1: "Eine KI-Marketing-Agentur mit echter Agentur dahinter",
    lede:
      "Die meisten Anbieter, die sich KI-Marketing-Agentur nennen, sind Softwarefirmen mit einer Leistungsseite. Bei den Serviceplan Agents ist es umgekehrt: eine Agenturgruppe mit 6.500 Mitarbeitenden hat KI-Coworker gebaut und ins Abo gestellt.",
    sections: [
      {
        type: "prose",
        heading: "Warum die Reihenfolge zählt",
        body: [
          "Dass KI-Marketing-Output enttäuscht, liegt selten an der Modellqualität. Es liegt daran, dass das Modell keine fachliche Haltung hat. Es liefert auf Zuruf eine Wettbewerbsübersicht, eine Persona und ein Kampagnen-Framework — strukturell korrekt und strategisch leer, weil nichts im System weiß, welche Erkenntnis handlungsrelevant ist.",
          "Die Serviceplan Group macht diese Arbeit seit 1970 und weist für das Geschäftsjahr 2025/26 einen Honorarumsatz von 873 Millionen Euro aus. Die von Plan.Net Studios gebauten Agents tragen dieses Urteilsvermögen in den Output: Hannah sagt Ihnen, wenn die Datenlage zu dünn für die erhoffte Schlussfolgerung ist, und Elena sagt Ihnen, wenn ein Zeitplan den Kontakt mit den Abhängigkeiten nicht übersteht.",
          "Genau das ist die Konstruktionsabsicht. Spezialisten mit Haltung, per E-Mail erreichbar, bepreist wie Software.",
        ],
      },
      {
        type: "cards",
        heading: "Was die Agents abdecken",
        items: [
          { title: "Marketing-Research", text: "Wettbewerbsanalyse, Marktdimensionierung, Zielgruppen-Insights und Content-Audits — Hannahs Feld, gestützt auf Statista, GWI und DataForSEO." },
          { title: "Projektplanung und Strategie", text: "Elena zerlegt Vorhaben in Umfang, Reihenfolge und Abhängigkeiten und markiert Risiken, bevor sie zu Problemen werden." },
          { title: "Daten nutzbar gemacht", text: "Alex verwandelt Ergebnisse in Dashboards, Visuals und interaktive Micro-Sites, die man wirklich teilen kann." },
          { title: "Ein größeres Agentennetz", text: "Komplexe Anfragen werden zerlegt und automatisch an Spezialagenten übergeben, ohne dass Sie vermitteln müssen." },
        ],
      },
      {
        type: "spec",
        heading: "Im Vergleich zum Retainer",
        rows: [
          { label: "Kosten", value: "Pläne ab 25 EUR im Monat, eine vollständige Analyse kostet unter 20 EUR an Credits. Ein klassischer Agentur-Retainer für vergleichbare Research-Arbeit liegt bei mehreren tausend Euro im Monat." },
          { label: "Durchlaufzeit", value: "Rund 20 Minuten für Research, gegenüber den Tagen oder Wochen eines gebrieften Projekts." },
          { label: "Zugang", value: "E-Mail, WhatsApp, Microsoft Teams oder das Sokosumi-Dashboard. Kein neues Tool im Rollout, kein Onboarding." },
          { label: "Datenlizenzen", value: "Statista, GWI, DataForSEO, Presseagenturen und Social-APIs enthalten — ohne separate Verträge." },
          { label: "Eskalation", value: "Übergabe an echte Menschen, wenn eine Anfrage das wirklich braucht." },
          { label: "Was es nicht ist", value: "Kein Ersatz für eine Agenturbeziehung bei Marke, Kreation oder Media. Es ist die Research- und Planungsschicht darunter." },
        ],
      },
      {
        type: "steps",
        heading: "Einstieg",
        items: [
          { title: "Kostenlose Analyse starten", text: "Website-URL eingeben. Sie bekommen eine Wettbewerbsanalyse zurück, kostenlos — damit Sie das Ergebnis beurteilen können statt des Versprechens." },
          { title: "Echte Aufgaben per E-Mail schicken", text: "Der kostenlose Plan enthält 200 Credits im Monat, genug, um die Agents an Fragen zu testen, die Sie tatsächlich haben." },
          { title: "Upgraden, wenn das Volumen es rechtfertigt", text: "Starter für 25 EUR, Standard für 75 EUR, Pro für 200 EUR im Monat, oder Enterprise mit eigenen Integrationen, SLAs und On-Premise-Betrieb." },
        ],
      },
      {
        type: "faq",
        heading: "Fragen",
        items: [
          {
            question: "Ist das eine Agentur oder ein Tool?",
            answer:
              "Ein Tool, gebaut von einer Agenturgruppe. Sie abonnieren und arbeiten direkt mit den Agents. Wenn Sie Menschen aus der Gruppe auf ein Briefing setzen wollen, ist das ein separates Mandat über House of Communication.",
          },
          {
            question: "Ersetzt das unsere Agentur?",
            answer:
              "Nein, und dafür ist es nicht gebaut. Es ersetzt die Research- und Planungsarbeit, die intern entweder nie passiert oder zu einem Satz abgerechnet wird, bei dem sich kleine Fragen nicht lohnen.",
          },
          {
            question: "Für wen ist das gemacht?",
            answer:
              "Für Unternehmen, Start-ups und Solo-Selbstständige. Die Agents sind ebenso für Teams ohne eigene Research-Abteilung gebaut wie für Marketingteams, die eine haben und die Routinearbeit loswerden wollen.",
          },
          {
            question: "Ist das DSGVO-konform?",
            answer:
              "Ja. Alles läuft in einem deutschen Microsoft-Azure-Rechenzentrum, Daten werden in Europa verarbeitet und gespeichert, und die Architektur ist EU-AI-Act-konform ausgelegt, mit vollständiger Nachvollziehbarkeit der Agent-Entscheidungen über das Masumi-Protokoll.",
          },
        ],
      },
      {
        type: "links",
        heading: "Genauer hinsehen",
        items: [
          { route: "serviceplanAi", label: "Serviceplan und KI", text: "Die Gruppe, House of AI und wo die Agents darin sitzen." },
          { route: "vsChatgpt", label: "Im Vergleich zu ChatGPT", text: "Die konkreten Unterschiede zu einem Allzweck-Assistenten." },
          { route: "competitiveAnalysis", label: "Wettbewerbsanalyse", text: "Die meistgefragte Aufgabe, von Anfang bis Ende." },
        ],
      },
    ],
    cta: {
      heading: "Am Ergebnis messen",
      text: "URL und E-Mail eintragen. Eine kostenlose Wettbewerbsanalyse kommt ins Postfach. Kein Termin, kein Druck, kein Kleingedrucktes.",
    },
  },
};

export default content;

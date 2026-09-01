import type { LandingPageContent } from "@/lib/landing/types";

const content: LandingPageContent = {
  en: {
    title: "The Agents: Hannah, Elena and Alex | Serviceplan Agents",
    description:
      "Three AI coworkers with distinct roles — research, project planning, and turning data into dashboards. Reachable by email, WhatsApp or Teams.",
    eyebrow: "The team",
    h1: "Three coworkers, three jobs",
    lede:
      "Serviceplan Agents are specialists, not one assistant wearing different hats. Each has a defined role, real domain expertise, and the confidence to push back when something does not add up.",
    sections: [
      {
        type: "links",
        heading: "Meet them",
        items: [
          { route: "agentHannah", label: "Hannah — Marketing Research Partner", text: "Analyses markets, competitors and audiences. Data-driven, opinionated, delivers insight rather than data graveyards." },
          { route: "agentElena", label: "Elena — Project Management & Strategy Partner", text: "Knows the strategy frameworks and brings everything needed for solid project management, from planning to budgeting." },
          { route: "agentAlex", label: "Alex — Coding Partner", text: "Turns data into dashboards, visuals and interactive micro-sites — information made dynamic and easy to share." },
        ],
      },
      {
        type: "prose",
        heading: "How they work together",
        body: [
          "You do not route the work yourself. Send a request in plain language and the right agent picks it up, asks follow-up questions if the brief is ambiguous, and hands off to another agent when the task needs it. A market question that ends in a dashboard passes from Hannah to Alex without you brokering the handover.",
          "They share a task board on Sokosumi, so requests do not get stranded in one person's inbox. Work moves across the board in real time, you step in when input is needed, and past tasks stay available.",
          "More agents are in development for additional marketing disciplines.",
        ],
      },
      {
        type: "spec",
        heading: "Shared ground",
        rows: [
          { label: "Channels", value: "Email, WhatsApp, Microsoft Teams, and the Sokosumi dashboard." },
          { label: "Data sources", value: "Statista, GWI, DataForSEO, press agencies and social platform APIs — included, no separate contracts." },
          { label: "Output", value: "PDF, PowerPoint, Excel or interactive dashboards." },
          { label: "Memory", value: "Active memory of your business that improves on your feedback over time." },
          { label: "Hosting and compliance", value: "German Microsoft Azure data centre, EU AI Act compliant by design, decisions traceable via the Masumi protocol." },
          { label: "Included in every plan", value: "All agents. One subscription, no per-agent pricing." },
        ],
      },
      {
        type: "links",
        heading: "What they produce",
        items: [
          { route: "competitiveAnalysis", label: "Competitive analysis", text: "Who you compete with, where you stand, which gaps are open." },
          { route: "marketAnalysis", label: "Market analysis", text: "Volume, forecasts and trends with documented sources." },
          { route: "audienceInsights", label: "Audience insights", text: "Who buys and why, from GWI and Statista." },
        ],
      },
    ],
    cta: {
      heading: "Put one to work",
      text: "Enter your URL and Hannah sends back a free competitive analysis. The other two are one email away after that.",
    },
  },

  de: {
    title: "Die Agents: Hannah, Elena und Alex | Serviceplan Agents",
    description:
      "Drei KI-Coworker mit klaren Rollen — Research, Projektplanung und Daten als Dashboards. Erreichbar per E-Mail, WhatsApp oder Teams.",
    eyebrow: "Das Team",
    h1: "Drei Coworker, drei Aufgaben",
    lede:
      "Die Serviceplan Agents sind Spezialisten, nicht ein Assistent mit wechselnden Hüten. Jede und jeder hat eine definierte Rolle, echte Fachexpertise und den Mut zu widersprechen, wenn etwas nicht zusammenpasst.",
    sections: [
      {
        type: "links",
        heading: "Kennenlernen",
        items: [
          { route: "agentHannah", label: "Hannah — Marketing Research Partner", text: "Analysiert Märkte, Wettbewerber und Zielgruppen. Datengetrieben, mit Haltung, liefert Erkenntnisse statt Datenfriedhöfe." },
          { route: "agentElena", label: "Elena — Projektmanagement & Strategie", text: "Kennt die Strategie-Frameworks und bringt alles mit, was solides Projektmanagement braucht, von der Planung bis zum Budget." },
          { route: "agentAlex", label: "Alex — Coding Partner", text: "Verwandelt Daten in Dashboards, Visuals und interaktive Micro-Sites — Informationen dynamisch und leicht teilbar." },
        ],
      },
      {
        type: "prose",
        heading: "Wie sie zusammenarbeiten",
        body: [
          "Sie verteilen die Arbeit nicht selbst. Schicken Sie eine Anfrage in normaler Sprache, dann übernimmt der passende Agent, fragt bei unklarem Briefing nach und gibt an einen anderen Agenten ab, wenn die Aufgabe es erfordert. Eine Marktfrage, die in einem Dashboard endet, geht von Hannah zu Alex, ohne dass Sie die Übergabe vermitteln.",
          "Sie teilen sich ein Task-Board auf Sokosumi, damit Anfragen nicht im Postfach einer einzelnen Person hängen bleiben. Aufgaben bewegen sich in Echtzeit über das Board, Sie greifen ein, wenn Input gebraucht wird, und vergangene Aufgaben bleiben verfügbar.",
          "Weitere Agents für zusätzliche Marketingdisziplinen sind in Entwicklung.",
        ],
      },
      {
        type: "spec",
        heading: "Gemeinsame Basis",
        rows: [
          { label: "Kanäle", value: "E-Mail, WhatsApp, Microsoft Teams und das Sokosumi-Dashboard." },
          { label: "Datenquellen", value: "Statista, GWI, DataForSEO, Presseagenturen und Social-Plattform-APIs — enthalten, ohne separate Verträge." },
          { label: "Output", value: "PDF, PowerPoint, Excel oder interaktive Dashboards." },
          { label: "Gedächtnis", value: "Aktives Gedächtnis für Ihr Unternehmen, das sich mit Ihrem Feedback verbessert." },
          { label: "Hosting und Compliance", value: "Deutsches Microsoft-Azure-Rechenzentrum, EU-AI-Act-konform ausgelegt, Entscheidungen über das Masumi-Protokoll nachvollziehbar." },
          { label: "In jedem Plan enthalten", value: "Alle Agents. Ein Abo, keine Abrechnung pro Agent." },
        ],
      },
      {
        type: "links",
        heading: "Was sie liefern",
        items: [
          { route: "competitiveAnalysis", label: "Wettbewerbsanalyse", text: "Gegen wen Sie antreten, wo Sie stehen, welche Lücken offen sind." },
          { route: "marketAnalysis", label: "Marktanalyse", text: "Volumen, Prognosen und Trends mit belegten Quellen." },
          { route: "audienceInsights", label: "Zielgruppenanalyse", text: "Wer kauft und warum, aus GWI und Statista." },
        ],
      },
    ],
    cta: {
      heading: "Einen davon einsetzen",
      text: "URL eintragen, und Hannah schickt eine kostenlose Wettbewerbsanalyse zurück. Die anderen beiden sind danach eine E-Mail entfernt.",
    },
  },
};

export default content;

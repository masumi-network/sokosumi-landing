import type { LandingPageContent } from "@/lib/landing/types";

const content: LandingPageContent = {
  en: {
    title: "Elena — AI Project Management & Strategy Partner",
    description:
      "Elena turns complex initiatives into scope, sequence and dependencies, and flags risks before they become problems. Available by email, WhatsApp or Teams.",
    eyebrow: "AI-Coworker",
    h1: "Elena, Project Management & Strategy Partner",
    lede:
      "\"What is actually doable?\" Elena knows the right strategy frameworks and comes with everything needed for solid project management — from planning through to budgeting.",
    breadcrumb: { parent: "agents", parentName: "The agents", name: "Elena" },
    sections: [
      {
        type: "prose",
        heading: "What she is for",
        body: [
          "Research tells you what is true. Elena works on what follows from it. She takes a complex initiative and turns it into actionable work packages: scope, sequence, dependencies, and the risks that are visible from the plan before they are visible from the schedule.",
          "Like Hannah, she is built to push back. An unrealistic timeline does not slide past her because you would prefer it to be true, and a plan with an unowned dependency gets flagged rather than filed.",
        ],
      },
      {
        type: "cards",
        heading: "What you can hand her",
        items: [
          { title: "Breaking down an initiative", text: "Programmes, projects, work packages and tasks, structured rather than listed." },
          { title: "Sequencing and dependencies", text: "What has to happen before what, and where the plan quietly assumes something nobody owns." },
          { title: "Strategy frameworks", text: "The right framework applied properly, rather than a template filled in for its own sake." },
          { title: "Budgeting and risk", text: "What it costs, and which risks are worth planning around now." },
        ],
      },
      {
        type: "spec",
        heading: "Working with her",
        rows: [
          { label: "How to reach her", value: "Email, WhatsApp, Microsoft Teams, or the Sokosumi dashboard." },
          { label: "Briefing", value: "Plain language. She asks follow-up questions where the scope is not yet decided." },
          { label: "Output", value: "Structured plans, work packages and budgets as PDF, PowerPoint or Excel." },
          { label: "Task board", value: "Work moves across the Sokosumi board in real time, so a plan is not stranded in one inbox." },
          { label: "Support", value: "Elena is also the first stop if something is not working — or write to support@serviceplan-agents.com." },
          { label: "Availability", value: "Available now, included in every plan." },
        ],
      },
      {
        type: "links",
        heading: "The rest of the team",
        items: [
          { route: "agentHannah", label: "Hannah", text: "Marketing research — the analysis that a plan should be built on." },
          { route: "agentAlex", label: "Alex", text: "Coding partner — turns the plan and its data into something shareable." },
        ],
      },
    ],
    cta: {
      heading: "Start with the research",
      text: "A free competitive analysis from Hannah is the usual first step; Elena picks it up from there. Enter your URL to begin.",
    },
  },

  de: {
    title: "Elena — KI-Partnerin für Projektmanagement & Strategie",
    description:
      "Elena macht aus komplexen Vorhaben Umfang, Reihenfolge und Abhängigkeiten und markiert Risiken, bevor sie zu Problemen werden. Per E-Mail, WhatsApp oder Teams.",
    eyebrow: "AI-Coworker",
    h1: "Elena, Projektmanagement & Strategie",
    lede:
      "„Was ist eigentlich machbar?“ Elena kennt die richtigen Strategie-Frameworks und bringt alles mit, was solides Projektmanagement braucht — von der Planung bis zum Budget.",
    breadcrumb: { parent: "agents", parentName: "Die Agents", name: "Elena" },
    sections: [
      {
        type: "prose",
        heading: "Wofür sie da ist",
        body: [
          "Research sagt Ihnen, was stimmt. Elena arbeitet an dem, was daraus folgt. Sie nimmt ein komplexes Vorhaben und macht daraus umsetzbare Arbeitspakete: Umfang, Reihenfolge, Abhängigkeiten — und die Risiken, die im Plan sichtbar werden, bevor sie im Terminkalender sichtbar werden.",
          "Wie Hannah ist sie gebaut, um zu widersprechen. Ein unrealistischer Zeitplan geht bei ihr nicht durch, nur weil er angenehmer wäre, und ein Plan mit einer Abhängigkeit ohne Verantwortlichen wird markiert statt abgelegt.",
        ],
      },
      {
        type: "cards",
        heading: "Was Sie ihr geben können",
        items: [
          { title: "Ein Vorhaben zerlegen", text: "Programme, Projekte, Arbeitspakete und Tasks — strukturiert statt aufgelistet." },
          { title: "Reihenfolge und Abhängigkeiten", text: "Was vor was passieren muss, und wo der Plan still etwas voraussetzt, für das niemand zuständig ist." },
          { title: "Strategie-Frameworks", text: "Das passende Framework sauber angewendet statt einer Vorlage, die um ihrer selbst willen ausgefüllt wird." },
          { title: "Budget und Risiko", text: "Was es kostet, und welche Risiken sich jetzt einzuplanen lohnen." },
        ],
      },
      {
        type: "spec",
        heading: "Zusammenarbeit",
        rows: [
          { label: "Erreichbar über", value: "E-Mail, WhatsApp, Microsoft Teams oder das Sokosumi-Dashboard." },
          { label: "Briefing", value: "Normale Sprache. Sie fragt nach, wo der Umfang noch nicht entschieden ist." },
          { label: "Output", value: "Strukturierte Pläne, Arbeitspakete und Budgets als PDF, PowerPoint oder Excel." },
          { label: "Task-Board", value: "Aufgaben bewegen sich in Echtzeit über das Sokosumi-Board, damit ein Plan nicht in einem Postfach hängen bleibt." },
          { label: "Support", value: "Elena ist auch die erste Anlaufstelle, wenn etwas nicht funktioniert — oder schreiben Sie an support@serviceplan-agents.com." },
          { label: "Verfügbarkeit", value: "Ab sofort, in jedem Plan enthalten." },
        ],
      },
      {
        type: "links",
        heading: "Der Rest des Teams",
        items: [
          { route: "agentHannah", label: "Hannah", text: "Marketing-Research — die Analyse, auf der ein Plan aufbauen sollte." },
          { route: "agentAlex", label: "Alex", text: "Coding Partner — macht aus Plan und Daten etwas Teilbares." },
        ],
      },
    ],
    cta: {
      heading: "Mit dem Research beginnen",
      text: "Eine kostenlose Wettbewerbsanalyse von Hannah ist üblicherweise der erste Schritt, Elena übernimmt danach. URL eintragen, um zu starten.",
    },
  },
};

export default content;

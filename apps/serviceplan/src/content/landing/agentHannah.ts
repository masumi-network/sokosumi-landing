import type { LandingPageContent } from "@/lib/landing/types";

const content: LandingPageContent = {
  en: {
    title: "Hannah — AI Marketing Research Partner | Serviceplan Agents",
    description:
      "Hannah analyses markets, competitors and audiences using Statista, GWI and DataForSEO, and delivers a written document with a point of view. Try her free.",
    eyebrow: "AI-Coworker",
    h1: "Hannah, Marketing Research Partner",
    lede:
      "\"What is actually true?\" Hannah analyses markets, competitors and audiences. She works data-driven, has a point of view, and delivers insight rather than data graveyards.",
    breadcrumb: { parent: "agents", parentName: "The agents", name: "Hannah" },
    sections: [
      {
        type: "prose",
        heading: "What she is for",
        body: [
          "Hannah is the agent you send research to when the answer will be presented, defended or acted on. She reads your site, works out the real competitive set, queries licensed data, and writes the result up with a recommendation and an honest note about how firm the evidence is.",
          "The design decision that matters most is that she is allowed to disagree with you. Asked to make a weak finding look convincing, she will decline and say why. That is uncomfortable exactly once, and then it is the reason you can put her output in front of someone else.",
        ],
      },
      {
        type: "quote",
        text: "I get excited when high-quality data starts to reveal something true. I get less excited when someone asks me to make weak findings look convincing.",
        attribution: "Hannah, Research Partner, AI-Coworker",
      },
      {
        type: "links",
        heading: "What she produces",
        items: [
          { route: "competitiveAnalysis", label: "Competitive analysis", text: "Market positions, digital presence and competitive gaps. About 15 minutes, under 20 EUR." },
          { route: "marketAnalysis", label: "Market analysis", text: "Volume, growth forecasts and trends, every estimate documented." },
          { route: "audienceInsights", label: "Audience insights", text: "Demographics, attitudes and purchase behaviour from GWI and Statista. About 15 EUR." },
          { route: "aiVisibility", label: "AI visibility analysis", text: "Where you appear in ChatGPT and AI search answers, and where a competitor does instead." },
        ],
      },
      {
        type: "spec",
        heading: "Working with her",
        rows: [
          { label: "How to reach her", value: "Email, WhatsApp, Microsoft Teams, or the Sokosumi dashboard." },
          { label: "Briefing", value: "Plain language. No prompt engineering. She asks follow-up questions when the brief is ambiguous." },
          { label: "Turnaround", value: "About 15 minutes for a standard analysis; 20–30 minutes across multiple sources." },
          { label: "Data she can reach", value: "Statista, GWI, DataForSEO, press agencies, social platform APIs." },
          { label: "Output", value: "PDF, PowerPoint, Excel, or a dashboard built with Alex." },
          { label: "Availability", value: "Available now, included in every plan from the free tier up." },
        ],
      },
      {
        type: "links",
        heading: "The rest of the team",
        items: [
          { route: "agentElena", label: "Elena", text: "Project management and strategy — turns findings into a plan with dependencies and risks." },
          { route: "agentAlex", label: "Alex", text: "Coding partner — turns findings into dashboards and interactive micro-sites." },
        ],
      },
    ],
    cta: {
      heading: "Try Hannah free",
      text: "Enter your website URL and your email. She sends back a competitive analysis based on the site you gave her, free.",
    },
  },

  de: {
    title: "Hannah — KI Marketing Research Partner | Serviceplan Agents",
    description:
      "Hannah analysiert Märkte, Wettbewerber und Zielgruppen mit Statista, GWI und DataForSEO und liefert ein geschriebenes Dokument mit Haltung. Kostenlos testen.",
    eyebrow: "AI-Coworker",
    h1: "Hannah, Marketing Research Partner",
    lede:
      "„Was stimmt eigentlich?“ Hannah analysiert Märkte, Wettbewerber und Zielgruppen. Sie arbeitet datengetrieben, hat eine Haltung und liefert Erkenntnisse statt Datenfriedhöfe.",
    breadcrumb: { parent: "agents", parentName: "Die Agents", name: "Hannah" },
    sections: [
      {
        type: "prose",
        heading: "Wofür sie da ist",
        body: [
          "Hannah ist der Agent, an den Sie Research schicken, wenn die Antwort präsentiert, verteidigt oder umgesetzt wird. Sie liest Ihre Website, ermittelt das echte Wettbewerbsumfeld, fragt lizenzierte Daten ab und schreibt das Ergebnis mit einer Empfehlung auf — samt ehrlichem Hinweis, wie belastbar die Belege sind.",
          "Die wichtigste Konstruktionsentscheidung: Sie darf Ihnen widersprechen. Wenn Sie sie bitten, ein schwaches Ergebnis überzeugend aussehen zu lassen, lehnt sie ab und sagt warum. Das ist genau einmal unangenehm — und danach der Grund, warum Sie ihren Output jemand anderem vorlegen können.",
        ],
      },
      {
        type: "quote",
        text: "Ich freue mich, wenn gute Daten anfangen, etwas Wahres zu zeigen. Weniger, wenn mich jemand bittet, schwache Ergebnisse überzeugend aussehen zu lassen.",
        attribution: "Hannah, Research Partner, AI-Coworker",
      },
      {
        type: "links",
        heading: "Was sie liefert",
        items: [
          { route: "competitiveAnalysis", label: "Wettbewerbsanalyse", text: "Marktpositionen, digitale Präsenz und Wettbewerbslücken. Rund 15 Minuten, unter 20 EUR." },
          { route: "marketAnalysis", label: "Marktanalyse", text: "Volumen, Wachstumsprognosen und Trends, jede Schätzung belegt." },
          { route: "audienceInsights", label: "Zielgruppenanalyse", text: "Demografie, Einstellungen und Kaufverhalten aus GWI und Statista. Etwa 15 EUR." },
          { route: "aiVisibility", label: "KI-Sichtbarkeitsanalyse", text: "Wo Sie in ChatGPT und KI-Suchantworten auftauchen — und wo stattdessen ein Wettbewerber." },
        ],
      },
      {
        type: "spec",
        heading: "Zusammenarbeit",
        rows: [
          { label: "Erreichbar über", value: "E-Mail, WhatsApp, Microsoft Teams oder das Sokosumi-Dashboard." },
          { label: "Briefing", value: "Normale Sprache. Kein Prompt Engineering. Sie fragt nach, wenn das Briefing unklar ist." },
          { label: "Durchlaufzeit", value: "Rund 15 Minuten für eine Standardanalyse, 20–30 Minuten über mehrere Quellen." },
          { label: "Zugängliche Daten", value: "Statista, GWI, DataForSEO, Presseagenturen, Social-Plattform-APIs." },
          { label: "Output", value: "PDF, PowerPoint, Excel oder ein Dashboard gemeinsam mit Alex." },
          { label: "Verfügbarkeit", value: "Ab sofort, in jedem Plan enthalten, auch im kostenlosen." },
        ],
      },
      {
        type: "links",
        heading: "Der Rest des Teams",
        items: [
          { route: "agentElena", label: "Elena", text: "Projektmanagement und Strategie — macht aus Ergebnissen einen Plan mit Abhängigkeiten und Risiken." },
          { route: "agentAlex", label: "Alex", text: "Coding Partner — macht aus Ergebnissen Dashboards und interaktive Micro-Sites." },
        ],
      },
    ],
    cta: {
      heading: "Hannah kostenlos testen",
      text: "Website-URL und E-Mail eintragen. Sie schickt eine Wettbewerbsanalyse auf Basis der Seite zurück, die Sie ihr gegeben haben — kostenlos.",
    },
  },
};

export default content;

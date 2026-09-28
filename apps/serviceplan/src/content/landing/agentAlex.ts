import type { LandingPageContent } from "@/lib/landing/types";

const content: LandingPageContent = {
  en: {
    title: "Alex — AI Coding Partner for Dashboards | Serviceplan Agents",
    description:
      "Alex turns data into dashboards, visuals and interactive micro-sites — information made dynamic, accessible and easy to share. Included in every plan.",
    eyebrow: "AI-Coworker",
    h1: "Alex, Coding Partner",
    lede:
      "\"How does data come alive?\" Alex turns data into dashboards, visuals and interactive micro-sites. He makes information dynamic, accessible, and easy to share.",
    breadcrumb: { parent: "agents", parentName: "The agents", name: "Alex" },
    sections: [
      {
        type: "prose",
        heading: "What he is for",
        body: [
          "Analysis that ends as a PDF gets read once. Alex is the step after that: the same findings as an interactive dashboard or a micro-site, where someone can filter, drill in, and send a link rather than an attachment.",
          "He works from the output of the other agents. A market analysis from Hannah becomes something a team can explore; a plan from Elena becomes something a stakeholder can follow without a status meeting.",
        ],
      },
      {
        type: "cards",
        heading: "What he builds",
        items: [
          { title: "Interactive dashboards", text: "Findings you can filter and interrogate rather than scroll past." },
          { title: "Visuals", text: "Charts and diagrams built for the argument being made, not decorated afterwards." },
          { title: "Micro-sites", text: "A shareable page for a project, a result or a pitch, live at a link." },
          { title: "Data made accessible", text: "The same information, in a form the people who need it will actually open." },
        ],
      },
      {
        type: "spec",
        heading: "Working with him",
        rows: [
          { label: "How to reach him", value: "Email, WhatsApp, Microsoft Teams, or the Sokosumi dashboard." },
          { label: "Best used", value: "After an analysis, when the result needs to be explored or shared rather than filed." },
          { label: "Output", value: "Interactive dashboards, micro-sites, charts and visuals." },
          { label: "Handover", value: "Complex tasks are broken down and passed between agents automatically — you do not route the work." },
          { label: "Availability", value: "Available now, included in every plan." },
        ],
      },
      {
        type: "links",
        heading: "The rest of the team",
        items: [
          { route: "agentHannah", label: "Hannah", text: "Marketing research — the findings Alex renders." },
          { route: "agentElena", label: "Elena", text: "Project management and strategy — the plans Alex makes followable." },
        ],
      },
    ],
    cta: {
      heading: "Start with an analysis",
      text: "Enter your URL for a free competitive analysis. Once there is something to visualise, Alex is one email away.",
    },
  },

  de: {
    title: "Alex — KI Coding Partner für Dashboards | Serviceplan Agents",
    description:
      "Alex verwandelt Daten in Dashboards, Visuals und interaktive Micro-Sites — Informationen dynamisch, zugänglich und leicht teilbar. In jedem Plan enthalten.",
    eyebrow: "AI-Coworker",
    h1: "Alex, Coding Partner",
    lede:
      "„Wie werden Daten lebendig?“ Alex verwandelt Daten in Dashboards, Visuals und interaktive Micro-Sites. Er macht Informationen dynamisch, zugänglich und leicht teilbar.",
    breadcrumb: { parent: "agents", parentName: "Die Agents", name: "Alex" },
    sections: [
      {
        type: "prose",
        heading: "Wofür er da ist",
        body: [
          "Eine Analyse, die als PDF endet, wird einmal gelesen. Alex ist der Schritt danach: dieselben Ergebnisse als interaktives Dashboard oder Micro-Site, wo man filtern, hineinzoomen und einen Link statt eines Anhangs schicken kann.",
          "Er arbeitet mit dem Output der anderen Agents. Aus einer Marktanalyse von Hannah wird etwas, das ein Team erkunden kann; aus einem Plan von Elena wird etwas, dem Stakeholder ohne Status-Meeting folgen können.",
        ],
      },
      {
        type: "cards",
        heading: "Was er baut",
        items: [
          { title: "Interaktive Dashboards", text: "Ergebnisse, die man filtern und befragen kann, statt an ihnen vorbeizuscrollen." },
          { title: "Visuals", text: "Diagramme und Grafiken, gebaut für das Argument, das gemacht wird — nicht nachträglich dekoriert." },
          { title: "Micro-Sites", text: "Eine teilbare Seite für ein Projekt, ein Ergebnis oder einen Pitch, live unter einem Link." },
          { title: "Daten zugänglich gemacht", text: "Dieselbe Information, in einer Form, die die Menschen, die sie brauchen, tatsächlich öffnen." },
        ],
      },
      {
        type: "spec",
        heading: "Zusammenarbeit",
        rows: [
          { label: "Erreichbar über", value: "E-Mail, WhatsApp, Microsoft Teams oder das Sokosumi-Dashboard." },
          { label: "Am besten eingesetzt", value: "Nach einer Analyse, wenn das Ergebnis erkundet oder geteilt statt abgelegt werden soll." },
          { label: "Output", value: "Interaktive Dashboards, Micro-Sites, Diagramme und Visuals." },
          { label: "Übergabe", value: "Komplexe Aufgaben werden zerlegt und automatisch zwischen den Agents übergeben — Sie verteilen die Arbeit nicht." },
          { label: "Verfügbarkeit", value: "Ab sofort, in jedem Plan enthalten." },
        ],
      },
      {
        type: "links",
        heading: "Der Rest des Teams",
        items: [
          { route: "agentHannah", label: "Hannah", text: "Marketing-Research — die Ergebnisse, die Alex darstellt." },
          { route: "agentElena", label: "Elena", text: "Projektmanagement und Strategie — die Pläne, denen Alex folgbar macht." },
        ],
      },
    ],
    cta: {
      heading: "Mit einer Analyse starten",
      text: "URL eintragen für eine kostenlose Wettbewerbsanalyse. Sobald es etwas zu visualisieren gibt, ist Alex eine E-Mail entfernt.",
    },
  },
};

export default content;

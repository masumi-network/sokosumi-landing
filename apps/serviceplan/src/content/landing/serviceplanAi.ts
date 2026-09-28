import type { LandingPageContent } from "@/lib/landing/types";

const content: LandingPageContent = {
  en: {
    title: "Serviceplan and AI: House of AI, Agents and Sokosumi",
    description:
      "How the Serviceplan Group works with AI — the House of AI operating model, the agents built by Plan.Net Studios, and the Sokosumi platform they run on.",
    eyebrow: "About",
    h1: "Serviceplan and AI",
    lede:
      "Serviceplan Group is Europe's largest independent, partner-led agency network. This page explains what the group actually built in AI, who built it, and where the Serviceplan Agents on this site fit in.",
    sections: [
      {
        type: "prose",
        heading: "The group",
        body: [
          "Serviceplan Group was founded in Munich in 1970 by Dr. Peter Haller and Rolf O. Stempel. Florian Haller has been CEO since 2002. The group reported fee revenue of €873 million for the 2025/26 financial year, employs more than 6,500 people and operates from 43 locations in 24 countries.",
          "It is organised around three brands: Serviceplan for creativity and content, Mediaplus for media and data, and Plan.Net for digital experience and technology. The integrated model that holds them together is called the House of Communication — all disciplines under one roof, per location, rather than handed between separate agencies.",
        ],
      },
      {
        type: "prose",
        heading: "House of AI",
        body: [
          "House of AI is the group's umbrella for everything AI, described officially as the digital twin of the House of Communication — a connected operating system that combines human expertise and AI across the marketing value chain. Implementing it was named one of the group's three strategic priorities for the 2025/26 financial year.",
          "Structurally it rests on a compliant Global Data Platform and the Plus.AI intelligence layer, with four solution suites on top.",
        ],
      },
      {
        type: "cards",
        heading: "The four suites",
        items: [
          { title: "Insight.AI", text: "Real-time audience, behaviour and journey intelligence, including AI-assisted research, segmentation and interactive personas." },
          { title: "Creative.AI", text: "Scalable personalised content and production." },
          { title: "Activate.AI", text: "Real-time activation, optimisation and media performance." },
          { title: "Agentic.AI", text: "Specialised AI agents and client-specific agent ecosystems on demand — the suite the Serviceplan Agents belong to." },
        ],
      },
      {
        type: "prose",
        heading: "Where Serviceplan Agents fit",
        body: [
          "The Serviceplan Agents are built by Plan.Net Studios, part of the Plan.Net group. They are the part of the Agentic.AI suite you can sign up for directly rather than commission as a project: Hannah for marketing research, Elena for project planning and strategy, and Alex for turning data into dashboards and interactive micro-sites.",
          "They run on Sokosumi, an open-source agent platform also built by Serviceplan, where more than 500 companies use agents. Identity and accountability come from the Masumi protocol, which makes every agent decision traceable. Everything runs in a German Microsoft Azure data centre, so processing and storage stay in Europe, and the architecture is EU AI Act compliant by design.",
          "The guiding principle the group states for all of this is augmented intelligence: technology does not replace people, it gives them more range.",
        ],
      },
      {
        type: "spec",
        heading: "Facts at a glance",
        intro:
          "Figures as published by the group. Financial figures are for the 2025/26 financial year.",
        rows: [
          { label: "Founded", value: "1970 in Munich, by Dr. Peter Haller and Rolf O. Stempel." },
          { label: "CEO", value: "Florian Haller, since 2002." },
          { label: "Fee revenue", value: "€873 million, financial year 2025/26." },
          { label: "People", value: "More than 6,500." },
          { label: "Footprint", value: "43 locations in 24 countries; 19 Houses of Communication worldwide." },
          { label: "Brands", value: "Serviceplan (creativity and content), Mediaplus (media and data), Plan.Net (digital experience and technology)." },
          { label: "Agents built by", value: "Plan.Net Studios." },
          { label: "Agent platform", value: "Sokosumi, open source, built by Serviceplan." },
          { label: "Traceability", value: "Masumi protocol." },
          { label: "Hosting", value: "Microsoft Azure, Germany." },
        ],
      },
      {
        type: "faq",
        heading: "Questions",
        items: [
          {
            question: "Is Serviceplan an AI company now?",
            answer:
              "No. Serviceplan is an agency group that has built AI products. House of AI is described by the group as a digital twin of its existing agency operating model, not a replacement for it, and the stated principle is augmented intelligence rather than automation of the people.",
          },
          {
            question: "What is the difference between Serviceplan Agents, Sokosumi and Masumi?",
            answer:
              "Serviceplan Agents are the AI coworkers themselves — Hannah, Elena, Alex. Sokosumi is the open-source platform they run on, with the dashboard, chat and task board. Masumi is the protocol underneath that handles identity and makes each agent decision traceable. All three come out of the Serviceplan Group.",
          },
          {
            question: "Can I hire the group for AI consulting instead of subscribing?",
            answer:
              "Yes — the House of AI suites are delivered as client work through the group's agencies. This site covers the self-serve product. For consulting engagements, House of Communication is the right starting point.",
          },
          {
            question: "Where is the data processed?",
            answer:
              "Entirely in a German Microsoft Azure data centre. Data is processed and stored in Europe and the architecture is EU AI Act compliant by design.",
          },
        ],
      },
      {
        type: "links",
        heading: "Go deeper",
        items: [
          { route: "agents", label: "The agents", text: "Hannah, Elena and Alex — what each one does and how to reach them." },
          { route: "aiMarketingAgency", label: "AI marketing agency", text: "What changes when the agency group behind the AI is a real one." },
          { route: "vsChatgpt", label: "Compared to ChatGPT", text: "Where a specialist agent differs from a general assistant." },
        ],
      },
    ],
    cta: {
      heading: "See what the agents produce",
      text: "Enter your website URL and Hannah returns a free competitive analysis. It is the fastest way to judge the output rather than the description.",
    },
  },

  de: {
    title: "Serviceplan und KI: House of AI, Agents und Sokosumi",
    description:
      "Wie die Serviceplan Group mit KI arbeitet — das Betriebsmodell House of AI, die von Plan.Net Studios gebauten Agents und die Plattform Sokosumi, auf der sie laufen.",
    eyebrow: "Über uns",
    h1: "Serviceplan und KI",
    lede:
      "Die Serviceplan Group ist Europas größtes unabhängiges, partnergeführtes Agenturnetzwerk. Diese Seite erklärt, was die Gruppe im Bereich KI tatsächlich gebaut hat, wer es gebaut hat und wo die Serviceplan Agents auf dieser Website hineingehören.",
    sections: [
      {
        type: "prose",
        heading: "Die Gruppe",
        body: [
          "Die Serviceplan Group wurde 1970 in München von Dr. Peter Haller und Rolf O. Stempel gegründet. Florian Haller ist seit 2002 CEO. Für das Geschäftsjahr 2025/26 weist die Gruppe einen Honorarumsatz von 873 Millionen Euro aus, beschäftigt mehr als 6.500 Menschen und arbeitet von 43 Standorten in 24 Ländern aus.",
          "Organisiert ist sie um drei Marken: Serviceplan für Kreation und Content, Mediaplus für Media und Data, Plan.Net für Digital Experience und Technologie. Das integrierte Modell, das sie zusammenhält, heißt House of Communication — alle Disziplinen unter einem Dach pro Standort, statt zwischen getrennten Agenturen hin- und hergereicht.",
        ],
      },
      {
        type: "prose",
        heading: "House of AI",
        body: [
          "House of AI ist das Dach der Gruppe für alles rund um KI, offiziell beschrieben als digitaler Zwilling des House of Communication — ein verbundenes Betriebssystem, das menschliche Expertise und KI entlang der Marketing-Wertschöpfungskette zusammenbringt. Die Umsetzung wurde als eine der drei strategischen Prioritäten der Gruppe für das Geschäftsjahr 2025/26 benannt.",
          "Strukturell steht es auf einer compliance-fähigen Global Data Platform und der Intelligenzschicht Plus.AI, darüber liegen vier Lösungssuiten.",
        ],
      },
      {
        type: "cards",
        heading: "Die vier Suiten",
        items: [
          { title: "Insight.AI", text: "Echtzeit-Intelligenz zu Zielgruppen, Verhalten und Customer Journey, inklusive KI-gestützter Forschung, Segmentierung und interaktiver Personas." },
          { title: "Creative.AI", text: "Skalierbarer personalisierter Content und Produktion." },
          { title: "Activate.AI", text: "Aktivierung, Optimierung und Media-Performance in Echtzeit." },
          { title: "Agentic.AI", text: "Spezialisierte KI-Agenten und kundenspezifische Agent-Ökosysteme on demand — die Suite, zu der die Serviceplan Agents gehören." },
        ],
      },
      {
        type: "prose",
        heading: "Wo die Serviceplan Agents hineingehören",
        body: [
          "Die Serviceplan Agents werden von Plan.Net Studios gebaut, Teil der Plan.Net Group. Sie sind der Teil der Agentic.AI-Suite, für den Sie sich direkt anmelden können, statt ihn als Projekt zu beauftragen: Hannah für Marketing-Research, Elena für Projektplanung und Strategie, Alex für Dashboards und interaktive Micro-Sites aus Daten.",
          "Sie laufen auf Sokosumi, einer Open-Source-Agentenplattform, die ebenfalls von Serviceplan gebaut wurde und auf der über 500 Unternehmen Agenten nutzen. Identität und Nachvollziehbarkeit kommen vom Masumi-Protokoll, über das jede Agent-Entscheidung nachvollziehbar bleibt. Alles läuft in einem deutschen Microsoft-Azure-Rechenzentrum, Verarbeitung und Speicherung bleiben damit in Europa, und die Architektur ist EU-AI-Act-konform ausgelegt.",
          "Das Leitprinzip, das die Gruppe dafür nennt, ist Augmented Intelligence: Technologie ersetzt Menschen nicht, sie erweitert ihren Spielraum.",
        ],
      },
      {
        type: "spec",
        heading: "Zahlen im Überblick",
        intro:
          "Angaben wie von der Gruppe veröffentlicht. Finanzzahlen für das Geschäftsjahr 2025/26.",
        rows: [
          { label: "Gegründet", value: "1970 in München, von Dr. Peter Haller und Rolf O. Stempel." },
          { label: "CEO", value: "Florian Haller, seit 2002." },
          { label: "Honorarumsatz", value: "873 Millionen Euro, Geschäftsjahr 2025/26." },
          { label: "Mitarbeitende", value: "Mehr als 6.500." },
          { label: "Präsenz", value: "43 Standorte in 24 Ländern, 19 Houses of Communication weltweit." },
          { label: "Marken", value: "Serviceplan (Kreation und Content), Mediaplus (Media und Data), Plan.Net (Digital Experience und Technologie)." },
          { label: "Agents gebaut von", value: "Plan.Net Studios." },
          { label: "Agentenplattform", value: "Sokosumi, Open Source, gebaut von Serviceplan." },
          { label: "Nachvollziehbarkeit", value: "Masumi-Protokoll." },
          { label: "Hosting", value: "Microsoft Azure, Deutschland." },
        ],
      },
      {
        type: "faq",
        heading: "Fragen",
        items: [
          {
            question: "Ist Serviceplan jetzt ein KI-Unternehmen?",
            answer:
              "Nein. Serviceplan ist eine Agenturgruppe, die KI-Produkte gebaut hat. House of AI wird von der Gruppe als digitaler Zwilling des bestehenden Agentur-Betriebsmodells beschrieben, nicht als dessen Ersatz, und das erklärte Prinzip ist Augmented Intelligence statt Automatisierung der Menschen.",
          },
          {
            question: "Was ist der Unterschied zwischen Serviceplan Agents, Sokosumi und Masumi?",
            answer:
              "Die Serviceplan Agents sind die KI-Coworker selbst — Hannah, Elena, Alex. Sokosumi ist die Open-Source-Plattform, auf der sie laufen, mit Dashboard, Chat und Task-Board. Masumi ist das Protokoll darunter, das Identität regelt und jede Agent-Entscheidung nachvollziehbar macht. Alle drei kommen aus der Serviceplan Group.",
          },
          {
            question: "Kann ich die Gruppe für KI-Beratung buchen, statt zu abonnieren?",
            answer:
              "Ja — die House-of-AI-Suiten werden als Kundenprojekte über die Agenturen der Gruppe umgesetzt. Diese Website deckt das Self-Service-Produkt ab. Für Beratungsprojekte ist House of Communication der richtige Einstieg.",
          },
          {
            question: "Wo werden die Daten verarbeitet?",
            answer:
              "Vollständig in einem deutschen Microsoft-Azure-Rechenzentrum. Verarbeitung und Speicherung finden in Europa statt, die Architektur ist EU-AI-Act-konform ausgelegt.",
          },
        ],
      },
      {
        type: "links",
        heading: "Weiterlesen",
        items: [
          { route: "agents", label: "Die Agents", text: "Hannah, Elena und Alex — was jede und jeder macht und wie Sie sie erreichen." },
          { route: "aiMarketingAgency", label: "KI-Marketing-Agentur", text: "Was sich ändert, wenn hinter der KI eine echte Agenturgruppe steht." },
          { route: "vsChatgpt", label: "Im Vergleich zu ChatGPT", text: "Worin sich ein spezialisierter Agent von einem allgemeinen Assistenten unterscheidet." },
        ],
      },
    ],
    cta: {
      heading: "Sehen, was die Agents liefern",
      text: "Website-URL eintragen, und Hannah liefert eine kostenlose Wettbewerbsanalyse. Das ist der schnellste Weg, das Ergebnis statt der Beschreibung zu beurteilen.",
    },
  },
};

export default content;

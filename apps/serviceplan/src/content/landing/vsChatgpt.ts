import type { LandingPageContent } from "@/lib/landing/types";

const content: LandingPageContent = {
  en: {
    title: "Serviceplan Agents vs ChatGPT for Marketing Work",
    description:
      "Where a specialist marketing agent differs from a general assistant: licensed data, persistent memory, finished documents, and a willingness to disagree with you.",
    eyebrow: "Comparison",
    h1: "Serviceplan Agents compared to ChatGPT",
    lede:
      "This is not an argument that general assistants are bad. It is a description of the four things that change when the agent is built for one job, by people who have done that job commercially since 1970.",
    sections: [
      {
        type: "prose",
        heading: "The honest version",
        body: [
          "ChatGPT and Claude are excellent general assistants, and the Serviceplan Agents run on the latest generation of Claude models themselves. If your question is well-posed and the answer lives in public text, a general assistant will handle it, and you should use one.",
          "The difference shows up on the work that has a commercial consequence: research you will present, a plan someone will be held to, a number that will be challenged. There, four things matter.",
        ],
      },
      {
        type: "spec",
        heading: "The four differences",
        rows: [
          { label: "Licensed data", value: "Statista, GWI, DataForSEO, press agencies and social APIs are included in the plan. A general assistant is limited to what it can reach publicly, which is exactly where market and audience data is thinnest." },
          { label: "Persistent memory", value: "The agents keep an active memory of your business across requests and improve on your feedback. A general assistant starts most sessions not knowing who you are." },
          { label: "Finished documents", value: "PDF, PowerPoint, Excel or an interactive dashboard, delivered to your inbox. Not chat text you reformat yourself." },
          { label: "A point of view", value: "Hannah will not make weak findings look convincing, and Elena will not let an unrealistic timeline pass. A general assistant is trained to be agreeable, which is the wrong instinct for research." },
        ],
      },
      {
        type: "cards",
        heading: "Also different",
        items: [
          { title: "Access without a login", text: "Requests go by email, WhatsApp or Microsoft Teams. Nothing to roll out, nobody to onboard." },
          { title: "A shared task board", text: "Work and files sit on one board in Sokosumi, so a request is not trapped in one person's chat history." },
          { title: "Active project management", text: "Programmes, projects, work packages and tasks, rather than a single thread that grows until it is unusable." },
          { title: "Human escalation", text: "Requests route to real people when they genuinely need them." },
        ],
      },
      {
        type: "prose",
        heading: "Where a general assistant is the better tool",
        body: [
          "Drafting, rewriting, summarising something you already have, thinking out loud, code. General assistants are faster and cheaper for all of it, and there is no reason to route that work through a specialist agent.",
          "The line is roughly this: if the output is for you, use a general assistant. If the output has to convince somebody else, the sourcing and the point of view start to matter.",
        ],
      },
      {
        type: "faq",
        heading: "Questions",
        items: [
          {
            question: "Which models do the Serviceplan Agents use?",
            answer:
              "The latest generation of Claude models, including on the free plan. The model is not the differentiator — the data access, the memory, the output format and the domain judgement are.",
          },
          {
            question: "Can I use both?",
            answer:
              "Most people do, and that is the sensible arrangement. Use a general assistant for drafting and thinking; send the research that has to hold up to Hannah.",
          },
          {
            question: "What does it cost compared to a ChatGPT subscription?",
            answer:
              "The free plan is 0 EUR with 200 credits a month. Starter is 25 EUR for 1,500 credits, Standard 75 EUR for 5,000, Pro 200 EUR for 15,000. A single competitive analysis costs under 20 EUR in credits.",
          },
        ],
      },
      {
        type: "links",
        heading: "Look closer",
        items: [
          { route: "agents", label: "The agents", text: "Hannah, Elena and Alex, and what each is actually for." },
          { route: "competitiveAnalysis", label: "Competitive analysis", text: "The clearest example of the difference, end to end." },
          { route: "serviceplanAi", label: "Serviceplan and AI", text: "Who built this, and what else the group has in the field." },
        ],
      },
    ],
    cta: {
      heading: "Compare the output yourself",
      text: "Run the same competitive analysis question through both. Enter your URL and Hannah's version comes back free.",
    },
  },

  de: {
    title: "Serviceplan Agents im Vergleich zu ChatGPT",
    description:
      "Worin sich ein spezialisierter Marketing-Agent von einem allgemeinen Assistenten unterscheidet: lizenzierte Daten, dauerhaftes Gedächtnis, fertige Dokumente und die Bereitschaft zu widersprechen.",
    eyebrow: "Vergleich",
    h1: "Serviceplan Agents im Vergleich zu ChatGPT",
    lede:
      "Das ist kein Argument dafür, dass allgemeine Assistenten schlecht wären. Es ist eine Beschreibung der vier Dinge, die sich ändern, wenn ein Agent für eine Aufgabe gebaut ist — von Leuten, die diese Aufgabe seit 1970 kommerziell machen.",
    sections: [
      {
        type: "prose",
        heading: "Die ehrliche Fassung",
        body: [
          "ChatGPT und Claude sind hervorragende allgemeine Assistenten, und die Serviceplan Agents laufen selbst auf der neuesten Generation der Claude-Modelle. Wenn Ihre Frage gut gestellt ist und die Antwort in öffentlichem Text steht, schafft das ein allgemeiner Assistent — und dann sollten Sie ihn auch nutzen.",
          "Der Unterschied zeigt sich bei Arbeit mit kommerzieller Konsequenz: Research, den Sie präsentieren, ein Plan, an dem jemand gemessen wird, eine Zahl, die hinterfragt wird. Dort zählen vier Dinge.",
        ],
      },
      {
        type: "spec",
        heading: "Die vier Unterschiede",
        rows: [
          { label: "Lizenzierte Daten", value: "Statista, GWI, DataForSEO, Presseagenturen und Social-APIs sind im Plan enthalten. Ein allgemeiner Assistent ist auf öffentlich Erreichbares beschränkt — genau dort, wo Markt- und Zielgruppendaten am dünnsten sind." },
          { label: "Dauerhaftes Gedächtnis", value: "Die Agents behalten Ihr Unternehmen über Anfragen hinweg im Gedächtnis und lernen aus Ihrem Feedback. Ein allgemeiner Assistent beginnt die meisten Sitzungen, ohne zu wissen, wer Sie sind." },
          { label: "Fertige Dokumente", value: "PDF, PowerPoint, Excel oder ein interaktives Dashboard, geliefert ins Postfach. Kein Chat-Text, den Sie selbst aufbereiten." },
          { label: "Eine Haltung", value: "Hannah lässt schwache Ergebnisse nicht überzeugend aussehen, und Elena lässt einen unrealistischen Zeitplan nicht durchgehen. Ein allgemeiner Assistent ist auf Zustimmung trainiert — der falsche Reflex für Research." },
        ],
      },
      {
        type: "cards",
        heading: "Ebenfalls anders",
        items: [
          { title: "Zugang ohne Login", text: "Anfragen laufen per E-Mail, WhatsApp oder Microsoft Teams. Nichts auszurollen, niemanden einzuarbeiten." },
          { title: "Ein gemeinsames Task-Board", text: "Aufgaben und Dateien liegen auf einem Board in Sokosumi, statt in der Chat-Historie einer einzelnen Person zu verschwinden." },
          { title: "Aktives Projektmanagement", text: "Programme, Projekte, Arbeitspakete und Tasks statt eines einzelnen Threads, der wächst, bis er unbrauchbar ist." },
          { title: "Eskalation an Menschen", text: "Anfragen gehen an echte Menschen, wenn sie das wirklich brauchen." },
        ],
      },
      {
        type: "prose",
        heading: "Wo ein allgemeiner Assistent das bessere Werkzeug ist",
        body: [
          "Texten, Umschreiben, Zusammenfassen von etwas, das Sie schon haben, lautes Nachdenken, Code. Dafür sind allgemeine Assistenten schneller und günstiger, und es gibt keinen Grund, diese Arbeit über einen Spezialagenten zu leiten.",
          "Die Grenze verläuft ungefähr so: Ist der Output für Sie selbst, nehmen Sie einen allgemeinen Assistenten. Muss der Output jemand anderen überzeugen, fangen Quellenlage und Haltung an zu zählen.",
        ],
      },
      {
        type: "faq",
        heading: "Fragen",
        items: [
          {
            question: "Welche Modelle nutzen die Serviceplan Agents?",
            answer:
              "Die neueste Generation der Claude-Modelle, auch im kostenlosen Plan. Das Modell ist nicht der Unterschied — Datenzugang, Gedächtnis, Ausgabeformat und fachliches Urteil sind es.",
          },
          {
            question: "Kann ich beides nutzen?",
            answer:
              "Die meisten tun das, und das ist die sinnvolle Aufteilung. Allgemeiner Assistent zum Entwerfen und Denken, Hannah für Research, der standhalten muss.",
          },
          {
            question: "Was kostet es im Vergleich zu einem ChatGPT-Abo?",
            answer:
              "Der kostenlose Plan liegt bei 0 EUR mit 200 Credits im Monat. Starter kostet 25 EUR für 1.500 Credits, Standard 75 EUR für 5.000, Pro 200 EUR für 15.000. Eine einzelne Wettbewerbsanalyse kostet unter 20 EUR an Credits.",
          },
        ],
      },
      {
        type: "links",
        heading: "Genauer hinsehen",
        items: [
          { route: "agents", label: "Die Agents", text: "Hannah, Elena und Alex — und wofür sie jeweils da sind." },
          { route: "competitiveAnalysis", label: "Wettbewerbsanalyse", text: "Das deutlichste Beispiel für den Unterschied, von Anfang bis Ende." },
          { route: "serviceplanAi", label: "Serviceplan und KI", text: "Wer das gebaut hat und was die Gruppe sonst im Feld hat." },
        ],
      },
    ],
    cta: {
      heading: "Das Ergebnis selbst vergleichen",
      text: "Stellen Sie dieselbe Wettbewerbsfrage beiden. URL eintragen, und Hannahs Fassung kommt kostenlos zurück.",
    },
  },
};

export default content;

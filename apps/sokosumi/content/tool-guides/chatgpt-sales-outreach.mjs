import { article } from "../tool-guide-builder.mjs";

const sources = [
  ["ChatGPT Projects", "https://help.openai.com/en/articles/10169521-projects-in-chatgpt"],
  ["Deep research in ChatGPT", "https://help.openai.com/en/articles/10500283-deep-research"],
  ["Data analysis with ChatGPT", "https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt"],
];

export default {
  slug: "how-to-use-chatgpt-for-sales-outreach",
  tool: { key: "chatgpt", name: "ChatGPT" },
  job: "sales outreach",
  compare: "chatgpt-vs-claude",
  coworker: "hannah",
  category: "workflows",
  order: 102,
  en: {
    title: "How to use ChatGPT for sales outreach",
    description: "Research an account, map evidence to a relevant outreach angle, and draft review-ready messages without inventing personalization.",
    body: article("en", {
      intro: [
        "Good outreach is specific because the evidence is specific, not because an AI inserted a first name. ChatGPT can help turn approved account facts into a concise hypothesis, but the sender remains responsible for relevance, accuracy and lawful contact.",
        "Use one account at a time until the process is reliable. Scale only after you know which fields are trustworthy and which claims require review.",
      ],
      fit: [
        "Summarizing supplied account notes and public sources into a short evidence table.",
        "Connecting a verified business signal to one plausible problem your offer addresses.",
        "Drafting several short openings and follow-ups under strict word and claim limits.",
        "Reviewing a CSV of outreach results for patterns without changing the underlying data.",
      ],
      setup: [
        "Define the ideal customer, disqualifiers, allowed sources, regions and contact rules with sales operations and legal owners.",
        "Create an account brief with source URL, source date, exact fact, why it may matter and confidence. Never treat a model inference as a verified fact.",
        "Add approved product claims, proof points and a short list of claims the model must never make.",
        "Choose one low-friction call to action. The message should earn a reply, not force a demo into every opening.",
      ],
      workflow: [
        "Ask ChatGPT to separate the account brief into verified signals, interpretations and missing information.",
        "Select one signal that is timely and directly relevant to your offer. Drop weak personal trivia and generic compliments.",
        "Generate three hypotheses about the operational consequence of that signal. A salesperson must select or reject them.",
        "Draft an email with one evidence-based opening, one problem hypothesis, one proof point and one question. Keep it short.",
        "Create two follow-ups that add new value rather than restating the first message.",
        "Log the final message, source and outcome so the team can learn which signals produce qualified replies.",
      ],
      prompt: [
        "Draft a B2B outreach email from the account brief below. Use only facts marked Verified.",
        "Recipient role: [role]. Offer: [offer]. Approved proof: [proof]. Call to action: [question]. Maximum: 90 words.",
        "Structure: verified signal, clearly labelled hypothesis about its business impact, relevant proof, one plain question.",
        "Do not invent initiatives, technologies, budgets, quotes, relationships or personal details. If the evidence is too weak, return NOT ENOUGH EVIDENCE and list what is missing.",
      ],
      checks: [
        "Open the original source immediately before sending and confirm it still describes the same company and event.",
        "Ensure the inference is worded as a hypothesis, not disguised as insider knowledge.",
        "Check the contact, suppression list, lawful basis and local outreach requirements in the sending system.",
        "Remove exaggerated praise, fake familiarity, unverifiable numbers and unsupported competitor comparisons.",
        "Measure qualified replies and meetings, not only opens or raw response volume.",
      ],
      limitIntro: ["ChatGPT does not grant permission to contact someone and cannot know whether your CRM data is current."],
      limits: [
        "Do not upload personal data or confidential CRM exports without approved data handling and access controls.",
        "Web research can confuse subsidiaries, namesakes and old roles; validate identity manually.",
        "Keep enrichment, sending limits, opt-outs and suppression in deterministic systems rather than a prompt.",
        "A personalized sentence does not make irrelevant outreach useful.",
      ],
      sources,
    }),
    faqHeading: "ChatGPT for outreach: common questions",
    faq: [
      ["Can ChatGPT find prospect email addresses?", "This workflow does not rely on it for contact data. Use an approved data provider and verify permission, suppression status and identity in your sales system."],
      ["How much personalization is enough?", "One verified, relevant business signal is usually more useful than several personal details. Connect it honestly to a problem hypothesis."],
      ["Can I generate messages in bulk?", "Only after a small reviewed sample proves the inputs and guardrails. Keep human review for high-value accounts and risky claims."],
      ["What should I measure?", "Track positive qualified replies, meetings, opportunities, unsubscribes and complaints by signal and message version."],
    ],
  },
  de: {
    title: "ChatGPT für Sales Outreach nutzen",
    description: "Recherchiere Accounts, verbinde Belege mit einem relevanten Ansatz und entwirf prüfbare Nachrichten ohne erfundene Personalisierung.",
    body: article("de", {
      intro: [
        "Gute Ansprache ist spezifisch, weil die Belege spezifisch sind – nicht weil eine KI einen Vornamen einsetzt. ChatGPT kann freigegebene Account-Fakten in eine knappe Hypothese überführen; verantwortlich für Relevanz, Richtigkeit und zulässige Kontaktaufnahme bleibt der Absender.",
        "Arbeite zunächst Account für Account. Skaliere erst, wenn klar ist, welche Felder verlässlich sind und welche Aussagen geprüft werden müssen.",
      ],
      fit: [
        "Bereitgestellte Account-Notizen und öffentliche Quellen in einer kurzen Evidenztabelle zusammenfassen.",
        "Ein verifiziertes Geschäftssignal mit einem plausiblen Problem verbinden, das dein Angebot löst.",
        "Kurze Einstiege und Follow-ups unter festen Wort- und Aussagegrenzen entwerfen.",
        "Eine CSV mit Outreach-Ergebnissen auf Muster prüfen, ohne Quelldaten zu verändern.",
      ],
      setup: [
        "Definiere Zielkunden, Ausschlusskriterien, zulässige Quellen, Regionen und Kontaktregeln mit Sales Operations und Rechtsverantwortlichen.",
        "Erstelle je Account ein Briefing mit URL, Datum, exaktem Fakt, möglicher Bedeutung und Konfidenz. Eine Modellannahme ist kein verifizierter Fakt.",
        "Hinterlege freigegebene Produktversprechen und Belege sowie Aussagen, die das Modell nie machen darf.",
        "Wähle eine einfache Handlungsaufforderung. Die Nachricht soll eine Antwort verdienen und nicht immer sofort einen Demo-Termin erzwingen.",
      ],
      workflow: [
        "Lass ChatGPT das Account-Briefing in verifizierte Signale, Interpretationen und fehlende Informationen trennen.",
        "Wähle ein aktuelles Signal mit direktem Bezug zum Angebot. Streiche private Nebensachen und allgemeines Lob.",
        "Erzeuge drei Hypothesen zur operativen Folge des Signals. Ein Vertriebsmitarbeiter wählt oder verwirft sie.",
        "Entwirf eine E-Mail aus belegtem Einstieg, Problemhypothese, einem Nachweis und einer Frage. Halte sie kurz.",
        "Erstelle zwei Follow-ups mit neuem Nutzen statt Wiederholungen.",
        "Protokolliere finale Nachricht, Quelle und Ergebnis, damit das Team aus qualifizierten Antworten lernt.",
      ],
      prompt: [
        "Entwirf aus dem folgenden Account-Briefing eine B2B-Outreach-E-Mail. Nutze ausschließlich als verifiziert markierte Fakten.",
        "Rolle: [Rolle]. Angebot: [Angebot]. Freigegebener Beleg: [Beleg]. Handlungsaufforderung: [Frage]. Maximal 90 Wörter.",
        "Struktur: verifiziertes Signal, klar als Hypothese markierte Geschäftsauswirkung, relevanter Beleg, eine einfache Frage.",
        "Erfinde keine Initiativen, Technologien, Budgets, Zitate, Beziehungen oder persönlichen Details. Reicht die Evidenz nicht, antworte NICHT GENUG EVIDENZ und nenne die Lücken.",
      ],
      checks: [
        "Öffne die Originalquelle unmittelbar vor dem Versand und prüfe Unternehmen, Ereignis und Aktualität.",
        "Formuliere die Schlussfolgerung als Hypothese und nicht als vermeintliches Insiderwissen.",
        "Prüfe Kontakt, Sperrliste, Rechtsgrundlage und lokale Vorgaben im Versandsystem.",
        "Entferne übertriebenes Lob, vorgetäuschte Vertrautheit, unbelegte Zahlen und Vergleiche.",
        "Messe qualifizierte Antworten und Termine statt nur Öffnungen oder Antwortmenge.",
      ],
      limitIntro: ["ChatGPT erteilt keine Kontaktgenehmigung und kennt die Aktualität deiner CRM-Daten nicht."],
      limits: [
        "Lade personenbezogene Daten oder vertrauliche CRM-Exporte nur mit freigegebener Datenverarbeitung und Zugriffskontrolle hoch.",
        "Webrecherche kann Tochterfirmen, Namensgleiche und alte Rollen verwechseln; prüfe die Identität manuell.",
        "Anreicherung, Versandlimits, Opt-outs und Sperrlisten gehören in deterministische Systeme, nicht in einen Prompt.",
        "Ein personalisierter Satz macht irrelevante Ansprache nicht nützlich.",
      ],
      sources,
    }),
    faqHeading: "Häufige Fragen zu ChatGPT für Outreach",
    faq: [
      ["Kann ChatGPT E-Mail-Adressen von Interessenten finden?", "Dieser Ablauf nutzt ChatGPT nicht als Kontaktdatenquelle. Verwende einen freigegebenen Anbieter und prüfe Erlaubnis, Sperrstatus und Identität im Sales-System."],
      ["Wie viel Personalisierung genügt?", "Ein verifiziertes, relevantes Geschäftssignal ist meist nützlicher als mehrere persönliche Details. Verbinde es ehrlich mit einer Problemhypothese."],
      ["Kann ich Nachrichten in großen Mengen erstellen?", "Erst wenn eine kleine geprüfte Stichprobe Eingaben und Leitplanken bestätigt. Hochwertige Accounts und riskante Aussagen brauchen menschliche Prüfung."],
      ["Welche Kennzahlen zählen?", "Erfasse positive qualifizierte Antworten, Termine, Opportunities, Abmeldungen und Beschwerden je Signal und Version."],
    ],
  },
};

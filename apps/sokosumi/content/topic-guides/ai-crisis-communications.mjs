import { topic } from "../topic-guide-builder.mjs";

const sources = [
  ["EU AI Act, Regulation (EU) 2024/1689, Article 50 — official consolidated text", "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng"],
  ["European Commission — Code of Practice on Transparency of AI-generated Content", "https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content"],
  ["SEC — Cybersecurity Risk Management and Incident Disclosure rules (26 Jul 2023)", "https://www.sec.gov/newsroom/press-releases/2023-139"],
  ["GDPR Articles 33–34, breach notification and communication", "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679"],
  ["PRSA — The Ethical Use of AI for Public Relations Practitioners, v2.0 (Oct 2025)", "https://www.prsa.org/docs/default-source/about/ethics/ethicaluseofai.pdf"],
  ["FTC — Final Rule Banning Fake Reviews and Testimonials (14 Aug 2024)", "https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials"],
];

export default {
  slug: "ai-crisis-communications",
  category: "advanced",
  order: 204,
  en: {
    title: "AI in crisis communications: the rules that actually bind",
    description:
      "One clause of the EU AI Act decides whether an AI-drafted public statement is legal without a label, and the disclosure clocks are shorter than most drafting cycles. What applies, from when, and where the profession draws the line.",
    body: topic("en", {
      intro: [
        "A crisis compresses everything: the statement, the legal review, the sign-off. That is exactly the pressure under which teams reach for a model — and exactly when regulation is least forgiving. The good news is that the binding rules are narrow and quotable, and one of them contains an exemption that most comms teams already satisfy without knowing it.",
        "Two clocks matter more than any of it. If you are drafting past them, the drafting method was never the problem.",
      ],
      stateIntro: ["From the regulations and the profession's published ethics guidance."],
      state: [
        "**The EU AI Act has a press-statement clause.** Article 50(4): deployers of a system generating or manipulating text \"which is published with the purpose of informing the public on matters of public interest shall disclose that the text has been artificially generated or manipulated.\"",
        "**Human review is the exemption.** That same clause does not apply \"where the AI-generated content has undergone a process of human review or editorial control and where a natural or legal person holds editorial responsibility for the publication of the content.\" A reviewed statement with a named accountable publisher needs no AI label; an unreviewed one does.",
        "**Deepfakes must always be disclosed.** Article 50(4) first paragraph requires deployers of AI generating deep-fake image, audio or video content to disclose it, regardless of review.",
        "**Disclosure has a deadline within the interaction.** Article 50(5) requires it \"in a clear and distinguishable manner at the latest at the time of the first interaction or exposure.\"",
        "**The date is 2 August 2026.** Article 50 sits in Chapter IV, which applies from that date under Article 113.",
        "**The Commission's Code of Practice is voluntary; the obligation is not.** \"Even though adherence to the code is voluntary, the transparency requirements under article 50 of the AI Act are legal obligations.\" Non-signatories must demonstrate their measures are adequate.",
        "**The disclosure clocks are shorter than a drafting cycle.** A material cybersecurity incident goes on SEC Form 8-K Item 1.05 \"generally due four business days after a registrant determines that a cybersecurity incident is material.\" GDPR Article 33 requires notifying the supervisory authority \"without undue delay and, where feasible, not later than 72 hours after having become aware of it.\"",
        "**High-risk breaches must reach the people affected.** GDPR Article 34 requires communication to data subjects without undue delay and \"in clear and plain language,\" unless the data was rendered unintelligible, for instance by encryption.",
        "**The profession puts crisis outside the automation boundary.** PRSA: \"Use AI for drafting, summarizing, trend spotting, and brainstorming — but let human judgment lead strategy, ethics, crisis response, and reputation management.\"",
        "**Some uses are named as unethical outright.** PRSA lists creating \"fake accounts, chatbots, or impostors that pose as authentic voices,\" and leaving inaccurate AI-amplified information uncorrected on a website or in a media kit.",
        "**Fabricated endorsements now carry civil penalties in the US.** The FTC's Fake Reviews Rule makes it a deceptive practice to create or disseminate a review or testimonial misrepresenting \"that the reviewer or testimonialist exists\" — the FTC names AI-generated fake reviews explicitly.",
        "**Sensitive material stays in closed systems.** PRSA advises closed AI systems for sensitive client work, and public tools only where the tool does not store or reuse inputs and no confidential data is entered.",
      ],
      workIntro: ["Decide this before the incident, because none of it can be decided during one."],
      work: [
        "Write down now who holds editorial responsibility for public statements. That named person is what moves an AI-assisted statement into the Article 50(4) exemption.",
        "Make human review a recorded step, not an assumption — the exemption turns on a review process existing, so log who reviewed and when.",
        "Map your clocks first: 72 hours for a GDPR notification, four business days after a materiality determination for an SEC 8-K. Build the drafting process to fit inside them.",
        "Pre-approve a closed AI environment for incident work, and ban public tools for anything containing personal data, unreleased facts or legal analysis.",
        "Never synthesise a spokesperson. Deepfake disclosure is mandatory regardless of review, and PRSA treats impostor voices as unethical outright.",
        "Prepare a verification routine for inbound synthetic material — trace the original source, reverse image search, check for corroborating reports from trusted outlets — because a crisis is when fabricated assets arrive.",
        "Keep a correction path open. Leaving inaccurate AI-amplified information uncorrected is itself named as improper conduct.",
      ],
      measureIntro: ["In a crisis the useful measures are about time and traceability, not sentiment."],
      measure: [
        "Time from materiality determination to filed disclosure, against the four-business-day and 72-hour clocks.",
        "Proportion of public statements with a logged human review and a named responsible person — your Article 50(4) evidence.",
        "Number of statements published with an AI-generation label where no review was recorded, which should be zero.",
        "Time to correct any inaccurate published information, tracked to closure.",
        "Verification turnaround on inbound suspect media, from receipt to a provenance verdict.",
      ],
      risks: [
        "Assuming an AI label is always required. With recorded human review and a named responsible publisher, Article 50(4) does not require one for text.",
        "Assuming a label is never required. Deep-fake image, audio and video disclosure applies regardless of review.",
        "Pasting incident detail — personal data, unreleased facts, legal analysis — into a public chatbot.",
        "Letting an AI-drafted holding statement go out without a recorded reviewer, which forfeits the exemption and the accountability at once.",
        "Publishing synthetic audio or video of a real spokesperson.",
        "Treating the Commission's Code of Practice as optional in substance. Signing is voluntary; the Article 50 obligations are law from 2 August 2026.",
      ],
      sources,
    }),
    faqHeading: "AI in crisis communications: common questions",
    faq: [
      [
        "Do we have to label an AI-drafted press statement?",
        "Under EU AI Act Article 50(4), not if it went through human review or editorial control and a named person or organisation holds editorial responsibility for publication. Without that review, a public-interest statement must disclose that the text was artificially generated.",
      ],
      [
        "When does this apply?",
        "Article 50 sits in Chapter IV of Regulation (EU) 2024/1689, which applies from 2 August 2026 under Article 113.",
      ],
      [
        "Can we use AI to draft the holding statement?",
        "PRSA's position is that human judgment should lead crisis response, with AI used for drafting, summarising and brainstorming. Combined with Article 50(4), the workable pattern is AI-assisted drafting plus recorded human review and a named accountable publisher.",
      ],
      [
        "What about a deepfake of our CEO circulating?",
        "Your own response must not answer it with synthetic media: deepfake disclosure is mandatory regardless of review, and PRSA treats impostor voices as improper. Verify the inbound material through source tracing and reverse image search before responding.",
      ],
    ],
  },
  de: {
    title: "KI in der Krisenkommunikation: die Regeln, die wirklich binden",
    description:
      "Ein Absatz des EU AI Act entscheidet, ob ein KI-entworfenes Statement ohne Kennzeichnung zulässig ist — und die Meldefristen sind kürzer als die meisten Abstimmungsschleifen. Was gilt, ab wann, und wo die Branche die Grenze zieht.",
    body: topic("de", {
      intro: [
        "Eine Krise komprimiert alles: das Statement, die rechtliche Prüfung, die Freigabe. Genau unter diesem Druck greifen Teams zum Modell — und genau dann ist die Regulierung am wenigsten nachsichtig. Die gute Nachricht: Die bindenden Regeln sind eng und zitierbar, und eine davon enthält eine Ausnahme, die viele Teams ohnehin erfüllen.",
        "Zwei Fristen wiegen schwerer als alles andere. Wer daran vorbei textet, hatte nie ein Methodenproblem.",
      ],
      stateIntro: ["Aus den Verordnungen und der veröffentlichten Ethik-Leitlinie der Branche."],
      state: [
        "**Der EU AI Act hat eine Pressemitteilungs-Klausel.** Artikel 50(4): Betreiber eines Systems, das Text erzeugt oder verändert, der zur Information der Öffentlichkeit über Angelegenheiten von öffentlichem Interesse veröffentlicht wird, müssen offenlegen, dass der Text künstlich erzeugt oder verändert wurde.",
        "**Die menschliche Prüfung ist die Ausnahme.** Dieselbe Klausel gilt nicht, wenn der Inhalt einer menschlichen Überprüfung oder redaktionellen Kontrolle unterzogen wurde und eine natürliche oder juristische Person die redaktionelle Verantwortung trägt.",
        "**Deepfakes sind immer offenzulegen.** Artikel 50(4) Unterabsatz 1 verlangt die Offenlegung bei Bild-, Audio- oder Videoinhalten, die einen Deepfake darstellen — unabhängig von einer Prüfung.",
        "**Die Offenlegung hat eine Frist innerhalb der Interaktion.** Artikel 50(5): klar und unterscheidbar, spätestens zum Zeitpunkt der ersten Interaktion oder Exposition.",
        "**Stichtag ist der 2. August 2026.** Artikel 50 steht in Kapitel IV, das nach Artikel 113 ab diesem Datum gilt.",
        "**Der Verhaltenskodex der Kommission ist freiwillig, die Pflicht nicht.** Die Transparenzanforderungen aus Artikel 50 sind rechtliche Verpflichtungen; Nicht-Unterzeichner müssen die Angemessenheit ihrer Maßnahmen nachweisen.",
        "**Die Meldefristen sind kürzer als eine Abstimmungsschleife.** Ein wesentlicher Cybersicherheitsvorfall gehört in SEC Form 8-K Item 1.05, in der Regel vier Geschäftstage nach der Wesentlichkeitsfeststellung. DSGVO Artikel 33 verlangt die Meldung an die Aufsichtsbehörde unverzüglich und möglichst binnen 72 Stunden nach Bekanntwerden.",
        "**Risikoreiche Verletzungen müssen die Betroffenen erreichen.** DSGVO Artikel 34: unverzüglich und in klarer, einfacher Sprache — außer die Daten waren unverständlich gemacht, etwa durch Verschlüsselung.",
        "**Die Branche stellt Krisen außerhalb der Automatisierungsgrenze.** PRSA: KI für Entwürfe, Zusammenfassungen und Ideen — menschliches Urteil führt bei Strategie, Ethik, Krisenreaktion und Reputationsmanagement.",
        "**Manches gilt ausdrücklich als unethisch:** gefälschte Accounts, Chatbots oder Doppelgänger, die sich als authentische Stimmen ausgeben, sowie unkorrigierte, KI-verstärkte Falschinformationen auf Website oder im Presseraum.",
        "**Erfundene Empfehlungen sind in den USA bußgeldbewehrt.** Die FTC-Regel zu Fake Reviews erfasst Bewertungen, die vortäuschen, dass die bewertende Person existiert — KI-generierte Fake-Bewertungen werden ausdrücklich genannt.",
        "**Sensibles bleibt in geschlossenen Systemen.** Die PRSA empfiehlt geschlossene KI-Systeme für sensible Kundenarbeit.",
      ],
      workIntro: ["Vor dem Vorfall entscheiden — währenddessen geht es nicht mehr."],
      work: [
        "Jetzt schriftlich festhalten, wer die redaktionelle Verantwortung für öffentliche Statements trägt. Diese Person trägt die Ausnahme nach Artikel 50(4).",
        "Die menschliche Prüfung als dokumentierten Schritt führen, nicht als Annahme: wer hat wann geprüft.",
        "Die Fristen zuerst kartieren: 72 Stunden für die DSGVO-Meldung, vier Geschäftstage nach Wesentlichkeitsfeststellung für ein SEC-8-K. Den Prozess darin unterbringen.",
        "Eine geschlossene KI-Umgebung für Vorfallarbeit vorab freigeben; öffentliche Tools für personenbezogene Daten, unveröffentlichte Fakten und rechtliche Bewertungen sperren.",
        "Nie eine Sprecherin oder einen Sprecher synthetisieren. Deepfake-Offenlegung ist unabhängig von der Prüfung Pflicht.",
        "Eine Verifikationsroutine für eingehendes synthetisches Material bereithalten: Ursprungsquelle suchen, Rückwärtssuche, Abgleich mit vertrauenswürdiger Berichterstattung.",
        "Einen Korrekturpfad offenhalten. Unkorrigierte KI-verstärkte Falschinformation gilt selbst als Fehlverhalten.",
      ],
      measureIntro: ["In der Krise zählen Zeit und Nachvollziehbarkeit, nicht Sentiment."],
      measure: [
        "Zeit von der Wesentlichkeitsfeststellung bis zur eingereichten Offenlegung, gegen die Vier-Tage- und 72-Stunden-Frist.",
        "Anteil öffentlicher Statements mit dokumentierter menschlicher Prüfung und benannter verantwortlicher Person — die Evidenz für Artikel 50(4).",
        "Zahl veröffentlichter Statements mit KI-Kennzeichnung ohne dokumentierte Prüfung; sie sollte null sein.",
        "Zeit bis zur Korrektur unrichtiger veröffentlichter Informationen.",
        "Bearbeitungszeit für eingehendes Verdachtsmaterial bis zum Provenienz-Urteil.",
      ],
      risks: [
        "Annehmen, eine KI-Kennzeichnung sei immer nötig. Mit dokumentierter Prüfung und benannter Verantwortung verlangt Artikel 50(4) für Text keine.",
        "Annehmen, sie sei nie nötig. Für Deepfakes in Bild, Audio und Video gilt sie unabhängig von der Prüfung.",
        "Vorfalldetails in einen öffentlichen Chatbot geben.",
        "Ein KI-entworfenes Holding Statement ohne dokumentierte Prüfung freigeben und damit Ausnahme und Verantwortlichkeit zugleich verlieren.",
        "Synthetisches Audio oder Video einer realen Sprecherin veröffentlichen.",
        "Den Verhaltenskodex der Kommission inhaltlich für optional halten. Die Unterzeichnung ist freiwillig, die Pflichten aus Artikel 50 sind ab dem 2. August 2026 Recht.",
      ],
      sources,
    }),
    faqHeading: "KI in der Krisenkommunikation: häufige Fragen",
    faq: [
      [
        "Müssen wir ein KI-entworfenes Statement kennzeichnen?",
        "Nach Artikel 50(4) EU AI Act nicht, wenn es einer menschlichen Überprüfung oder redaktionellen Kontrolle unterzogen wurde und eine benannte Person oder Organisation die redaktionelle Verantwortung trägt. Ohne diese Prüfung ist die Offenlegung Pflicht.",
      ],
      [
        "Ab wann gilt das?",
        "Artikel 50 steht in Kapitel IV der Verordnung (EU) 2024/1689 und gilt nach Artikel 113 ab dem 2. August 2026.",
      ],
      [
        "Dürfen wir das Holding Statement mit KI entwerfen?",
        "Die PRSA sieht das menschliche Urteil bei der Krisenreaktion in der Führung, KI bei Entwurf und Zusammenfassung. Zusammen mit Artikel 50(4) ergibt das: KI-gestützter Entwurf plus dokumentierte Prüfung plus benannte Verantwortung.",
      ],
      [
        "Was, wenn ein Deepfake unserer Geschäftsführung kursiert?",
        "Die eigene Antwort darf keine synthetischen Medien einsetzen; die Offenlegungspflicht für Deepfakes gilt unabhängig von der Prüfung. Eingehendes Material zuerst über Quellensuche und Rückwärtssuche verifizieren.",
      ],
    ],
  },
};

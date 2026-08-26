import { topic } from "../topic-guide-builder.mjs";

const sources = [
  ["AP — Standards around generative AI (15 Aug 2023)", "https://blog.ap.org/standards-around-generative-ai"],
  ["BBC Editorial Guidelines — Guidance: The use of Artificial Intelligence", "https://www.bbc.co.uk/editorialguidelines/guidance/use-of-artificial-intelligence/"],
  ["The Guardian's approach to generative AI", "https://www.theguardian.com/help/insideguardian/2023/jun/16/the-guardians-approach-to-generative-ai"],
  ["RSF — Paris Charter on AI and Journalism (10 Nov 2023)", "https://rsf.org/en/paris-charter-ai-and-journalism"],
  ["PRSA — The Ethical Use of AI for Public Relations Practitioners, v2.0 (Oct 2025)", "https://www.prsa.org/docs/default-source/about/ethics/ethicaluseofai.pdf"],
  ["Cision — 2026 State of the Media Report announcement (n=1,899)", "https://www.prnewswire.com/news-releases/pr-emerges-as-the-primary-source-for-journalists-in-high-pressure-newsrooms-302770936.html"],
];

export default {
  slug: "ai-media-relations",
  category: "advanced",
  order: 203,
  en: {
    title: "AI in media relations: what newsrooms actually forbid",
    description:
      "Newsrooms have published AI policies, and they constrain what you can send them. What AP, the BBC and the Guardian permit, what PRSA requires you to disclose, and what journalists say about AI-written pitches.",
    body: topic("en", {
      intro: [
        "Most advice about AI in PR is written from the sender's side. The binding constraints are on the receiving side: newsrooms have published editorial policies about AI, and those policies govern whether your material is usable at all. A pitch that trips one of them is not a weak pitch — it is an unusable one.",
        "The rules below are quoted from published policies. They are shorter and more specific than the discourse suggests.",
      ],
      stateIntro: ["From published newsroom policies, the PR profession's own ethics guidance, and one dated survey."],
      state: [
        "**AP treats AI output as unvetted source material.** Staff \"may experiment with ChatGPT with caution, [but] they do not use it to create publishable content,\" and any output \"should be treated as unvetted source material.\"",
        "**AP screens inbound material too.** Journalists should \"exercise due caution and diligence to ensure material coming into AP from other sources is also free of AI-generated content\" — and \"if journalists have any doubt at all about the authenticity of the material, they should not use it.\" That doubt standard applies to your assets.",
        "**Image manipulation is a hard line.** AP does not allow generative AI \"to add or subtract any elements\" from photos, video or audio. The BBC states news images \"must not be manipulated beyond a sympathetic crop and minor adjustments to brightness and contrast.\"",
        "**The BBC requires a named accountable editor.** Any editorial use requires \"a senior editorial figure who is responsible and accountable,\" must be referred to them first, and \"must be transparent and clear to the audience.\" Synthetic voices not of a real person \"must be clearly disclosed.\"",
        "**The BBC extends this to suppliers.** Independent producers must handle AI per the guidance, and proposed AI use with material impact \"should be discussed as part of the commissioning process.\"",
        "**The Guardian requires explicit senior permission** for significant AI-generated elements, with \"clear evidence of a specific benefit, human oversight\" — and states there is \"no room for unreliability in our journalism, nor our marketing, creative and engineering work.\"",
        "**The Paris Charter sets the provenance default.** Content not meeting its authenticity standards \"should be regarded as potentially misleading and should undergo thorough verification,\" and outlets should refrain from AI content mimicking real recordings or impersonating actual individuals.",
        "**PRSA permits AI-drafted releases, with conditions.** \"Is it ethical to use AI to draft a press release or social post? Yes — if the content is accurate, reviewed by a human, and aligned with PRSA's Code of Ethics.\" But: \"If a press release includes AI-generated quotes or messaging, or if a client or journalist expects fully human authorship, transparency is essential.\"",
        "**Blanket disclosure is not enough.** PRSA: \"A blanket disclosure on the website (e.g., 'this company uses AI in its creative') is not sufficient for individual pieces of content.\"",
        "**Journalists are majority-opposed to AI-written pitches.** Cision's 2026 State of the Media Report, a survey of 1,899 journalists across 19 markets conducted in January–February 2026, found 53% oppose AI-generated pitches on accuracy and personalisation grounds.",
        "**Confidential material must stay out of public tools.** AP urges staff not to put confidential or sensitive information into AI tools; Nature's policy states manuscripts and sensitive data \"must not be shared with unsecured or public AI systems.\" The same logic applies to anything under embargo.",
      ],
      workIntro: ["A workable division of labour: AI on the preparation, humans on everything a journalist receives."],
      work: [
        "Use AI for the desk work — clustering coverage, summarising a technical document for yourself, drafting internal briefing notes, checking a release against a message house.",
        "Write the pitch itself. Given that a majority of surveyed journalists oppose AI-generated pitches, an AI-written pitch is a deliverability risk before it is an ethics question.",
        "Never paste embargoed or client-confidential material into a public tool. Use a closed system, as PRSA advises for sensitive client work.",
        "Keep provenance on every asset: who shot it, when, what was changed. Newsrooms are applying a doubt standard, and unprovenanced media is the fastest way to be discarded.",
        "Do not generate or retouch imagery for editorial distribution. AP and the BBC both prohibit the manipulation; sending it wastes the placement.",
        "Disclose per item, not per company, when AI materially shaped a specific piece — and treat AI-generated quotes as always requiring disclosure.",
        "Get named human sign-off before anything goes out. Both the BBC's and the Guardian's rules turn on a named accountable person; mirror that on your side.",
      ],
      measureIntro: ["Measure the things a policy breach would damage first."],
      measure: [
        "Pitch-to-response rate, tracked separately for pitches with and without AI assistance, so you have your own evidence rather than a vendor's.",
        "Asset rejection or query rate — how often a newsroom asks about provenance is a direct read on whether your material clears the doubt standard.",
        "Disclosure compliance: proportion of published items that carry per-item disclosure where AI materially contributed.",
        "Correction and retraction count, which is the failure mode PRSA names for leaving inaccurate AI-amplified information uncorrected.",
        "Time saved on preparation, kept distinct from anything sent externally.",
      ],
      risks: [
        "Sending AI-generated or AI-retouched images for editorial use. AP and the BBC both forbid the manipulation outright.",
        "Relying on a site-wide AI disclaimer. PRSA states explicitly that this is not sufficient for individual pieces.",
        "Putting an embargoed release into a public chatbot to \"tighten it.\"",
        "AI-generated quotes attributed to a real executive without disclosure and documented permission.",
        "Assuming AI-written pitches are neutral to journalists — the majority of those surveyed say otherwise.",
        "Treating a newsroom's silence as acceptance. Under the Paris Charter and AP's guidance, doubt resolves toward not using the material at all.",
      ],
      sources,
    }),
    faqHeading: "AI in media relations: common questions",
    faq: [
      [
        "Can we use AI to write a press release?",
        "PRSA says yes if the content is accurate, human-reviewed and aligned with its Code of Ethics — with transparency essential where the release contains AI-generated quotes or messaging, or where a client or journalist expects fully human authorship.",
      ],
      [
        "Do journalists mind AI-written pitches?",
        "In Cision's 2026 survey of 1,899 journalists, 53% opposed AI-generated pitches, citing accuracy and personalisation. That is a majority, so treat an AI-written pitch as a deliverability risk.",
      ],
      [
        "Is it safe to put an embargoed release into ChatGPT?",
        "Treat it as not safe. AP urges staff not to put confidential or sensitive information into AI tools, and Nature bars sharing manuscripts and sensitive data with unsecured or public AI systems. Use a closed system.",
      ],
      [
        "Do we have to label AI use?",
        "Where AI materially shaped a specific item, yes — and per item. PRSA states a blanket website disclosure is not sufficient for individual pieces of content.",
      ],
    ],
  },
  de: {
    title: "KI in der Medienarbeit: was Redaktionen tatsächlich untersagen",
    description:
      "Redaktionen haben KI-Richtlinien veröffentlicht, die bestimmen, was man ihnen überhaupt schicken kann. Was AP, BBC und Guardian erlauben, was die PRSA an Offenlegung verlangt und wie Journalisten zu KI-Pitches stehen.",
    body: topic("de", {
      intro: [
        "Die meisten Ratgeber zu KI in der PR denken von der Senderseite. Verbindlich ist die Empfängerseite: Redaktionen haben redaktionelle KI-Richtlinien veröffentlicht, und diese entscheiden, ob Material überhaupt verwendbar ist. Ein Pitch, der daran scheitert, ist nicht schwach — er ist unbrauchbar.",
        "Die folgenden Regeln stammen aus veröffentlichten Richtlinien. Sie sind kürzer und konkreter, als die Debatte vermuten lässt.",
      ],
      stateIntro: ["Aus veröffentlichten Redaktionsrichtlinien, der Ethik-Leitlinie der PR-Branche und einer datierten Befragung."],
      state: [
        "**AP behandelt KI-Ausgaben als ungeprüftes Quellenmaterial.** Mitarbeitende dürfen vorsichtig experimentieren, erstellen damit aber keine publizierbaren Inhalte.",
        "**AP prüft auch eingehendes Material.** Redaktionen sollen sicherstellen, dass Zulieferungen frei von KI-generierten Inhalten sind — und bei jedem Zweifel an der Echtheit auf die Nutzung verzichten. Dieser Zweifelsmaßstab gilt für Ihre Assets.",
        "**Bildbearbeitung ist eine harte Grenze.** AP erlaubt es nicht, per generativer KI Elemente hinzuzufügen oder zu entfernen. Die BBC lässt bei Nachrichtenbildern nur einen behutsamen Beschnitt sowie kleine Helligkeits- und Kontrastanpassungen zu.",
        "**Die BBC verlangt eine namentlich verantwortliche Redaktionsleitung.** Jede redaktionelle Nutzung braucht eine verantwortliche Person, muss vorab vorgelegt werden und für das Publikum transparent sein. Synthetische Stimmen, die keine reale Person abbilden, sind klar offenzulegen.",
        "**Das gilt auch für Zulieferer.** Produktionsfirmen müssen sich an die Richtlinie halten; geplante KI-Nutzung mit wesentlicher Wirkung gehört in den Beauftragungsprozess.",
        "**Der Guardian verlangt ausdrückliche Freigabe** durch eine leitende Redaktion, mit belegtem Nutzen und menschlicher Aufsicht — und bezieht das ausdrücklich auch auf Marketing- und Kreativarbeit.",
        "**Die Paris Charter setzt den Provenienz-Standard.** Inhalte, die ihre Authentizitätsanforderungen nicht erfüllen, gelten als potenziell irreführend und sind gründlich zu verifizieren.",
        "**Die PRSA erlaubt KI-entworfene Pressemitteilungen unter Bedingungen:** korrekt, von Menschen geprüft, im Einklang mit dem Ethikkodex. Enthält eine Mitteilung KI-generierte Zitate oder Botschaften — oder erwartet ein Kunde oder eine Redaktion vollständig menschliche Autorschaft —, ist Transparenz zwingend.",
        "**Pauschale Hinweise genügen nicht.** Ein allgemeiner Website-Hinweis ist laut PRSA für einzelne Inhalte nicht ausreichend.",
        "**Journalisten lehnen KI-Pitches mehrheitlich ab.** Cisions State of the Media Report 2026 — 1.899 Journalistinnen und Journalisten in 19 Märkten, erhoben Januar bis Februar 2026 — nennt 53 % Ablehnung, begründet mit Genauigkeit und Personalisierung.",
        "**Vertrauliches gehört nicht in öffentliche Tools.** AP rät davon ab, vertrauliche Informationen in KI-Tools einzugeben; Nature untersagt das Teilen von Manuskripten und sensiblen Daten mit ungesicherten oder öffentlichen KI-Systemen. Für Gesperrtes gilt dasselbe.",
      ],
      workIntro: ["Eine tragfähige Arbeitsteilung: KI für die Vorbereitung, Menschen für alles, was eine Redaktion erreicht."],
      work: [
        "KI für die Schreibtischarbeit nutzen: Berichterstattung clustern, Fachdokumente für sich selbst zusammenfassen, interne Briefings entwerfen, Mitteilungen gegen das Message House prüfen.",
        "Den Pitch selbst schreiben. Bei mehrheitlicher Ablehnung ist ein KI-geschriebener Pitch zuerst ein Zustellrisiko, dann eine Ethikfrage.",
        "Gesperrtes oder Vertrauliches nie in ein öffentliches Tool geben. Für sensible Kundenarbeit geschlossene Systeme verwenden.",
        "Zu jedem Asset die Provenienz mitliefern: wer, wann, was verändert. Redaktionen wenden einen Zweifelsmaßstab an.",
        "Keine Bilder für die redaktionelle Verbreitung generieren oder retuschieren. AP und BBC untersagen die Manipulation.",
        "Pro Inhalt offenlegen, nicht pro Unternehmen — und KI-generierte Zitate immer.",
        "Vor dem Versand namentliche Freigabe durch einen Menschen einholen.",
      ],
      measureIntro: ["Zuerst messen, was ein Richtlinienverstoß beschädigen würde."],
      measure: [
        "Rücklaufquote auf Pitches, getrennt nach mit und ohne KI-Unterstützung — eigene Evidenz statt Anbieterzahlen.",
        "Ablehnungs- und Rückfragequote zu Assets als direkter Indikator für den Zweifelsmaßstab.",
        "Offenlegungsquote: Anteil veröffentlichter Inhalte mit Einzelhinweis, wo KI wesentlich beigetragen hat.",
        "Zahl der Korrekturen und Richtigstellungen.",
        "Eingesparte Vorbereitungszeit, getrennt von allem extern Versandten.",
      ],
      risks: [
        "KI-generierte oder -retuschierte Bilder für die redaktionelle Nutzung versenden.",
        "Sich auf einen seitenweiten KI-Hinweis verlassen; laut PRSA für Einzelinhalte nicht ausreichend.",
        "Eine gesperrte Mitteilung in einen öffentlichen Chatbot geben.",
        "KI-generierte Zitate ohne Offenlegung und dokumentierte Zustimmung einer realen Person zuschreiben.",
        "Annehmen, KI-Pitches seien für Redaktionen neutral.",
        "Schweigen einer Redaktion als Zustimmung lesen.",
      ],
      sources,
    }),
    faqHeading: "KI in der Medienarbeit: häufige Fragen",
    faq: [
      [
        "Dürfen wir Pressemitteilungen mit KI schreiben?",
        "Laut PRSA ja, sofern korrekt, von Menschen geprüft und im Einklang mit dem Ethikkodex — mit zwingender Transparenz bei KI-generierten Zitaten oder Botschaften und dort, wo vollständig menschliche Autorschaft erwartet wird.",
      ],
      [
        "Stören sich Journalisten an KI-Pitches?",
        "In Cisions Befragung von 1.899 Journalistinnen und Journalisten (2026) lehnten 53 % KI-generierte Pitches ab, mit Verweis auf Genauigkeit und Personalisierung.",
      ],
      [
        "Ist es unbedenklich, eine gesperrte Mitteilung in ChatGPT einzugeben?",
        "Nein. AP rät von vertraulichen Informationen in KI-Tools ab, Nature untersagt das Teilen sensibler Inhalte mit öffentlichen KI-Systemen. Geschlossene Systeme nutzen.",
      ],
      [
        "Müssen wir KI-Nutzung kennzeichnen?",
        "Wo KI einen konkreten Inhalt wesentlich geprägt hat: ja, und zwar pro Inhalt. Ein pauschaler Website-Hinweis genügt laut PRSA nicht.",
      ],
    ],
  },
};

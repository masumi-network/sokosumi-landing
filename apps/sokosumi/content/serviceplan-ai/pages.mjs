const hero = (eyebrow, heading, subheading) => ({ blockType: "hero", eyebrow, heading, subheading });

const richText = (content) => ({ blockType: "richText", content });

const featureGrid = (heading, items) => ({
  blockType: "featureGrid",
  heading,
  items: items.map(([title, text]) => ({ title, text })),
});

const steps = (heading, subheading, items) => ({
  blockType: "steps",
  heading,
  subheading,
  items: items.map(([title, text]) => ({ title, text })),
});

const stats = (heading, items) => ({
  blockType: "stats",
  heading,
  items: items.map(([value, label]) => ({ value, label })),
});

const checklist = (heading, intro, items) => ({
  blockType: "checklist",
  heading,
  intro,
  items: items.map((text) => ({ text })),
});

const faq = (heading, items) => ({
  blockType: "faq",
  heading,
  items: items.map(([question, answer]) => ({ question, answer })),
});

const page = (slug, title, description, enLayout, deTitle, deDescription, deLayout, parent) => ({
  slug,
  parent,
  en: { title, description, layout: enLayout },
  de: { title: deTitle, description: deDescription, layout: deLayout },
});

const SOURCE = {
  group: "https://www.house-of-communication.com/int/en.html",
  results: "https://www.house-of-communication.com/int/en/newsroom/2026/07/serviceplan-group-2025-2026-fiscal-year.html",
  house: "https://www.house-of-communication.com/de/en/solutions/artificial-intelligence.html",
  serviceplan: "https://www.house-of-communication.com/int/en/brands/serviceplan.html",
  mediaplus: "https://www.house-of-communication.com/int/en/brands/mediaplus.html",
  behave: "https://www.house-of-communication.com/int/en/newsroom/2026/05/mediaplus-global-ai-unit-behave.html",
  planNet: "https://www.house-of-communication.com/int/en/brands/plan-net.html",
  agentic: "https://www.house-of-communication.com/de/en/brands/plan-net/landingpages/agentic-services.html",
  planNetLaunch: "https://www.house-of-communication.com/de/de/newsroom/2026/07/plannet-group-plannet-agentic-ai.html",
  masumi: "https://www.house-of-communication.com/de/en/brands/plan-net/landingpages/agentic-services/masumi.html",
  sokosumi: "https://www.house-of-communication.com/us/en-hoc/newsroom/2025/06/plant-net-launch-sokosumi.html",
  coworkers: "https://www.house-of-communication.com/de/de/newsroom/2026/02/serviceplan-group-ai-coworker.html",
  coworkerBlog: "https://www.house-of-communication.com/int/en/newsroom/blog/2026/03/plannet-nina-matzat-serviceplan-agents.html",
  luma: "https://www.house-of-communication.com/de/en/newsroom/2026/02/serviceplan-group-partnership-luma-ai.html",
  health: "https://www.house-of-communication.com/de/de/newsroom/2026/03/serviceplan-health-content-ai.html",
  cmo: "https://www.house-of-communication.com/de/en/newsroom/2025/11/serviceplan-group-cmo-barometer-2026.html",
  gwi: "https://www.house-of-communication.com/sv/en/newsroom/2025/09/serviceplan-group-gwi.html",
  masumiPartner: "https://www.masumi.network/blogs/serviceplan-group-partners-with-cardano-foundation-to-pioneer-blockchain-driven-ai-agent-economy",
  nmkr: "https://www.nmkr.io/clients/nmkr-x-masumi",
  cannes2025: "https://www.house-of-communication.com/de/en/brands/serviceplan/landingpages/cannes-2025.html",
  cannes2026: "https://www.house-of-communication.com/int/en/newsroom/2026/06/serviceplan-group-milestones-cannes-lions-2026.html",
  labs: "https://www.house-of-communication.com/int/en/newsroom/twelve-mail/twelve-mail-no-16/two-labs-one-vision.html",
  generate: "https://www.house-of-communication.com/sv/en/newsroom/twelve-mail/twelve-mail-no-16/creative-playground.html",
  makeline: "https://www.house-of-communication.com/be/en/cases/makeline.html",
  bmwContent: "https://www.house-of-communication.com/us/en-hoc/newsroom/2025/06/plan-net-tme-christin-herrnberger.html",
  momentum: "https://www.house-of-communication.com/int/en/newsroom/2026/06/serviceplan-group-account-mediamarktsaturn.html",
  dataAi: "https://www.house-of-communication.com/de/en/brands/mediaplus/services/media-data/data-ai.html",
  researchAi: "https://www.house-of-communication.com/de/en/brands/mediaplus/services/media-data/data-ai/research-ai.html",
  searchAi: "https://www.house-of-communication.com/de/en/brands/mediaplus/services/media-data/data-ai/search-ai.html",
  pretestAi: "https://www.house-of-communication.com/de/en/brands/mediaplus/services/media-data/data-ai/pretest-ai.html",
  resonanceCase: "https://www.house-of-communication.com/de/en/brands/mediaplus/services/media-data/data-ai/resonance-ai/resonanceai-case.html",
  aiSearch: "https://www.house-of-communication.com/sv/en/newsroom/blog/2026/04/mediaplus-stephan-kopp-ai-search.html",
  cocaCola: "https://www.house-of-communication.com/de/en/cases/coca-cola-holidays-are-coming-2024.html",
  bmwMotorrad: "https://www.house-of-communication.com/int/en/cases/bmw-motorrad-discover-the-world.html",
  grana: "https://www.house-of-communication.com/de/en/cases/grana-padano-our-future-has-ai-history.html",
  swisscom: "https://www.house-of-communication.com/ch/en/cases/swisscom-sure.html",
  effie: "https://www.house-of-communication.com/me/en/cases/iaa-effie-a-i-wards.html",
  aiAct: "https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act",
  partnerCode: "https://www.house-of-communication.com/content/dam/house-of-communication-aem/global/about-us/climate/sp-gh-kg-code-of-conduct-business-partners-march-2026.pdf.coredownload.pdf",
};

export const pages = [
  page(
    "serviceplan-ai",
    "Serviceplan Group and AI",
    "A sourced map of Serviceplan Group's House of AI, agency units, platforms, partnerships and AI marketing products, including Sokosumi and Masumi.",
    [
      hero(
        "Serviceplan Group and AI",
        "How Serviceplan is building AI into marketing",
        "A sourced guide to the House of AI, the work inside Serviceplan, Mediaplus and Plan.Net, and the products that make it usable.",
      ),
      richText(`## One system, several kinds of work
Serviceplan Group describes the **House of AI** as the digital twin of its House of Communication: a connected operating system for insight, creative work, media activation and specialised agents. It is not one chatbot and it is not one agency. The public structure spans the group's three main brands — Serviceplan, Mediaplus and Plan.Net — plus a data foundation, partner technologies and products such as Sokosumi.

This guide separates those layers. It is published by Sokosumi, which is operated by Plan.Net Germany and belongs to the Serviceplan AI ecosystem. Claims are linked to Serviceplan Group, partner and product sources so readers can distinguish the group's statements from independent facts. Start with the [official House of AI overview](${SOURCE.house}) and the [latest group results](${SOURCE.results}).`),
      stats("Serviceplan Group in 2026", [
        ["6,500+", "people in the group"],
        ["43", "locations worldwide"],
        ["24", "countries"],
        ["19", "Houses of Communication"],
      ]),
      steps("The House of AI in one pass", "The public model follows the marketing value chain rather than a list of disconnected tools.", [
        ["Data foundation", "A Global Data Platform is presented as the common, compliant foundation for intelligence and activation across markets."],
        ["Insight.AI", "Audience, behaviour and journey data become research, personas and decision support."],
        ["Creative.AI", "Human teams use generative systems and production workflows to develop and adapt content at scale."],
        ["Activate.AI and Agentic.AI", "Media is optimised continuously while specialised agents take on bounded work and orchestrate execution."],
      ]),
      richText(`## Why Sokosumi is part of this story
The agency offer and the self-service product are related but not identical. Serviceplan and its units build consulting, campaigns and custom systems for larger organisations. Sokosumi gives teams direct access to named AI coworkers and specialist agents. Serviceplan's March 2026 announcement calls Sokosumi the first small-business offer from the House of AI. [Read the announcement](${SOURCE.coworkers}) or [meet the coworkers](/ai-coworkers).`),
      faq("Serviceplan AI: quick answers", [
        ["What is Serviceplan's House of AI?", "It is Serviceplan Group's operating model for AI across data, insight, creative work, media activation and specialised agents. The public structure names Insight.AI, Creative.AI, Activate.AI and Agentic.AI on a Global Data Platform."],
        ["Which Serviceplan agencies work on AI?", "Publicly documented work sits mainly in Serviceplan and Serviceplan Make, Mediaplus, Plan.Net and Plan.Net Studios, with specialist initiatives including Behave.AI, HealthContent.AI and Wien Nord Serviceplan's ACT unit."],
        ["Is Sokosumi owned by Serviceplan?", "Sokosumi is operated by Plan.Net Germany GmbH & Co. KG. Serviceplan Group presents it as its self-service platform for standardised AI agents and as part of the House of AI."],
        ["Is this an official Serviceplan Group page?", "No. This is a sourced editorial overview on Sokosumi. It links to official Serviceplan Group and partner material and identifies product or partner claims where relevant."],
      ]),
    ],
    "Serviceplan Group und KI",
    "Ein belegter Überblick zu Serviceplans House of AI, Agenturen, Plattformen, Partnerschaften und KI-Produkten einschließlich Sokosumi und Masumi.",
    [
      hero(
        "Serviceplan Group und KI",
        "Wie Serviceplan KI ins Marketing einbaut",
        "Ein belegter Wegweiser durch das House of AI, die Arbeit von Serviceplan, Mediaplus und Plan.Net sowie die daraus entstandenen Produkte.",
      ),
      richText(`## Ein System, mehrere Arten von Arbeit
Die Serviceplan Group beschreibt das **House of AI** als digitalen Zwilling ihres House of Communication: ein verbundenes Betriebssystem für Insights, Kreation, Media-Aktivierung und spezialisierte Agents. Es ist weder ein einzelner Chatbot noch eine einzelne Agentur. Die öffentlich beschriebene Struktur umfasst die drei Hauptmarken Serviceplan, Mediaplus und Plan.Net, eine gemeinsame Datenbasis, Technologiepartner und Produkte wie Sokosumi.

Dieser Guide trennt diese Ebenen. Er erscheint auf Sokosumi, das von Plan.Net Germany betrieben wird und zum KI-Ökosystem der Serviceplan Group gehört. Aussagen sind mit Quellen der Gruppe, ihrer Partner und der Produkte verlinkt. So bleibt erkennbar, was eine Selbstaussage ist und was sich anderweitig belegen lässt. Ausgangspunkte sind die [offizielle House-of-AI-Seite](${SOURCE.house}) und der [aktuelle Geschäftsbericht der Gruppe](${SOURCE.results}).`),
      stats("Die Serviceplan Group 2026", [
        ["6.500+", "Mitarbeitende in der Gruppe"],
        ["43", "Standorte weltweit"],
        ["24", "Länder"],
        ["19", "Houses of Communication"],
      ]),
      steps("Das House of AI in vier Schritten", "Das öffentliche Modell folgt der Marketing-Wertschöpfungskette statt einer Liste voneinander getrennter Tools.", [
        ["Datenbasis", "Eine Global Data Platform bildet die gemeinsame, als compliant beschriebene Grundlage für Intelligence und Aktivierung über Märkte hinweg."],
        ["Insight.AI", "Zielgruppen-, Verhaltens- und Journey-Daten werden zu Research, Personas und Entscheidungshilfen."],
        ["Creative.AI", "Menschliche Teams nutzen generative Systeme und Produktionsprozesse, um Inhalte zu entwickeln und zu skalieren."],
        ["Activate.AI und Agentic.AI", "Media wird laufend optimiert, während spezialisierte Agents klar begrenzte Aufgaben übernehmen und die Ausführung koordinieren."],
      ]),
      richText(`## Warum Sokosumi zu dieser Geschichte gehört
Das Agenturangebot und das Self-Service-Produkt sind verbunden, aber nicht identisch. Serviceplan und seine Einheiten entwickeln Beratung, Kampagnen und individuelle Systeme für größere Organisationen. Sokosumi gibt Teams direkten Zugang zu benannten AI Coworkern und spezialisierten Agents. In der Mitteilung vom März 2026 nennt Serviceplan Sokosumi das erste KMU-Angebot aus dem House of AI. [Zur Mitteilung](${SOURCE.coworkers}) oder [zu den AI Coworkern](/de/ai-coworkers).`),
      faq("Serviceplan KI: kurze Antworten", [
        ["Was ist Serviceplans House of AI?", "Es ist das Betriebsmodell der Serviceplan Group für KI in Daten, Insights, Kreation, Media-Aktivierung und spezialisierten Agents. Öffentlich genannt werden Insight.AI, Creative.AI, Activate.AI und Agentic.AI auf einer Global Data Platform."],
        ["Welche Serviceplan-Agenturen arbeiten an KI?", "Öffentlich dokumentierte Arbeit liegt vor allem bei Serviceplan und Serviceplan Make, Mediaplus, Plan.Net und Plan.Net Studios. Hinzu kommen spezialisierte Initiativen wie Behave.AI, HealthContent.AI und die ACT-Unit von Wien Nord Serviceplan."],
        ["Gehört Sokosumi zu Serviceplan?", "Sokosumi wird von der Plan.Net Germany GmbH & Co. KG betrieben. Die Serviceplan Group beschreibt die Plattform als ihr Self-Service-Angebot für standardisierte KI-Agenten und als Teil des House of AI."],
        ["Ist dies eine offizielle Seite der Serviceplan Group?", "Nein. Dies ist ein belegter redaktioneller Überblick auf Sokosumi. Er verlinkt offizielle Quellen der Serviceplan Group und ihrer Partner und kennzeichnet Produkt- oder Partnerangaben entsprechend."],
      ]),
    ],
  ),

  page(
    "serviceplan-ai/house-of-ai",
    "Serviceplan House of AI explained",
    "How Serviceplan's House of AI connects its Global Data Platform with Insight.AI, Creative.AI, Activate.AI and Agentic.AI across modern marketing work.",
    [
      hero(
        "Serviceplan House of AI",
        "The operating model behind Serviceplan's AI work",
        "The House of AI connects data, intelligence, creative production, activation and agents across the marketing value chain.",
      ),
      featureGrid("The public architecture", [
        ["Global Data Platform", "The common data foundation is designed to make current, market-level information usable across insight, creative and media workflows."],
        ["Insight.AI", "Research, audience understanding, personas and behavioural intelligence turn data into direction for human teams."],
        ["Creative.AI", "Generative and production systems help teams develop, test, personalise and adapt creative work without removing human craft."],
        ["Activate.AI", "Media planning, activation and optimisation use the shared intelligence layer to improve execution continuously."],
        ["Agentic.AI", "Specialised agents perform bounded tasks, connect tools and hand work between systems or people."],
        ["Human expertise", "Serviceplan calls the principle augmented intelligence: technology expands human capability rather than replacing judgment."],
      ]),
      richText(`## A digital twin, not a tool catalogue
Serviceplan calls the House of AI the **digital twin of the House of Communication**. That description matters: the model mirrors how the group already combines creative, media, data and technology disciplines. The goal is to connect those disciplines through one operating model rather than to place an AI feature in each agency independently.

The official page describes three connected suites — Insight.AI, Creative.AI and Activate.AI — above a fully compliant Global Data Platform. Agentic.AI sits across the system as a layer of specialised agents. Mediaplus' Plus.AI adds a conversational intelligence layer for media work. [See Serviceplan Group's architecture](${SOURCE.house}).`),
      steps("How work moves through the house", "A real engagement can enter at any point, but the model is easiest to understand as a loop.", [
        ["Observe", "Audience, market, behavioural and first-party data are gathered and structured on the shared platform."],
        ["Decide", "Insight.AI turns evidence into audiences, personas, scenarios and recommendations that a team can challenge."],
        ["Create", "Creative.AI supports concept development, production and asset adaptation with agency craft still responsible for the idea and brand."],
        ["Activate and learn", "Activate.AI places and optimises media; new performance data flows back into the next decision. Agents can execute defined steps across the loop."],
      ]),
      richText(`## What is public and what is not
The names and high-level structure are public. Serviceplan also documents individual products and units elsewhere, including Plus.AI, Behave.AI, Agentic Services, HealthContent.AI and Sokosumi. Detailed model choices, client data architecture, governance controls and performance by client are not published as one technical specification. A useful evaluation should therefore ask for the exact data sources, approval points, hosting, measurement plan and human responsibility for the proposed use case.`),
      faq("House of AI questions", [
        ["Is House of AI a software product?", "Serviceplan presents it as an integrated operating system and portfolio, not as one off-the-shelf application. Parts of it are agency services, internal workflows, partner technologies or products such as Sokosumi."],
        ["What is the difference between Insight.AI and Plus.AI?", "Insight.AI is one suite in the House of AI model. Plus.AI is Mediaplus' media-planning operating system and conversational intelligence layer, with seven named modules including Research.AI, Persona.AI and Behave.AI."],
        ["What does Agentic.AI mean here?", "It is the layer for specialised AI agents that perform defined tasks and can be orchestrated into client-specific systems. Plan.Net's Agentic Services and Sokosumi are two public expressions of that layer."],
        ["Does Serviceplan publish an AI ethics code?", "No standalone public AI ethics code was found in the reviewed sources. The group does make compliance, GDPR, EU AI Act and human-augmentation claims for parts of the portfolio; those should be verified for each engagement."],
      ]),
    ],
    "Serviceplans House of AI erklärt",
    "So verbindet Serviceplans House of AI die Global Data Platform mit Insight.AI, Creative.AI, Activate.AI und Agentic.AI entlang der Marketingarbeit.",
    [
      hero(
        "Serviceplan House of AI",
        "Das Betriebsmodell hinter Serviceplans KI-Arbeit",
        "Das House of AI verbindet Daten, Intelligence, kreative Produktion, Aktivierung und Agents entlang der Marketing-Wertschöpfungskette.",
      ),
      featureGrid("Die öffentlich beschriebene Architektur", [
        ["Global Data Platform", "Die gemeinsame Datenbasis soll aktuelle Informationen auf Markt- und Kundenebene für Insights, Kreation und Media nutzbar machen."],
        ["Insight.AI", "Research, Zielgruppenverständnis, Personas und Behavioral Intelligence übersetzen Daten in Orientierung für menschliche Teams."],
        ["Creative.AI", "Generative Systeme und Produktionsprozesse unterstützen Entwicklung, Tests, Personalisierung und Adaption, ohne menschliches Handwerk zu ersetzen."],
        ["Activate.AI", "Mediaplanung, Aktivierung und Optimierung nutzen die gemeinsame Intelligence-Schicht für die laufende Aussteuerung."],
        ["Agentic.AI", "Spezialisierte Agents bearbeiten abgegrenzte Aufgaben, verbinden Tools und übergeben Arbeit zwischen Systemen und Menschen."],
        ["Menschliche Expertise", "Serviceplan spricht von Augmented Intelligence: Technologie erweitert menschliche Fähigkeiten, ersetzt aber nicht das Urteil."],
      ]),
      richText(`## Ein digitaler Zwilling, kein Tool-Katalog
Serviceplan nennt das House of AI den **digitalen Zwilling des House of Communication**. Das ist mehr als ein Bild: Das Modell spiegelt die bestehende Verbindung von Kreation, Media, Daten und Technologie. Diese Disziplinen sollen über ein gemeinsames Betriebsmodell zusammenspielen, statt in jeder Agentur ein isoliertes KI-Feature zu erhalten.

Die offizielle Seite beschreibt drei verbundene Säulen — Insight.AI, Creative.AI und Activate.AI — auf einer als compliant bezeichneten Global Data Platform. Agentic.AI liegt als Schicht spezialisierter Agents darüber. Mediaplus ergänzt dies mit Plus.AI als dialogorientierter Intelligence-Schicht für Media. [Zur offiziellen Architektur](${SOURCE.house}).`),
      steps("Wie Arbeit durch das House of AI läuft", "Ein Projekt kann an jeder Stelle beginnen. Als Kreislauf wird das Modell am klarsten.", [
        ["Beobachten", "Zielgruppen-, Markt-, Verhaltens- und First-Party-Daten werden gesammelt und auf der gemeinsamen Plattform strukturiert."],
        ["Entscheiden", "Insight.AI übersetzt Evidenz in Zielgruppen, Personas, Szenarien und Empfehlungen, die ein Team prüfen kann."],
        ["Kreieren", "Creative.AI unterstützt Ideenentwicklung, Produktion und Asset-Adaption; Idee, Marke und Freigabe bleiben bei den verantwortlichen Menschen."],
        ["Aktivieren und lernen", "Activate.AI spielt Media aus und optimiert. Neue Leistungsdaten fließen in die nächste Entscheidung; Agents können definierte Schritte im Kreislauf ausführen."],
      ]),
      richText(`## Was öffentlich ist und was nicht
Namen und Grundstruktur sind öffentlich. Weitere Produkte und Einheiten wie Plus.AI, Behave.AI, Agentic Services, HealthContent.AI und Sokosumi dokumentiert Serviceplan an anderer Stelle. Konkrete Modellwahl, Kundendatenarchitektur, Governance-Kontrollen und Ergebnisse pro Kunde liegen jedoch nicht als gemeinsame technische Spezifikation vor. Eine belastbare Bewertung sollte deshalb Datenquellen, Freigabepunkte, Hosting, Messplan und menschliche Verantwortung für den jeweiligen Use Case einzeln prüfen.`),
      faq("Fragen zum House of AI", [
        ["Ist House of AI ein Softwareprodukt?", "Serviceplan beschreibt es als integriertes Betriebssystem und Portfolio, nicht als einzelne Standardsoftware. Teile sind Agenturleistungen, interne Workflows, Partnertechnologien oder Produkte wie Sokosumi."],
        ["Was unterscheidet Insight.AI von Plus.AI?", "Insight.AI ist eine Suite im House-of-AI-Modell. Plus.AI ist Mediaplus' Betriebssystem für datenbasierte Mediaplanung und umfasst sieben benannte Module, darunter Research.AI, Persona.AI und Behave.AI."],
        ["Was bedeutet Agentic.AI bei Serviceplan?", "Es ist die Schicht für spezialisierte KI-Agenten, die definierte Aufgaben ausführen und zu kundenspezifischen Systemen orchestriert werden können. Plan.Nets Agentic Services und Sokosumi sind zwei öffentliche Ausprägungen."],
        ["Veröffentlicht Serviceplan einen KI-Ethikkodex?", "In den geprüften Quellen fand sich kein eigenständiger öffentlicher KI-Ethikkodex. Für Teile des Portfolios nennt die Gruppe Compliance, DSGVO, EU AI Act und menschliche Kontrolle; diese Punkte sollten pro Projekt geprüft werden."],
      ]),
    ],
    "serviceplan-ai",
  ),

  page(
    "serviceplan-ai/serviceplan-creative-ai",
    "Serviceplan Creative.AI and production",
    "A sourced guide to Serviceplan's creative AI work: Serviceplan Make, Luma AI, HealthContent.AI, production workflows and specialist agency units.",
    [
      hero(
        "Serviceplan and Creative.AI",
        "Where AI meets creative craft and production",
        "Serviceplan's public AI work spans ideation, high-volume production, specialist content and new creative units—not one universal generator.",
      ),
      featureGrid("The documented initiatives", [
        ["Serviceplan Make and SP Gen AI", "The production unit presented a proprietary generative workflow for automated asset production, personalisation and brand-safety controls."],
        ["Luma AI partnership", "Luma became the group's creative-AI technology partner in February 2026, bringing video, motion and 3D generation into global workflows."],
        ["HealthContent.AI", "Serviceplan Content Health and AMBOSS connect generative drafting with a medical evidence base for healthcare communication."],
        ["ACT in Vienna", "Wien Nord Serviceplan's Artificial Craft & Transformation unit covers AI video, image, animation, 3D, retouching and agentic services."],
      ]),
      richText(`## Creative.AI is a workflow, not a prompt
The public material consistently puts human craft around the model. In the [Luma AI partnership announcement](${SOURCE.luma}), Global CCO Alexander Schill argues that AI should amplify creativity rather than standardise it. Luma's technology is intended to sit inside professional workflows from strategy and concept development through production and distribution.

That distinction matters for brands. A production system needs more than generation: reference assets, rights, brand rules, review, versioning, adaptation and final approval. Serviceplan Make's **SP Gen AI** was presented in Austria as a proprietary system for automated asset creation and personalised workflows, with an attributed claim of up to 25% production-cost reduction. The percentage is a Serviceplan claim reported by news.at, not an independent benchmark.`),
      steps("Four creative AI jobs", "Different units solve different constraints; collapsing them into one 'content AI' label hides the useful detail.", [
        ["Explore", "Teams use generative systems to visualise territories, test directions and make more alternatives discussable earlier."],
        ["Produce", "Serviceplan Make turns approved concepts into repeatable production workflows and high-volume asset families."],
        ["Adapt", "Assets are localised, resized and personalised for channels and audiences while the brand system remains the control layer."],
        ["Verify", "Specialist domains add specialist evidence. HealthContent.AI checks medical marketing copy against AMBOSS rather than relying on a general model alone."],
      ]),
      richText(`## The agencies and units behind the work
The core Serviceplan brand covers creativity and content. Public brand material names specialist units including Serviceplan Make, Serviceplan Innovation, Serviceplan PR & Content, Serviceplan Culture and Serviceplan Content Health. The AI initiatives with the clearest public documentation are concentrated in production, health content and the global Luma deployment. [See the Serviceplan brand overview](${SOURCE.serviceplan}) and the [HealthContent.AI announcement](${SOURCE.health}).

Not every award-winning Serviceplan campaign is an AI case. The group won Independent Network of the Year at Cannes Lions 2025, but that is evidence of broad creative performance, not proof that Creative.AI caused the wins. The documented AI-related case is Animal Alerts, which used pet biometric signals to identify possible earthquake warnings.`),
      checklist("What a serious Creative.AI brief should specify", "These questions turn a broad AI promise into an auditable production plan.", [
        "Which models and reference assets may be used for each stage",
        "Who owns idea selection, brand approval and factual sign-off",
        "How rights, likeness, disclosure and regional rules are handled",
        "Which adaptations are automated and which require human review",
        "How quality, speed, cost and performance will be compared with the existing process",
      ]),
      faq("Serviceplan creative AI questions", [
        ["What is Creative.AI at Serviceplan?", "It is one pillar of the House of AI, covering AI-assisted creative development, production, personalisation and asset adaptation. Public examples include Serviceplan Make workflows and the group-wide Luma AI partnership."],
        ["Does Serviceplan use Luma AI?", "Yes. Serviceplan Group announced Luma AI as its creative-AI technology partner in February 2026 for use across strategy, creative development, content production and distribution."],
        ["What is HealthContent.AI?", "It is a Serviceplan Content Health and AMBOSS offer for creating and checking medical marketing content against the AMBOSS evidence base."],
        ["Has Serviceplan proved a 25% cost saving?", "Serviceplan representatives presented an 'up to 25%' production-cost reduction for SP Gen AI during an Austrian AI roadshow. It should be treated as a vendor-reported maximum, not a general independent result."],
      ]),
    ],
    "Serviceplan Creative.AI und Produktion",
    "Ein belegter Guide zu Serviceplans kreativer KI-Arbeit: Serviceplan Make, Luma AI, HealthContent.AI, Produktionsworkflows und Fachagenturen.",
    [
      hero(
        "Serviceplan und Creative.AI",
        "Wo KI auf kreatives Handwerk und Produktion trifft",
        "Serviceplans öffentliche KI-Arbeit umfasst Ideen, skalierbare Produktion, Fachcontent und neue Kreativeinheiten — nicht einen universellen Generator.",
      ),
      featureGrid("Die dokumentierten Initiativen", [
        ["Serviceplan Make und SP Gen AI", "Die Produktionseinheit stellte einen eigenen generativen Workflow für automatisierte Asset-Produktion, Personalisierung und Markensicherheit vor."],
        ["Partnerschaft mit Luma AI", "Luma wurde im Februar 2026 Technologiepartner für Creative AI und bringt Video-, Motion- und 3D-Generierung in globale Workflows."],
        ["HealthContent.AI", "Serviceplan Content Health und AMBOSS verbinden generatives Texten mit einer medizinischen Evidenzbasis für Healthcare-Kommunikation."],
        ["ACT in Wien", "Die Unit Artificial Craft & Transformation von Wien Nord Serviceplan deckt KI-Video, Bild, Animation, 3D, Retusche und Agentic Services ab."],
      ]),
      richText(`## Creative.AI ist ein Workflow, kein Prompt
Die öffentlichen Aussagen stellen menschliches Handwerk konsequent um das Modell. In der [Mitteilung zur Luma-AI-Partnerschaft](${SOURCE.luma}) sagt Global CCO Alexander Schill, KI solle Kreativität verstärken statt standardisieren. Lumas Technologie soll in professionelle Abläufe von Strategie und Konzept bis Produktion und Distribution eingebettet werden.

Für Marken ist diese Trennung entscheidend. Ein Produktionssystem braucht mehr als Generierung: Referenzmaterial, Rechte, Markenregeln, Review, Versionierung, Adaption und finale Freigabe. **SP Gen AI** von Serviceplan Make wurde in Österreich als eigenes System für automatisierte Asset-Erstellung und personalisierte Workflows vorgestellt. Genannt wurde eine mögliche Senkung der Produktionskosten um bis zu 25 Prozent. Dieser Wert ist eine von news.at wiedergegebene Serviceplan-Angabe, kein unabhängiger Benchmark.`),
      steps("Vier Aufgaben für Creative AI", "Die Einheiten lösen unterschiedliche Engpässe. Der Sammelbegriff 'Content AI' würde die nützlichen Unterschiede verdecken.", [
        ["Explorieren", "Teams visualisieren Territorien, testen Richtungen und machen früher mehr Alternativen diskutierbar."],
        ["Produzieren", "Serviceplan Make übersetzt freigegebene Konzepte in wiederholbare Abläufe und große Asset-Familien."],
        ["Adaptieren", "Assets werden für Kanäle, Zielgruppen und Märkte lokalisiert, skaliert und personalisiert; das Markensystem bleibt die Kontrollschicht."],
        ["Prüfen", "Fachdomänen ergänzen Fachevidenz. HealthContent.AI prüft medizinische Marketingtexte gegen AMBOSS, statt allein einem General-Purpose-Modell zu vertrauen."],
      ]),
      richText(`## Die Agenturen und Einheiten hinter der Arbeit
Die Kernmarke Serviceplan steht für Kreation und Content. Die öffentlichen Markenseiten nennen spezialisierte Einheiten wie Serviceplan Make, Serviceplan Innovation, Serviceplan PR & Content, Serviceplan Culture und Serviceplan Content Health. Am klarsten dokumentiert sind die KI-Initiativen in Produktion, Healthcare-Content und der globalen Luma-Einführung. [Zur Serviceplan-Markenübersicht](${SOURCE.serviceplan}) und zur [HealthContent.AI-Mitteilung](${SOURCE.health}).

Nicht jede preisgekrönte Serviceplan-Kampagne ist ein KI-Case. Die Auszeichnung als Independent Network of the Year bei den Cannes Lions 2025 belegt die kreative Gesamtleistung, aber nicht den Einfluss von Creative.AI. Als KI-bezogener Case ist Animal Alerts dokumentiert: Das Projekt nutzte biometrische Signale von Haustieren, um mögliche Erdbebenwarnungen zu erkennen.`),
      checklist("Was ein belastbares Creative-AI-Briefing festhalten sollte", "Diese Fragen machen aus einem breiten KI-Versprechen einen prüfbaren Produktionsplan.", [
        "Welche Modelle und Referenzmaterialien in welcher Phase eingesetzt werden dürfen",
        "Wer Idee, Marke und Fakten final freigibt",
        "Wie Rechte, Ähnlichkeiten, Kennzeichnung und regionale Regeln behandelt werden",
        "Welche Adaptionen automatisiert laufen und welche menschlich geprüft werden",
        "Wie Qualität, Zeit, Kosten und Wirkung mit dem bisherigen Prozess verglichen werden",
      ]),
      faq("Fragen zu Serviceplans kreativer KI", [
        ["Was ist Creative.AI bei Serviceplan?", "Creative.AI ist eine Säule des House of AI für KI-gestützte Ideenentwicklung, Produktion, Personalisierung und Asset-Adaption. Öffentliche Beispiele sind Workflows von Serviceplan Make und die gruppenweite Luma-AI-Partnerschaft."],
        ["Nutzt Serviceplan Luma AI?", "Ja. Die Serviceplan Group kündigte Luma AI im Februar 2026 als Technologiepartner für Creative AI in Strategie, Kreativentwicklung, Content-Produktion und Distribution an."],
        ["Was ist HealthContent.AI?", "Ein Angebot von Serviceplan Content Health und AMBOSS zur Erstellung und Prüfung medizinischer Marketinginhalte anhand der AMBOSS-Evidenzbasis."],
        ["Sind 25 Prozent Kostensenkung belegt?", "Serviceplan nannte bei einer österreichischen AI Roadshow für SP Gen AI eine mögliche Produktionskostensenkung von bis zu 25 Prozent. Der Wert ist als Anbieterangabe und Maximalwert zu verstehen, nicht als allgemeines unabhängiges Ergebnis."],
      ]),
    ],
    "serviceplan-ai",
  ),

  page(
    "serviceplan-ai/mediaplus-ai",
    "Mediaplus AI: Plus.AI and Behave.AI",
    "How Mediaplus uses its Global Data Platform, Plus.AI and Behave.AI for research, media planning, behavioural intelligence and campaign activation.",
    [
      hero(
        "Mediaplus AI",
        "From media data to decisions and activation",
        "Mediaplus supplies the data and media backbone of Serviceplan's House of AI through its Global Data Platform, Plus.AI and Behave.AI.",
      ),
      stats("Mediaplus at a glance", [
        ["2,200", "specialists, approximately"],
        ["25", "own locations"],
        ["7", "named Plus.AI modules"],
        ["3", "Behave.AI products"],
      ]),
      featureGrid("The three layers", [
        ["Global Data Platform", "A distributed data-mesh architecture connects market and client data so local teams can work from a common foundation."],
        ["Plus.AI", "A brand-specific conversational operating system helps teams research, predict, build personas, compare touchpoints and pre-test decisions."],
        ["Behave.AI", "Behavioural science is packaged into Purchase.AI, Tribes.AI and Resonance.AI to explain decisions and improve strategy and creative relevance."],
      ]),
      richText(`## Plus.AI is the media interface
Mediaplus launched **Plus.AI** with technology partner Akkio in June 2026. Public descriptions name seven modules: Research.AI, Search.AI, Predict.AI, Touchpoint.AI, Persona.AI, Behave.AI and Pretest.AI. The interface is conversational, but the important part is the connected data and media workflow behind the chat.

The system is configured per brand and built on Mediaplus' international data-mesh architecture. It is intended to give strategists access to current research, forecasting, personas, touchpoint comparisons and pre-testing in one environment. The public announcement does not expose model cards, customer-level accuracy or a common ROI figure, so those remain evaluation questions rather than established outcomes.`),
      richText(`## Behave.AI adds behavioural science
Mediaplus expanded the UK-founded Behave unit to Germany and across its network in May 2026. The [official announcement](${SOURCE.behave}) describes three products: **Purchase.AI** for purchase decisions, **Tribes.AI** for cultural and social groups, and **Resonance.AI** for the emotional effect of communication.

This is a different claim from generic sentiment analysis. Behave combines behavioural-science models, experimental design and consultancy with AI-assisted analysis. Mediaplus names work for brands including E.ON, Zoetis, Hiscox, Lorenz NicNacs and BRITA, but does not publish one standard performance lift across those engagements.`),
      steps("A media decision loop", "The value of the system depends on how evidence, judgment and activation stay connected.", [
        ["Ask", "A strategist frames the decision: an audience, budget, channel mix, message or expected behavioural response."],
        ["Ground", "Plus.AI and the Global Data Platform retrieve and structure the available brand, market, media and behavioural evidence."],
        ["Decide", "People compare scenarios and select the recommendation, including assumptions and constraints that automation cannot own."],
        ["Activate", "Campaigns are executed and optimised through Activate.AI; measured results feed the next planning cycle."],
      ]),
      faq("Mediaplus AI questions", [
        ["What is Plus.AI?", "Plus.AI is Mediaplus' AI operating system for data-driven media planning. It combines a conversational interface with seven named modules and the group's Global Data Platform."],
        ["Who built Plus.AI?", "Mediaplus names Akkio as the technology partner. The system is configured per brand and connected to Mediaplus' international data-mesh architecture."],
        ["What is Behave.AI?", "Behave.AI turns Mediaplus' behavioural-science expertise into three AI-supported offers: Purchase.AI, Tribes.AI and Resonance.AI."],
        ["Does Mediaplus publish Plus.AI results?", "The reviewed public sources describe capabilities, modules and selected clients, but not a universal customer-level ROI, accuracy score or independently audited benchmark."],
      ]),
    ],
    "Mediaplus KI: Plus.AI und Behave.AI",
    "So nutzt Mediaplus Global Data Platform, Plus.AI und Behave.AI für Research, Mediaplanung, Behavioral Intelligence und Kampagnenaktivierung.",
    [
      hero(
        "Mediaplus KI",
        "Von Mediendaten zu Entscheidungen und Aktivierung",
        "Mediaplus liefert mit Global Data Platform, Plus.AI und Behave.AI das Daten- und Media-Fundament des House of AI.",
      ),
      stats("Mediaplus auf einen Blick", [
        ["2.200", "Spezialistinnen und Spezialisten, circa"],
        ["25", "eigene Standorte"],
        ["7", "benannte Plus.AI-Module"],
        ["3", "Behave.AI-Produkte"],
      ]),
      featureGrid("Die drei Ebenen", [
        ["Global Data Platform", "Eine verteilte Data-Mesh-Architektur verbindet Markt- und Kundendaten, damit lokale Teams auf einer gemeinsamen Basis arbeiten."],
        ["Plus.AI", "Ein markenspezifisches, dialogorientiertes Betriebssystem unterstützt Research, Prognosen, Personas, Touchpoint-Vergleiche und Pretests."],
        ["Behave.AI", "Behavioral Science wird in Purchase.AI, Tribes.AI und Resonance.AI übersetzt, um Entscheidungen zu erklären und Strategie sowie Kreation relevanter zu machen."],
      ]),
      richText(`## Plus.AI ist die Schnittstelle für Media
Mediaplus startete **Plus.AI** im Juni 2026 gemeinsam mit Technologiepartner Akkio. Öffentlich genannt werden sieben Module: Research.AI, Search.AI, Predict.AI, Touchpoint.AI, Persona.AI, Behave.AI und Pretest.AI. Die Oberfläche ist dialogorientiert; entscheidend ist jedoch der verbundene Daten- und Media-Workflow hinter dem Chat.

Das System wird pro Marke eingerichtet und basiert auf der internationalen Data-Mesh-Architektur von Mediaplus. Strategieteams sollen damit Research, Prognosen, Personas, Touchpoint-Vergleiche und Pretests in einer Umgebung nutzen. Die öffentliche Ankündigung enthält weder Model Cards noch eine gemeinsame ROI- oder Genauigkeitskennzahl. Diese Punkte bleiben deshalb Prüfaufgaben, nicht belegte Ergebnisse.`),
      richText(`## Behave.AI ergänzt Verhaltenswissenschaft
Mediaplus weitete die in Großbritannien gegründete Behave-Einheit im Mai 2026 auf Deutschland und das internationale Netzwerk aus. Die [offizielle Mitteilung](${SOURCE.behave}) beschreibt drei Produkte: **Purchase.AI** für Kaufentscheidungen, **Tribes.AI** für kulturelle und soziale Gruppen sowie **Resonance.AI** für die emotionale Wirkung von Kommunikation.

Das ist ein anderer Anspruch als generische Sentimentanalyse. Behave verbindet verhaltenswissenschaftliche Modelle, Experimentaldesign und Beratung mit KI-gestützter Analyse. Mediaplus nennt Arbeiten für Marken wie E.ON, Zoetis, Hiscox, Lorenz NicNacs und BRITA, veröffentlicht aber keinen einheitlichen Performance-Uplift über diese Projekte.`),
      steps("Ein Kreislauf für Mediaentscheidungen", "Der Wert entsteht nur, wenn Evidenz, menschliches Urteil und Aktivierung verbunden bleiben.", [
        ["Fragen", "Ein Strategieteam definiert die Entscheidung: Zielgruppe, Budget, Kanalmix, Botschaft oder erwartete Verhaltenswirkung."],
        ["Fundieren", "Plus.AI und Global Data Platform strukturieren verfügbare Marken-, Markt-, Media- und Verhaltensdaten."],
        ["Entscheiden", "Menschen vergleichen Szenarien und wählen eine Empfehlung einschließlich Annahmen und Grenzen, die Automatisierung nicht verantworten kann."],
        ["Aktivieren", "Kampagnen werden über Activate.AI ausgesteuert und optimiert; gemessene Ergebnisse fließen in die nächste Planungsrunde."],
      ]),
      faq("Fragen zu Mediaplus KI", [
        ["Was ist Plus.AI?", "Plus.AI ist Mediaplus' KI-Betriebssystem für datenbasierte Mediaplanung. Es verbindet eine dialogorientierte Oberfläche, sieben benannte Module und die Global Data Platform der Gruppe."],
        ["Wer hat Plus.AI entwickelt?", "Mediaplus nennt Akkio als Technologiepartner. Das System wird pro Marke eingerichtet und an die internationale Data-Mesh-Architektur von Mediaplus angebunden."],
        ["Was ist Behave.AI?", "Behave.AI übersetzt die Behavioral-Science-Kompetenz von Mediaplus in drei KI-gestützte Angebote: Purchase.AI, Tribes.AI und Resonance.AI."],
        ["Veröffentlicht Mediaplus Ergebnisse von Plus.AI?", "Die geprüften öffentlichen Quellen beschreiben Funktionen, Module und ausgewählte Kunden, aber keinen universellen Kunden-ROI, Genauigkeitswert oder unabhängig auditierten Benchmark."],
      ]),
    ],
    "serviceplan-ai",
  ),

  page(
    "serviceplan-ai/plan-net-agentic-ai",
    "Plan.Net Agentic AI and AI agents",
    "How Plan.Net builds and integrates custom AI-agent systems through Agentic Services, Plan.Net Studios and the Masumi, Kodosumi and Sokosumi stack.",
    [
      hero(
        "Plan.Net Agentic AI",
        "The technology layer behind Serviceplan's AI agents",
        "Plan.Net connects enterprise integration, custom agents and self-service products through Agentic Services and Plan.Net Studios.",
      ),
      stats("Plan.Net Agentic AI at a glance", [
        ["8 Jul 2026", "standalone unit announced"],
        ["~40", "employees reported at launch"],
        ["2", "managing directors"],
        ["Enterprise", "international client focus"],
      ]),
      featureGrid("Three public expressions of Agentic.AI", [
        ["Agentic Services", "Custom research, insight, content, design and workflow agents integrated into client systems and governed by experts."],
        ["Plan.Net Agentic AI", "A dedicated business unit announced in the group's FY 2025/26 results for enterprise AI marketing transformation."],
        ["Sokosumi", "The self-service marketplace and workplace where teams can brief named AI coworkers and specialist agents directly."],
      ]),
      richText(`## From custom systems to a product teams can open today
Plan.Net is Serviceplan Group's experience and technology brand. Its public [Agentic Services](${SOURCE.agentic}) offer is the custom end of the spectrum: agents are designed for client-specific research, content, design and operational workflows, connected to data and tools, and orchestrated with frameworks such as CrewAI and LangGraph.

At the other end, Sokosumi standardises access. Teams can sign up, select a coworker or specialist agent, submit a brief and receive a deliverable without commissioning a bespoke integration. The two offers serve different buying contexts; they should not be presented as interchangeable.`),
      steps("The Plan.Net agent stack", "The three product names solve different infrastructure and user problems.", [
        ["Masumi establishes trust", "The protocol records agent identities, payments and job-state evidence so independent agents can transact and be held accountable."],
        ["Kodosumi runs agents", "The deployment layer is intended to make agent services available reliably without every provider building the same hosting plumbing."],
        ["Sokosumi exposes the work", "The marketplace and workplace give people a direct interface for discovery, briefing, task tracking and outputs."],
        ["Plan.Net integrates", "For enterprise work, Plan.Net connects these or other components to client data, approvals and operating processes."],
      ]),
      richText(`## The standalone enterprise unit
Plan.Net announced **Plan.Net Agentic AI** on 8 July 2026 as a standalone business unit led by managing directors Hadi Lotfi and Konrad Schreiber. The [launch announcement](${SOURCE.planNetLaunch}) reports around 40 employees and an international enterprise focus. Its published service map covers AI-ready operating models, decision intelligence, agentic architecture and implementation, AI-assisted production, marketing intelligence and ongoing operation.

The announcement says the unit is running multi-market work in banking, FMCG and automotive, but it does not name clients or publish outcomes. Those are therefore rollout claims, not case studies. Serviceplan also distinguishes this enterprise-transformation offer from standardised products for smaller organisations.

## Which buying path fits
**Sokosumi and AI Coworkers** fit bounded work that a team wants to start without a bespoke build. **Agentic Services** fit a custom workflow or agent that needs specific data, tools and approvals. **Plan.Net Agentic AI** is positioned for enterprise-wide operating models, architecture, implementation and ongoing operation. The boundaries can overlap, but scope and integration depth—not the label “AI agent”—should drive the choice.`),
      faq("Plan.Net Agentic AI questions", [
        ["What are Plan.Net Agentic Services?", "They are Plan.Net's custom AI-agent services for tasks such as research, insights, content, design and workflow automation, integrated into client systems and supervised by experts."],
        ["What is the new Plan.Net Agentic AI unit?", "It is a standalone Plan.Net business unit announced on 8 July 2026 for enterprise AI marketing transformation. Hadi Lotfi and Konrad Schreiber lead around 40 reported employees."],
        ["Did Plan.Net build Sokosumi?", "Plan.Net Studios launched Sokosumi with NMKR in 2025. Sokosumi is operated by Plan.Net Germany and runs on the Masumi agent-network infrastructure."],
        ["When should a company choose a custom system instead of Sokosumi?", "Choose custom integration when agents need private data, bespoke approvals, complex system access or organisation-specific orchestration. Choose Sokosumi when a team wants ready-to-use coworkers and clearly scoped deliverables."],
      ]),
    ],
    "Plan.Net Agentic AI und KI-Agenten",
    "So entwickelt und integriert Plan.Net individuelle KI-Agenten mit Agentic Services, Plan.Net Studios sowie Masumi, Kodosumi und Sokosumi.",
    [
      hero(
        "Plan.Net Agentic AI",
        "Die Technologieschicht hinter Serviceplans KI-Agenten",
        "Plan.Net verbindet Enterprise-Integration, individuelle Agents und Self-Service-Produkte über Agentic Services und Plan.Net Studios.",
      ),
      stats("Plan.Net Agentic AI auf einen Blick", [
        ["8. Jul 2026", "als eigene Einheit angekündigt"],
        ["ca. 40", "Mitarbeitende zum Start"],
        ["2", "Managing Directors"],
        ["Enterprise", "internationaler Kundenfokus"],
      ]),
      featureGrid("Drei öffentliche Ausprägungen von Agentic.AI", [
        ["Agentic Services", "Individuelle Research-, Insight-, Content-, Design- und Workflow-Agents, integriert in Kundensysteme und begleitet von Fachleuten."],
        ["Plan.Net Agentic AI", "Eine im Geschäftsjahr 2025/26 angekündigte eigene Business Unit für KI-Transformation im Enterprise-Marketing."],
        ["Sokosumi", "Der Self-Service-Marktplatz und Arbeitsplatz, auf dem Teams AI Coworker und spezialisierte Agents direkt briefen."],
      ]),
      richText(`## Vom individuellen System zum direkt nutzbaren Produkt
Plan.Net ist die Experience- und Technologiemarke der Serviceplan Group. Das öffentliche Angebot [Agentic Services](${SOURCE.agentic}) bildet das individuelle Ende des Spektrums: Agents werden für kundenspezifisches Research, Content, Design und operative Abläufe entwickelt, an Daten und Tools angebunden und mit Frameworks wie CrewAI und LangGraph orchestriert.

Am anderen Ende standardisiert Sokosumi den Zugang. Teams können sich registrieren, einen Coworker oder Agent auswählen, ein Briefing einstellen und ein Ergebnis erhalten, ohne eine individuelle Integration zu beauftragen. Beide Angebote bedienen unterschiedliche Einkaufssituationen und sollten nicht als austauschbar dargestellt werden.`),
      steps("Der Agent-Stack von Plan.Net", "Die drei Produktnamen lösen unterschiedliche Infrastruktur- und Nutzerprobleme.", [
        ["Masumi schafft Vertrauen", "Das Protokoll hält Agentenidentitäten, Zahlungen und Nachweise zum Jobstatus fest, damit unabhängige Agents abrechnen und zur Verantwortung gezogen werden können."],
        ["Kodosumi betreibt Agents", "Die Deployment-Schicht soll Agent-Services verlässlich verfügbar machen, ohne dass jeder Anbieter dieselbe Hosting-Infrastruktur neu baut."],
        ["Sokosumi macht Arbeit zugänglich", "Marktplatz und Arbeitsplatz bieten Menschen eine direkte Oberfläche für Auswahl, Briefing, Task-Tracking und Ergebnisse."],
        ["Plan.Net integriert", "Im Enterprise-Kontext verbindet Plan.Net diese oder andere Komponenten mit Kundendaten, Freigaben und Betriebsprozessen."],
      ]),
      richText(`## Die eigenständige Enterprise-Einheit
Plan.Net kündigte **Plan.Net Agentic AI** am 8. Juli 2026 als eigenständige Business Unit unter der Leitung von Hadi Lotfi und Konrad Schreiber an. Die [Launch-Mitteilung](${SOURCE.planNetLaunch}) nennt rund 40 Mitarbeitende und einen internationalen Enterprise-Fokus. Das veröffentlichte Angebot reicht von KI-fähigen Operating Models, Decision Intelligence und agentischen Architekturen bis zu Implementierung, KI-gestützter Produktion, Marketing Intelligence und laufendem Betrieb.

Laut Mitteilung arbeitet die Einheit bereits an marktübergreifenden Rollouts in Banking, FMCG und Automotive. Kunden und Ergebnisse werden nicht genannt; es handelt sich daher um Rollout-Angaben, nicht um belegte Cases. Serviceplan grenzt diese Enterprise-Transformation ausdrücklich von standardisierten Produkten für kleinere Organisationen ab.

## Welcher Einkaufsweg passt
**Sokosumi und AI Coworker** passen für klar begrenzte Arbeit ohne Sonderentwicklung. **Agentic Services** passen für individuelle Workflows oder Agents mit spezifischen Daten, Tools und Freigaben. **Plan.Net Agentic AI** ist für unternehmensweite Betriebsmodelle, Architektur, Implementierung und laufenden Betrieb positioniert. Entscheidend sind Umfang und Integrationstiefe, nicht das allgemeine Label „KI-Agent“.
`),
      faq("Fragen zu Plan.Net Agentic AI", [
        ["Was sind Plan.Net Agentic Services?", "Individuelle KI-Agenten für Research, Insights, Content, Design und Workflow-Automatisierung, die in Kundensysteme integriert und von Fachleuten begleitet werden."],
        ["Was ist die neue Einheit Plan.Net Agentic AI?", "Eine am 8. Juli 2026 angekündigte eigenständige Plan.Net-Einheit für Enterprise-KI-Transformation. Hadi Lotfi und Konrad Schreiber leiten rund 40 gemeldete Mitarbeitende."],
        ["Hat Plan.Net Sokosumi entwickelt?", "Plan.Net Studios startete Sokosumi 2025 gemeinsam mit NMKR. Betreiber ist Plan.Net Germany; die Plattform nutzt die Infrastruktur des Masumi-Netzwerks."],
        ["Wann passt eine individuelle Lösung besser als Sokosumi?", "Eine individuelle Integration passt bei privaten Daten, spezifischen Freigaben, komplexen Systemzugriffen oder organisationsspezifischer Orchestrierung. Sokosumi passt für sofort nutzbare Coworker und klar definierte Ergebnisse."],
      ]),
    ],
    "serviceplan-ai",
  ),

  page(
    "serviceplan-ai/ai-coworkers",
    "Serviceplan AI Coworkers on Sokosumi",
    "How Serviceplan's AI Coworkers Hannah and Elena work on Sokosumi, what they deliver, how they hand off tasks and how they differ from general AI chat.",
    [
      hero(
        "Serviceplan AI Coworkers",
        "Hannah and Elena turn the House of AI into day-to-day work",
        "The first small-business offer from Serviceplan's House of AI pairs a research partner with an account and project partner on Sokosumi.",
      ),
      featureGrid("Two roles, one visible workflow", [
        ["Hannah: Marketing Research Partner", "Market sizing, competitor landscapes, audience profiles, positioning and go-to-market research grounded in premium sources."],
        ["Elena: Account & Project Partner", "Triage, scoping, prioritisation, budget clarity, task coordination and quality control across people and agents."],
        ["Sokosumi: the shared workplace", "Briefs, hand-offs, task status and deliverables remain visible instead of disappearing into a hidden chain of agent calls."],
      ]),
      richText(`## The first SME offer from the House of AI
Serviceplan Group announced Hannah and Elena in March 2026 as the first House of AI offer designed for small and medium-sized businesses. The [official release](${SOURCE.coworkers}) positions Sokosumi as the self-service platform for standardised AI agents and names research, project steering and operational execution as the initial jobs.

Hannah can use data sources including Statista, GWI, dpa and DataForSEO. Her role is not just to collect links: the product promise includes methodology, contradictory evidence and an explicit view when the data supports one. Elena owns the operating layer. She challenges timing and scope, breaks work into tasks and coordinates other agents when needed.`),
      steps("What happens after a brief", "The workflow is designed to resemble accountable team delivery more than a disposable chat session.", [
        ["You state the outcome", "Describe the decision, deliverable, deadline and context in plain language rather than engineering a long prompt."],
        ["Elena scopes the work", "She identifies missing inputs, separates human decisions from agent tasks and organises the work on the task board."],
        ["Hannah researches when needed", "Research tasks are handed to Hannah with the delegation visible. Her output includes sources, caveats and a professional assessment."],
        ["The file returns to the team", "The result arrives as a reusable deliverable such as a document, spreadsheet, deck or dashboard, with the task history attached."],
      ]),
      richText(`## Why this is different from a general AI chat
A general assistant is useful for drafting and brainstorming. The Serviceplan Coworker model adds a named role, repeatable jobs, paid data access, task state, delegation and a defined output. That does not make every answer automatically correct. It makes the process easier to inspect and the responsibility easier to assign.

Serviceplan's [practitioner introduction](${SOURCE.coworkerBlog}) describes Hannah and Elena handing work back and forth by email while the user stays copied and the task board records the flow. On Sokosumi, additional coworkers and specialist agents can join the same work. [Browse current AI coworkers](/ai-coworkers).`),
      checklist("A good first task", "Start with a bounded decision or deliverable, not a request to 'do our marketing'.", [
        "Name the business question and who will use the answer",
        "Share constraints, known evidence and the deadline",
        "State the file or decision you expect at the end",
        "Ask for assumptions, source gaps and contradictory evidence",
        "Keep approval of strategy, claims and publication with a responsible person",
      ]),
      faq("Serviceplan AI Coworker questions", [
        ["Who are Hannah and Elena?", "Hannah is a Marketing Research Partner. Elena is an Account and Project Partner. Serviceplan launched them as its first AI Coworkers for smaller businesses on Sokosumi in March 2026."],
        ["Which data can Hannah use?", "Serviceplan names Statista, GWI Spark, Consumer Insights, DataForSEO and XAPI in its public materials. Availability can depend on the specific task and product configuration."],
        ["Can Elena do research herself?", "Her documented role is project and account management. When research is needed, she delegates to Hannah and keeps the hand-off visible."],
        ["Are the coworkers employees?", "No. They are AI systems presented through named professional roles. A human remains responsible for decisions, approvals and how the output is used."],
      ]),
    ],
    "Serviceplan AI Coworker auf Sokosumi",
    "So arbeiten Serviceplans AI Coworker Hannah und Elena auf Sokosumi, was sie liefern, wie sie Tasks übergeben und was sie von allgemeinem KI-Chat unterscheidet.",
    [
      hero(
        "Serviceplan AI Coworker",
        "Hannah und Elena bringen das House of AI in den Arbeitsalltag",
        "Das erste KMU-Angebot aus Serviceplans House of AI verbindet eine Research-Partnerin mit einer Account- und Projektpartnerin auf Sokosumi.",
      ),
      featureGrid("Zwei Rollen, ein sichtbarer Ablauf", [
        ["Hannah: Marketing Research Partner", "Marktgrößen, Wettbewerbslandschaften, Zielgruppen, Positionierung und Go-to-Market-Research auf Basis professioneller Datenquellen."],
        ["Elena: Account & Project Partner", "Triage, Scoping, Priorisierung, Budgettransparenz, Task-Koordination und Qualitätssicherung über Menschen und Agents hinweg."],
        ["Sokosumi: der gemeinsame Arbeitsplatz", "Briefings, Übergaben, Task-Status und Ergebnisse bleiben sichtbar, statt in einer verborgenen Kette von Agent-Aufrufen zu verschwinden."],
      ]),
      richText(`## Das erste KMU-Angebot aus dem House of AI
Die Serviceplan Group kündigte Hannah und Elena im März 2026 als erstes House-of-AI-Angebot für kleine und mittlere Unternehmen an. Die [offizielle Mitteilung](${SOURCE.coworkers}) beschreibt Sokosumi als Self-Service-Plattform für standardisierte KI-Agenten und nennt Research, Projektsteuerung und operative Umsetzung als erste Aufgabenfelder.

Hannah kann Datenquellen wie Statista, GWI, dpa und DataForSEO nutzen. Ihre Rolle endet nicht beim Sammeln von Links: Zur Produktidee gehören Methodik, widersprüchliche Evidenz und eine klare Einschätzung, wenn die Daten eine zulassen. Elena verantwortet die operative Ebene. Sie hinterfragt Timing und Umfang, zerlegt Arbeit in Tasks und koordiniert bei Bedarf weitere Agents.`),
      steps("Was nach dem Briefing passiert", "Der Ablauf orientiert sich eher an nachvollziehbarer Teamarbeit als an einer wegwerfbaren Chat-Session.", [
        ["Sie beschreiben das Ergebnis", "Formulieren Sie Entscheidung, Deliverable, Deadline und Kontext in normaler Sprache, statt einen langen Prompt zu konstruieren."],
        ["Elena strukturiert die Arbeit", "Sie erkennt fehlende Inputs, trennt menschliche Entscheidungen von Agent-Aufgaben und organisiert die Arbeit auf dem Task Board."],
        ["Hannah recherchiert bei Bedarf", "Research wird sichtbar an Hannah übergeben. Ihr Ergebnis enthält Quellen, Einschränkungen und eine fachliche Einschätzung."],
        ["Die Datei kommt ins Team zurück", "Das Resultat liegt als weiterverwendbares Dokument, Spreadsheet, Deck oder Dashboard vor; die Task-Historie bleibt damit verbunden."],
      ]),
      richText(`## Der Unterschied zu allgemeinem KI-Chat
Ein allgemeiner Assistent ist nützlich für Entwürfe und Brainstorming. Das Serviceplan-Coworker-Modell ergänzt eine benannte Rolle, wiederholbare Aufgaben, kostenpflichtige Datenquellen, Task-Status, Delegation und ein definiertes Ergebnis. Das macht nicht automatisch jede Antwort richtig. Es macht den Prozess aber leichter prüfbar und Verantwortung klarer zuordenbar.

Serviceplans [Praxisbeitrag](${SOURCE.coworkerBlog}) beschreibt, wie Hannah und Elena Arbeit per E-Mail übergeben, während die Nutzerin oder der Nutzer im CC bleibt und das Task Board den Ablauf dokumentiert. Auf Sokosumi können weitere Coworker und spezialisierte Agents hinzukommen. [Aktuelle AI Coworker ansehen](/de/ai-coworkers).`),
      checklist("Ein guter erster Task", "Beginnen Sie mit einer begrenzten Entscheidung oder einem konkreten Deliverable — nicht mit 'Mach unser Marketing'.", [
        "Geschäftsfrage und Empfänger des Ergebnisses benennen",
        "Rahmenbedingungen, bekannte Evidenz und Deadline teilen",
        "Datei oder Entscheidung am Ende klar festlegen",
        "Nach Annahmen, Datenlücken und widersprüchlicher Evidenz fragen",
        "Strategie, Claims und Veröffentlichung durch einen verantwortlichen Menschen freigeben lassen",
      ]),
      faq("Fragen zu Serviceplan AI Coworkern", [
        ["Wer sind Hannah und Elena?", "Hannah ist Marketing Research Partnerin. Elena ist Account- und Projektpartnerin. Serviceplan startete sie im März 2026 als erste AI Coworker für kleinere Unternehmen auf Sokosumi."],
        ["Welche Daten kann Hannah nutzen?", "Serviceplan nennt Statista, GWI Spark, Consumer Insights, DataForSEO und XAPI. Die Verfügbarkeit kann vom konkreten Task und der Produktkonfiguration abhängen."],
        ["Kann Elena selbst recherchieren?", "Ihre dokumentierte Rolle ist Account- und Projektmanagement. Wenn Research nötig ist, delegiert sie an Hannah und hält die Übergabe sichtbar."],
        ["Sind die Coworker Mitarbeitende?", "Nein. Es sind KI-Systeme, die über benannte professionelle Rollen zugänglich werden. Ein Mensch bleibt für Entscheidungen, Freigaben und die Verwendung der Ergebnisse verantwortlich."],
      ]),
    ],
    "serviceplan-ai",
  ),

  page(
    "serviceplan-ai/masumi-sokosumi-kodosumi",
    "Masumi, Sokosumi and Kodosumi explained",
    "How Serviceplan and NMKR's Masumi protocol, Kodosumi deployment layer and Sokosumi marketplace fit together for accountable AI-agent work and delivery.",
    [
      hero(
        "Serviceplan's agent infrastructure",
        "Masumi, Kodosumi and Sokosumi solve different layers",
        "One establishes trust and settlement, one runs agents, and one gives people a workplace for finding and briefing them.",
      ),
      featureGrid("The three layers", [
        ["Masumi: protocol", "Agent identity, payment escrow, job-state evidence and accountable settlement for services performed by independent agents."],
        ["Kodosumi: deployment", "Infrastructure for packaging and operating agent services so they can be reached reliably by products and other agents."],
        ["Sokosumi: marketplace and workplace", "A human-facing product for discovery, briefing, task management, delegation and deliverables."],
      ]),
      richText(`## Why three products exist
An agent marketplace needs more than a directory. Providers need a way to run services; buyers need a usable interface; both sides need rules for payment and evidence that a job reached a defined state. Serviceplan and NMKR split those concerns rather than hiding them in one proprietary application.

The [official Plan.Net Masumi page](${SOURCE.masumi}) describes Masumi as the trust and payment layer for Agentic Services. The [Sokosumi launch announcement](${SOURCE.sokosumi}) then presents the marketplace as the business-facing access point, following Masumi and Kodosumi in the stack.`),
      steps("A task through the stack", "The exact technical path depends on the provider, but the responsibilities remain distinct.", [
        ["Choose and brief", "A buyer finds a coworker or specialist agent in Sokosumi and submits the task, context and expected output."],
        ["Run", "The agent service executes on its hosting or deployment environment; Kodosumi is one deployment option in the ecosystem."],
        ["Coordinate", "Sokosumi tracks the task and can expose hand-offs between coworkers or specialist agents to the user."],
        ["Settle and record", "Masumi handles the payment and job-state protocol so completion, payout or refund follows explicit rules."],
      ]),
      richText(`## The partnership behind Masumi
NMKR and Serviceplan Group introduced Masumi in 2024 and later announced a strategic partnership with the Cardano Foundation. [NMKR's project account](${SOURCE.nmkr}) publishes historical network and adoption figures for January to October 2025. Those numbers are useful evidence of activity, but they are provider-published and time-bounded rather than current audited market share.

Masumi is intentionally usable beyond Sokosumi. The protocol can support agents built with different frameworks and sold through different interfaces. Sokosumi is one commercial marketplace on top of that network and is operated by Plan.Net Germany.`),
      checklist("Questions for an agent infrastructure review", "The product names alone do not answer architecture, security or compliance questions.", [
        "Which data leaves the customer environment and which model providers receive it",
        "Where agent code runs and how provider access is isolated",
        "What job state triggers payment, payout or refund",
        "Which evidence is public, on-chain, private or retained by the application",
        "Who can stop, retry, dispute or approve a task",
      ]),
      faq("Masumi, Kodosumi and Sokosumi questions", [
        ["Is Masumi the same as Sokosumi?", "No. Masumi is an agent identity, payment and job-state protocol. Sokosumi is a marketplace and workplace that uses Masumi infrastructure."],
        ["What does Kodosumi do?", "Kodosumi is the deployment layer in the ecosystem. It is intended to package and operate agent services so products and other agents can call them reliably."],
        ["Who built the stack?", "Serviceplan Group and NMKR jointly developed Masumi and Sokosumi. Plan.Net Studios is the Serviceplan unit publicly associated with Sokosumi; the Cardano Foundation is a strategic Masumi partner."],
        ["Does using blockchain make an agent accurate?", "No. The protocol can make identity, payment and job state more accountable. It does not prove that a model's output is factually correct; source quality, evaluation and human review remain separate."],
      ]),
    ],
    "Masumi, Sokosumi und Kodosumi erklärt",
    "So greifen Masumi-Protokoll, Kodosumi-Deployment und Sokosumi-Marktplatz von Serviceplan und NMKR für nachvollziehbare KI-Agentenarbeit ineinander.",
    [
      hero(
        "Serviceplans Agent-Infrastruktur",
        "Masumi, Kodosumi und Sokosumi lösen verschiedene Ebenen",
        "Eine Ebene schafft Vertrauen und Abrechnung, eine betreibt Agents, und eine gibt Menschen einen Arbeitsplatz für Auswahl und Briefing.",
      ),
      featureGrid("Die drei Ebenen", [
        ["Masumi: Protokoll", "Agentenidentität, Zahlungs-Escrow, Nachweise zum Jobstatus und nachvollziehbare Abrechnung für Leistungen unabhängiger Agents."],
        ["Kodosumi: Deployment", "Infrastruktur zum Verpacken und Betreiben von Agent-Services, damit Produkte und andere Agents sie verlässlich erreichen können."],
        ["Sokosumi: Marktplatz und Arbeitsplatz", "Ein Produkt für Menschen mit Auswahl, Briefing, Task-Management, Delegation und Ergebnissen."],
      ]),
      richText(`## Warum es drei Produkte gibt
Ein Marktplatz für Agents braucht mehr als ein Verzeichnis. Anbieter müssen Services betreiben, Käufer brauchen eine brauchbare Oberfläche, und beide Seiten benötigen Regeln für Zahlung sowie Nachweise über einen definierten Jobstatus. Serviceplan und NMKR trennen diese Aufgaben, statt sie in einer proprietären Anwendung zu verstecken.

Die [offizielle Masumi-Seite von Plan.Net](${SOURCE.masumi}) beschreibt Masumi als Vertrauens- und Zahlungsschicht für Agentic Services. Die [Sokosumi-Launch-Mitteilung](${SOURCE.sokosumi}) positioniert den Marktplatz anschließend als Zugang für Unternehmen — aufbauend auf Masumi und Kodosumi.`),
      steps("Ein Task durch den Stack", "Der genaue technische Pfad hängt vom Anbieter ab; die Verantwortungsbereiche bleiben jedoch getrennt.", [
        ["Auswählen und briefen", "Ein Käufer findet auf Sokosumi einen Coworker oder spezialisierten Agent und beschreibt Aufgabe, Kontext und erwartetes Ergebnis."],
        ["Ausführen", "Der Agent-Service läuft in seiner Hosting- oder Deployment-Umgebung; Kodosumi ist eine Deployment-Option im Ökosystem."],
        ["Koordinieren", "Sokosumi verfolgt den Task und kann Übergaben zwischen Coworkern oder spezialisierten Agents für Nutzer sichtbar machen."],
        ["Abrechnen und festhalten", "Masumi regelt Zahlung und Jobstatus, damit Abschluss, Auszahlung oder Rückerstattung expliziten Regeln folgen."],
      ]),
      richText(`## Die Partnerschaft hinter Masumi
NMKR und Serviceplan Group stellten Masumi 2024 vor und kündigten später eine strategische Partnerschaft mit der Cardano Foundation an. [NMKRs Projektbericht](${SOURCE.nmkr}) veröffentlicht historische Netzwerk- und Nutzungszahlen für Januar bis Oktober 2025. Diese Werte belegen Aktivität, sind aber zeitlich begrenzte Anbieterangaben und kein aktueller auditierter Marktanteil.

Masumi ist bewusst über Sokosumi hinaus nutzbar. Das Protokoll kann Agents verschiedener Frameworks und Vertriebsoberflächen unterstützen. Sokosumi ist ein kommerzieller Marktplatz auf diesem Netzwerk und wird von Plan.Net Germany betrieben.`),
      checklist("Fragen für einen Infrastruktur-Review", "Die Produktnamen allein beantworten keine Architektur-, Sicherheits- oder Compliance-Frage.", [
        "Welche Daten die Kundenumgebung verlassen und welche Modellanbieter sie erhalten",
        "Wo Agent-Code läuft und wie Zugriffe der Anbieter isoliert werden",
        "Welcher Jobstatus Zahlung, Auszahlung oder Rückerstattung auslöst",
        "Welche Nachweise öffentlich, on-chain, privat oder nur in der Anwendung gespeichert sind",
        "Wer einen Task stoppen, wiederholen, anfechten oder freigeben kann",
      ]),
      faq("Fragen zu Masumi, Kodosumi und Sokosumi", [
        ["Ist Masumi dasselbe wie Sokosumi?", "Nein. Masumi ist ein Protokoll für Agentenidentität, Zahlungen und Jobstatus. Sokosumi ist ein Marktplatz und Arbeitsplatz, der Masumi-Infrastruktur nutzt."],
        ["Was macht Kodosumi?", "Kodosumi ist die Deployment-Schicht des Ökosystems. Sie soll Agent-Services verpacken und betreiben, damit Produkte und andere Agents sie verlässlich aufrufen können."],
        ["Wer hat den Stack entwickelt?", "Serviceplan Group und NMKR entwickelten Masumi und Sokosumi gemeinsam. Plan.Net Studios ist die öffentlich mit Sokosumi verbundene Serviceplan-Einheit; die Cardano Foundation ist strategischer Partner von Masumi."],
        ["Macht Blockchain einen Agent korrekt?", "Nein. Das Protokoll kann Identität, Zahlung und Jobstatus nachvollziehbarer machen. Es beweist nicht, dass ein Modellergebnis faktisch richtig ist; Quellenqualität, Evaluation und menschliches Review bleiben eigene Aufgaben."],
      ]),
    ],
    "serviceplan-ai",
  ),

  page(
    "serviceplan-ai/partnerships-and-cases",
    "Serviceplan AI partnerships and cases",
    "Verified Serviceplan AI partnerships and public cases: Luma AI, NMKR, Cardano Foundation, GWI, AMBOSS, Akkio, Animal Alerts and the evidence behind them.",
    [
      hero(
        "Serviceplan AI proof",
        "Partnerships, products and cases that are actually public",
        "A strict evidence map: what each partnership contributes, which outcomes are documented, and which common claims remain unverified.",
      ),
      featureGrid("The verified partners", [
        ["Luma AI", "Group-wide creative-AI technology partner for video, motion, 3D and production workflows, announced in February 2026."],
        ["NMKR and Cardano Foundation", "NMKR co-built Masumi and Sokosumi; the Cardano Foundation entered a strategic partnership around the Masumi network."],
        ["GWI and research providers", "GWI made consumer data available through Sokosumi; Serviceplan also names Statista, dpa and DataForSEO for coworker research."],
        ["AMBOSS", "HealthContent.AI combines Serviceplan Content Health workflows with AMBOSS medical evidence."],
        ["Akkio", "Technology partner behind Mediaplus' Plus.AI operating system for media planning."],
        ["Microsoft Azure", "Serviceplan Agents states that its services are hosted in Germany on Azure; this is hosting, not evidence of a wider Microsoft AI partnership."],
      ]),
      richText(`## What a logo does and does not prove
Partner logos often mix formal strategic relationships, technology suppliers, data subscriptions and ordinary integrations. This page includes only relationships for which a public source describes the work. Serviceplan's Agentic Services page also displays Adobe, Google, Salesforce, OpenAI, SAP and Microsoft logos, but a logo alone does not establish a formal AI partnership.

The clearest group-wide technology announcement is [Luma AI](${SOURCE.luma}). The clearest infrastructure collaboration is the NMKR and Serviceplan work on Masumi and Sokosumi, followed by the [Cardano Foundation partnership](${SOURCE.masumiPartner}). The [GWI announcement](${SOURCE.gwi}) documents consumer data and agent-to-agent orchestration on Sokosumi.`),
      richText(`## Public cases and results
**Animal Alerts** is the most clearly documented AI-related award case in the reviewed Serviceplan material. The work used pet biometric data and AI-based detection to identify possible earthquake warning signals. Serviceplan reports Cannes Lions recognition in both 2024 and 2025. [See the 2025 Cannes record](${SOURCE.cannes2025}).

The wider network won Independent Network of the Year at Cannes Lions 2025 and reported 501 awards in FY 2025/26. Those figures show agency performance, not the causal effect of the House of AI. Likewise, the group's fee revenue and employee count demonstrate scale, not AI ROI. Product-level claims such as SP Gen AI's 'up to 25%' cost reduction should remain attributed to the provider unless a client or independent evaluation publishes the method and baseline.`),
      checklist("Claims excluded from this guide", "No primary evidence was found for these statements as of 26 August 2026.", [
        "A formal AI partnership with OpenAI, Google, Adobe, NVIDIA, Meta or Salesforce based only on a displayed logo",
        "A group Chief AI Officer or one person who owns every Serviceplan AI initiative",
        "A published group-wide AI ethics code or a percentage of staff trained in AI",
        "A Serviceplan Group Ventures entity or a verified cash-investment total for Masumi",
        "A universal ROI, accuracy score or productivity lift for the House of AI",
      ]),
      steps("How to read Serviceplan AI evidence", "Use a simple hierarchy before repeating a claim.", [
        ["Primary announcement", "Prefer a dated Serviceplan, partner or client page that names the relationship, people and scope."],
        ["Product documentation", "Use current product pages for capabilities, pricing, workflows and technical boundaries, with the date recorded."],
        ["Client or independent result", "Treat a measured outcome as stronger when the client, method, baseline and period are named."],
        ["Provider claim", "Keep maximum savings, scale and compliance statements attributed when no independent evidence is public."],
      ]),
      faq("Partnership and case questions", [
        ["Is Luma AI a Serviceplan partner?", "Yes. Serviceplan Group announced Luma AI as its group-wide creative-AI technology partner in February 2026."],
        ["Is OpenAI a formal Serviceplan partner?", "The Agentic Services page displays an OpenAI logo, but no separate formal partnership announcement was found in the reviewed sources. It is safer to describe it as a shown technology relationship, not a verified strategic partnership."],
        ["Which Serviceplan campaign is a documented AI case?", "Animal Alerts is the clearest example in the reviewed award material. It used pet biometric data and AI-based analysis in an earthquake-warning concept and received Cannes Lions recognition."],
        ["Do Serviceplan's awards prove its AI systems work?", "No. Network and campaign awards demonstrate broad agency performance. Only an award tied to a documented AI case is evidence about that specific work, and even then it is not a general ROI benchmark."],
      ]),
    ],
    "Serviceplan KI: Partnerschaften und Cases",
    "Verifizierte Serviceplan-KI-Partnerschaften und öffentliche Cases: Luma AI, NMKR, Cardano Foundation, GWI, AMBOSS, Akkio, Animal Alerts und ihre Belege.",
    [
      hero(
        "Belege für Serviceplans KI-Arbeit",
        "Partnerschaften, Produkte und Cases, die öffentlich dokumentiert sind",
        "Eine strenge Evidenzkarte: Was die Partner beitragen, welche Ergebnisse belegt sind und welche verbreiteten Aussagen offenbleiben.",
      ),
      featureGrid("Die verifizierten Partner", [
        ["Luma AI", "Gruppenweiter Technologiepartner für Creative AI in Video, Motion, 3D und Produktionsworkflows, angekündigt im Februar 2026."],
        ["NMKR und Cardano Foundation", "NMKR entwickelte Masumi und Sokosumi mit; die Cardano Foundation ging eine strategische Partnerschaft zum Masumi-Netzwerk ein."],
        ["GWI und Research-Anbieter", "GWI machte Konsumentendaten über Sokosumi verfügbar; für Coworker-Research nennt Serviceplan außerdem Statista, dpa und DataForSEO."],
        ["AMBOSS", "HealthContent.AI verbindet Workflows von Serviceplan Content Health mit medizinischer Evidenz von AMBOSS."],
        ["Akkio", "Technologiepartner hinter Mediaplus' Plus.AI-Betriebssystem für Mediaplanung."],
        ["Microsoft Azure", "Serviceplan Agents nennt Hosting in Deutschland auf Azure. Das ist Hosting, kein Beleg für eine weitergehende Microsoft-KI-Partnerschaft."],
      ]),
      richText(`## Was ein Logo belegt — und was nicht
Partnerlogos können strategische Beziehungen, Technologieanbieter, Datenabonnements und normale Integrationen vermischen. Diese Seite nimmt nur Beziehungen auf, für die eine öffentliche Quelle die Zusammenarbeit beschreibt. Die Agentic-Services-Seite zeigt außerdem Logos von Adobe, Google, Salesforce, OpenAI, SAP und Microsoft. Ein Logo allein belegt jedoch keine formelle KI-Partnerschaft.

Die klarste gruppenweite Technologieankündigung betrifft [Luma AI](${SOURCE.luma}). Die deutlichste Infrastrukturzusammenarbeit ist die Arbeit von NMKR und Serviceplan an Masumi und Sokosumi, ergänzt durch die [Partnerschaft mit der Cardano Foundation](${SOURCE.masumiPartner}). Die [GWI-Mitteilung](${SOURCE.gwi}) dokumentiert Konsumentendaten und Agent-to-Agent-Orchestrierung auf Sokosumi.`),
      richText(`## Öffentliche Cases und Ergebnisse
**Animal Alerts** ist im geprüften Serviceplan-Material der am klarsten dokumentierte KI-bezogene Award-Case. Das Projekt nutzte biometrische Daten von Haustieren und KI-basierte Erkennung, um mögliche Erdbebenwarnungen zu identifizieren. Serviceplan berichtet Cannes-Lions-Auszeichnungen 2024 und 2025. [Zur Cannes-Bilanz 2025](${SOURCE.cannes2025}).

Das Netzwerk wurde 2025 Independent Network of the Year und meldete für 2025/26 insgesamt 501 Awards. Diese Zahlen belegen die Agenturleistung, nicht die kausale Wirkung des House of AI. Auch Honorarumsatz und Mitarbeiterzahl zeigen Größe, keinen KI-ROI. Produktangaben wie 'bis zu 25 Prozent' Kostensenkung durch SP Gen AI sollten dem Anbieter zugeschrieben bleiben, solange Kunde, Methode und Baseline nicht unabhängig veröffentlicht sind.`),
      checklist("Nicht übernommene Aussagen", "Für diese Aussagen fand sich bis zum 26. August 2026 kein Primärbeleg.", [
        "Eine formelle KI-Partnerschaft mit OpenAI, Google, Adobe, NVIDIA, Meta oder Salesforce allein aufgrund eines angezeigten Logos",
        "Ein Group Chief AI Officer oder eine Person, die alle Serviceplan-KI-Initiativen verantwortet",
        "Ein veröffentlichter gruppenweiter KI-Ethikkodex oder eine Quote KI-geschulter Mitarbeitender",
        "Eine Gesellschaft namens Serviceplan Group Ventures oder eine bestätigte Summe direkter Investitionen in Masumi",
        "Ein universeller ROI-, Genauigkeits- oder Produktivitätswert für das House of AI",
      ]),
      steps("Wie Serviceplan-KI-Belege einzuordnen sind", "Eine einfache Hierarchie verhindert, dass Claims ungeprüft weitergetragen werden.", [
        ["Primärmitteilung", "Bevorzugen Sie eine datierte Seite von Serviceplan, Partner oder Kunde, die Beziehung, Personen und Umfang nennt."],
        ["Produktdokumentation", "Nutzen Sie aktuelle Produktseiten für Funktionen, Preise, Workflows und technische Grenzen und notieren Sie das Datum."],
        ["Kunden- oder unabhängiges Ergebnis", "Ein Messergebnis ist stärker, wenn Kunde, Methode, Baseline und Zeitraum genannt sind."],
        ["Anbieterangabe", "Maximale Einsparungen, Größen- und Compliance-Aussagen bleiben zugeschrieben, wenn keine unabhängige Evidenz öffentlich ist."],
      ]),
      faq("Fragen zu Partnerschaften und Cases", [
        ["Ist Luma AI Partner von Serviceplan?", "Ja. Die Serviceplan Group kündigte Luma AI im Februar 2026 als gruppenweiten Technologiepartner für Creative AI an."],
        ["Ist OpenAI ein formeller Serviceplan-Partner?", "Die Agentic-Services-Seite zeigt ein OpenAI-Logo, aber in den geprüften Quellen fand sich keine separate formelle Partnerschaftsankündigung. Daher ist eine angezeigte Technologiebeziehung die präzisere Beschreibung."],
        ["Welcher Serviceplan-Case ist als KI-Projekt dokumentiert?", "Animal Alerts ist das klarste Beispiel im geprüften Award-Material. Das Projekt nutzte biometrische Daten von Haustieren und KI-basierte Analyse für ein Erdbebenwarnkonzept."],
        ["Beweisen Serviceplans Awards die Wirksamkeit seiner KI-Systeme?", "Nein. Netzwerk- und Kampagnenawards belegen allgemeine Agenturleistung. Nur ein Award für einen dokumentierten KI-Case sagt etwas über dieses Projekt aus und ist trotzdem kein allgemeiner ROI-Benchmark."],
      ]),
    ],
    "serviceplan-ai",
  ),

  page(
    "serviceplan-ai/timeline-and-sources",
    "Serviceplan AI timeline and sources",
    "A dated, source-linked Serviceplan AI timeline from Agentic Services and Masumi to House of AI, Luma AI, AI Coworkers, Behave.AI, Plus.AI and Plan.Net.",
    [
      hero(
        "Serviceplan AI timeline",
        "From agent infrastructure to a group-wide operating model",
        "The dated record shows how protocols, products, agency services and partnerships accumulated into the House of AI.",
      ),
      steps("2024–2026", "Dates follow public announcements. Where sources disagree, the ambiguity is stated instead of resolved by guesswork.", [
        ["2024: Agentic Services and Masumi", "Plan.Net publicly described Agentic Services and introduced Masumi with NMKR. A December partnership with the Cardano Foundation followed."],
        ["2025: House of AI and Sokosumi", "The group reported the House of AI and a Global Data Hub across 25 markets. Plan.Net Studios and NMKR launched Sokosumi on 25 June."],
        ["Early 2026: creative scale and coworkers", "Luma AI became the creative-AI technology partner in February. Hannah and Elena launched as the first SME House-of-AI offer in March, followed by HealthContent.AI."],
        ["Mid 2026: media and dedicated units", "Mediaplus launched Behave.AI in May and Plus.AI in June. FY results in July named a dedicated Plan.Net Agentic AI business unit."],
      ]),
      richText(`## Dated source record
### 11 December 2024 — Cardano Foundation partnership
Serviceplan Group, NMKR and the Cardano Foundation announced strategic collaboration around the Masumi network. [Source](${SOURCE.masumiPartner}).

### 25 June 2025 — Sokosumi launch
Plan.Net Studios and NMKR launched the agent marketplace, following Masumi and Kodosumi. The announcement says Serviceplan also uses Sokosumi internally. [Source](${SOURCE.sokosumi}).

### 26 November 2025 — CMO Barometer 2026
In a survey of 805 marketing leaders across 15 markets, 68% named AI as the defining topic for 2026. This is market research, not a measure of Serviceplan product performance. [Source](${SOURCE.cmo}).

### 19 February 2026 — Luma AI partnership
Serviceplan announced group-wide adoption of Luma technology for creative workflows. [Source](${SOURCE.luma}).

### 3 March 2026 — Hannah and Elena
The first small-business offer from the House of AI launched on Sokosumi. [Source](${SOURCE.coworkers}).

### 17 March 2026 — HealthContent.AI
Serviceplan Content Health and AMBOSS introduced evidence-grounded medical content workflows. [Source](${SOURCE.health}).

### 21 May 2026 — Behave.AI
Mediaplus expanded its behavioural-science unit and productised Purchase.AI, Tribes.AI and Resonance.AI. [Source](${SOURCE.behave}).

### 30 July 2026 — group results
Serviceplan listed House of AI implementation, Luma AI, Behave.AI, Plus.AI and a new Plan.Net Agentic AI unit among the year's strategic milestones. [Source](${SOURCE.results}).`),
      featureGrid("What changed across the timeline", [
        ["Infrastructure became a product", "Masumi and Kodosumi created protocol and deployment layers; Sokosumi turned them into a workplace buyers could access."],
        ["Experiments became an operating model", "House of AI connected previously separate data, creative, media and agent initiatives under one architecture."],
        ["Partners became embedded capabilities", "Luma AI, Akkio, AMBOSS, GWI, NMKR and Cardano contribute different technical or data layers rather than one generic partner programme."],
        ["Enterprise work gained a self-service edge", "Custom Agentic Services remain, while AI Coworkers offer smaller teams defined roles and deliverables without a bespoke build."],
      ]),
      checklist("Source policy for this section", "The record is intentionally narrower than every claim found online.", [
        "Prefer official Serviceplan Group, agency, partner and product pages",
        "Use trade press when it contains a named launch detail missing from primary pages",
        "Label provider metrics and maximum savings as provider claims",
        "Do not turn logo walls into partnership announcements",
        "Record ambiguity instead of selecting the more impressive version",
      ]),
      faq("Timeline questions", [
        ["When did Serviceplan launch the House of AI?", "The group reported the House of AI ecosystem in its FY 2024/25 results, and the full public architecture was visible by late 2025 and 2026. No single separate launch date covers every component."],
        ["When did Sokosumi launch?", "Serviceplan Group's public announcement is dated 25 June 2025."],
        ["When did Serviceplan start Agentic Services?", "Serviceplan material associates the offer with 2024, while a Masumi re-publication carries a 2025 date. This guide treats the exact month as ambiguous and avoids a more precise claim."],
        ["How current is this guide?", "The source review and factual cutoff are 26 August 2026. Product capabilities, organisation and performance claims can change after that date."],
      ]),
    ],
    "Serviceplan KI: Timeline und Quellen",
    "Eine datierte, verlinkte Serviceplan-KI-Timeline von Agentic Services und Masumi bis House of AI, Luma AI, AI Coworker, Behave.AI, Plus.AI und Plan.Net.",
    [
      hero(
        "Serviceplan KI-Timeline",
        "Von Agent-Infrastruktur zum gruppenweiten Betriebsmodell",
        "Die datierte Entwicklung zeigt, wie Protokolle, Produkte, Agenturleistungen und Partnerschaften zum House of AI zusammengewachsen sind.",
      ),
      steps("2024–2026", "Die Daten folgen öffentlichen Mitteilungen. Wenn Quellen voneinander abweichen, bleibt die Unschärfe sichtbar.", [
        ["2024: Agentic Services und Masumi", "Plan.Net beschrieb Agentic Services und stellte Masumi gemeinsam mit NMKR vor. Im Dezember folgte die Partnerschaft mit der Cardano Foundation."],
        ["2025: House of AI und Sokosumi", "Die Gruppe berichtete über das House of AI und einen Global Data Hub in 25 Märkten. Plan.Net Studios und NMKR starteten Sokosumi am 25. Juni."],
        ["Anfang 2026: kreative Skalierung und Coworker", "Luma AI wurde im Februar Technologiepartner für Creative AI. Hannah und Elena starteten im März als erstes KMU-Angebot, gefolgt von HealthContent.AI."],
        ["Mitte 2026: Media und eigene Einheiten", "Mediaplus startete Behave.AI im Mai und Plus.AI im Juni. Der Jahresbericht nannte im Juli eine eigene Einheit Plan.Net Agentic AI."],
      ]),
      richText(`## Datierte Quellen
### 11. Dezember 2024 — Partnerschaft mit der Cardano Foundation
Serviceplan Group, NMKR und Cardano Foundation kündigten eine strategische Zusammenarbeit zum Masumi-Netzwerk an. [Quelle](${SOURCE.masumiPartner}).

### 25. Juni 2025 — Start von Sokosumi
Plan.Net Studios und NMKR starteten den Agent-Marktplatz als nächste Schicht nach Masumi und Kodosumi. Laut Mitteilung nutzt Serviceplan Sokosumi auch intern. [Quelle](${SOURCE.sokosumi}).

### 26. November 2025 — CMO Barometer 2026
In einer Befragung von 805 Marketingverantwortlichen in 15 Märkten nannten 68 Prozent KI als prägendes Thema für 2026. Das ist Marktforschung, kein Leistungsnachweis für Serviceplan-Produkte. [Quelle](${SOURCE.cmo}).

### 19. Februar 2026 — Partnerschaft mit Luma AI
Serviceplan kündigte den gruppenweiten Einsatz von Luma-Technologie in kreativen Workflows an. [Quelle](${SOURCE.luma}).

### 3. März 2026 — Hannah und Elena
Das erste KMU-Angebot aus dem House of AI startete auf Sokosumi. [Quelle](${SOURCE.coworkers}).

### 17. März 2026 — HealthContent.AI
Serviceplan Content Health und AMBOSS stellten medizinische Content-Workflows mit Evidenzbasis vor. [Quelle](${SOURCE.health}).

### 21. Mai 2026 — Behave.AI
Mediaplus baute seine Behavioral-Science-Einheit aus und bündelte Purchase.AI, Tribes.AI und Resonance.AI. [Quelle](${SOURCE.behave}).

### 30. Juli 2026 — Jahresergebnisse
Serviceplan nannte die Umsetzung des House of AI, Luma AI, Behave.AI, Plus.AI und eine neue Plan.Net-Agentic-AI-Einheit als strategische Meilensteine. [Quelle](${SOURCE.results}).`),
      featureGrid("Was sich entlang der Timeline verändert hat", [
        ["Infrastruktur wurde zum Produkt", "Masumi und Kodosumi schufen Protokoll- und Deployment-Schichten; Sokosumi machte sie als Arbeitsplatz zugänglich."],
        ["Experimente wurden zum Betriebsmodell", "Das House of AI verband zuvor getrennte Daten-, Kreativ-, Media- und Agent-Initiativen in einer Architektur."],
        ["Partner wurden zu eingebetteten Fähigkeiten", "Luma AI, Akkio, AMBOSS, GWI, NMKR und Cardano liefern unterschiedliche Technologie- oder Datenebenen statt eines generischen Partnerprogramms."],
        ["Enterprise bekam eine Self-Service-Kante", "Individuelle Agentic Services bleiben bestehen, während AI Coworker kleineren Teams definierte Rollen und Ergebnisse ohne Sonderentwicklung bieten."],
      ]),
      checklist("Quellenregeln für diesen Bereich", "Die Darstellung ist bewusst enger als die Gesamtheit aller auffindbaren Claims.", [
        "Offizielle Seiten von Serviceplan Group, Agenturen, Partnern und Produkten bevorzugen",
        "Fachpresse nutzen, wenn sie benannte Launch-Details enthält, die auf Primärseiten fehlen",
        "Anbieterkennzahlen und maximale Einsparungen als Anbieterangaben kennzeichnen",
        "Aus Logo-Wänden keine Partnerschaftsankündigungen ableiten",
        "Unschärfe dokumentieren, statt die eindrucksvollere Version auszuwählen",
      ]),
      faq("Fragen zur Timeline", [
        ["Wann startete Serviceplan das House of AI?", "Die Gruppe berichtete im Ergebnisjahr 2024/25 über das House-of-AI-Ökosystem; die vollständige öffentliche Architektur war Ende 2025 und 2026 sichtbar. Ein einzelnes Launch-Datum für alle Komponenten gibt es nicht."],
        ["Wann startete Sokosumi?", "Die öffentliche Mitteilung der Serviceplan Group ist auf den 25. Juni 2025 datiert."],
        ["Wann startete Serviceplan Agentic Services?", "Serviceplan-Material ordnet das Angebot 2024 zu, während eine Wiederveröffentlichung bei Masumi ein Datum 2025 trägt. Dieser Guide lässt den genauen Monat deshalb bewusst offen."],
        ["Wie aktuell ist der Guide?", "Quellenprüfung und Faktenstand enden am 26. August 2026. Produktfunktionen, Organisation und Leistungsangaben können sich danach ändern."],
      ]),
    ],
    "serviceplan-ai",
  ),

  page(
    "serviceplan-ai/ai-marketing-agency",
    "AI marketing agency: buyer guide",
    "What an AI marketing agency does, how delivery models differ, and what buyers should verify across data, rights, governance, measurement and human approval.",
    [
      hero(
        "AI marketing agency guide",
        "Choose the operating model, not the AI label",
        "A buyer-first guide to AI-enabled agencies, AI coworkers, custom agent systems and enterprise marketing transformation.",
      ),
      richText(`## What is an AI marketing agency?
An **AI marketing agency** applies AI inside real marketing delivery: insight, creative development, production, media activation, measurement or ongoing operations. That is broader than reselling a tool and more accountable than generating drafts in a chat window. A useful partner should be able to name the inputs, workflow, output, human approvals and measurement plan for each service.

Serviceplan's [House of AI](${SOURCE.house}) is one documented example of this broader model. It connects Insight.AI, Creative.AI, Activate.AI and Agentic.AI on a shared data foundation. That does not make every project the same. The right buying route depends on whether the need is a single task, a repeatable workflow, a custom system or an enterprise operating-model change.`),
      featureGrid("Four delivery models", [
        ["Single AI tool", "A team operates a focused product for research, copy, production or optimisation. Fast to adopt, but integration and governance stay with the buyer."],
        ["AI coworker", "A named role accepts a brief and returns a defined deliverable. Sokosumi is the self-service route for this kind of bounded work."],
        ["Custom agent system", "Agents connect private data, tools and approval steps for a company-specific workflow. Plan.Net Agentic Services sits in this category."],
        ["Enterprise transformation", "Operating model, architecture, implementation, production and ongoing operation change together. Plan.Net Agentic AI is positioned here."],
      ]),
      steps("How to evaluate an AI marketing agency", "Turn a broad capability claim into an inspectable delivery plan.", [
        ["Start with the decision", "Define the business decision or finished asset, the user, deadline, baseline and success measure before discussing models."],
        ["Map data and rights", "List source systems, personal data, confidential material, training restrictions, licences, likeness rights and permitted model providers."],
        ["Design human control", "Name who approves evidence, strategy, brand, legal claims and publication; define escalation and incident handling."],
        ["Prove the result", "Ask for a test design, comparison baseline, failure log and outcome metric. Speed alone is not marketing effectiveness."],
      ]),
      checklist("Procurement questions worth asking", "The answers should be specific to the proposed system and deployment.", [
        "What exact deliverable, workflow and service level are included",
        "Which models, subprocessors, hosting regions and retention rules apply",
        "Who owns prompts, workflows, fine-tunes, source assets and generated work",
        "Where human review is mandatory and how corrections are recorded",
        "How quality, business impact, cost and risk are measured after launch",
        "What happens when a model, provider, law or source system changes",
      ]),
      richText(`## Compliance is a scoped claim
The European Commission says Article 50 transparency obligations under the EU AI Act apply from 2 August 2026, including duties around interactive AI and generated or manipulated content in specified situations. [Read the Commission guidance](${SOURCE.aiAct}). Applicability depends on the system and how it is deployed; this guide is not legal advice.

Serviceplan's [Business Partner Code of Conduct](${SOURCE.partnerCode}) requires partners using AI to comply with data-protection and security rules. That is useful governance evidence, but it is not a complete public responsible-AI policy or product-by-product security specification. Buyers should request the missing operational detail for their engagement.`),
      faq("AI marketing agency questions", [
        ["What does an AI marketing agency do?", "It uses AI in accountable marketing workflows such as research, strategy, creative production, media activation, measurement and operations, with defined inputs, outputs and human approvals."],
        ["Is an AI marketing agency the same as an AI tool?", "No. A tool supplies a capability. An agency or delivery partner is responsible for combining capabilities with data, process, expertise, approvals and measurement."],
        ["When should I use an AI coworker instead?", "Use a coworker for a bounded task and defined deliverable that does not require a bespoke system. Choose custom integration when private data, tools or organisation-specific approvals are central."],
        ["How should AI agency work be priced?", "Common models include project fees, retainers, usage-based software, credits and transformation programmes. Compare the complete delivery scope and measured outcome, not only model or token cost."],
      ]),
    ],
    "KI-Marketing-Agentur: Buyer-Guide",
    "Was eine KI-Marketing-Agentur leistet und was Käufer bei Delivery-Modellen, Daten, Rechten, Governance, Messung und Freigaben prüfen sollten.",
    [
      hero(
        "Guide zur KI-Marketing-Agentur",
        "Wählen Sie das Betriebsmodell, nicht das KI-Label",
        "Ein Buyer-Guide zu KI-gestützten Agenturen, AI Coworkern, individuellen Agent-Systemen und Enterprise-Transformation.",
      ),
      richText(`## Was ist eine KI-Marketing-Agentur?
Eine **KI-Marketing-Agentur** setzt KI in echter Marketing-Delivery ein: Insights, Kreation, Produktion, Media-Aktivierung, Messung oder laufender Betrieb. Das ist mehr als der Weiterverkauf eines Tools und verbindlicher als Entwürfe in einem Chatfenster. Ein belastbarer Partner sollte für jede Leistung Inputs, Workflow, Output, menschliche Freigaben und Messplan benennen.

Serviceplans [House of AI](${SOURCE.house}) ist ein dokumentiertes Beispiel für dieses breitere Modell. Es verbindet Insight.AI, Creative.AI, Activate.AI und Agentic.AI auf einer gemeinsamen Datenbasis. Trotzdem ist nicht jedes Projekt gleich. Der richtige Einkaufsweg hängt davon ab, ob eine einzelne Aufgabe, ein wiederholbarer Workflow, ein individuelles System oder eine Veränderung des Enterprise-Betriebsmodells gebraucht wird.`),
      featureGrid("Vier Delivery-Modelle", [
        ["Einzelnes KI-Tool", "Ein Team bedient ein fokussiertes Produkt für Research, Text, Produktion oder Optimierung. Schnell einsetzbar; Integration und Governance bleiben beim Käufer."],
        ["AI Coworker", "Eine benannte Rolle nimmt ein Briefing an und liefert ein definiertes Ergebnis. Sokosumi ist der Self-Service-Weg für solche begrenzten Arbeiten."],
        ["Individuelles Agent-System", "Agents verbinden private Daten, Tools und Freigaben in einem firmenspezifischen Workflow. Plan.Net Agentic Services gehört in diese Kategorie."],
        ["Enterprise-Transformation", "Betriebsmodell, Architektur, Implementierung, Produktion und laufender Betrieb verändern sich gemeinsam. Dafür ist Plan.Net Agentic AI positioniert."],
      ]),
      steps("So bewerten Sie eine KI-Marketing-Agentur", "Machen Sie aus einem breiten Capability-Claim einen prüfbaren Delivery-Plan.", [
        ["Mit der Entscheidung starten", "Definieren Sie Business-Entscheidung oder fertiges Asset, Nutzer, Deadline, Baseline und Erfolgsmaß vor der Modelldiskussion."],
        ["Daten und Rechte abbilden", "Listen Sie Quellsysteme, personenbezogene und vertrauliche Daten, Trainingsgrenzen, Lizenzen, Persönlichkeitsrechte und erlaubte Anbieter."],
        ["Menschliche Kontrolle planen", "Benennen Sie Freigaben für Evidenz, Strategie, Marke, rechtliche Claims und Veröffentlichung sowie Eskalation und Incident Handling."],
        ["Ergebnis belegen", "Fordern Sie Testdesign, Vergleichsbasis, Fehlerprotokoll und Outcome-Metrik. Geschwindigkeit allein ist keine Marketingwirkung."],
      ]),
      checklist("Fragen für den Einkauf", "Die Antworten müssen zum konkreten System und Einsatz passen.", [
        "Welches Ergebnis, welcher Workflow und welches Service Level sind enthalten",
        "Welche Modelle, Subprozessoren, Hosting-Regionen und Aufbewahrungsregeln gelten",
        "Wem Prompts, Workflows, Fine-Tunes, Quellassets und generierte Arbeit gehören",
        "Wo menschliches Review Pflicht ist und wie Korrekturen dokumentiert werden",
        "Wie Qualität, Business Impact, Kosten und Risiko nach dem Launch gemessen werden",
        "Was bei Wechseln von Modell, Anbieter, Rechtslage oder Quellsystem passiert",
      ]),
      richText(`## Compliance ist immer einsatzbezogen
Nach Angaben der Europäischen Kommission gelten die Transparenzpflichten aus Artikel 50 des EU AI Act seit 2. August 2026. Dazu gehören in bestimmten Situationen Pflichten für interaktive KI sowie generierte oder manipulierte Inhalte. [Zur Kommissions-Guidance](${SOURCE.aiAct}). Welche Regel greift, hängt von System und Einsatz ab; dieser Guide ist keine Rechtsberatung.

Serviceplans [Business Partner Code of Conduct](${SOURCE.partnerCode}) verlangt von Partnern beim KI-Einsatz die Einhaltung von Datenschutz- und Sicherheitsregeln. Das ist ein Governance-Beleg, aber keine vollständige öffentliche Responsible-AI-Policy oder Produktsicherheitsdokumentation. Diese Details sollten Käufer für ihr Projekt anfordern.`),
      faq("Fragen zur KI-Marketing-Agentur", [
        ["Was macht eine KI-Marketing-Agentur?", "Sie nutzt KI in verantwortbaren Marketing-Workflows wie Research, Strategie, Produktion, Media-Aktivierung, Messung und Operations — mit definierten Inputs, Outputs und Freigaben."],
        ["Ist eine KI-Marketing-Agentur dasselbe wie ein KI-Tool?", "Nein. Ein Tool liefert eine Fähigkeit. Eine Agentur oder ein Delivery-Partner verantwortet die Verbindung mit Daten, Prozessen, Expertise, Freigaben und Messung."],
        ["Wann passt ein AI Coworker besser?", "Für eine begrenzte Aufgabe mit definiertem Ergebnis ohne Sonderentwicklung. Individuelle Integration passt, wenn private Daten, Tools oder organisationsspezifische Freigaben zentral sind."],
        ["Wie wird KI-Agenturarbeit bepreist?", "Üblich sind Projektpreise, Retainer, nutzungsbasierte Software, Credits und Transformationsprogramme. Vergleichen Sie den vollständigen Leistungsumfang und das gemessene Ergebnis."],
      ]),
    ],
    "serviceplan-ai",
  ),

  page(
    "serviceplan-ai/ai-marketing-cases",
    "Serviceplan AI marketing cases",
    "A sourced library of Serviceplan AI marketing cases, separating the AI workflow, vendor-reported outcome, evidence owner and known limitations.",
    [
      hero(
        "Serviceplan AI cases",
        "What was done, what was reported, and what remains unproven",
        "Campaign, content-supply-chain, validation and operating-model cases with the evidence boundary kept visible.",
      ),
      featureGrid("Five kinds of case", [
        ["Campaign craft", "Coca-Cola, BMW Motorrad, Grana Padano, Swisscom and EFFIE A.I.WARDS used AI in creative or production workflows."],
        ["Content supply chain", "MAKELINE centralises planning, production, adaptation, review and asset management for high-volume programmes."],
        ["Audience and creative validation", "Mediaplus products model audiences or evaluate assets before activation; methodology matters as much as speed."],
        ["Media optimisation", "The House-of-AI media layer connects research, planning, activation and measurement products."],
        ["Operating-model transformation", "BMW/MINI Content Factory and MediaMarktSaturn MOMENTUM reorganise production across markets, not just individual prompts."],
      ]),
      richText(`## Creative campaign cases
For Coca-Cola's 2024 **Holidays Are Coming** work, Serviceplan describes custom generative workflows using historical brand assets from scripting through final edit and more than 100 localised versions across 24 markets. The [case page](${SOURCE.cocaCola}) reports an eight-week production, 20% of the usual budget and 90% faster delivery. It also displays impression figures that are not reconciled on the page, so this guide does not merge them into one result.

BMW Motorrad's [Discover the world](${SOURCE.bmwMotorrad}) combined studio photography, CGI and Serviceplan Generate.AI to turn national flags into landscapes; no outcome metric is published. Grana Padano's [Our Future has AI History](${SOURCE.grana}) used AI-generated faces and voices, with Serviceplan reporting 260 million reach and 332 million views. [Swisscom sure](${SOURCE.swisscom}) and [EFFIE A.I.WARDS](${SOURCE.effie}) document AI-assisted creative execution without proving that AI alone caused campaign performance.`),
      stats("Published vendor figures", [
        ["50%", "faster MAKELINE production reported"],
        ["30%", "MAKELINE cost saving reported"],
        ["26", "BMW/MINI European markets supplied"],
        ["11", "markets planned for MOMENTUM"],
      ]),
      richText(`## Production transformation cases
The [L'Oréal Belgium and Netherlands MAKELINE case](${SOURCE.makeline}) covers four divisions, 35 brands and more than 200 stakeholders. Serviceplan reports a 50,000-plus asset database, 5,500-plus annual projects, 50% faster production and 30% cost savings. The page does not provide an independent methodology or comparison period, so every figure remains vendor reported.

THE MARCOM ENGINE says its AI-supported [BMW and MINI Content Factory](${SOURCE.bmwContent}) supplies 26 European markets with MAKELINE as the central platform, but gives no public cost or time result. [MOMENTUM](${SOURCE.momentum}) is a newly announced joint production organisation for MediaMarktSaturn across 11 planned markets. It is a rollout, not a completed-results case.`),
      checklist("How this library scores evidence", "AI use and business outcome are recorded separately.", [
        "Name the client, workflow, markets and time period when the source does",
        "Attribute all case metrics to Serviceplan, Mediaplus or the named vendor",
        "Do not infer that AI caused reach, intent, ROI or award results",
        "Mark announced rollouts separately from completed programmes",
        "Keep unexplained metric conflicts visible instead of choosing one number",
      ]),
      faq("Serviceplan AI case questions", [
        ["Which Serviceplan AI case has the clearest production metrics?", "The MAKELINE case for L'Oréal publishes the broadest operational figures, but they are vendor reported and no independent method is included."],
        ["Did AI cause the reported campaign results?", "The public cases show that AI appeared in the workflow. They generally do not isolate AI as the cause of reach, purchase intent, ROI or awards."],
        ["Is MOMENTUM already a proven case?", "No. It is an announced joint operating model and rollout for MediaMarktSaturn. No completed performance result is public yet."],
        ["Why include cases with no result metric?", "They still document a real workflow and clarify what the technology did. Keeping 'method' separate from 'measured result' prevents invented proof."],
      ]),
    ],
    "Serviceplan KI-Marketing-Cases",
    "Eine belegte Sammlung von Serviceplan-KI-Cases, die Workflow, Anbieterergebnis, Evidenzinhaber und bekannte Grenzen getrennt darstellt.",
    [
      hero(
        "Serviceplan KI-Cases",
        "Was gemacht, berichtet und nicht bewiesen wurde",
        "Kampagnen-, Content-Supply-Chain-, Validierungs- und Betriebsmodell-Cases mit sichtbarer Evidenzgrenze.",
      ),
      featureGrid("Fünf Arten von Cases", [
        ["Campaign Craft", "Coca-Cola, BMW Motorrad, Grana Padano, Swisscom und EFFIE A.I.WARDS nutzten KI in Kreativ- oder Produktionsworkflows."],
        ["Content Supply Chain", "MAKELINE zentralisiert Planung, Produktion, Adaption, Review und Asset Management für Programme mit hohem Volumen."],
        ["Zielgruppen- und Kreativvalidierung", "Mediaplus-Produkte modellieren Zielgruppen oder bewerten Assets vor der Aktivierung; die Methodik ist so wichtig wie die Geschwindigkeit."],
        ["Media-Optimierung", "Die Media-Ebene des House of AI verbindet Research, Planung, Aktivierung und Messprodukte."],
        ["Betriebsmodell-Transformation", "BMW/MINI Content Factory und MediaMarktSaturn MOMENTUM organisieren marktübergreifende Produktion neu."],
      ]),
      richText(`## Kreative Kampagnen-Cases
Für Coca-Colas **Holidays Are Coming** 2024 beschreibt Serviceplan individuelle generative Workflows mit historischen Markenassets vom Skript bis zum finalen Edit sowie mehr als 100 lokalisierte Versionen in 24 Märkten. Die [Case-Seite](${SOURCE.cocaCola}) meldet acht Wochen Produktion, 20 Prozent des üblichen Budgets und 90 Prozent schnellere Delivery. Mehrere dort gezeigte Impression-Zahlen sind nicht aufgelöst; dieser Guide führt sie deshalb nicht zu einem Wert zusammen.

BMW Motorrads [Discover the world](${SOURCE.bmwMotorrad}) kombinierte Studiofotografie, CGI und Serviceplan Generate.AI; eine Ergebniskennzahl fehlt. Grana Padanos [Our Future has AI History](${SOURCE.grana}) nutzte KI-generierte Gesichter und Stimmen. Serviceplan meldet 260 Millionen Reichweite und 332 Millionen Views. [Swisscom sure](${SOURCE.swisscom}) und [EFFIE A.I.WARDS](${SOURCE.effie}) dokumentieren KI-gestützte Kreation, ohne zu beweisen, dass KI allein die Kampagnenwirkung verursacht hat.`),
      stats("Veröffentlichte Anbieterzahlen", [
        ["50%", "schnellere MAKELINE-Produktion gemeldet"],
        ["30%", "MAKELINE-Kosteneinsparung gemeldet"],
        ["26", "von der BMW/MINI Content Factory versorgte Märkte"],
        ["11", "für MOMENTUM geplante Märkte"],
      ]),
      richText(`## Cases zur Produktions-Transformation
Der [MAKELINE-Case für L'Oréal Belgien und Niederlande](${SOURCE.makeline}) umfasst vier Divisionen, 35 Marken und mehr als 200 Stakeholder. Serviceplan meldet über 50.000 Assets, mehr als 5.500 Projekte jährlich, 50 Prozent schnellere Produktion und 30 Prozent Kosteneinsparung. Eine unabhängige Methodik oder Vergleichsperiode fehlt; die Werte bleiben Anbieterangaben.

THE MARCOM ENGINE zufolge versorgt die KI-gestützte [BMW und MINI Content Factory](${SOURCE.bmwContent}) 26 europäische Märkte mit MAKELINE als zentraler Plattform, veröffentlicht aber kein Kosten- oder Zeitergebnis. [MOMENTUM](${SOURCE.momentum}) ist eine neu angekündigte gemeinsame Produktionsorganisation für MediaMarktSaturn in elf geplanten Märkten — ein Rollout, kein abgeschlossener Ergebnis-Case.`),
      checklist("Wie dieser Guide Evidenz bewertet", "KI-Nutzung und Business-Ergebnis werden getrennt erfasst.", [
        "Kunde, Workflow, Märkte und Zeitraum nennen, wenn die Quelle sie nennt",
        "Alle Case-Kennzahlen Serviceplan, Mediaplus oder dem genannten Anbieter zuschreiben",
        "Nicht ableiten, dass KI Reichweite, Kaufabsicht, ROI oder Awards verursacht hat",
        "Angekündigte Rollouts von abgeschlossenen Programmen trennen",
        "Unerklärte Zahlenkonflikte sichtbar lassen statt einen Wert auszuwählen",
      ]),
      faq("Fragen zu Serviceplan-KI-Cases", [
        ["Welcher Serviceplan-KI-Case hat die klarsten Produktionszahlen?", "Der MAKELINE-Case für L'Oréal veröffentlicht die breitesten operativen Werte. Sie sind jedoch Anbieterangaben ohne unabhängige Methodik."],
        ["Hat KI die gemeldeten Kampagnenergebnisse verursacht?", "Die öffentlichen Cases belegen KI im Workflow. Sie isolieren KI im Regelfall nicht als Ursache für Reichweite, Kaufabsicht, ROI oder Awards."],
        ["Ist MOMENTUM bereits ein bewiesener Case?", "Nein. Es ist ein angekündigtes gemeinsames Betriebsmodell und ein Rollout für MediaMarktSaturn; fertige Leistungswerte sind noch nicht öffentlich."],
        ["Warum Cases ohne Ergebniskennzahl aufnehmen?", "Sie dokumentieren trotzdem einen realen Workflow und die Rolle der Technologie. Die Trennung von Methode und Ergebnis verhindert erfundene Belege."],
      ]),
    ],
    "serviceplan-ai",
  ),

  page(
    "serviceplan-ai/serviceplan-generate-ai-makeline",
    "Serviceplan Generate.AI and MAKELINE",
    "How Serviceplan Generate.AI, MAKELINE, the Munich and San Francisco AI labs, BMW/MINI Content Factory and MOMENTUM differ and connect.",
    [
      hero(
        "Serviceplan Generate.AI and MAKELINE",
        "From creative experiments to a governed content supply chain",
        "The named systems solve different jobs. This guide maps the boundaries, deployments and public evidence.",
      ),
      featureGrid("Keep the systems distinct", [
        ["Generate.AI", "A controlled, modular environment for generative asset workflows and model or campaign fine-tuning, according to Serviceplan."],
        ["MAKELINE", "A content-supply-chain platform spanning planning, creation, adaptation, review, storage and delivery."],
        ["BMW/MINI Content Factory", "A production operation using MAKELINE as its central platform across 26 European markets."],
        ["MOMENTUM OS", "A modular operating system inside the newly announced MediaMarktSaturn joint production organisation."],
      ]),
      richText(`## Two labs, one documented collaboration
Serviceplan describes a Munich AI Lab and collaboration with Silverside AI's San Francisco lab. The [first-party account](${SOURCE.labs}) says the collaboration led to the rollout and first client deployments of **Serviceplan Generate.AI**, plus training for internal key users. It describes a modular environment in which Serviceplan controls data structures and claims GDPR compliance. That is a provider claim, not an external certification.

A second [Serviceplan account](${SOURCE.generate}) describes Generate.AI as multi-client capable, able to automate generation workflows and support fine-tuning for products and campaigns. The sources establish collaboration with Silverside; they do not establish an ownership relationship or a public technical architecture.`),
      steps("A content-supply-chain view", "Generation is one stage; production control spans the complete flow.", [
        ["Plan", "Campaigns, markets, variants, assets, rights and production requirements enter one structured brief."],
        ["Generate and produce", "Approved creative systems produce source assets and variants with human direction and quality control."],
        ["Adapt and review", "Teams localise, resize, version and approve content across brands, channels and markets."],
        ["Store and distribute", "Assets, feedback, status and delivery remain connected so the operation can be measured and improved."],
      ]),
      richText(`## MAKELINE in public deployments
The [L'Oréal MAKELINE case](${SOURCE.makeline}) covers four divisions, 35 brands and more than 200 stakeholders. Serviceplan reports more than 50,000 assets, 5,500-plus annual projects, 50% faster production and 30% savings, without publishing an independent comparison method. THE MARCOM ENGINE says the [BMW/MINI Content Factory](${SOURCE.bmwContent}) supplies 26 European markets using MAKELINE as the central platform.

[MOMENTUM](${SOURCE.momentum}) is different: a new joint organisation and modular operating system for MediaMarktSaturn, planned across 11 markets. Public sources do not say that MAKELINE or Generate.AI is part of MOMENTUM OS. The Luma AI partnership adds group-wide creative-generation technology, but its exact integration with these systems is not public.`),
      checklist("What is still not public", "A serious technical or procurement review must ask for these details directly.", [
        "Model providers, fine-tuning boundaries and subprocessor list",
        "Data retention, tenant isolation and security architecture",
        "Rights handling, provenance, disclosure and brand-safety controls by workflow",
        "The precise product relationship among Generate.AI, MAKELINE, Luma AI and MOMENTUM OS",
        "Audited performance, quality and compliance evidence for each deployment",
      ]),
      faq("Generate.AI and MAKELINE questions", [
        ["Is Generate.AI the same as MAKELINE?", "No. Generate.AI is described as a modular generative environment; MAKELINE is a broader content-supply-chain platform for planning, production, adaptation, review and delivery."],
        ["Who runs the Serviceplan AI labs?", "Serviceplan's account names its Munich AI Lab and Silverside AI's San Francisco lab as collaborators. It does not publish an ownership relationship between the companies."],
        ["Does MAKELINE have measured results?", "Serviceplan publishes speed, cost and satisfaction figures for the L'Oréal deployment. They are vendor reported and the public page does not provide an independent methodology."],
        ["Is MOMENTUM OS built on MAKELINE?", "The reviewed public sources do not say so. The systems should remain distinct until Serviceplan documents the technical relationship."],
      ]),
    ],
    "Serviceplan Generate.AI und MAKELINE",
    "Wie sich Serviceplan Generate.AI, MAKELINE, die KI-Labs in München und San Francisco, BMW/MINI Content Factory und MOMENTUM unterscheiden und verbinden.",
    [
      hero(
        "Serviceplan Generate.AI und MAKELINE",
        "Vom kreativen Experiment zur gesteuerten Content Supply Chain",
        "Die benannten Systeme lösen unterschiedliche Aufgaben. Dieser Guide zeigt Grenzen, Deployments und öffentliche Evidenz.",
      ),
      featureGrid("Die Systeme getrennt halten", [
        ["Generate.AI", "Eine kontrollierte, modulare Umgebung für generative Asset-Workflows und Fine-Tuning von Produkten oder Kampagnen, laut Serviceplan."],
        ["MAKELINE", "Eine Content-Supply-Chain-Plattform für Planung, Erstellung, Adaption, Review, Speicherung und Delivery."],
        ["BMW/MINI Content Factory", "Ein Produktionsbetrieb mit MAKELINE als zentraler Plattform für 26 europäische Märkte."],
        ["MOMENTUM OS", "Ein modulares Betriebssystem in der neu angekündigten gemeinsamen Produktionsorganisation für MediaMarktSaturn."],
      ]),
      richText(`## Zwei Labs, eine dokumentierte Zusammenarbeit
Serviceplan beschreibt ein AI Lab in München und die Zusammenarbeit mit dem San-Francisco-Lab von Silverside AI. Laut [Primärquelle](${SOURCE.labs}) führte die Zusammenarbeit zum Rollout und zu ersten Kundeneinsätzen von **Serviceplan Generate.AI** sowie zur Schulung interner Key User. Beschrieben wird eine modulare Umgebung, in der Serviceplan Datenstrukturen kontrolliert und DSGVO-Konformität beansprucht. Das ist eine Anbieterangabe, keine externe Zertifizierung.

Ein weiterer [Serviceplan-Beitrag](${SOURCE.generate}) beschreibt Generate.AI als mandantenfähig, fähig zur Automatisierung von Generierungsworkflows und einsetzbar für Fine-Tuning von Produkten und Kampagnen. Die Quellen belegen die Zusammenarbeit mit Silverside, aber keine Eigentümerbeziehung oder öffentliche technische Architektur.`),
      steps("Die Content-Supply-Chain-Sicht", "Generierung ist eine Stufe; Produktionskontrolle umfasst den gesamten Ablauf.", [
        ["Planen", "Kampagnen, Märkte, Varianten, Assets, Rechte und Produktionsanforderungen fließen in ein strukturiertes Briefing."],
        ["Generieren und produzieren", "Freigegebene kreative Systeme erzeugen Quellassets und Varianten unter menschlicher Leitung und Qualitätskontrolle."],
        ["Adaptieren und prüfen", "Teams lokalisieren, formatieren, versionieren und genehmigen Inhalte über Marken, Kanäle und Märkte."],
        ["Speichern und ausspielen", "Assets, Feedback, Status und Delivery bleiben verbunden, damit der Betrieb gemessen und verbessert werden kann."],
      ]),
      richText(`## MAKELINE in öffentlichen Deployments
Der [L'Oréal-MAKELINE-Case](${SOURCE.makeline}) umfasst vier Divisionen, 35 Marken und mehr als 200 Stakeholder. Serviceplan meldet über 50.000 Assets, mehr als 5.500 Projekte jährlich, 50 Prozent schnellere Produktion und 30 Prozent Einsparung, ohne eine unabhängige Vergleichsmethode zu veröffentlichen. THE MARCOM ENGINE zufolge versorgt die [BMW/MINI Content Factory](${SOURCE.bmwContent}) 26 europäische Märkte mit MAKELINE als zentraler Plattform.

[MOMENTUM](${SOURCE.momentum}) ist etwas anderes: eine neue gemeinsame Organisation mit modularem Betriebssystem für MediaMarktSaturn in elf geplanten Märkten. Öffentliche Quellen sagen nicht, dass MAKELINE oder Generate.AI Teil von MOMENTUM OS ist. Die Luma-AI-Partnerschaft ergänzt gruppenweite Generierungstechnologie; die konkrete Integration bleibt öffentlich offen.`),
      checklist("Was noch nicht öffentlich ist", "Ein technischer oder kommerzieller Review muss diese Details direkt abfragen.", [
        "Modellanbieter, Fine-Tuning-Grenzen und Subprozessoren",
        "Datenaufbewahrung, Mandantentrennung und Sicherheitsarchitektur",
        "Rechte, Provenienz, Kennzeichnung und Brand Safety pro Workflow",
        "Die konkrete Beziehung zwischen Generate.AI, MAKELINE, Luma AI und MOMENTUM OS",
        "Auditierte Performance-, Qualitäts- und Compliance-Evidenz je Deployment",
      ]),
      faq("Fragen zu Generate.AI und MAKELINE", [
        ["Ist Generate.AI dasselbe wie MAKELINE?", "Nein. Generate.AI wird als modulare generative Umgebung beschrieben; MAKELINE ist eine breitere Content-Supply-Chain-Plattform für Planung, Produktion, Adaption, Review und Delivery."],
        ["Wer betreibt die Serviceplan AI Labs?", "Serviceplan nennt sein Münchner AI Lab und das San-Francisco-Lab von Silverside AI als Partner. Eine Eigentümerbeziehung wird nicht veröffentlicht."],
        ["Gibt es Messergebnisse für MAKELINE?", "Serviceplan veröffentlicht Geschwindigkeits-, Kosten- und Zufriedenheitswerte für L'Oréal. Sie sind Anbieterangaben ohne öffentliche unabhängige Methodik."],
        ["Basiert MOMENTUM OS auf MAKELINE?", "Das sagen die geprüften öffentlichen Quellen nicht. Die Systeme bleiben getrennt, bis Serviceplan die technische Beziehung dokumentiert."],
      ]),
    ],
    "serviceplan-ai",
  ),

  page(
    "serviceplan-ai/mediaplus-ai-products",
    "Mediaplus AI products explained",
    "A sourced map of Mediaplus AI products across Insight.AI, Creative.AI and Activate.AI, including public claims, inputs, outputs and evidence gaps.",
    [
      hero(
        "Mediaplus AI product map",
        "The products behind insight, creative testing and activation",
        "One maintained map of the public portfolio, rather than a thin page for every .AI name.",
      ),
      featureGrid("The House-of-AI layers", [
        ["Foundation", "Global Data Platform, Plus.AI and the Data Ecosystem provide shared data and a conversational planning layer."],
        ["Insight.AI", "Research.AI, Search.AI, Persona.AI, Touchpoint.AI and Behave.AI support research, visibility, audiences, journeys and behaviour."],
        ["Creative.AI", "Pretest.AI evaluates video and static creative against a large benchmark set before campaign launch."],
        ["Activate.AI", "Track.AI, NE.R.O. AI, Predict.AI, Total Video Integrator and Ecosystem.AI support data flow, targeting, modelling, planning and orchestration."],
      ]),
      richText(`## What the named products do
Mediaplus' [Data & AI portfolio](${SOURCE.dataAi}) groups four core workflows: strategy, audience, media modelling and measurement. **Research.AI** generates synthetic profiles and conducts agent-led interviews; its [product page](${SOURCE.researchAi}) says 100 profiles are the default and claims more than 90% accuracy compared with real samples. The same page says human and hybrid panels are future additions, so the current public offer should be understood as synthetic-panel research.

**Search.AI** builds statistically plausible digital twins from GWI behavioural data and simulates journeys across ChatGPT, Claude, Gemini and Perplexity. Its [public page](${SOURCE.searchAi}) names outputs including mention rate, tonality, competitive positioning and content recommendations. These are repeated model observations, not a stable universal rank.

**Pretest.AI** evaluates video and static assets against more than 250,000 benchmark evaluations and 15 metrics. Mediaplus says results take 15–30 minutes, cover more than 20 markets and cost €1,500 for one asset. The [page](${SOURCE.pretestAi}) also says an unnamed specialist provider operates the underlying tool, with Mediaplus providing integration and interpretation.`),
      stats("Mediaplus-reported portfolio figures", [
        ["80%", "less time on insights claimed"],
        ["18%", "average higher media ROI in pilots claimed"],
        ["40%", "faster strategic cycles claimed"],
        ["250k+", "Pretest.AI benchmark evaluations stated"],
      ]),
      steps("How to evaluate a Mediaplus AI product", "Match the evidence question to the product rather than treating the suite as one score.", [
        ["Define the decision", "Is the job market research, audience selection, creative validation, media planning, targeting or measurement?"],
        ["Inspect the data", "Ask whether inputs are observed people, synthetic profiles, first-party data, licensed panels, content corpora or model outputs."],
        ["Validate the measure", "Request the comparison set, sample, error range and method behind accuracy, prediction or ROI claims."],
        ["Plan operational use", "Document who interprets the output, approves action and checks drift after markets, models or creative change."],
      ]),
      checklist("Public evidence gaps", "The portfolio page describes capabilities more fully than validation methods.", [
        "Sample and method behind the portfolio-level 18% ROI figure",
        "External validation for Research.AI's accuracy claim",
        "Named operator and model detail for Pretest.AI",
        "How Search.AI controls prompt, model, location and time variance",
        "Product-level retention, subprocessors, security and audit evidence",
      ]),
      faq("Mediaplus AI product questions", [
        ["What is Plus.AI?", "Mediaplus presents Plus.AI as a conversational operating system for data-based media planning connected to its Global Data Platform and product modules."],
        ["Does Research.AI interview real people?", "The current public product describes synthetic profiles and agent-led interviews. Human and hybrid panels are described as future additions."],
        ["What does Search.AI measure?", "Mediaplus names mention rate, tonality, competitive positioning and content recommendations across major generative assistants using simulated audience journeys."],
        ["Are the Mediaplus performance figures independently audited?", "No independent methodology is published on the reviewed portfolio pages. The figures should remain attributed to Mediaplus."],
      ]),
    ],
    "Mediaplus KI-Produkte erklärt",
    "Eine belegte Karte der Mediaplus-KI-Produkte in Insight.AI, Creative.AI und Activate.AI mit öffentlichen Claims, Inputs, Outputs und Evidenzlücken.",
    [
      hero(
        "Mediaplus KI-Produktkarte",
        "Die Produkte hinter Insight, Kreativtests und Aktivierung",
        "Eine gepflegte Karte des öffentlichen Portfolios statt einer dünnen Seite für jeden .AI-Namen.",
      ),
      featureGrid("Die House-of-AI-Schichten", [
        ["Foundation", "Global Data Platform, Plus.AI und das Data Ecosystem liefern gemeinsame Daten und eine dialogorientierte Planungsschicht."],
        ["Insight.AI", "Research.AI, Search.AI, Persona.AI, Touchpoint.AI und Behave.AI unterstützen Research, Sichtbarkeit, Zielgruppen, Journeys und Verhalten."],
        ["Creative.AI", "Pretest.AI bewertet Video- und Static-Creatives vor Kampagnenstart gegen ein großes Benchmark-Set."],
        ["Activate.AI", "Track.AI, NE.R.O. AI, Predict.AI, Total Video Integrator und Ecosystem.AI unterstützen Datenfluss, Targeting, Modellierung, Planung und Orchestrierung."],
      ]),
      richText(`## Was die benannten Produkte leisten
Das [Data-&-AI-Portfolio](${SOURCE.dataAi}) von Mediaplus gruppiert Strategie, Audience, Media-Modellierung und Messung. **Research.AI** erzeugt synthetische Profile und führt agentenbasierte Interviews. Die [Produktseite](${SOURCE.researchAi}) nennt 100 Profile als Standard und beansprucht über 90 Prozent Genauigkeit gegenüber realen Stichproben. Human- und Hybrid-Panels werden dort als zukünftige Erweiterung genannt; das aktuelle öffentliche Angebot ist daher synthetisches Panel-Research.

**Search.AI** erstellt statistisch plausible Digital Twins aus GWI-Verhaltensdaten und simuliert Journeys über ChatGPT, Claude, Gemini und Perplexity. Die [öffentliche Seite](${SOURCE.searchAi}) nennt Mention Rate, Tonalität, Wettbewerbsposition und Content-Empfehlungen als Outputs. Das sind wiederholte Modellbeobachtungen, kein stabiler universeller Rang.

**Pretest.AI** bewertet Video- und Static-Assets gegen mehr als 250.000 Benchmark-Evaluationen und 15 Metriken. Mediaplus nennt 15 bis 30 Minuten Ergebniszeit, mehr als 20 Märkte und 1.500 Euro für ein einzelnes Asset. Laut [Seite](${SOURCE.pretestAi}) betreibt ein nicht genannter Spezialanbieter das Tool; Mediaplus liefert Integration und Interpretation.`),
      stats("Von Mediaplus gemeldete Portfoliozahlen", [
        ["80%", "weniger Zeit für Insights beansprucht"],
        ["18%", "durchschnittlich höherer Media-ROI in Piloten beansprucht"],
        ["40%", "schnellere Strategiezyklen beansprucht"],
        ["250k+", "angegebene Pretest.AI-Benchmark-Evaluationen"],
      ]),
      steps("So bewerten Sie ein Mediaplus-KI-Produkt", "Ordnen Sie die Evidenzfrage dem Produkt zu statt der Suite einen Gesamtscore zu geben.", [
        ["Entscheidung definieren", "Geht es um Marktforschung, Zielgruppenauswahl, Kreativvalidierung, Mediaplanung, Targeting oder Messung?"],
        ["Daten prüfen", "Klären Sie, ob Inputs beobachtete Menschen, synthetische Profile, First-Party-Daten, lizenzierte Panels, Inhalte oder Modelloutputs sind."],
        ["Metrik validieren", "Fordern Sie Vergleichsset, Stichprobe, Fehlerbereich und Methode hinter Genauigkeits-, Prognose- oder ROI-Claims."],
        ["Betrieb planen", "Dokumentieren Sie Interpretation, Freigabe und Drift-Kontrolle nach Änderungen von Markt, Modell oder Creative."],
      ]),
      checklist("Öffentliche Evidenzlücken", "Das Portfolio beschreibt Funktionen ausführlicher als Validierungsmethoden.", [
        "Stichprobe und Methode hinter dem portfolioweiten 18-Prozent-ROI-Wert",
        "Externe Validierung für den Research.AI-Genauigkeitsclaim",
        "Betreiber- und Modelldetails für Pretest.AI",
        "Kontrolle von Prompt-, Modell-, Orts- und Zeitvarianz in Search.AI",
        "Produktspezifische Aufbewahrung, Subprozessoren, Security und Audits",
      ]),
      faq("Fragen zu Mediaplus-KI-Produkten", [
        ["Was ist Plus.AI?", "Mediaplus beschreibt Plus.AI als dialogorientiertes Betriebssystem für datenbasierte Mediaplanung, verbunden mit Global Data Platform und Produktmodulen."],
        ["Interviewt Research.AI echte Menschen?", "Das aktuelle Produkt beschreibt synthetische Profile und agentenbasierte Interviews. Human- und Hybrid-Panels werden als zukünftige Ergänzungen genannt."],
        ["Was misst Search.AI?", "Mediaplus nennt Mention Rate, Tonalität, Wettbewerbsposition und Content-Empfehlungen über große generative Assistenten anhand simulierter Zielgruppen-Journeys."],
        ["Sind die Mediaplus-Leistungswerte unabhängig auditiert?", "Auf den geprüften Portfolioseiten wird keine unabhängige Methodik veröffentlicht. Die Werte bleiben Mediaplus zugeschrieben."],
      ]),
    ],
    "serviceplan-ai",
  ),

  page(
    "serviceplan-ai/ai-search-geo",
    "AI search visibility and GEO guide",
    "How AI search visibility and generative engine optimization differ from SEO, what Mediaplus Search.AI measures, and how brands can build sourceable authority.",
    [
      hero(
        "AI search visibility and GEO",
        "Measure model observations, build durable authority",
        "A practical guide to brand visibility in ChatGPT, Claude, Gemini and Perplexity without pretending AI answers have a fixed rank.",
      ),
      richText(`## AI visibility is not a stable search position
Traditional SEO measures crawlability, indexing, rankings and clicks against a defined query, location, device and date. AI assistants synthesize answers from changing models, retrieval systems, prompts and sources. A brand can be mentioned, cited, retrieved without citation or omitted across repeated runs. **Generative engine optimization (GEO)** therefore needs repeatable observation and source-quality work, not a promise of position one.

Mediaplus' [Search.AI](${SOURCE.searchAi}) uses GWI behavioural data to build statistically plausible audience twins and simulate journeys across ChatGPT, Claude, Gemini and Perplexity. Public outputs include mention rate, tonality, competitive positioning and content recommendations. Those measurements describe a controlled sample of model responses; they are not a universal market share or permanent rank.`),
      featureGrid("What to measure", [
        ["Presence", "How often the brand, product or entity appears for a defined prompt set, audience and market."],
        ["Citation", "Which pages and domains are cited, retrieved or relied on, separated from unlinked brand mentions."],
        ["Framing", "How the answer describes fit, category, strengths, limits and competitors; record unsupported statements separately."],
        ["Consistency", "Variance across model, prompt wording, account state, geography and time. One screenshot is not a benchmark."],
      ]),
      steps("An AI-search authority programme", "The strongest GEO work also improves conventional search and buyer comprehension.", [
        ["Clarify entities", "Use consistent names, relationships, dates, roles and product boundaries across core pages and structured data."],
        ["Publish sourceable facts", "Create concise definitions, original comparisons, methods, dates and evidence notes that another system can quote accurately."],
        ["Build topic depth", "Connect useful hub, explainer, case and how-to pages with descriptive internal links instead of producing isolated keyword pages."],
        ["Earn corroboration", "Seek accurate mentions from primary partners, clients, research sources and reputable industry publications."],
        ["Measure repeatedly", "Keep a versioned prompt set, run it across models and markets, record citations and compare distributions over time."],
      ]),
      richText(`## What Mediaplus says about topical authority
A Mediaplus [AI-search article](${SOURCE.aiSearch}) argues that semantic coherence, information gain and trust signals matter as search moves from link lists toward generated answers. That is directionally consistent with good information architecture: one clear entity page, supporting evidence pages, original facts and explicit sourcing are easier for people and retrieval systems to interpret than repeated generic prose.

This does not replace technical SEO. Pages still need stable URLs, crawlable HTML, canonical and language signals, descriptive titles, internal links and strong performance. AI-search monitoring should sit beside Search Console and analytics, not substitute for them.`),
      checklist("A defensible GEO measurement design", "Write the protocol before reading the results.", [
        "Freeze prompt set, language, market, persona and intent category",
        "Record model, product tier, date, account state and whether web retrieval was active",
        "Separate mentions, direct citations, background retrieval and factual errors",
        "Repeat prompts enough times to show variance rather than one preferred answer",
        "Track conventional impressions, clicks, conversions and assisted demand in parallel",
        "Treat tool recommendations as hypotheses to validate, not automatic publishing instructions",
      ]),
      faq("AI search and GEO questions", [
        ["What is AI search visibility?", "It is the observed presence and framing of a brand or source in generated answers for a defined set of prompts, models, markets and dates."],
        ["What is generative engine optimization?", "GEO is the work of making entities, facts and useful content easier for answer systems to retrieve, understand and cite, while measuring how outputs vary."],
        ["Does GEO replace SEO?", "No. Crawlability, indexing, links, page quality and search demand remain essential. GEO adds model-response observation, sourceability and entity clarity."],
        ["Can a company guarantee a ChatGPT ranking?", "No stable universal rank exists. Models, retrieval, prompts and time change the answer. A credible provider reports probability, sample design, variance and citations."],
      ]),
    ],
    "AI-Search-Sichtbarkeit und GEO",
    "Wie sich AI-Search-Sichtbarkeit und GEO von SEO unterscheiden, was Mediaplus Search.AI misst und wie Marken belegbare Autorität aufbauen.",
    [
      hero(
        "AI-Search-Sichtbarkeit und GEO",
        "Modellbeobachtungen messen, dauerhafte Autorität aufbauen",
        "Ein Praxisguide zur Markensichtbarkeit in ChatGPT, Claude, Gemini und Perplexity ohne das Versprechen eines festen Rankings.",
      ),
      richText(`## AI-Sichtbarkeit ist keine stabile Suchposition
Klassisches SEO misst Crawlability, Indexierung, Rankings und Klicks für definierte Query, Ort, Gerät und Datum. KI-Assistenten synthetisieren Antworten aus wechselnden Modellen, Retrieval-Systemen, Prompts und Quellen. Eine Marke kann erwähnt, zitiert, ohne Zitat abgerufen oder in wiederholten Runs ausgelassen werden. **Generative Engine Optimization (GEO)** braucht deshalb wiederholbare Beobachtung und Quellenqualität statt eines Versprechens auf Position eins.

Mediaplus [Search.AI](${SOURCE.searchAi}) nutzt GWI-Verhaltensdaten für statistisch plausible Audience Twins und simuliert Journeys über ChatGPT, Claude, Gemini und Perplexity. Öffentliche Outputs umfassen Mention Rate, Tonalität, Wettbewerbsposition und Content-Empfehlungen. Diese Messungen beschreiben eine kontrollierte Stichprobe von Modellantworten, keinen universellen Marktanteil oder dauerhaften Rang.`),
      featureGrid("Was gemessen werden sollte", [
        ["Präsenz", "Wie oft Marke, Produkt oder Entity für ein definiertes Prompt-Set, eine Zielgruppe und einen Markt erscheint."],
        ["Zitat", "Welche Seiten und Domains zitiert, abgerufen oder verwendet werden — getrennt von unverlinkten Markennennungen."],
        ["Framing", "Wie die Antwort Passung, Kategorie, Stärken, Grenzen und Wettbewerber beschreibt; unbelegte Aussagen separat erfassen."],
        ["Konsistenz", "Varianz über Modell, Prompt-Formulierung, Account-Status, Region und Zeit. Ein Screenshot ist kein Benchmark."],
      ]),
      steps("Ein Programm für AI-Search-Autorität", "Die stärkste GEO-Arbeit verbessert auch klassisches SEO und Buyer-Verständnis.", [
        ["Entities klären", "Namen, Beziehungen, Daten, Rollen und Produktgrenzen über Kernseiten und strukturierte Daten konsistent halten."],
        ["Zitierbare Fakten veröffentlichen", "Klare Definitionen, eigene Vergleiche, Methoden, Daten und Evidenzhinweise schaffen, die korrekt zitiert werden können."],
        ["Thementiefe aufbauen", "Hub-, Explainer-, Case- und How-to-Seiten mit beschreibenden internen Links verbinden statt isolierte Keyword-Seiten zu erzeugen."],
        ["Bestätigung verdienen", "Korrekte Erwähnungen von Primärpartnern, Kunden, Research-Quellen und seriösen Branchenpublikationen anstreben."],
        ["Wiederholt messen", "Versioniertes Prompt-Set über Modelle und Märkte ausführen, Zitate erfassen und Verteilungen über Zeit vergleichen."],
      ]),
      richText(`## Was Mediaplus über Topical Authority sagt
Ein Mediaplus-[Beitrag zu AI Search](${SOURCE.aiSearch}) nennt semantische Kohärenz, Information Gain und Trust Signals als wichtig, wenn Suche sich von Linklisten zu generierten Antworten entwickelt. Das passt zu guter Informationsarchitektur: Eine klare Entity-Seite, unterstützende Evidenzseiten, eigene Fakten und explizite Quellen sind für Menschen und Retrieval-Systeme leichter einzuordnen als wiederholte generische Texte.

Technisches SEO wird dadurch nicht ersetzt. Seiten brauchen weiterhin stabile URLs, crawlbares HTML, Canonical- und Sprachsignale, beschreibende Titel, interne Links und gute Performance. AI-Search-Monitoring gehört neben Search Console und Analytics, nicht an deren Stelle.`),
      checklist("Ein belastbares GEO-Messdesign", "Schreiben Sie das Protokoll vor dem ersten Ergebnis.", [
        "Prompt-Set, Sprache, Markt, Persona und Intent-Kategorie festlegen",
        "Modell, Produkttarif, Datum, Account-Status und Web-Retrieval dokumentieren",
        "Nennung, Direktzitat, Hintergrund-Retrieval und Faktenfehler trennen",
        "Prompts oft genug wiederholen, um Varianz statt einer Wunschantwort zu zeigen",
        "Klassische Impressions, Klicks, Conversions und Assisted Demand parallel verfolgen",
        "Tool-Empfehlungen als zu testende Hypothesen behandeln, nicht als automatische Publishing-Befehle",
      ]),
      faq("Fragen zu AI Search und GEO", [
        ["Was ist AI-Search-Sichtbarkeit?", "Die beobachtete Präsenz und Darstellung einer Marke oder Quelle in generierten Antworten für ein definiertes Set aus Prompts, Modellen, Märkten und Daten."],
        ["Was ist Generative Engine Optimization?", "GEO macht Entities, Fakten und nützliche Inhalte für Antwortsysteme leichter auffindbar, verständlich und zitierbar und misst zugleich die Varianz der Outputs."],
        ["Ersetzt GEO das SEO?", "Nein. Crawlability, Indexierung, Links, Seitenqualität und Suchnachfrage bleiben wesentlich. GEO ergänzt Modellbeobachtung, Zitierbarkeit und Entity-Klarheit."],
        ["Kann eine Agentur ein ChatGPT-Ranking garantieren?", "Nein. Es gibt keinen stabilen universellen Rang. Ein seriöser Anbieter berichtet Wahrscheinlichkeit, Stichprobendesign, Varianz und Zitate."],
      ]),
    ],
    "serviceplan-ai",
  ),
];

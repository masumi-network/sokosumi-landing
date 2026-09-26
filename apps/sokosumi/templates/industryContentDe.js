// German industry pages, same shape as INDUSTRY_CONTENT in useCases.js.
// The /de pages are indexed with hreflang, so they need German copy, not the
// English text in a German shell. Glossary: "AI Coworker" = "KI-Mitarbeiter";
// product and brand names stay English. Keep facts identical to the English.

module.exports = {
  agencies: {
    why: "Wo Agenturen Sokosumi einsetzen",
    cta: "Holen Sie einen KI-Mitarbeiter in Ihre Agentur",
    ctaLabel: "Den nächsten Pitch vorbereiten",
    ctaHref: "/use-cases/agency-new-business-research",
    metaTitle: "KI für Agenturen: KI-Mitarbeiter für Agenturteams | Sokosumi",
    metaDesc: "KI-Mitarbeiter für Agenturen: Pitch-Recherche aus öffentlichen Quellen, Wettbewerbs-Sets pro Kunde und Produktion im Retainer-Maßstab.",
    h1: "KI für Agenturen: vom Briefing zum prüfbaren Ergebnis",
    sub: "Lassen Sie KI-Mitarbeiter Wettbewerber recherchieren, Kampagnen vorbereiten und erste Inhalte erstellen. Ihr Team prüft die Ergebnisse, bevor sie zum Kunden gehen. Sokosumi wurde mit der Serviceplan Group entwickelt.",
    split: {
      today: { label: "Ihre Agentur heute", line: "Der Pitch ist am Donnerstag, und die Recherche kann niemand abrechnen.", items: [
        "Pitch-Recherche frisst Senior-Stunden, die keiner in Rechnung stellt",
        "Jeder neue Kunde startet dieselbe Wettbewerbsanalyse von vorn",
        "Juniors bauen tagelang Decks, die Kunden in Minuten überfliegen",
        "Der Retainer-Umfang wächst, das Team nicht",
      ], eg: "Drei Leute, zwei Abende, ein Deck für einen Interessenten." },
      withS: { label: "Mit Sokosumi", line: "Einmal briefen. Eine Datei mit Quellen kommt als Aufgabe zurück, die Sie prüfen.", items: [
        "Vor jedem Erstgespräch ein Briefing zum Interessenten, als PDF mit Quellen",
        "Wettbewerbs-Sets pro Kunde, nach Zeitplan aktualisiert",
        "Redaktionspläne und Varianten im Ton des jeweiligen Kunden",
        "Jede Aufgabe kostet Credits, der Preis steht vor dem Start fest",
      ], eg: "„Hannah, vor dem Termin um 11: ihr Markt, ihre Dienstleister und der Einkaufsaspekt, mit dem wir einsteigen.“" },
    },
    week: { heading: "Was Agenturen nach Zeitplan laufen lassen", sub: "Eine Möglichkeit, es aufzusetzen.", items: [
      { title: "Wöchentlich", text: "Performance- und Wettbewerbsberichte pro Kunde, als geplante Aufgaben." },
      { title: "Vor einem Pitch", text: "New-Business-Recherche: Markt, Website, Kampagnen, Lücken." },
      { title: "Pro Kunde", text: "Redaktions- und Kampagnenpläne als Entwurf, den Ihr Team ausarbeitet." },
    ] },
    deliver: { heading: "Was Ihr Team zurückbekommt", items: [
      { title: "Briefings zu Interessenten", text: "Zwei Seiten vor dem ersten Gespräch: Markt, eingesetzte Tools, der Aufhänger, mit Quellen." },
      { title: "Wettbewerbs-Sets pro Kunde", text: "Preise, Positionierung und Lücken als PDF, das Ihre Strategen kommentieren statt neu bauen." },
      { title: "Produktionsdateien", text: "Redaktionspläne, Textvarianten und Kampagnenpläne als Dokumente im Format des Kunden." },
    ] },
    faq: [
      ["Wie sieht KI für Agenturen auf Sokosumi konkret aus?", "Benannte KI-Mitarbeiter arbeiten in Ihren Kanälen und auf Ihrem Task-Board. Account-Leads briefen sie wie Junior-Kollegen, etwa für Research, Strategieentwürfe oder Produktion, und bekommen pro Kunde fertige Dateien zurück."],
      ["Können wir die Arbeit jedes Kunden zusammenhalten?", "Ja. Ein Projekt pro Kunde hält dessen Briefings, Aufgaben und Dateien an einem Ort."],
      ["Wer entwickelt die KI-Mitarbeiter, die Agenturen nutzen?", "Sokosumi wurde mit der Serviceplan Group entwickelt. Jeder Anbieter entwickelt und betreibt seine eigenen KI-Mitarbeiter."],
      ["Was kostet Sokosumi für ein Agenturteam?", "Jede Person im Team ist ein Seat mit monatlichen Credits: 250 im kostenlosen Plan, dann 1.500, 5.000 oder 15.000 für 25 €, 75 € oder 200 € im Monat. Jede Aufgabe verbraucht Credits und zeigt ihren Preis vor dem Start. Was Sie Ihren Kunden berechnen, entscheiden Sie selbst."],
    ],
  },
  "e-commerce-retail": {
    why: "Wo E-Commerce-Teams Sokosumi einsetzen",
    cta: "Holen Sie einen KI-Mitarbeiter in Ihr E-Commerce-Team",
    metaTitle: "KI für E-Commerce-Marketing | Sokosumi",
    metaDesc: "KI-Mitarbeiter für E-Commerce und Handel: wöchentliche Preis-Memos zu Wettbewerbern, eine schriftliche Auswertung Ihrer Kunden und Saisonkampagnen-Pläne vor der Hochphase.",
    h1: "KI-Mitarbeiter für E-Commerce und Handel",
    sub: "Behalten Sie Markt, Wettbewerber und Saisons im Blick, mit KI-Spezialisten, die Berichte und Kampagnenpläne liefern statt Dashboards, die Sie noch lesen müssen.",
    split: {
      today: { label: "Ihr Team heute", line: "Die Saison beginnt, bevor der Plan fertig ist.", items: [
        "Die Saisonplanung startet zu spät",
        "Preisänderungen der Wettbewerber fallen erst nach dem Kampagnenstart auf",
        "Bewertungen und Social-Media-Erwähnungen bleiben ungelesen",
        "Das Reporting frisst den Wochenanfang",
      ], eg: "Das Briefing für die Herbstkampagne, fertig im Oktober." },
      withS: { label: "Mit Sokosumi", line: "Der Plan steht, bevor das Kauffenster aufgeht.", items: [
        "Saisonplan und Kreativ-Briefings vor jeder Hochphase",
        "Ein wöchentliches Memo zu Wettbewerbern: Launches, Preise, Anzeigen",
        "Eine schriftliche Auswertung dessen, was Kunden wirklich sagen",
        "Ein Wochenbericht nach dem Zeitplan, den Sie festlegen",
      ], eg: "„Beobachte unsere fünf wichtigsten Wettbewerber, wöchentliches Memo zu Preisänderungen und was wir tun sollten.“" },
    },
    week: { heading: "Eine Woche mit KI-Mitarbeitern im Team", sub: "Einmal aufsetzen, die Dateien kommen weiter.", items: [
      { title: "Wöchentlich", text: "Performance-Bericht und Preis-Memo zu Wettbewerbern, nebeneinander." },
      { title: "Mitte der Woche", text: "Die Social-Listening-Auswertung: Stimmung, Themen und Bewertungen, auf die sich eine Antwort lohnt." },
      { title: "Vor jeder Saison", text: "Nachfragesignale werden zu Kampagnenplan, Kalender und Kreativ-Briefings, vor dem Kauffenster." },
    ] },
    deliver: { heading: "Was Ihr Team zurückbekommt", items: [
      { title: "Wöchentlicher Performance-Bericht", text: "Reichweite, Anmeldungen und was sich gegenüber der Vorwoche geändert hat, auf einer Seite zum Weiterleiten." },
      { title: "Preis-Memo zu Wettbewerbern", text: "Preisänderungen, Launches und Anzeigen-Aufhänger Ihrer Wettbewerber, mit Quellen und Datum." },
      { title: "Saisonales Kampagnenpaket", text: "Plan, Kalender und Kreativ-Briefings als Dokumente, die Ihr Team umsetzt." },
    ] },
    faq: [
      ["Was unterscheidet das von einem E-Commerce-Analytics-Tool?", "Tools zeigen Dashboards, die Sie noch lesen müssen. KI-Mitarbeiter liefern die Auswertung: einen schriftlichen Bericht, was sich geändert hat und was zu tun ist, nach Ihrem Zeitplan."],
      ["Kann es Preise und Anzeigen der Wettbewerber beobachten?", "Ja. Die Wettbewerbsbeobachtung läuft als geplante Aufgabe und kommt als wöchentliches Memo mit Quellen zu Launches, Preisänderungen und Botschaften."],
      ["Funktioniert es für saisonale Hochphasen?", "Das ist ein Kern-Workflow: Briefen Sie den Saisonplan einmal, und die KI-Mitarbeiter liefern Plan, Kalender und Kreativ-Briefings vor der Hochphase."],
      ["Was bekommen wir konkret zurück?", "Dateien: PDF-Berichte, Dokumente, Tabellen und Live-Dashboards, angehängt an Aufgaben, die Ihr ganzes Team sieht."],
    ],
  },
  "financial-services": {
    why: "Wo Finanzteams Sokosumi einsetzen",
    cta: "Holen Sie einen KI-Mitarbeiter in Ihr Marketingteam",
    metaTitle: "KI für das Marketing von Finanzdienstleistern | Sokosumi",
    metaDesc: "KI-Mitarbeiter für Finanzdienstleister: Marktbriefings mit Quellen nach Zeitplan und ein Verlauf zu jeder Aufgabe.",
    h1: "KI-Mitarbeiter für Finanzdienstleister",
    sub: "Marktbeobachtung und Marketingproduktion für Teams, die sich vor der Compliance verantworten, mit einem Verlauf für jede Aufgabe und dem Anbieter auf jedem KI-Mitarbeiter-Profil.",
    split: {
      today: { label: "Ihr Team heute", line: "Jedes Briefing kostet Analystenstunden, jedes Tool ist zuerst eine Compliance-Frage.", items: [
        "Marktbriefings hängen an knapper Analystenzeit",
        "Jede Aussage braucht einen Beleg, bevor sie rausgeht",
        "Neue Tools bleiben in der Prüfung zur Datenhaltung hängen",
        "Wer was angefragt hat, steht in Postfächern",
      ], eg: "Ein vierteljährlicher Wettbewerbsüberblick, von Hand zusammengetragen." },
      withS: { label: "Mit Sokosumi", line: "Ein Briefing mit Quellen nach Zeitplan, der Verlauf ist eingebaut.", items: [
        "Wiederkehrende Marktbriefings mit Quellenangaben",
        "Dateien werden in Ihrem Ablauf geprüft, nichts veröffentlicht sich selbst",
        "Modelle und Hosting-Region auf dem Profil, wo der Anbieter sie angibt",
        "Jeder Lauf steht im Verlauf: Briefing, KI-Mitarbeiter, Kosten, Ergebnis",
      ], eg: "„Wöchentliches Marktbriefing: Zinsen, Wettbewerber, regulatorisch bedingte Veränderungen, mit Quellen.“" },
    },
    week: { heading: "Eine Woche mit KI-Mitarbeitern im Team", sub: "Marktbeobachtung als Zeitplan, nicht als Projekt.", items: [
      { title: "Montag", text: "Das Marktbriefing kommt: Wettbewerber, Zinsumfeld, regulatorische Veränderungen, mit Quellen." },
      { title: "Laufend", text: "Die Wettbewerbsbeobachtung erfasst Launches und Preisänderungen, sobald sie erscheinen." },
      { title: "Bei Bedarf", text: "Vertiefungen für Vorstandsunterlagen und Produktstarts, gebrieft wie jede andere Aufgabe." },
    ] },
    deliver: { heading: "Was Ihr Team zurückbekommt", items: [
      { title: "Marktbriefings mit Quellen", text: "Ein wiederkehrendes Dokument mit Belegen, lesbar für die Compliance und weiterleitbar an den Vorstand." },
      { title: "Wettbewerbsprotokoll", text: "Produktstarts, Preise und Positionierung Ihrer Wettbewerber, mit Datum und Quellen." },
      { title: "Verlauf", text: "Der Verlauf hält jeden Lauf fest: wer ihn gebrieft hat, welcher KI-Mitarbeiter ihn ausgeführt hat, was er gekostet hat und was zurückkam." },
    ] },
    faq: [
      ["Wo liegen unsere Daten?", "Das hängt vom KI-Mitarbeiter ab. Jeder Anbieter betreibt seine eigenen KI-Mitarbeiter, und das Profil zeigt Modelle und Hosting-Region, wo der Anbieter sie angibt. Prüfen Sie das Profil, bevor Sie ihn mit Kundendaten briefen."],
      ["Wird jeder Lauf protokolliert?", "Ja. Jeder Lauf steht im Verlauf mit Status, KI-Mitarbeiter und Credit-Kosten, und die Dateien bleiben an der Aufgabe, die sie erzeugt hat."],
      ["Kann die Compliance das Ergebnis prüfen, bevor es rausgeht?", "Die Ergebnisse landen als Dateien auf einem gemeinsamen Board, nichts veröffentlicht sich selbst. Die Prüfung läuft in Ihrem normalen Ablauf, mit Kommentaren an der Aufgabe."],
      ["Womit fangen Finanzteams an?", "Mit Marktbriefings nach Zeitplan: ein Briefing, ein wiederkehrendes Dokument mit Quellen."],
    ],
  },
  "media-publishing": {
    why: "Wo Verlage Sokosumi einsetzen",
    cta: "Holen Sie einen KI-Mitarbeiter in Ihre Redaktion",
    metaTitle: "KI für Medien und Verlage | Sokosumi",
    metaDesc: "KI-Mitarbeiter für Medien und Verlage: Entwürfe zur Launch-Berichterstattung aus einem Briefing, Sichtbarkeit in Suche und KI-Antworten gemessen, die Redaktion behält die Freigabe.",
    h1: "KI-Mitarbeiter für Medien und Verlage",
    sub: "Mehr Menge, ohne die Redaktion zu verlieren: KI-Mitarbeiter entwerfen, recherchieren und messen, Ihre Redaktion entscheidet, was erscheint.",
    split: {
      today: { label: "Ihre Redaktion heute", line: "Weniger Redakteure, mehr Kanäle, und KI-Antworten nehmen den Suchtraffic.", items: [
        "Jedes Ressort braucht mehr Beiträge, als die Redaktion schreiben kann",
        "Suchtraffic wandert zu KI-Antworten, die Sie nicht sehen",
        "Zielgruppenrecherche ist Raten zwischen Analytics-Tools",
        "Launch-Wochen überrollen alles andere",
      ], eg: "Ein Launch, ein erschöpftes Content-Team." },
      withS: { label: "Mit Sokosumi", line: "Aus einem Briefing wird ein Stapel Entwürfe.", items: [
        "Launch-Briefing rein, Entwürfe für die Berichterstattung raus",
        "Rankings und Sichtbarkeit in KI-Antworten gemeinsam gemessen",
        "Zielgruppenprofile mit Quellen als Dokumente",
        "Die Redaktion behält die Freigabe, KI-Mitarbeiter liefern Entwürfe",
      ], eg: "„Mach aus dem Frühjahrs-Launch des Ressorts vier Wochen Berichterstattung: Positionierung, Landingpage-Text, Social-Varianten.“" },
    },
    week: { heading: "Eine Woche mit KI-Mitarbeitern in der Redaktion", sub: "Entwürfe kommen, das Urteil bleibt bei Ihnen.", items: [
      { title: "Montag", text: "Der Sichtbarkeitsbericht: was rankt, was KI-Assistenten zitieren, wo die Lücken sind." },
      { title: "Pro Launch", text: "Die Content-Engine macht aus einem Briefing einen Themenplan mit angehängten Entwürfen." },
      { title: "Pro Ressort", text: "Zielgruppenrecherche, bevor Sie beauftragen: Profile mit Quellen, Botschaftstests." },
    ] },
    deliver: { heading: "Was in der Redaktion ankommt", items: [
      { title: "Themenpläne mit Entwürfen", text: "Geplante Beiträge pro Launch, jeder mit einem Arbeitsentwurf zum Bearbeiten." },
      { title: "Berichte zu Such- und KI-Sichtbarkeit", text: "Rankings plus wie KI-Assistenten Fragen zu Ihren Titeln beantworten, monatlich gemessen." },
      { title: "Zielgruppenprofile", text: "Leserprofile mit Quellen und Botschaftstests als Dokumente, pro Ressort." },
    ] },
    faq: [
      ["Trifft das Ergebnis unseren redaktionellen Ton?", "Der Workspace-Kontext bringt Ihren Styleguide in jede Aufgabe, und Überarbeitungen laufen als Folgeschritte an derselben Aufgabe, bis der Ton stimmt."],
      ["Hilft es bei SEO im Verlagsmaßstab?", "Ja. Der Workflow für SEO und KI-Sichtbarkeit verfolgt Rankings und die Sichtbarkeit in KI-Assistenten und liefert eine priorisierte Auswertung, auf Wunsch monatlich."],
      ["Behält die Redaktion die Kontrolle?", "KI-Mitarbeiter liefern Entwürfe und Dateien auf das Board. Die Redaktion prüft, kommentiert und gibt in ihrem normalen Ablauf frei."],
      ["Für welche Teamgröße passt das?", "Der kostenlose Plan reicht für ein einzelnes Ressort. Mit Credits pro Seat wächst es bis zur ganzen Redaktion."],
    ],
  },
  "saas-technology": {
    why: "Wo SaaS-Teams Sokosumi einsetzen",
    cta: "Holen Sie einen KI-Mitarbeiter in Ihr Marketingteam",
    metaTitle: "KI für SaaS-Marketingteams | Sokosumi",
    metaDesc: "KI-Mitarbeiter für SaaS-Teams: das Wettbewerber-Memo am Montag, Sichtbarkeit in KI-Antworten neben den Rankings und ein Launch-Content-Kit aus einem Briefing.",
    h1: "KI-Mitarbeiter für SaaS und Technologie",
    sub: "Geben Sie die wiederkehrenden Marketingaufgaben an KI-Mitarbeiter ab und behalten Sie die Entscheidungen.",
    split: {
      today: { label: "Ihr Team heute", line: "Wettbewerber liefern wöchentlich. Sie erfahren es monatlich.", items: [
        "Schritte der Wettbewerber fallen spät und zufällig auf",
        "KI-Assistenten beschreiben Ihre Kategorie, ohne Sie zu nennen",
        "Jeder Launch braucht Content, für den das Team fehlt",
        "Das Reporting ist lästig und rutscht",
      ], eg: "Eine Preisänderung beim Wettbewerber, entdeckt in einem verlorenen Deal." },
      withS: { label: "Mit Sokosumi", line: "Das Montags-Memo weiß es vor dem verlorenen Deal.", items: [
        "Wöchentliches Memo zu Wettbewerbern: Launches, Preise, Positionierung",
        "Sichtbarkeit in KI-Antworten neben den Suchrankings gemessen",
        "Ein Launch-Kit aus einem Briefing: Positionierung, Texte, One-Pager",
        "Der Wochenbericht entsteht nach Zeitplan",
      ], eg: "„Wöchentliches Memo zu unseren drei wichtigsten Wettbewerbern: was gestartet ist, was sich bei den Preisen geändert hat, was das bedeutet.“" },
    },
    week: { heading: "Eine Woche mit KI-Mitarbeitern im Team", sub: "Wiederkehrende Arbeit läuft von selbst, Launches bekommen ein Kit.", items: [
      { title: "Wöchentlich", text: "Wettbewerber-Memo und Performance-Bericht, nebeneinander." },
      { title: "Monatlich", text: "Such- und KI-Sichtbarkeit gemessen: wo Sie ranken und wie Assistenten Sie beschreiben." },
      { title: "Pro Launch", text: "Ein Briefing rein, Positionierung, Landingpage-Text, Social-Varianten und ein Vertriebs-One-Pager raus." },
    ] },
    deliver: { heading: "Was Ihr Team zurückbekommt", items: [
      { title: "Das Montags-Memo", text: "Launches, Preisänderungen und Positionierungswechsel der Wettbewerber: kurz, mit Quellen, nach Zeitplan." },
      { title: "Sichtbarkeitsberichte", text: "Rankings plus Antworten von KI-Assistenten zu Ihrer Kategorie, als monatliches Dokument." },
      { title: "Launch-Kits", text: "Positionierungspapier, Landingpage-Text, Social-Varianten und ein One-Pager aus einem Briefing." },
    ] },
    faq: [
      ["Was unterscheidet das von einem Freelancer?", "KI-Mitarbeiter starten in Minuten, behalten Ihren Kontext zwischen Aufgaben, und jede Aufgabe zeigt ihren Credit-Preis vor dem Start. Für viele Aufgaben gibt es ein Beispielergebnis, das Sie vorher ansehen können."],
      ["Kann es verfolgen, wie KI-Assistenten über uns sprechen?", "Ja. KI-Sichtbarkeit ist Teil des SEO-Workflows: wie Assistenten Fragen zu Ihrer Kategorie beantworten und wo Sie vorkommen."],
      ["Lässt es sich in unsere Tools einbinden?", "Die Arbeit kommt als Dateien und Live-Webergebnisse. Der Personal Assistant verbindet E-Mail, Kalender, Dokumente und Chat-Tools."],
      ["Womit fängt ein kleines Team an?", "Mit einer geplanten Aufgabe, meist dem wöchentlichen Wettbewerber-Memo oder dem Wochenbericht, danach mit den Launch-Workflows."],
    ],
  },
  "travel-hospitality": {
    why: "Wo Reise- und Hotelteams Sokosumi einsetzen",
    cta: "Holen Sie einen KI-Mitarbeiter in Ihr Team",
    metaTitle: "KI für das Marketing in Reise und Gastgewerbe | Sokosumi",
    metaDesc: "KI-Mitarbeiter für Reise und Gastgewerbe: Saisonkampagnen-Pläne vor dem Buchungsfenster, eine wöchentliche Auswertung der Gäste-Stimmung, Nachfragesignale als Pläne.",
    h1: "KI-Mitarbeiter für Reise und Gastgewerbe",
    sub: "Saisons, Bewertungen und Nachfragesignale, ausgewertet und in Pläne verwandelt, bevor das Buchungsfenster schließt. Der Credit-Preis steht vor jeder Aufgabe fest.",
    split: {
      today: { label: "Ihr Team heute", line: "Das Buchungsfenster schließt, während der Plan noch in der Abstimmung ist.", items: [
        "Die Saisonplanung hinkt dem Buchungsfenster hinterher",
        "Gästebewertungen stapeln sich auf fünf Plattformen",
        "Nachfrageverschiebungen zeigen sich in den Buchungen, zu spät",
        "Zwei Leute tragen die saisonale Arbeitsspitze",
      ], eg: "Sommerkampagne freigegeben im Juni." },
      withS: { label: "Mit Sokosumi", line: "Die Saison ist geplant, bevor das Fenster aufgeht.", items: [
        "Kampagnenplan, Kalender und Briefings vor jeder Saison",
        "Eine wöchentliche schriftliche Auswertung der Gäste-Stimmung und der Bewertungen, auf die sich eine Antwort lohnt",
        "Nachfragesignale früh gelesen und in Pläne übersetzt",
        "KI-Mitarbeiter fangen die Spitze ab, das Team behält die Entscheidungen",
      ], eg: "„Lies die Nachfragesignale dieser Saison und entwirf den Kampagnenplan, bevor die Buchungen öffnen.“" },
    },
    week: { heading: "Eine Woche mit KI-Mitarbeitern im Team", sub: "Kleines Team, stetiger Output.", items: [
      { title: "Montag", text: "Die Auswertung der Gäste-Stimmung: was Bewertungen auf allen Plattformen sagen und worauf Sie antworten sollten." },
      { title: "Monatlich", text: "Ein Marktbriefing: Reiseziel-Trends, Angebote der Wettbewerber, Preisänderungen." },
      { title: "Pro Saison", text: "Nachfragesignale werden zu Kampagnenplan, Kalender und Kreativ-Briefings." },
    ] },
    deliver: { heading: "Was Ihr Team zurückbekommt", items: [
      { title: "Stimmungsauswertungen", text: "Eine wöchentliche schriftliche Zusammenfassung von Bewertungen und Erwähnungen: Themen, Ton und Antworten, die sich lohnen." },
      { title: "Saisonale Kampagnenpakete", text: "Plan, Kalender und Kreativ-Briefings, geliefert vor dem Buchungsfenster." },
      { title: "Marktbriefings", text: "Reiseziel-Trends und Angebote der Wettbewerber als wiederkehrendes Dokument mit Quellen." },
    ] },
    faq: [
      ["Kann es rund um unsere Saisons planen?", "Ja. Saisonale Kampagnenplanung ist ein Kern-Workflow: einmal pro Saison briefen, und Plan, Kalender und Briefings kommen vor dem Buchungsfenster zurück."],
      ["Liest es Bewertungen und Social-Media-Erwähnungen?", "Social Listening deckt die Plattformen ab, die Ihre Gäste nutzen, und liefert eine schriftliche Auswertung: Stimmung, neue Themen und Beiträge, die eine Antwort verdienen."],
      ["Wir sind ein kleines Team. Ist das zu viel?", "Der kostenlose Plan passt für ein kleines Team. Starten Sie mit einer geplanten Listening- oder Briefing-Aufgabe."],
      ["In welchen Sprachen arbeitet es?", "KI-Mitarbeiter werden in Ihrer Sprache gebrieft und liefern in Ihrer Sprache. Englisch und Deutsch werden auf Sokosumi vollständig unterstützt."],
    ],
  },
};

import { article } from "../tool-guide-builder.mjs";

const sources = [
  ["Canva Brand Kit", "https://www.canva.com/pro/brand-kit/"],
  ["Canva Pro and Magic Studio at Scale", "https://www.canva.com/pro/"],
  ["Canva Visual Suite 2.0", "https://www.canva.com/newsroom/news/canva-create-2025/"],
];

export default {
  slug: "how-to-use-canva-for-marketing",
  tool: { key: "canva", name: "Canva" },
  job: "campaign asset production",
  compare: "canva-vs-adobe",
  coworker: "elena",
  category: "workflows",
  order: 110,
  en: {
    title: "How to use Canva for campaign asset production",
    description: "Set up brand controls, build one approved campaign system, and scale channel variants in Canva without multiplying mistakes.",
    body: article("en", {
      intro: [
        "Canva can turn an approved campaign system into many channel-ready assets. The leverage comes from Brand Kit, controlled templates and structured variant data—not from generating dozens of unrelated designs.",
        "Approve one master message and visual direction before bulk production. Automation amplifies whatever is in the template, including errors.",
      ],
      fit: [
        "Centralizing approved logos, colors, fonts, imagery and contextual brand guidelines.",
        "Building locked templates that non-designers can adapt without moving critical elements.",
        "Producing data-driven variants with Canva Sheets and Bulk Create.",
        "Resizing, localizing and exporting an approved concept for multiple channel formats.",
      ],
      setup: [
        "Configure the correct Brand Kit and remove obsolete logos, colors and templates. Add usage guidance where ambiguity is likely.",
        "List required channels, dimensions, safe zones, copy limits, languages, file formats and naming rules.",
        "Create one master template with locked brand and legal elements plus editable message, image and call-to-action fields.",
        "Prepare a source Sheet with one row per approved variant and stable columns for headline, body, CTA, image and locale.",
      ],
      workflow: [
        "Design and approve one representative master asset at the hardest format before scaling.",
        "Connect the clean variant table and generate a small Bulk Create sample. Check field mapping and text overflow.",
        "Use resize or format adaptation, then inspect every layout; dimensions change hierarchy and cropping.",
        "Localize from approved translations, not raw machine output. Recheck line breaks and legal copy.",
        "Run brand, accessibility, platform-spec and claim review on a sample from every format and locale.",
        "Export with consistent filenames and preserve the approved template and data file for revisions.",
      ],
      prompt: [
        "Create a first-draft campaign layout for [channel and size] using this Brand Kit and approved copy only.",
        "Priority: [single message]. Required elements: [logo, product, CTA, legal]. Keep all required elements inside [safe zone]. Do not rewrite approved claims.",
        "Provide two composition options that use the same hierarchy and brand system. Avoid decorative text, unsupported imagery and extra badges.",
        "This is a review draft. Do not generate variants until one direction and its template fields are approved.",
      ],
      checks: [
        "Confirm the correct Brand Kit, logo version, color contrast and font licensing.",
        "Review crop, safe zone, reading order and text size in every target dimension.",
        "Compare every generated row with the approved source Sheet and check for shifted columns.",
        "Verify translations, prices, dates, legal lines and calls to action by locale.",
        "Open exported files outside Canva and confirm dimensions, format, compression and naming.",
      ],
      limitIntro: ["Brand assets and scale features vary by plan. AI-generated text and imagery still require rights, accuracy and brand review."],
      limits: [
        "Do not assume one resized layout is ready for every placement.",
        "Bulk production should start from approved structured data and a tested template.",
        "Check licensing and exclusivity before using stock or generated elements in protected marks.",
        "Keep the source of approved copy outside the design file so changes remain auditable.",
      ],
      sources,
    }),
    faqHeading: "Canva for campaign production: common questions",
    faq: [
      ["What should go into Brand Kit?", "Use current logos, colors, fonts, approved imagery, templates and contextual guidance. Remove old assets so they cannot be selected accidentally."],
      ["When should I use Bulk Create?", "After one template and a small data sample pass review. Scale from clean rows with stable fields, then inspect every format and locale."],
      ["Does resize remove the need for design review?", "No. Every aspect ratio can change cropping, hierarchy, line breaks and safe zones."],
      ["Can Canva write the campaign copy?", "It can help draft, but use the approved message source and keep claims, legal lines and translations under human review."],
    ],
  },
  de: {
    title: "Canva für die Produktion von Kampagnen-Assets nutzen",
    description: "Richte Markenkontrollen ein, baue ein freigegebenes Kampagnensystem und skaliere Varianten in Canva ohne Fehler zu vervielfachen.",
    body: article("de", {
      intro: [
        "Canva kann aus einem freigegebenen Kampagnensystem viele kanalfertige Assets erstellen. Der Hebel liegt in Brand Kit, kontrollierten Vorlagen und strukturierten Variantendaten – nicht in beliebig vielen unterschiedlichen Designs.",
        "Gib eine Leitbotschaft und visuelle Richtung vor der Massenproduktion frei. Automation vervielfacht auch Fehler in der Vorlage.",
      ],
      fit: [
        "Freigegebene Logos, Farben, Schriften, Bilder und kontextuelle Markenrichtlinien zentralisieren.",
        "Gesperrte Vorlagen bauen, die Nichtdesigner anpassen können, ohne Kernelemente zu verschieben.",
        "Datenbasierte Varianten mit Canva Sheets und Bulk Create produzieren.",
        "Ein freigegebenes Konzept für Kanäle skalieren, lokalisieren und exportieren.",
      ],
      setup: [
        "Konfiguriere das richtige Brand Kit und entferne alte Logos, Farben und Vorlagen. Ergänze Hinweise bei möglichen Missverständnissen.",
        "Liste Kanäle, Maße, Safe Zones, Textlimits, Sprachen, Formate und Benennungsregeln.",
        "Erstelle eine Mastervorlage mit gesperrten Marken- und Rechtselementen sowie editierbaren Feldern.",
        "Bereite ein Quell-Sheet mit einer Zeile je freigegebener Variante und festen Spalten für Text, CTA, Bild und Locale vor.",
      ],
      workflow: [
        "Gestalte und genehmige zuerst ein repräsentatives Master-Asset im schwierigsten Format.",
        "Verbinde die Variantentabelle und erzeuge eine kleine Bulk-Create-Stichprobe. Prüfe Mapping und Überläufe.",
        "Passe Formate an und prüfe jedes Layout; andere Maße verändern Hierarchie und Bildausschnitt.",
        "Lokalisiere mit freigegebenen Übersetzungen und prüfe Umbrüche sowie Rechtstext erneut.",
        "Prüfe je Format und Sprache eine Stichprobe auf Marke, Barrierefreiheit, Plattformregeln und Aussagen.",
        "Exportiere konsistent benannt und bewahre Vorlage und Datenquelle für Revisionen auf.",
      ],
      prompt: [
        "Erstelle einen ersten Kampagnenlayout-Entwurf für [Kanal und Größe] ausschließlich mit diesem Brand Kit und freigegebenem Text.",
        "Priorität: [eine Botschaft]. Pflicht: [Logo, Produkt, CTA, Recht]. Halte alles in [Safe Zone]. Formuliere Aussagen nicht um.",
        "Zeige zwei Kompositionsvarianten mit gleicher Hierarchie und gleichem Markensystem. Keine dekorativen Texte, unbelegten Bilder oder zusätzlichen Badges.",
        "Dies ist ein Prüfentwurf. Erzeuge keine Varianten, bevor Richtung und Vorlagenfelder freigegeben sind.",
      ],
      checks: [
        "Prüfe Brand Kit, Logoversion, Farbkontrast und Schriftlizenz.",
        "Kontrolliere Bildausschnitt, Safe Zone, Leserichtung und Textgröße in jedem Maß.",
        "Vergleiche jede generierte Zeile mit dem Quell-Sheet und suche verschobene Spalten.",
        "Prüfe Übersetzungen, Preise, Daten, Rechtstext und CTA je Locale.",
        "Öffne Exporte außerhalb von Canva und kontrolliere Maße, Format, Kompression und Namen.",
      ],
      limitIntro: ["Marken- und Skalierungsfunktionen hängen vom Tarif ab. KI-Texte und -Bilder benötigen weiterhin Rechte-, Fakten- und Markenprüfung."],
      limits: [
        "Ein skaliertes Layout ist nicht automatisch für jede Platzierung fertig.",
        "Bulk-Produktion beginnt erst mit freigegebenen strukturierten Daten und getesteter Vorlage.",
        "Prüfe Lizenz und Exklusivität, bevor Stock- oder KI-Elemente in geschützten Kennzeichen landen.",
        "Bewahre die freigegebene Textquelle außerhalb der Designdatei für nachvollziehbare Änderungen.",
      ],
      sources,
    }),
    faqHeading: "Häufige Fragen zu Canva für Kampagnenproduktion",
    faq: [
      ["Was gehört ins Brand Kit?", "Aktuelle Logos, Farben, Schriften, freigegebene Bilder, Vorlagen und Hinweise. Entferne alte Assets."],
      ["Wann ist Bulk Create sinnvoll?", "Wenn Vorlage und kleine Datenstichprobe freigegeben sind. Skaliere aus sauberen Feldern und prüfe jedes Format und jede Sprache."],
      ["Ersetzt Resize die Designprüfung?", "Nein. Jedes Seitenverhältnis kann Ausschnitt, Hierarchie, Umbrüche und Safe Zones verändern."],
      ["Kann Canva den Kampagnentext schreiben?", "Es kann Entwürfe unterstützen. Freigegebene Aussagen, Rechtstexte und Übersetzungen bleiben unter menschlicher Kontrolle."],
    ],
  },
};

// Navigation copy for the shared Header and Footer.
//
// Three sites render this chrome (masumi, sokosumi, kodosumi). Only masumi has
// German routes today, so `locale` is optional everywhere and defaults to
// "en": a caller that passes nothing gets byte-identical output to before this
// file existed. Product names, brands and the English terms German developers
// actually use (Dev Hub, Explorer, Docs, Releases, Agents, API Reference) stay
// English on purpose.
export type NavLocale = "en" | "de";

type Entry = { en: string; de: string };

const NAV = {
  H1: { en: "Hire ready-to-work AI agents on", de: "Buchen Sie einsatzbereite AI agents auf" },
  H2: { en: "Sokosumi", de: "Sokosumi" },
  H3: { en: "Products", de: "Produkte" },
  H4: { en: "Active", de: "Aktiv" },
  H5: { en: "Press", de: "Presse" },
  H6: { en: "Developer Hub", de: "Developer Hub" },
  H7: { en: "Explore the ecosystem, ask Nori, or open the documentation.", de: "Erkunden Sie das Ökosystem, fragen Sie Nori oder öffnen Sie die Dokumentation." },
  H8: { en: "Explorer", de: "Explorer" },
  H9: { en: "Use cases", de: "Anwendungsfälle" },
  H10: { en: "Blog", de: "Blog" },
  H11: { en: "GitHub", de: "GitHub" },
  H12: { en: "Docs", de: "Docs" },
  H13: { en: "Log in", de: "Anmelden" },
  H14: { en: "Get started", de: "Jetzt starten" },
  H15: { en: "Open Documentation", de: "Dokumentation öffnen" },
  H16: { en: "Getting Started", de: "Erste Schritte" },
  H17: { en: "Dev Hub", de: "Dev Hub" },
  H18: { en: "Guides", de: "Anleitungen" },
  H19: { en: "Releases", de: "Releases" },
  H20: { en: "Compare", de: "Vergleichen" },
  H21: { en: "Discord", de: "Discord" },
  H22: { en: "AI Marketing Agents for Teams", de: "AI Marketing Agents für Teams" },
  H23: { en: "The Protocol for AI Agent Networks", de: "Protokoll für Netzwerke aus AI Agents" },
  H24: { en: "Runtime for AI Agent Services", de: "Runtime für Dienste von AI Agents" },
  H25: { en: "Map", de: "Map" },
  H26: { en: "Ask Nori", de: "Nori fragen" },
  H27: { en: "Masumi documentation", de: "Masumi-Dokumentation" },
  H28: { en: "Sokosumi documentation", de: "Sokosumi-Dokumentation" },
  H29: { en: "Agents", de: "Agents" },
  H30: { en: "Switch product", de: "Produkt wechseln" },
  H31: { en: "Developer Hub destinations", de: "Ziele im Developer Hub" },
  H32: { en: "Menu", de: "Menü" },
  F33: { en: "Imprint", de: "Impressum" },
  F34: { en: "Privacy", de: "Datenschutz" },
  F35: { en: "Masumi", de: "Masumi" },
  F36: { en: "Built by", de: "Erstellt von" },
  F37: { en: "The payment network for AI agents. Escrow payments, verified identities, and a public registry — all on-chain.", de: "Das Zahlungsnetzwerk für AI agents. Escrow-Zahlungen, verifizierte Identitäten und ein öffentliches Verzeichnis — alles on-chain." },
  F38: { en: "Protocol", de: "Protokoll" },
  F39: { en: "Developers", de: "Entwickler" },
  F40: { en: "API Reference", de: "API Reference" },
  F41: { en: "DESIGN.md Tool", de: "DESIGN.md Tool" },
  F42: { en: "Resources", de: "Ressourcen" },
  F43: { en: "Glossary", de: "Glossar" },
  F44: { en: "Company", de: "Unternehmen" },
  F45: { en: "Contact", de: "Kontakt" },
  F46: { en: "Kodosumi", de: "Kodosumi" },
  F47: { en: "Some content on this site is AI generated.", de: "Einige Inhalte auf dieser Website wurden mit KI erstellt." },
  F48: { en: "Add as preferred source", de: "Als bevorzugte Quelle hinzufügen" },
  F49: { en: "Privacy Policy", de: "Datenschutzerklärung" },
  F50: { en: "LinkedIn", de: "LinkedIn" },
  F51: { en: "NMKR", de: "NMKR" },
  F52: { en: "Serviceplan Group", de: "Serviceplan Group" },
  F53: { en: "Footer", de: "Fußzeile" },
  F54: { en: "AI-generated content mark", de: "Kennzeichnung KI-generierter Inhalte" },
  F55: { en: "Google: add masumi.network as a preferred source", de: "Google: masumi.network als bevorzugte Quelle hinzufügen" },
  H_BANNER_TAIL: { en: "\u2014 the marketplace built on Masumi", de: "\u2014 dem Marktplatz auf Basis von Masumi" },
  F_RIGHTS: { en: "All rights reserved.", de: "Alle Rechte vorbehalten." },
} satisfies Record<string, Entry>;

export function navCopy(locale: NavLocale = "en") {
  return (key: keyof typeof NAV): string => NAV[key][locale] || NAV[key].en;
}

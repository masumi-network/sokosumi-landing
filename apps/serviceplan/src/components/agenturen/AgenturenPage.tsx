"use client";

import { FormEvent, useState } from "react";
import { submitAgenturenAnalysis, sendDemoNotification } from "@/lib/submitForm";

/* Copy: Textmanuskript v3 (2026-09-02) + LP-Briefing (advalyze, 2026-09-01).
   "Sokosumi" bleibt gemäß Manuskript-Regel und LP-Briefing draußen.
   Sektion 3 (Social Proof) und die Logo-Wand warten auf Freigaben.
   Startbar ist ausschließlich die Wettbewerbsanalyse (gleicher Endpoint wie
   die Startseite); die übrigen Themen sind sichtbar, aber nicht wählbar. */

const TOPICS = [
  { key: "wettbewerb", label: "Wettbewerbsanalyse", available: true },
  { key: "pitch", label: "Recherche für einen Pitch", available: false },
  { key: "update", label: "Kurzes Wettbewerbs-Update", available: false },
  { key: "dashboard", label: "Reporting-Dashboard", available: false },
  { key: "markt", label: "Marktüberblick & Trends", available: false },
  { key: "zielgruppe", label: "Zielgruppen-Insights", available: false },
  { key: "geo", label: "GEO- & KI-Sichtbarkeit", available: false },
  { key: "content", label: "Content- & Social-Media-Audit", available: false },
] as const;

const FAQ: { q: string; a: string }[] = [
  {
    q: "Was kostet das, und was passiert, wenn die Credits aufgebraucht sind?",
    a: "Der Einstieg ist kostenlos mit 200 Credits pro Monat. Danach gibt es Pakete ab 25 € im Monat mit größerem Kontingent, ab Starter lassen sich Credits bei Bedarf nachkaufen. Vor dem Start einer Aufgabe sehen Sie eine Kostenschätzung und können sie abbrechen oder ändern.",
  },
  {
    q: "Wo liegen unsere Daten, und wird damit trainiert?",
    a: "Das Hosting liegt in Deutschland, DSGVO-konform und EU AI Act konform. Zugriffe erteilen Sie gezielt und können sie jederzeit widerrufen. Freigegebene Dateien überschreibt niemand. Die Agenten legen immer eine neue Version an.",
  },
  {
    q: "Wie unterscheiden sich die Serviceplan Agents von anderen AI-Lösungen?",
    a: "In drei Punkten: Sie bekommen ein fertiges Dokument oder ein interaktives Dashboard statt einer Chat-Antwort. Die Recherche läuft über lizenzierte Quellen (Statista, GWI, DataForSEO) statt über Web-Suche. Das Wissen über Ihre Marke und Ihre Kunden liegt als Bibliothek für das ganze Team, nicht als Gedächtnis in einem einzelnen Konto.",
  },
  {
    q: "Welche Tools lassen sich verbinden?",
    a: "Live verbindbar sind Google Search Console und Google Analytics mit Leserechten. Beauftragen und Dateien austauschen können Sie über E-Mail, WhatsApp und OneDrive. Weitere Verbindungen kommen.",
  },
  {
    q: "Was, wenn das Ergebnis nicht taugt?",
    a: "Dann lenken Sie um, statt neu zu starten. Eine laufende Aufgabe korrigieren Sie per Kommentar und schicken sie in eine andere Richtung. Der Mensch bleibt in der Schleife. Was zurückkommt, ist eine Arbeitsgrundlage, die Sie prüfen und freigeben. Keine Fertiglieferung ohne Ihre Kontrolle.",
  },
  {
    q: "Müssen wir unsere Arbeitsweise umstellen?",
    a: "Nein. Kein Login fürs Team, keine Schulung, kein Prompt-Training. Sie schreiben eine Mail, setzen den AI-Coworker ins CC oder leiten die Kundenmail weiter. Genau das zeigen die drei Fälle weiter oben.",
  },
  {
    q: "DSGVO und EU AI Act: Was können wir dem Kunden sagen?",
    a: "Die Verarbeitung läuft in Deutschland. Jeder Arbeitsschritt ist einsehbar und korrigierbar. Jede Aussage lässt sich bis zur Quelle nachprüfen. Im Kundengespräch zeigen Sie nicht nur das Ergebnis, sondern auch den Weg dorthin.",
  },
  {
    q: "Wer steht dahinter?",
    a: "Serviceplan ist Europas größte inhabergeführte Agenturgruppe, mit über 50 Jahren Marketing-Expertise. Die AI-Coworker sind für Marketingarbeit gebaut, weil sie in einer Agentur entstanden sind. Von einer Agentur gebaut. Für Agenturen.",
  },
];

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed && !/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function scrollToForm() {
  document
    .getElementById("starten")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ArrowCircle() {
  return (
    <span className="ag-arrow-circle" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12h14m0 0-6-6m6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function AgenturenPage() {
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [taskState, setTaskState] = useState<
    "idle" | "sending" | "done" | "error"
  >("idle");

  const [demo, setDemo] = useState({
    name: "",
    agency: "",
    email: "",
    topic: "",
  });
  const [demoState, setDemoState] = useState<
    "idle" | "sending" | "done" | "error"
  >("idle");

  async function handleAnalysisSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (taskState === "sending") return;
    setTaskState("sending");
    const ok = await submitAgenturenAnalysis(email, normalizeUrl(websiteUrl));
    setTaskState(ok ? "done" : "error");
  }

  async function handleDemoSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (demoState === "sending") return;
    setDemoState("sending");
    const ok = await sendDemoNotification({
      name: demo.name,
      email: demo.email,
      websiteUrl: demo.agency,
      category: demo.topic || "Demo-Termin (Agenturen-LP)",
      source: "agenturen",
    });
    setDemoState(ok ? "done" : "error");
  }

  return (
    <div className="ag">
      {/* ===== 1 Header (dunkle Bühne wie die Startseite) ===== */}
      <div className="ag-stage">
        <div className="ag-stage-inner">
          <div className="ag-topbar">
            <span className="ag-wordmark">
              Serviceplan <span>Agents</span>
            </span>
            <div className="ag-topbar-cta">
              <a href="#demo" className="ag-navlink">
                Demo-Termin
              </a>
              <a href="#starten" className="ag-btn ag-btn-red ag-btn-nav">
                Kostenlos starten
              </a>
            </div>
          </div>

          <section className="ag-header">
            <div className="ag-hdr">
              <div className="ag-hdr-copy">
                <p className="ag-eyebrow">Für Agenturen</p>
                <h1>
                  AI-Coworker, die Sie bei Ihren Aufgaben unterstützen.
                  <span className="ag-soft">
                    Recherche, Analysen, Reportings, interaktive Dashboards.
                  </span>
                </h1>
                <ul className="ag-bullets">
                  <li>
                    Kommunikation per E-Mail.{" "}
                    <span>Kein Prompt, keine Einarbeitung.</span>
                  </li>
                  <li>
                    Entwickelt von Serviceplan.{" "}
                    <span>Über 50 Jahre Marketing-Expertise.</span>
                  </li>
                  <li>
                    Einfach ausprobieren.{" "}
                    <span>200 Credits im Monat, ohne Kreditkarte.</span>
                  </li>
                </ul>
                <div className="ag-btn-row">
                  <a href="#starten" className="ag-btn ag-btn-red">
                    Erste Aufgabe kostenlos starten
                  </a>
                  <a href="#demo" className="ag-btn ag-btn-white">
                    Demo-Termin buchen
                    <ArrowCircle />
                  </a>
                </div>
                <div className="ag-badges">
                  <span className="ag-badge">Hosting in Deutschland</span>
                  <span className="ag-badge">DSGVO</span>
                  <span className="ag-badge">EU AI Act</span>
                </div>
              </div>

              <div className="ag-hdr-visual" aria-hidden="true">
                <div className="ag-seq">
                  <div className="ag-seq-node">
                    <svg viewBox="0 0 24 24">
                      <rect x="3" y="5" width="18" height="14" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                    Aufgabe per Mail
                  </div>
                  <div className="ag-seq-arrow">→</div>
                  <div className="ag-seq-node">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="3.5" />
                      <path d="M5 20c1.2-3.4 3.9-5 7-5s5.8 1.6 7 5" />
                    </svg>
                    AI-Coworker arbeitet
                  </div>
                  <div className="ag-seq-arrow">→</div>
                  <div className="ag-seq-node">
                    <svg viewBox="0 0 24 24">
                      <path d="M6 3h8l4 4v14H6z" />
                      <path d="M14 3v4h4" />
                      <path d="M9 13h6M9 16h6" />
                    </svg>
                    Ergebnis im Postfach
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ===== 2 Use Cases ===== */}
      <section id="cases" className="ag-section">
        <div className="ag-wrap">
          <div className="ag-band">
            <h2 className="ag-h2">Das kennt jede Agentur.</h2>
            <p className="ag-lead">Der Auftragsbestand wächst. Das Team nicht.</p>
            <div className="ag-band-grid">
              <p className="ag-band-item">
                Der Pitch ist Montag. Die Wettbewerbsanalyse steht noch nicht.
                <span>→ Fall 1</span>
              </p>
              <p className="ag-band-item">
                „Können Sie mir kurz was zum Wettbewerb schicken?“ „Kurz“ heißt
                in zwei Stunden.<span>→ Fall 2</span>
              </p>
              <p className="ag-band-item">
                Der Kunde will Zahlen sehen. Das Reporting baut wieder jemand
                von Hand.<span>→ Fall 3</span>
              </p>
            </div>
            <p className="ag-bridge">
              Für keines dieser drei Probleme brauchen Sie ein Rollout, ein
              Tool-Budget oder eine Freigabe. Sie brauchen jemanden, dem Sie die
              Aufgabe geben können.
            </p>
          </div>

          <div className="ag-rail-hint">
            <h3 className="ag-h3">Drei Fälle aus dem Agenturalltag</h3>
            <span>seitlich scrollen →</span>
          </div>

          <div className="ag-rail">
            {/* Fall 1 */}
            <article className="ag-case">
              <div className="ag-case-head">
                <p className="ag-case-num">Fall 1: Pitch-Vorbereitung</p>
                <h3 className="ag-h3">Die komplette Recherche fürs Pitch-Deck</h3>
                <p className="ag-case-benefit">
                  Ein Auftrag: Wettbewerbsanalyse, Zielgruppe und strategische
                  Ableitung.
                </p>
              </div>
              <div className="ag-case-body">
                <h4>Die Mail, die Sie schreiben</h4>
                <div className="ag-mail">
                  <div className="ag-mail-hdr">
                    <b>An:</b> hannah@serviceplan-agents.com
                    <br />
                    <b>Betreff:</b> Recherche Pitch [Kunde]
                  </div>
                  <p className="ag-mail-body">
                    „Hannah, wir pitchen Donnerstag bei [Kunde], Kategorie
                    [Branche]. Ich brauche drei Dinge: die relevantesten
                    Wettbewerber mit Positionierung und laufenden Kampagnen,
                    eine Zielgruppenanalyse sowie daraus abgeleitet einen
                    Vorschlag für die Kampagnenstrategie. Als Dokument fürs
                    Deck.“
                  </p>
                </div>
                <h4>Was passiert</h4>
                <ol className="ag-steps">
                  <li>
                    Hannah recherchiert Wettbewerber und Zielgruppe in Statista,
                    GWI und DataForSEO. Lizenzierter Direktzugriff, keine
                    Web-Suche.
                  </li>
                  <li>
                    Elena leitet daraus die Kampagnenstrategie ab. Sie wählt das
                    passende Framework.
                  </li>
                  <li>
                    Läuft es in die falsche Richtung, lenken Sie per Kommentar
                    um. Kein Neustart nötig.
                  </li>
                </ol>
                <h4>Was zurückkommt</h4>
                <ul className="ag-result">
                  <li>Wettbewerber-Set mit Positionierung und Kernbotschaften</li>
                  <li>
                    Zielgruppenanalyse: Demografie, Einstellungen, Kaufverhalten
                  </li>
                  <li>Kampagnenstrategie mit Begründung</li>
                  <li>Quellenverzeichnis, jede Aussage belegt</li>
                </ul>
                <p className="ag-case-facts">
                  <span>
                    <b>Lieferung</b> ~15 Minuten
                  </span>
                  <span>
                    <b>Output</b> PDF oder PowerPoint
                  </span>
                </p>
              </div>
              <div className="ag-case-foot">
                <button
                  type="button"
                  className="ag-btn ag-btn-red ag-btn-case"
                  onClick={scrollToForm}
                >
                  Mit der Wettbewerbsanalyse starten
                </button>
              </div>
            </article>

            {/* Fall 2 */}
            <article className="ag-case">
              <div className="ag-case-head">
                <p className="ag-case-num">Fall 2: Die Anfrage zwischendurch</p>
                <h3 className="ag-h3">
                  Das Wettbewerbs-Update, das der Kunde nebenbei erwartet
                </h3>
                <p className="ag-case-benefit">
                  Kundenmail weiterleiten. Kein Prompt, kein neues Briefing.
                </p>
              </div>
              <div className="ag-case-body">
                <h4>Die Mail, die Sie weiterleiten</h4>
                <div className="ag-mail">
                  <div className="ag-mail-hdr">
                    <b>An:</b> hannah@serviceplan-agents.com
                    <br />
                    <b>Betreff:</b> WG: Kurze Frage zum Wettbewerb
                  </div>
                  <p className="ag-mail-body">
                    „Hannah, weiter unten: [Kunde] will wissen, was
                    [Wettbewerber] gerade macht. Zwei Seiten reichen.“
                    <br />
                    <br />
                    <span className="ag-faint">
                      --- Weitergeleitete Nachricht ---
                      <br />
                      „Können Sie mir kurz was zum Wettbewerb schicken?“
                    </span>
                  </p>
                </div>
                <h4>Was passiert</h4>
                <ol className="ag-steps">
                  <li>Die weitergeleitete Kundenmail ist das Briefing</li>
                  <li>
                    Marke, Kunden und Kernwettbewerber liegen bereits in der
                    Wissensbibliothek. Die zweite Anfrage ist kürzer als die
                    erste.
                  </li>
                  <li>Den Stand fragen Sie zwischendurch per WhatsApp ab</li>
                </ol>
                <h4>Was zurückkommt</h4>
                <ul className="ag-result">
                  <li>Zwei Seiten, direkt weiterleitbar</li>
                  <li>Was der Wettbewerber aktuell kommuniziert, mit Belegen</li>
                  <li>Einordnung: was davon für den Kunden zählt</li>
                  <li>Quellen für den nächsten Termin</li>
                </ul>
                <p className="ag-case-facts">
                  <span>
                    <b>Lieferung</b> ~15 Minuten
                  </span>
                  <span>
                    <b>Output</b> PDF oder PowerPoint
                  </span>
                </p>
              </div>
              <div className="ag-case-foot">
                <button
                  type="button"
                  className="ag-btn ag-btn-red ag-btn-case"
                  onClick={scrollToForm}
                >
                  Mit der Wettbewerbsanalyse starten
                </button>
              </div>
            </article>

            {/* Fall 3 */}
            <article className="ag-case">
              <div className="ag-case-head">
                <p className="ag-case-num">Fall 3: Quick Dashboard</p>
                <h3 className="ag-h3">
                  Das Reporting-Dashboard für den monatlichen Jour Fixe
                </h3>
                <p className="ag-case-benefit">
                  Einmal erstellt, danach immer aktuell.
                </p>
              </div>
              <div className="ag-case-body">
                <h4>Die Mail, die Sie schreiben</h4>
                <div className="ag-mail">
                  <div className="ag-mail-hdr">
                    <b>An:</b> alex@serviceplan-agents.com
                    <br />
                    <b>Betreff:</b> Dashboard Monatsmeeting [Kunde]
                  </div>
                  <p className="ag-mail-body">
                    „Alex, Search Console und Analytics sind verbunden. Erstelle
                    ein Dashboard mit Sichtbarkeit, Traffic und
                    Top-Landingpages, filterbar nach Zeitraum, teilbar per
                    Link.“
                  </p>
                </div>
                <h4>Was passiert</h4>
                <ol className="ag-steps">
                  <li>
                    Google Search Console und Google Analytics einmal in wenigen
                    Schritten verbinden, mit Leserechten. Danach für alle
                    Agenten verfügbar.
                  </li>
                  <li>
                    Alex baut ein interaktives Dashboard. Kein Screenshot, keine
                    Zahlenliste.
                  </li>
                  <li>Jede Kennzahl ist bis zur Quelle nachvollziehbar</li>
                </ol>
                <h4>Was zurückkommt</h4>
                <ul className="ag-result">
                  <li>Filterbares Dashboard statt statischem Report</li>
                  <li>
                    Sichtbarkeit, Traffic und Top-Landingpages in einer Ansicht
                  </li>
                  <li>
                    Teilbar per Link mit Leserechten. Der Kunde klickt selbst.
                  </li>
                  <li>Nächsten Monat wiederholbar, ohne neues Briefing</li>
                </ul>
                <p className="ag-case-facts">
                  <span>
                    <b>Verbunden</b> Search Console, Analytics
                  </span>
                  <span>
                    <b>Output</b> interaktives Dashboard
                  </span>
                </p>
              </div>
              <div className="ag-case-foot">
                <p className="ag-case-later">
                  In der Plattform beauftragbar — der kostenlose Einstieg
                  startet mit der Wettbewerbsanalyse.
                </p>
                <a href="#demo" className="ag-textlink">
                  Diesen Fall im Demo-Termin ansehen
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ===== 4 Kostenlos starten (primäre Conversion) ===== */}
      <section id="starten" className="ag-section">
        <div className="ag-wrap">
          <div className="ag-form-stage">
            <div className="ag-form-wrap">
              <div className="ag-head ag-center">
                <p className="ag-eyebrow">Kostenlos starten</p>
                <h2 className="ag-h2 ag-h2-ondark">
                  Ihre erste Aufgabe: eine Wettbewerbsanalyse.
                </h2>
                <p className="ag-lead ag-lead-ondark">
                  Zwei Felder. Kein Passwort, keine Firmendaten, keine
                  Kreditkarte.
                </p>
              </div>

              {taskState === "done" ? (
                <div className="ag-success">
                  <b>Ihre Wettbewerbsanalyse läuft.</b>
                  <p>
                    Ihr AI-Coworker hat die Aufgabe angenommen und meldet sich
                    per E-Mail an {email} — in der Regel mit dem Ergebnis in
                    etwa 15 Minuten. Ihr kostenloser Zugang mit 200 Credits pro
                    Monat ist damit eingerichtet.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAnalysisSubmit}>
                  <p className="ag-picker-label">
                    Womit Sie starten — und was danach möglich ist:
                  </p>
                  <div className="ag-chips">
                    {TOPICS.map((t) =>
                      t.available ? (
                        <span key={t.key} className="ag-chip is-active">
                          {t.label}
                        </span>
                      ) : (
                        <span key={t.key} className="ag-chip is-locked">
                          {t.label}
                          <small>danach</small>
                        </span>
                      )
                    )}
                  </div>
                  <p className="ag-picker-hint">
                    Der kostenlose Einstieg startet mit der Wettbewerbsanalyse.
                    Alle weiteren Aufgaben beauftragen Sie danach direkt per
                    E-Mail — so wie in den drei Fällen oben.
                  </p>

                  <div className="ag-form-fields">
                    <div className="ag-field">
                      <label htmlFor="ag-mail">Ihre Arbeits-E-Mail</label>
                      <input
                        type="email"
                        id="ag-mail"
                        required
                        maxLength={256}
                        placeholder="vorname.nachname@ihre-agentur.de"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="ag-field">
                      <label htmlFor="ag-url">
                        Website, deren Wettbewerb analysiert werden soll
                      </label>
                      <input
                        type="text"
                        id="ag-url"
                        required
                        maxLength={256}
                        placeholder="https://ihr-kunde.de"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                      />
                      <p className="ag-field-hint">
                        Ihre eigene Website oder die eines Kunden.
                      </p>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="ag-btn ag-btn-red ag-btn-lg"
                    disabled={taskState === "sending"}
                  >
                    {taskState === "sending"
                      ? "Wird gestartet …"
                      : "Kostenlose Wettbewerbsanalyse starten"}
                  </button>
                  {taskState === "error" && (
                    <p className="ag-error">
                      Das hat gerade nicht geklappt. Bitte versuchen Sie es noch
                      einmal, oder buchen Sie unten einen Demo-Termin.
                    </p>
                  )}
                </form>
              )}

              <div className="ag-form-trust">
                <span className="ag-badge">Hosting in Deutschland</span>
                <span className="ag-badge">DSGVO</span>
                <span className="ag-badge">EU AI Act</span>
                <span className="ag-badge">
                  Von einer Agentur gebaut. Für Agenturen.
                </span>
              </div>
              <p className="ag-form-note">
                Kostenlos starten mit 200 Credits im Monat. Keine Kreditkarte,
                keine Follow-up-Anrufe.
              </p>
              <p className="ag-demo-line ag-demo-line-ondark">
                Lieber erst sprechen? <a href="#demo">Demo-Termin buchen</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5 Preise ===== */}
      <section id="preise" className="ag-section">
        <div className="ag-wrap">
          <div className="ag-head ag-center">
            <p className="ag-eyebrow">Preise</p>
            <h2 className="ag-h2">
              Kostenlos anfangen. Danach ein Paket, das zum Volumen passt.
            </h2>
            <p className="ag-lead">
              Jedes Paket enthält ein monatliches Credit-Kontingent. Vor dem
              Start jeder Aufgabe geben Ihnen die Agenten eine Kostenschätzung.
            </p>
          </div>

          <div className="ag-plans">
            <div className="ag-plan">
              <p className="ag-plan-name">Free</p>
              <p className="ag-plan-price">
                0 €<small> / Monat</small>
              </p>
              <p className="ag-plan-credits">200 Credits pro Monat*</p>
              <p className="ag-plan-claim">
                Der Einstieg in die Arbeit mit Marketing-Agenten
              </p>
              <ul className="ag-plan-feats">
                <li>Zugang zu den Agenten per E-Mail und WhatsApp</li>
              </ul>
            </div>
            <div className="ag-plan">
              <p className="ag-plan-name">Starter</p>
              <p className="ag-plan-price">
                25 €<small> / Monat</small>
              </p>
              <p className="ag-plan-credits">1.500 Credits pro Monat*</p>
              <p className="ag-plan-claim">Ihr Marketing-Research-Team</p>
              <ul className="ag-plan-feats">
                <li>Credits bei Bedarf nachkaufen</li>
                <li>Office-Dokumente lesen und erstellen</li>
              </ul>
            </div>
            <div className="ag-plan is-featured">
              <p className="ag-plan-name">Standard</p>
              <p className="ag-plan-price">
                75 €<small> / Monat</small>
              </p>
              <p className="ag-plan-credits">5.000 Credits pro Monat*</p>
              <p className="ag-plan-claim">
                Das komplette Marketing-Team an AI-Coworkern
              </p>
              <ul className="ag-plan-feats">
                <li>Wiederkehrende Aufgaben planen</li>
              </ul>
            </div>
            <div className="ag-plan">
              <p className="ag-plan-name">Pro</p>
              <p className="ag-plan-price">
                200 €<small> / Monat</small>
              </p>
              <p className="ag-plan-credits">15.000 Credits pro Monat*</p>
              <p className="ag-plan-claim">Mehr schaffen mit Premium Skills</p>
              <ul className="ag-plan-feats">
                <li>Zugang zu Premium Skills</li>
                <li>Eigene Vorlagen für Ausgabedateien</li>
                <li>Früher Zugang zu neuen Agenten und Features</li>
              </ul>
            </div>
            <div className="ag-plan">
              <p className="ag-plan-name">Enterprise</p>
              <p className="ag-plan-price">Custom</p>
              <p className="ag-plan-credits">&nbsp;</p>
              <p className="ag-plan-claim">
                AI-Coworker auf Ihren Bedarf zugeschnitten
              </p>
              <ul className="ag-plan-feats">
                <li>Enterprise-Support und SLAs</li>
                <li>Individuelle Daten- und Tool-Integrationen</li>
                <li>Erweiterte Sicherheitsfunktionen</li>
                <li>Zugang zu allen Premium Skills</li>
                <li>VPC- und On-Premise-Deployment</li>
              </ul>
            </div>
          </div>
          <p className="ag-plan-note">
            * Pakete bauen aufeinander auf: jedes höhere enthält alles aus dem
            darunter.
          </p>

          <h3 className="ag-h3 ag-tbl-heading">
            Was ist der Unterschied zu anderen AI-Lösungen?
          </h3>
          <div className="ag-tbl-scroll">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Generische AI-Assistenten</th>
                  <th>Serviceplan Agents</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="ag-dimension">
                    Wissen über Marke, Kunden, Wettbewerber
                  </td>
                  <td className="ag-generic">
                    Gedächtnis je Nutzerkonto, keine geteilte und verwaltbare
                    Grundlage fürs Team
                  </td>
                  <td className="ag-ours">
                    Wissensbibliothek für das ganze Team: einsehbar,
                    korrigierbar, löschbar
                  </td>
                </tr>
                <tr>
                  <td className="ag-dimension">Was zurückkommt</td>
                  <td className="ag-generic">
                    Eine Antwort im Chat, die Sie noch in Form bringen, oder ein
                    generisches Dokument
                  </td>
                  <td className="ag-ours">
                    PDF, PowerPoint, Excel oder ein interaktives Dashboard
                  </td>
                </tr>
                <tr>
                  <td className="ag-dimension">Datenquellen</td>
                  <td className="ag-generic">
                    Web-Recherche und Trainingsdaten. Lizenzierte Marktforschung
                    ist nicht enthalten
                  </td>
                  <td className="ag-ours">
                    Premium-Daten von Statista, GWI, DataForSEO etc. im
                    Direktzugriff. Integration in andere Systeme, bspw. Search
                    Console und Analytics.
                  </td>
                </tr>
                <tr>
                  <td className="ag-dimension">Nachvollziehbarkeit</td>
                  <td className="ag-generic">
                    Sie sehen das Ergebnis, nicht durchgängig den Weg dorthin
                  </td>
                  <td className="ag-ours">
                    Jeder Arbeitsschritt einsehbar, jede Aussage bis zur Quelle
                    nachvollziehbar
                  </td>
                </tr>
                <tr>
                  <td className="ag-dimension">Wo die Daten liegen</td>
                  <td className="ag-generic">
                    Je Anbieter unterschiedlich, häufig außerhalb der EU
                  </td>
                  <td className="ag-ours">
                    Hosting in Deutschland, DSGVO-konform, EU AI Act konform
                  </td>
                </tr>
                <tr>
                  <td className="ag-dimension">Wie beauftragt wird</td>
                  <td className="ag-generic">
                    Ein Fenster, das Sie öffnen und in dem Sie formulieren
                  </td>
                  <td className="ag-ours">
                    E-Mail, Weiterleitung, ins CC setzen, WhatsApp, OneDrive
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <a href="#starten" className="ag-backlink">
            Zurück zum Formular: kostenlos starten
          </a>
        </div>
      </section>

      {/* ===== 6 Verbreitung ===== */}
      <section id="kunden" className="ag-section ag-section-tight">
        <div className="ag-wrap">
          <div className="ag-head ag-center">
            <p className="ag-eyebrow">Verbreitung</p>
            <h2 className="ag-h2">
              Über 500 Unternehmen nutzen Serviceplan Agents.
            </h2>
            <p className="ag-lead">Kein Pilotprojekt mit drei Testkunden.</p>
          </div>
          <a href="#starten" className="ag-backlink">
            Zurück zum Formular: kostenlos starten
          </a>
        </div>
      </section>

      {/* ===== 7 Demo-Termin (sekundäre Conversion) ===== */}
      <section id="demo" className="ag-section">
        <div className="ag-wrap">
          <div className="ag-demo-box">
            <p className="ag-eyebrow">Lieber sprechen?</p>
            <h3 className="ag-h3 ag-demo-heading">
              No worries: Kein Pitch, keine Folien. Wir arbeiten an einer Ihrer
              Aufgaben.
            </h3>
            <p className="ag-dim">
              Sie bringen eine Aufgabe mit, die gerade ansteht. Wir richten sie
              gemeinsam ein. Sie gehen mit dem Ergebnis aus dem Termin.
            </p>
            <div className="ag-demo-facts">
              <div>
                <b>Dauer</b>
                <span>30 Minuten</span>
              </div>
              <div>
                <b>Womit Sie rausgehen</b>
                <span>
                  Sie gehen mit einem konkreten Ergebnis aus dem Termin.
                </span>
              </div>
            </div>

            {demoState === "done" ? (
              <div className="ag-success ag-success-light">
                <b>Ihre Anfrage ist angekommen.</b>
                <p>
                  Wir melden uns per E-Mail an {demo.email}, um einen Termin zu
                  finden.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit}>
                <div className="ag-demo-fields">
                  <div className="ag-field ag-field-light">
                    <label htmlFor="ag-d-name">Name</label>
                    <input
                      type="text"
                      id="ag-d-name"
                      required
                      maxLength={256}
                      placeholder="Vor- und Nachname"
                      value={demo.name}
                      onChange={(e) =>
                        setDemo({ ...demo, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="ag-field ag-field-light">
                    <label htmlFor="ag-d-ag">Agentur</label>
                    <input
                      type="text"
                      id="ag-d-ag"
                      required
                      maxLength={256}
                      placeholder="Name der Agentur"
                      value={demo.agency}
                      onChange={(e) =>
                        setDemo({ ...demo, agency: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="ag-field ag-field-light">
                  <label htmlFor="ag-d-mail">Arbeits-E-Mail</label>
                  <input
                    type="email"
                    id="ag-d-mail"
                    required
                    maxLength={256}
                    placeholder="vorname.nachname@ihre-agentur.de"
                    value={demo.email}
                    onChange={(e) =>
                      setDemo({ ...demo, email: e.target.value })
                    }
                  />
                </div>
                <div className="ag-field ag-field-light">
                  <label htmlFor="ag-d-thema">
                    Worüber möchten Sie sprechen?{" "}
                    <span className="ag-faint">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="ag-d-thema"
                    maxLength={256}
                    placeholder="z. B. Wettbewerbsanalysen für Pitches"
                    value={demo.topic}
                    onChange={(e) =>
                      setDemo({ ...demo, topic: e.target.value })
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="ag-btn ag-btn-black ag-btn-lg"
                  disabled={demoState === "sending"}
                >
                  {demoState === "sending"
                    ? "Wird gesendet …"
                    : "Demo-Termin anfragen"}
                </button>
                {demoState === "error" && (
                  <p className="ag-error">
                    Das hat gerade nicht geklappt. Bitte versuchen Sie es noch
                    einmal.
                  </p>
                )}
              </form>
            )}
            <p className="ag-demo-line">
              Wollen Sie es einfach ausprobieren?{" "}
              <a href="#starten">Kostenlos starten, ohne Termin</a>
            </p>
          </div>
        </div>
      </section>

      {/* ===== 8 FAQ ===== */}
      <section id="faq" className="ag-section">
        <div className="ag-wrap ag-wrap-narrow">
          <div className="ag-head ag-center">
            <p className="ag-eyebrow">Offene Fragen</p>
            <h2 className="ag-h2">Was Agenturen vorher wissen wollen.</h2>
          </div>

          {FAQ.map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}

          <div className="ag-faq-cta">
            <a href="#starten" className="ag-btn ag-btn-red">
              Erste Aufgabe kostenlos starten
            </a>
            <p className="ag-demo-line">
              Noch Fragen? <a href="#demo">Demo-Termin buchen</a>
            </p>
          </div>
        </div>
      </section>

      <div className="ag-legal">
        <a
          href="https://www.sokosumi.com/imprint"
          target="_blank"
          rel="noopener"
        >
          Impressum
        </a>
        {" · "}
        <a
          href="https://www.sokosumi.com/privacy-policy"
          target="_blank"
          rel="noopener"
        >
          Datenschutz
        </a>
        {" · "}
        <a
          href="https://www.house-of-communication.com/de/en/brands/plan-net/landingpages/agentic-services/legal-ai-coworkers.html"
          target="_blank"
          rel="noopener"
        >
          Serviceplan Agents Legal
        </a>
        <br />© 2026 Plan.Net Studios GmbH &amp; Co. KG — A Serviceplan Group
        Company
      </div>
    </div>
  );
}

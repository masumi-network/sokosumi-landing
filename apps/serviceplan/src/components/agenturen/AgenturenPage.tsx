"use client";

import { FormEvent, useState } from "react";
import { submitTaskForm, sendDemoNotification } from "@/lib/submitForm";

/* Copy: Textmanuskript v3 (2026-09-02) inkl. der stillen Korrekturen aus dem
   Wireframe v3. "Sokosumi" bleibt gemäß Manuskript-Regel und LP-Briefing
   draußen. Sektion 3 (Social Proof) und die Logo-Wand warten auf Freigaben
   und sind deshalb noch nicht auf der Seite. */

const TOPICS = [
  {
    key: "wettbewerb",
    label: "Recherche für einen Pitch",
    task: "Recherche für einen Neukundenpitch: [Kunde/Branche]. Erstens die relevantesten Wettbewerber mit Positionierung, Kernbotschaften und laufenden Kampagnen. Zweitens eine Zielgruppenanalyse. Drittens daraus abgeleitet ein Vorschlag für die Kampagnenstrategie. Als Dokument fürs Deck.",
  },
  {
    key: "update",
    label: "Kurzes Wettbewerbs-Update",
    task: "Kurzes Wettbewerbs-Update für [Kunde]: was [Wettbewerber] aktuell macht. Zwei Seiten, direkt weiterleitbar, mit Quellen.",
  },
  {
    key: "dashboard",
    label: "Reporting-Dashboard",
    task: "Reporting-Dashboard für [Kunde] aus Search Console und Analytics: Sichtbarkeit, Traffic und Top-Landingpages, filterbar nach Zeitraum, teilbar per Link.",
  },
  {
    key: "markt",
    label: "Marktüberblick & Trends",
    task: "Marktüberblick für [Branche] in Deutschland: Marktvolumen, Wachstumsprognose und die drei Trends, die im nächsten Jahr für [Kunde] relevant werden. Mit Quellen.",
  },
  {
    key: "zielgruppe",
    label: "Zielgruppen-Insights",
    task: "Zielgruppen-Insights für eine Kampagne für [Kunde]: Demografie, Einstellungen und Kaufverhalten der Kernzielgruppe, auf Basis echter Verbraucherdaten.",
  },
  {
    key: "geo",
    label: "GEO- & KI-Sichtbarkeit",
    task: "GEO- und KI-Sichtbarkeitsanalyse für [Kunde]: wie sichtbar die Marke in Google und in KI-Suchsystemen ist, wo sie nicht auftaucht, und was sich daran ändern lässt.",
  },
  {
    key: "content",
    label: "Content- & Social-Media-Audit",
    task: "Content- und Social-Media-Audit für [Kunde]: welche Formate und Themen laufen, wie das im Wettbewerbsvergleich aussieht, und wo die größten Lücken liegen.",
  },
  { key: "eigen", label: "Eigene Aufgabe", task: "" },
] as const;

type TopicKey = (typeof TOPICS)[number]["key"];

const FAQ: { q: string; a: string }[] = [
  {
    q: "Was kostet das, und was passiert, wenn die Credits aufgebraucht sind?",
    a: "Der Einstieg ist kostenlos mit 250 Credits pro Monat. Danach gibt es Pakete ab 25 € im Monat mit größerem Kontingent, ab Starter lassen sich Credits bei Bedarf nachkaufen. Vor dem Start einer Aufgabe sehen Sie eine Kostenschätzung und können sie abbrechen oder ändern.",
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

function scrollToForm() {
  document
    .getElementById("starten")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function AgenturenPage() {
  const [topic, setTopic] = useState<TopicKey>("eigen");
  const [task, setTask] = useState("");
  const [email, setEmail] = useState("");
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

  function pickTopic(key: TopicKey) {
    setTopic(key);
    const t = TOPICS.find((x) => x.key === key);
    setTask(t?.task ?? "");
  }

  function startCase(key: TopicKey) {
    pickTopic(key);
    scrollToForm();
  }

  async function handleTaskSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (taskState === "sending") return;
    setTaskState("sending");
    const ok = await submitTaskForm(email, task, topic);
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
      <div className="ag-topbar">
        <div className="ag-wrap">
          <span className="ag-wordmark">
            Serviceplan <span>Agents</span>
          </span>
        </div>
      </div>

      {/* ===== 1 Header ===== */}
      <section className="ag-header">
        <div className="ag-wrap">
          <div className="ag-hdr">
            <div>
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
                  <span>250 Credits im Monat, ohne Kreditkarte.</span>
                </li>
              </ul>
              <div className="ag-btn-row">
                <a href="#starten" className="ag-btn ag-btn-primary">
                  Erste Aufgabe kostenlos starten
                </a>
                <a href="#demo" className="ag-btn ag-btn-secondary">
                  Demo-Termin buchen
                </a>
              </div>
              <div className="ag-badges">
                <span className="ag-badge">Hosting in Deutschland</span>
                <span className="ag-badge">DSGVO</span>
                <span className="ag-badge">EU AI Act</span>
              </div>
            </div>

            <div className="ag-hdr-visual">
              <div className="ag-seq">
                <div className="ag-seq-node">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                  Aufgabe per Mail
                </div>
                <div className="ag-seq-arrow">→</div>
                <div className="ag-seq-node">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 20c1.2-3.4 3.9-5 7-5s5.8 1.6 7 5" />
                  </svg>
                  AI-Coworker arbeitet
                </div>
                <div className="ag-seq-arrow">→</div>
                <div className="ag-seq-node">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 3h8l4 4v14H6z" />
                    <path d="M14 3v4h4" />
                    <path d="M9 13h6M9 16h6" />
                  </svg>
                  Ergebnis im Postfach
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2 Use Cases ===== */}
      <section id="cases">
        <div className="ag-wrap">
          <div className="ag-band">
            <h2>Das kennt jede Agentur.</h2>
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
            <h3 style={{ margin: 0 }}>Drei Fälle aus dem Agenturalltag</h3>
            <span>seitlich scrollen →</span>
          </div>

          <div className="ag-rail">
            {/* Fall 1 */}
            <article className="ag-case">
              <div className="ag-case-head">
                <p className="ag-case-num">Fall 1: Pitch-Vorbereitung</p>
                <h3>Die komplette Recherche fürs Pitch-Deck</h3>
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
                <h4 style={{ marginTop: 20 }}>Was passiert</h4>
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
                <h4 style={{ marginTop: 20 }}>Was zurückkommt</h4>
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
                  className="ag-btn ag-btn-case"
                  onClick={() => startCase("wettbewerb")}
                >
                  Diesen Fall kostenlos starten
                </button>
              </div>
            </article>

            {/* Fall 2 */}
            <article className="ag-case">
              <div className="ag-case-head">
                <p className="ag-case-num">Fall 2: Die Anfrage zwischendurch</p>
                <h3>Das Wettbewerbs-Update, das der Kunde nebenbei erwartet</h3>
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
                <h4 style={{ marginTop: 20 }}>Was passiert</h4>
                <ol className="ag-steps">
                  <li>Die weitergeleitete Kundenmail ist das Briefing</li>
                  <li>
                    Marke, Kunden und Kernwettbewerber liegen bereits in der
                    Wissensbibliothek. Die zweite Anfrage ist kürzer als die
                    erste.
                  </li>
                  <li>Den Stand fragen Sie zwischendurch per WhatsApp ab</li>
                </ol>
                <h4 style={{ marginTop: 20 }}>Was zurückkommt</h4>
                <ul className="ag-result">
                  <li>Zwei Seiten, direkt weiterleitbar</li>
                  <li>
                    Was der Wettbewerber aktuell kommuniziert, mit Belegen
                  </li>
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
                  className="ag-btn ag-btn-case"
                  onClick={() => startCase("update")}
                >
                  Diesen Fall kostenlos starten
                </button>
              </div>
            </article>

            {/* Fall 3 */}
            <article className="ag-case">
              <div className="ag-case-head">
                <p className="ag-case-num">Fall 3: Quick Dashboard</p>
                <h3>Das Reporting-Dashboard für den monatlichen Jour Fixe</h3>
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
                <h4 style={{ marginTop: 20 }}>Was passiert</h4>
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
                <h4 style={{ marginTop: 20 }}>Was zurückkommt</h4>
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
                <button
                  type="button"
                  className="ag-btn ag-btn-case"
                  onClick={() => startCase("dashboard")}
                >
                  Diesen Fall kostenlos starten
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ===== 4 Kostenlos starten (primäre Conversion) ===== */}
      <section id="starten">
        <div className="ag-wrap">
          <div className="ag-form-wrap">
            <div className="ag-head ag-center" style={{ marginBottom: 30 }}>
              <p className="ag-eyebrow">Kostenlos starten</p>
              <h2>
                Geben Sie den Serviceplan Agents eine Aufgabe aus Ihrem Alltag.
              </h2>
              <p className="ag-lead">
                Zwei Felder. Kein Passwort, keine Firmendaten, keine
                Kreditkarte.
              </p>
            </div>

            {taskState === "done" ? (
              <div className="ag-success">
                <b>Ihre Aufgabe ist unterwegs.</b>
                <p>
                  Ihr AI-Coworker meldet sich per E-Mail an {email} — mit
                  Rückfragen oder direkt mit dem Ergebnis. Ihr kostenloser
                  Zugang mit 250 Credits pro Monat ist damit eingerichtet.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTaskSubmit}>
                <p className="ag-picker-label">
                  Woran arbeiten Sie gerade? Ein Klick befüllt das Aufgabenfeld.
                </p>
                <div className="ag-chips">
                  {TOPICS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      className={`ag-chip${topic === t.key ? " is-active" : ""}`}
                      onClick={() => pickTopic(t.key)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

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
                  <label htmlFor="ag-task">Was soll erledigt werden?</label>
                  <textarea
                    id="ag-task"
                    required
                    maxLength={4000}
                    placeholder="Beschreiben Sie die Aufgabe so, wie Sie sie einem neuen Kollegen geben würden: was Sie brauchen, für wen, und in welcher Form Sie es bekommen möchten."
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                  />
                  <p className="ag-field-hint">
                    Vorbefüllt und jederzeit änderbar. Je konkreter die Aufgabe,
                    desto belastbarer das erste Ergebnis.
                  </p>
                </div>
                <button
                  type="submit"
                  className="ag-btn ag-btn-primary ag-btn-lg"
                  style={{ width: "100%" }}
                  disabled={taskState === "sending"}
                >
                  {taskState === "sending"
                    ? "Wird gestartet …"
                    : "Erste Aufgabe kostenlos starten"}
                </button>
                {taskState === "error" && (
                  <p className="ag-error">
                    Das hat gerade nicht geklappt. Bitte versuchen Sie es noch
                    einmal, oder schreiben Sie direkt an
                    hannah@serviceplan-agents.com.
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
            <p className="ag-field-hint" style={{ marginTop: 13 }}>
              Kostenlos starten mit 250 Credits im Monat. Keine Kreditkarte,
              keine Follow-up-Anrufe.
            </p>
            <p className="ag-demo-line">
              Lieber erst sprechen? <a href="#demo">Demo-Termin buchen</a>
            </p>
          </div>
        </div>
      </section>

      {/* ===== 5 Preise ===== */}
      <section id="preise">
        <div className="ag-wrap">
          <div className="ag-head">
            <p className="ag-eyebrow">Preise</p>
            <h2>Kostenlos anfangen. Danach ein Paket, das zum Volumen passt.</h2>
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
              <p className="ag-plan-credits">250 Credits pro Monat*</p>
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

          <h3 style={{ marginTop: 44 }}>
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
      <section id="kunden">
        <div className="ag-wrap">
          <div className="ag-head" style={{ marginBottom: 0 }}>
            <p className="ag-eyebrow">Verbreitung</p>
            <h2>Über 500 Unternehmen nutzen Serviceplan Agents.</h2>
            <p className="ag-lead">Kein Pilotprojekt mit drei Testkunden.</p>
          </div>
          <a href="#starten" className="ag-backlink">
            Zurück zum Formular: kostenlos starten
          </a>
        </div>
      </section>

      {/* ===== 7 Demo-Termin (sekundäre Conversion) ===== */}
      <section id="demo">
        <div className="ag-wrap">
          <div className="ag-demo-box">
            <p className="ag-eyebrow">Lieber sprechen?</p>
            <h3 style={{ fontSize: "1.55rem" }}>
              No worries: Kein Pitch, keine Folien. Wir arbeiten an einer Ihrer
              Aufgaben.
            </h3>
            <p className="ag-dim" style={{ marginTop: 10 }}>
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
                <span>Sie gehen mit einem konkreten Ergebnis aus dem Termin.</span>
              </div>
            </div>

            {demoState === "done" ? (
              <div className="ag-success">
                <b>Ihre Anfrage ist angekommen.</b>
                <p>
                  Wir melden uns per E-Mail an {demo.email}, um einen Termin zu
                  finden.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit}>
                <div className="ag-demo-fields">
                  <div className="ag-field">
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
                  <div className="ag-field">
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
                <div className="ag-field">
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
                <div className="ag-field">
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
                  className="ag-btn ag-btn-secondary"
                  style={{ width: "100%" }}
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
      <section id="faq">
        <div className="ag-wrap">
          <div className="ag-head">
            <p className="ag-eyebrow">Offene Fragen</p>
            <h2>Was Agenturen vorher wissen wollen.</h2>
          </div>

          {FAQ.map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}

          <div style={{ marginTop: 34 }}>
            <a href="#starten" className="ag-btn ag-btn-primary">
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

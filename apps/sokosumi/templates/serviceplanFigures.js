// Inline figures for the Serviceplan AI dossier. Everything here is
// template-owned (no CMS dependency) and keyed by chapter slug, so the
// diagrams ship with the code and stay in sync with the design system.
const shell = require("./shell");
const i18n = require("../lib/i18n");

const { esc, attr, icon } = shell;
const L = (en, de) => (i18n.locale() === "de" ? de : en);

const LOGO = {
  Serviceplan: "/assets/serviceplan-logo.png",
  Mediaplus: "/assets/logos/mediaplus.svg",
  "Plan.Net": "/assets/logos/plan-net.svg",
  Masumi: "/assets/logos/masumi.svg",
  Sokosumi: "/assets/logos/sokosumi.svg",
  Kodosumi: "/assets/logos/kodosumi.svg",
  NMKR: "/assets/nmkr-logo.svg",
};

const logo = (name, w = 110, h = 24) =>
  LOGO[name] ? `<img src="${attr(LOGO[name])}" alt="${attr(name)}" width="${w}" height="${h}" loading="lazy">` : `<b>${esc(name)}</b>`;

function figure(kind, caption, title, body, wide) {
  return `<figure class="sp-fig sp-fig-${kind}${wide ? " sp-fig-wide" : ""}">
    <figcaption><span>${esc(caption)}</span><strong>${esc(title)}</strong></figcaption>
    ${body}
  </figure>`;
}

function flow(steps) {
  return `<ol class="sp-flow" style="--n:${steps.length}">${steps
    .map(
      (s, i) => `<li>
        <span class="sp-flow-num">${String(i + 1).padStart(2, "0")}</span>
        <strong>${esc(s.title)}</strong>
        ${s.owner ? `<em>${esc(s.owner)}</em>` : ""}
        <small>${esc(s.text)}</small>
      </li>`,
    )
    .join("")}</ol>`;
}

function stack(layers, foundation) {
  return `<div class="sp-stack">
    ${layers
      .map(
        (l, i) => `<div class="sp-stack-layer">
          <span>${String(layers.length - i).padStart(2, "0")}</span>
          <div><strong>${esc(l.title)}</strong><small>${esc(l.text)}</small></div>
          <em>${esc(l.owner || "")}</em>
        </div>`,
      )
      .join("")}
    ${foundation ? `<div class="sp-stack-foundation"><span>${esc(foundation.label)}</span><strong>${esc(foundation.title)}</strong><small>${esc(foundation.text)}</small></div>` : ""}
  </div>`;
}

function matrix(cols, rows, opts = {}) {
  return `<div class="sp-matrix-wrap"><table class="sp-matrix${opts.logos ? " sp-matrix-logos" : ""}">
    <thead><tr><th scope="col"><span class="sr-only">${esc(opts.corner || "")}</span></th>${cols.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map(
        (r) => `<tr><th scope="row">${opts.logos ? logo(r.label, 120, 26) : esc(r.label)}${r.note ? `<small>${esc(r.note)}</small>` : ""}</th>${r.cells
          .map((c) => `<td>${c === "" ? `<span class="sp-matrix-empty" aria-label="—">—</span>` : esc(c)}</td>`)
          .join("")}</tr>`,
      )
      .join("")}</tbody>
  </table></div>`;
}

function chips(rows) {
  return `<div class="sp-chips">${rows
    .map(
      (r) => `<div class="sp-chips-row${r.dark ? " is-dark" : ""}">
        <div class="sp-chips-label"><strong>${esc(r.label)}</strong><small>${esc(r.text || "")}</small></div>
        <ul>${r.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul>
      </div>`,
    )
    .join("")}</div>`;
}

function timeline(events) {
  let lastYear = "";
  return `<ol class="sp-timeline">${events
    .map((e) => {
      const year = e.date.slice(0, 4);
      const showYear = year !== lastYear;
      lastYear = year;
      return `<li${showYear ? ' class="is-year"' : ""}>
        ${showYear ? `<span class="sp-tl-year">${year}</span>` : ""}
        <time datetime="${attr(e.date)}">${esc(e.label)}</time>
        <div><strong>${esc(e.title)}</strong><small>${esc(e.text)}</small>${
          e.href ? `<a href="${attr(e.href)}" rel="noopener">${esc(L("Source", "Quelle"))} ${icon("arrow-up-right", 12)}</a>` : ""
        }</div>
      </li>`;
    })
    .join("")}</ol>`;
}

function network(center, spokes) {
  const W = 640;
  const H = 400;
  const cx = W / 2;
  const cy = H / 2;
  const r = 150;
  const n = spokes.length;
  const pts = spokes.map((s, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { ...s, x: cx + Math.cos(a) * r * 1.55, y: cy + Math.sin(a) * r * 0.82 };
  });
  return `<div class="sp-network">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${attr(center + ": " + spokes.map((s) => s.name).join(", "))}">
      ${pts.map((p) => `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" class="sp-net-line"/>`).join("")}
      <rect x="${cx - 92}" y="${cy - 28}" width="184" height="56" rx="8" class="sp-net-center"/>
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="sp-net-center-t">${esc(center)}</text>
      <text x="${cx}" y="${cy + 15}" text-anchor="middle" class="sp-net-center-s">${esc(L("House of AI", "House of AI"))}</text>
      ${pts
        .map(
          (p) => `<g class="sp-net-node">
            <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5"/>
            <text x="${p.x.toFixed(1)}" y="${(p.y + (p.y < cy ? -16 : 24)).toFixed(1)}" text-anchor="middle" class="sp-net-t">${esc(p.name)}</text>
            <text x="${p.x.toFixed(1)}" y="${(p.y + (p.y < cy ? -30 : 38)).toFixed(1)}" text-anchor="middle" class="sp-net-s">${esc(p.role)}</text>
          </g>`,
        )
        .join("")}
    </svg>
    <ul class="sp-net-list">${spokes.map((s) => `<li><strong>${esc(s.name)}</strong><small>${esc(s.role)}</small></li>`).join("")}</ul>
  </div>`;
}

function shots(items) {
  return `<div class="sp-shots" style="--n:${items.length}">${items
    .map(
      (s, i) => `<div class="sp-shot">
        <img src="${attr(s.src)}" alt="${attr(s.alt)}" width="1200" height="675" loading="lazy">
        <p><span>${String(i + 1).padStart(2, "0")}</span>${esc(s.caption)}</p>
      </div>`,
    )
    .join("")}</div>`;
}

function ledger(cols, rows) {
  return `<div class="sp-matrix-wrap"><table class="sp-matrix sp-ledger">
    <thead><tr>${cols.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map(
        (r) => `<tr>
          <th scope="row">${r.href ? `<a href="${attr(r.href)}" rel="noopener">${esc(r.client)} ${icon("arrow-up-right", 12)}</a>` : esc(r.client)}<small>${esc(r.unit)}</small></th>
          <td>${esc(r.work)}</td>
          <td>${esc(r.ai)}</td>
          <td class="${r.result ? "" : "is-quiet"}">${esc(r.result || L("No public metric", "Keine öffentliche Kennzahl"))}</td>
        </tr>`,
      )
      .join("")}</tbody>
  </table></div>`;
}

function photo(src, alt, caption) {
  return `<div class="sp-photo"><img src="${attr(src)}" alt="${attr(alt)}" width="1152" height="640" loading="lazy"><p>${esc(caption)}</p></div>`;
}

// ---------------------------------------------------------------------------
// Hub: brand × layer matrix

function brandLayerMatrix() {
  const cols = ["Insight.AI", "Creative.AI", "Activate.AI", "Agentic.AI"];
  const rows = [
    { label: "Serviceplan", cells: ["CMO Barometer, research units", "Generate.AI, Luma AI, MAKELINE, HealthContent.AI", "", "Serviceplan Agents (AI Coworkers)"] },
    { label: "Mediaplus", cells: ["Research.AI, Search.AI, Persona.AI, Behave.AI", "Pretest.AI", "Plus.AI, Track.AI, Predict.AI, NE.R.O. AI", ""] },
    { label: "Plan.Net", cells: ["", "Plan.Net Studios", "", "Agentic Services, Masumi · Kodosumi · Sokosumi"] },
  ];
  return figure(
    "matrix",
    L("Brand × layer", "Marke × Ebene"),
    L("Which brand owns which layer of the House of AI", "Welche Marke welche Ebene des House of AI verantwortet"),
    matrix(cols, rows, { logos: true, corner: L("Brand", "Marke") }) +
      `<p class="sp-fig-note">${esc(L("Foundation for all three: the Global Data Platform. Product names as published by Serviceplan Group; empty cells mean no public product in that layer.", "Fundament für alle drei: die Global Data Platform. Produktnamen wie von der Serviceplan Group veröffentlicht; leere Zellen bedeuten kein öffentliches Produkt in dieser Ebene."))}</p>`,
    true,
  );
}

function groupImage(id) {
  const map = {
    architecture: ["/assets/serviceplan-ai/architecture.jpg", L("A strategist arranging cards on a wall grid", "Ein Stratege ordnet Karten auf einem Wandraster")],
    products: ["/assets/serviceplan-ai/products.jpg", L("A marketer working from a laptop and printed briefs", "Ein Marketer arbeitet an Laptop und gedruckten Briefings")],
    guides: ["/assets/serviceplan-ai/guides.jpg", L("Two people reviewing a proposal at a table", "Zwei Personen prüfen ein Angebot am Tisch")],
    proof: ["/assets/serviceplan-ai/proof.jpg", L("An archivist pinning documents to a board", "Ein Archivar heftet Dokumente an eine Tafel")],
  };
  const hit = map[id];
  return hit ? `<img class="sp-group-img" src="${attr(hit[0])}" alt="${attr(hit[1])}" width="1152" height="640" loading="lazy">` : "";
}

// ---------------------------------------------------------------------------
// Chapter figures. `after` = index of the article block the figure follows.

const FIGURES = {
  "house-of-ai": () => ({
    after: 0,
    html: figure(
      "flow",
      L("The loop", "Der Kreislauf"),
      L("How work moves through the House of AI", "Wie Arbeit durch das House of AI läuft"),
      flow([
        { title: "Insight.AI", owner: "Serviceplan · Mediaplus", text: L("Audience, behaviour and journey data become research and direction.", "Zielgruppen-, Verhaltens- und Journey-Daten werden zu Research und Orientierung.") },
        { title: "Creative.AI", owner: "Serviceplan", text: L("Generative systems and production workflows develop and adapt content.", "Generative Systeme und Produktions-Workflows entwickeln und adaptieren Inhalte.") },
        { title: "Activate.AI", owner: "Mediaplus", text: L("Media is planned, activated and optimised continuously.", "Media wird kontinuierlich geplant, aktiviert und optimiert.") },
        { title: "Agentic.AI", owner: "Plan.Net", text: L("Specialised agents take bounded work and feed results back into the data layer.", "Spezialisierte Agents übernehmen abgegrenzte Aufgaben und speisen Ergebnisse zurück in die Datenebene.") },
      ]) + `<p class="sp-fig-note">${esc(L("All four layers read from and write to the Global Data Platform.", "Alle vier Ebenen lesen aus der Global Data Platform und schreiben in sie zurück."))}</p>`,
    ) + photo("/assets/serviceplan-hq.jpg", L("Serviceplan House of Communication, Munich", "Serviceplan House of Communication, München"), L("The physical House of Communication in Munich. Serviceplan describes the House of AI as its digital twin.", "Das physische House of Communication in München. Serviceplan beschreibt das House of AI als dessen digitalen Zwilling.")),
  }),

  "serviceplan-creative-ai": () => ({
    after: 0,
    html: figure(
      "flow",
      L("Creative pipeline", "Kreativ-Pipeline"),
      L("Where each documented system sits in creative production", "Wo jedes dokumentierte System in der Kreativproduktion sitzt"),
      flow([
        { title: L("Brief and direction", "Briefing und Direction"), owner: L("Human teams", "Menschliche Teams"), text: L("Strategy, idea and constraints are set before any model runs.", "Strategie, Idee und Rahmen stehen fest, bevor ein Modell läuft.") },
        { title: "Generate.AI", owner: L("Serviceplan AI labs", "Serviceplan AI Labs"), text: L("Modular generative environment for source assets and fine-tuned campaign systems.", "Modulare generative Umgebung für Ausgangs-Assets und feinjustierte Kampagnensysteme.") },
        { title: "Luma AI", owner: L("Technology partner", "Technologiepartner"), text: L("Video, motion and 3D generation inside group workflows since February 2026.", "Video-, Motion- und 3D-Generierung in Gruppen-Workflows seit Februar 2026.") },
        { title: "MAKELINE", owner: "Serviceplan", text: L("Adaptation, localisation, review and asset management at volume.", "Adaption, Lokalisierung, Freigabe und Asset-Management in großem Umfang.") },
      ]),
    ),
  }),

  "mediaplus-ai": () => ({
    after: 1,
    html: figure(
      "stack",
      L("Mediaplus stack", "Mediaplus-Stack"),
      L("Three layers between data and a media decision", "Drei Ebenen zwischen Daten und einer Media-Entscheidung"),
      stack(
        [
          { title: "Behave.AI", owner: L("Behavioural science", "Verhaltenswissenschaft"), text: "Purchase.AI · Tribes.AI · Resonance.AI" },
          { title: "Plus.AI", owner: L("Conversational interface", "Konversationelle Oberfläche"), text: L("Research, prediction, personas, touchpoint comparison and pre-testing in one operating system.", "Research, Prognose, Personas, Touchpoint-Vergleich und Pretests in einem Betriebssystem.") },
        ],
        { label: L("Foundation", "Fundament"), title: "Global Data Platform", text: L("Distributed data mesh connecting market and client data", "Verteiltes Data Mesh, das Markt- und Kundendaten verbindet") },
      ),
    ),
  }),

  "plan-net-agentic-ai": () => ({
    after: 1,
    html: figure(
      "matrix",
      L("Three expressions", "Drei Ausprägungen"),
      L("Custom system, enterprise unit or self-serve product", "Individuelles System, Enterprise-Einheit oder Self-Service-Produkt"),
      matrix(
        [L("Who it is for", "Für wen"), L("What you get", "Was Sie erhalten"), L("Time to start", "Startzeit"), L("Public since", "Öffentlich seit")],
        [
          { label: "Agentic Services", cells: [L("Enterprises with private data and approvals", "Unternehmen mit privaten Daten und Freigaben"), L("Custom agent systems built by Plan.Net", "Von Plan.Net gebaute individuelle Agent-Systeme"), L("Weeks to months", "Wochen bis Monate"), "2024"] },
          { label: "Plan.Net Agentic AI", cells: [L("Large organisations changing the operating model", "Große Organisationen mit neuem Betriebsmodell"), L("Dedicated business unit: architecture, build, operation", "Eigene Business Unit: Architektur, Aufbau, Betrieb"), L("Programme", "Programm"), L("July 2026", "Juli 2026")] },
          { label: "Sokosumi", cells: [L("Teams and SMEs", "Teams und KMU"), L("Named AI coworkers and specialist agents", "Benannte AI Coworker und Spezial-Agents"), L("Minutes", "Minuten"), L("June 2025", "Juni 2025")] },
        ],
      ),
    ),
  }),

  "mediaplus-ai-products": () => ({
    after: 0,
    html: figure(
      "chips",
      L("Product map", "Produktkarte"),
      L("Every named Mediaplus product by House-of-AI layer", "Jedes benannte Mediaplus-Produkt nach House-of-AI-Ebene"),
      chips([
        { label: "Insight.AI", text: L("Research, visibility, audiences, journeys, behaviour", "Research, Sichtbarkeit, Zielgruppen, Journeys, Verhalten"), items: ["Research.AI", "Search.AI", "Persona.AI", "Touchpoint.AI", "Behave.AI"] },
        { label: "Creative.AI", text: L("Creative validation before launch", "Kreativ-Validierung vor dem Start"), items: ["Pretest.AI"] },
        { label: "Activate.AI", text: L("Data flow, targeting, modelling, planning, orchestration", "Datenfluss, Targeting, Modellierung, Planung, Orchestrierung"), items: ["Track.AI", "NE.R.O. AI", "Predict.AI", "Total Video Integrator", "Ecosystem.AI"] },
        { label: L("Foundation", "Fundament"), text: L("Shared data and the conversational planning layer", "Gemeinsame Daten und die konversationelle Planungsebene"), items: ["Global Data Platform", "Plus.AI", "Data Ecosystem"], dark: true },
      ]),
      true,
    ),
  }),

  "ai-coworkers": () => ({
    after: 0,
    html: figure(
      "shots",
      L("In the product", "Im Produkt"),
      L("A brief goes in, a finished file comes back on a shared board", "Ein Briefing geht rein, eine fertige Datei kommt auf ein gemeinsames Board zurück"),
      shots([
        { src: "/assets/shot-brief.webp", alt: L("Sokosumi brief form for an AI coworker", "Sokosumi-Briefing-Formular für einen AI Coworker"), caption: L("Brief a named coworker with context, sources and the expected output.", "Einen benannten Coworker mit Kontext, Quellen und erwartetem Ergebnis briefen.") },
          { src: "/assets/shot-board.webp", alt: L("Sokosumi task board with deliverables", "Sokosumi-Taskboard mit Ergebnissen"), caption: L("Every task, hand-off, deliverable and cost stays visible to the team.", "Jeder Task, jede Übergabe, jedes Ergebnis und jede Kostenposition bleibt für das Team sichtbar.") },
      ]),
      true,
    ),
  }),

  "masumi-sokosumi-kodosumi": () => ({
    after: 0,
    html: figure(
      "flow",
      L("A task through the stack", "Ein Task durch den Stack"),
      L("Which product is responsible at each step", "Welches Produkt in welchem Schritt verantwortlich ist"),
      flow([
        { title: L("Choose and brief", "Auswählen und briefen"), owner: "Sokosumi", text: L("A buyer finds a coworker or agent and submits task, context and expected output.", "Ein Käufer findet einen Coworker oder Agent und übergibt Task, Kontext und erwartetes Ergebnis.") },
        { title: L("Run", "Ausführen"), owner: "Kodosumi", text: L("The agent service executes on its deployment environment.", "Der Agent-Service läuft in seiner Deployment-Umgebung.") },
        { title: L("Coordinate", "Koordinieren"), owner: "Sokosumi", text: L("Progress and hand-offs between agents stay visible to the user.", "Fortschritt und Übergaben zwischen Agents bleiben für den Nutzer sichtbar.") },
        { title: L("Settle and record", "Abrechnen und dokumentieren"), owner: "Masumi", text: L("Payment escrow and job state follow explicit protocol rules.", "Zahlungs-Escrow und Job-Status folgen expliziten Protokollregeln.") },
      ]) + `<div class="sp-flow-owners">${["Sokosumi", "Kodosumi", "Masumi"].map((n) => `<span>${logo(n, 96, 14)}<small>${esc({ Sokosumi: L("Marketplace and workplace", "Marktplatz und Arbeitsplatz"), Kodosumi: L("Deployment", "Deployment"), Masumi: L("Protocol", "Protokoll") }[n])}</small></span>`).join("")}</div>`,
    ),
  }),

  "serviceplan-generate-ai-makeline": () => ({
    after: 0,
    html: figure(
      "flow",
      L("Content supply chain", "Content Supply Chain"),
      L("Generation is one stage; MAKELINE spans the whole flow", "Generierung ist eine Stufe; MAKELINE umfasst den gesamten Ablauf"),
      flow([
        { title: L("Plan", "Planen"), owner: "MAKELINE", text: L("Campaigns, markets, variants, rights and requirements enter one structured brief.", "Kampagnen, Märkte, Varianten, Rechte und Anforderungen landen in einem strukturierten Briefing.") },
        { title: L("Generate and produce", "Generieren und produzieren"), owner: "Generate.AI · Luma AI", text: L("Approved creative systems produce source assets under human direction.", "Freigegebene Kreativsysteme erzeugen Ausgangs-Assets unter menschlicher Leitung.") },
        { title: L("Adapt and review", "Adaptieren und freigeben"), owner: "MAKELINE", text: L("Localise, resize, version and approve across brands, channels and markets.", "Lokalisieren, anpassen, versionieren und freigeben über Marken, Kanäle und Märkte.") },
        { title: L("Store and distribute", "Speichern und verteilen"), owner: "MAKELINE", text: L("Assets, feedback, status and delivery stay connected and measurable.", "Assets, Feedback, Status und Auslieferung bleiben verbunden und messbar.") },
      ]),
    ),
  }),

  "ai-marketing-agency": () => ({
    after: 1,
    html: figure(
      "matrix",
      L("Delivery models compared", "Liefermodelle im Vergleich"),
      L("Four ways to buy AI marketing work", "Vier Wege, KI-Marketingarbeit einzukaufen"),
      matrix(
        [L("Time to start", "Startzeit"), L("Integration", "Integration"), L("Governance sits with", "Governance liegt bei"), L("Serviceplan route", "Serviceplan-Weg")],
        [
          { label: L("Single AI tool", "Einzelnes KI-Tool"), cells: [L("Days", "Tage"), L("Buyer", "Käufer"), L("Buyer", "Käufer"), "Mediaplus Pretest.AI, Search.AI"] },
          { label: L("AI coworker", "AI Coworker"), cells: [L("Minutes", "Minuten"), L("None required", "Keine nötig"), L("Shared: brief and approval", "Geteilt: Briefing und Freigabe"), "Sokosumi"] },
          { label: L("Custom agent system", "Individuelles Agent-System"), cells: [L("Weeks", "Wochen"), L("Private data and tools", "Private Daten und Tools"), L("Agency and buyer", "Agentur und Käufer"), "Plan.Net Agentic Services"] },
          { label: L("Enterprise transformation", "Enterprise-Transformation"), cells: [L("Months", "Monate"), L("Operating model", "Betriebsmodell"), L("Joint programme", "Gemeinsames Programm"), "Plan.Net Agentic AI"] },
        ],
      ),
    ),
  }),

  "ai-search-geo": () => ({
    after: 0,
    html: figure(
      "matrix",
      L("SEO vs GEO", "SEO vs. GEO"),
      L("What changes when the answer is generated", "Was sich ändert, wenn die Antwort generiert wird"),
      matrix(
        [L("Classic SEO", "Klassisches SEO"), L("AI search / GEO", "AI Search / GEO")],
        [
          { label: L("Unit of measure", "Messgröße"), cells: [L("Rank for a query", "Rang für eine Suchanfrage"), L("Mention, citation and framing across a prompt set", "Erwähnung, Zitat und Framing über ein Prompt-Set")] },
          { label: L("Stability", "Stabilität"), cells: [L("Same query → similar SERP", "Gleiche Anfrage → ähnliche SERP"), L("Varies by model, wording, account, geography, time", "Variiert nach Modell, Formulierung, Account, Region, Zeit")] },
          { label: L("Primary signal", "Primäres Signal"), cells: [L("Links, crawlability, page quality", "Links, Crawlbarkeit, Seitenqualität"), L("Entity clarity, sourceable facts, corroboration", "Entitäts-Klarheit, zitierfähige Fakten, Bestätigung")] },
          { label: L("Tooling", "Werkzeuge"), cells: ["Search Console, analytics", L("Versioned prompt runs; Mediaplus Search.AI", "Versionierte Prompt-Läufe; Mediaplus Search.AI")] },
          { label: L("Outcome", "Ergebnis"), cells: [L("Impressions and clicks", "Impressionen und Klicks"), L("Presence and accurate framing; assisted demand", "Präsenz und korrektes Framing; unterstützte Nachfrage")] },
        ],
      ),
    ),
  }),

  "ai-marketing-cases": () => ({
    after: 0,
    html: figure(
      "ledger",
      L("Case ledger", "Case-Verzeichnis"),
      L("Every public case, with the evidence boundary kept visible", "Jeder öffentliche Case, mit sichtbarer Evidenzgrenze"),
      ledger(
        [L("Client", "Kunde"), L("Work", "Arbeit"), L("AI in the workflow", "KI im Workflow"), L("Reported result", "Berichtetes Ergebnis")],
        [
          { client: "Coca-Cola", unit: "Serviceplan · 2024", href: "https://www.house-of-communication.com/de/en/cases/coca-cola-holidays-are-coming-2024.html", work: "Holidays Are Coming", ai: L("Custom generative workflows from script to edit", "Individuelle generative Workflows vom Skript bis zum Schnitt"), result: L("100+ localised versions, 24 markets", "100+ lokalisierte Versionen, 24 Märkte") },
          { client: "BMW Motorrad", unit: "Serviceplan", href: "https://www.house-of-communication.com/int/en/cases/bmw-motorrad-discover-the-world.html", work: "Discover the world", ai: L("Studio, CGI and Generate.AI", "Studio, CGI und Generate.AI"), result: "" },
          { client: "Grana Padano", unit: "Serviceplan", href: "https://www.house-of-communication.com/de/en/cases/grana-padano-our-future-has-ai-history.html", work: "Our Future has AI History", ai: L("AI-assisted creative", "KI-gestützte Kreation"), result: "" },
          { client: "Swisscom", unit: "Serviceplan", href: "https://www.house-of-communication.com/ch/en/cases/swisscom-sure.html", work: "Sure", ai: L("AI in creative or production", "KI in Kreation oder Produktion"), result: "" },
          { client: "L'Oréal BE/NL", unit: "MAKELINE", href: "https://www.house-of-communication.com/be/en/cases/makeline.html", work: L("Content supply chain", "Content Supply Chain"), ai: L("Planning, production, adaptation, review", "Planung, Produktion, Adaption, Freigabe"), result: L("50% faster, 30% cost saving (vendor reported)", "50 % schneller, 30 % Kostenersparnis (Anbieterangabe)") },
          { client: "BMW / MINI", unit: "THE MARCOM ENGINE", href: "https://www.house-of-communication.com/us/en-hoc/newsroom/2025/06/plan-net-tme-christin-herrnberger.html", work: "Content Factory", ai: L("MAKELINE as central platform", "MAKELINE als zentrale Plattform"), result: L("26 European markets supplied", "26 europäische Märkte beliefert") },
          { client: "MediaMarktSaturn", unit: "MOMENTUM · 2026", href: "https://www.house-of-communication.com/int/en/newsroom/2026/06/serviceplan-group-account-mediamarktsaturn.html", work: L("Joint production organisation", "Gemeinsame Produktionsorganisation"), ai: L("Modular MOMENTUM OS", "Modulares MOMENTUM OS"), result: L("Announced for 11 markets; no result yet", "Für 11 Märkte angekündigt; noch kein Ergebnis") },
        ],
      ),
      true,
    ),
  }),

  "partnerships-and-cases": () => ({
    after: 0,
    html: figure(
      "network",
      L("Partner map", "Partnerkarte"),
      L("Who actually builds what with Serviceplan", "Wer tatsächlich was mit Serviceplan baut"),
      network("Serviceplan Group", [
        { name: "Luma AI", role: L("Creative-AI technology", "Kreativ-KI-Technologie") },
        { name: "NMKR", role: L("Masumi and Sokosumi co-builder", "Mitentwickler von Masumi und Sokosumi") },
        { name: "Cardano Foundation", role: L("Masumi network", "Masumi-Netzwerk") },
        { name: "GWI", role: L("Consumer data", "Konsumentendaten") },
        { name: "AMBOSS", role: "HealthContent.AI" },
        { name: "Akkio", role: "Plus.AI" },
        { name: "Microsoft Azure", role: L("Hosting only", "Nur Hosting") },
      ]),
    ),
  }),

  "timeline-and-sources": () => ({
    after: 0,
    html: figure(
      "timeline",
      L("Dated record", "Datierte Chronik"),
      L("Two years of public Serviceplan AI announcements", "Zwei Jahre öffentlicher Serviceplan-KI-Mitteilungen"),
      timeline([
        { date: "2024-12-11", label: L("11 Dec", "11. Dez."), title: L("Cardano Foundation partnership", "Partnerschaft mit der Cardano Foundation"), text: L("Serviceplan, NMKR and the Cardano Foundation collaborate around the Masumi network.", "Serviceplan, NMKR und die Cardano Foundation kooperieren rund um das Masumi-Netzwerk."), href: "https://www.masumi.network/blogs/serviceplan-group-partners-with-cardano-foundation-to-pioneer-blockchain-driven-ai-agent-economy" },
        { date: "2025-06-25", label: L("25 Jun", "25. Juni"), title: L("Sokosumi launch", "Start von Sokosumi"), text: L("Plan.Net Studios and NMKR launch the agent marketplace, following Masumi and Kodosumi.", "Plan.Net Studios und NMKR starten den Agent-Marktplatz, nach Masumi und Kodosumi."), href: "https://www.house-of-communication.com/us/en-hoc/newsroom/2025/06/plant-net-launch-sokosumi.html" },
        { date: "2025-11-26", label: L("26 Nov", "26. Nov."), title: "CMO Barometer 2026", text: L("805 marketing leaders in 15 markets; 68% name AI the defining topic for 2026.", "805 Marketingverantwortliche in 15 Märkten; 68 % nennen KI das prägende Thema 2026."), href: "https://www.house-of-communication.com/de/en/newsroom/2025/11/serviceplan-group-cmo-barometer-2026.html" },
        { date: "2026-02-01", label: L("Feb", "Feb."), title: L("Luma AI partnership", "Partnerschaft mit Luma AI"), text: L("Luma AI becomes the group-wide creative-AI technology partner.", "Luma AI wird gruppenweiter Kreativ-KI-Technologiepartner."), href: "https://www.house-of-communication.com/de/en/newsroom/2026/02/serviceplan-group-partnership-luma-ai.html" },
        { date: "2026-03-01", label: L("Mar", "März"), title: L("AI Coworkers and HealthContent.AI", "AI Coworker und HealthContent.AI"), text: L("Hannah and Elena launch as the first SME offer from the House of AI.", "Hannah und Elena starten als erstes KMU-Angebot aus dem House of AI."), href: "https://www.house-of-communication.com/de/de/newsroom/2026/02/serviceplan-group-ai-coworker.html" },
        { date: "2026-05-01", label: L("May", "Mai"), title: "Behave.AI", text: L("Mediaplus launches its global behavioural-science AI unit.", "Mediaplus startet seine globale verhaltenswissenschaftliche KI-Einheit."), href: "https://www.house-of-communication.com/int/en/newsroom/2026/05/mediaplus-global-ai-unit-behave.html" },
        { date: "2026-06-01", label: L("Jun", "Juni"), title: "Plus.AI", text: L("Mediaplus presents its conversational media operating system.", "Mediaplus stellt sein konversationelles Media-Betriebssystem vor.") },
        { date: "2026-07-01", label: L("Jul", "Juli"), title: L("FY results and Plan.Net Agentic AI", "Geschäftszahlen und Plan.Net Agentic AI"), text: L("Group results name a dedicated Plan.Net Agentic AI business unit.", "Die Gruppenergebnisse nennen eine eigene Business Unit Plan.Net Agentic AI."), href: "https://www.house-of-communication.com/int/en/newsroom/2026/07/serviceplan-group-2025-2026-fiscal-year.html" },
      ]),
    ),
  }),
};

function figureFor(slug) {
  const key = String(slug || "").split("/").pop();
  const make = FIGURES[key];
  return make ? make() : null;
}

module.exports = { figureFor, brandLayerMatrix, groupImage };

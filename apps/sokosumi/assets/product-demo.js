/* /product interactive demo — behaviour for the 1440×810 (16:9) app replica.
 * Everything renders inside #pd-app; popovers/dialogs live in #pd-layer so
 * they scale with the frame. State is in-memory only. */
(function () {
  "use strict";
  const app = document.getElementById("pd-app");
  const wrap = document.querySelector(".pd-scale-wrap");
  const sizer = document.getElementById("pd-sizer");
  const stage = document.getElementById("pd-stage");
  const scroller = document.getElementById("pd-stage-scroll");
  const layer = document.getElementById("pd-layer");
  const toastEl = document.getElementById("pd-toast");
  if (!app || !wrap || !layer) return;

  let D;
  try { D = JSON.parse(document.getElementById("pd-data").textContent); } catch (e) { return; }
  const P = {}; D.people.forEach((p) => { P[p.slug] = p; });
  const H = D.humans;
  const TASKS = D.tasks.slice();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- scale ---------------------------------------------------------------
  let scale = 1;
  function fit() {
    const w = scroller ? scroller.clientWidth : stage.clientWidth;
    const min = w < 700 ? 0.5 : 0.3;
    scale = Math.min(1, Math.max(min, w / 1440));
    wrap.style.setProperty("--pd-scale", String(scale));
    sizer.style.width = Math.round(1440 * scale) + "px";
    sizer.style.height = Math.round(810 * scale) + "px";
    sizer.style.overflow = "hidden";
    sizer.style.margin = scale < 1 && 1440 * scale < w ? "0 auto" : "0";
  }
  // feature visuals below the demo: same scale-as-one-unit trick per card
  const feats = Array.prototype.slice.call(document.querySelectorAll("[data-pd-fit]"));
  function fitFeats() {
    feats.forEach((sz) => {
      const [fw, fh] = sz.getAttribute("data-pd-fit").split("x").map(Number);
      const box = sz.parentElement;
      const sc = Math.min(1, box.clientWidth / fw);
      const appEl = sz.firstElementChild;
      appEl.style.setProperty("--pd-scale", String(sc));
      sz.style.width = Math.round(fw * sc) + "px";
      sz.style.height = Math.round(fh * sc) + "px";
    });
  }
  function fitAll() { fit(); fitFeats(); }
  fitAll();
  window.addEventListener("resize", fitAll);
  // phones: start with the icon rail so the work area gets the width
  const narrow = (scroller ? scroller.clientWidth : stage.clientWidth) < 700;

  // ---- helpers -------------------------------------------------------------
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const $ = (sel, root) => (root || app).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || app).querySelectorAll(sel));
  function ico(name, size) {
    const s = size || 16;
    const paths = {
      bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
      check: '<path d="M20 6 9 17l-5-5"/>',
      x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
      search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
      "list-todo": '<path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/><path d="m3 17 2 2 4-4"/><rect x="3" y="4" width="6" height="6" rx="1"/>',
      hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
      pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
      "bell-off": '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742"/><path d="m2 2 20 20"/><path d="M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05"/>',
      "check-check": '<path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>',
      "log-out": '<path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>',
      pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
      archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
      trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
      copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
      quote: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
      "smile-plus": '<path d="M13.267 2.08a10 10 0 1 0 8.653 8.653"/><path d="M15 10V9"/><path d="M16 5h6"/><path d="M16.472 15a6 6 0 0 1-8.943 0"/><path d="M19 2v6"/><path d="M9 10V9"/>',
      "message-circle": '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
      coins: '<path d="M13.744 17.736a6 6 0 1 1-7.48-7.48"/><path d="M15 6h1v4"/><path d="m6.134 14.768.866-.5 2 3.464"/><circle cx="16" cy="8" r="6"/>',
      "hard-drive": '<path d="M10 16h.01"/><path d="M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><path d="M21.946 12.013H2.054"/><path d="M6 16h.01"/>',
      "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
      settings: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
      plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
      building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/>',
      "pen-line": '<path d="M13 21h8"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
      "arrow-up-right": '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
      "arrow-left": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
      "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
      bold: '<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/>',
      italic: '<line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/>',
      code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
      "link-2": '<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>',
      "list-ordered": '<path d="M11 5h10"/><path d="M11 12h10"/><path d="M11 19h10"/><path d="M4 4h1v5"/><path d="M4 9h2"/><path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02"/>',
      list: '<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>',
      paperclip: '<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/>',
      "chevrons-up-down": '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
      "clock-plus": '<path d="M12 6v6l3.644 1.822"/><path d="M16 19h6"/><path d="M19 16v6"/><path d="M21.92 13.267a10 10 0 1 0-8.653 8.653"/>',
      "file-text": '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
      "users-round": '<path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/>',
      "user-round-plus": '<path d="M2 21a8 8 0 0 1 13.292-6"/><circle cx="10" cy="8" r="5"/><path d="M19 16v6"/><path d="M22 19h-6"/>',
      download: '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
      "refresh-cw": '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
      "calendar-sync": '<path d="M11 10v4h4"/><path d="m11 14 1.535-1.605a5 5 0 0 1 8 1.5"/><path d="M16 2v3"/><path d="m21 18-1.535 1.605a5 5 0 0 1-8-1.5"/><path d="M21 22v-4h-4"/><path d="M21 8.517V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.517"/><path d="M3 9h4"/><path d="M8 2v3"/>',
      calendar: '<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/>',
      "message-square": '<path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>',
      "circle-alert": '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
      ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
      earth: '<path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"/><path d="M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"/><path d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"/><circle cx="12" cy="12" r="10"/>',
      "chevron-right": '<path d="m9 18 6-6-6-6"/>',
      "app-window": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M2 8h20"/><path d="M6 4v4"/>',
      briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
      folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
      "square-pen": '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>',
    };
    return `<svg class="lu" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ""}</svg>`;
  }
  const STATUS_COLOR = { online: "#16a249", away: "#ca0", offline: "#0a0a0a8c" };
  function ava(who, px, opts) {
    const o = opts || {};
    const p = P[who] || H[who] || (typeof who === "object" ? who : {}) || {};
    const s = px || 20;
    const fs = Math.max(8, Math.round(s * 0.36));
    const inner = p.image || p.img
      ? `<img src="${esc(p.image || p.img)}" alt="" width="${s}" height="${s}" decoding="async" />`
      : `<span class="pd-ini" style="font-size:${fs}px">${esc(p.ini || (p.name || "?").charAt(0))}</span>`;
    const dot = o.status ? `<span class="pd-dot" style="--dot:${STATUS_COLOR[p.status || "offline"]}"></span>` : "";
    return `<span class="pd-ava${o.cls ? " " + o.cls : ""}" style="--s:${s}px">${inner}${dot}</span>`;
  }
  function nameOf(k) { return (P[k] || H[k] || {}).name || k; }
  function badge(status) {
    const map = { queued: ["Queued", "is-queued"], running: ["Running", "is-running"], input: ["Input required", "is-input"], failed: ["Failed", "is-failed"], completed: ["Completed", "is-done"], complete: ["Complete", "is-stone"], canceled: ["Canceled", "is-done"], draft: ["Draft", "is-done"] };
    const m = map[status] || [status, "is-done"];
    const lead = status === "input" ? ico("circle-alert", 12) : status === "running" ? '<i class="pd-badge-dot"></i>' : "";
    return `<span class="pd-badge ${m[1]}">${lead}<span>${esc(m[0])}</span></span>`;
  }
  function linkify(text) {
    return esc(text).replace(/@([A-Z][\w-]*(?: [A-Z][\w-]*)?)/g, '<span class="pd-at">@$1</span>');
  }
  let toastTimer;
  function toast(msg) {
    toastEl.innerHTML = ico("check", 16) + "<span>" + esc(msg) + "</span>";
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2600);
  }

  // ---- state ---------------------------------------------------------------
  const S = {
    view: "home",
    person: "elena",
    room: "everyone",
    task: null,
    project: null,
    collapsed: false,
    jobs: false,
    fmt: true,
    notesRead: false,
    projectFilter: null,
    filters: { mine: false, scheduled: false, done: true },
    display: "board",
    workspace: "utxo AG",
    rooms: {},
    roomMeta: {},
    reacts: {},
    activities: {},
    newTask: null,
  };
  // mutable chat store
  Object.keys(D.chat).forEach((k) => { S.rooms[k] = D.chat[k].map((m, i) => Object.assign({ id: k + "-" + i }, m)); });
  D.channels.forEach((c) => { S.roomMeta[c.id] = { kind: "channel", name: c.name, pinned: !!c.pinned }; });
  D.external.forEach((c) => { S.roomMeta[c.id] = { kind: "external", name: c.name }; });
  S.roomMeta["old-projects"] = { kind: "channel", name: "Old projects", archived: true };
  S.roomMeta["hackathon-2025"] = { kind: "channel", name: "Hackathon 2025", archived: true };
  D.dms.forEach((d) => { S.roomMeta[d.id] = { kind: "dm", who: d.who, name: d.who.map(nameOf).join(", ") + (d.more ? ` and ${d.more} more` : "") }; });

  // ---- crumb + view --------------------------------------------------------
  const crumbEl = $("[data-pd-crumb]");
  function crumb(parts) {
    crumbEl.innerHTML = parts.map((p, i) => {
      const last = i === parts.length - 1;
      const inner = last ? `<span class="is-cur">${esc(p.label)}</span>` : `<button type="button" class="pd-crumb-link" data-pd-view="${esc(p.view)}">${esc(p.label)}</button>`;
      return inner + (last ? "" : `<span class="pd-crumb-sep">${ico("chevron-right", 14)}</span>`);
    }).join("");
  }
  const TITLES = { home: [], agents: [{ label: "Agents" }], tasks: [{ label: "Tasks" }], task: [{ label: "Tasks" }], projects: [{ label: "Projects" }], history: [{ label: "History" }], pa: [{ label: "Personal Assistant" }] };
  function setView(view) {
    if (!$(`[data-view-panel="${view}"]`)) return;
    S.view = view;
    app.setAttribute("data-view", view);
    if (view === "chat") {
      const m = S.roomMeta[S.room] || {};
      crumb([{ label: "Chat", view: "chat" }, { label: m.name || "Everyone" }]);
    } else if (view === "project") {
      crumb([{ label: "Projects", view: "projects" }, { label: S.project || "" }]);
    } else crumb(TITLES[view] || []);
    $$(".pd-nav[data-pd-nav-key]").forEach((b) => b.classList.toggle("is-active", b.getAttribute("data-pd-nav-key") === view || (view === "task" && b.getAttribute("data-pd-nav-key") === "tasks") || (view === "project" && b.getAttribute("data-pd-nav-key") === "projects")));
    $$(".pd-room").forEach((li) => li.classList.toggle("is-active", view === "chat" && li.getAttribute("data-pd-room-li") === S.room));
    const tabView = view === "task" ? "tasks" : view === "project" ? "projects" : view;
    document.querySelectorAll(".pd-tab").forEach((tab) => {
      const on = tab.getAttribute("data-pd-view") === tabView;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    const main = $("[data-pd-main]");
    if (main) main.scrollTop = 0;
    if (scroller && scale < 1 && scroller.scrollWidth > scroller.clientWidth) {
      // phones: centred views (welcome, agents hero, assistant) pan to the middle, lists pan to the rail
      const centred = view === "home" || view === "agents" || view === "pa";
      scroller.scrollTo({ left: centred ? (scroller.scrollWidth - scroller.clientWidth) / 2 : 0, behavior: "auto" });
    }
    closeLayer();
  }

  // ---- home ----------------------------------------------------------------
  function setPerson(slug) {
    if (!P[slug]) return;
    S.person = slug;
    app.setAttribute("data-person", slug);
    $$(".pd-strip-item").forEach((el) => el.classList.toggle("is-on", el.getAttribute("data-pd-pick") === slug));
    const lab = $("[data-pd-cta-label]");
    if (lab) lab.textContent = "Chat with " + P[slug].name;
    const cta = $("[data-pd-chatwith][data-pd-person]", $('[data-view-panel="home"]'));
    if (cta) cta.setAttribute("data-pd-person", slug);
    centerStrip(slug);
  }
  function centerStrip(slug) {
    const wrapEl = $(".pd-strip-wrap");
    const item = $(`.pd-strip-item[data-pd-pick="${slug}"]`);
    if (!wrapEl || !item) return;
    const target = item.offsetLeft + item.offsetWidth / 2 - wrapEl.clientWidth / 2;
    if (typeof wrapEl.scrollTo === "function") wrapEl.scrollTo({ left: target, behavior: reduced || !wrapEl.dataset.ready ? "auto" : "smooth" });
    else wrapEl.scrollLeft = target;
    wrapEl.dataset.ready = "1";
  }

  // ---- chat ----------------------------------------------------------------
  const threadEl = $("[data-pd-thread]");
  const composeInput = $("[data-pd-compose-input]");
  const composePh = $("[data-pd-compose-ph]");
  function roomLabel(id) {
    const m = S.roomMeta[id] || {};
    return m.kind === "dm" || m.kind === "cw" ? m.name : "#" + m.name;
  }
  function ensureRoom(id) {
    if (S.rooms[id]) return S.rooms[id];
    const m = S.roomMeta[id] || {};
    if (m.kind === "cw") {
      const p = P[m.slug];
      const offer = (p.offers && p.offers[0]) || null;
      // A coworker DM opens on an example exchange: brief in, task queued,
      // deliverable back — the loop the whole product is about.
      S.rooms[id] = offer
        ? [
            { id: id + "-0", who: "patrick", time: "Yesterday", text: `Hi ${p.name} — can you take this? ${offer.title}. Use the workspace context, and ask here if anything is unclear.` },
            { id: id + "-1", who: m.slug, time: "Yesterday", text: `On it. I've queued “${offer.title}” as a task on your board — I'll post the deliverable here the moment it's done.` },
            { id: id + "-2", who: m.slug, time: "09:12", text: `Done — the deliverable is on the task and attached here. Tell me if you want anything changed; edits run as follow-ups on the same task.`, file: { name: offer.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + (offer.out === "Web" ? "" : offer.out === "PDF" ? ".pdf" : ".docx"), kind: offer.out, meta: offer.out === "Web" ? "Live deliverable" : offer.out }, react: ["🙏", 1] },
          ]
        : [{ id: id + "-0", who: m.slug, time: "now", text: `Hi Patrick, I'm ${p.name} — ${p.role}. Tell me what you need and I'll either answer here or turn it into a task on your board.` }];
    } else if (m.kind === "dm") {
      S.rooms[id] = [];
    } else {
      S.rooms[id] = [];
    }
    return S.rooms[id];
  }
  function msgHtml(m, prev) {
    const cont = prev && prev.who === m.who && !m.quote && !prev.thread;
    const who = P[m.who] || H[m.who] || { name: m.who };
    const reactKey = m.id;
    const mine = !!S.reacts[reactKey];
    let reacts = "";
    const list = [];
    if (m.react) list.push({ e: m.react[0], n: m.react[1] + (mine && S.reacts[reactKey] === m.react[0] ? 1 : 0), on: mine && S.reacts[reactKey] === m.react[0] });
    if (mine && !(m.react && S.reacts[reactKey] === m.react[0])) list.push({ e: S.reacts[reactKey], n: 1, on: true });
    if (m.mine && m.react) { list[0].on = true; }
    if (list.length) reacts = `<div class="pd-reacts">${list.map((r) => `<button type="button" class="pd-react${r.on ? " is-on" : ""}" data-pd-react="${esc(reactKey)}" data-pd-emoji="${esc(r.e)}" aria-label="React with ${esc(r.e)}"><span class="e">${r.e}</span><span>${r.n}</span></button>`).join("")}</div>`;
    const body = m.html ? m.html : linkify(m.text || "");
    return `<article class="pd-msg${cont ? " is-cont" : ""}" data-pd-msg="${esc(m.id)}">
      ${ava(m.who, 32)}
      <div class="pd-msg-body">
        <div class="pd-msg-meta"><b>${esc(who.name)}</b><time>${esc(m.time || "now")}</time></div>
        ${m.quote ? `<blockquote class="pd-msg-quote"><b>${esc(m.quote.who)}</b>${esc(m.quote.text)}</blockquote>` : ""}
        <div class="pd-msg-text">${body}</div>
        ${m.file ? `<button type="button" class="pd-msg-file" ${m.task ? `data-pd-task="${esc(m.task)}"` : 'data-pd-act="download"'}><span class="pd-msg-file-ico">${ico(m.file.kind === "Web" ? "app-window" : "file-text", 18)}</span><span class="pd-msg-file-copy"><b>${esc(m.file.name)}</b><small>${esc(m.file.kind)}${m.file.meta ? " · " + esc(m.file.meta) : ""}</small></span><span class="pd-msg-file-go">${ico(m.task ? "arrow-up-right" : "download", 14)}</span></button>` : ""}
        ${m.task && !m.file ? `<button type="button" class="pd-msg-tasklink" data-pd-task="${esc(m.task)}">${ico("list-todo", 14)}<span>View task</span></button>` : ""}
        ${reacts}
        ${m.thread ? `<button type="button" class="pd-replies" data-pd-open="threads">${m.thread} replies</button>` : ""}
      </div>
      <span class="pd-msg-actions">
        <button type="button" class="pd-ib" data-pd-open="emoji" data-pd-react-target="${esc(reactKey)}" aria-label="Add reaction">${ico("smile-plus")}</button>
        <button type="button" class="pd-ib" data-pd-act="quote" data-pd-msg-ref="${esc(m.id)}" aria-label="Quote">${ico("quote")}</button>
        <button type="button" class="pd-ib" data-pd-act="copy" data-pd-msg-ref="${esc(m.id)}" aria-label="Copy">${ico("copy")}</button>
        <button type="button" class="pd-ib" data-pd-open="threads" aria-label="Open thread">${ico("message-circle")}</button>
      </span>
    </article>`;
  }
  function renderThread(filter) {
    const msgs = ensureRoom(S.room);
    const m = S.roomMeta[S.room] || {};
    let html = "";
    if (!msgs.length) {
      html += `<div class="pd-day"><span>${m.kind === "dm" ? "This is the start of your conversation with " + esc(m.name) : "This is the start of #" + esc(m.name)}</span></div>`;
    } else {
      const t0 = String(msgs[0].time || "");
      html += `<div class="pd-day"><span>${/[:]|now/.test(t0) ? "Today" : "This week"}</span></div>`;
    }
    let prev = null;
    const q = (filter || "").trim().toLowerCase();
    msgs.forEach((msg) => {
      if (q && !((msg.text || "") + " " + (msg.html || "") + " " + nameOf(msg.who)).toLowerCase().includes(q)) return;
      html += msgHtml(msg, prev);
      prev = msg;
    });
    threadEl.innerHTML = html;
    const wrapEl = threadEl.parentElement;
    wrapEl.scrollTop = wrapEl.scrollHeight;
  }
  function openRoom(id) {
    if (!S.roomMeta[id]) return;
    S.room = id;
    const m = S.roomMeta[id];
    app.setAttribute("data-room-kind", m.kind);
    $("[data-pd-chat-name]").textContent = m.name;
    const icoEl = $("[data-pd-chat-ico]");
    if (m.kind === "dm") icoEl.innerHTML = ava(m.who[0], 20, { status: true });
    else if (m.kind === "cw") icoEl.innerHTML = ava(m.slug, 20);
    else if (m.kind === "external") icoEl.innerHTML = ico("earth", 14);
    else icoEl.innerHTML = ico("hash", 14);
    composePh.textContent = "Message " + roomLabel(id);
    $$(".pd-room").forEach((li) => { if (li.getAttribute("data-pd-room-li") === id) li.classList.remove("is-unread"); });
    const trail = $(`.pd-room[data-pd-room-li="${id}"] .pd-unread`);
    if (trail) trail.remove();
    renderThread();
    setView("chat");
  }
  function openChatWith(slug) {
    const id = "cw-" + slug;
    if (!S.roomMeta[id]) {
      S.roomMeta[id] = { kind: "cw", slug: slug, name: P[slug].name };
      const ul = $("[data-pd-dms]");
      const li = document.createElement("li");
      li.className = "pd-room";
      li.setAttribute("data-pd-room-li", id);
      li.innerHTML = `<button type="button" class="pd-nav pd-room-btn" data-pd-room="${esc(id)}"><span class="pd-room-lead pd-room-faces">${ava(slug, 20)}</span><span class="pd-room-name">${esc(P[slug].name)}</span><span class="pd-room-trail"></span></button><span class="pd-room-actions"><button type="button" class="pd-ib pd-ib-7" data-pd-menu="room" data-pd-room-ref="${esc(id)}" aria-label="Chat actions">${ico("ellipsis")}</button></span>`;
      ul.insertBefore(li, ul.firstChild);
    }
    openRoom(id);
    setTimeout(() => composeInput.focus(), 50);
  }
  function sendMessage(text) {
    const msgs = ensureRoom(S.room);
    const m = { id: S.room + "-" + Date.now(), who: "patrick", time: "now", text: text };
    msgs.push(m);
    renderThread();
    const meta = S.roomMeta[S.room] || {};
    let responder = meta.kind === "cw" ? meta.slug : null;
    if (!responder) {
      const at = /@([A-Z][\w]*)/.exec(text);
      if (at) { const hit = D.people.find((p) => p.name.toLowerCase().startsWith(at[1].toLowerCase())); if (hit) responder = hit.slug; }
    }
    if (responder) {
      const p = P[responder];
      setTimeout(() => {
        const isTask = /\b(report|research|build|analy|write|create|plan|dashboard|campaign|draft)\w*/i.test(text);
        const reply = isTask
          ? `On it. I've created a task for this on your board — "${text.length > 58 ? text.slice(0, 58).replace(/\s+\S*$/, "") + "…" : text}". I'll post here when the first cut is ready.`
          : `Got it, Patrick. Anything else you want me to fold into this?`;
        msgs.push({ id: S.room + "-r" + Date.now(), who: responder, time: "now", text: reply });
        renderThread();
        if (isTask) {
          addTask({ title: text.length > 90 ? text.slice(0, 90) + "…" : text, blurb: "Created from chat with " + p.name + ".", who: [responder, "patrick"], status: "queued", project: "Marketing" }, true);
        }
      }, reduced ? 0 : 900);
    }
  }

  // ---- agents --------------------------------------------------------------
  function offerCard(p, o, cls) {
    // reuse server-rendered markup (icons included) by cloning a card of the same category
    let tpl = null;
    try { tpl = document.querySelector(`.pd-offer[data-pd-offer]:has(.pd-offer-cat.is-${o.cat.toLowerCase()})`); } catch (err) { tpl = null; }
    tpl = tpl || $(".pd-offer[data-pd-offer]");
    let outTpl = null;
    $$(".pd-offer[data-pd-offer] .pd-offer-out").some((x) => { if (x.lastChild && x.lastChild.textContent === o.out) { outTpl = x; return true; } return false; });
    if (tpl) {
      const clone = tpl.cloneNode(true);
      clone.className = "pd-offer" + (cls ? " " + cls : "");
      clone.setAttribute("data-pd-offer", p.slug + "|" + o.title);
      clone.querySelector(".pd-offer-title").textContent = o.title;
      clone.querySelector(".pd-offer-blurb").textContent = o.blurb;
      const cat = clone.querySelector(".pd-offer-cat");
      cat.className = "pd-offer-cat is-" + o.cat.toLowerCase();
      cat.lastChild.textContent = o.cat;
      const out = clone.querySelector(".pd-offer-out");
      if (outTpl) out.innerHTML = outTpl.innerHTML; else out.lastChild.textContent = o.out;
      const foot = clone.querySelector(".pd-offer-foot");
      foot.innerHTML = ava(p.slug, 24) + `<span>${esc(p.name)}</span>` + ico("arrow-up-right", 16).replace('class="lu"', 'class="lu pd-offer-go"');
      return clone.outerHTML;
    }
    return "";
  }
  function detailHtml(p, vendorId) {
    const isSp = vendorId === "serviceplan";
    const tagIcons = {};
    $$(".pd-tag svg").forEach((s) => { const t = s.parentElement.textContent.trim(); if (!tagIcons[t]) tagIcons[t] = s.outerHTML; });
    return `<div class="pd-detail-head">
      <div class="pd-detail-id">${ava(p.slug, 64)}<div><h3>${esc(p.name)}</h3><p>${esc(p.role)}</p></div></div>
      <div class="pd-detail-actions">
        ${isSp ? `<button type="button" class="pd-btn pd-btn-outline pd-btn-md" data-pd-chatwith data-pd-person="${esc(p.slug)}">Chat with ${esc(p.name)}</button>` : ""}
        <button type="button" class="pd-btn pd-btn-primary pd-btn-md" data-pd-open="newtask" data-pd-person="${esc(p.slug)}">Start New Task for ${esc(p.name)} ${ico("arrow-right")}</button>
      </div></div>
      <p class="pd-bio">${esc(p.bio)}</p>
      <div class="pd-tags">${p.models.map((m) => `<span class="pd-tag">${tagIcons[m] || ""}${esc(m)}</span>`).join("")}<span class="pd-tag"><span class="pd-flag">🇪🇺</span>${esc(p.host)}</span></div>
      <div class="pd-offers-wrap"><p class="pd-kicker">Ready-To-Run Tasks</p><div class="pd-offers">${p.offers.map((o) => offerCard(p, o)).join("")}</div></div>`;
  }
  function selectRail(vendorId, slug) {
    $$(`.pd-rail-item[data-pd-rail="${vendorId}"]`).forEach((b) => b.classList.toggle("is-on", b.getAttribute("data-pd-person") === slug));
    const det = $(`[data-pd-detail="${vendorId}"]`);
    if (det) det.innerHTML = detailHtml(P[slug], vendorId);
  }
  const agentInput = $("[data-pd-agentsearch]");
  function filterAgents(q) {
    q = (q || "").trim().toLowerCase();
    $(".pd-bigsearch").classList.toggle("has-value", !!q);
    let any = false;
    D.vendors.forEach((v) => {
      const block = $(`[data-pd-vendor="${v.id}"]`);
      if (!block) return;
      let vendorHit = false, firstHit = null;
      v.members.forEach((s) => {
        const p = P[s];
        const hay = (p.name + " " + p.role + " " + p.offers.map((o) => o.title + " " + o.cat + " " + o.blurb).join(" ")).toLowerCase();
        const hit = !q || hay.includes(q);
        const rb = $(`.pd-rail-item[data-pd-rail="${v.id}"][data-pd-person="${s}"]`);
        if (rb) rb.hidden = !hit;
        if (hit) { vendorHit = true; if (!firstHit) firstHit = s; }
      });
      block.hidden = !vendorHit;
      const nextRule = block.nextElementSibling;
      if (nextRule && nextRule.classList.contains("pd-rule-x")) nextRule.hidden = !vendorHit;
      if (vendorHit) {
        any = true;
        const on = $(`.pd-rail-item[data-pd-rail="${v.id}"].is-on`);
        if (!on || on.hidden) selectRail(v.id, firstHit);
      }
    });
    const empty = $("[data-pd-agents-empty]");
    empty.hidden = any;
    $("[data-pd-agents-q]").textContent = q;
    $$(".pd-chip").forEach((c) => c.classList.toggle("is-on", !!q && c.getAttribute("data-pd-chip").toLowerCase() === q));
  }
  if (agentInput) agentInput.addEventListener("input", () => filterAgents(agentInput.value));
  // the live app cycles the search placeholder through the suggestions
  (function rotatePlaceholder() {
    const ph = $("[data-pd-agentsearch-ph]");
    if (!ph || reduced) return;
    const opts = ["Search agents, coworkers, and offers…"].concat($$(".pd-chip").map((c) => c.getAttribute("data-pd-chip")));
    let k = 0;
    setInterval(() => {
      if (agentInput.value || S.view !== "agents") return;
      k = (k + 1) % opts.length;
      ph.textContent = opts[k];
    }, 2600);
  })();

  // ---- tasks ---------------------------------------------------------------
  function taskCardHtml(tk) {
    const whoLine = tk.who.map(nameOf).join(", ");
    return `<article class="pd-card" data-pd-task="${esc(tk.id)}" tabindex="0" role="button" aria-label="${esc(tk.title)}">
      <div class="pd-card-top">${badge(tk.status)}<h3>${esc(tk.title)}</h3></div>
      <div class="pd-card-mid"><p>${esc(tk.blurb)}</p>${tk.sched ? `<div class="pd-card-sched"><span>${ico("calendar-sync", 14)}<span class="pd-trunc">${esc(tk.sched)}</span></span><span class="pd-num">Next run: ${esc(tk.next)}</span></div>` : ""}</div>
      <div class="pd-card-foot"><span class="pd-faces" aria-label="${esc(whoLine)}">${tk.who.map((w, i) => ava(w, 20, { cls: i ? "is-stack" : "" })).join("")}</span><span class="pd-card-meta">${tk.comments ? `<span>${ico("message-square", 12)}${tk.comments}</span>` : ""}<span>${ico("calendar", 12)}${esc(tk.date)}</span></span></div>
    </article>`;
  }
  let taskSeq = 100;
  function addTask(data, quiet) {
    const tk = Object.assign({ id: "n" + taskSeq++, lane: "backlog", status: "queued", blurb: "", who: ["elena", "patrick"], date: "Aug 19", project: "Marketing", created: "Aug 19, 5:02 PM", updated: "Aug 19, 5:02 PM", comments: 0 }, data);
    if (tk.status === "draft") tk.lane = "backlog";
    TASKS.unshift(tk);
    const lane = $(`.pd-lane[data-pd-lane="${tk.lane}"]`);
    if (lane) {
      lane.classList.remove("is-empty");
      const body = lane.querySelector(".pd-lane-body");
      const empty = body.querySelector(".pd-lane-empty");
      if (empty) empty.remove();
      body.insertAdjacentHTML("afterbegin", taskCardHtml(tk));
      const count = lane.querySelector("[data-pd-count]");
      count.textContent = String(parseInt(count.textContent, 10) + 1);
      body.scrollTop = 0;
    }
    if (!quiet) toast(tk.status === "draft" ? "Draft saved" : "Task created");
    return tk;
  }
  function applyBoardFilters() {
    let visible = 0;
    $$(".pd-card[data-pd-task]", $("[data-pd-board]")).forEach((card) => {
      const tk = TASKS.find((x) => x.id === card.getAttribute("data-pd-task"));
      if (!tk) return;
      let show = true;
      if (S.projectFilter && tk.project !== S.projectFilter) show = false;
      if (S.filters.mine && tk.who.indexOf("patrick") === -1) show = false;
      if (S.filters.scheduled && !tk.sched) show = false;
      if (!S.filters.done && tk.lane === "done") show = false;
      card.hidden = !show;
      if (show) visible++;
    });
    $$(".pd-lane", $("[data-pd-board]")).forEach((lane) => {
      const cards = $$(".pd-card", lane);
      const shown = cards.filter((c) => !c.hidden).length;
      const hideEmpty = S.display === "hide-empty";
      lane.hidden = hideEmpty && shown === 0;
      lane.classList.toggle("is-empty", shown === 0);
      let emptyEl = lane.querySelector(".pd-lane-empty");
      if (shown === 0 && !emptyEl) { emptyEl = document.createElement("div"); emptyEl.className = "pd-lane-empty"; emptyEl.innerHTML = "<p>No tasks</p>"; lane.querySelector(".pd-lane-body").insertBefore(emptyEl, lane.querySelector(".pd-lane-add")); }
      if (shown > 0 && emptyEl && cards.length) emptyEl.remove();
    });
    const dot = $("[data-pd-filter-dot]");
    if (dot) dot.hidden = !(S.filters.mine || S.filters.scheduled || !S.filters.done);
    void visible;
  }
  function openTask(id) {
    const tk = TASKS.find((x) => x.id === id);
    if (!tk) return;
    S.task = id;
    $$(".pd-card").forEach((c) => c.classList.toggle("is-on", c.getAttribute("data-pd-task") === id));
    $("[data-pd-td-title]").textContent = tk.title;
    const desc = tk.blurb.replace(/^DESIGN\.md\s*/, "");
    $("[data-pd-td-desc]").innerHTML = (/^DESIGN\.md/.test(tk.blurb) ? `<p><a href="#" onclick="return false">DESIGN.md</a></p>` : "") + `<p>${esc(desc)}</p>`;
    $("[data-pd-td-status]").innerHTML = badge(tk.status);
    const owner = tk.who.find((w) => H[w]) || "patrick";
    const cw = tk.who.find((w) => P[w]) || "elena";
    $("[data-pd-td-owner]").innerHTML = ava(owner, 20) + `<span>${esc(nameOf(owner))}</span>`;
    $("[data-pd-td-creator]").innerHTML = ava(cw, 20) + `<span>${esc(nameOf(cw))}</span>`;
    $("[data-pd-td-coworker]").innerHTML = ava(cw, 20) + `<span>${esc(nameOf(cw))}</span>`;
    $("[data-pd-td-credits]").textContent = String(tk.credits || 0);
    $("[data-pd-td-project]").textContent = tk.project || "No project";
    const schedRow = $("[data-pd-td-schedrow]");
    schedRow.hidden = !tk.sched;
    if (tk.sched) $("[data-pd-td-sched]").innerHTML = `<span>${esc(tk.sched)}</span><span class="pd-num">Next run: ${esc(tk.next)}</span>`;
    $("[data-pd-td-created]").textContent = tk.created || "Aug 19, 5:02 PM";
    $("[data-pd-td-updated]").textContent = tk.updated || tk.created || "Aug 19, 5:02 PM";
    const runs = D.notes.filter((n) => n[2] === id).length;
    const hasLinked = !!(tk.sched && runs);
    $("[data-pd-td-linkedlist]").innerHTML = hasLinked
      ? Array.from({ length: Math.min(2, runs) }).map(() => `<li><span>${ico("calendar-sync", 16)}<span class="pd-trunc">${esc(tk.title)}</span></span>${badge("complete")}</li>`).join("")
      : "";
    $("[data-pd-td-nolinked]").hidden = hasLinked;
    const seeded = (D.acts && D.acts[id]) || [];
    const mine = S.activities[id] || [];
    function actCard(a) {
      const who = a.who || "patrick";
      const name = nameOf(who);
      const isCw = !!P[who];
      const fileRow = a.file
        ? `<div class="pd-act-files"><span class="pd-act-files-label">${a.file.meta && a.file.meta.indexOf("Web") === 0 ? "Links" : "Files"}</span><button type="button" class="pd-msg-file" data-pd-act="download"><span class="pd-msg-file-ico">${ico(a.file.meta && a.file.meta.indexOf("Web") === 0 ? "app-window" : "file-text", 18)}</span><span class="pd-msg-file-copy"><b>${esc(a.file.name)}</b><small>${esc(a.file.meta || "")}</small></span><span class="pd-msg-file-go">${ico("download", 14)}</span></button></div>`
        : "";
      return `<li class="pd-act${a.expand ? " is-clamped" : ""}">
        <header class="pd-act-head">${ava(who, 28)}<b>${esc(name)}</b><span class="pd-act-via">commented from Sokosumi ${isCw ? ico("check", 11) : ""}</span><time>${esc(a.when || "just now")}</time></header>
        <div class="pd-act-body"><p>${linkify(a.text)}</p></div>
        ${a.expand ? `<button type="button" class="pd-act-expand" data-pd-act="expand">Expand</button>` : ""}
        ${fileRow}
      </li>`;
    }
    $("[data-pd-td-acts]").innerHTML = mine.map((a) => actCard({ who: "patrick", when: "just now", text: a.text })).join("") + seeded.map(actCard).join("");
    setView("task");
  }

  // ---- projects ------------------------------------------------------------
  function openProject(name) {
    const pr = D.projects.find((x) => x.name === name) || { name: name, d: "", n: name.charAt(0) };
    S.project = name;
    $("[data-pd-project-title]").textContent = pr.name;
    $("[data-pd-project-desc]").textContent = pr.d || "No description yet.";
    $("[data-pd-project-mark]").textContent = pr.n || pr.name.charAt(0);
    const list = TASKS.filter((t) => t.project === name);
    $("[data-pd-project-tasks]").innerHTML = list.map((tk) => `<li><button type="button" data-pd-task="${esc(tk.id)}">${ico("list-todo", 16)}<span class="pd-trunc">${esc(tk.title)}</span></button>${badge(tk.status)}</li>`).join("");
    $("[data-pd-project-notasks]").hidden = list.length > 0;
    $$("[data-pd-projtab]").forEach((b) => b.classList.toggle("is-on", b.getAttribute("data-pd-projtab") === "tasks"));
    $$("[data-pd-projpanel]").forEach((p) => { p.hidden = p.getAttribute("data-pd-projpanel") !== "tasks"; });
    setView("project");
  }
  function projectRowHtml(pr) {
    return `<article class="pd-proj-row" data-pd-project="${esc(pr.name)}">
      <button type="button" class="pd-proj-main" data-pd-openproject="${esc(pr.name)}"><span class="pd-proj-mark">${esc(pr.n)}</span><span class="pd-proj-copy"><span class="pd-proj-name">${esc(pr.name)}</span><span class="pd-proj-desc">${esc(pr.d || "—")}</span></span><span class="pd-proj-meta"><span class="pd-pill">${ico("list-todo", 14)}${pr.t}</span><span class="pd-pill">${ico("briefcase", 14)}0</span></span></button>
      <button type="button" class="pd-ib pd-ib-8" data-pd-menu="project" data-pd-project-ref="${esc(pr.name)}" aria-label="Project actions">${ico("ellipsis")}</button>
    </article>`;
  }

  // ---- layer (popovers / dialogs) ------------------------------------------
  let layerKind = null;
  function closeLayer() {
    layer.hidden = true;
    layer.innerHTML = "";
    layerKind = null;
  }
  function appRect() { return app.getBoundingClientRect(); }
  // position content relative to an anchor; returns style string
  function anchorPos(anchor, opts) {
    const o = opts || {};
    const ar = appRect();
    const r = anchor.getBoundingClientRect();
    const top = (r.bottom - ar.top) / scale + (o.gap == null ? 6 : o.gap);
    let left = (r.left - ar.left) / scale;
    if (o.align === "end") left = (r.right - ar.left) / scale - o.width;
    if (o.align === "center") left = (r.left - ar.left) / scale + r.width / scale / 2 - o.width / 2;
    left = Math.max(8, Math.min(left, 1440 - o.width - 8));
    let topPx = top;
    if (o.up) topPx = (r.top - ar.top) / scale - 6 - (o.height || 0);
    return `top:${Math.round(topPx)}px;left:${Math.round(left)}px;width:${o.width}px;`;
  }
  function popover(anchor, html, opts) {
    const o = opts || {};
    layerKind = o.kind || "pop";
    layer.innerHTML = `<div class="pd-layer-bg" data-pd-close></div><div class="pd-pop ${o.cls || ""}" style="${anchorPos(anchor, o)}" role="${o.role || "dialog"}">${html}</div>`;
    layer.hidden = false;
    if (o.up) {
      // measure the real height and sit the popover just above the anchor
      const pop = layer.querySelector(".pd-pop");
      const ar = appRect();
      const r = anchor.getBoundingClientRect();
      const top = Math.max(8, (r.top - ar.top) / scale - 6 - pop.offsetHeight);
      pop.style.top = Math.round(top) + "px";
    }
    if (o.focus) { const f = layer.querySelector(o.focus); if (f) setTimeout(() => f.focus(), 20); }
  }
  function dialog(html, opts) {
    const o = opts || {};
    layerKind = o.kind || "dialog";
    layer.innerHTML = `<div class="pd-layer-bg is-dim" data-pd-close></div><div class="pd-dialog ${o.cls || ""}" role="dialog" aria-modal="true">${html}</div>`;
    layer.hidden = false;
    if (o.focus) { const f = layer.querySelector(o.focus); if (f) setTimeout(() => f.focus(), 30); }
  }
  function menu(anchor, items, opts) {
    const o = opts || {};
    const html = `<div class="pd-menu-list">${items.map((it) => {
      if (it === "-") return '<div class="pd-mi-sep"></div>';
      if (it.label) return `<div class="pd-mi-label">${esc(it.label)}</div>`;
      return `<button type="button" class="pd-mi${it.danger ? " is-danger" : ""}${it.checked ? " is-checked" : ""}" data-pd-mi="${esc(it.id)}">${it.checkbox ? `<span class="pd-mi-check-box">${ico("check", 12)}</span>` : ""}${it.icon ? ico(it.icon) : ""}${it.ava ? ava(it.ava, 20) : ""}<span>${esc(it.text)}</span>${it.check ? `<span class="pd-mi-check">${ico("check", 14)}</span>` : ""}</button>`;
    }).join("")}</div>`;
    popover(anchor, html, Object.assign({ width: o.width || 220, role: "menu" }, o));
  }

  // ---- overlays -----------------------------------------------------------
  const OPEN = {
    notes(anchor) {
      S.notesRead = true;
      $(".pd-bell").classList.remove("has-unread");
      const html = `<div class="pd-notes"><div class="pd-notes-head"><p>Notifications</p></div><div class="pd-mi-sep"></div>
        <div class="pd-notes-list">${D.notes.map((n) => `<button type="button" class="pd-note" data-pd-task="${esc(n[2])}">${ico("bell")}<span><span>${esc(n[0])}</span><small>${esc(n[1])}</small></span></button>`).join("")}</div>
        <div class="pd-mi-sep"></div><div class="pd-notes-foot"><button type="button" class="pd-btn pd-btn-ghost pd-btn-sm" data-pd-view="history">See more</button></div></div>`;
      popover(anchor, html, { width: 320, align: "end", kind: "notes" });
    },
    account(anchor) {
      const html = `<div class="pd-acct">
        <div class="pd-acct-id">${ava("patrick", 32)}<div><p>Patrick Tobler</p><p>patrick@nmkr.io</p></div></div>
        <div class="pd-acct-status"><span><i></i>Away</span><span class="pd-acct-plan">Free</span></div>
        <div class="pd-acct-hr"></div>
        <div><p class="pd-acct-big">78,494 credits</p><p class="pd-acct-sm">Total balance</p></div>
        <div><p class="pd-acct-lbl">Monthly credits</p><div class="pd-acct-bar"><i></i></div><p class="pd-acct-sm" style="margin-top:0">250 / 250 credits used</p><p class="pd-acct-sm">Credits renew in 23 days</p></div>
        <div class="pd-acct-hr"></div>
        <div><p class="pd-acct-sm" style="margin:0 0 4px">Extra credits</p><p style="font-size:14px;font-weight:500;line-height:1">78,494 credits</p><p class="pd-acct-sm">Never expire</p></div>
        <div class="pd-acct-hr"></div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button type="button" class="pd-btn pd-btn-dark pd-btn-sm" data-pd-open="credits">${ico("coins")}Get more credits</button>
          <div class="pd-acct-menu">
            <button type="button" class="pd-mi" data-pd-open="settings">${ico("settings")}Settings</button>
            <button type="button" class="pd-mi" data-pd-act="logout">${ico("log-out")}Log out</button>
          </div>
        </div></div>`;
      popover(anchor, html, { width: 256, up: true, height: 542, kind: "account" });
    },
    workspace(anchor) {
      const orgs = ["utxo AG", "Serviceplan Group", "NMKR", "GameChanger"];
      menu(anchor, [{ id: "ws-user", ava: "patrick", text: "Patrick Tobler" }, "-", { label: "Organizations" }].concat(orgs.map((o) => ({ id: "ws:" + o, icon: o === "utxo AG" ? null : "building", ava: o === "utxo AG" ? { img: "/assets/product/utxo-ag.webp", name: o } : null, text: o, check: S.workspace === o }))).concat(["-", { id: "ws-create", icon: "plus", text: "Create workspace" }]), { width: 220, align: "end" });
    },
    search() {
      const html = `<div class="pd-cmd-input">${ico("search")}<input type="text" placeholder="Search..." data-pd-cmd-input /><button type="button" class="pd-ib pd-ib-7" data-pd-close aria-label="Close">${ico("x", 14)}</button></div><div class="pd-cmd-list" data-pd-cmd-list></div>`;
      dialog(html, { cls: "pd-cmd", kind: "search", focus: "[data-pd-cmd-input]" });
      const input = layer.querySelector("[data-pd-cmd-input]");
      const list = layer.querySelector("[data-pd-cmd-list]");
      const render = () => {
        const q = input.value.trim().toLowerCase();
        const hits = TASKS.filter((t) => !q || (t.title + " " + t.blurb).toLowerCase().includes(q)).slice(0, 12);
        const people = q ? D.people.filter((p) => (p.name + " " + p.role).toLowerCase().includes(q)).slice(0, 4) : [];
        list.innerHTML = (people.length ? `<div class="pd-cmd-group">Coworkers</div>` + people.map((p) => `<button type="button" class="pd-cmd-item" data-pd-chatwith data-pd-person="${esc(p.slug)}">${ava(p.slug, 16)}<span><span class="pd-trunc">${esc(p.name)}</span><small>${esc(p.role)}</small></span><span></span><span></span></button>`).join("") : "") +
          (hits.length ? `<div class="pd-cmd-group">Search</div>` + hits.map((t) => `<button type="button" class="pd-cmd-item" data-pd-task="${esc(t.id)}">${ico("list-todo")}<span><span class="pd-trunc">${esc(t.title)}</span><small>${esc(t.date)}</small></span>${ava(t.who[0], 20)}${badge(t.status === "completed" ? "complete" : t.status)}</button>`).join("") : `<div class="pd-cmd-empty">No results found.</div>`);
      };
      input.addEventListener("input", render);
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") { const first = list.querySelector(".pd-cmd-item"); if (first) first.click(); } });
      render();
    },
    guide(anchor) {
      popover(anchor, `<div class="pd-guide"><h3>How the board works</h3><ul><li>Backlog holds queued and scheduled tasks.</li><li>Cards move right as a coworker picks them up.</li><li>Input Required means a coworker is waiting on you.</li><li>Click any card for the full task, files and activity.</li></ul></div>`, { width: 300, align: "end" });
    },
    projectpick(anchor) {
      menu(anchor, [{ id: "proj:", icon: "folder", text: "All projects", check: !S.projectFilter }, "-"].concat(D.projects.map((p) => ({ id: "proj:" + p.name, icon: "folder", text: p.name, check: S.projectFilter === p.name }))), { width: 240 });
    },
    filters(anchor) {
      menu(anchor, [{ label: "Filter tasks" }, { id: "f:mine", checkbox: true, checked: S.filters.mine, text: "Assigned to me" }, { id: "f:scheduled", checkbox: true, checked: S.filters.scheduled, text: "Scheduled only" }, { id: "f:done", checkbox: true, checked: S.filters.done, text: "Show done" }, "-", { id: "f:reset", text: "Reset filters" }], { width: 220 });
    },
    display(anchor) {
      menu(anchor, [{ label: "Layout" }, { id: "d:board", text: "Board", check: S.display !== "hide-empty" }, { id: "d:hide-empty", text: "Board, hide empty lanes", check: S.display === "hide-empty" }, "-", { label: "Ordering" }, { id: "d:order", text: "Newest first", check: true }], { width: 240 });
    },
    newtask(anchor, btn) {
      const person = (btn && btn.getAttribute("data-pd-person")) || S.person || "elena";
      openNewTask(person, null);
    },
    browse() {
      const all = D.channels.concat([{ id: "old-projects", name: "Old projects", archived: true }, { id: "hackathon-2025", name: "Hackathon 2025", archived: true }]);
      dialog(`<button type="button" class="pd-ib pd-ib-7 pd-dialog-x" data-pd-close aria-label="Close">${ico("x", 14)}</button><div><h2>Browse channels</h2><p class="pd-dialog-desc">Channels in utxo AG. Join one to see it in your sidebar.</p></div>
        <div class="pd-people-list">${all.map((c) => `<button type="button" class="pd-mi" data-pd-room="${esc(c.id)}">${ico("hash")}<span>${esc(c.name)}</span><small>${c.archived ? "Archived" : "Joined"}</small></button>`).join("")}</div>`, { cls: "pd-dialog-sm" });
    },
    newchannel() {
      dialog(`<button type="button" class="pd-ib pd-ib-7 pd-dialog-x" data-pd-close aria-label="Close">${ico("x", 14)}</button><div><h2>Create channel</h2><p class="pd-dialog-desc">Channels are where your team and coworkers work together.</p></div>
        <form data-pd-form="newchannel" style="display:flex;flex-direction:column;gap:16px">
          <div class="pd-field"><label>Name</label><input name="name" placeholder="e.g. launch-week" required maxlength="40" autocomplete="off" /></div>
          <div class="pd-field"><label>Description <small>(optional)</small></label><input name="desc" placeholder="What is this channel about?" maxlength="80" autocomplete="off" /></div>
          <div class="pd-dialog-foot"><button type="button" class="pd-btn pd-btn-outline pd-btn-sm" data-pd-close>Cancel</button><button type="submit" class="pd-btn pd-btn-dark pd-btn-sm">Create</button></div>
        </form>`, { cls: "pd-dialog-sm", focus: 'input[name="name"]' });
    },
    newdm() {
      const people = Object.keys(H).filter((k) => k !== "patrick");
      dialog(`<button type="button" class="pd-ib pd-ib-7 pd-dialog-x" data-pd-close aria-label="Close">${ico("x", 14)}</button><div><h2>New direct message</h2><p class="pd-dialog-desc">Pick a teammate or a coworker.</p></div>
        <div class="pd-people-list">${D.people.slice(0, 7).map((p) => `<button type="button" class="pd-mi" data-pd-chatwith data-pd-person="${esc(p.slug)}">${ava(p.slug, 24)}<span>${esc(p.name)}</span><small>${esc(p.role)}</small></button>`).join("")}<div class="pd-mi-sep"></div>${people.map((k) => `<button type="button" class="pd-mi" data-pd-dmwith="${esc(k)}">${ava(k, 24, { status: true })}<span>${esc(H[k].name)}</span><small>${esc(H[k].status)}</small></button>`).join("")}</div>`, { cls: "pd-dialog-sm" });
    },
    threads() {
      const msgs = ensureRoom(S.room).filter((m) => m.thread);
      layerKind = "sheet";
      layer.innerHTML = `<div class="pd-layer-bg" data-pd-close></div><div class="pd-sheet"><div class="pd-sheet-head"><span>Threads</span><button type="button" class="pd-ib pd-ib-7" data-pd-close aria-label="Close">${ico("x", 14)}</button></div><div class="pd-sheet-body">${msgs.length ? msgs.map((m) => `<div class="pd-thread-item"><div class="pd-msg-meta"><b>${esc(nameOf(m.who))}</b><time>${esc(m.time)}</time></div><span class="pd-trunc">${esc(m.text || "")}</span><small>${m.thread} replies · last reply 2h ago</small></div>`).join("") : '<p class="pd-empty-note">No threads in this chat yet.</p>'}</div></div>`;
      layer.hidden = false;
    },
    members(anchor) {
      const people = ["patrick", "mara", "jonas", "priya", "tom", "lea", "samuel", "nina", "felix"];
      popover(anchor, `<div class="pd-members"><div class="pd-mi-label">14 participants</div><div class="pd-menu-list">${people.map((k) => `<button type="button" class="pd-mi" data-pd-dmwith="${esc(k)}">${ava(k, 20, { status: true })}<span>${esc(H[k].name)}</span></button>`).join("")}<div class="pd-mi-sep"></div>${["elena", "hannah", "alex", "noodles", "soupie"].map((s) => `<button type="button" class="pd-mi" data-pd-chatwith data-pd-person="${s}">${ava(s, 20)}<span>${esc(P[s].name)}</span><small style="margin-left:auto;font-size:12px;color:var(--mfg)">coworker</small></button>`).join("")}</div></div>`, { width: 260, align: "end" });
    },
    channelmenu(anchor) {
      menu(anchor, [{ id: "ch:edit", icon: "pencil", text: "Edit channel" }, { id: "ch:notify", icon: "bell-off", text: "Mute notifications" }, { id: "ch:members", icon: "user-round-plus", text: "Add people" }, "-", { id: "ch:leave", icon: "log-out", text: "Leave channel", danger: true }], { width: 220, align: "end" });
    },
    attach(anchor) {
      menu(anchor, [{ id: "att:computer", icon: "paperclip", text: "Upload from computer" }, { id: "att:drive", icon: "hard-drive", text: "Attach from Drive" }, { id: "att:task", icon: "list-todo", text: "Share a task" }], { width: 220, up: true, height: 116 });
    },
    emoji(anchor, btn) {
      const target = btn && btn.getAttribute("data-pd-react-target");
      const list = ["👍", "❤️", "😂", "🎉", "🙌", "😎", "🔥", "👀", "✅", "🚀", "🤔", "😊"];
      popover(anchor, `<div class="pd-emoji">${list.map((e) => `<button type="button" data-pd-pick-emoji="${e}" data-pd-react-target="${esc(target || "")}">${e}</button>`).join("")}</div>`, { width: 232, up: !target, height: 84 });
    },
    mention(anchor) {
      menu(anchor, [{ label: "Mention a coworker" }].concat(["elena", "hannah", "alex", "jamal", "maya", "noodles", "soupie", "hepha"].map((s) => ({ id: "at:" + s, ava: s, text: P[s].name }))), { width: 220, up: true, height: 320 });
    },
    activate() {
      dialog(`<button type="button" class="pd-ib pd-ib-7 pd-dialog-x" data-pd-close aria-label="Close">${ico("x", 14)}</button><div><h2>Activate your personal assistant</h2><p class="pd-dialog-desc">Your assistant gets its own private computer in the utxo AG workspace. It connects to your tools, remembers your context and runs while you sleep.</p></div>
        <ul style="display:flex;flex-direction:column;gap:8px;font-size:14px"><li style="display:flex;gap:8px;align-items:center">${ico("check")}Private micro-VM, isolated by default</li><li style="display:flex;gap:8px;align-items:center">${ico("check")}Mail, calendar and docs connectors</li><li style="display:flex;gap:8px;align-items:center">${ico("check")}Included in the Free plan while in beta</li></ul>
        <div class="pd-dialog-foot"><button type="button" class="pd-btn pd-btn-outline pd-btn-sm" data-pd-close>Not now</button><button type="button" class="pd-btn pd-btn-primary pd-btn-sm" data-pd-act="activate">Activate</button></div>`, { cls: "pd-dialog-sm" });
    },
    share(anchor) {
      menu(anchor, [{ id: "share:copy", icon: "link-2", text: "Copy link" }, { id: "share:chat", icon: "message-square", text: "Share in chat" }], { width: 200, align: "end" });
    },
    taskmenu(anchor) {
      menu(anchor, [{ id: "task:edit", icon: "pencil", text: "Edit task" }, { id: "task:dup", icon: "copy", text: "Duplicate" }, { id: "task:rerun", icon: "refresh-cw", text: "Run again" }, "-", { id: "task:cancel", icon: "x", text: "Cancel task" }, { id: "task:delete", icon: "trash", text: "Delete", danger: true }], { width: 200, align: "end" });
    },
    filepreview() {
      const tk = TASKS.find((x) => x.id === S.task) || {};
      dialog(`<button type="button" class="pd-ib pd-ib-7 pd-dialog-x" data-pd-close aria-label="Close">${ico("x", 14)}</button><div><h2>DESIGN.md</h2><p class="pd-dialog-desc">Attached to “${esc(tk.title || "")}”</p></div>
        <pre style="font:12px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;background:#f5f5f5;border-radius:8px;padding:14px;overflow:auto;max-height:300px;white-space:pre-wrap">DESIGN.md

## Brand
- Name: Sokosumi
- Accent: #6400FF (Wisteria)
- Type: Inter, light headings

## Tone
- Sentence case. Say the obvious thing.
- No invented metrics.

## Output
- One file the reader can send.</pre>
        <div class="pd-dialog-foot"><button type="button" class="pd-btn pd-btn-outline pd-btn-sm" data-pd-act="download">${ico("download")}Download</button><button type="button" class="pd-btn pd-btn-dark pd-btn-sm" data-pd-close>Done</button></div>`, { cls: "pd-dialog-sm" });
    },
    newproject() {
      dialog(`<button type="button" class="pd-ib pd-ib-7 pd-dialog-x" data-pd-close aria-label="Close">${ico("x", 14)}</button><div><h2>New project</h2><p class="pd-dialog-desc">A project holds the description, the tasks and the jobs that come back.</p></div>
        <form data-pd-form="newproject" style="display:flex;flex-direction:column;gap:16px">
          <div class="pd-field"><label>Name</label><input name="name" placeholder="Project name" required maxlength="60" autocomplete="off" /></div>
          <div class="pd-field"><label>Description</label><textarea name="desc" placeholder="What is this project about? Coworkers read this before every task." maxlength="400"></textarea></div>
          <div class="pd-dialog-foot"><button type="button" class="pd-btn pd-btn-outline pd-btn-sm" data-pd-close>Cancel</button><button type="submit" class="pd-btn pd-btn-dark pd-btn-sm">Create project</button></div>
        </form>`, { cls: "pd-dialog-sm", focus: 'input[name="name"]' });
    },
    projectedit() {
      const pr = D.projects.find((x) => x.name === S.project) || { name: S.project, d: "" };
      dialog(`<button type="button" class="pd-ib pd-ib-7 pd-dialog-x" data-pd-close aria-label="Close">${ico("x", 14)}</button><div><h2>Edit project</h2></div>
        <form data-pd-form="editproject" style="display:flex;flex-direction:column;gap:16px">
          <div class="pd-field"><label>Name</label><input name="name" value="${esc(pr.name)}" required maxlength="60" autocomplete="off" /></div>
          <div class="pd-field"><label>Description</label><textarea name="desc" maxlength="400">${esc(pr.d || "")}</textarea></div>
          <div class="pd-dialog-foot"><button type="button" class="pd-btn pd-btn-outline pd-btn-sm" data-pd-close>Cancel</button><button type="submit" class="pd-btn pd-btn-dark pd-btn-sm">Save</button></div>
        </form>`, { cls: "pd-dialog-sm", focus: 'input[name="name"]' });
    },
    histfilters(anchor) {
      menu(anchor, [{ label: "Type" }, { id: "hf:task", checkbox: true, checked: true, text: "Tasks" }, { id: "hf:job", checkbox: true, checked: true, text: "Jobs" }, "-", { label: "Status" }, { id: "hf:completed", checkbox: true, checked: true, text: "Completed" }, { id: "hf:queued", checkbox: true, checked: true, text: "Queued" }, { id: "hf:canceled", checkbox: true, checked: true, text: "Canceled" }], { width: 200, align: "end" });
    },
    credits() {
      dialog(`<button type="button" class="pd-ib pd-ib-7 pd-dialog-x" data-pd-close aria-label="Close">${ico("x", 14)}</button><div><h2>Get more credits</h2><p class="pd-dialog-desc">Credits pay for coworker time. Buy a pack once or upgrade the plan for a monthly allowance.</p></div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">${[["1,000", "credits"], ["5,000", "credits"], ["20,000", "credits"]].map(([n, l], i) => `<button type="button" class="pd-btn pd-btn-outline" style="height:auto;padding:14px 8px;flex-direction:column;gap:2px;${i === 1 ? "border-color:#6400ff" : ""}" data-pd-act="buy"><strong style="font-size:16px">${n}</strong><span style="font-size:12px;color:var(--mfg);font-weight:400">${l}</span></button>`).join("")}</div>
        <div class="pd-dialog-foot"><button type="button" class="pd-btn pd-btn-outline pd-btn-sm" data-pd-close>Close</button><a class="pd-btn pd-btn-primary pd-btn-sm" href="/pricing" style="text-decoration:none">See plans</a></div>`, { cls: "pd-dialog-sm" });
    },
    settings() {
      dialog(`<button type="button" class="pd-ib pd-ib-7 pd-dialog-x" data-pd-close aria-label="Close">${ico("x", 14)}</button><div><h2>Settings</h2><p class="pd-dialog-desc">Profile and notification preferences.</p></div>
        <form data-pd-form="settings" style="display:flex;flex-direction:column;gap:16px">
          <div class="pd-field"><label>Display name</label><input name="name" value="Patrick Tobler" maxlength="60" /></div>
          <div class="pd-field"><label>Email</label><input name="email" value="patrick@nmkr.io" readonly /></div>
          <div class="pd-field"><label>Status</label><select name="status"><option>Away</option><option>Online</option><option>Do not disturb</option></select></div>
          <div class="pd-dialog-foot"><button type="button" class="pd-btn pd-btn-outline pd-btn-sm" data-pd-close>Cancel</button><button type="submit" class="pd-btn pd-btn-dark pd-btn-sm">Save</button></div>
        </form>`, { cls: "pd-dialog-sm" });
    },
  };

  // ---- New Task dialog -----------------------------------------------------
  function openNewTask(personSlug, offer) {
    S.newTask = { person: personSlug, offer: offer, schedule: null, step: offer ? 2 : 1 };
    dialog("", { cls: "pd-nt", kind: "newtask" });
    renderNewTask();
  }
  function renderNewTask() {
    const nt = S.newTask;
    const p = P[nt.person];
    const box = layer.querySelector(".pd-dialog");
    if (!box) return;
    if (nt.step === 1) {
      const rail = D.vendors.map((v) => `<div><h4>${esc(v.name)}</h4>${v.members.map((s) => `<button type="button" class="pd-rail-item${s === nt.person ? " is-on" : ""}" data-pd-nt-person="${esc(s)}">${ava(s, 28)}<span><span class="pd-rail-name">${esc(P[s].name)}</span><span class="pd-rail-role">${esc(P[s].role)}</span></span></button>`).join("")}</div>`).join("");
      const vendor = D.vendors.find((v) => v.id === p.vendor);
      const tagIcons = {};
      $$(".pd-tag svg").forEach((s) => { const t = s.parentElement.textContent.trim(); if (!tagIcons[t]) tagIcons[t] = s.outerHTML; });
      box.innerHTML = `<div class="pd-nt-head"><h3>New Task</h3><button type="button" class="pd-nt-cancel" data-pd-close>Cancel</button></div>
        <div class="pd-nt-body">
          <div class="pd-nt-rail">${rail}</div>
          <div class="pd-nt-main">
            <div class="pd-nt-cw">${ava(p.slug, 56)}<div><h3>${esc(p.name)} ${p.slug === "elena" ? "<small>Default</small>" : ""}</h3><p>${esc(p.role)}</p>${vendor && vendor.logo ? `<img class="pd-nt-vendor" src="${esc(vendor.logo)}" alt="${esc(vendor.name)}" />` : `<p style="font-size:12px;margin-top:6px;font-weight:600;color:var(--fg)">${esc(vendor ? vendor.name : "")}</p>`}</div></div>
            <p class="pd-bio" style="font-size:13px">${esc(p.bio)}</p>
            <div class="pd-tags">${p.models.map((m) => `<span class="pd-tag">${tagIcons[m] || ""}${esc(m)}</span>`).join("")}<span class="pd-tag"><span class="pd-flag">🇪🇺</span>${esc(p.host)}</span></div>
            <p class="pd-kicker">Ready-To-Run Tasks</p>
            <div class="pd-offers">
              <button type="button" class="pd-offer pd-offer-scratch" data-pd-nt-scratch><span class="pd-offer-media"><span class="pd-offer-scratch-ico">${ico("pen-line", 20)}</span></span><span class="pd-offer-body"><span class="pd-offer-title">Start from scratch</span><span class="pd-offer-blurb">Write your own instructions</span><span class="pd-offer-foot"><span></span>${ico("arrow-up-right", 16).replace('class="lu"', 'class="lu pd-offer-go"')}</span></span></button>
              ${p.offers.map((o) => offerCard(p, o).replace('data-pd-offer=', 'data-pd-nt-offer=')).join("")}
            </div>
          </div>
        </div>`;
    } else {
      const vendor = D.vendors.find((v) => v.id === p.vendor);
      const o = nt.offer;
      box.innerHTML = `<div class="pd-nt-head"><button type="button" class="pd-nt-back" data-pd-nt-back>${ico("arrow-left")}Back</button><h3>New Task</h3><button type="button" class="pd-nt-cancel" data-pd-close>Cancel</button></div>
        <div class="pd-nt-compose">
          <div class="pd-nt-cwbar"><span>${ava(p.slug, 28)}<span><b>${esc(p.name)}</b><small>${esc(p.role)}</small></span></span>${vendor && vendor.logo ? `<img src="${esc(vendor.logo)}" alt="${esc(vendor.name)}" />` : `<b style="font-size:12px">${esc(vendor ? vendor.name : "")}</b>`}</div>
          <form class="pd-nt-form" data-pd-form="createtask">
            <div><h4>What should ${esc(p.name)} do?</h4><p>Briefly explain the task that needs to be done</p></div>
            <div class="pd-field"><label style="font-size:12px">Project</label><button type="button" class="pd-nt-select" data-pd-nt-project><span data-pd-nt-project-label>${esc(nt.project || "No project")}</span>${ico("chevrons-up-down", 14)}</button></div>
            <div class="pd-field"><label style="font-size:12px">Details</label>
              <div class="pd-nt-editor"><div class="pd-nt-editor-tools">${["bold", "italic", "code", "link-2", "list", "list-ordered", "paperclip"].map((k) => `<button type="button" class="pd-ib" data-pd-fmt="${k}" aria-label="${k}">${ico(k, 14)}</button>`).join("")}</div><textarea name="details" placeholder="Enter task details..." data-pd-nt-details>${esc(o ? o.title + "\n\n" + o.blurb : "")}</textarea></div></div>
            <div class="pd-nt-ctx"><span>Context</span><span class="pd-ctx-chip"><i>✓</i>utxo AG brand guidelines ${ico("chevrons-up-down", 12)}</span><span class="pd-ib pd-ib-7" title="Context is added to every task in this workspace">${ico("circle-alert", 14)}</span></div>
          </form>
          <div class="pd-nt-foot">
            <span data-pd-nt-schedlabel style="margin-right:auto;font-size:12px;color:var(--mfg)">${nt.schedule ? "Runs " + esc(nt.schedule) : ""}</span>
            <button type="button" class="pd-btn pd-btn-outline pd-btn-icon" data-pd-nt-schedule aria-label="Schedule">${ico("clock-plus")}</button>
            <button type="button" class="pd-btn pd-btn-outline pd-btn-sm" data-pd-nt-draft>Save as Draft</button>
            <button type="button" class="pd-btn pd-btn-dark pd-btn-sm" data-pd-nt-create>Create Task <kbd>⌘↵</kbd></button>
          </div>
        </div>`;
      setTimeout(() => { const ta = layer.querySelector("[data-pd-nt-details]"); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); } }, 30);
    }
  }
  function createFromDialog(draft) {
    const nt = S.newTask;
    const ta = layer.querySelector("[data-pd-nt-details]");
    const text = (ta && ta.value.trim()) || "";
    if (!text) { if (ta) { ta.focus(); ta.placeholder = "Tell " + P[nt.person].name + " what to do first."; } return; }
    const lines = text.split("\n").filter(Boolean);
    const title = (nt.offer ? nt.offer.title : lines[0]).slice(0, 110);
    const blurb = (nt.offer ? (lines.slice(1).join(" ").trim() || nt.offer.blurb) : lines.slice(1).join(" ").trim() || lines[0]).slice(0, 220);
    const tk = addTask({ title: title, blurb: blurb, who: [nt.person, "patrick"], status: draft ? "draft" : "queued", project: nt.project || "No project", sched: nt.schedule === "weekly" ? "Weekly (Monday, 9:00)" : nt.schedule === "daily" ? "Daily (9:00)" : null, next: nt.schedule ? "Aug 20, 9:00 AM" : null });
    closeLayer();
    setView("tasks");
    S.projectFilter = null; $("[data-pd-projectpick-label]").textContent = "All projects";
    applyBoardFilters();
    const card = $(`.pd-card[data-pd-task="${tk.id}"]`);
    if (card) { card.classList.add("is-on"); card.scrollIntoView({ block: "nearest" }); }
  }

  // ---- events --------------------------------------------------------------
  function closestAttr(el, attr) { const n = el.closest("[" + attr + "]"); return n ? n : null; }
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const inApp = app.contains(t);
    // marketing tabs + chapter links
    if (!inApp) {
      const vb = t.closest(".pd-tab[data-pd-view], .pd-see[data-pd-view], [data-pd-feature]");
      if (vb) {
        setView(vb.getAttribute("data-pd-view") || vb.getAttribute("data-pd-feature"));
        if (!vb.classList.contains("pd-tab")) stage.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      }
      return;
    }
    // layer close
    if (t.closest("[data-pd-close]")) { e.preventDefault(); closeLayer(); return; }
    const inLayer = layer.contains(t);

    // ordered handlers -------------------------------------------------------
    let n;
    if ((n = t.closest("[data-pd-pick]"))) { setPerson(n.getAttribute("data-pd-pick")); return; }
    if ((n = t.closest("[data-pd-chatwith]"))) { closeLayer(); openChatWith(n.getAttribute("data-pd-person") || S.person); return; }
    if ((n = t.closest("[data-pd-dmwith]"))) {
      const k = n.getAttribute("data-pd-dmwith");
      let id = Object.keys(S.roomMeta).find((r) => S.roomMeta[r].kind === "dm" && S.roomMeta[r].who.length === 1 && S.roomMeta[r].who[0] === k);
      if (!id) {
        id = "dm-" + k;
        S.roomMeta[id] = { kind: "dm", who: [k], name: H[k].name };
        const ul = $("[data-pd-dms]");
        ul.insertAdjacentHTML("afterbegin", `<li class="pd-room" data-pd-room-li="${esc(id)}"><button type="button" class="pd-nav pd-room-btn" data-pd-room="${esc(id)}"><span class="pd-room-lead pd-room-faces">${ava(k, 20, { status: true })}</span><span class="pd-room-name">${esc(H[k].name)}</span><span class="pd-room-trail"></span></button><span class="pd-room-actions"><button type="button" class="pd-ib pd-ib-7" data-pd-menu="room" data-pd-room-ref="${esc(id)}" aria-label="Chat actions">${ico("ellipsis")}</button></span></li>`);
      }
      closeLayer(); openRoom(id); return;
    }
    if ((n = t.closest("[data-pd-room]")) && !t.closest("[data-pd-menu]")) { closeLayer(); openRoom(n.getAttribute("data-pd-room")); return; }
    if ((n = t.closest("[data-pd-toggle]"))) {
      const id = n.getAttribute("data-pd-toggle");
      const sec = n.closest("[data-pd-sec]");
      const open = sec.getAttribute("data-open") === "1";
      sec.setAttribute("data-open", open ? "0" : "1");
      $$(`[data-pd-group="${id}"]`).forEach((g) => { g.hidden = open; });
      const lm = sec.querySelector(".pd-loadmore-wrap"); if (lm) lm.hidden = open;
      return;
    }
    if (t.closest("[data-pd-collapse]")) { S.collapsed = !S.collapsed; app.classList.toggle("is-collapsed", S.collapsed); closeLayer(); return; }
    if ((n = t.closest("[data-pd-jobs]"))) {
      S.jobs = n.getAttribute("data-pd-jobs") === "1";
      $$("[data-pd-jobs]").forEach((b) => b.classList.toggle("is-on", b === n));
      $("[data-pd-board]").hidden = S.jobs; $("[data-pd-jobsboard]").hidden = !S.jobs; return;
    }
    if ((n = t.closest("[data-pd-projtab]"))) {
      const k = n.getAttribute("data-pd-projtab");
      $$("[data-pd-projtab]").forEach((b) => b.classList.toggle("is-on", b === n));
      $$("[data-pd-projpanel]").forEach((p) => { p.hidden = p.getAttribute("data-pd-projpanel") !== k; });
      return;
    }
    if ((n = t.closest("[data-pd-rail]"))) { selectRail(n.getAttribute("data-pd-rail"), n.getAttribute("data-pd-person")); return; }
    if ((n = t.closest("[data-pd-chip]"))) {
      const q = n.getAttribute("data-pd-chip");
      agentInput.value = agentInput.value === q ? "" : q;
      filterAgents(agentInput.value);
      agentInput.focus();
      return;
    }
    if ((n = t.closest("[data-pd-offer]"))) {
      const [slug, title] = n.getAttribute("data-pd-offer").split("|");
      const p = P[slug]; const o = p && p.offers.find((x) => x.title === title);
      openNewTask(slug, o || null); return;
    }
    if ((n = t.closest("[data-pd-nt-offer]"))) {
      const [slug, title] = n.getAttribute("data-pd-nt-offer").split("|");
      const p = P[slug]; const o = p && p.offers.find((x) => x.title === title);
      S.newTask.person = slug; S.newTask.offer = o; S.newTask.step = 2; renderNewTask(); return;
    }
    if (t.closest("[data-pd-nt-scratch]")) { S.newTask.offer = null; S.newTask.step = 2; renderNewTask(); return; }
    if ((n = t.closest("[data-pd-nt-person]"))) { S.newTask.person = n.getAttribute("data-pd-nt-person"); renderNewTask(); return; }
    if (t.closest("[data-pd-nt-back]")) { S.newTask.step = 1; renderNewTask(); return; }
    if (t.closest("[data-pd-nt-create]")) { createFromDialog(false); return; }
    if (t.closest("[data-pd-nt-draft]")) { createFromDialog(true); return; }
    if ((n = t.closest("[data-pd-nt-project]"))) {
      const items = [{ id: "ntp:", text: "No project", check: !S.newTask.project }].concat(D.projects.map((p) => ({ id: "ntp:" + p.name, text: p.name, check: S.newTask.project === p.name })));
      const ar = appRect(); const r = n.getBoundingClientRect();
      const sub = document.createElement("div");
      sub.className = "pd-pop"; sub.setAttribute("data-pd-sub", "1");
      sub.style.cssText = `top:${Math.round((r.bottom - ar.top) / scale + 4)}px;left:${Math.round((r.left - ar.left) / scale)}px;width:${Math.round(r.width / scale)}px;z-index:2`;
      sub.innerHTML = `<div class="pd-menu-list" style="max-height:240px;overflow-y:auto">${items.map((it) => `<button type="button" class="pd-mi" data-pd-mi="${esc(it.id)}"><span>${esc(it.text)}</span>${it.check ? `<span class="pd-mi-check">${ico("check", 14)}</span>` : ""}</button>`).join("")}</div>`;
      layer.querySelectorAll("[data-pd-sub]").forEach((x) => x.remove());
      layer.appendChild(sub); return;
    }
    if ((n = t.closest("[data-pd-nt-schedule]"))) {
      const items = [{ id: "nts:", text: "Run once", check: !S.newTask.schedule }, { id: "nts:daily", text: "Daily", check: S.newTask.schedule === "daily" }, { id: "nts:weekly", text: "Weekly", check: S.newTask.schedule === "weekly" }];
      const ar = appRect(); const r = n.getBoundingClientRect();
      const sub = document.createElement("div");
      sub.className = "pd-pop"; sub.setAttribute("data-pd-sub", "1");
      sub.style.cssText = `top:${Math.round((r.top - ar.top) / scale - 118)}px;left:${Math.round((r.right - ar.left) / scale - 180)}px;width:180px;z-index:2`;
      sub.innerHTML = `<div class="pd-menu-list"><div class="pd-mi-label">Schedule</div>${items.map((it) => `<button type="button" class="pd-mi" data-pd-mi="${esc(it.id)}"><span>${esc(it.text)}</span>${it.check ? `<span class="pd-mi-check">${ico("check", 14)}</span>` : ""}</button>`).join("")}</div>`;
      layer.querySelectorAll("[data-pd-sub]").forEach((x) => x.remove());
      layer.appendChild(sub); return;
    }
    if ((n = t.closest("[data-pd-mi]"))) { onMenuItem(n.getAttribute("data-pd-mi"), n); return; }
    if ((n = t.closest("[data-pd-pick-emoji]"))) {
      const em = n.getAttribute("data-pd-pick-emoji");
      const target = n.getAttribute("data-pd-react-target");
      if (target) { S.reacts[target] = S.reacts[target] === em ? null : em; renderThread(); }
      else { composeInput.value += (composeInput.value && !/\s$/.test(composeInput.value) ? " " : "") + em; syncCompose(); composeInput.focus(); }
      closeLayer(); return;
    }
    if ((n = t.closest("[data-pd-react]"))) {
      const key = n.getAttribute("data-pd-react"); const em = n.getAttribute("data-pd-emoji");
      S.reacts[key] = S.reacts[key] === em ? null : em; renderThread(); return;
    }
    if ((n = t.closest("[data-pd-fmt]"))) { n.classList.toggle("is-on"); const f = n.closest("form") ? n.closest("form").querySelector("textarea,input") : composeInput; if (f) f.focus(); return; }
    if ((n = t.closest("[data-pd-menu]"))) {
      const kind = n.getAttribute("data-pd-menu");
      if (kind === "room") {
        const id = n.getAttribute("data-pd-room-ref"); const m = S.roomMeta[id] || {};
        menu(n, [{ id: "room:pin:" + id, icon: "pin", text: m.pinned ? "Unpin" : "Pin to top" }, { id: "room:read:" + id, icon: "check-check", text: "Mark as read" }, { id: "room:mute:" + id, icon: "bell-off", text: "Mute" }, "-", { id: "room:leave:" + id, icon: "log-out", text: m.kind === "dm" ? "Close conversation" : "Leave channel", danger: true }], { width: 200 });
      } else if (kind === "project") {
        const name = n.getAttribute("data-pd-project-ref");
        menu(n, [{ id: "pm:open:" + name, icon: "folder", text: "Open" }, { id: "pm:edit:" + name, icon: "pencil", text: "Edit" }, { id: "pm:archive:" + name, icon: "archive", text: "Archive" }, "-", { id: "pm:delete:" + name, icon: "trash", text: "Delete", danger: true }], { width: 180, align: "end" });
      }
      return;
    }
    if ((n = t.closest("[data-pd-open]"))) {
      const kind = n.getAttribute("data-pd-open");
      if (layerKind === kind && !inLayer) { closeLayer(); return; }
      if (OPEN[kind]) { if (!inLayer || kind === "emoji") { if (!inLayer) closeLayer(); } OPEN[kind](n, n); }
      return;
    }
    if ((n = t.closest("[data-pd-act]"))) { onAct(n.getAttribute("data-pd-act"), n); return; }
    if ((n = t.closest("[data-pd-task]"))) { closeLayer(); openTask(n.getAttribute("data-pd-task")); return; }
    if ((n = t.closest("[data-pd-openproject]"))) { openProject(n.getAttribute("data-pd-openproject")); return; }
    if ((n = t.closest("[data-pd-view]"))) { setView(n.getAttribute("data-pd-view")); return; }
    if (inLayer) {
      // clicks inside layer content that aren't handled: keep open
      if (!t.closest(".pd-pop, .pd-dialog, .pd-sheet")) closeLayer();
    }
  });
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target instanceof Element && e.target.matches("[data-pd-feature]")) { e.preventDefault(); e.target.click(); }
  });
  // keyboard: Enter/Space on cards
  app.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !layer.hidden) { closeLayer(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); closeLayer(); OPEN.search(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && layerKind === "newtask" && S.newTask && S.newTask.step === 2) { e.preventDefault(); createFromDialog(false); return; }
    if ((e.key === "Enter" || e.key === " ") && e.target instanceof Element && e.target.matches(".pd-card[role=button]")) { e.preventDefault(); openTask(e.target.getAttribute("data-pd-task")); }
  });

  function onMenuItem(id, el) {
    if (id.startsWith("ws:")) { const name = id.slice(3); S.workspace = name; $(".pd-ws-name").textContent = name; toast("Switched to " + name); closeLayer(); return; }
    if (id === "ws-create") { closeLayer(); dialog(`<button type="button" class="pd-ib pd-ib-7 pd-dialog-x" data-pd-close aria-label="Close">${ico("x", 14)}</button><div><h2>Create workspace</h2><p class="pd-dialog-desc">A workspace has its own coworkers, projects and credits.</p></div><form data-pd-form="newws" style="display:flex;flex-direction:column;gap:16px"><div class="pd-field"><label>Workspace name</label><input name="name" placeholder="Acme GmbH" required maxlength="40" /></div><div class="pd-dialog-foot"><button type="button" class="pd-btn pd-btn-outline pd-btn-sm" data-pd-close>Cancel</button><button type="submit" class="pd-btn pd-btn-dark pd-btn-sm">Create</button></div></form>`, { cls: "pd-dialog-sm", focus: "input" }); return; }
    if (id === "ws-user") { closeLayer(); OPEN.account($(".pd-account")); return; }
    if (id.startsWith("proj:")) { S.projectFilter = id.slice(5) || null; $("[data-pd-projectpick-label]").textContent = S.projectFilter || "All projects"; applyBoardFilters(); closeLayer(); return; }
    if (id.startsWith("f:")) {
      const k = id.slice(2);
      if (k === "reset") { S.filters = { mine: false, scheduled: false, done: true }; closeLayer(); }
      else { S.filters[k] = !S.filters[k]; el.classList.toggle("is-checked", S.filters[k]); }
      applyBoardFilters(); return;
    }
    if (id.startsWith("d:")) { const k = id.slice(2); if (k !== "order") S.display = k; applyBoardFilters(); closeLayer(); return; }
    if (id.startsWith("hf:")) { el.classList.toggle("is-checked"); const st = id.slice(3); if (["completed", "queued", "canceled"].includes(st)) { const on = el.classList.contains("is-checked"); $$(".pd-hist-row").forEach((row) => { const b = row.querySelector(".pd-badge span:last-child"); if (b && b.textContent.toLowerCase() === st) row.hidden = !on; }); } return; }
    if (id.startsWith("ntp:")) { S.newTask.project = id.slice(4) || null; layer.querySelector("[data-pd-nt-project-label]").textContent = S.newTask.project || "No project"; layer.querySelectorAll("[data-pd-sub]").forEach((x) => x.remove()); return; }
    if (id.startsWith("nts:")) { S.newTask.schedule = id.slice(4) || null; layer.querySelector("[data-pd-nt-schedlabel]").textContent = S.newTask.schedule ? "Runs " + S.newTask.schedule : ""; layer.querySelectorAll("[data-pd-sub]").forEach((x) => x.remove()); return; }
    if (id.startsWith("room:")) {
      const [, act, rid] = id.split(":");
      const li = $(`.pd-room[data-pd-room-li="${rid}"]`); const m = S.roomMeta[rid] || {};
      if (act === "pin") { m.pinned = !m.pinned; const trail = li.querySelector(".pd-room-trail"); trail.innerHTML = m.pinned ? `<span class="pd-room-pin">${ico("pin", 14)}</span>` : ""; toast(m.pinned ? "Pinned" : "Unpinned"); }
      if (act === "read") { li.classList.remove("is-unread"); const u = li.querySelector(".pd-unread"); if (u) u.remove(); toast("Marked as read"); }
      if (act === "mute") { toast("Muted " + (m.kind === "dm" ? m.name : "#" + m.name)); }
      if (act === "leave") { li.remove(); delete S.roomMeta[rid]; toast(m.kind === "dm" ? "Conversation closed" : "Left #" + m.name); if (S.room === rid) openRoom("everyone"); }
      closeLayer(); return;
    }
    if (id.startsWith("pm:")) {
      const [, act, name] = id.split(":");
      if (act === "open") openProject(name);
      if (act === "edit") { S.project = name; OPEN.projectedit(); return; }
      if (act === "archive") { const row = $(`.pd-proj-row[data-pd-project="${CSS.escape(name)}"]`); if (row) row.remove(); toast("Archived " + name); }
      if (act === "delete") { const row = $(`.pd-proj-row[data-pd-project="${CSS.escape(name)}"]`); if (row) row.remove(); toast("Deleted " + name); }
      closeLayer(); return;
    }
    if (id.startsWith("ch:")) { const k = id.slice(3); closeLayer(); if (k === "leave") { const li = $(`.pd-room[data-pd-room-li="${S.room}"]`); if (li) li.remove(); toast("Left " + roomLabel(S.room)); openRoom("everyone"); } else if (k === "members") OPEN.newdm(); else if (k === "edit") dialog(`<button type="button" class="pd-ib pd-ib-7 pd-dialog-x" data-pd-close aria-label="Close">${ico("x", 14)}</button><div><h2>Edit channel</h2></div><form data-pd-form="editchannel" style="display:flex;flex-direction:column;gap:16px"><div class="pd-field"><label>Name</label><input name="name" value="${esc((S.roomMeta[S.room] || {}).name || "")}" maxlength="40" /></div><div class="pd-field"><label>Description</label><input name="desc" placeholder="What is this channel about?" maxlength="80" /></div><div class="pd-dialog-foot"><button type="button" class="pd-btn pd-btn-outline pd-btn-sm" data-pd-close>Cancel</button><button type="submit" class="pd-btn pd-btn-dark pd-btn-sm">Save</button></div></form>`, { cls: "pd-dialog-sm", focus: "input" }); else toast("Notifications muted for " + roomLabel(S.room)); return; }
    if (id.startsWith("att:")) { closeLayer(); const k = id.slice(4); if (k === "task") { composeInput.value += (composeInput.value ? " " : "") + "https://app.sokosumi.com/tasks/" + (TASKS[0] || {}).id; syncCompose(); } else toast(k === "drive" ? "Pick a file from Drive" : "Choose a file to upload"); composeInput.focus(); return; }
    if (id.startsWith("at:")) { closeLayer(); composeInput.value += (composeInput.value && !/\s$/.test(composeInput.value) ? " " : "") + "@" + P[id.slice(3)].name + " "; syncCompose(); composeInput.focus(); return; }
    if (id.startsWith("share:")) { closeLayer(); if (id === "share:copy") toast("Link copied"); else { openRoom("everyone"); composeInput.value = "https://app.sokosumi.com/tasks/" + S.task + " "; syncCompose(); composeInput.focus(); } return; }
    if (id.startsWith("task:")) {
      const k = id.slice(5); const tk = TASKS.find((x) => x.id === S.task); closeLayer();
      if (!tk) return;
      if (k === "edit") { openNewTask(tk.who.find((w) => P[w]) || "elena", { title: tk.title, blurb: tk.blurb }); }
      else if (k === "dup") { const c = addTask(Object.assign({}, tk, { id: undefined, status: "queued", lane: "backlog", title: tk.title, comments: 0 })); openTask(c.id); toast("Task duplicated"); }
      else if (k === "rerun") { toast("Queued to run again"); }
      else if (k === "cancel") { tk.status = "canceled"; $("[data-pd-td-status]").innerHTML = badge("canceled"); const card = $(`.pd-card[data-pd-task="${tk.id}"]`); if (card) card.querySelector(".pd-badge").outerHTML = badge("canceled"); toast("Task canceled"); }
      else if (k === "delete") { const card = $(`.pd-card[data-pd-task="${tk.id}"]`); if (card) card.remove(); const i = TASKS.indexOf(tk); if (i > -1) TASKS.splice(i, 1); toast("Task deleted"); setView("tasks"); }
      return;
    }
    closeLayer();
  }

  function onAct(act, el) {
    switch (act) {
      case "chatsearch": { const box = $("[data-pd-chatsearch]"); box.hidden = !box.hidden; el.classList.toggle("is-on", !box.hidden); if (!box.hidden) setTimeout(() => $("[data-pd-chatsearch-input]").focus(), 20); else { $("[data-pd-chatsearch-input]").value = ""; renderThread(); } break; }
      case "togglefmt": { S.fmt = !S.fmt; $("[data-pd-fmtbar]").hidden = !S.fmt; el.classList.toggle("is-on", S.fmt); el.setAttribute("aria-label", S.fmt ? "Hide formatting" : "Show formatting"); break; }
      case "quote": { const id = el.getAttribute("data-pd-msg-ref"); const m = ensureRoom(S.room).find((x) => x.id === id); if (m) { composeInput.value = "> " + nameOf(m.who) + ": " + (m.text || "").slice(0, 80) + "\n"; syncCompose(); composeInput.focus(); } break; }
      case "copy": { const id = el.getAttribute("data-pd-msg-ref"); const m = ensureRoom(S.room).find((x) => x.id === id); if (m && navigator.clipboard) navigator.clipboard.writeText(m.text || "").catch(() => {}); toast("Copied to clipboard"); break; }
      case "more-dms": { const ul = $("[data-pd-dms]"); ["samuel"].forEach((k) => { const id = "dm-" + k; if (S.roomMeta[id]) return; S.roomMeta[id] = { kind: "dm", who: [k], name: H[k].name }; ul.insertAdjacentHTML("beforeend", `<li class="pd-room" data-pd-room-li="${id}"><button type="button" class="pd-nav pd-room-btn" data-pd-room="${id}"><span class="pd-room-lead pd-room-faces">${ava(k, 20, { status: true })}</span><span class="pd-room-name">${esc(H[k].name)}</span><span class="pd-room-trail"></span></button><span class="pd-room-actions"><button type="button" class="pd-ib pd-ib-7" data-pd-menu="room" data-pd-room-ref="${id}" aria-label="Chat actions">${ico("ellipsis")}</button></span></li>`); }); el.disabled = true; el.textContent = "All conversations loaded"; break; }
      case "more-history": { const ul = $("[data-pd-history]"); const rows = $$(".pd-hist-row", ul).slice(0, 6); rows.forEach((r) => { const c = r.cloneNode(true); c.querySelector(".pd-hist-when").textContent = "Last week"; ul.appendChild(c); }); el.disabled = true; el.textContent = "No more history"; break; }
      case "more-companies": { el.hidden = true; toast("Masumi Network coworkers are in the marketplace"); break; }
      case "logout": { closeLayer(); toast("You stay signed in — this is a demo"); break; }
      case "activate": { closeLayer(); toast("Your assistant is being set up"); const pa = $(".pd-pa-label"); if (pa) pa.textContent = "Setting up…"; setTimeout(() => { if (pa) pa.textContent = "Personal Assistant"; const nw = $(".pd-new"); if (nw) nw.remove(); }, 2500); break; }
      case "download": { toast("Download started"); break; }
      case "expand": { const li = el.closest(".pd-act"); if (li) { li.classList.remove("is-clamped"); el.remove(); } break; }
      case "buy": { closeLayer(); toast("Checkout opens in the app"); break; }
      case "invite": { closeLayer(); toast("Invite link copied"); break; }
      default: break;
    }
  }

  // forms
  layer.addEventListener("submit", (e) => {
    const form = e.target.closest("[data-pd-form]");
    if (!form) return;
    e.preventDefault();
    const kind = form.getAttribute("data-pd-form");
    const fd = new FormData(form);
    if (kind === "newchannel") {
      const name = String(fd.get("name") || "").trim().replace(/^#/, "");
      if (!name) return;
      const id = "ch-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (!S.roomMeta[id]) {
        S.roomMeta[id] = { kind: "channel", name: name };
        $("[data-pd-channels]").insertAdjacentHTML("beforeend", `<li class="pd-room" data-pd-room-li="${id}"><button type="button" class="pd-nav pd-room-btn" data-pd-room="${id}"><span class="pd-room-lead">${ico("hash", 14)}</span><span class="pd-room-name">${esc(name)}</span><span class="pd-room-trail"></span></button><span class="pd-room-actions"><button type="button" class="pd-ib pd-ib-7" data-pd-menu="room" data-pd-room-ref="${id}" aria-label="Chat actions">${ico("ellipsis")}</button></span></li>`);
      }
      closeLayer(); openRoom(id); toast("Created #" + name);
    } else if (kind === "newproject") {
      const name = String(fd.get("name") || "").trim(); if (!name) return;
      const pr = { n: name.charAt(0).toUpperCase(), name: name, d: String(fd.get("desc") || "").trim(), t: 0 };
      D.projects.unshift(pr);
      $("[data-pd-projects]").insertAdjacentHTML("afterbegin", projectRowHtml(pr));
      closeLayer(); toast("Project created");
    } else if (kind === "editproject") {
      const pr = D.projects.find((x) => x.name === S.project);
      const name = String(fd.get("name") || "").trim() || S.project;
      if (pr) { const old = pr.name; pr.name = name; pr.d = String(fd.get("desc") || "").trim(); TASKS.forEach((tk) => { if (tk.project === old) tk.project = name; }); const row = $(`.pd-proj-row[data-pd-project="${CSS.escape(old)}"]`); if (row) row.outerHTML = projectRowHtml(pr); }
      closeLayer(); openProject(name); toast("Project saved");
    } else if (kind === "editchannel") {
      const name = String(fd.get("name") || "").trim(); const m = S.roomMeta[S.room];
      if (m && name) { m.name = name; const li = $(`.pd-room[data-pd-room-li="${S.room}"] .pd-room-name`); if (li) li.textContent = name; }
      closeLayer(); openRoom(S.room); toast("Channel updated");
    } else if (kind === "settings") {
      const name = String(fd.get("name") || "").trim(); if (name) { $(".pd-account-name").textContent = name; H.patrick.name = name; }
      closeLayer(); toast("Settings saved");
    } else if (kind === "newws") {
      const name = String(fd.get("name") || "").trim(); if (name) { S.workspace = name; $(".pd-ws-name").textContent = name; }
      closeLayer(); toast("Workspace created");
    } else if (kind === "createtask") {
      createFromDialog(false);
    }
  });
  // task detail comment form
  const tdForm = $("[data-pd-td-comment]");
  tdForm.querySelector("textarea").addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); tdForm.requestSubmit(); }
  });
  tdForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const ta = tdForm.querySelector("textarea");
    const text = ta.value.trim(); if (!text || !S.task) return;
    (S.activities[S.task] = S.activities[S.task] || []).unshift({ text: text });
    ta.value = "";
    openTask(S.task);
    toast("Comment posted");
  });

  // composer
  function syncCompose() {
    composeInput.parentElement.classList.toggle("has-value", !!composeInput.value);
    const send = $("[data-pd-compose] button[type=submit]");
    if (send) send.classList.toggle("is-idle", !composeInput.value.trim());
  }
  composeInput.addEventListener("input", syncCompose);
  syncCompose();
  $("[data-pd-compose]").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = composeInput.value.trim();
    if (!text) return;
    composeInput.value = ""; syncCompose();
    sendMessage(text);
  });
  const chatSearch = $("[data-pd-chatsearch-input]");
  chatSearch.addEventListener("input", () => renderThread(chatSearch.value));
  const histSearch = $("[data-pd-histsearch]");
  histSearch.addEventListener("input", () => {
    const q = histSearch.value.trim().toLowerCase();
    $$(".pd-hist-row").forEach((row) => { row.hidden = !!q && !row.textContent.toLowerCase().includes(q); });
  });

  // ---- boot ----------------------------------------------------------------
  if (narrow) { S.collapsed = true; app.classList.add("is-collapsed"); }
  $(".pd-bell").classList.add("has-unread");
  setPerson("elena");
  openRoom("everyone");
  setView("home");
})();

(function () {
  "use strict";

  var form = document.getElementById("seoMdForm");
  if (!form) return;

  var urlInput = document.getElementById("seoMdUrl");
  var submit = document.getElementById("seoMdSubmit");
  var submitLabel = submit.querySelector(".dm-submit-label");
  var submitLoading = submit.querySelector(".dm-submit-loading");
  var error = document.getElementById("seoMdError");
  var progress = document.getElementById("seoMdProgress");
  var status = document.getElementById("seoMdStatus");
  var result = document.getElementById("seoMdResult");
  var source = document.getElementById("seoMdSource");
  var preview = document.getElementById("seoMdPreview");
  var editor = document.getElementById("seoMdEditor");
  var previewTab = document.getElementById("seoMdPreviewTab");
  var fileTab = document.getElementById("seoMdFileTab");
  var filePanel = document.getElementById("seoMdFile");
  var copy = document.getElementById("seoMdCopy");
  var download = document.getElementById("seoMdDownload");
  var another = document.getElementById("seoMdAnother");
  var submittedUrl = "";
  var phaseTimer = null;

  // Lead-capture modal elements (mirrors the DESIGN.md generator's email gate).
  var lead = document.getElementById("seoMdLead");
  var leadForm = document.getElementById("seoMdLeadForm");
  var leadUrl = document.getElementById("seoMdLeadUrl");
  var leadEmail = document.getElementById("seoMdLeadEmail");
  var leadAgree = document.getElementById("seoMdLeadAgree");
  var leadError = document.getElementById("seoMdLeadError");
  var leadSubmit = document.getElementById("seoMdLeadSubmit");
  var leadSubmitLabel = leadSubmit && leadSubmit.querySelector(".dm-submit-label");
  var leadSubmitLoading = leadSubmit && leadSubmit.querySelector(".dm-submit-loading");
  var leadClose = document.getElementById("seoMdLeadClose");
  var leadX = document.getElementById("seoMdLeadX");

  var LEAD_STORAGE_KEY = "seo-md-lead-v1";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function hasLead() {
    try {
      return !!window.localStorage.getItem(LEAD_STORAGE_KEY);
    } catch (_error) {
      return false;
    }
  }

  function saveLead(email) {
    try {
      window.localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify({ email: email, ts: Date.now() }));
    } catch (_error) {
      /* private mode — fall through, the analysis still runs */
    }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function normalizeUrl(value) {
    var input = String(value || "").trim();
    if (!input) throw new Error("Enter the website you want to analyze.");
    if (!/^https?:\/\//i.test(input)) input = "https://" + input;
    var parsed;
    try {
      parsed = new URL(input);
    } catch (_error) {
      throw new Error("Enter a complete public website URL, such as https://example.com.");
    }
    if (!/^https?:$/.test(parsed.protocol) || !parsed.hostname) {
      throw new Error("Enter a public website URL that starts with http:// or https://.");
    }
    return parsed.href;
  }

  async function jsonFetch(url, options) {
    var response = await fetch(url, options);
    var data;
    try {
      data = await response.json();
    } catch (_error) {
      data = {};
    }
    if (!response.ok) {
      throw new Error(data.error || "The analysis service could not complete this request.");
    }
    return data;
  }

  function showError(message) {
    error.textContent = message;
    error.hidden = false;
    urlInput.setAttribute("aria-invalid", "true");
  }

  function clearError() {
    error.textContent = "";
    error.hidden = true;
    urlInput.removeAttribute("aria-invalid");
  }

  function setBusy(busy) {
    submit.disabled = busy;
    urlInput.disabled = busy;
    submitLabel.hidden = busy;
    submitLoading.hidden = !busy;
  }

  function setPhase(phase, message) {
    progress.hidden = false;
    progress.dataset.phase = phase;
    status.textContent = message;
  }

  function stopPhases() {
    if (phaseTimer) {
      phaseTimer.forEach(window.clearTimeout);
      phaseTimer = null;
    }
  }

  // The request is a single round-trip, so we advance the visible phases on a
  // timer to mirror what the server is doing (fetch → parse → score).
  function runPhases() {
    stopPhases();
    setPhase("queued", "Fetching the page…");
    phaseTimer = [
      window.setTimeout(function () {
        setPhase("running", "Reading titles, meta, Open Graph and structured data…");
      }, 1200),
      window.setTimeout(function () {
        setPhase("finishing", "Scoring against the checklist and building the report…");
      }, 3200),
    ];
  }

  function safeExternalUrl(value) {
    try {
      var parsed = new URL(String(value || ""));
      return /^https?:$/.test(parsed.protocol) ? parsed.href : "";
    } catch (_error) {
      return "";
    }
  }

  // Favicon chip for the result header; falls back to the first letter of the
  // hostname if the icon URL is missing or fails to load.
  function brandTile(data) {
    var tile = el("span", "dm-brand");
    var letter = String(data.hostname || "?").replace(/^www\./, "").slice(0, 1).toUpperCase();
    var icon = safeExternalUrl(data.favicon);
    if (icon) {
      var img = document.createElement("img");
      img.src = icon;
      img.alt = "";
      img.width = 28;
      img.height = 28;
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", function () {
        tile.replaceChildren(el("b", "", letter));
      });
      tile.appendChild(img);
    } else {
      tile.appendChild(el("b", "", letter));
    }
    return tile;
  }

  function addPreviewBlock(title) {
    var block = el("section", "dm-preview-block");
    if (title) block.appendChild(el("h3", "", title));
    preview.appendChild(block);
    return block;
  }

  function scoreClassFor(value) {
    return value >= 80 ? "good" : value >= 55 ? "ok" : "bad";
  }

  var BAND_LABEL = { good: "Strong", ok: "Needs work", bad: "Weak" };

  // A conic-gradient donut whose fill tracks the score. Shared by the overall
  // gauge and the smaller per-category rings via the `size` class suffix.
  function ringGauge(value, cls, size) {
    var ring = el("div", "seo-ring seo-ring-" + size + " seo-ring-" + cls);
    ring.style.setProperty("--seo-val", Math.max(0, Math.min(100, value)) * 3.6 + "deg");
    var inner = el("div", "seo-ring-inner");
    inner.appendChild(el("strong", "", value));
    ring.appendChild(inner);
    return ring;
  }

  // One category meter: a mini score ring, a band label, and — when the server
  // sent them — the individual pass/fail factors behind the score.
  function scoreMeter(label, value, factors, caption) {
    var cls = scoreClassFor(value);
    var wrap = el("div", "seo-meter seo-meter-" + cls);
    var head = el("div", "seo-meter-head");
    head.appendChild(ringGauge(value, cls, "sm"));
    var htext = el("div", "seo-meter-htext");
    htext.appendChild(el("span", "seo-meter-label", label));
    htext.appendChild(el("span", "seo-meter-band seo-meter-band-" + cls, BAND_LABEL[cls]));
    head.appendChild(htext);
    wrap.appendChild(head);
    if (Array.isArray(factors) && factors.length) {
      var list = el("ul", "seo-factors");
      factors.forEach(function (factor) {
        var item = el("li", "seo-factor seo-factor-" + (factor.ok ? "ok" : "no"));
        var mark = el("span", "seo-factor-mark", factor.ok ? "✓" : "✕");
        mark.setAttribute("aria-hidden", "true");
        item.appendChild(mark);
        item.appendChild(el("span", "seo-factor-label", factor.label));
        list.appendChild(item);
      });
      wrap.appendChild(list);
    } else if (caption) {
      wrap.appendChild(el("p", "seo-meter-note", caption));
    }
    return wrap;
  }

  function renderScorecard(data) {
    var sc = data.scores || null;
    var overall = sc ? sc.overall : data.score;
    var block = el("section", "dm-preview-block seo-scorecard");

    // Overall score as a filled gauge — the conic gradient shows the value.
    var top = el("div", "seo-overall");
    var gauge = el("div", "seo-gauge seo-gauge-" + scoreClassFor(overall));
    gauge.style.setProperty("--seo-val", Math.max(0, Math.min(100, overall)) * 3.6 + "deg");
    var inner = el("div", "seo-gauge-inner");
    inner.appendChild(el("strong", "", overall));
    inner.appendChild(el("small", "", "/ 100"));
    gauge.appendChild(inner);
    top.appendChild(gauge);

    var meta = el("div", "seo-overall-meta");
    meta.appendChild(el("p", "seo-overall-label", "Overall score"));
    meta.appendChild(el("h3", "", data.hostname || "Website report"));
    var tally = el("p", "seo-tally");
    tally.appendChild(el("span", "seo-pill seo-pill-pass", data.pass + " passed"));
    tally.appendChild(el("span", "seo-pill seo-pill-warn", data.warn + " warnings"));
    tally.appendChild(el("span", "seo-pill seo-pill-fail", data.fail + " failing"));
    meta.appendChild(tally);
    top.appendChild(meta);
    block.appendChild(top);

    var meters = el("div", "seo-meters");
    meters.appendChild(scoreMeter("SEO", data.score, null, "Full breakdown in the checklist below."));
    if (sc) {
      meters.appendChild(scoreMeter("Content", sc.content.score, sc.content.factors));
      meters.appendChild(scoreMeter("Brand clarity", sc.brand.score, sc.brand.factors));
      meters.appendChild(scoreMeter("AI readiness", sc.ai.score, sc.ai.factors));
    }
    block.appendChild(meters);
    preview.appendChild(block);
  }

  function renderChecks(checks) {
    if (!Array.isArray(checks) || !checks.length) return;
    var block = addPreviewBlock("Checklist");

    // Graphical summary: a stacked proportion bar plus a dotted legend, so the
    // pass/warn/fail split reads at a glance before the detailed rows.
    var counts = { pass: 0, warn: 0, fail: 0 };
    checks.forEach(function (c) { if (counts[c.level] !== undefined) counts[c.level]++; });
    var total = checks.length;
    var summary = el("div", "seo-check-summary");
    var bar = el("div", "seo-check-bar");
    ["pass", "warn", "fail"].forEach(function (level) {
      if (!counts[level]) return;
      var seg = el("span", "seo-check-seg seo-check-seg-" + level);
      seg.style.width = (counts[level] / total) * 100 + "%";
      bar.appendChild(seg);
    });
    summary.appendChild(bar);
    var legend = el("div", "seo-check-legend");
    [["pass", "passed"], ["warn", "warnings"], ["fail", "failing"]].forEach(function (pair) {
      var item = el("span", "seo-check-legend-item seo-check-legend-" + pair[0]);
      item.appendChild(el("b", "", counts[pair[0]]));
      item.appendChild(el("span", "", " " + pair[1]));
      legend.appendChild(item);
    });
    summary.appendChild(legend);
    block.appendChild(summary);

    var list = el("ul", "seo-checks");
    checks.forEach(function (check) {
      var item = el("li", "seo-check seo-check-" + check.level);
      var mark = el("span", "seo-check-mark", check.level === "pass" ? "✓" : check.level === "warn" ? "!" : "✕");
      mark.setAttribute("aria-hidden", "true");
      item.appendChild(mark);
      var body = el("span", "seo-check-body");
      body.appendChild(el("strong", "", check.label));
      body.appendChild(el("small", "", check.detail));
      item.appendChild(body);
      list.appendChild(item);
    });
    block.appendChild(list);
  }

  // Lucide (ISC) line-icon paths, drawn at 24-viewBox with currentColor.
  var ICON = {
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    device: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    heading: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',
    text: '<line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/>',
    hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    menu: '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
    layout: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.4 2.4 0 0 0 3.42 0l6.58-6.58a2.4 2.4 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    dot: '<circle cx="12" cy="12" r="3.5"/>',
  };
  function iconFor(label) {
    var l = String(label).toLowerCase();
    if (/length|chars|count|word/.test(l)) return ICON.hash;
    if (/canonical|url|link|sitemap|http/.test(l)) return ICON.link;
    if (/lang|hreflang/.test(l)) return ICON.globe;
    if (/viewport|mobile|device/.test(l)) return ICON.device;
    if (/favicon|icon/.test(l)) return ICON.star;
    if (/image|card|twitter|og:image/.test(l)) return ICON.image;
    if (/title|heading|og:title/.test(l)) return ICON.heading;
    if (/description|meta|copy|snippet/.test(l)) return ICON.text;
    if (/nav/.test(l)) return ICON.menu;
    if (/section/.test(l)) return ICON.layout;
    if (/entit|brand|keyword|phrase/.test(l)) return ICON.tag;
    if (/llms|robots|file|txt/.test(l)) return ICON.file;
    if (/page/.test(l)) return ICON.file;
    return ICON.dot;
  }
  function fieldIcon(label) {
    var span = document.createElement("span");
    span.className = "dm-field-ico";
    span.setAttribute("aria-hidden", "true");
    span.innerHTML =
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
      iconFor(label) +
      "</svg>";
    return span;
  }

  function renderFields(title, rows) {
    var present = rows.filter(function (r) {
      return r[1] !== "" && r[1] !== null && r[1] !== undefined;
    });
    if (!present.length) return;
    var block = addPreviewBlock(title);
    var list = el("dl", "dm-type-list");
    present.forEach(function (row) {
      var line = el("div", "dm-type-row");
      line.appendChild(fieldIcon(row[0]));
      var text = el("div", "dm-field-text");
      text.appendChild(el("dt", "", row[0]));
      text.appendChild(el("dd", "", String(row[1])));
      line.appendChild(text);
      list.appendChild(line);
    });
    block.appendChild(list);
  }

  function renderList(title, items) {
    if (!Array.isArray(items) || !items.length) return;
    var block = addPreviewBlock(title);
    var list = el("ol", "seo-recs");
    items.forEach(function (item) {
      list.appendChild(el("li", "", item));
    });
    block.appendChild(list);
  }

  function renderAnswers(items) {
    if (!Array.isArray(items) || !items.length) return;
    var block = addPreviewBlock("Answers");
    var list = el("dl", "dm-type-list");
    items.forEach(function (a) {
      var row = el("div", "dm-type-row");
      var ico = document.createElement("span");
      ico.className = "dm-field-ico";
      ico.setAttribute("aria-hidden", "true");
      ico.innerHTML =
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
        ICON.help +
        "</svg>";
      row.appendChild(ico);
      var text = el("div", "dm-field-text");
      text.appendChild(el("dt", "", a.q));
      text.appendChild(el("dd", "", a.a || "—"));
      row.appendChild(text);
      list.appendChild(row);
    });
    block.appendChild(list);
  }

  function renderRecommendations(recs) {
    if (!Array.isArray(recs) || !recs.length) return;
    var block = addPreviewBlock("Recommendations");
    var list = el("ol", "seo-recs");
    recs.forEach(function (rec) {
      list.appendChild(el("li", "", rec));
    });
    block.appendChild(list);
  }

  function renderResult(data) {
    stopPhases();
    setBusy(false);
    progress.hidden = true;
    clearError();
    preview.replaceChildren();

    renderScorecard(data);
    renderChecks(data.checks);
    renderFields("Identity", [
      ["Title", data.title],
      ["Title length", data.title ? data.title.length + " chars" : ""],
      ["Meta description", data.description],
      ["Description length", data.description ? data.description.length + " chars" : ""],
      ["Canonical", data.canonical],
      ["Language", data.lang],
      ["Robots meta", data.robotsMeta],
      ["Viewport", data.viewport],
      ["Favicon", data.favicon],
    ]);
    var og = data.og || {};
    var tw = data.twitter || {};
    renderFields("Social", [
      ["og:title", og["og:title"]],
      ["og:description", og["og:description"]],
      ["og:image", og["og:image"]],
      ["og:type", og["og:type"]],
      ["twitter:card", tw["twitter:card"]],
    ]);
    var org = data.org || null;
    renderFields("Brand", [
      ["Brand name", (org && org.name) || og["og:site_name"] || ""],
      ["Legal name", org ? org.legalName : ""],
      ["Founded", org ? org.foundingDate : ""],
      ["Location", org ? org.location : ""],
      ["Founders", org && org.founders ? org.founders.join(", ") : ""],
      ["Employees", org ? org.employees : ""],
    ]);
    renderList("Social profiles", (data.social || []).map(function (s) { return s.network + ": " + s.url; }));
    var h = data.headings || { counts: {}, h1: [] };
    var outline = Object.keys(h.counts || {})
      .filter(function (k) { return h.counts[k]; })
      .map(function (k) { return k + "×" + h.counts[k]; })
      .join(" · ");
    renderFields("Structure", [
      ["H1", (h.h1 || []).join(" / ")],
      ["Heading outline", outline],
      ["Word count", data.wordCount],
      ["Images", data.images ? data.images.total + " (" + data.images.missingAlt + " missing alt)" : ""],
      ["Links", data.links ? data.links.internal + " internal · " + data.links.external + " external" : ""],
      ["Structured data", (data.jsonLd || []).join(", ")],
      ["Sitemaps", (data.sitemaps || []).join(", ")],
    ]);
    var kw = data.keywords || { terms: [], phrases: [] };
    renderFields("Keywords", [
      ["Top terms", (kw.terms || []).map(function (t) { return t.term; }).join(", ")],
      ["Top phrases", (kw.phrases || []).map(function (t) { return "“" + t.term + "”"; }).join(", ")],
    ]);
    var topInternal = (data.links && data.links.topInternal) || [];
    renderList("Important pages", topInternal.map(function (p) {
      return p.path + (p.anchor ? " — " + p.anchor : "") + " (" + p.count + "×)";
    }));
    renderList("Navigation", (data.nav || []).map(function (n) { return n.label + " → " + n.path; }));
    var disc = data.discovery || { llmsTxt: {}, sitemap: {} };
    renderFields("Discoverability", [
      ["Sections", (data.sections || []).map(function (s) { return s.label; }).join(", ")],
      ["Sitemap", disc.sitemap && disc.sitemap.found ? (disc.sitemap.count + (disc.sitemap.isIndex ? " child sitemaps" : " URLs")) : ""],
      ["llms.txt", disc.llmsTxt && disc.llmsTxt.found ? "found" : "not found"],
    ]);
    renderList("Entities", (data.entities || []).map(function (e) { return e.type + ": " + e.name; }));
    renderAnswers(data.answers);
    renderRecommendations(data.recommendations);

    editor.value = String(data.seoMd || "");
    var resultUrl = safeExternalUrl(data.finalUrl || data.url || submittedUrl);
    source.href = resultUrl || "#";
    source.textContent = data.hostname || resultUrl || "Result";
    var brand = document.getElementById("seoMdBrand");
    if (brand) brand.replaceChildren(brandTile(data));
    result.hidden = false;
    switchTab("preview");
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function switchTab(name) {
    var showPreview = name === "preview";
    previewTab.setAttribute("aria-selected", showPreview ? "true" : "false");
    fileTab.setAttribute("aria-selected", showPreview ? "false" : "true");
    preview.hidden = !showPreview;
    filePanel.hidden = showPreview;
  }

  async function submitUrl(value) {
    clearError();
    result.hidden = true;
    submittedUrl = normalizeUrl(value);
    urlInput.value = submittedUrl;
    setBusy(true);
    runPhases();

    var data = await jsonFetch("/api/seo-md", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: submittedUrl }),
    });
    renderResult(data);
  }

  function runAnalysis(value) {
    submitUrl(value).catch(function (caught) {
      stopPhases();
      setBusy(false);
      progress.hidden = true;
      showError(caught.message || "The website could not be analyzed.");
    });
  }

  function openLead(prefillUrl) {
    if (!lead) return;
    leadError.hidden = true;
    try {
      leadUrl.value = normalizeUrl(prefillUrl);
    } catch (_error) {
      leadUrl.value = String(prefillUrl || "").trim();
    }
    lead.hidden = false;
    lead.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    (leadEmail || leadUrl).focus();
  }

  function closeLead() {
    if (!lead) return;
    lead.hidden = true;
    lead.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function setLeadBusy(busy) {
    leadSubmit.disabled = busy;
    if (leadSubmitLabel) leadSubmitLabel.hidden = busy;
    if (leadSubmitLoading) leadSubmitLoading.hidden = !busy;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    // First-time visitors trade an email for the analysis; after that the
    // saved lead lets the tool run straight away.
    if (lead && !hasLead()) {
      clearError();
      openLead(urlInput.value);
      return;
    }
    runAnalysis(urlInput.value);
  });

  if (leadForm) {
    leadForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      leadError.hidden = true;

      var email = String(leadEmail.value || "").trim();
      var targetUrl;
      try {
        targetUrl = normalizeUrl(leadUrl.value);
      } catch (caught) {
        leadError.textContent = caught.message;
        leadError.hidden = false;
        return;
      }
      if (!EMAIL_RE.test(email)) {
        leadError.textContent = "Enter a valid email address.";
        leadError.hidden = false;
        return;
      }
      if (!leadAgree.checked) {
        leadError.textContent = "Please agree to receive the free analysis.";
        leadError.hidden = false;
        return;
      }

      setLeadBusy(true);
      try {
        await jsonFetch("/api/seo-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email, url: targetUrl }),
        });
      } catch (caught) {
        setLeadBusy(false);
        leadError.textContent = caught.message || "Couldn't record your email. Try again.";
        leadError.hidden = false;
        return;
      }

      saveLead(email);
      setLeadBusy(false);
      closeLead();
      urlInput.value = targetUrl;
      runAnalysis(targetUrl);
    });

    if (leadClose) leadClose.addEventListener("click", closeLead);
    if (leadX) leadX.addEventListener("click", closeLead);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && lead && !lead.hidden) closeLead();
    });
  }

  previewTab.addEventListener("click", function () {
    switchTab("preview");
  });
  fileTab.addEventListener("click", function () {
    switchTab("file");
    editor.focus();
  });

  copy.addEventListener("click", async function () {
    var original = copy.textContent;
    try {
      await navigator.clipboard.writeText(editor.value);
      copy.textContent = "Copied";
    } catch (_error) {
      editor.select();
      document.execCommand("copy");
      copy.textContent = "Copied";
    }
    window.setTimeout(function () {
      copy.textContent = original;
    }, 2400);
  });

  download.addEventListener("click", function () {
    var blob = new Blob([editor.value], { type: "text/plain;charset=utf-8" });
    var href = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = href;
    link.download = "seo-report.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
  });

  another.addEventListener("click", function () {
    result.hidden = true;
    progress.hidden = true;
    clearError();
    urlInput.disabled = false;
    urlInput.value = "";
    urlInput.focus();
  });
})();

(function () {
  var form = document.getElementById("seoMdForm");
  var urlInput = document.getElementById("seoMdUrl");
  var output = document.getElementById("seoMdOutput");
  var progress = document.getElementById("seoMdProgress");
  var result = document.getElementById("seoMdResult");
  if (!form || !output) return;

  function sync() {
    output.dataset.state = !result.hidden ? "result" : !progress.hidden ? "progress" : "empty";
  }
  var observer = new MutationObserver(sync);
  observer.observe(progress, { attributes: true, attributeFilter: ["hidden"] });
  observer.observe(result, { attributes: true, attributeFilter: ["hidden"] });
  sync();

  document.querySelectorAll("[data-try]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      urlInput.value = chip.dataset.try;
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable: true }));
    });
  });
})();

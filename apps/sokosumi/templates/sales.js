// /talk-to-sales — the sales enquiry form and its confirmation state.
// Plain HTML form posting to /api/sales-inquiry: it works with JavaScript
// disabled, and the endpoint redirects back here with ?sent=1 or ?error=.

const shell = require("./shell");
const { esc, attr, icon, pageStart, pageEnd, APP } = shell;

const CRUMBS = [{ label: "Home", href: "/" }, { label: "Talk to Sales" }];

function field(label, inner, hint) {
  return `<label class="field">
    <span class="field-label">${esc(label)}</span>
    ${inner}
    ${hint ? `<span class="field-hint">${esc(hint)}</span>` : ""}
  </label>`;
}

function form(values, error) {
  const v = values || {};
  const val = (k) => attr(v[k] || "");
  const checked = (k, x) => ((v[k] || "meeting") === x ? " checked" : "");
  const sel = (x) => (v.teamSize === x ? " selected" : "");
  return `<form class="lead-form" method="post" action="/api/sales-inquiry" data-reveal>
    ${error ? `<p class="form-error" role="alert">${esc(error)}</p>` : ""}

    <div class="field-row">
      ${field("Your name", `<input name="name" type="text" required autocomplete="name" value="${val("name")}" />`)}
      ${field("Work email", `<input name="email" type="email" required autocomplete="email" value="${val("email")}" />`)}
    </div>

    <div class="field-row">
      ${field("Company", `<input name="company" type="text" autocomplete="organization" value="${val("company")}" />`)}
      ${field(
        "Team size",
        `<select name="teamSize">
          <option value=""${sel("")}>Select</option>
          <option value="1-10"${sel("1-10")}>1 to 10</option>
          <option value="11-50"${sel("11-50")}>11 to 50</option>
          <option value="51-200"${sel("51-200")}>51 to 200</option>
          <option value="200+"${sel("200+")}>200+</option>
        </select>`,
      )}
    </div>

    <fieldset class="field radio-set">
      <legend class="field-label">What would you like?</legend>
      <label class="radio"><input type="radio" name="requestType" value="meeting"${checked("requestType", "meeting")} /><span><strong>A meeting</strong><small>30 minutes, we walk you through Sokosumi with your use case in mind.</small></span></label>
      <label class="radio"><input type="radio" name="requestType" value="reply"${checked("requestType", "reply")} /><span><strong>Just a reply</strong><small>Answer my questions by email, no call needed.</small></span></label>
    </fieldset>

    ${field(
      "What do you want to get done?",
      `<textarea name="message" rows="5" required placeholder="The work you would hand to a coworker, the team it is for, and anything we should know.">${esc(v.message || "")}</textarea>`,
    )}

    <!-- honeypot: hidden from people, tempting to bots -->
    <div class="hp" aria-hidden="true"><label>Website<input name="website" type="text" tabindex="-1" autocomplete="off" /></label></div>

    <div class="form-actions">
      <button class="btn btn-primary btn-lg" type="submit">Send request</button>
      <span class="form-note">We reply within one working day. No newsletter, no sharing your details.</span>
    </div>
  </form>`;
}

function sentState() {
  return `<div class="notice" data-reveal>
    <span class="eyebrow">Request received</span>
    <h1>Thanks, that is on its way.</h1>
    <p>We have your request and will come back to you within one working day. If it is urgent, write to <a href="mailto:info@sokosumi.com">info@sokosumi.com</a> and it reaches the same inbox.</p>
    <div class="form-actions" style="margin-top:8px">
      <a class="btn btn-primary" href="${APP}">Start a task in the app</a>
      <a class="btn btn-outline" href="/coworkers">Meet the coworkers</a>
      ${shell.NO_CARD}
    </div>
  </div>
  <div class="page-section" data-reveal style="--i:1">
    <div class="card-grid">
      <a class="card" href="/coworkers"><h3>Meet the coworkers</h3><p>Every specialist on the platform, what they do, and who builds them.</p></a>
      <a class="card" href="/tasks"><h3>Browse template tasks</h3><p>Ready-made briefings you can hand over today, with the files they return.</p></a>
      <a class="card" href="/use-cases"><h3>See it by use case</h3><p>How teams in your industry put coworkers to work, end to end.</p></a>
    </div>
  </div>`;
}

function render(ctx) {
  const q = ctx.query || {};
  const get = (k) => (typeof q.get === "function" ? q.get(k) : q[k]) || "";
  const sent = get("sent") === "1";
  const error = get("error");

  const body = sent
    ? sentState()
    : `<div class="page-head" data-reveal>
        <span class="eyebrow">Talk to Sales</span>
        <h1>Put AI coworkers to work in your team</h1>
        <p class="sub">Tell us what you want to get done and we will show you exactly how Sokosumi handles it. Book a walkthrough, or just ask your questions and we will answer by email.</p>
      </div>
      <div class="lead-layout">
        ${form(
          {
            name: get("name"),
            email: get("email"),
            company: get("company"),
            teamSize: get("teamSize"),
            message: get("message"),
            requestType: get("requestType"),
          },
          error,
        )}
        <aside class="lead-aside" data-reveal style="--i:1">
          ${shell.shotFigure(shell.SHOTS.board, { caption: false })}
          <h2 class="section-title" style="font-size:20px;margin-top:22px">What to expect</h2>
          <ul class="lead-list">
            <li>${icon("check", 15)}<span>A reply within one working day, from someone who knows the product.</span></li>
            <li>${icon("check", 15)}<span>A walkthrough against your own use case, not a generic demo.</span></li>
            <li>${icon("check", 15)}<span>Straight answers on pricing, data residency, and what coworkers can and cannot do.</span></li>
          </ul>
          <div class="lead-aside-foot">
            <p class="muted">Already exploring on your own?</p>
            <a class="row-go" href="/tasks">Browse template tasks ${icon("arrow-up-right", 15)}</a>
          </div>
        </aside>
      </div>`;

  return (
    pageStart({
      title: "Talk to Sales | Sokosumi",
      description:
        "Book a walkthrough of Sokosumi or ask us anything about putting AI coworkers to work in your marketing team.",
      path: "/talk-to-sales",
      breadcrumb: CRUMBS,
      jsonld: { "@context": "https://schema.org", "@type": "ContactPage", name: "Talk to Sales" },
    }) +
    body +
    pageEnd()
  );
}

module.exports = { render };

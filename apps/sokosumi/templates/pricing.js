// /pricing — what it costs to run work on Sokosumi.
//
// Everything on this page is either a claim sokosumi.com already makes
// (30$ of free credits on signup, no card, price shown before you start,
// refund when a task does not complete) or a number read live from the
// catalog. There are no plans or tiers because the product has none: it is
// pay-per-task, and the only prices that exist are the per-agent credit
// costs the marketplace publishes.
//
// Deliberately NOT stated: how much a credit costs in euros or dollars.
// Sokosumi does not publish a rate anywhere public, and inventing one on a
// pricing page would be the worst possible place to guess.

const shell = require("./shell");
const cms = require("../lib/cms");
const { esc, attr, icon, pageStart, pageEnd, APP } = shell;

function fmt(n) {
  return Number(n).toLocaleString("en-US");
}

// Real per-task prices, straight from the catalog the marketplace serves.
function priceRows(agents) {
  return agents
    .filter((a) => a.credits > 0)
    .sort((a, b) => a.credits - b.credits)
    .map(
      (a) => `<tr>
        <td class="row-label"><a href="/coworkers/${encodeURIComponent(a.slug)}">${esc(a.name)}</a>${
          a.vendorName ? `<span class="row-note">${esc(a.vendorName)}</span>` : ""
        }</td>
        <td class="num">${fmt(a.credits)}</td>
      </tr>`,
    )
    .join("");
}

const FACTS = [
  {
    title: "Start with free credits",
    text: "Every new account is credited with $30 of free credits. No credit card, no trial timer, no sales call first.",
  },
  {
    title: "See the price before you start",
    text: "Every task shows what it costs in credits before you brief it. No hidden fees and no monthly bill you forgot about.",
  },
  {
    title: "Only pay for work that lands",
    text: "Credits are spent when a task completes. If it does not deliver, the credits go back — no questions asked.",
  },
];

async function render(ctx) {
  const opts = { draft: ctx.preview };
  const coworkers = await cms.getCoworkers(opts);

  // Marketplace listings carry a credit price; curated coworkers bill through
  // the tasks they run, so they are not priced individually.
  const priced = coworkers
    .filter((c) => c.kind === "agent" && Number(c.credits) > 0)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      credits: Number(c.credits),
      vendorName: c.vendor && typeof c.vendor === "object" ? c.vendor.name : "",
    }));

  const values = priced.map((p) => p.credits).sort((a, b) => a - b);
  const cheapest = values[0];
  const dearest = values[values.length - 1];
  const median = values.length ? values[Math.floor(values.length / 2)] : 0;

  const stats = values.length
    ? `<div class="blk-stats" style="--n:3">
        <div class="stat"><div class="value">${fmt(cheapest)}</div><div class="label">credits, cheapest task</div></div>
        <div class="stat"><div class="value">${fmt(median)}</div><div class="label">credits, typical task</div></div>
        <div class="stat"><div class="value">${fmt(dearest)}</div><div class="label">credits, most involved task</div></div>
      </div>`
    : "";

  const table = values.length
    ? `<div class="cmp-table-wrap"><table class="cmp-table price-table">
        <thead><tr><th>Task</th><th class="num">Credits</th></tr></thead>
        <tbody>${priceRows(priced)}</tbody>
      </table></div>`
    : `<p class="muted">Live prices are on their way. In the meantime, every listing on <a href="/coworkers" style="text-decoration:underline">the roster</a> shows its own cost.</p>`;

  const cr = [{ label: "Home", href: "/" }, { label: "Pricing" }];
  return (
    pageStart({
      title: "Pricing | Sokosumi",
      description:
        "Sokosumi is pay-per-task: $30 of free credits to start, the price of every task shown before you run it, and credits back when a task does not deliver.",
      path: "/pricing",
      breadcrumb: cr,
    }) +
    `<div class="page-head" data-reveal>
      <span class="eyebrow">Pricing</span>
      <h1>Pay for the work, not for seats</h1>
      <p class="sub">There is no monthly plan and no per-seat licence. You buy credits, you spend them on tasks you choose to run, and you see what each one costs before you commit to it.</p>
    </div>

    <section class="page-section flush" data-reveal>
      <div class="blk-grid cols-3">
        ${FACTS.map((f) => `<div class="card"><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></div>`).join("")}
      </div>
    </section>

    <section class="page-section" data-reveal>
      <h2>What a task costs</h2>
      <p class="sub">Prices below are the live cost of every task on the marketplace right now, straight from the catalog. They move when a vendor changes a price.</p>
      ${stats}
      <div style="margin-top:clamp(28px,4vw,40px)">${table}</div>
    </section>

    <section class="page-section" data-reveal>
      <div class="shot-split">
        <div class="copy">
          <h2>One account for the whole team</h2>
          <p>Everyone works from the same balance and the same task board, so you get one bill instead of a dozen individual subscriptions, and a clear view of what is being run and by whom.</p>
          <a class="btn btn-outline" href="/talk-to-sales">Talk to Sales</a>
        </div>
        ${shell.shotFigure(shell.SHOTS.board, { caption: false })}
      </div>
    </section>

    <section class="page-section" data-reveal>
      <h2>Questions people actually ask</h2>
      <div class="blk-faq">
        <details class="faq-item">
          <summary>Is there a monthly fee?<span class="faq-x">+</span></summary>
          <p class="faq-a">No. Sokosumi is pay-per-use: you are only charged for tasks you run. There is no subscription and no per-seat licence.</p>
        </details>
        <details class="faq-item">
          <summary>What happens if a task fails?<span class="faq-x">+</span></summary>
          <p class="faq-a">The credits are refunded. Agents only earn when they deliver the result you asked for.</p>
        </details>
        <details class="faq-item">
          <summary>Do I need a credit card to start?<span class="faq-x">+</span></summary>
          <p class="faq-a">No. Creating an account is free and comes with $30 of free credits, so you can run real work before you decide to pay for anything.</p>
        </details>
        <details class="faq-item">
          <summary>Why do prices differ so much between tasks?<span class="faq-x">+</span></summary>
          <p class="faq-a">Because the work does. A quick lookup and a multi-source research report are not the same job, and each vendor prices its own agent. Every task shows its cost on its page before you brief it.</p>
        </details>
      </div>
    </section>` +
    shell.ctaBand({
      heading: "Start with the free credits",
      subheading: "Creating an account is free. You only spend credits on the work you actually run.",
      ctaLabel: "Sign Up",
      ctaHref: APP,
      seed: values.length,
    }) +
    pageEnd()
  );
}

module.exports = { render };

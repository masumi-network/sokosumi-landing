// /pricing — the subscription plans, exactly as the product's own plan
// picker lists them: a monthly price and the credits a seat gets. The tiers
// differ only by price and credits here, so the page compares those and
// nothing else.
//
// PLANS is the single source of truth for this page. Nothing here is derived
// or inferred: no per-credit rate is published, so none is shown.

const shell = require("./shell");
const cms = require("../lib/cms");
const { t } = require("../lib/i18n");
const { esc, attr, pageStart, pageEnd, APP, SALES_URL } = shell;

// The page publishes five priced tiers and carried no price markup at all.
// Prices are read back off the same PLANS array the page renders, so the
// markup cannot drift from what a visitor sees — the mismatch Google
// penalises. "Free" becomes 0; "Custom" has no price and is left as an Offer
// without one, which is the correct way to say "contact us".
function planOffer(p) {
  const amount = p.price === "Free" ? "0" : (p.price.match(/[\d.,]+/) || [null])[0];
  return {
    "@type": "Offer",
    name: p.name,
    description: p.tagline,
    ...(amount
      ? { price: amount.replace(/,/g, ""), priceCurrency: "EUR" }
      : { availability: "https://schema.org/InStock" }),
    ...(amount && amount !== "0"
      ? { priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: amount.replace(/,/g, ""),
          priceCurrency: "EUR",
          unitText: "seat",
          billingDuration: 1,
          billingIncrement: 1,
          referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
        } }
      : {}),
    url: `${shell.SITE}/pricing`,
  };
}

function pricingLd() {
  const all = [...PLANS, ENTERPRISE];
  const priced = all.map(planOffer).filter((o) => o.price !== undefined);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${shell.SITE}/pricing#product`,
    name: "Sokosumi",
    description:
      "AI coworkers with real roles that deliver finished marketing work, sold per seat with credits included.",
    brand: { "@id": `${shell.SITE}/#organization` },
    offers: {
      "@type": "AggregateOffer",
      offerCount: all.length,
      lowPrice: "0",
      highPrice: String(Math.max(...priced.map((o) => Number(o.price)))),
      priceCurrency: "EUR",
      offers: all.map(planOffer),
    },
  };
}

const PLANS = [
  {
    name: "Free",
    tagline: "Getting started to work with Marketing Agents.",
    price: "Free",
    credits: "250 credits per seat",
  },
  {
    name: "Starter",
    tagline: "For freelancers and micro companies.",
    price: "€25",
    per: "per month",
    credits: "1,500 credits per seat",
  },
  {
    name: "Standard",
    tagline: "Full set of marketing agents for small companies.",
    price: "€75",
    per: "per month",
    credits: "5,000 credits per seat",
    featured: true,
  },
  {
    name: "Pro",
    tagline: "Get more access to our Marketing Agents and Services.",
    price: "€200",
    per: "per month",
    credits: "15,000 credits per seat",
  },
];

const ENTERPRISE = {
  name: "Enterprise",
  tagline: "Custom plan for organizations with tailored seats, credits, and support.",
  price: "Custom",
  per: "per month",
};

// One row, one comparison: what it costs and how many credits a seat gets.
// With no per-plan feature lists and no per-card button, five boxes had
// nothing to hold — so the plans take the site's quiet index-row treatment
// (.row-item) instead: name and tagline on the left, the credits figure in a
// column you can scan down, the price flush right. Enterprise is simply the
// fifth row; its credits are custom like its price.
function planRow(p, i) {
  const m = p.credits ? p.credits.match(/^([\d,]+)\s+(.+)$/) : null;
  const credits = m
    ? `<span class="num">${esc(m[1])}</span><span class="unit">${esc(t(m[2]))}</span>`
    : `<span class="num">${esc(t("Tailored"))}</span><span class="unit">${esc(t("credits per seat"))}</span>`;
  return `<div class="plan-row${p.featured ? " featured" : ""}" data-reveal style="--i:${i}">
    <div class="plan-head">
      <div class="plan-name">${esc(p.name)}${p.featured ? `<span class="chip">${esc(t("Most popular"))}</span>` : ""}</div>
      <p class="plan-tagline">${esc(t(p.tagline))}</p>
    </div>
    <div class="plan-credits">${credits}</div>
    <div class="plan-price">
      <span class="amount">${esc(t(p.price))}</span>
      ${p.per ? `<span class="per">${esc(t(p.per))}</span>` : ""}
    </div>
  </div>`;
}

async function render(ctx) {
  const testimonials = await cms.getTestimonials({ draft: ctx.preview }).catch(() => []);
  const cr = [{ label: "Home", href: "/" }, { label: "Pricing" }];
  return (
    pageStart({
      title: "Pricing | Sokosumi",
      description:
        "Sokosumi plans: a free tier with 250 credits per seat, Starter at €25, Standard at €75, Pro at €200 per month, and a tailored Enterprise plan.",
      path: "/pricing",
      breadcrumb: cr,
      jsonld: pricingLd(),
    }) +
    `<div class="page-head" data-reveal>
      <span class="eyebrow">${esc(t("Pricing"))}</span>
      <h1>${esc(t("Plans that scale with the work"))}</h1>
      <p class="sub">${esc(t("Every plan includes credits per seat. Start free, move up when your team runs more work, or talk to us about a tailored plan."))}</p>
    </div>

    <section class="page-section flush" data-reveal>
      <div class="plan-list">${[...PLANS, ENTERPRISE].map(planRow).join("")}</div>
      <p class="plan-note muted" data-reveal>${esc(t("Need tailored seats, credits, or support?"))} <a href="${attr(SALES_URL)}">${esc(t("Talk to sales"))}</a>.</p>
    </section>` +
    shell.quoteSection(shell.pickQuote(testimonials, 0), { heading: t("Teams already on a plan") }) +
    shell.ctaBand({
      heading: t("Get started on the free plan"),
      subheading: t("250 credits per seat, no card, and every agent on the marketplace to try them on."),
      ctaLabel: t("Get started"),
      ctaHref: APP,
      seed: 5,
    }) +
    pageEnd()
  );
}

module.exports = { render };

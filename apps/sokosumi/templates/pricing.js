// /pricing — the subscription plans, exactly as the product's own plan
// picker lists them: a monthly price, credits per seat, and what each tier
// adds over the one below it.
//
// PLANS is the single source of truth for this page. Nothing here is derived
// or inferred: no per-credit rate is published, so none is shown.

const shell = require("./shell");
const cms = require("../lib/cms");
const { esc, attr, icon, pageStart, pageEnd, APP, SALES_URL } = shell;

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
    includesLabel: "Free includes:",
    features: [
      "Limited Access to 1 Agentic Coworker",
      "Email and WhatsApp Access to Agents",
      "Latest Generation of Claude Models",
      "Access to 100+ Marketing Agents",
    ],
    ctaLabel: "Sign Up",
    ctaHref: APP,
  },
  {
    name: "Starter",
    tagline: "For freelancers and micro companies.",
    price: "€25",
    per: "per month",
    credits: "1,500 credits per seat",
    includesLabel: "Everything in Free, plus:",
    features: [
      "Access to our Research Coworker",
      "Ability to buy more Credits on Demand",
      "Read & Create Office Documents",
      "Integrate with Microsoft 365",
    ],
    ctaLabel: "Choose plan",
    ctaHref: APP,
  },
  {
    name: "Standard",
    tagline: "Full set of marketing agents for small companies.",
    price: "€75",
    per: "per month",
    credits: "5,000 credits per seat",
    includesLabel: "Everything in Starter, plus:",
    features: [
      "Access to our Coding Coworker",
      "Over 3x more Credits for Agents",
      "Schedule recurring Coworker tasks",
    ],
    ctaLabel: "Choose plan",
    ctaHref: APP,
    featured: true,
  },
  {
    name: "Pro",
    tagline: "Get more access to our Marketing Agents and Services.",
    price: "€200",
    per: "per month",
    credits: "15,000 credits per seat",
    includesLabel: "Everything in Standard, plus:",
    features: [
      "Massive Amount of Credits for Agents",
      "Custom Templates for Output Files",
      "Early Access to new Agents & Features",
    ],
    ctaLabel: "Choose plan",
    ctaHref: APP,
  },
];

const ENTERPRISE = {
  name: "Enterprise",
  tagline: "Custom plan for organizations with tailored seats, credits, and support.",
  price: "Custom",
  per: "per month",
  includesLabel: "Enterprise includes:",
  features: [
    "Tailored plan for your organization",
    "Custom seat and credit allocation",
    "Support-managed plan changes",
  ],
  ctaLabel: "Contact us",
  ctaHref: SALES_URL,
};

function featureList(p) {
  return `<div class="plan-includes">${esc(p.includesLabel)}</div>
    <ul class="plan-features">${p.features
      .map((f) => `<li>${icon("check", 15)}<span>${esc(f)}</span></li>`)
      .join("")}</ul>`;
}

function planCard(p, i) {
  return `<div class="plan-card${p.featured ? " featured" : ""}" data-reveal style="--i:${i % 4}">
    <div class="plan-head">
      <div class="plan-name">${esc(p.name)}${p.featured ? '<span class="chip">Most popular</span>' : ""}</div>
      <p class="plan-tagline">${esc(p.tagline)}</p>
    </div>
    <div class="plan-price">
      <span class="amount">${esc(p.price)}</span>
      <span class="per">${esc(p.per || "per month")}</span>
    </div>
    ${p.credits ? `<div class="plan-credits">${esc(p.credits)}</div>` : ""}
    ${featureList(p)}
    <a class="btn ${p.ctaLabel === "Contact us" ? "btn-outline" : "btn-primary"} plan-cta" href="${attr(p.ctaHref)}">${esc(p.ctaLabel)}</a>
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
      <span class="eyebrow">Pricing</span>
      <h1>Plans that scale with the work</h1>
      <p class="sub">Every plan includes credits per seat. Start free, move up when your team runs more work, or talk to us about a tailored plan.</p>
    </div>

    <section class="page-section flush" data-reveal>
      <div class="plan-grid">${PLANS.map(planCard).join("")}</div>
      <div class="plan-grid enterprise">${planCard(ENTERPRISE, 0)}</div>
    </section>` +
    shell.quoteSection(shell.pickQuote(testimonials, 0), { heading: "Teams already on a plan" }) +
    shell.ctaBand({
      heading: "Start on the free plan",
      subheading: "250 credits per seat, no card, and every agent on the marketplace to try them on.",
      ctaLabel: "Sign Up",
      ctaHref: APP,
      seed: 5,
    }) +
    pageEnd()
  );
}

module.exports = { render };

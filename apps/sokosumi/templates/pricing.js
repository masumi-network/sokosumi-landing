// /pricing — the subscription plans, exactly as the product's own plan
// picker lists them: a monthly price and the credits a seat gets. The tiers
// differ only by price and credits here, so the page compares those and
// nothing else.
//
// PLANS is the single source of truth for this page. Nothing here is derived
// or inferred: no per-credit rate is published, so none is shown.

const shell = require("./shell");
const cms = require("../lib/cms");
const { t, locale } = require("../lib/i18n");
const { esc, attr, icon, pageStart, pageEnd, APP_SIGNUP, SALES_URL } = shell;

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

// The plans as a row of cards on one tinted board, the way a plan picker
// lays them out: name, price, who the plan is for, what a seat gets, and one
// action — all four read at a glance and their buttons sit on one line. The
// card body carries only what the product itself publishes for a tier: the
// credits a seat gets. There are no per-plan feature lists, so none are shown.
// Free has no "per month", so its unit slot carries the site's no-card line
// instead — the same fine print every signup button on the site sits over.
// Standard is the plan most teams land on and takes the one accent border.
function planCard(p, i) {
  const id = `plan-${p.name.toLowerCase()}`;
  const m = p.credits.match(/^([\d,]+)\s+(.+)$/);
  // same figure, the locale's thousands separator (1,500 → 1.500 on /de)
  const num = locale() === "de" ? m[1].replace(/,/g, ".") : m[1];
  return `<article class="plan-card${p.featured ? " featured" : ""}" data-reveal style="--i:${i}">
    <h2 class="plan-name" id="${id}">${esc(p.name)}${p.featured ? `<span class="chip">${esc(t("Most popular"))}</span>` : ""}</h2>
    <div class="plan-price">
      <span class="amount">${esc(t(p.price))}</span>
      <span class="per">${esc(t(p.per || "No credit card required"))}</span>
    </div>
    <p class="plan-tagline">${esc(t(p.tagline))}</p>
    <ul class="plan-incl">
      <li>${icon("check", 16)}<span><strong>${esc(num)}</strong> ${esc(t(m[2]))}</span></li>
    </ul>
    <a class="btn ${p.featured ? "btn-primary" : "btn-outline"}" href="${attr(APP_SIGNUP)}" aria-describedby="${id}" data-analytics="sign_up_click" data-analytics-location="pricing_plan">${esc(t("Get started"))}</a>
  </article>`;
}

// Enterprise is the fifth plan, not a footnote: it closes the board as an
// ink band — same name, tagline and price anatomy as the cards, a different
// route in. Its credits are tailored like its price, and the tagline already
// says so, so the band carries no credits figure.
function enterpriseBand(p) {
  return `<article class="plan-enterprise" data-reveal style="--i:4">
    <div class="plan-head">
      <h2 class="plan-name">${esc(p.name)}</h2>
      <p class="plan-tagline">${esc(t(p.tagline))}</p>
    </div>
    <div class="plan-price">
      <span class="amount">${esc(t(p.price))}</span>
      ${p.per ? `<span class="per">${esc(t(p.per))}</span>` : ""}
    </div>
    <a class="btn btn-primary" href="${attr(SALES_URL)}" data-analytics="talk_to_sales_click" data-analytics-location="pricing_plan">${esc(t("Talk to sales"))}</a>
  </article>`;
}

// The same client brands the homepage shows under its hero, in the same
// order, on paper instead of ink. Nothing here is new: "In use at" and the
// logos are lifted from index.html so the two surfaces can never disagree
// about who is on the list.
const LOGOS = [
  { src: "/assets/logos/telekom.svg", alt: "Deutsche Telekom", tall: true },
  { src: "/assets/logos/allianz.svg", alt: "Allianz" },
  { src: "/assets/logos/lufthansa.svg", alt: "Lufthansa" },
  { src: "/assets/logos/ard.svg", alt: "ARD" },
  { src: "/assets/logos/tdk.svg", alt: "TDK" },
  { src: "/assets/logos/stroer.svg", alt: "Ströer" },
  { src: "/assets/serviceplan-logo.png", alt: "Serviceplan Group" },
];
function logoRow() {
  const imgs = LOGOS.map(
    (l) => `<img${l.tall ? ' class="logo-tall"' : ""} src="${attr(l.src)}" alt="${attr(l.alt)}" loading="lazy" decoding="async" />`,
  ).join("");
  return `<section class="page-section plan-logos" data-reveal>
      <p class="plan-logos-label">${esc(t("In use at"))}</p>
      <div class="blk-logos">${imgs}</div>
    </section>`;
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

    <section class="page-section flush">
      <div class="plan-board">
        <div class="plan-grid">${PLANS.map(planCard).join("")}</div>
        ${enterpriseBand(ENTERPRISE)}
      </div>
    </section>` +
    logoRow() +
    shell.quoteSection(shell.pickQuote(testimonials, 0), { heading: t("Teams already on a plan") }) +
    shell.ctaBand({
      heading: t("Get started on the free plan"),
      subheading: t("250 credits per seat, no card, and every agent on the marketplace to try them on."),
      ctaLabel: t("Get started"),
      ctaHref: APP_SIGNUP,
      seed: 5,
    }) +
    pageEnd()
  );
}

module.exports = { render };

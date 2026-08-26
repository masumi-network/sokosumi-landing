// /pricing — the subscription plans, exactly as the product's own plan
// picker lists them: a monthly price and the credits a seat gets. The tiers
// differ only by price and credits here, so the page compares those and
// nothing else.
//
// PLANS is the single source of truth for this page. Nothing here is derived
// or inferred: no per-credit rate is published, so none is shown.

const shell = require("./shell");
const cms = require("../lib/cms");
const { t, tp, locale } = require("../lib/i18n");
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
    tagline: "250 credits per seat at no charge.",
    price: "Free",
    credits: "250 credits per seat",
  },
  {
    name: "Starter",
    tagline: "1,500 credits per seat each month.",
    price: "€25",
    per: "per month",
    credits: "1,500 credits per seat",
  },
  {
    name: "Standard",
    tagline: "5,000 credits per seat each month.",
    price: "€75",
    per: "per month",
    credits: "5,000 credits per seat",
    featured: true,
  },
  {
    name: "Pro",
    tagline: "15,000 credits per seat each month.",
    price: "€200",
    per: "per month",
    credits: "15,000 credits per seat",
  },
];

const ENTERPRISE = {
  name: "Enterprise",
  tagline: "Custom seats, credits, and support.",
  price: "Custom",
  per: "per month",
};

// ── team-size calculator ────────────────────────────────────────────────
// Honest arithmetic on the figures the cards already publish: seats × price
// and seats × credits, per plan, monthly. There is no annual billing, no
// volume break, no minimum and no cap in the product, so none appears here —
// the only clamp is a sanity ceiling on the query value so ?seats=1e9 cannot
// render a nonsense page. The count comes from ?seats= so the page is fully
// usable with JavaScript off (the form submits, the presets are plain links);
// /assets/pricing.js takes over in the browser and recomputes in place.
const SEAT_PRESETS = [1, 5, 10, 25, 50];
const SEAT_MAX = 9999;

function seatCount(query) {
  const n = parseInt(query && query.seats, 10);
  return Number.isFinite(n) && n >= 1 ? Math.min(n, SEAT_MAX) : 1;
}

// Same parse planOffer() uses for the structured data, so the calculator
// can never disagree with the markup about what a plan costs.
function priceAmount(p) {
  return p.price === "Free" ? 0 : Number((p.price.match(/[\d.,]+/) || ["0"])[0].replace(/,/g, ""));
}
function creditsAmount(p) {
  return Number((p.credits.match(/^([\d,]+)/) || ["0"])[0].replace(/,/g, ""));
}

// Intl does the separators — 1,500 on /pricing, 1.500 on /de/pricing — and
// the currency placement (€125 vs 125 €) for the same reason. The per-seat
// price on the card goes through the same formatter so a German card does
// not say "€25" above "125 €": same amount, one convention per locale.
const intlLocale = () => (locale() === "de" ? "de-DE" : "en-US");
const fmtInt = (n) => new Intl.NumberFormat(intlLocale()).format(n);
const fmtEur = (n) =>
  new Intl.NumberFormat(intlLocale(), { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

function seatPicker(seats) {
  const presets = SEAT_PRESETS.map(
    (n) =>
      `<a class="fchip${n === seats ? " active" : ""}" href="?seats=${n}" rel="nofollow" data-seats="${n}"${n === seats ? ' aria-current="true"' : ""} aria-label="${attr(tp(n, "{n} seat", "{n} seats"))}">${fmtInt(n)}</a>`,
  ).join("");
  return `<form class="seat-picker" id="seatForm" method="get" data-one="${attr(t("For {n} seat"))}" data-many="${attr(t("For {n} seats"))}" data-free="${attr(t("Free"))}" data-seat="${attr(t("seat"))}" data-seats="${attr(t("seats"))}">
      <label class="seat-label" for="seats" id="seatLabel">${esc(t("Team size"))}</label>
      <span class="seat-field">
        <input class="seat-input" id="seats" name="seats" type="number" inputmode="numeric" min="1" step="1" value="${seats}" autocomplete="off" />
        <span class="seat-unit" data-seat-unit>${esc(tp(seats, "seat", "seats"))}</span>
      </span>
      <span class="seat-presets" role="group" aria-labelledby="seatLabel">${presets}</span>
      <button type="submit" class="btn btn-sm btn-outline seat-submit">${esc(t("Update"))}</button>
      <span class="sr-only" role="status" id="seatStatus"></span>
    </form>`;
}

// The per-card result block. Every figure is data-tagged with its per-seat
// base so the browser script multiplies the same numbers the server did.
function teamBlock(p, seats) {
  const price = priceAmount(p);
  const credits = creditsAmount(p);
  return `<div class="plan-team">
      <span class="plan-team-label" data-team-label>${esc(tp(seats, "For {n} seat", "For {n} seats", { n: fmtInt(seats) }))}</span>
      <span class="plan-team-price"><strong data-team-price data-price="${price}">${esc(price ? fmtEur(price * seats) : t("Free"))}</strong> <span class="plan-team-unit" data-team-per${price ? "" : " hidden"}>${esc(t("per month"))}</span></span>
      <span class="plan-team-credits"><strong data-team-credits data-credits="${credits}">${esc(fmtInt(credits * seats))}</strong> <span class="plan-team-unit" data-team-credits-unit>${esc(t("credits"))}</span></span>
    </div>`;
}

// The plans as a row of cards on one tinted board, the way a plan picker
// lays them out: name, price, who the plan is for, what a seat gets, and one
// action — all four read at a glance and their buttons sit on one line. The
// card body carries only what the product itself publishes for a tier: the
// credits a seat gets — plus the team-size block, which is that figure and
// the price multiplied by the chosen seat count. There are no per-plan
// feature lists, so none are shown.
// Free has no "per month", so its unit slot carries the site's no-card line
// instead — the same fine print every signup button on the site sits over.
// Standard is the plan most teams land on and takes the one accent border.
function planCard(p, i, seats) {
  const id = `plan-${p.name.toLowerCase()}`;
  const m = p.credits.match(/^([\d,]+)\s+(.+)$/);
  // same figure, the locale's thousands separator (1,500 → 1.500 on /de)
  const num = locale() === "de" ? m[1].replace(/,/g, ".") : m[1];
  return `<article class="plan-card${p.featured ? " featured" : ""}" data-reveal style="--i:${i}">
    <h2 class="plan-name" id="${id}">${esc(p.name)}</h2>
    <div class="plan-price">
      <span class="amount">${esc(priceAmount(p) ? fmtEur(priceAmount(p)) : t(p.price))}</span>
      <span class="per">${esc(t(p.per || "No credit card required"))}</span>
    </div>
    <p class="plan-tagline">${esc(t(p.tagline))}</p>
    <ul class="plan-incl">
      <li>${icon("check", 16)}<span><strong>${esc(num)}</strong> ${esc(t(m[2]))}</span></li>
    </ul>
    ${teamBlock(p, seats)}
    <a class="btn ${p.featured ? "btn-primary" : "btn-outline"}" href="${attr(APP_SIGNUP)}" aria-describedby="${id}" data-analytics="sign_up_click" data-analytics-location="pricing_plan" data-analytics-plan="${p.name.toLowerCase()}" data-analytics-seats="${seats}">${esc(t("Get started"))}</a>
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
    <a class="btn btn-primary" href="${attr(SALES_URL)}" data-analytics="talk_to_sales_click" data-analytics-location="pricing_plan" data-analytics-plan="enterprise">${esc(t("Talk to sales"))}</a>
  </article>`;
}

// The CMS global overrides the built-in plans when an editor filled it.
function plansFrom(config) {
  const cp = config && Array.isArray(config.plans) && config.plans.length ? config.plans : null;
  const plans = cp
    ? cp.map((p) => ({
        name: p.name,
        tagline: p.tagline || "",
        price: p.price,
        per: p.per || undefined,
        credits: p.credits || "",
        featured: !!p.featured,
      }))
    : PLANS;
  const ent = config && config.enterprise && config.enterprise.price
    ? { ...ENTERPRISE, ...Object.fromEntries(Object.entries(config.enterprise).filter(([, v]) => v)) }
    : ENTERPRISE;
  return { plans, ent };
}

async function render(ctx) {
  const [testimonials, siteConfig] = await Promise.all([
    cms.getTestimonials({ draft: ctx.preview }).catch(() => []),
    cms.getSiteConfig().catch(() => null),
  ]);
  const { plans: PLANS_ACTIVE, ent: ENTERPRISE_ACTIVE } = plansFrom(siteConfig);
  const cr = [{ label: "Home", href: "/" }, { label: "Pricing" }];
  const seats = seatCount(ctx.query);
  return (
    pageStart({
      title: "Pricing: credits per seat, free plan included | Sokosumi",
      description:
        "Sokosumi plans: a free tier with 250 credits per seat, Starter at €25, Standard at €75, Pro at €200 per month, and a tailored Enterprise plan.",
      path: "/pricing",
      breadcrumb: cr,
      jsonld: pricingLd(),
    }) +
    `<div class="page-head" data-reveal>
      <span class="eyebrow">${esc(t("Pricing"))}</span>
      <h1>${esc(t("Plans and credits"))}</h1>
      <p class="sub">${esc(t("Credits per seat on every plan. Start free; upgrade when you run more work."))}</p>
    </div>

    <section class="page-section flush">
      <div class="plan-board" data-analytics="view_pricing" data-analytics-on="load">
        ${seatPicker(seats)}
        <div class="plan-grid">${PLANS_ACTIVE.map((p, i) => planCard(p, i, seats)).join("")}</div>
        ${enterpriseBand(ENTERPRISE_ACTIVE)}
      </div>
      <script src="/assets/pricing.js" defer></script>
    </section>` +
    shell.logoRow() +
    shell.quoteSection(shell.pickQuote(testimonials, 0), { heading: t("What users say about the work") }) +
    shell.ctaBand({
      heading: t("Get started on the free plan"),
      subheading: t("250 credits per seat. No credit card required."),
      ctaLabel: t("Get started"),
      ctaHref: APP_SIGNUP,
      seed: 5,
    }) +
    pageEnd()
  );
}

module.exports = { render };

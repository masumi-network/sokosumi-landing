const shell = require("./shell");

const { esc, attr, pageStart, pageEnd, SITE } = shell;

// Eight marketing calculators, one template. Each entry is a page at
// /tools/<slug>: the same calculator card, then the definition, the formula,
// a worked example, and the questions people actually search. The math lives
// in assets/calculators.js; the `fields` here and the registry there are
// keyed the same, so a new calculator is one entry in each file.
//
// mode "solve": three fields, fill any two, the empty one is calculated.
// mode "derive": required inputs at the top, outputs below.

const CALCS = [
  {
    slug: "cpm-calculator",
    calc: "cpm",
    name: "CPM Calculator",
    short: "Cost per 1,000 impressions — from spend and impressions, or backwards.",
    title: "CPM Calculator — cost per 1,000 impressions",
    description:
      "Free CPM calculator: enter any two of ad spend, impressions and CPM, and it solves the third. CPM = spend ÷ impressions × 1,000. No sign-up.",
    mode: "solve",
    fields: [
      { key: "cost", label: "Ad spend", unit: "$", placeholder: "500" },
      { key: "impressions", label: "Impressions", unit: "#", placeholder: "125000" },
      { key: "cpm", label: "CPM", unit: "$", placeholder: "4.00" },
    ],
    formula: "CPM = ad spend ÷ impressions × 1,000",
    what: [
      "CPM is what 1,000 ad impressions cost. The M is the Roman numeral for 1,000 — “cost per mille”.",
      "Media buyers use it to compare what platforms charge for reach. It also works the other way: since every ads manager reports spend and impressions, CPM lets you put two campaigns from different platforms next to each other and see which reach was cheaper.",
    ],
    example:
      "You spent $500 and got 125,000 impressions. 500 ÷ 125,000 × 1,000 = <strong>$4.00 CPM</strong>. The same formula backwards: at a $4.00 CPM, a $2,000 budget buys 500,000 impressions.",
    faq: [
      {
        q: "What is a good CPM?",
        a: "Anyone quoting one number is guessing. Display inventory is cheapest, social feeds sit in the middle, narrow B2B audiences cost the most, and Q4 is pricier everywhere. The comparison that holds up is your own history: the same audience on the same platform, month over month.",
      },
      {
        q: "What is the difference between CPM and eCPM?",
        a: "CPM is a price you agree to before buying. eCPM (effective CPM) is calculated afterwards from whatever you actually paid — including clicks or conversions bought on other models — normalized to 1,000 impressions so campaigns can be compared.",
      },
      {
        q: "How do I lower my CPM?",
        a: "Broaden the audience, improve the ad (platforms charge engaging ads less), avoid peak seasons, and test cheaper placements. A lower CPM is not always the goal, though: a precise audience with a high CPM often converts better than cheap reach.",
      },
    ],
  },
  {
    slug: "roas-calculator",
    calc: "roas",
    name: "ROAS Calculator",
    short: "Return on ad spend, plus the break-even ROAS for your margin.",
    title: "ROAS Calculator — return on ad spend, with break-even",
    description:
      "Free ROAS calculator: revenue ÷ ad spend, solved in any direction. Includes a break-even ROAS calculator based on your gross margin. No sign-up.",
    mode: "solve",
    fields: [
      { key: "revenue", label: "Revenue from ads", unit: "$", placeholder: "12000" },
      { key: "spend", label: "Ad spend", unit: "$", placeholder: "3000" },
      { key: "roas", label: "ROAS", unit: "x", placeholder: "4.0" },
    ],
    formula: "ROAS = revenue ÷ ad spend",
    what: [
      "ROAS is revenue divided by ad spend. A ROAS of 4 means every $1 of ads brought back $4 of revenue.",
      "It is the fastest health check for paid campaigns, but it is a revenue number, not a profit number — that is what break-even ROAS below is for.",
    ],
    example:
      "Ads cost $3,000 and drove $12,000 in revenue. 12,000 ÷ 3,000 = <strong>4.0× ROAS</strong> (also written as 400%).",
    extra: `
      <section class="calc-section" aria-labelledby="breakeven-h">
        <h2 id="breakeven-h">Break-even ROAS calculator</h2>
        <p>ROAS ignores your costs. Break-even ROAS is the return at which a campaign stops losing money: <code>100 ÷ gross margin %</code>. At a 40% margin you need a 2.5× ROAS just to break even.</p>
        <form class="calc-form calc-mini" id="calcBreakevenForm" data-calc="breakeven" novalidate>
          <div class="calc-fields">
            <div class="calc-field">
              <label for="calc-margin">Gross margin</label>
              <div class="calc-input"><input id="calc-margin" data-key="margin" inputmode="decimal" placeholder="40" autocomplete="off" /><span>%</span></div>
            </div>
          </div>
          <button class="btn btn-primary calc-go" type="submit">Calculate</button>
          <p class="calc-error" role="alert" hidden></p>
          <div class="calc-result" hidden aria-live="polite"></div>
        </form>
      </section>`,
    faq: [
      {
        q: "What is a good ROAS?",
        a: "Whatever clears your break-even with room to spare, and break-even depends on margin. A 3× ROAS is comfortable for a 70%-margin software product and a loss for a 20%-margin retailer. Work out break-even ROAS (100 ÷ gross margin %) first, then judge campaigns against that.",
      },
      {
        q: "What is the difference between ROAS and ROI?",
        a: "ROAS compares revenue to ad spend only. ROI compares profit to total cost — goods, shipping, tooling, people. A campaign can have a strong ROAS and a negative ROI when margins are thin.",
      },
      {
        q: "Should ROAS include VAT or sales tax?",
        a: "Use net revenue (without tax) — the tax was never yours. Most ads platforms report gross order values, so ROAS in the ads manager often looks better than the ROAS in your books.",
      },
    ],
  },
  {
    slug: "ctr-calculator",
    calc: "ctr",
    name: "CTR Calculator",
    short: "Click-through rate from clicks and impressions.",
    title: "CTR Calculator — click-through rate",
    description:
      "Free CTR calculator: clicks ÷ impressions × 100. Enter any two of clicks, impressions and CTR, and it solves the third. No sign-up.",
    mode: "solve",
    fields: [
      { key: "clicks", label: "Clicks", unit: "#", placeholder: "320" },
      { key: "impressions", label: "Impressions", unit: "#", placeholder: "24000" },
      { key: "ctr", label: "CTR", unit: "%", placeholder: "1.33" },
    ],
    formula: "CTR = clicks ÷ impressions × 100",
    what: [
      "CTR is the share of people who saw something and clicked it. 320 clicks from 24,000 impressions is a 1.33% CTR.",
      "It applies anywhere something is shown and clicked: ads, search results, emails (there it is called click rate), and product listings.",
    ],
    example:
      "An ad was shown 24,000 times and clicked 320 times. 320 ÷ 24,000 × 100 = <strong>1.33% CTR</strong>.",
    faq: [
      {
        q: "What is a good CTR?",
        a: "It depends on where the click happens. Search ads, shown to people already looking, click far better than display banners. Position matters most in organic search — the first result takes a large multiple of the tenth. Compare like with like: the same channel, the same position, your own history.",
      },
      {
        q: "Why is my CTR high but conversions low?",
        a: "The ad promises something the page does not deliver, or it attracts the wrong clickers — curiosity, sweepstakes wording and clickbait raise CTR and lower conversion. Match the ad's promise to the landing page and judge the pair on cost per conversion, not CTR.",
      },
      {
        q: "Does CTR affect what I pay per click?",
        a: "On auction platforms, yes. Google's quality score and Meta's ad ranking both reward ads people click, so a higher CTR usually buys the same position for less money.",
      },
    ],
  },
  {
    slug: "cpc-calculator",
    calc: "cpc",
    name: "CPC Calculator",
    short: "Cost per click from spend and clicks.",
    title: "CPC Calculator — cost per click",
    description:
      "Free CPC calculator: ad spend ÷ clicks. Enter any two of spend, clicks and CPC, and it solves the third — or budgets clicks from a target CPC. No sign-up.",
    mode: "solve",
    fields: [
      { key: "cost", label: "Ad spend", unit: "$", placeholder: "3000" },
      { key: "clicks", label: "Clicks", unit: "#", placeholder: "1200" },
      { key: "cpc", label: "CPC", unit: "$", placeholder: "2.50" },
    ],
    formula: "CPC = ad spend ÷ clicks",
    what: [
      "CPC is what one click cost you: total spend divided by clicks.",
      "The same formula plans budgets. If clicks cost about $2.50 and you need 1,200 visits, that is a $3,000 budget — fill any two fields and the calculator works in whichever direction you need.",
    ],
    example:
      "You spent $3,000 and got 1,200 clicks. 3,000 ÷ 1,200 = <strong>$2.50 CPC</strong>.",
    faq: [
      {
        q: "What is the difference between CPC and PPC?",
        a: "PPC (pay-per-click) is the buying model; CPC is the price. You run PPC campaigns and you pay a CPC.",
      },
      {
        q: "Why is my average CPC different from my bid?",
        a: "On auction platforms you pay just enough to beat the next bidder, not your maximum bid. Average CPC also blends every auction across days, placements and audiences, so it rarely matches any single bid you set.",
      },
      {
        q: "Is a lower CPC always better?",
        a: "No — the cheapest clicks are often the least likely to buy. Judge traffic by cost per conversion (CPA). A $5 click that converts at 10% beats a $1 click that converts at 0.5%.",
      },
    ],
  },
  {
    slug: "cpa-calculator",
    calc: "cpa",
    name: "CPA Calculator",
    short: "Cost per acquisition from spend and conversions.",
    title: "CPA Calculator — cost per acquisition",
    description:
      "Free CPA calculator: ad spend ÷ conversions. Enter any two of spend, conversions and CPA, and it solves the third. No sign-up.",
    mode: "solve",
    fields: [
      { key: "cost", label: "Ad spend", unit: "$", placeholder: "3000" },
      { key: "conversions", label: "Conversions", unit: "#", placeholder: "60" },
      { key: "cpa", label: "CPA", unit: "$", placeholder: "50" },
    ],
    formula: "CPA = ad spend ÷ conversions",
    what: [
      "Divide spend by conversions and you have CPA: the price of one purchase, lead, signup, or whatever else the campaign counts as a conversion.",
      "This is the number that decides whether a campaign scales. As long as a conversion is worth more than it costs, you can keep buying them.",
    ],
    example:
      "You spent $3,000 and got 60 signups. 3,000 ÷ 60 = <strong>$50 CPA</strong>.",
    faq: [
      {
        q: "What is the difference between CPA and CAC?",
        a: "CPA prices one conversion from one campaign, and the conversion can be anything — a lead, a trial, a demo. CAC prices one new paying customer across all sales and marketing spend. A $50 CPA per lead can sit inside a $2,000 CAC.",
      },
      {
        q: "What is a good CPA?",
        a: "Anything comfortably below what the conversion is worth. For e-commerce that is the order margin; for leads it is lead value — deal size × close rate. If a customer is worth $400 in margin, a $50 CPA is excellent and a $500 CPA is a loss.",
      },
      {
        q: "Why do the ads platform and my analytics report different CPAs?",
        a: "Different attribution. The platform claims a conversion when it showed or clicked an ad within its window; analytics usually credits the last click. Both are counting the same orders differently, so pick one source of truth per decision.",
      },
    ],
  },
  {
    slug: "ltv-calculator",
    whatHeading: "What is customer lifetime value?",
    calc: "ltv",
    name: "LTV Calculator",
    short: "Customer lifetime value from order value, frequency and lifespan.",
    title: "LTV Calculator — customer lifetime value",
    description:
      "Free customer lifetime value calculator: average order value × purchases per year × years as a customer, with an optional margin-adjusted LTV. No sign-up.",
    mode: "derive",
    fields: [
      { key: "aov", label: "Average order value", unit: "$", placeholder: "80" },
      { key: "frequency", label: "Purchases per year", unit: "#", placeholder: "4" },
      { key: "years", label: "Years as a customer", unit: "#", placeholder: "3" },
      { key: "margin", label: "Gross margin (optional)", unit: "%", placeholder: "60", optional: true },
    ],
    formula: "LTV = average order value × purchases per year × years",
    what: [
      "Customer lifetime value is the revenue one customer brings over the whole relationship, not one order.",
      "It sets the ceiling on what you can pay to acquire a customer. A shop that only looks at first-order profit will underbid competitors who know the customer comes back for three years.",
    ],
    example:
      "Customers spend $80 per order, buy 4 times a year, and stay 3 years. 80 × 4 × 3 = <strong>$960 LTV</strong>. At a 60% gross margin that is $576 of lifetime profit — the number to hold your CAC against.",
    faq: [
      {
        q: "Should LTV use revenue or profit?",
        a: "Both are used; know which one you are looking at. Revenue LTV is easier to measure. Profit LTV (multiply by gross margin — the optional field above) is the one that can be compared against acquisition cost.",
      },
      {
        q: "How do I know the average customer lifespan?",
        a: "From churn. Lifespan ≈ 1 ÷ annual churn rate: if 25% of customers leave each year, the average customer stays about 4 years. Subscription businesses usually compute LTV this way instead of guessing years.",
      },
      {
        q: "What is a good LTV to CAC ratio?",
        a: "The convention is 3:1 — a customer worth three times what they cost to acquire. Below ~1.5:1 growth burns money; far above 3:1 often means you could grow faster by spending more.",
      },
    ],
  },
  {
    slug: "cac-calculator",
    whatHeading: "What is customer acquisition cost?",
    calc: "cac",
    name: "CAC Calculator",
    short: "Customer acquisition cost, plus your LTV:CAC ratio.",
    title: "CAC Calculator — customer acquisition cost",
    description:
      "Free CAC calculator: sales and marketing spend ÷ new customers, plus the LTV:CAC ratio when you add lifetime value. No sign-up.",
    mode: "derive",
    fields: [
      { key: "spend", label: "Sales & marketing spend", unit: "$", placeholder: "40000" },
      { key: "customers", label: "New customers", unit: "#", placeholder: "80" },
      { key: "ltv", label: "Customer LTV (optional)", unit: "$", placeholder: "1500", optional: true },
    ],
    formula: "CAC = sales & marketing spend ÷ new customers",
    what: [
      "CAC answers a blunt question: what did one paying customer cost to win? Count everything it took — ad spend, tools, agencies, and the salaries of the people doing sales and marketing — and divide by the customers won in the same period.",
      "Add your customer lifetime value and the calculator also returns the LTV:CAC ratio, which is the number investors and finance teams actually ask for.",
    ],
    example:
      "Last quarter cost $40,000 in sales and marketing and closed 80 new customers. 40,000 ÷ 80 = <strong>$500 CAC</strong>. With a $1,500 LTV that is a 3:1 ratio.",
    faq: [
      {
        q: "What counts as spend in CAC?",
        a: "Everything it took to win the customer: media, tools, agencies and freelancers, content production, and the loaded salaries of sales and marketing. Ad-spend-only versions exist (sometimes called paid CAC), but leaving out salaries makes the number flatter you.",
      },
      {
        q: "What is a good CAC?",
        a: "On its own, a CAC figure says nothing; it only means something next to LTV. The common benchmark is an LTV of at least 3× CAC, with payback inside 12 months for subscription businesses.",
      },
      {
        q: "Why did my CAC go up when I scaled spend?",
        a: "Because the cheapest customers get bought first. Larger budgets push into colder audiences and more expensive auctions, so marginal CAC rises even while the campaigns run unchanged. Watch CAC per channel, not just the blended average.",
      },
    ],
  },
  {
    slug: "engagement-rate-calculator",
    whatHeading: "What is engagement rate?",
    calc: "engagement",
    name: "Engagement Rate Calculator",
    short: "Engagement rate by followers, reach or views — for any platform.",
    title: "Engagement Rate Calculator — Instagram, TikTok & more",
    description:
      "Free engagement rate calculator: engagements ÷ followers (or reach, or views) × 100, per post or across a period. Works for Instagram, TikTok, LinkedIn and X. No sign-up.",
    mode: "derive",
    fields: [
      { key: "engagements", label: "Engagements (likes + comments + shares + saves)", unit: "#", placeholder: "1450" },
      {
        key: "basis",
        label: "Divide by",
        select: [
          { value: "followers", label: "Followers" },
          { value: "reach", label: "Reach" },
          { value: "views", label: "Views" },
        ],
      },
      { key: "audience", label: "Followers / reach / views", unit: "#", placeholder: "38000" },
      { key: "posts", label: "Number of posts (optional, followers basis)", unit: "#", placeholder: "12", optional: true },
    ],
    formula: "Engagement rate = engagements ÷ followers × 100",
    what: [
      "Engagement rate is the share of your audience that did something with a post — liked, commented, shared or saved it.",
      "Divide by followers to judge an account, by reach to judge content (it ignores how many followers never saw the post), or by views for video. On the followers basis, add a post count to average a whole period.",
    ],
    example:
      "A post collected 1,450 engagements on an account with 38,000 followers. 1,450 ÷ 38,000 × 100 = <strong>3.8% engagement rate</strong>.",
    extra: `
      <section class="calc-section" aria-labelledby="er-ig-h">
        <h2 id="er-ig-h">Instagram engagement rate</h2>
        <p>On Instagram, count likes, comments, saves and shares. Saves and shares weigh more in the algorithm than likes, so two posts with the same rate can perform very differently. Follower-based rates fall as accounts grow — a big account with a modest rate can still out-engage a small one — so compare accounts of similar size, or switch the calculator to reach.</p>
      </section>
      <section class="calc-section" aria-labelledby="er-tt-h">
        <h2 id="er-tt-h">TikTok engagement rate</h2>
        <p>TikTok distributes by video, not by follower graph, so views-based engagement rate (likes + comments + shares ÷ views) is the measure that means something there. Follower counts say little about how many people actually saw a video.</p>
      </section>`,
    faq: [
      {
        q: "What is a good engagement rate?",
        a: "Whatever number you have heard is probably measured differently than yours. Follower-based rates shrink as accounts grow, and reach-based rates run higher than follower-based ones by construction, so a rate is only comparable to another rate on the same formula, on the same platform, at a similar audience size. Track your own trend first.",
      },
      {
        q: "Do I count shares and saves?",
        a: "Count every interaction the platform reports: likes, comments, shares, saves — and on X, reposts and bookmarks. Just keep the definition constant, because a rate that counts saves cannot be compared with one that does not.",
      },
      {
        q: "Engagement rate by followers or by reach?",
        a: "Followers for judging an account (that is what most influencer tools and rate cards use). Reach for judging content, because it only counts people who actually saw the post. Report which one you used — the two differ a lot.",
      },
    ],
  },
];

const BY_SLUG = new Map(CALCS.map((c) => [c.slug, c]));

function isCalc(slug) {
  return BY_SLUG.has(slug);
}

function fieldHtml(c, f) {
  const id = `calc-${f.key}`;
  if (f.select) {
    return `<div class="calc-field">
      <label for="${id}">${esc(f.label)}</label>
      <div class="calc-input is-select"><select id="${id}" data-key="${attr(f.key)}">${f.select
        .map((o) => `<option value="${attr(o.value)}">${esc(o.label)}</option>`)
        .join("")}</select></div>
    </div>`;
  }
  const unit = f.unit === "#" ? "" : `<span>${esc(f.unit)}</span>`;
  return `<div class="calc-field">
    <label for="${id}">${esc(f.label)}</label>
    <div class="calc-input">${f.unit === "$" ? "<span>$</span>" : ""}<input id="${id}" data-key="${attr(f.key)}" inputmode="decimal" placeholder="${attr(f.placeholder || "")}" autocomplete="off" />${f.unit !== "$" ? unit : ""}</div>
  </div>`;
}

function relatedStrip(current) {
  const links = CALCS.filter((c) => c.slug !== current)
    .map((c) => `<a href="/tools/${attr(c.slug)}">${esc(c.name)}</a>`)
    .join("");
  return `<nav class="calc-related" aria-label="More calculators">
    <h2>More marketing calculators</h2>
    <div class="calc-related-links">${links}<a href="/tools">All free tools</a></div>
  </nav>`;
}

function faqSection(c) {
  return `<section class="dm-faq" id="faq" aria-labelledby="calc-faq-title">
    <h2 id="calc-faq-title">Questions</h2>
    <div class="faq-list">
      ${c.faq
        .map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.q)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.a)}</p></details>`,
        )
        .join("")}
    </div>
  </section>`;
}

function page(ctx) {
  const c = BY_SLUG.get(ctx.params.slug);
  const path = `/tools/${c.slug}`;
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Calculators", href: "/tools/calculators" },
    { label: c.name },
  ];
  const faqJsonLd = {
    "@type": "FAQPage",
    "@id": `${SITE}${path}#faq`,
    mainEntity: c.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  const appJsonLd = {
    "@type": "WebApplication",
    "@id": `${SITE}${path}#software`,
    name: `Sokosumi ${c.name}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${SITE}${path}`,
    description: c.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    creator: { "@id": `${SITE}/#organization` },
  };
  const hint =
    c.mode === "solve"
      ? "Fill any two fields — we calculate the third."
      : "Fill in what you know, then calculate.";

  return (
    pageStart({
      title: `${c.title} | Sokosumi`,
      description: c.description,
      path,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "design-tool-page calc-page",
      stylesheets: ["/assets/design-md.css", "/assets/calculators.css", "/assets/email-gate.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: c.name, sub: c.short },
    }) +
    `<section class="dm-tool" id="calculator">
      <header class="dm-tool-head">
        <div>
          <p class="dm-overline">Tool · Free</p>
          <h1>${esc(c.name)}</h1>
        </div>
      </header>
      <form class="calc-form" id="calcForm" data-calc="${attr(c.calc)}" novalidate>
        <p class="calc-hint">${esc(hint)}</p>
        <div class="calc-fields">${c.fields.map((f) => fieldHtml(c, f)).join("")}</div>
        <div class="calc-actions">
          <button class="btn btn-primary calc-go" type="submit">Calculate</button>
          <button class="btn btn-outline calc-clear" type="button">Clear</button>
        </div>
        <p class="calc-error" role="alert" hidden></p>
        <div class="calc-result" hidden aria-live="polite"></div>
      </form>
      <p class="calc-formula-chip"><code>${esc(c.formula)}</code></p>
    </section>

    <section class="calc-section" aria-labelledby="calc-what-h">
      <h2 id="calc-what-h">${esc(c.whatHeading || `What is ${c.name.replace(" Calculator", "")}?`)}</h2>
      ${c.what.map((p) => `<p>${esc(p)}</p>`).join("")}
      <h3>Worked example</h3>
      <p>${c.example}</p>
    </section>
    ${c.extra || ""}
    ${faqSection(c)}
    ${relatedStrip(c.slug)}` +
    shell.ctaBand({
      heading: "The math is free. So is your first coworker.",
      subheading: "Sokosumi's AI coworkers run the campaigns these numbers come from.",
      ctaLabel: "Start free",
    }) +
    pageEnd({ scripts: ["/assets/calculators.js", "/assets/email-gate.js"], englishOnly: true })
  );
}

function hub() {
  const path = "/tools/calculators";
  return (
    pageStart({
      title: "Marketing calculators — CPM, ROAS, CTR, LTV & more | Sokosumi",
      description:
        "Eight free marketing calculators: CPM, ROAS, CTR, CPC, CPA, LTV, CAC and engagement rate. Each shows the formula and a worked example. No sign-up.",
      path,
      englishOnly: true,
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Free tools", href: "/tools" }, { label: "Calculators" }],
      mainClass: "tools-page",
      stylesheets: ["/assets/design-md.css", "/assets/calculators.css"],
      jsonld: [{ "@type": "CollectionPage", "@id": `${SITE}${path}#page`, name: "Marketing calculators", url: `${SITE}${path}` }],
      og: { type: "page", title: "Marketing calculators", sub: "CPM, ROAS, CTR, CPC, CPA, LTV, CAC, engagement rate." },
    }) +
    `<div class="page-head" data-reveal>
      <span class="eyebrow">Free tools</span>
      <h1>Marketing calculators</h1>
      <p class="sub">The numbers marketers work out every week, each with the formula and a worked example. The ad-metric calculators solve in any direction — enter what you have, get what you need.</p>
    </div>
    <section class="page-section flush" data-reveal aria-label="Calculators">
      <div class="card-grid calc-hub">${CALCS.map(
        (c) => `<a class="card calc-hub-card" href="/tools/${attr(c.slug)}">
          <code>${esc(c.formula)}</code>
          <strong>${esc(c.name)}</strong>
          <span>${esc(c.short)}</span>
        </a>`,
      ).join("")}</div>
    </section>` +
    shell.ctaBand({
      heading: "The math is free. So is your first coworker.",
      subheading: "Sokosumi's AI coworkers run the campaigns these numbers come from.",
      ctaLabel: "Start free",
    }) +
    pageEnd({ englishOnly: true })
  );
}

module.exports = { page, hub, isCalc, CALCS };

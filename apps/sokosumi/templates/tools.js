// /tools — a hub of free, instant marketing micro-tools. A visitor pastes a
// link or some text into a tool and gets a ready-to-run, tool-specific prompt
// they can work with. This first version is prompt-based and fully
// client-side: no API keys, no server calls, nothing to break. Live "Run on a
// Sokosumi agent" execution can be layered on per tool later (see TOOLS[].prompt).
//
// Deliberately NOT linked from the nav or footer yet — reachable only at
// /tools — so it can ship and be reviewed without touching the live site's
// navigation. Add the entry point when the set is ready.
//
// Everything the page needs (styles + the tiny search/prompt script) is inlined
// here so this module is self-contained and does not touch assets/styles.css.

const shell = require("./shell");
const { esc, attr, pageStart, pageEnd, SITE } = shell;

// ── the catalogue ────────────────────────────────────────────────────────────
// Each tool: a stable slug (its URL), a display name, a category, a one-line
// blurb for the card, the input fields the tool needs, and the prompt template
// the "Generate" button fills from those inputs. Prompt placeholders are
// {fieldName}; a field's `name` must match the token used in `prompt`.
const CATEGORIES = [
  { id: "analyze", label: "Analyzers & Scorers" },
  { id: "generate", label: "Generators" },
  { id: "audit", label: "Site & URL Audits" },
  { id: "compete", label: "Competitive Intelligence" },
  { id: "other", label: "Other" },
];

const TOOLS = [
  {
    slug: "expert-agent",
    name: "Tool Expertise Agent",
    cat: "other",
    blurb: "Ask a platform expert (Webflow, Shopify, WordPress…) anything, and get a precise, senior-level answer.",
    fields: [
      { name: "platform", label: "Platform", type: "text", placeholder: "e.g. Webflow" },
      { name: "question", label: "Your question", type: "textarea", placeholder: "What do you want to know or build?" },
    ],
    prompt:
      "You are a world-class expert in {platform} with deep, current knowledge of its features, limits, best practices and common pitfalls. Answer the question below precisely and practically. Give concrete steps, name the exact settings/menus involved, warn about gotchas, and include a short example where it helps.\n\nQuestion:\n{question}",
  },
  {
    slug: "seo-md-generator",
    name: "SEO.md Generator",
    cat: "generate",
    blurb: "Paste a website URL → get an AI-readable SEO specification (an SEO.md) describing what the site is about.",
    fields: [{ name: "url", label: "Website URL", type: "url", placeholder: "https://example.com" }],
    prompt:
      "Act as a technical SEO specialist. For the website {url}, produce an AI-readable SEO specification in Markdown (an \"SEO.md\") that an LLM or search engine can use to understand the site. Include: the entity/brand and a one-line definition, primary audience, core products/services, the main topics and target queries, a suggested title + meta description for the homepage, key pages with their purpose, and recommended structured data types. Output valid Markdown only.",
  },
  {
    slug: "ai-visibility-checker",
    name: "AI Search Visibility Checker",
    cat: "compete",
    blurb: "Enter a brand or site → see where you're mentioned, where competitors win instead, and which queries you're invisible for.",
    fields: [
      { name: "brand", label: "Brand or website", type: "text", placeholder: "Your brand name or URL" },
      { name: "competitors", label: "Known competitors (optional)", type: "text", placeholder: "comma-separated" },
    ],
    prompt:
      "You are an AI-search visibility analyst. For the brand {brand} (competitors: {competitors}), assess how visible it is in AI assistant answers. Report, as clearly separated sections: (1) queries where {brand} is likely mentioned, (2) queries where competitors are likely surfaced instead, (3) high-intent queries {brand} is probably invisible for, and (4) the specific information AI systems appear to be missing about {brand}. Be concrete and list example prompts a user might type.",
  },
  {
    slug: "post-strength-analyzer",
    name: "Social / LinkedIn Post Strength Analyzer",
    cat: "analyze",
    blurb: "Write a post → get scores on engagement potential, hook quality, CTA clarity and timing, with fixes.",
    fields: [{ name: "post", label: "Your post", type: "textarea", placeholder: "Paste your draft post…" }],
    prompt:
      "Act as a senior social media strategist. Score the post below from 0–10 on each of: engagement potential, hook quality, CTA clarity, and timing/relevance. For each score, give a one-line reason and one concrete improvement. Then rewrite the post applying every improvement.\n\nPost:\n{post}",
  },
  {
    slug: "landing-copy-analyzer",
    name: "Landing Page Copy Analyzer",
    cat: "analyze",
    blurb: "Paste landing page copy → scores on clarity, benefit focus, specificity and CTA strength.",
    fields: [{ name: "copy", label: "Landing page copy", type: "textarea", placeholder: "Paste the headline, subhead and body copy…" }],
    prompt:
      "Act as a conversion copywriter. Score the landing page copy below from 0–10 on: clarity, benefit focus (vs. features), specificity (concrete vs. vague), and CTA strength. For each, give the reason and a concrete fix. Then provide a rewritten hero (headline + subhead + primary CTA) that scores higher.\n\nCopy:\n{copy}",
  },
  {
    slug: "headline-ab-tester",
    name: "Headline A/B Tester",
    cat: "analyze",
    blurb: "Enter two headlines → scores on curiosity, clarity and emotional trigger, and picks the winner.",
    fields: [
      { name: "headlineA", label: "Headline A", type: "text", placeholder: "First headline" },
      { name: "headlineB", label: "Headline B", type: "text", placeholder: "Second headline" },
    ],
    prompt:
      "Act as a direct-response copy expert. Compare these two headlines. Score each from 0–10 on curiosity, clarity, and emotional trigger, with a one-line reason per score. Declare a winner and explain why in one sentence. Then propose 3 stronger variants that beat both.\n\nA: {headlineA}\nB: {headlineB}",
  },
  {
    slug: "csv-to-dashboard",
    name: "CSV / Excel to Instant Dashboard",
    cat: "other",
    blurb: "Paste CSV/tabular data → get an instant dashboard spec: the key metrics, charts and layout to build.",
    fields: [{ name: "data", label: "Paste CSV / table data", type: "textarea", placeholder: "column1,column2,column3\n…" }],
    prompt:
      "You are a data analyst. Given the raw tabular data below, design a dashboard. Identify the key metrics/KPIs worth tracking, the best chart type for each, any useful groupings or time series, and a recommended layout (top row, secondary rows). Note data-quality issues you see. Present the plan as a clear, buildable spec.\n\nData:\n{data}",
  },
  {
    slug: "conversion-teardown",
    name: "Landing Page Conversion Teardown",
    cat: "audit",
    blurb: "Enter a landing page URL → a structured teardown of what's hurting conversion and how to fix it.",
    fields: [{ name: "url", label: "Landing page URL", type: "url", placeholder: "https://example.com/landing" }],
    prompt:
      "Act as a CRO (conversion rate optimization) expert. Do a structured teardown of the landing page at {url}. Cover: clarity of the value proposition above the fold, message-match, friction in the CTA, trust/social proof, information hierarchy, and mobile concerns. For each issue give severity (high/med/low) and a specific fix. End with the 3 highest-impact changes to make first.",
  },
  {
    slug: "positioning-teardown",
    name: "Competitor Positioning Teardown",
    cat: "compete",
    blurb: "Enter two site URLs → a comparison that exposes positioning gaps, overlaps and loopholes.",
    fields: [
      { name: "yourUrl", label: "Your website", type: "url", placeholder: "https://you.com" },
      { name: "competitorUrl", label: "Competitor website", type: "url", placeholder: "https://competitor.com" },
    ],
    prompt:
      "Act as a positioning strategist. Compare {yourUrl} against {competitorUrl}. For each: identify the core positioning, target audience, primary value proposition, and proof points. Then produce a gap analysis: where the competitor is stronger, where you are stronger, overlaps that make you look the same, and the openings/loopholes you could own. End with a sharper one-sentence positioning statement for {yourUrl}.",
  },
  {
    slug: "reengagement-builder",
    name: "Re-engagement Campaign Builder",
    cat: "generate",
    blurb: "Paste an old email → get a full re-engagement sequence you can send to win lapsed contacts back.",
    fields: [{ name: "email", label: "Your old / original email", type: "textarea", placeholder: "Paste the original email…" }],
    prompt:
      "Act as a lifecycle email marketer. Based on the original email below, design a 4-email re-engagement sequence for lapsed subscribers. For each email give: goal, send timing, subject line (plus one A/B variant), preview text, and the full body. Vary the angle across the sequence (reminder → value → incentive → last-chance). Keep the brand voice of the original.\n\nOriginal email:\n{email}",
  },
  {
    slug: "case-study-outline",
    name: "Case Study Outline Maker",
    cat: "generate",
    blurb: "Drop in a customer win story → get a ready-to-write case study structure.",
    fields: [{ name: "story", label: "Customer win story", type: "textarea", placeholder: "Who was the customer, what problem, what did they do, what results…" }],
    prompt:
      "Act as a B2B content strategist. Turn the customer win story below into a ready-to-write case study outline. Use the structure: headline + subhead, at-a-glance results box (3 metrics), the customer/context, the challenge, the solution, implementation, results (quantified), a pull-quote, and a CTA. Under each section, add bullet prompts telling the writer exactly what to include. Flag any missing information to ask the customer for.\n\nStory:\n{story}",
  },
  {
    slug: "codepiler",
    name: "CodePiler — Repo → System Prompt",
    cat: "generate",
    blurb: "Point at a GitHub repo → auto-generate a system prompt that matches your codebase's style and conventions.",
    fields: [{ name: "repoUrl", label: "GitHub repo URL", type: "url", placeholder: "https://github.com/org/repo" }],
    prompt:
      "You are a senior engineer onboarding an AI coding assistant to a codebase. Based on the repository at {repoUrl}, write a system prompt that makes an AI write code matching this project's conventions. Cover: languages/frameworks, file & folder structure, naming conventions, formatting/lint rules, testing approach, comment style, and any patterns to always follow or avoid. Output the system prompt itself, ready to paste.",
  },
  {
    slug: "blog-to-social",
    name: "Blog URL → A Week of Social Posts",
    cat: "generate",
    blurb: "Enter a blog post URL → get a full week of platform-ready social posts derived from it.",
    fields: [{ name: "blogUrl", label: "Blog post URL", type: "url", placeholder: "https://example.com/blog/post" }],
    prompt:
      "Act as a social media manager. From the blog post at {blogUrl}, create a week of social content (7 posts). Mix formats: a hook/thread, a key-takeaway carousel outline, a quote graphic caption, a question/poll, a myth-buster, a how-to, and a CTA post. For each: the platform it suits best, the full copy, hashtags where relevant, and a suggested day to post. Keep a consistent voice.",
  },
  {
    slug: "messaging-comparison",
    name: "Competitor Messaging Comparison",
    cat: "compete",
    blurb: "Enter two URLs → a side-by-side comparison of how each brand talks: tone, claims and hooks.",
    fields: [
      { name: "urlA", label: "Website A", type: "url", placeholder: "https://brand-a.com" },
      { name: "urlB", label: "Website B", type: "url", placeholder: "https://brand-b.com" },
    ],
    prompt:
      "Act as a brand messaging analyst. Compare the messaging of {urlA} and {urlB} side by side in a table across: core promise, tone of voice, key claims, proof points, target audience, and primary CTA. Then summarize how they differ, where they sound identical, and one messaging angle each could steal from the other or uniquely own.",
  },
  {
    slug: "x-algorithm-analyzer",
    name: "X Algorithm Analyzer",
    cat: "analyze",
    blurb: "Paste an X/Twitter post → score it against the open-source recommendation signals and see what to improve.",
    fields: [{ name: "post", label: "Your X post", type: "textarea", placeholder: "Paste your post…" }],
    prompt:
      "Act as an expert on X's open-source recommendation algorithm. Analyze the post below against the signals the algorithm is known to weight: reply/quote-worthiness, dwell time, media, external links (and their penalty), reply-guy dynamics, and negative signals (mutes/blocks/‘not interested’). Score the post 0–10 for likely reach, explain the signal-by-signal reasoning, and rewrite it to maximize distribution without becoming clickbait.\n\nPost:\n{post}",
  },
  {
    slug: "linkedin-post-analyzer",
    name: "LinkedIn Post Analyzer",
    cat: "analyze",
    blurb: "Paste a LinkedIn post → score hook, readability, specificity, credibility, CTA and engagement potential.",
    fields: [{ name: "post", label: "Your LinkedIn post", type: "textarea", placeholder: "Paste your post…" }],
    prompt:
      "Act as a LinkedIn growth expert. Score the post below from 0–10 on: hook (first two lines), readability (line breaks, scannability), specificity, credibility, CTA, and overall engagement potential. Give a one-line reason and one fix per criterion. Note whether the first two lines survive the ‘see more’ cut-off. Then rewrite the post to score higher while keeping the author's voice.\n\nPost:\n{post}",
  },
  {
    slug: "feature-gap",
    name: "Competitor Feature Gap",
    cat: "compete",
    blurb: "Add your site + competitor URLs → a normalized feature matrix that surfaces the gaps.",
    fields: [
      { name: "yourUrl", label: "Your website", type: "url", placeholder: "https://you.com" },
      { name: "competitorUrls", label: "Competitor URLs", type: "textarea", placeholder: "One URL per line" },
    ],
    prompt:
      "Act as a product marketing analyst. Build a normalized feature matrix comparing {yourUrl} against these competitors:\n{competitorUrls}\n\nList features as rows and companies as columns, marking present/partial/absent. Then identify: features every competitor has that {yourUrl} lacks (gaps to close), features unique to {yourUrl} (advantages to promote), and table-stakes vs. differentiators. Finish with the top 3 gaps to prioritize.",
  },
  {
    slug: "og-image-checker",
    name: "OG Image Checker",
    cat: "audit",
    blurb: "Paste multiple URLs → check whether social preview image, title and description are set up correctly.",
    fields: [{ name: "urls", label: "URLs to check", type: "textarea", placeholder: "One URL per line" }],
    prompt:
      "Act as a technical SEO/social-sharing auditor. For each URL below, evaluate the Open Graph & Twitter Card setup: is there an og:image (and is it ~1200×630), og:title, og:description, twitter:card, and canonical? Flag missing or misconfigured tags, image size/aspect issues, and title/description length problems. Present results as a per-URL checklist with a pass/fix verdict and the exact tag to add.\n\nURLs:\n{urls}",
  },
  {
    slug: "image-seo-checker",
    name: "Image SEO Checker",
    cat: "audit",
    blurb: "Paste image URLs or a site → check alt text, dimensions, filename, compression, format and lazy loading.",
    fields: [{ name: "images", label: "Image URLs (or a site URL)", type: "textarea", placeholder: "One image URL per line, or a single site URL to crawl" }],
    prompt:
      "Act as an image-SEO auditor. For each image (or the images found on the site) below, check: descriptive alt text, appropriate dimensions, an SEO-friendly filename, compression/file size, modern format (WebP/AVIF), and lazy loading. Present a per-image table with pass/fix for each factor, then list the highest-impact fixes and an estimated performance win.\n\nImages / site:\n{images}",
  },
];

function toolBySlug(slug) {
  return TOOLS.find((t) => t.slug === slug) || null;
}

function catLabel(id) {
  const c = CATEGORIES.find((x) => x.id === id);
  return c ? c.label : id;
}

// ── shared styles (scoped, inlined so we don't touch global styles.css) ──────
const STYLE = `<style>
  .tools-head{max-width:52rem}
  .tools-controls{display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;margin:1.5rem 0 1rem}
  .tools-search{flex:1;min-width:220px;padding:.7rem .9rem;border:1px solid var(--hair,#e5e5e5);border-radius:.6rem;font:inherit;background:var(--paper,#fff)}
  .tools-chips{display:flex;flex-wrap:wrap;gap:.5rem;margin:.25rem 0 1.5rem}
  .tools-chip{padding:.4rem .8rem;border:1px solid var(--hair,#e5e5e5);border-radius:999px;background:transparent;font:inherit;font-size:.85rem;cursor:pointer;color:inherit}
  .tools-chip[aria-pressed="true"]{background:#111;color:#fff;border-color:#111}
  .tools-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;margin:1rem 0 3rem}
  .tool-card{display:flex;flex-direction:column;gap:.5rem;padding:1.1rem 1.2rem;border:1px solid var(--hair,#e5e5e5);border-radius:.8rem;text-decoration:none;color:inherit;background:var(--paper,#fff);transition:border-color .15s,transform .15s,box-shadow .15s}
  .tool-card:hover{border-color:#111;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.06)}
  .tool-card .cat{font-size:.72rem;letter-spacing:.04em;text-transform:uppercase;opacity:.6}
  .tool-card h3{margin:0;font-size:1.05rem;font-weight:600}
  .tool-card p{margin:0;font-size:.9rem;line-height:1.45;opacity:.8}
  .tools-empty{opacity:.6;margin:2rem 0}
  .tool-detail{max-width:44rem}
  .tool-field{display:flex;flex-direction:column;gap:.35rem;margin:1rem 0}
  .tool-field label{font-size:.85rem;font-weight:600}
  .tool-field input,.tool-field textarea{padding:.7rem .9rem;border:1px solid var(--hair,#e5e5e5);border-radius:.6rem;font:inherit;background:var(--paper,#fff);width:100%;box-sizing:border-box}
  .tool-field textarea{min-height:120px;resize:vertical}
  .tool-actions{display:flex;gap:.75rem;flex-wrap:wrap;margin:1.25rem 0}
  .tool-btn{padding:.7rem 1.2rem;border-radius:.6rem;border:1px solid #111;background:#111;color:#fff;font:inherit;font-weight:600;cursor:pointer}
  .tool-btn.secondary{background:transparent;color:inherit}
  .tool-out{margin-top:1rem}
  .tool-out textarea{width:100%;box-sizing:border-box;min-height:200px;padding:.9rem;border:1px solid var(--hair,#e5e5e5);border-radius:.6rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.85rem;line-height:1.5;background:#fafafa}
  .tool-note{font-size:.85rem;opacity:.7;margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--hair,#e5e5e5)}
  .tool-back{display:inline-block;margin-bottom:1rem;font-size:.9rem}
</style>`;

// ── hub: /tools ──────────────────────────────────────────────────────────────
async function index() {
  const chips =
    `<button type="button" class="tools-chip" data-cat="all" aria-pressed="true">All</button>` +
    CATEGORIES.map(
      (c) => `<button type="button" class="tools-chip" data-cat="${attr(c.id)}" aria-pressed="false">${esc(c.label)}</button>`,
    ).join("");

  const cards = TOOLS.map((tool) => {
    const hay = `${tool.name} ${tool.blurb} ${catLabel(tool.cat)}`.toLowerCase();
    return `<a class="tool-card" href="/tools/${attr(tool.slug)}" data-cat="${attr(tool.cat)}" data-search="${attr(hay)}">
      <span class="cat">${esc(catLabel(tool.cat))}</span>
      <h3>${esc(tool.name)}</h3>
      <p>${esc(tool.blurb)}</p>
    </a>`;
  }).join("\n");

  const script = `<script>(function(){
    var search=document.getElementById('toolSearch');
    var chips=document.querySelectorAll('.tools-chip');
    var cards=Array.prototype.slice.call(document.querySelectorAll('.tool-card'));
    var empty=document.getElementById('toolsEmpty');
    var activeCat='all';
    function apply(){
      var q=(search.value||'').trim().toLowerCase();
      var shown=0;
      cards.forEach(function(c){
        var okCat=activeCat==='all'||c.getAttribute('data-cat')===activeCat;
        var okQ=!q||c.getAttribute('data-search').indexOf(q)>-1;
        var show=okCat&&okQ;
        c.style.display=show?'':'none';
        if(show)shown++;
      });
      empty.style.display=shown?'none':'';
    }
    search.addEventListener('input',apply);
    chips.forEach(function(ch){ch.addEventListener('click',function(){
      chips.forEach(function(x){x.setAttribute('aria-pressed','false');});
      ch.setAttribute('aria-pressed','true');
      activeCat=ch.getAttribute('data-cat');
      apply();
    });});
  })();</script>`;

  return (
    pageStart({
      title: "Marketing Tools",
      description: "Free, instant marketing tools from Sokosumi. Paste a link or some text and get a ready-to-run result.",
      path: "/tools",
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Tools" }],
    }) +
    STYLE +
    `<article class="tool-hub">
      <div class="page-head tools-head" data-reveal>
        <span class="eyebrow">Tools</span>
        <h1>Marketing Tools</h1>
        <p class="sub">Free, instant tools for marketers. Pick one, paste a link or some text, and get a result you can use right away.</p>
      </div>
      <div class="tools-controls">
        <input id="toolSearch" class="tools-search" type="search" placeholder="Search tools…" autocomplete="off" aria-label="Search tools">
      </div>
      <div class="tools-chips">${chips}</div>
      <div class="tools-grid">${cards}</div>
      <p id="toolsEmpty" class="tools-empty" style="display:none">No tools match your search.</p>
    </article>` +
    script +
    pageEnd()
  );
}

// ── detail: /tools/:slug ─────────────────────────────────────────────────────
async function detail(ctx) {
  const tool = toolBySlug(ctx.params.slug);
  if (!tool) return null; // → 404 via the router

  const fields = tool.fields
    .map((f) => {
      const control =
        f.type === "textarea"
          ? `<textarea id="f_${attr(f.name)}" data-field="${attr(f.name)}" placeholder="${attr(f.placeholder || "")}"></textarea>`
          : `<input id="f_${attr(f.name)}" data-field="${attr(f.name)}" type="${attr(f.type === "url" ? "url" : "text")}" placeholder="${attr(f.placeholder || "")}">`;
      return `<div class="tool-field"><label for="f_${attr(f.name)}">${esc(f.label)}</label>${control}</div>`;
    })
    .join("");

  // The prompt template is handed to the client as-is; the script fills the
  // {token} placeholders from the fields above. JSON.stringify keeps newlines
  // and quotes safe inside the inline script.
  const tplJson = JSON.stringify(tool.prompt);

  const script = `<script>(function(){
    var tpl=${tplJson};
    var out=document.getElementById('toolOut');
    function build(){
      var text=tpl.replace(/\\{(\\w+)\\}/g,function(m,key){
        var el=document.querySelector('[data-field="'+key+'"]');
        var v=el?(el.value||'').trim():'';
        return v||('['+key+']');
      });
      out.value=text;
    }
    document.getElementById('toolGen').addEventListener('click',build);
    document.getElementById('toolCopy').addEventListener('click',function(){
      if(!out.value)build();
      out.select();
      navigator.clipboard&&navigator.clipboard.writeText(out.value);
      var b=this,old=b.textContent;b.textContent='Copied!';setTimeout(function(){b.textContent=old;},1200);
    });
    build();
  })();</script>`;

  return (
    pageStart({
      title: `${tool.name} — Marketing Tools`,
      description: tool.blurb,
      path: `/tools/${tool.slug}`,
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }, { label: tool.name }],
    }) +
    STYLE +
    `<article class="tool-detail">
      <a class="tool-back" href="/tools">← All tools</a>
      <div class="page-head" data-reveal>
        <span class="eyebrow">${esc(catLabel(tool.cat))}</span>
        <h1>${esc(tool.name)}</h1>
        <p class="sub">${esc(tool.blurb)}</p>
      </div>
      <section class="tool-form">
        ${fields}
        <div class="tool-actions">
          <button type="button" id="toolGen" class="tool-btn">Generate prompt</button>
          <button type="button" id="toolCopy" class="tool-btn secondary">Copy</button>
        </div>
        <div class="tool-out">
          <label for="toolOut" class="tool-field" style="font-weight:600;font-size:.85rem;display:block;margin-bottom:.35rem">Your prompt</label>
          <textarea id="toolOut" spellcheck="false"></textarea>
        </div>
        <p class="tool-note">Fill in the fields, hit <strong>Generate prompt</strong>, then copy it into your AI assistant to get your result. Live one-click execution on a Sokosumi agent can be added here next.</p>
      </section>
    </article>` +
    script +
    pageEnd()
  );
}

module.exports = { index, detail, TOOLS, CATEGORIES };

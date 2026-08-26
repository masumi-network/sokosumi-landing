const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const TOOLS = [
  {
    href: "/tools/design-md",
    name: "DESIGN.md generator",
    text: "Turn any website into design context for AI coding agents.",
    preview: ["DESIGN.md", "---", "colors: #2b5c78 · #0f0e0d", "type: Inter · 400 · 1.5", "components: buttons · cards", "---", "## Brand style"],
  },
];

function render() {
  const path = "/tools";
  return (
    pageStart({
      title: "Free tools | Sokosumi",
      description: "Free, no-sign-up tools from Sokosumi for marketing and design work, starting with the DESIGN.md generator.",
      path,
      englishOnly: true,
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Free tools" }],
      mainClass: "tools-page",
      stylesheets: ["/assets/design-md.css"],
      jsonld: [{ "@type": "CollectionPage", "@id": `${SITE}${path}#page`, name: "Free tools", url: `${SITE}${path}` }],
      og: { type: "page", title: "Free tools", sub: "No account. No sign-up." },
    }) +
    `<section class="tools-hero">
      <h1>Free tools.</h1>
      <p>No account. No sign-up.</p>
    </section>
    <section class="tools-list" aria-label="Tools">
      ${TOOLS.map(
        (t) => `<a class="tool-card" href="${t.href}">
          <span class="tool-card-doc" aria-hidden="true">${t.preview.map((l) => `<span>${esc(l)}</span>`).join("")}</span>
          <span class="tool-card-copy">
            <strong>${esc(t.name)}</strong>
            <span>${esc(t.text)}</span>
            <em>Open <span aria-hidden="true">→</span></em>
          </span>
        </a>`,
      ).join("")}
    </section>` +
    pageEnd({ englishOnly: true })
  );
}

module.exports = { render };

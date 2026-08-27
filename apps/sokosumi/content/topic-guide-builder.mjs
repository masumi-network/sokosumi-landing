// Topic guides: the research-led counterpart to the "How to use <tool>" pages.
// A tool guide answers "how do I drive this product"; a topic guide answers
// "what is actually true about this job, and what should my team do about it".
// Same CMS collection, same markdown-in, different section order — evidence
// first, then the work, then how you would know it worked.

const headings = {
  en: {
    state: "What is actually established",
    work: "How to run it",
    measure: "How to measure it",
    risks: "Where teams get this wrong",
    sources: "Sources",
    related: "Read next",
  },
  de: {
    state: "Was gesichert ist",
    work: "So läuft die Arbeit",
    measure: "Wie sich das messen lässt",
    risks: "Wo Teams hier falsch abbiegen",
    sources: "Quellen",
    related: "Weiterlesen",
  },
};

const paragraphs = (items) => (items || []).join("\n\n");
const bullets = (items) => (items || []).map((item) => `- ${item}`).join("\n");
const steps = (items) => (items || []).map((item, index) => `${index + 1}. ${item}`).join("\n");
const links = (items) => (items || []).map(([label, url]) => `- [${label}](${url})`).join("\n");

export function topic(locale, content) {
  const h = headings[locale];
  return [
    paragraphs(content.intro),
    `## ${h.state}`,
    paragraphs(content.stateIntro || []),
    bullets(content.state),
    `## ${h.work}`,
    paragraphs(content.workIntro || []),
    steps(content.work),
    `## ${h.measure}`,
    paragraphs(content.measureIntro || []),
    bullets(content.measure),
    `## ${h.risks}`,
    bullets(content.risks),
    `## ${h.sources}`,
    links(content.sources),
    // Sibling topic guides. These four are the most-sourced pages on the site
    // and each received exactly one internal link (from /guides) before this,
    // so the pages that most deserve the equity were getting the least.
    content.related && content.related.length ? `## ${h.related}` : "",
    links(content.related),
  ]
    .filter((block) => block && block.trim())
    .join("\n\n");
}

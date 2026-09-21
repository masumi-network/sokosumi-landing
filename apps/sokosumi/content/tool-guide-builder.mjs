const headings = {
  en: {
    fit: "What this tool is good at",
    setup: "Set up the work before you prompt",
    workflow: "A practical workflow",
    prompt: "Prompt to adapt",
    checks: "Check the result before you use it",
    limits: "Limits and guardrails",
    sources: "Official sources",
  },
  de: {
    fit: "Wofür sich das Tool eignet",
    setup: "Die Arbeit vor dem Prompt vorbereiten",
    workflow: "Ein praxistauglicher Ablauf",
    prompt: "Prompt zum Anpassen",
    checks: "Das Ergebnis vor der Nutzung prüfen",
    limits: "Grenzen und Leitplanken",
    sources: "Offizielle Quellen",
  },
};

const paragraphs = (items) => items.join("\n\n");
const bullets = (items) => items.map((item) => `- ${item}`).join("\n");
const steps = (items) => items.map((item, index) => `${index + 1}. ${item}`).join("\n");
const quote = (items) => items.map((item) => `> ${item}`).join("\n");
const links = (items) => items.map(([label, url]) => `- [${label}](${url})`).join("\n");

export function article(locale, content) {
  const h = headings[locale];
  return [
    paragraphs(content.intro),
    `## ${h.fit}`,
    paragraphs(content.fitIntro || []),
    bullets(content.fit),
    `## ${h.setup}`,
    steps(content.setup),
    `## ${h.workflow}`,
    steps(content.workflow),
    `## ${h.prompt}`,
    quote(content.prompt),
    `## ${h.checks}`,
    bullets(content.checks),
    `## ${h.limits}`,
    paragraphs(content.limitIntro || []),
    bullets(content.limits),
    `## ${h.sources}`,
    links(content.sources),
  ].filter(Boolean).join("\n\n");
}

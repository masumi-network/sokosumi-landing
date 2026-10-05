export type GuideBlock = { kind: "heading" | "paragraph" | "list" | "code"; text: string };

// Supports only the headings, paragraphs, lists and fences used by the local guide.
export function parseGuide(markdown: string): GuideBlock[] {
  const blocks: GuideBlock[] = [];
  const lines = markdown.split("\n");
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index++; continue; }
    if (line.startsWith("```")) {
      index++;
      const code: string[] = [];
      while (index < lines.length && !lines[index].startsWith("```")) code.push(lines[index++]);
      blocks.push({ kind: "code", text: code.join("\n") });
      index++;
    } else if (line.startsWith("# ")) {
      index++;
    } else if (line.startsWith("## ")) {
      blocks.push({ kind: "heading", text: line.slice(3) }); index++;
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].startsWith("- ")) items.push(lines[index++].slice(2));
      blocks.push({ kind: "list", text: items.join("\n") });
    } else {
      const paragraph: string[] = [];
      while (index < lines.length && lines[index].trim() && !/^(#|```|- )/.test(lines[index])) paragraph.push(lines[index++]);
      // Keep unsupported Markdown literal rather than interpreting HTML.
      if (!paragraph.length) paragraph.push(lines[index++]);
      blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
    }
  }
  return blocks;
}

export function buildSkill(markdown: string) {
  return `---
name: token2049-paid-agent
description: Set up a small Sokosumi agent for the TOKEN2049 Origins Hackathon 2026 and verify its seller payment on Cardano Preprod.
---

${markdown}`;
}

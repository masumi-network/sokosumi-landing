import yaml from "js-yaml";

export type Typography = {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: number | string;
  lineHeight?: string | number;
  letterSpacing?: string;
  fontFeature?: string;
  fontVariation?: string;
};

export type ComponentTokens = {
  backgroundColor?: string;
  textColor?: string;
  typography?: string;
  rounded?: string;
  padding?: string;
  size?: string;
  height?: string;
  width?: string;
};

export type Layout = {
  containerMaxWidth?: string;
  gridColumns?: number;
};

export type Logo = {
  src: string;
  srcDark?: string;
  alt?: string;
};

export type Frontmatter = {
  version?: string;
  name?: string;
  description?: string;
  logo?: Logo;
  colors?: Record<string, string>;
  typography?: Record<string, Typography>;
  rounded?: Record<string, string>;
  spacing?: Record<string, string | number>;
  elevation?: Record<string, string>;
  layout?: Layout;
  components?: Record<string, ComponentTokens>;
};

export type Section = {
  heading: string;
  body: string;
};

export type DesignSystem = {
  frontmatter: Frontmatter;
  sections: Section[];
  raw: string;
};

const FRONTMATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

export function parseDesignMd(input: string): DesignSystem {
  const match = input.match(FRONTMATTER_RE);
  let frontmatter: Frontmatter = {};
  let body = input;

  if (match) {
    try {
      const parsed = yaml.load(match[1]);
      if (parsed && typeof parsed === "object") {
        frontmatter = parsed as Frontmatter;
      }
    } catch {
      frontmatter = {};
    }
    body = input.slice(match[0].length);
  }

  const sections = splitSections(body);
  return { frontmatter, sections, raw: input };
}

function splitSections(body: string): Section[] {
  const lines = body.split("\n");
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+?)\s*$/);
    if (headingMatch) {
      if (current) sections.push(current);
      current = { heading: headingMatch[1].trim(), body: "" };
    } else if (current) {
      current.body += (current.body ? "\n" : "") + line;
    }
  }
  if (current) sections.push(current);
  return sections.map((s) => ({ ...s, body: s.body.trim() }));
}

const REF_RE = /^\{([^}]+)\}$/;

export function resolveToken(
  ref: string | undefined,
  fm: Frontmatter,
): string | undefined {
  if (!ref) return undefined;
  const match = ref.match(REF_RE);
  if (!match) return ref;
  const path = match[1].split(".");
  let cur: unknown = fm;
  for (const segment of path) {
    if (cur && typeof cur === "object" && segment in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
}

export function serializeDesignMd(system: DesignSystem): string {
  const fmText = yaml
    .dump(stripUndefined(system.frontmatter), { lineWidth: 120, noRefs: true })
    .trimEnd();
  const sectionsText = system.sections
    .map((s) => `## ${s.heading}\n\n${s.body}`.trim())
    .join("\n\n");
  return `---\n${fmText}\n---\n\n${sectionsText}\n`;
}

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(stripUndefined) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined && v !== null && v !== "") {
        out[k] = stripUndefined(v);
      }
    }
    return out as T;
  }
  return value;
}

export function contrastRatio(fg: string, bg: string): number | null {
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  if (a === null || b === null) return null;
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Number(ratio.toFixed(4));
}

function relativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").trim();
  if (m.length === 3) {
    return [
      parseInt(m[0] + m[0], 16),
      parseInt(m[1] + m[1], 16),
      parseInt(m[2] + m[2], 16),
    ];
  }
  if (m.length === 6) {
    return [
      parseInt(m.slice(0, 2), 16),
      parseInt(m.slice(2, 4), 16),
      parseInt(m.slice(4, 6), 16),
    ];
  }
  return null;
}

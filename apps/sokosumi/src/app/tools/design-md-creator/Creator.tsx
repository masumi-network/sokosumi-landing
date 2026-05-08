"use client";

import { useCallback, useEffect, useState } from "react";
import yaml from "js-yaml";
import {
  parseDesignMd,
  serializeDesignMd,
  type DesignSystem,
} from "./lib/design-md";
import Renderer from "./Renderer";
import Editor from "./Editor";

type View = "select" | "loading" | "render";
type Source = "upload" | "url" | "example" | null;

export type ExtractMeta = {
  source: "llm" | "heuristic" | "upload" | "example";
  model?: string;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
};

const EXAMPLE = `---
version: alpha
name: Heritage
description: A digital publication for design and culture, where editorial gravitas meets architectural minimalism.
colors:
  primary: "#B8422E"
  secondary: "#1A1C1E"
  tertiary: "#6C7278"
  neutral: "#5b5b5b"
  surface: "#F7F5F2"
typography:
  display:
    fontFamily: Fraunces
    fontSize: 4.5rem
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: "-0.04em"
  h1:
    fontFamily: Fraunces
    fontSize: 3rem
    fontWeight: 600
    lineHeight: 1.1
  h2:
    fontFamily: Fraunces
    fontSize: 2rem
    fontWeight: 500
    lineHeight: 1.2
  h3:
    fontFamily: Public Sans
    fontSize: 1.25rem
    fontWeight: 500
    lineHeight: 1.3
  body-lg:
    fontFamily: Public Sans
    fontSize: 1.125rem
    lineHeight: 1.6
  body-md:
    fontFamily: Public Sans
    fontSize: 1rem
    lineHeight: 1.6
  caption:
    fontFamily: Public Sans
    fontSize: 0.75rem
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  sm: 2px
  md: 4px
  lg: 8px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
elevation:
  sm: "0 1px 2px rgba(26,28,30,0.05)"
  md: "0 4px 12px rgba(26,28,30,0.08)"
  lg: "0 16px 40px rgba(26,28,30,0.12)"
layout:
  containerMaxWidth: "1200px"
  gridColumns: 12
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
---

## Overview

Heritage is a digital publication for design and culture. The brand evokes the matte finish of a premium broadsheet — restrained, considered, and built to be read slowly. Visual identity rests on architectural neutrals offset by a single, defiant accent: Boston Clay.

Heritage writes the way an editor speaks at a quiet kitchen table. Precise, never breathless. We use complete sentences, plain words, and active verbs. Our headlines state, they don't shout. *Example: "The new Hermès store on Rue de Sèvres is small, well-lit, and smells faintly of old leather. We went on a Tuesday."*

## Colors

The palette is rooted in high-contrast neutrals and a single, evocative accent. Boston Clay is the only interactive color — every link, button, and selected state. Deep ink (secondary) is for headlines and core text. Slate (tertiary) is metadata, captions, and structural lines. Limestone (surface) is the foundation; never use pure white. Reserve clay for moments that genuinely earn the eye.

## Typography

Two faces, distinct roles. Fraunces — a literary serif with optical sizes — handles all display, h1, and h2; it carries the editorial gravitas. Public Sans, a humanist sans, handles h3 and all body copy at relaxed line-heights for long-form readability. Caption uses Public Sans uppercase with generous tracking, evoking metadata bands in a print magazine.

## Layout

The Heritage page rhythm is generous. Single column at body widths, with a 1200px outer container that breathes. White space is content. Section spacing follows a doubling cadence (xs 4, sm 8, md 16, lg 32, xl 64) so vertical rhythm feels considered, not arbitrary.

## Elevation & Depth

Depth is conveyed through **tonal layers** rather than heavy shadows. Limestone is the foundation, white cards rise above it, and elevation is reserved for genuinely interactive surfaces — modals, dropdowns, and hovered cards. Default state is flat.

## Shapes

Architectural sharpness. All interactive elements use a 2px corner radius — just enough softness to feel finished while preserving rigor. md/lg radii apply only to large compositional blocks like images and cards. We never use pill shapes (no \`full\`); they read as consumer software, which we are not.

## Components

Buttons follow a strict three-tier hierarchy: primary (Clay) for the single most important action per screen, secondary (Limestone) for supporting actions, and ghost for tertiary navigation. Inputs sit on Limestone with a 1px slate border that darkens on focus. Cards are flat by default, gaining elevation only on hover.

## Do's and Don'ts

**Do**
- Pair Fraunces display with Public Sans body — never two display faces.
- Set body copy at body-lg for editorial reading; body-md is for utility.
- Use Boston Clay sparingly, on interactive elements only.
- Keep elevation subtle; we are a publication, not a dashboard.

**Don't**
- Don't tint surfaces with primary — keep clay for interaction, never decoration.
- Don't pile rounded corners; sharp 2px is our visual signature.
- Don't use pure white backgrounds; Limestone is the foundation.
- Don't combine elevation md + lg in the same composition.
`;

export default function Creator() {
  const [view, setView] = useState<View>("select");
  const [source, setSource] = useState<Source>(null);
  const [system, setSystem] = useState<DesignSystem | null>(null);
  const [extractMeta, setExtractMeta] = useState<ExtractMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startWith = useCallback(
    (md: string, src: Source, meta?: ExtractMeta) => {
      try {
        const parsed = parseDesignMd(md);
        setSystem(parsed);
        setSource(src);
        setExtractMeta(meta ?? { source: srcToMetaSource(src) });
        setError(null);
        setView("render");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to parse");
        setView("select");
      }
    },
    [],
  );

  const reset = () => {
    setSystem(null);
    setSource(null);
    setExtractMeta(null);
    setError(null);
    setView("select");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("example") === "1") startWith(EXAMPLE, "example");
  }, [startWith]);

  if (view === "select") {
    return (
      <ModeSelect
        onUpload={startWith}
        onUrl={startWith}
        onExample={() => startWith(EXAMPLE, "example")}
        setLoading={() => setView("loading")}
        setError={setError}
        error={error}
      />
    );
  }

  if (view === "loading") {
    return <Loading />;
  }

  if (view === "render" && system) {
    return (
      <RenderView
        system={system}
        onChange={setSystem}
        onReset={reset}
        source={source}
        extractMeta={extractMeta}
      />
    );
  }

  return null;
}

function srcToMetaSource(src: Source): ExtractMeta["source"] {
  if (src === "upload") return "upload";
  if (src === "example") return "example";
  return "heuristic";
}

function ModeSelect({
  onUpload,
  onUrl,
  onExample,
  setLoading,
  setError,
  error,
}: {
  onUpload: (md: string, src: Source, meta?: ExtractMeta) => void;
  onUrl: (md: string, src: Source, meta?: ExtractMeta) => void;
  onExample: () => void;
  setLoading: () => void;
  setError: (msg: string | null) => void;
  error: string | null;
}) {
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      onUpload(text, "upload");
    };
    reader.readAsText(file);
  };

  const handleUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setSubmitting(true);
    setError(null);
    setLoading();
    try {
      const res = await fetch("/tools/design-md-creator/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to extract");
      const md = composeFromExtract(data);
      const meta: ExtractMeta = {
        source: data?.source ?? "heuristic",
        model: data?.meta?.model,
        latencyMs: data?.meta?.latencyMs,
        inputTokens: data?.meta?.inputTokens,
        outputTokens: data?.meta?.outputTokens,
      };
      onUrl(md, "url", meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to extract");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardLabel>1. Generate from URL</CardLabel>
        <h3 className="text-[24px] font-normal tracking-[-0.3px] text-black mb-3">
          Have a website?
        </h3>
        <p className="text-[15px] text-[#5b5b5b] leading-[1.5] mb-6">
          Paste any URL. We&apos;ll extract the colors, fonts, and shapes that define
          its visual identity.
        </p>
        <form onSubmit={handleUrl} className="flex flex-col gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://stripe.com"
            className="w-full text-[15px] px-4 py-3 border border-black/[0.08] rounded-full bg-white focus:outline-none focus:border-black/30"
          />
          <button
            type="submit"
            disabled={submitting || !url.trim()}
            className="inline-flex items-center justify-center bg-black text-white text-[14px] font-normal px-6 py-3 rounded-full hover:bg-black/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Extracting…" : "Generate DESIGN.md"}
          </button>
        </form>
      </Card>

      <Card>
        <CardLabel>2. Upload existing file</CardLabel>
        <h3 className="text-[24px] font-normal tracking-[-0.3px] text-black mb-3">
          Already have one?
        </h3>
        <p className="text-[15px] text-[#5b5b5b] leading-[1.5] mb-6">
          Drop your <code className="text-[13px] bg-black/[0.04] px-1 rounded">DESIGN.md</code> file
          and we&apos;ll render it visually.
        </p>
        <FileDrop onFile={handleFile} />
        <button
          onClick={onExample}
          className="mt-4 text-[13px] text-[#999] hover:text-black underline-offset-2 hover:underline transition-colors"
        >
          Or try with an example file →
        </button>
      </Card>

      {error && (
        <p className="md:col-span-2 text-[14px] text-[#B8422E]">{error}</p>
      )}
    </div>
  );
}

function FileDrop({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  return (
    <label
      className={`flex flex-col items-center justify-center gap-2 px-6 py-10 border-2 border-dashed rounded-[8px] cursor-pointer transition-colors ${
        dragging
          ? "border-black bg-black/[0.02]"
          : "border-black/[0.12] hover:border-black/30 hover:bg-black/[0.01]"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
    >
      <p className="text-[14px] text-black">Drop a DESIGN.md file</p>
      <p className="text-[12px] text-[#999]">or click to browse</p>
      <input
        type="file"
        accept=".md,text/markdown,text/plain"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </label>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-black/[0.06] bg-white p-8 md:p-10">
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] text-[#999] uppercase tracking-[0.15em] mb-4">
      {children}
    </p>
  );
}

function Loading() {
  const steps = [
    "Reading the page",
    "Sampling colors",
    "Identifying fonts",
    "Inferring components",
    "Composing your DESIGN.md",
  ];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => Math.min(i + 1, steps.length - 1));
    }, 1400);
    return () => clearInterval(id);
  }, [steps.length]);
  return (
    <div className="flex flex-col items-center gap-6 py-24">
      <div className="w-7 h-7 border-2 border-black/10 border-t-black rounded-full animate-spin" />
      <ul className="flex flex-col gap-2 items-start min-w-[220px]">
        {steps.map((s, i) => (
          <li
            key={s}
            className={`flex items-center gap-2 text-[13px] transition-opacity ${
              i <= active ? "text-black opacity-100" : "text-[#999] opacity-50"
            }`}
          >
            <span
              className={`w-1 h-1 rounded-full ${i < active ? "bg-black" : i === active ? "bg-black animate-pulse" : "bg-[#ccc]"}`}
            />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RenderView({
  system,
  onChange,
  onReset,
  source,
  extractMeta,
}: {
  system: DesignSystem;
  onChange: (next: DesignSystem) => void;
  onReset: () => void;
  source: Source;
  extractMeta: ExtractMeta | null;
}) {
  const download = () => {
    const md = serializeDesignMd(system);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DESIGN.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyMarkdown = async () => {
    const md = serializeDesignMd(system);
    await navigator.clipboard.writeText(md);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <p className="text-[12px] text-[#999] uppercase tracking-[0.15em]">
              {source === "url"
                ? "Generated from URL"
                : source === "upload"
                  ? "Uploaded"
                  : "Example"}
            </p>
            {extractMeta?.source === "llm" && (
              <span
                className="text-[11px] px-2 py-0.5 rounded-full border border-black/10 text-[#666] flex items-center gap-1.5"
                title={`${extractMeta.model}${extractMeta.latencyMs ? ` · ${extractMeta.latencyMs}ms` : ""}${extractMeta.inputTokens ? ` · ${extractMeta.inputTokens}+${extractMeta.outputTokens} tokens` : ""}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                AI · Claude Haiku 4.5
              </span>
            )}
            {extractMeta?.source === "heuristic" && source === "url" && (
              <span
                className="text-[11px] px-2 py-0.5 rounded-full border border-[#B8422E]/30 text-[#B8422E]"
                title="LLM call failed; falling back to heuristic extraction"
              >
                Fallback · heuristic
              </span>
            )}
          </div>
          <p className="text-[15px] text-black">
            Edit, preview, and download your DESIGN.md
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="text-[13px] text-[#666] hover:text-black underline-offset-2 hover:underline transition-colors"
          >
            Start over
          </button>
          <button
            onClick={copyMarkdown}
            className="inline-flex items-center justify-center bg-white text-black text-[13px] font-normal px-4 py-2 rounded-full border border-black/10 hover:bg-black/[0.03] transition-colors"
          >
            Copy markdown
          </button>
          <button
            onClick={download}
            className="inline-flex items-center justify-center bg-black text-white text-[13px] font-normal px-4 py-2 rounded-full hover:bg-black/85 transition-colors"
          >
            Download .md
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10">
        <div className="order-2 lg:order-1">
          <Editor system={system} onChange={onChange} />
        </div>
        <div className="order-1 lg:order-2">
          <Renderer system={system} />
        </div>
      </div>
    </div>
  );
}

function composeFromExtract(data: {
  frontmatter: Record<string, unknown>;
  prose: { heading: string; body: string }[];
}): string {
  const yamlText = yaml.dump(data.frontmatter, { lineWidth: 120, noRefs: true }).trimEnd();
  const proseText = (data.prose ?? [])
    .map((p) => `## ${p.heading}\n\n${p.body}`)
    .join("\n\n");
  return `---\n${yamlText}\n---\n\n${proseText}\n`;
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

  const [autoUrl, setAutoUrl] = useState<string | null>(null);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("example") === "1") {
      startWith(EXAMPLE, "example");
      return;
    }
    const u = params.get("url");
    if (u) setAutoUrl(u);
  }, [startWith]);

  if (view === "select") {
    return (
      <ModeSelect
        onUpload={startWith}
        onUrl={startWith}
        onExample={() => startWith(EXAMPLE, "example")}
        setLoading={(url) => {
          setActiveUrl(url ?? null);
          setView("loading");
        }}
        setError={setError}
        error={error}
        initialUrl={autoUrl}
      />
    );
  }

  if (view === "loading") {
    return <Loading targetUrl={activeUrl} />;
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
  initialUrl,
}: {
  onUpload: (md: string, src: Source, meta?: ExtractMeta) => void;
  onUrl: (md: string, src: Source, meta?: ExtractMeta) => void;
  onExample: () => void;
  setLoading: (url?: string) => void;
  setError: (msg: string | null) => void;
  error: string | null;
  initialUrl: string | null;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      onUpload(text, "upload");
    };
    reader.readAsText(file);
  };

  const submitUrl = useCallback(
    async (target: string) => {
      if (!target.trim()) return;
      setSubmitting(true);
      setError(null);
      setLoading(target);
      try {
        const res = await fetch("/tools/design-md/api/extract", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: target }),
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
    },
    [onUrl, setError, setLoading],
  );

  useEffect(() => {
    if (initialUrl && !autoSubmitted) {
      setAutoSubmitted(true);
      void submitUrl(initialUrl);
    }
  }, [initialUrl, autoSubmitted, submitUrl]);

  const handleUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitUrl(url);
  };

  const valid = isLikelyUrl(url);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <Card>
        <CardLabel>1. Generate from URL</CardLabel>
        <h3 className="text-[24px] font-normal tracking-[-0.3px] text-black mb-3">
          Have a website?
        </h3>
        <p className="text-[15px] text-[#5b5b5b] leading-[1.5] mb-6">
          Paste any URL. We&apos;ll extract the brand colors, typography,
          shapes, and components that define its visual identity.
        </p>
        <form onSubmit={handleUrl} className="flex flex-col gap-3">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData("text").trim();
                if (pasted && !/^https?:\/\//i.test(pasted) && /^[\w-]+\.[\w.-]+/.test(pasted)) {
                  e.preventDefault();
                  setUrl(`https://${pasted}`);
                }
              }}
              placeholder="https://your-brand.com"
              autoComplete="url"
              spellCheck={false}
              className="w-full text-[15px] pl-4 pr-10 py-3 border border-black/[0.08] rounded-full bg-white focus:outline-none focus:border-black/30 transition-colors"
            />
            {url.length > 0 && (
              <span
                className={`absolute right-4 top-1/2 -translate-y-1/2 text-[12px] ${
                  valid ? "text-[#16A34A]" : "text-[#ccc]"
                }`}
                aria-hidden
              >
                {valid ? <CheckIcon className="w-3.5 h-3.5" /> : null}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting || !valid}
            className="inline-flex items-center justify-center gap-2 bg-black text-white text-[14px] font-normal px-6 py-3 rounded-full hover:bg-black/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Spinner className="w-4 h-4" />
                Extracting…
              </>
            ) : (
              <>
                Generate DESIGN.md
                <span className="hidden md:inline text-[11px] opacity-60 border border-white/30 rounded px-1.5 py-0.5 ml-1">
                  ↵
                </span>
              </>
            )}
          </button>
        </form>
      </Card>

      <Card>
        <CardLabel>2. Upload existing file</CardLabel>
        <h3 className="text-[24px] font-normal tracking-[-0.3px] text-black mb-3">
          Already have one?
        </h3>
        <p className="text-[15px] text-[#5b5b5b] leading-[1.5] mb-6">
          Drop your{" "}
          <code className="text-[13px] bg-black/[0.04] px-1 rounded font-mono">
            DESIGN.md
          </code>{" "}
          file and we&apos;ll render it visually so you can edit and re-export.
        </p>
        <FileDrop onFile={handleFile} />
        <button
          onClick={onExample}
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-[#666] hover:text-black underline-offset-2 hover:underline transition-colors"
        >
          Or open an example file
          <span aria-hidden>→</span>
        </button>
      </Card>

      {error && (
        <div className="md:col-span-2">
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        </div>
      )}
    </div>
  );
}

function isLikelyUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const u = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return !!u.hostname && /\./.test(u.hostname);
  } catch {
    return false;
  }
}

function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-[#B8422E]/[0.05] border border-[#B8422E]/30 rounded-[8px]">
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#B8422E]/15 text-[#B8422E] flex items-center justify-center text-[12px] font-medium mt-0.5">
        !
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-[#B8422E] mb-0.5">
          Couldn&apos;t generate from that URL
        </p>
        <p className="text-[13px] text-[#5b5b5b] leading-[1.5] break-words">
          {humanizeError(message)}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-[14px] text-[#999] hover:text-black px-2 py-0.5"
        aria-label="Dismiss error"
      >
        ✕
      </button>
    </div>
  );
}

function humanizeError(msg: string): string {
  if (/HTTP 4\d\d/i.test(msg)) {
    return `${msg}. The site returned a client error — try a different URL or check the address.`;
  }
  if (/HTTP 5\d\d/i.test(msg)) {
    return `${msg}. The site returned a server error — try again in a moment.`;
  }
  if (/timeout|timed out|aborted/i.test(msg)) {
    return "The site took too long to respond. Try again, or pick a different URL.";
  }
  if (/fetch|network/i.test(msg)) {
    return "We couldn't reach that URL. Check the spelling, or try with the full https:// prefix.";
  }
  return msg;
}

function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block border-2 border-white/30 border-t-white rounded-full animate-spin ${className ?? ""}`}
    />
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

function Loading({ targetUrl }: { targetUrl?: string | null }) {
  const steps = targetUrl
    ? [
        `Fetching ${prettyHost(targetUrl)}`,
        "Parsing CSS, fonts, and structure",
        "Analyzing brand tokens with Claude Haiku 4.5",
        "Composing your DESIGN.md",
      ]
    : [
        "Reading your file",
        "Parsing tokens",
        "Composing your DESIGN.md",
      ];

  // Realistic pacing: first step is fast (HTTP fetch), middle steps slower,
  // last step lingers because LLM is the long pole.
  const intervals = targetUrl ? [600, 800, 1500, 99999] : [400, 700, 99999];

  const [active, setActive] = useState(0);
  useEffect(() => {
    if (active >= steps.length - 1) return;
    const id = setTimeout(() => setActive((i) => i + 1), intervals[active] ?? 1000);
    return () => clearTimeout(id);
  }, [active, steps.length, intervals]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-24">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-black/10 border-t-black rounded-full animate-spin" />
        {targetUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-2 h-2 rounded-full bg-[#FA008C]"
              style={{ animation: "pulse 1.5s ease-in-out infinite" }}
            />
          </div>
        )}
      </div>
      <ul className="flex flex-col gap-2.5 items-start min-w-[260px]">
        {steps.map((s, i) => (
          <li
            key={s}
            className={`flex items-center gap-3 text-[13px] transition-all duration-300 ${
              i < active
                ? "text-[#999]"
                : i === active
                  ? "text-black"
                  : "text-[#ccc]"
            }`}
          >
            {i < active ? (
              <CheckIcon className="w-3 h-3 text-[#FA008C] flex-shrink-0" />
            ) : i === active ? (
              <span className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              </span>
            ) : (
              <span className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                <span className="w-1 h-1 rounded-full bg-[#ddd]" />
              </span>
            )}
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function prettyHost(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(
      /^www\./,
      "",
    );
  } catch {
    return url;
  }
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M2.5 6.5L5 9L9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
  const [tab, setTab] = useState<"visual" | "markdown">("visual");
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const md = useMemo(() => serializeDesignMd(system), [system]);

  const download = () => {
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DESIGN.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const sourceLabel =
    source === "url"
      ? "Generated from URL"
      : source === "upload"
        ? "Uploaded"
        : "Example";

  return (
    <div className="flex flex-col gap-8">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-5 border-b border-black/[0.06]">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[12px] text-[#999] uppercase tracking-[0.15em]">
            {sourceLabel}
          </p>
          {extractMeta?.source === "llm" && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full border border-black/10 text-[#666] flex items-center gap-1.5"
              title={`${extractMeta.model}${extractMeta.latencyMs ? ` · ${extractMeta.latencyMs}ms` : ""}${extractMeta.inputTokens ? ` · ${extractMeta.inputTokens}+${extractMeta.outputTokens} tokens` : ""}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FA008C]" />
              Claude Haiku 4.5
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
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 lg:justify-end">
          <button
            onClick={onReset}
            className="text-[13px] text-[#666] hover:text-black underline-offset-2 hover:underline transition-colors mr-2"
          >
            ← Start over
          </button>
          <button
            onClick={copyMarkdown}
            className={`inline-flex items-center justify-center gap-1.5 text-[13px] font-normal px-4 py-2 rounded-full border transition-colors ${
              copied
                ? "bg-[#FA008C]/[0.08] border-[#FA008C]/40 text-[#FA008C]"
                : "bg-white border-black/10 text-black hover:bg-black/[0.03]"
            }`}
          >
            {copied ? (
              <>
                <CheckIcon className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <CopyIcon className="w-3.5 h-3.5" />
                Copy markdown
              </>
            )}
          </button>
          <button
            onClick={download}
            className="inline-flex items-center justify-center gap-1.5 bg-black text-white text-[13px] font-normal px-4 py-2 rounded-full hover:bg-black/85 transition-colors"
          >
            {downloaded ? (
              <>
                <CheckIcon className="w-3 h-3" />
                Downloaded
              </>
            ) : (
              <>
                <DownloadIcon className="w-3.5 h-3.5" />
                Download .md
              </>
            )}
          </button>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex items-center gap-1 -mt-2">
        <ViewTab active={tab === "visual"} onClick={() => setTab("visual")}>
          Visual preview
        </ViewTab>
        <ViewTab
          active={tab === "markdown"}
          onClick={() => setTab("markdown")}
        >
          Markdown
        </ViewTab>
      </div>

      {/* Post-download tip */}
      {downloaded && <PostDownloadTip onDismiss={() => setDownloaded(false)} />}

      {/* Body */}
      {tab === "visual" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10">
          <div className="order-2 lg:order-1">
            <details className="lg:hidden mb-4 group">
              <summary className="cursor-pointer flex items-center justify-between p-4 bg-[#fafafa] border border-black/[0.06] rounded-[8px] list-none">
                <span className="text-[14px] font-medium text-black">
                  Edit tokens
                </span>
                <span className="text-[16px] text-[#999] group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <div className="mt-4">
                <Editor system={system} onChange={onChange} />
              </div>
            </details>
            <div className="hidden lg:block">
              <Editor system={system} onChange={onChange} />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <Renderer system={system} />
          </div>
        </div>
      ) : (
        <MarkdownView md={md} onCopy={copyMarkdown} copied={copied} />
      )}
    </div>
  );
}

function ViewTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[13px] px-4 py-2 rounded-full transition-colors ${
        active
          ? "bg-black text-white"
          : "text-[#666] hover:text-black hover:bg-black/[0.03]"
      }`}
    >
      {children}
    </button>
  );
}

function MarkdownView({
  md,
  onCopy,
  copied,
}: {
  md: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="relative">
      <button
        onClick={onCopy}
        className={`absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
          copied
            ? "bg-[#FA008C]/[0.08] border-[#FA008C]/40 text-[#FA008C]"
            : "bg-white border-black/10 text-[#666] hover:text-black"
        }`}
      >
        {copied ? (
          <>
            <CheckIcon className="w-3 h-3" />
            Copied
          </>
        ) : (
          <>
            <CopyIcon className="w-3 h-3" />
            Copy
          </>
        )}
      </button>
      <pre className="bg-[#fafafa] border border-black/[0.06] rounded-[8px] p-6 md:p-8 overflow-x-auto text-[13px] leading-[1.6] text-[#222] font-mono whitespace-pre-wrap break-words">
        {md}
      </pre>
      <p className="mt-4 text-[12px] text-[#999]">
        This is the literal contents of your <code className="font-mono">DESIGN.md</code> file.
        Save it at the root of your repo so AI coding agents pick it up automatically.
      </p>
    </div>
  );
}

function PostDownloadTip({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 sm:p-5 bg-[#FA008C]/[0.06] border border-[#FA008C]/20 rounded-[8px]">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FA008C] text-white flex items-center justify-center">
        <CheckIcon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-black mb-1">
          Got it. Now drop it at the root of your repo.
        </p>
        <p className="text-[13px] text-[#5b5b5b] leading-[1.55]">
          Most AI coding agents (Claude Code, Cursor, Copilot) auto-discover{" "}
          <code className="font-mono text-[12px] bg-white px-1 py-0.5 rounded border border-black/[0.06]">
            DESIGN.md
          </code>{" "}
          when it sits next to your{" "}
          <code className="font-mono text-[12px] bg-white px-1 py-0.5 rounded border border-black/[0.06]">
            package.json
          </code>
          . No config needed.
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="self-start text-[12px] text-[#999] hover:text-black px-2 py-1"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="5"
        y="5"
        width="9"
        height="9"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M11 5V3.5C11 2.67 10.33 2 9.5 2H3.5C2.67 2 2 2.67 2 3.5V9.5C2 10.33 2.67 11 3.5 11H5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8 2V11M8 11L4.5 7.5M8 11L11.5 7.5M3 13.5H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  // The URL this design system was extracted from. Set on URL + cached
  // sources so the render view can offer a "Regenerate" affordance.
  targetUrl?: string;
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

type ExampleSite = { label: string; url: string };

export default function Creator({
  examples = [],
}: {
  examples?: ExampleSite[];
}) {
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

  const regenerate = useCallback(
    async (target: string) => {
      setActiveUrl(target);
      setView("loading");
      try {
        const res = await fetch("/tools/design-md/api/extract", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: target, force: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Failed to regenerate");
        const md = composeFromExtract(data);
        startWith(md, "url", {
          source: data?.source ?? "heuristic",
          model: data?.meta?.model,
          latencyMs: data?.meta?.latencyMs,
          inputTokens: data?.meta?.inputTokens,
          outputTokens: data?.meta?.outputTokens,
          targetUrl: target,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to regenerate");
        // Bounce back to render view so the user doesn't lose context
        setView("render");
      }
    },
    [startWith],
  );

  // Use Next's reactive search params so client-side navigation to ?cached=N
  // (gallery card clicks) actually triggers the effect — a plain
  // window.location.search read would only fire on initial mount.
  const searchParams = useSearchParams();
  const cachedParam = searchParams.get("cached");
  const exampleParam = searchParams.get("example");
  const urlParam = searchParams.get("url");

  useEffect(() => {
    if (exampleParam === "1") {
      startWith(EXAMPLE, "example");
      return;
    }
    if (cachedParam) {
      // Load a previously-generated extraction from the gallery — no fresh
      // browser/LLM call, no lead gate.
      (async () => {
        try {
          const res = await fetch(`/tools/design-md/api/extractions/${encodeURIComponent(cachedParam)}`);
          if (!res.ok) throw new Error("Couldn't load that entry");
          const data = await res.json();
          startWith(data.designMd, "example", {
            source: data.source === "llm" ? "llm" : "heuristic",
            targetUrl: data.url,
          });
        } catch (e) {
          setError(e instanceof Error ? e.message : "Couldn't load that entry");
        }
      })();
      return;
    }
    if (urlParam) setAutoUrl(urlParam);
  }, [exampleParam, cachedParam, urlParam, startWith]);

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
        examples={examples}
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
        onRegenerate={regenerate}
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
  examples,
}: {
  onUpload: (md: string, src: Source, meta?: ExtractMeta) => void;
  onUrl: (md: string, src: Source, meta?: ExtractMeta) => void;
  onExample: () => void;
  setLoading: (url?: string) => void;
  setError: (msg: string | null) => void;
  error: string | null;
  initialUrl: string | null;
  examples: ExampleSite[];
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [leadModalUrl, setLeadModalUrl] = useState<string | null>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      onUpload(text, "upload");
    };
    reader.readAsText(file);
  };

  const runExtraction = useCallback(
    async (target: string, opts?: { force?: boolean }) => {
      setSubmitting(true);
      setError(null);
      setLoading(target);
      try {
        const res = await fetch("/tools/design-md/api/extract", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            url: target,
            ...(opts?.force ? { force: true } : {}),
          }),
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
          targetUrl: target,
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

  const submitUrl = useCallback(
    async (target: string) => {
      const trimmed = target.trim();
      if (!trimmed) return;
      // Lead gate: open modal if we haven't captured this browser's email yet
      if (!hasLead()) {
        setLeadModalUrl(trimmed);
        return;
      }
      await runExtraction(trimmed);
    },
    [runExtraction],
  );

  const handleLeadSubmitted = useCallback(
    async ({ email, url: submittedUrl }: { email: string; url: string }) => {
      saveLead(email);
      setLeadModalUrl(null);
      setUrl(submittedUrl);
      await runExtraction(submittedUrl);
    },
    [runExtraction],
  );

  const handleUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitUrl(url);
  };

  const valid = isLikelyUrl(url);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {/* Tool input bar */}
      <form
        onSubmit={handleUrl}
        className="flex items-stretch gap-1.5 p-1.5 border border-black/[0.1] bg-white rounded-[14px] focus-within:border-black/30 transition-colors"
      >
        <div className="flex-1 flex items-center gap-3 min-w-0 pl-3">
          <span className="text-[10px] text-[#999] uppercase tracking-[0.18em] font-mono shrink-0 hidden sm:inline">
            URL
          </span>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text").trim();
              if (
                pasted &&
                !/^https?:\/\//i.test(pasted) &&
                /^[\w-]+\.[\w.-]+/.test(pasted)
              ) {
                e.preventDefault();
                setUrl(`https://${pasted}`);
              }
            }}
            placeholder="https://your-brand.com"
            autoComplete="url"
            spellCheck={false}
            autoFocus
            className="w-full min-w-0 text-[15px] md:text-[16px] py-3 bg-transparent outline-none placeholder:text-[#bbb]"
          />
          {url.length > 0 && valid && (
            <CheckIcon className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mr-2" />
          )}
        </div>
        <button
          type="submit"
          disabled={submitting || !valid}
          className="inline-flex items-center justify-center gap-2 bg-black text-white text-[13px] md:text-[14px] font-medium px-4 md:px-6 rounded-[10px] hover:bg-black/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {submitting ? (
            <>
              <Spinner className="w-4 h-4" />
              <span className="hidden sm:inline">Generating…</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Generate</span>
              <span className="sm:hidden">Go</span>
              <span className="hidden md:inline text-[11px] opacity-60 border border-white/30 rounded px-1.5 py-0.5">
                ↵
              </span>
            </>
          )}
        </button>
      </form>

      {/* Secondary actions row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-[13px]">
        <span className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono">
          Try
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {examples.map((s) => (
            <button
              key={s.url}
              type="button"
              onClick={() => {
                setUrl(s.url);
                void submitUrl(s.url);
              }}
              disabled={submitting}
              className="text-[12px] px-2.5 py-1 rounded-full border border-black/[0.08] bg-white hover:bg-black hover:text-white hover:border-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {s.label}
            </button>
          ))}
        </div>
        <span className="hidden sm:inline w-px h-3 bg-black/[0.1]" aria-hidden />
        <button
          onClick={() => setShowUpload((v) => !v)}
          className="inline-flex items-center gap-1 text-[12px] text-[#666] hover:text-black transition-colors"
        >
          <UploadIcon className="w-3.5 h-3.5" />
          Upload existing file
          <span
            className={`text-[10px] transition-transform ${showUpload ? "rotate-180" : ""}`}
            aria-hidden
          >
            ▾
          </span>
        </button>
        <button
          onClick={onExample}
          className="text-[12px] text-[#666] hover:text-black transition-colors"
        >
          Open example
        </button>
      </div>

      {/* Inline file drop, only when toggled */}
      {showUpload && (
        <FileDrop onFile={handleFile} />
      )}

      {/* Error banner */}
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Workspace empty-state */}
      {!error && !showUpload && (
        <EmptyWorkspace />
      )}

      {/* Lead-gate modal */}
      {leadModalUrl && (
        <LeadModal
          targetUrl={leadModalUrl}
          onSubmitted={handleLeadSubmitted}
          onClose={() => setLeadModalUrl(null)}
        />
      )}
    </div>
  );
}

function EmptyWorkspace() {
  return (
    <div className="mt-2 border border-dashed border-black/[0.1] rounded-[12px] py-16 md:py-20 px-6 flex flex-col items-center justify-center gap-3 text-center bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] [background-size:20px_20px]">
      <div className="w-8 h-8 rounded-full bg-black/[0.04] flex items-center justify-center">
        <span className="text-[16px] text-[#999]" aria-hidden>↑</span>
      </div>
      <p className="text-[13px] text-[#666]">
        Output will appear here.
      </p>
      <p className="text-[12px] text-[#999] max-w-[420px] leading-[1.5]">
        Paste a URL above to extract brand colors, typography, layout,
        components, and a logo. Edit visually, download <code className="font-mono">DESIGN.md</code>.
      </p>
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8 11V2M8 2L4.5 5.5M8 2L11.5 5.5M3 13.5H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

const LEAD_STORAGE_KEY = "design-md-lead-v1";

function hasLead(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!window.localStorage.getItem(LEAD_STORAGE_KEY);
  } catch {
    return false;
  }
}

function saveLead(email: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LEAD_STORAGE_KEY,
      JSON.stringify({ email, ts: Date.now() }),
    );
  } catch {
    // ignore
  }
}

function LeadModal({
  targetUrl,
  onSubmitted,
  onClose,
}: {
  targetUrl: string;
  onSubmitted: (data: { email: string; url: string }) => Promise<void> | void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState(targetUrl);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Close on Escape, lock body scroll
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const urlValid = isLikelyUrl(websiteUrl);
  const canSubmit = emailValid && urlValid && agreed && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErr(null);
    try {
      const normalizedUrl = websiteUrl.trim().startsWith("http")
        ? websiteUrl.trim()
        : `https://${websiteUrl.trim()}`;
      const res = await fetch("/tools/design-md/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), url: normalizedUrl }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Couldn't record your email");
      }
      await onSubmitted({ email: email.trim(), url: normalizedUrl });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-[460px] bg-white rounded-t-[20px] sm:rounded-[16px] border border-black/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.18)] flex flex-col"
      >
        {/* Top accent strip */}
        <div className="h-[3px] bg-[#FA008C] rounded-t-[20px] sm:rounded-t-[16px]" />

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-1">
            <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono">
              Almost there
            </p>
            <button
              onClick={onClose}
              className="-mr-2 -mt-1 w-8 h-8 rounded-full flex items-center justify-center text-[#999] hover:text-black hover:bg-black/[0.04] transition-colors"
              aria-label="Close"
              type="button"
            >
              ✕
            </button>
          </div>
          <h2
            id="lead-modal-title"
            className="text-[22px] md:text-[24px] font-normal tracking-[-0.4px] text-black leading-[1.25] mb-3"
          >
            Free competitive analysis{" "}
            <span className="text-[#FA008C]">+</span> your DESIGN.md
          </h2>
          <p className="text-[14px] text-[#5b5b5b] leading-[1.55] mb-6">
            Enter your website URL and our AI-Coworker will deliver a free
            competitive analysis straight to your inbox. We&apos;ll also
            generate your DESIGN.md right now.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-[11px] text-[#666] uppercase tracking-[0.15em] font-mono">
                Website URL
              </span>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://your-brand.com"
                required
                autoComplete="url"
                spellCheck={false}
                className="w-full text-[15px] px-4 py-3 border border-black/[0.1] rounded-[10px] bg-white focus:outline-none focus:border-black/30 transition-colors"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] text-[#666] uppercase tracking-[0.15em] font-mono">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                autoFocus
                required
                autoComplete="email"
                className="w-full text-[15px] px-4 py-3 border border-black/[0.1] rounded-[10px] bg-white focus:outline-none focus:border-black/30 transition-colors"
              />
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none mt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-[3px] w-4 h-4 accent-[#FA008C] cursor-pointer"
              />
              <span className="text-[12px] text-[#5b5b5b] leading-[1.5]">
                I agree to receive a free competitive analysis from Masumi.
              </span>
            </label>

            {err && (
              <p className="text-[12px] text-[#B8422E] flex items-start gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-[#B8422E]/15 text-[#B8422E] text-center leading-none font-medium pt-px text-[10px]">
                  !
                </span>
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-1 inline-flex items-center justify-center gap-2 bg-black text-white text-[14px] font-medium px-6 py-3 rounded-[10px] hover:bg-black/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Spinner className="w-4 h-4" />
                  Sending…
                </>
              ) : (
                <>Get my free analysis</>
              )}
            </button>

            <p className="text-[11px] text-[#999] leading-[1.6] mt-1">
              *By entering your data for a free analysis, you agree to our{" "}
              <a
                href="https://www.sokosumi.com/privacy-policy"
                className="underline underline-offset-2 hover:text-black"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://www.sokosumi.com/terms-of-service"
                className="underline underline-offset-2 hover:text-black"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Use
              </a>
              .
            </p>
          </form>
        </div>
      </div>
    </div>
  );
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

function Loading({ targetUrl }: { targetUrl?: string | null }) {
  const steps = targetUrl
    ? [
        `Booting a browser to render ${prettyHost(targetUrl)}`,
        "Capturing screenshot + computed styles",
        "Analyzing visual identity with AI",
        "Composing your DESIGN.md",
      ]
    : [
        "Reading your file",
        "Parsing tokens",
        "Composing your DESIGN.md",
      ];

  // Realistic pacing: Browserbase session is the long pole (~15-25s), then
  // signal/screenshot are quick, then LLM ~3-5s.
  const intervals = targetUrl ? [9000, 11000, 4000, 99999] : [400, 700, 99999];

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
  onRegenerate,
}: {
  system: DesignSystem;
  onChange: (next: DesignSystem) => void;
  onReset: () => void;
  source: Source;
  extractMeta: ExtractMeta | null;
  onRegenerate?: (url: string) => void | Promise<void>;
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
              title={
                extractMeta.latencyMs
                  ? `Generated in ${extractMeta.latencyMs}ms`
                  : "AI-generated"
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FA008C]" />
              AI-generated
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
          {extractMeta?.targetUrl && onRegenerate && (
            <button
              onClick={() => onRegenerate(extractMeta.targetUrl!)}
              className="inline-flex items-center justify-center gap-1.5 text-[13px] font-normal px-4 py-2 rounded-full border border-black/10 bg-white text-[#666] hover:text-black hover:bg-black/[0.03] transition-colors"
              title="Re-run the AI extraction, bypassing the cache"
            >
              <RegenerateIcon className="w-3.5 h-3.5" />
              Regenerate
            </button>
          )}
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

function RegenerateIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M3 8a5 5 0 0 1 9-3M13 8a5 5 0 0 1-9 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 2v3.5H8.5M4 14v-3.5h3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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

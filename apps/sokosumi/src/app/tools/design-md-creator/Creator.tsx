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

const EXAMPLE = `---
name: Heritage
description: Architectural Minimalism meets Journalistic Gravitas.
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  tertiary: "#B8422E"
  neutral: "#F7F5F2"
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 3rem
    fontWeight: 600
    lineHeight: 1.1
  body-md:
    fontFamily: Public Sans
    fontSize: 1rem
    lineHeight: 1.5
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: 12px 24px
---

## Overview

Architectural Minimalism meets Journalistic Gravitas. The UI evokes a premium matte finish — a high-end broadsheet or contemporary gallery.

## Colors

The palette is rooted in high-contrast neutrals and a single accent color.
`;

export default function Creator() {
  const [view, setView] = useState<View>("select");
  const [source, setSource] = useState<Source>(null);
  const [system, setSystem] = useState<DesignSystem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startWith = useCallback((md: string, src: Source) => {
    try {
      const parsed = parseDesignMd(md);
      setSystem(parsed);
      setSource(src);
      setError(null);
      setView("render");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse");
      setView("select");
    }
  }, []);

  const reset = () => {
    setSystem(null);
    setSource(null);
    setError(null);
    setView("select");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("example") === "1") startWith(EXAMPLE, "example");
  }, [startWith]);

  if (view === "select") {
    return <ModeSelect onUpload={startWith} onUrl={startWith} onExample={() => startWith(EXAMPLE, "example")} setLoading={() => setView("loading")} setError={setError} error={error} />;
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
      />
    );
  }

  return null;
}

function ModeSelect({
  onUpload,
  onUrl,
  onExample,
  setLoading,
  setError,
  error,
}: {
  onUpload: (md: string, src: Source) => void;
  onUrl: (md: string, src: Source) => void;
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
      onUrl(md, "url");
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
}: {
  system: DesignSystem;
  onChange: (next: DesignSystem) => void;
  onReset: () => void;
  source: Source;
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
          <p className="text-[12px] text-[#999] uppercase tracking-[0.15em]">
            {source === "url"
              ? "Generated from URL"
              : source === "upload"
                ? "Uploaded"
                : "Example"}
          </p>
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

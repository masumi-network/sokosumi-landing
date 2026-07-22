"use client";

import { useEffect, useRef, useState } from "react";
import { useConsent } from "@/components/CookieConsent";

const aggregateEvents = new Set([
  "learn_course_view",
  "learn_quickstart_start",
  "learn_docs_conversion",
  "learn_publish_conversion",
]);

export function recordLearnAggregateEvent(event: string) {
  if (!aggregateEvents.has(event) || window.localStorage.getItem("masumi-cookie-consent") !== "accepted") return;
  void fetch("/api/learn/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event }),
    credentials: "omit",
    cache: "no-store",
    keepalive: true,
  }).catch(() => {});
}

function trackLearnEvent(event: string, params: Record<string, string | number>) {
  if (typeof window.gtag === "function") window.gtag("event", event, params);
  recordLearnAggregateEvent(event);
}

export function LearnCourseViewTracker() {
  const consent = useConsent();
  const recorded = useRef(false);
  useEffect(() => {
    if (consent !== "accepted" || recorded.current) return;
    recorded.current = true;
    recordLearnAggregateEvent("learn_course_view");
  }, [consent]);
  return null;
}

export function TrackedLink({ href, event, params = {}, className, children }: { href: string; event: string; params?: Record<string, string | number>; className?: string; children: React.ReactNode }) {
  return <a href={href} onClick={() => trackLearnEvent(event, params)} className={className}>{children}</a>;
}

export function TrackedConversionLink({ href, event, params = {}, children }: { href: string; event: string; params?: Record<string, string | number>; children: React.ReactNode }) {
  return <a href={href} onClick={() => trackLearnEvent(event, params)} className="border border-black/[0.04] bg-white p-6 transition-[border-color,transform] duration-300 hover:border-black/10 hover:-translate-y-1"><span className="flex items-center justify-between"><span className="text-[11px] font-mono uppercase tracking-wide text-[#FA008C]">Next step</span><span className="w-2 h-2 rounded-full bg-[#FA008C] opacity-50" /></span><strong className="mt-2 block text-[17px] font-medium leading-snug text-black">{children}</strong></a>;
}

export function MintCredentialButton({ credentialId }: { credentialId?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  async function mint() {
    setState("loading");
    const response = await fetch("/api/learn/credential", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ credentialId }) });
    const data = await response.json();
    if (!response.ok) { setState("error"); setMessage(data.error || "Minting is unavailable"); return; }
    window.location.reload();
  }
  return <div><label className="mb-3 flex gap-2 text-[13px] leading-5 tracking-[0.02em] text-[#f5f5f5]/70"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-1" /><span>I understand the credential ID/hash and course facts will become a permanent public chain record.</span></label><button onClick={mint} disabled={state === "loading" || !acknowledged} className="w-full rounded-full bg-[#6400FF] px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-white transition-colors duration-200 hover:bg-[#5200d0] disabled:opacity-50">{state === "loading" ? "Starting mint…" : "Mint on Cardano"}</button>{state === "error" && <p role="alert" className="mt-2 text-[13px] leading-5 tracking-[0.02em] text-[#ff6400]">{message}</p>}</div>;
}

export function RefreshMintStatusButton({ credentialId }: { credentialId?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  async function refresh() {
    setState("loading");
    const response = await fetch("/api/learn/credential", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ credentialId }) });
    const data = await response.json();
    if (!response.ok) { setState("error"); setMessage(data.error || "Unable to refresh mint status"); return; }
    window.location.reload();
  }
  return <div><button onClick={refresh} disabled={state === "loading"} className="w-full rounded-full border border-white/25 px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] transition-colors duration-200 hover:bg-white/10 disabled:opacity-50">{state === "loading" ? "Checking…" : "Refresh mint status"}</button>{state === "error" && <p role="alert" className="mt-2 text-[13px] leading-5 tracking-[0.02em] text-[#ff6400]">{message}</p>}</div>;
}

export function CopyCertificateLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
    setCopied(true);
  }
  return <button onClick={copy} className="rounded-full border border-[#bbbbbb] bg-white px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-black transition-colors duration-200 hover:bg-[#f5f5f5]" aria-live="polite">{copied ? "Link copied ✓" : "Copy verification link"}</button>;
}

export function DeleteLearnAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function remove() {
    setLoading(true);
    const response = await fetch("/api/learn/account", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirm: "DELETE" }) });
    if (!response.ok) { const data = await response.json(); setError(data.error || "Unable to delete account"); setLoading(false); return; }
    window.location.assign("/learn");
  }
  if (!confirming) return <button onClick={() => setConfirming(true)} className="mt-4 rounded-full border border-[#bbbbbb] bg-white px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-[#fa140a] transition-colors duration-200 hover:bg-[#f5f5f5]">Delete my Learn account</button>;
  return <div className="mt-4 bg-[#ffcac5] p-4 text-[#5a0a00]"><p className="text-[14px] font-medium tracking-[0.01em]">Permanently delete Learn progress and revoke all credentials?</p><div className="mt-3 flex gap-2"><button onClick={remove} disabled={loading} className="rounded-full bg-[#fa140a] px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-white transition-colors duration-200 disabled:opacity-50">{loading ? "Deleting…" : "Yes, delete"}</button><button onClick={() => setConfirming(false)} className="rounded-full border border-[#bbbbbb] bg-white px-6 py-2.5 text-[14px] font-medium tracking-[0.01em] text-black transition-colors duration-200 hover:bg-[#f5f5f5]">Cancel</button></div>{error && <p role="alert" className="mt-2 text-[13px] tracking-[0.02em] text-[#5a0a00]">{error}</p>}</div>;
}

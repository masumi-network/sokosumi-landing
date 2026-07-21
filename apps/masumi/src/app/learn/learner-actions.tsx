"use client";

import { useState } from "react";

export function TrackedLink({ href, event, params = {}, className, children }: { href: string; event: string; params?: Record<string, string | number>; className?: string; children: React.ReactNode }) {
  return <a href={href} onClick={() => { if (typeof window.gtag === "function") window.gtag("event", event, params); }} className={className}>{children}</a>;
}

export function TrackedConversionLink({ href, event, params = {}, children }: { href: string; event: string; params?: Record<string, string | number>; children: React.ReactNode }) {
  return <a href={href} onClick={() => { if (typeof window.gtag === "function") window.gtag("event", event, params); }} className="rounded-2xl border border-black/10 bg-white p-5 transition hover:border-[#FA008C]/50"><span className="block text-xs uppercase tracking-[0.16em] text-[#A50045]">Next step</span><strong className="mt-2 block font-medium">{children}</strong></a>;
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
  return <div><label className="mb-3 flex gap-2 text-xs leading-5 text-white/60"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-1" /><span>I understand the credential ID/hash and course facts will become a permanent public chain record.</span></label><button onClick={mint} disabled={state === "loading" || !acknowledged} className="w-full rounded-full border border-white/25 px-5 py-3 text-sm disabled:opacity-50">{state === "loading" ? "Starting mint…" : "Mint on Cardano"}</button>{state === "error" && <p role="alert" className="mt-2 text-xs leading-5 text-amber-200">{message}</p>}</div>;
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
  return <div><button onClick={refresh} disabled={state === "loading"} className="w-full rounded-full border border-white/25 px-5 py-3 text-sm disabled:opacity-50">{state === "loading" ? "Checking…" : "Refresh mint status"}</button>{state === "error" && <p role="alert" className="mt-2 text-xs leading-5 text-amber-200">{message}</p>}</div>;
}

export function CopyCertificateLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
    setCopied(true);
  }
  return <button onClick={copy} className="rounded-full border border-black/15 px-5 py-3 text-sm" aria-live="polite">{copied ? "Link copied ✓" : "Copy verification link"}</button>;
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
  if (!confirming) return <button onClick={() => setConfirming(true)} className="mt-4 rounded-full border border-red-300 px-5 py-3 text-sm text-red-800">Delete my Learn account</button>;
  return <div className="mt-4 rounded-2xl bg-red-50 p-4"><p className="text-sm font-medium text-red-900">Permanently delete Learn progress and Builder proof and revoke all credentials?</p><div className="mt-3 flex gap-2"><button onClick={remove} disabled={loading} className="rounded-full bg-red-700 px-4 py-2 text-sm text-white disabled:opacity-50">{loading ? "Deleting…" : "Yes, delete"}</button><button onClick={() => setConfirming(false)} className="rounded-full border border-black/15 px-4 py-2 text-sm">Cancel</button></div>{error && <p role="alert" className="mt-2 text-xs text-red-800">{error}</p>}</div>;
}

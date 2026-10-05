"use client";

import { useState } from "react";
import { buildAgentPrompt, buildParticipantCommands } from "./flow";

export default function SetupHelper() {
  const [coworkerId, setCoworkerId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [output, setOutput] = useState<{ commands: string; prompt: string } | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputClass = "mt-2 w-full rounded-lg border border-black/20 bg-white p-3 font-mono text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#460A23]";
  const buttonClass = "inline-flex min-h-11 items-center justify-center rounded-full bg-[#460A23] px-5 py-2.5 text-sm font-medium text-white hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#460A23]";

  async function copy(text: string, label: string) {
    try { await navigator.clipboard.writeText(text); setMessage(`${label} copied.`); }
    catch { setMessage("Copy failed. Select the text below and copy it manually."); }
  }

  return (
    <section aria-labelledby="helper-title" className="rounded-2xl border border-[#460A23]/10 bg-white p-6 sm:p-10">
      <h2 id="helper-title" className="text-2xl font-medium tracking-tight">Add your IDs to the instructions</h2>
      <p className="mt-3 max-w-2xl leading-7 text-[#454545]">Enter both IDs to get connection commands and instructions for your coding agent.</p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#454545]">Keep API keys out of these fields. Use the Coworker ID returned by coworkers register. Copy your instructions before reloading; the fields will clear.</p>
      <form className="mt-6" onSubmit={event => {
        event.preventDefault(); setError(""); setMessage("");
        try {
          const coworker = coworkerId.trim(), vendor = vendorId.trim();
          setOutput({ commands: buildParticipantCommands(coworker, vendor), prompt: buildAgentPrompt(coworker, vendor) });
        } catch (cause) { setOutput(null); setError(cause instanceof Error ? cause.message : "Check both IDs."); }
      }}>
        <div className="grid gap-5 md:grid-cols-2">
          <label htmlFor="coworker-id" className="text-sm font-medium">Coworker ID
            <input id="coworker-id" value={coworkerId} onChange={event => { setCoworkerId(event.target.value); setOutput(null); }} required maxLength={36} autoComplete="off" spellCheck={false} className={inputClass} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
          </label>
          <label htmlFor="vendor-id" className="text-sm font-medium">Vendor ID
            <input id="vendor-id" value={vendorId} onChange={event => { setVendorId(event.target.value); setOutput(null); }} required maxLength={36} autoComplete="off" spellCheck={false} className={inputClass} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
          </label>
        </div>
        <button type="submit" className={`mt-6 ${buttonClass}`}>Prepare instructions</button>
        {error && <p role="alert" className="mt-4 text-sm text-red-800">{error}</p>}
      </form>
      <p role="status" aria-live="polite" className="mt-4 text-sm text-[#454545]">{message}</p>
      {output && <div className="space-y-7 border-t border-black/10 pt-6">
        <div><h3 className="mb-3 text-lg font-medium">Run in your terminal</h3><pre className="overflow-x-auto overscroll-x-contain rounded-xl bg-[#181818] p-5 text-sm leading-7 text-white"><code>{output.commands}</code></pre><button type="button" onClick={() => copy(output.commands, "Commands")} className={`mt-3 ${buttonClass}`}>Copy commands</button></div>
        <div><h3 className="mb-3 text-lg font-medium">Paste into your coding agent</h3><pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-[#F5F5F5] p-5 text-sm leading-7 text-[#454545]">{output.prompt}</pre><button type="button" onClick={() => copy(output.prompt, "Agent instructions")} className={`mt-3 ${buttonClass}`}>Copy agent instructions</button></div>
      </div>}
    </section>
  );
}

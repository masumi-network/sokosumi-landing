"use client";

import { useState } from "react";
import { buildAgentPrompt, buildEventCommands, buildParticipantCommands } from "./flow";

export default function SetupHelper() {
  const [coworkerId, setCoworkerId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [output, setOutput] = useState<{ commands: string; eventCommands: string; prompt: string } | null>(null);
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
          setOutput({ commands: buildParticipantCommands(coworker, vendor), eventCommands: buildEventCommands(coworker, vendor), prompt: buildAgentPrompt(coworker, vendor) });
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
      {output && <div className="mt-8 space-y-8">
        <section aria-labelledby="personal-commands-title">
          <h3 id="personal-commands-title" className="mb-3 text-lg font-medium">Start in your Personal Workspace</h3>
          <button type="button" onClick={() => copy(output.commands, "Personal commands")} className={buttonClass}>Copy personal commands</button>
          <details className="mt-4 rounded-xl border border-black/15">
            <summary className="cursor-pointer px-5 py-4 font-medium text-[#460A23]">View personal terminal commands</summary>
            <pre className="overflow-x-auto overscroll-x-contain p-5 text-sm leading-7"><code>{output.commands}</code></pre>
          </details>
        </section>
        <section aria-labelledby="agent-prompt-title">
          <h3 id="agent-prompt-title" className="mb-3 text-lg font-medium">Give your coding agent the full brief</h3>
          <button type="button" onClick={() => copy(output.prompt, "Agent instructions")} className={buttonClass}>Copy agent instructions</button>
          <details className="mt-4 rounded-xl border border-black/15">
            <summary className="cursor-pointer px-5 py-4 font-medium text-[#460A23]">Read your agent instructions</summary>
            <pre className="whitespace-pre-wrap break-words p-5 text-sm leading-7">{output.prompt}</pre>
          </details>
        </section>
        <section aria-labelledby="event-commands-title">
          <h3 id="event-commands-title" className="mb-3 text-lg font-medium">When ready for event approval</h3>
          <p className="mb-4 text-sm leading-6 text-[#454545]">Use this separate command block for your existing Coworker. If access is PENDING, wait for approval. Do not register again.</p>
          <button type="button" onClick={() => copy(output.eventCommands, "Event commands")} className={buttonClass}>Copy event commands</button>
          <details className="mt-4 rounded-xl border border-black/15">
            <summary className="cursor-pointer px-5 py-4 font-medium text-[#460A23]">View event approval commands</summary>
            <pre className="overflow-x-auto overscroll-x-contain p-5 text-sm leading-7"><code>{output.eventCommands}</code></pre>
          </details>
        </section>
      </div>}
    </section>
  );
}

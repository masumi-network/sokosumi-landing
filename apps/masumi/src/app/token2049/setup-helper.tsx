"use client";

import { useRef, useState } from "react";
import CopyButton from "./copy-button";
import { Commands } from "./command";
import Disclosure from "./disclosure";
import ui from "./guide-ui.module.css";
import { EVENT, isValidId, buildAgentPrompt, buildEventCommands, buildParticipantCommands } from "./flow";

export default function SetupHelper() {
  const [coworkerId, setCoworkerId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [output, setOutput] = useState<{ commands: string[]; eventCommands: string[]; prompt: string } | null>(null);
  const [errors, setErrors] = useState({ coworker: "", vendor: "" });
  const coworkerInput = useRef<HTMLInputElement>(null);
  const vendorInput = useRef<HTMLInputElement>(null);
  const inputClass = "mt-2 w-full rounded-lg border border-black/20 bg-white p-3 font-mono text-base sm:text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#460A23]";
  const buttonClass = ui.button;

  return (
    <section aria-labelledby="helper-title" className={`${ui.surface} rounded-3xl bg-white p-6 sm:p-10`}>
      <h2 id="helper-title" className="text-2xl font-medium tracking-tight">Coworker and Vendor IDs</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#454545]">Use IDs returned by the CLI, not API keys. Copy the output before leaving this page.</p>
      <form noValidate className="mt-6" onSubmit={event => {
        event.preventDefault();
        const coworker = coworkerId.trim(), vendor = vendorId.trim();
        const nextErrors = {
          coworker: isValidId(coworker) ? "" : "Enter the full Coworker ID, including hyphens.",
          vendor: isValidId(vendor) ? "" : "Enter the full Vendor ID, including hyphens.",
        };
        setErrors(nextErrors);
        if (nextErrors.coworker || nextErrors.vendor) {
          setOutput(null);
          (nextErrors.coworker ? coworkerInput : vendorInput).current?.focus();
          return;
        }
        setOutput({ commands: buildParticipantCommands(coworker, vendor), eventCommands: buildEventCommands(coworker, vendor), prompt: buildAgentPrompt(coworker, vendor) });
      }}>
        <div className="grid gap-5 md:grid-cols-2">
          <div><label htmlFor="coworker-id" className="text-sm font-medium">Coworker ID</label>
            <input ref={coworkerInput} aria-invalid={!!errors.coworker} aria-describedby={errors.coworker ? "coworker-error" : undefined} id="coworker-id" value={coworkerId} onChange={event => { setCoworkerId(event.target.value); setOutput(null); setErrors(current => ({ ...current, coworker: "" })); }} required maxLength={36} autoComplete="off" spellCheck={false} className={`${inputClass} ${ui.input}`} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
            {errors.coworker && <span id="coworker-error" className="mt-2 block font-normal text-red-800">{errors.coworker}</span>}
          </div>
          <div><label htmlFor="vendor-id" className="text-sm font-medium">Vendor ID</label>
            <input ref={vendorInput} aria-invalid={!!errors.vendor} aria-describedby={errors.vendor ? "vendor-error" : undefined} id="vendor-id" value={vendorId} onChange={event => { setVendorId(event.target.value); setOutput(null); setErrors(current => ({ ...current, vendor: "" })); }} required maxLength={36} autoComplete="off" spellCheck={false} className={`${inputClass} ${ui.input}`} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
            {errors.vendor && <span id="vendor-error" className="mt-2 block font-normal text-red-800">{errors.vendor}</span>}
          </div>
        </div>
        <button type="submit" className={`mt-6 ${buttonClass}`}>Prepare instructions</button>

      </form>
      <p role="status" className="sr-only">{output ? "Instructions ready. Personal commands appear below." : ""}</p>
      {output && <div className="mt-8 space-y-8">
        <section aria-labelledby="agent-prompt-title">
          <h3 id="agent-prompt-title" className="mb-3 text-lg font-medium">Give your coding agent these instructions</h3>
          <p className="mb-4 text-sm leading-6 text-[#454545]">Your coding agent can connect the Coworker and save its runtime key to your ignored .env.local file automatically. Select Personal Workspace in Sokosumi to see your personal Coworker.</p>
          <CopyButton text={output.prompt} label="Copy agent instructions" />
          <div className="mt-4"><Disclosure title="Read your agent instructions">
            <pre className="whitespace-pre-wrap break-words text-sm leading-7">{output.prompt}</pre>
          </Disclosure></div>
        </section>
        <section aria-labelledby="personal-commands-title">
          <h3 id="personal-commands-title" className="mb-3 text-lg font-medium">Manual CLI alternative</h3>
          <p className="mb-4 text-sm leading-6 text-[#454545]">Use these if you are setting up without a coding agent. Run them in order. The key command imports into the CLI vault without printing the key. It does not write an environment file.</p>
          <Disclosure title="View manual connection and key commands"><Commands>{output.commands}</Commands></Disclosure>
        </section>
        <section aria-labelledby="event-commands-title">
          <h3 id="event-commands-title" className="mb-3 text-lg font-medium">When ready for event approval</h3>
          <p className="mb-4 text-sm leading-6 text-[#454545]"><a href={EVENT.joinUrl} className={ui.link}>Join the event Workspace</a> with the same account before requesting access.</p>
          <p className="mb-4 text-sm leading-6 text-[#454545]">If access is PENDING, wait for approval, then retry connect with the same Coworker ID. Check the runtime Vendor grant separately.</p>

          <div className="mt-4"><Disclosure title="View event approval commands">
            <Commands>{output.eventCommands}</Commands>
          </Disclosure></div>
        </section>
      </div>}
    </section>
  );
}

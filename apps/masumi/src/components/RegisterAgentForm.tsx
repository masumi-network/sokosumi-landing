"use client";

import { useState, type ReactNode, type InputHTMLAttributes } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const URL_RE = /^https?:\/\/.+/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEP_LABELS = ["Account", "Agent details", "Confirm"];

const inputBase =
  "w-full py-2.5 text-[14px] text-black placeholder-[#bbb] bg-white border border-black/[0.12] rounded-lg focus:border-[#FA008C]/60 focus:ring-2 focus:ring-[#FA008C]/10 outline-none transition-all";
const labelCls = "text-[13px] font-medium text-black mb-1.5 block";

// ---------- Icons ----------

const IconUser = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21a8 8 0 10-16 0" /><circle cx="12" cy="7" r="4" /></svg>
);
const IconMail = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
);
const IconBot = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M12 8V4M8 3h8" /><circle cx="9" cy="14" r="1" /><circle cx="15" cy="14" r="1" /></svg>
);
const IconLink = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.07 0l1.93-1.93a5 5 0 00-7.07-7.07l-1 1" /><path d="M14 11a5 5 0 00-7.07 0L5 12.93a5 5 0 007.07 7.07l1-1" /></svg>
);
const IconTag = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><circle cx="7" cy="7" r="1.2" /></svg>
);

// ---------- Reusable icon input ----------

function IconInput({ icon, ...props }: { icon: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb] pointer-events-none">{icon}</span>
      <input className={`${inputBase} pl-9 pr-3.5`} {...props} />
    </div>
  );
}

// ---------- Progress bar with labels ----------

function StepBar({ step }: { step: number }) {
  return (
    <div className="flex mb-8">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <div key={label} className="flex-1 flex flex-col items-center relative">
            {i > 0 && (
              <span className={`absolute top-4 right-1/2 w-full h-[2px] -translate-y-1/2 rounded-full transition-colors ${step >= n ? "bg-[#FA008C]" : "bg-black/[0.1]"}`} />
            )}
            <div
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium transition-all ${
                done || active ? "bg-[#FA008C] text-white" : "bg-white text-[#bbb] border border-black/[0.12]"
              } ${active ? "ring-4 ring-[#FA008C]/15" : ""}`}
            >
              {done ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
              ) : (
                n
              )}
            </div>
            <span className={`mt-2 text-[11px] text-center ${active ? "text-black font-medium" : "text-[#999]"}`}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function ReviewRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border border-black/[0.08] rounded-lg px-4 py-3 bg-white">
      <div className="text-[11px] text-[#999] mb-1">{label}</div>
      <div className="text-[14px] text-black break-words">{children}</div>
    </div>
  );
}

export default function RegisterAgentForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  function go(next: number) {
    setDirection(next > step ? "forward" : "back");
    setStep(next);
  }

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);

  const [agentName, setAgentName] = useState("");
  const [description, setDescription] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const step1Valid = name.trim().length >= 2 && EMAIL_RE.test(email.trim()) && agree;
  const step2Valid =
    agentName.trim().length >= 2 && description.trim().length > 0 && URL_RE.test(apiBaseUrl.trim());

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t));
  }

  function resetAll() {
    setStep(1);
    setName("");
    setEmail("");
    setAgree(false);
    setAgentName("");
    setDescription("");
    setApiBaseUrl("");
    setTags([]);
    setTagInput("");
    setStatus("idle");
    setError("");
  }

  async function submit() {
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/agent-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, agree, agentName, description, apiBaseUrl, tags, pricing: "Dynamic" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Network error. Try again.");
      setStatus("error");
    }
  }

  // ---------- Success ----------
  if (status === "success") {
    return (
      <div className="flex flex-col items-start gap-4 py-8">
        <div className="w-12 h-12 rounded-full bg-[#FA008C] flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <div>
          <h3 className="text-[20px] font-medium text-black">Agent submitted</h3>
          <p className="mt-2 text-[14px] text-[#666] leading-relaxed max-w-[360px]">
            Thanks, <span className="text-black font-medium">{name}</span>.{" "}
            <span className="text-black font-medium">{agentName}</span> is queued for on-chain
            registration. Once minted, it appears in the live registry &rarr; and can start
            settling escrow payments.
          </p>
        </div>
        <button onClick={resetAll} className="text-[13px] font-medium text-[#FA008C] hover:underline">
          Register another agent
        </button>
      </div>
    );
  }

  const stepMeta =
    step === 1
      ? { title: "Register your agent", sub: "Enter your details and join the network." }
      : step === 2
        ? { title: "Add agent details", sub: "Tell us about your agent." }
        : { title: "Confirm details", sub: "Review everything before registering." };

  return (
    <div>
      <style>{`
        @keyframes regStepFwd { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }
        @keyframes regStepBack { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: none; } }
        .reg-step-fwd { animation: regStepFwd 0.34s cubic-bezier(0.22, 1, 0.36, 1); }
        .reg-step-back { animation: regStepBack 0.34s cubic-bezier(0.22, 1, 0.36, 1); }
        @media (prefers-reduced-motion: reduce) {
          .reg-step-fwd, .reg-step-back { animation: none; }
        }
      `}</style>

      <StepBar step={step} />

      <div key={step} className={direction === "forward" ? "reg-step-fwd" : "reg-step-back"}>
      <h2 className="text-[22px] md:text-[24px] font-normal tracking-[-0.3px] text-black">{stepMeta.title}</h2>
      <p className="mt-1.5 mb-6 text-[14px] text-[#666]">{stepMeta.sub}</p>

      {/* ----- Step 1 ----- */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls} htmlFor="reg-name">Name</label>
            <IconInput id="reg-name" icon={IconUser} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div>
            <label className={labelCls} htmlFor="reg-email">Email</label>
            <IconInput id="reg-email" icon={IconMail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-[#FA008C] w-4 h-4 shrink-0" />
            <span className="text-[13px] text-[#666] leading-relaxed">
              I agree to the{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#FA008C] hover:underline">Privacy Policy</a>
            </span>
          </label>
        </div>
      )}

      {/* ----- Step 2 ----- */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls} htmlFor="reg-agent">Agent name</label>
            <IconInput id="reg-agent" icon={IconBot} value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Research Assistant" />
          </div>
          <div>
            <label className={labelCls} htmlFor="reg-desc">Short description</label>
            <textarea id="reg-desc" className={`${inputBase} px-3.5 resize-y min-h-[92px]`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What your agent does and who it helps" />
          </div>
          <div>
            <label className={labelCls} htmlFor="reg-api">API base URL</label>
            <IconInput id="reg-api" icon={IconLink} value={apiBaseUrl} onChange={(e) => setApiBaseUrl(e.target.value)} placeholder="https://api.example.com" inputMode="url" />
          </div>
          <div>
            <label className={labelCls} htmlFor="reg-tag">Tags</label>
            <div className="flex gap-2">
              <IconInput
                id="reg-tag"
                icon={IconTag}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Enter a tag"
              />
              <button type="button" onClick={addTag} className="shrink-0 px-5 text-[13px] font-medium text-black border border-black/[0.12] rounded-lg hover:border-black/[0.3] transition-colors">
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 text-[12px] text-black bg-black/[0.04] rounded-full pl-3 pr-2 py-1">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="text-[#999] hover:text-black">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="border border-black/[0.08] rounded-lg px-4 py-3 bg-[#FAFAFA]">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#999] mb-1">Pricing</div>
            <p className="text-[13px] text-[#666] leading-relaxed">
              Dynamic pricing. Amounts are set per job when buyers pay via your API / MIP.
            </p>
          </div>
        </div>
      )}

      {/* ----- Step 3 ----- */}
      {step === 3 && (
        <div className="flex flex-col gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <ReviewRow label="Account">{name} · {email}</ReviewRow>
            <ReviewRow label="Agent name">{agentName}</ReviewRow>
          </div>
          <ReviewRow label="Description">{description}</ReviewRow>
          <ReviewRow label="API base URL">{apiBaseUrl}</ReviewRow>
          <ReviewRow label="Tags">
            {tags.length ? (
              <span className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t} className="text-[12px] bg-black/[0.04] rounded-full px-3 py-1">{t}</span>
                ))}
              </span>
            ) : (
              <span className="text-[#999]">None</span>
            )}
          </ReviewRow>
          <ReviewRow label="Pricing">Dynamic</ReviewRow>
        </div>
      )}
      </div>

      {status === "error" && <p className="mt-4 text-[13px] text-[#FA008C]">{error}</p>}

      {/* ----- Nav ----- */}
      <div className="mt-7 flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => go(step - 1)}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-black px-5 py-2.5 rounded-full border border-black/[0.12] hover:border-black/[0.3] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
            Back
          </button>
        ) : (
          <span />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => go(step + 1)}
            disabled={step === 1 ? !step1Valid : !step2Valid}
            className="inline-flex items-center gap-2 bg-[#FA008C] text-white text-[13px] font-medium px-6 py-2.5 rounded-full hover:bg-[#d1007a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={status === "submitting"}
            className="inline-flex items-center gap-2 bg-[#FA008C] text-white text-[13px] font-medium px-6 py-2.5 rounded-full hover:bg-[#d1007a] disabled:opacity-60 transition-colors"
          >
            {status === "submitting" ? "Registering…" : "Register agent"}
            {status !== "submitting" && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            )}
          </button>
        )}
      </div>

      {/* reassurance strip */}
      <div className="mt-6 pt-5 border-t border-black/[0.06] flex flex-wrap items-center gap-x-4 gap-y-2">
        {["Free to list", "No wallet to apply", "~2 min"].map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5 text-[11px] text-[#999]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="#FA008C"><circle cx="6" cy="6" r="6" /><path d="M3.5 6l1.5 1.5 3-3.5" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

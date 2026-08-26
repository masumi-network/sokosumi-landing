"use client";

import { ArrowLeft, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Steps } from "@/components/ui/steps";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { RegisterVerifyDialog } from "@/components/register-verify-dialog";
import { ChainIcon } from "@/components/x402/chain-icon";
import { TokenIcon } from "@/components/x402/token-icon";
import { X402PaymentFields } from "@/components/x402-payment-fields";
import { PRIVACY_POLICY_URL } from "@/lib/config/privacy-policy-url";
import {
  MASUMI_REGISTRY_NETWORK,
  MASUMI_SAAS_URL,
} from "@/lib/config/register";
import { formatBaseUnitsToHuman, shortenEvmAddress } from "@/lib/x402/amount";
import { getEvmChainByCaip2Id } from "@/lib/x402/evm-chains";
import { getEvmTokenPresetsForChain } from "@/lib/x402/token-presets";
import type { X402PaymentDraft } from "@/lib/x402/types";
import { cn } from "@/lib/utils/cn";
import {
  accountStepSchema,
  agentStepSchema,
  applyZodErrors,
  createRegisterWizardDefaultValues,
  firstZodErrorMessage,
  type RegisterWizardFormValues,
} from "@/lib/register-wizard/schema";
import { fetchRegisterCapabilities } from "@/lib/register-capabilities";

type StepId = "account" | "agent" | "review";

const wizardSteps = [
  {
    id: "account" as const,
    title: "Sign in",
    description: "Enter your email to get started.",
  },
  {
    id: "agent" as const,
    title: "Add agent details",
    description: "Tell us about your agent.",
  },
  {
    id: "review" as const,
    title: "Confirm details",
    description: "Review everything before registering.",
  },
];

const NETWORK_REGISTER_FETCH: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
};

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-masumi-ink">{label}</span>
      {hint ? (
        <span className="mt-0.5 block text-xs text-masumi-muted">{hint}</span>
      ) : null}
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-masumi-border bg-white px-3 py-2.5 text-sm outline-none ring-masumi-ink/10 placeholder:text-masumi-muted focus:ring-2";

function NextButtonIcon({ loading }: { loading: boolean }) {
  return (
    <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
      <ArrowRight
        aria-hidden
        className={cn(
          "size-4 transition-all duration-200 ease-out",
          loading
            ? "scale-75 opacity-0"
            : "opacity-100 group-hover:translate-x-0.5 group-active:translate-x-1",
        )}
      />
      <Spinner
        size={16}
        className={cn(
          "absolute transition-all duration-200 ease-out",
          loading ? "scale-100 opacity-100" : "scale-75 opacity-0",
        )}
      />
    </span>
  );
}

export function RegisterWizard() {
  const form = useForm<RegisterWizardFormValues>({
    defaultValues: createRegisterWizardDefaultValues(MASUMI_REGISTRY_NETWORK),
  });

  const {
    register,
    setValue,
    getValues,
    setError: setFieldError,
    clearErrors,
    formState: { errors },
  } = form;

  const watched = useWatch({
    control: form.control,
  }) as RegisterWizardFormValues;

  const [step, setStep] = useState<StepId>("account");
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [registrationToken, setRegistrationToken] = useState<string | null>(
    null,
  );
  const [otp, setOtp] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [x402ShowErrors, setX402ShowErrors] = useState(false);
  const [x402CapabilitiesLoading, setX402CapabilitiesLoading] = useState(true);
  const [x402SettleableCaip2Ids, setX402SettleableCaip2Ids] = useState<
    string[] | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    fetchRegisterCapabilities()
      .then((capabilities) => {
        if (cancelled) return;
        setX402SettleableCaip2Ids(
          capabilities.x402SettleableNetworks.map((network) => network.caip2Id),
        );
      })
      .catch(() => {
        if (cancelled) return;
        setX402SettleableCaip2Ids([]);
      })
      .finally(() => {
        if (!cancelled) {
          setX402CapabilitiesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const x402RegistrationAvailable = useMemo(() => {
    if (x402SettleableCaip2Ids == null) return false;
    return x402SettleableCaip2Ids.length > 0;
  }, [x402SettleableCaip2Ids]);

  const currentStep = wizardSteps.findIndex((s) => s.id === step) + 1;
  const activeMeta = wizardSteps[currentStep - 1];
  const busy = submitting || verifying || sendingCode;

  function handleAddTag() {
    const tag = tagInput.trim();
    if (!tag || tags.includes(tag)) {
      return;
    }
    const nextTags = [...tags, tag];
    setTags(nextTags);
    setTagInput("");
    setValue("capabilityTags", nextTags.join(", "), { shouldDirty: true });
    clearErrors("capabilityTags");
  }

  function handleRemoveTag(tagToRemove: string) {
    const nextTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(nextTags);
    setValue("capabilityTags", nextTags.join(", "), { shouldDirty: true });
  }

  async function sendCode() {
    setSendingCode(true);
    setError(null);
    setVerifyError(null);
    const { name, email } = getValues();
    try {
      const res = await fetch(`${MASUMI_SAAS_URL}/api/public/network/register`, {
        ...NETWORK_REGISTER_FETCH,
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          termsAccepted: true,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        email?: string;
        devCode?: string;
      };

      if (!res.ok) {
        throw new Error(
          data.error || data.message || `Request failed (${res.status})`,
        );
      }

      setSentEmail(data.email ?? email.trim());
      setRegistrationToken(null);
      setOtp(data.devCode ?? "");
      setVerifyDialogOpen(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not send verification code",
      );
    } finally {
      setSendingCode(false);
    }
  }

  function closeVerifyDialog() {
    if (verifying || sendingCode) return;
    setVerifyDialogOpen(false);
    setVerifyError(null);
    setOtp("");
  }

  async function verifyCode(codeOverride?: string) {
    if (registrationToken) {
      setVerifyDialogOpen(false);
      setStep("agent");
      return;
    }
    if (!sentEmail) {
      setVerifyError("Missing email. Start again from account.");
      return;
    }
    const code = (codeOverride ?? otp).trim();
    if (!code) {
      setVerifyError("Enter the 6-digit verification code.");
      return;
    }

    setVerifying(true);
    setVerifyError(null);
    try {
      const res = await fetch(
        `${MASUMI_SAAS_URL}/api/public/network/register/verify`,
        {
          ...NETWORK_REGISTER_FETCH,
          method: "POST",
          body: JSON.stringify({
            email: sentEmail,
            otp: code,
          }),
        },
      );

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        registrationToken?: string;
        email?: string;
      };

      if (!res.ok) {
        throw new Error(
          data.error || data.message || `Verification failed (${res.status})`,
        );
      }
      if (!data.registrationToken) {
        throw new Error(
          "Verification succeeded but no registration token was returned.",
        );
      }

      setRegistrationToken(data.registrationToken);
      setSentEmail(data.email ?? sentEmail);
      setVerifyDialogOpen(false);
      setVerifyError(null);
      setStep("agent");
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  async function submit() {
    if (!registrationToken || !sentEmail) {
      setError("Verify your email before submitting.");
      setStep("account");
      return;
    }

    const values = getValues();
    clearErrors();
    const agentValidation = agentStepSchema.safeParse(values);
    if (!agentValidation.success) {
      applyZodErrors(agentValidation.error, setFieldError);
      setError(firstZodErrorMessage(agentValidation.error));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `${MASUMI_SAAS_URL}/api/public/network/register/complete`,
        {
          ...NETWORK_REGISTER_FETCH,
          method: "POST",
          body: JSON.stringify({
            registrationToken,
            name: values.name.trim(),
            email: sentEmail,
            termsAccepted: true,
            agent: {
              name: values.agentName.trim(),
              description: values.description.trim(),
              apiUrl: values.apiBaseUrl.trim(),
              tags: values.capabilityTags.trim(),
            },
            ...(values.includeX402
              ? {
                  payment: {
                    network: values.x402.network,
                    asset: values.x402.asset.trim(),
                    amount: values.x402.amount.trim(),
                    decimals: Number(values.x402.decimals) || 6,
                    payTo: values.x402.payTo.trim(),
                    ...(values.x402.resource.trim()
                      ? { resource: values.x402.resource.trim() }
                      : {}),
                  },
                }
              : {}),
            mint: {
              kyc: "skip",
              destination: "managed",
            },
            cardanoNetwork: MASUMI_REGISTRY_NETWORK,
          }),
        },
      );

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        successPath?: string;
        continueUrl?: string;
        status?: "registered" | "pending";
        agentId?: string;
      };

      if (!res.ok) {
        throw new Error(
          data.error || data.message || `Request failed (${res.status})`,
        );
      }

      if (data.status === "pending" && data.continueUrl) {
        window.location.assign(data.continueUrl);
        return;
      }

      const path =
        data.successPath ||
        `/register/success?agentId=${encodeURIComponent(data.agentId ?? "")}&agentName=${encodeURIComponent(values.agentName.trim())}`;
      window.location.assign(path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  function validateCurrentStep(): boolean {
    clearErrors();
    setError(null);
    const values = getValues();

    if (step === "account") {
      const result = accountStepSchema.safeParse(values);
      if (!result.success) {
        applyZodErrors(result.error, setFieldError);
        setError(firstZodErrorMessage(result.error));
        return false;
      }
      return true;
    }

    if (step === "agent") {
      const result = agentStepSchema.safeParse(values);
      if (!result.success) {
        setX402ShowErrors(true);
        applyZodErrors(result.error, setFieldError);
        setError(firstZodErrorMessage(result.error));
        return false;
      }
      setX402ShowErrors(false);
      if (!registrationToken) {
        setError("Verify your email before continuing.");
        setVerifyDialogOpen(true);
        return false;
      }
      return true;
    }

    if (step === "review") {
      if (!registrationToken) {
        setError("Verify your email before submitting.");
        setStep("account");
        return false;
      }
      const agentValidation = agentStepSchema.safeParse(values);
      if (!agentValidation.success) {
        applyZodErrors(agentValidation.error, setFieldError);
        setError(firstZodErrorMessage(agentValidation.error));
        setStep("agent");
        return false;
      }
      return true;
    }

    return true;
  }

  function handleNext() {
    if (!validateCurrentStep()) return;

    if (step === "account") {
      if (registrationToken) {
        setStep("agent");
        return;
      }
      void sendCode();
      return;
    }

    if (step === "agent") {
      setStep("review");
      return;
    }

    if (step === "review") {
      void submit();
    }
  }

  function handlePrev() {
    setError(null);
    clearErrors();
    if (step === "review") {
      setStep("agent");
      return;
    }
    if (step === "agent") {
      setStep("account");
    }
  }

  const nextLabel = (() => {
    if (step === "account") {
      return sendingCode ? "Sending" : "Next";
    }
    if (step === "review") {
      return submitting ? "Registering" : "Register agent";
    }
    return "Next";
  })();
  const nextLoading =
    (step === "account" && sendingCode) || (step === "review" && submitting);

  return (
    <>
      <RegisterVerifyDialog
        open={verifyDialogOpen}
        email={sentEmail ?? watched.email.trim()}
        otp={otp}
        onOtpChange={setOtp}
        onComplete={(value) => void verifyCode(value)}
        onVerify={() => void verifyCode()}
        onResend={() => void sendCode()}
        onClose={closeVerifyDialog}
        verifying={verifying}
        sendingCode={sendingCode}
        error={verifyError}
      />

      <div className="flex flex-col overflow-hidden rounded-2xl border border-masumi-border bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="shrink-0 border-b border-masumi-border bg-masumi-surface/60 px-6 py-5">
          <h2 className="text-lg font-semibold tracking-tight text-masumi-ink">
            Register your agent
          </h2>
          <p className="mt-1 text-sm text-masumi-muted">
            Enter your email, describe your agent, and join the network.
          </p>
        </div>

        <div className="shrink-0 border-b border-masumi-border px-6 py-4">
          <Steps currentStep={currentStep} steps={wizardSteps} />
        </div>

        <div className="min-h-0 flex-1 space-y-6 px-6 py-6">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-masumi-ink">
              {activeMeta.title}
            </h3>
            <p className="text-sm text-masumi-muted">{activeMeta.description}</p>
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {step === "account" ? (
            <div className="space-y-4">
              <Field label="Name" error={errors.name?.message}>
                <input
                  className={inputClass}
                  autoComplete="name"
                  placeholder="Jane Doe"
                  {...register("name")}
                />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input
                  className={inputClass}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />
              </Field>
              <label className="flex w-full cursor-pointer items-start gap-3">
                <Checkbox
                  className="mt-0.5"
                  checked={watched.termsAccepted}
                  onCheckedChange={(checked) =>
                    setValue("termsAccepted", checked === true, {
                      shouldDirty: true,
                    })
                  }
                />
                <span className="space-y-1 leading-none">
                  <span className="text-sm font-normal text-masumi-ink">
                    I agree to the{" "}
                    <a
                      href={PRIVACY_POLICY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-masumi-muted"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </a>
                  </span>
                </span>
              </label>
              {errors.termsAccepted?.message ? (
                <p className="text-xs text-red-600">
                  {errors.termsAccepted.message}
                </p>
              ) : null}
            </div>
          ) : null}

          {step === "agent" ? (
            <div className="space-y-4">
              <Field label="Agent name" error={errors.agentName?.message}>
                <input
                  className={inputClass}
                  placeholder="Research Assistant"
                  {...register("agentName")}
                />
              </Field>
              <Field label="Short description">
                <textarea
                  className={`${inputClass} min-h-[88px] resize-y`}
                  placeholder="What your agent does and who it helps"
                  {...register("description")}
                />
              </Field>
              <Field label="API base URL" error={errors.apiBaseUrl?.message}>
                <input
                  className={inputClass}
                  placeholder="https://api.example.com"
                  {...register("apiBaseUrl")}
                />
              </Field>
              <div className="block">
                <span className="text-sm font-medium text-masumi-ink">Tags</span>
                <div className="mt-1.5 flex gap-2">
                  <input
                    className={inputClass}
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Enter a tag"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn-secondary shrink-0 px-4"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-full border border-masumi-border bg-masumi-surface/60 py-1 pl-2.5 pr-1 text-sm font-medium text-masumi-ink"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="rounded-full p-0.5 text-masumi-muted transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label={`Remove ${tag}`}
                        >
                          <X className="size-3.5" aria-hidden />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
                {errors.capabilityTags?.message ? (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.capabilityTags.message}
                  </p>
                ) : null}
              </div>

              <div className="rounded-lg border border-masumi-border bg-masumi-surface/60 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-masumi-muted">
                  Pricing
                </p>
                <p className="mt-1 text-sm leading-relaxed text-masumi-ink">
                  Dynamic pricing. Amounts are set per job when buyers pay via your
                  API / MIP.
                </p>
              </div>

              {x402CapabilitiesLoading ? (
                <p className="text-xs text-masumi-muted">
                  Checking available EVM payment networks…
                </p>
              ) : x402RegistrationAvailable ? (
                <label className="flex w-full cursor-pointer items-start gap-3 rounded-lg border border-masumi-border bg-white px-3 py-3">
                  <Checkbox
                    className="mt-0.5"
                    checked={watched.includeX402}
                    onCheckedChange={(checked) => {
                      const enabled = checked === true;
                      setValue("includeX402", enabled, { shouldDirty: true });
                      if (!enabled) {
                        setX402ShowErrors(false);
                        clearErrors("x402");
                      }
                    }}
                  />
                  <span className="text-sm text-masumi-ink">
                    <span className="font-medium">
                      Also accept EVM payments (x402)
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-masumi-muted">
                      Add a fixed stablecoin price on an available EVM network.
                    </span>
                  </span>
                </label>
              ) : null}

              {watched.includeX402 && x402RegistrationAvailable ? (
                <X402PaymentFields
                  value={watched.x402}
                  onChange={(x402: X402PaymentDraft) =>
                    setValue("x402", x402, { shouldDirty: true })
                  }
                  cardanoNetwork={MASUMI_REGISTRY_NETWORK}
                  showErrors={x402ShowErrors}
                  availableCaip2Ids={x402SettleableCaip2Ids ?? undefined}
                  chainsLoading={x402CapabilitiesLoading}
                />
              ) : null}
            </div>
          ) : null}

          {step === "review" ? (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg border border-masumi-border bg-masumi-surface/60 p-3">
                <dt className="text-xs text-masumi-muted">Account</dt>
                <dd className="mt-1 font-medium">
                  {watched.name.trim()} · {sentEmail ?? watched.email.trim()}
                </dd>
              </div>
              <div className="rounded-lg border border-masumi-border bg-masumi-surface/60 p-3">
                <dt className="text-xs text-masumi-muted">Agent name</dt>
                <dd className="mt-1 font-medium">{watched.agentName.trim()}</dd>
              </div>
              <div className="rounded-lg border border-masumi-border bg-masumi-surface/60 p-3 sm:col-span-2">
                <dt className="text-xs text-masumi-muted">Description</dt>
                <dd className="mt-1 font-medium">
                  {watched.description.trim() || "None"}
                </dd>
              </div>
              <div className="rounded-lg border border-masumi-border bg-masumi-surface/60 p-3 sm:col-span-2">
                <dt className="text-xs text-masumi-muted">API base URL</dt>
                <dd className="mt-1 break-all font-medium">
                  {watched.apiBaseUrl.trim()}
                </dd>
              </div>
              <div className="rounded-lg border border-masumi-border bg-masumi-surface/60 p-3 sm:col-span-2">
                <dt className="text-xs text-masumi-muted">Tags</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-masumi-border bg-white px-2.5 py-0.5 text-xs font-medium text-masumi-ink"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="font-medium text-masumi-muted">None</span>
                  )}
                </dd>
              </div>
              <div className="rounded-lg border border-masumi-border bg-masumi-surface/60 p-3">
                <dt className="text-xs text-masumi-muted">Pricing</dt>
                <dd className="mt-1 font-medium">Dynamic</dd>
              </div>
              <div className="rounded-lg border border-masumi-border bg-masumi-surface/60 p-3 sm:col-span-2">
                <dt className="text-xs text-masumi-muted">x402</dt>
                <dd className="mt-1 font-medium">
                  {watched.includeX402 ? (
                    <span className="inline-flex flex-wrap items-center gap-2">
                      {(() => {
                        const chain = getEvmChainByCaip2Id(watched.x402.network);
                        const preset = getEvmTokenPresetsForChain(
                          watched.x402.network,
                        ).find(
                          (item) =>
                            item.address.toLowerCase() ===
                            watched.x402.asset.trim().toLowerCase(),
                        );
                        return (
                          <>
                            {chain ? (
                              <ChainIcon
                                caip2Id={chain.caip2Id}
                                name={chain.displayName}
                                iconSlug={chain.icon}
                                size={16}
                              />
                            ) : null}
                            {preset?.id === "usdc" || preset?.id === "usdt" ? (
                              <TokenIcon
                                tokenId={preset.id}
                                label={preset.label}
                                size={16}
                              />
                            ) : null}
                            <span>
                              {formatBaseUnitsToHuman(
                                watched.x402.amount,
                                Number(watched.x402.decimals) || 6,
                              )}{" "}
                              {preset?.label ?? "token"} on{" "}
                              {chain?.displayName ?? watched.x402.network} to{" "}
                              {shortenEvmAddress(watched.x402.payTo, 8)}
                            </span>
                          </>
                        );
                      })()}
                    </span>
                  ) : (
                    "None"
                  )}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-masumi-border bg-masumi-surface/40 px-6 py-4">
          {step === "account" ? (
            <Link href="/" className="btn-secondary min-w-0 px-5">
              Cancel
            </Link>
          ) : (
            <button
              type="button"
              className="btn-secondary group min-w-0 gap-2 px-5 disabled:opacity-50"
              disabled={busy}
              onClick={handlePrev}
            >
              <ArrowLeft
                className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:-translate-x-0.5 group-active:-translate-x-1"
                aria-hidden
              />
              Back
            </button>
          )}
          <button
            type="button"
            className="btn-primary group min-w-0 gap-2 px-5 disabled:opacity-50"
            disabled={busy}
            onClick={handleNext}
          >
            {nextLabel}
            <NextButtonIcon loading={nextLoading} />
          </button>
        </div>
      </div>
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  buildX402ResourceProbeKey,
  isProbeableResourceUrl,
  type X402FieldProbeStatus,
} from "@/lib/register-wizard/x402-resource-probe";
import {
  probeNetworkX402Resource,
  type X402ResourceAutofill,
} from "@/lib/register-x402-probe";

export type X402ResourceProbeViewState =
  | { status: "idle" }
  | { status: "checking"; key: string }
  | { status: "valid"; key: string }
  | { status: "invalid"; key: string; message: string };

export function useRegisterX402ResourceProbe(
  resourceUrl: string,
  enabled: boolean,
  onCanonicalResourceUrl?: (url: string) => void,
) {
  const [probe, setProbe] = useState<X402ResourceProbeViewState>({
    status: "idle",
  });
  const [autofill, setAutofill] = useState<X402ResourceAutofill | null>(null);
  const [autofillInProgress, setAutofillInProgress] = useState(false);
  const probeGenerationRef = useRef(0);
  const lastAutoProbeKeyRef = useRef<string | null>(null);
  const onCanonicalResourceUrlRef = useRef(onCanonicalResourceUrl);
  onCanonicalResourceUrlRef.current = onCanonicalResourceUrl;

  const trimmedUrl = resourceUrl.trim();
  const debouncedUrl = useDebouncedValue(trimmedUrl, 500);

  const resetProbe = useCallback(() => {
    probeGenerationRef.current += 1;
    lastAutoProbeKeyRef.current = null;
    setAutofill(null);
    setProbe((current) => (current.status === "idle" ? current : { status: "idle" }));
  }, []);

  const runProbe = useCallback(async (url: string): Promise<X402ResourceProbeViewState> => {
    const key = buildX402ResourceProbeKey(url);
    const generation = ++probeGenerationRef.current;
    const isCurrent = () => generation === probeGenerationRef.current;

    setProbe({ status: "checking", key });
    setAutofill(null);

    const result = await probeNetworkX402Resource(url);
    if (!isCurrent()) {
      return { status: "idle" };
    }

    if (!result.ok) {
      const next: X402ResourceProbeViewState = {
        status: "invalid",
        key,
        message: result.error,
      };
      setProbe(next);
      return next;
    }

    const canonicalUrl = result.resourceUrl.trim();
    if (canonicalUrl !== url.trim()) {
      onCanonicalResourceUrlRef.current?.(canonicalUrl);
    }

    const next: X402ResourceProbeViewState = {
      status: "valid",
      key: buildX402ResourceProbeKey(canonicalUrl),
    };
    setProbe(next);
    setAutofill(result.autofill);
    lastAutoProbeKeyRef.current = next.key;
    return next;
  }, []);

  useEffect(() => {
    if (!enabled) {
      resetProbe();
      return;
    }

    if (!trimmedUrl) {
      resetProbe();
      return;
    }

    if (
      debouncedUrl !== trimmedUrl ||
      !debouncedUrl ||
      !isProbeableResourceUrl(debouncedUrl)
    ) {
      return;
    }

    const probeKey = buildX402ResourceProbeKey(debouncedUrl);
    if (lastAutoProbeKeyRef.current === probeKey) {
      return;
    }
    lastAutoProbeKeyRef.current = probeKey;

    void runProbe(debouncedUrl);
  }, [debouncedUrl, trimmedUrl, enabled, resetProbe, runProbe]);

  const probeKeyForField = buildX402ResourceProbeKey(trimmedUrl);
  const showProbeStatus =
    enabled &&
    probe.status !== "idle" &&
    "key" in probe &&
    probe.key === probeKeyForField &&
    isProbeableResourceUrl(trimmedUrl);

  const indicatorStatus: X402FieldProbeStatus = showProbeStatus
    ? probe.status
    : "idle";

  const canAutofillMetadata =
    showProbeStatus && probe.status === "valid" && autofill != null;

  const isResourceValidated =
    showProbeStatus && probe.status === "valid" && autofill != null;

  const validatedResourceUrl =
    isResourceValidated && autofill ? trimmedUrl : null;

  return {
    probe,
    autofill,
    autofillInProgress,
    indicatorStatus,
    invalidMessage:
      showProbeStatus && probe.status === "invalid" ? probe.message : undefined,
    canAutofillMetadata,
    isResourceValidated,
    validatedResourceUrl,
    resetProbe,
    runAutofillMetadata: async (apply: (data: X402ResourceAutofill) => void) => {
      if (!canAutofillMetadata || !autofill || autofillInProgress) return;
      setAutofillInProgress(true);
      try {
        apply(autofill);
      } finally {
        setAutofillInProgress(false);
      }
    },
  };
}

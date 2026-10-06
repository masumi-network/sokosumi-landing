import {
  MASUMI_REGISTRY_NETWORK,
  registrationApiUrl,
} from "@/lib/config/register";

export type X402ResourceAutofill = {
  name: string;
  description: string;
  tags: string[];
};

export type NetworkX402ProbeResult =
  | {
      ok: true;
      resourceUrl: string;
      compatible: boolean;
      autofill: X402ResourceAutofill;
    }
  | {
      ok: false;
      error: string;
    };

export async function probeNetworkX402Resource(
  resourceUrl: string,
): Promise<NetworkX402ProbeResult> {
  const trimmed = resourceUrl.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter a resource URL first." };
  }

  try {
    const res = await fetch(registrationApiUrl("/probe"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        resourceUrl: trimmed,
        cardanoNetwork: MASUMI_REGISTRY_NETWORK,
      }),
      signal: AbortSignal.timeout(25_000),
    });

    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
      resourceUrl?: string;
      compatible?: boolean;
      autofill?: X402ResourceAutofill;
    };

    if (!res.ok) {
      return {
        ok: false,
        error: data.error || data.message || `Probe failed (${res.status})`,
      };
    }

    const compatible =
      data.compatible === true ||
      (data.compatible !== false &&
        typeof data.checks === "object" &&
        data.checks !== null &&
        Object.values(data.checks as Record<string, unknown>).every(
          (value) => value === true,
        ));

    if (!compatible) {
      return {
        ok: false,
        error:
          data.error ||
          data.message ||
          "This endpoint did not return a Sokosumi-compatible 402 payment requirement.",
      };
    }

    const autofill = data.autofill;
    if (
      !autofill?.name?.trim() ||
      !Array.isArray(autofill.tags) ||
      autofill.tags.length === 0
    ) {
      return {
        ok: false,
        error: "Could not derive metadata from this resource.",
      };
    }

    return {
      ok: true,
      resourceUrl: data.resourceUrl?.trim() || trimmed,
      compatible: true,
      autofill: {
        name: autofill.name.trim(),
        description: (autofill.description ?? "").trim(),
        tags: autofill.tags.map((tag) => tag.trim()).filter(Boolean),
      },
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return { ok: false, error: "Probe timed out. Try again in a moment." };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Probe failed.",
    };
  }
}

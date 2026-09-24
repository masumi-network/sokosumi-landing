type RegistrationResponse = {
  status?: string;
  agentId?: string;
  agentIdentifier?: string;
  draftId?: string;
  pollToken?: string;
};

/** Build a local destination; API-provided URLs must not redirect the browser. */
export function registrationDestination(
  data: RegistrationResponse,
  agentName: string,
): string {
  const status = data.status ?? "";
  if (status === "pending") {
    if (!data.draftId?.trim() || !data.pollToken?.trim()) {
      throw new Error(
        "Registration started, but status tracking is unavailable. Check your email or contact support before starting again.",
      );
    }
    const params = new URLSearchParams({ agentName });
    params.set("draftId", data.draftId.trim());
    return `/register/success?${params.toString()}`;
  }

  if (status === "registered") {
    if (!data.agentIdentifier?.trim()) {
      throw new Error(
        "The server did not confirm registration. Check your email or contact support before starting again.",
      );
    }
    const params = new URLSearchParams({
      agentName,
      agentIdentifier: data.agentIdentifier.trim(),
    });
    return `/register/success?${params.toString()}`;
  }

  throw new Error(
    "The server did not confirm registration. Check your email or contact support before starting again.",
  );
}

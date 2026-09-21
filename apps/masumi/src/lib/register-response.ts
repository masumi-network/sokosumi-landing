type RegistrationResponse = {
  status?: string;
  agentId?: string;
  draftId?: string;
  pollToken?: string;
};

/** Build a local destination; API-provided URLs must not redirect the browser. */
export function registrationDestination(data: RegistrationResponse, agentName: string): string {
  if (!data.agentId?.trim() || !["registered", "pending"].includes(data.status ?? "")) {
    throw new Error("The server did not confirm registration. Check your email or contact support before starting again.");
  }
  const params = new URLSearchParams({ agentId: data.agentId.trim(), agentName });
  if (data.status === "pending") {
    if (!data.draftId?.trim() || !data.pollToken?.trim()) {
      throw new Error("Registration started, but status tracking is unavailable. Check your email or contact support before starting again.");
    }
    params.set("draftId", data.draftId.trim());
  }
  return `/register/success?${params}`;
}

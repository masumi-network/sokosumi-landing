let guideRequest: Promise<string> | undefined;

// The public brief is shared across tab switches. Failed loads remain retryable.
export function loadAgentGuide(): Promise<string> {
  guideRequest ??= fetch("/token2049/agent-guide.md", { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("Could not load the agent guide.");
      return response.text();
    })
    .catch(error => {
      guideRequest = undefined;
      throw error;
    });
  return guideRequest;
}

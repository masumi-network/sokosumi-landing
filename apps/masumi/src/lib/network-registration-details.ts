export type NetworkRegistrationAgentDetails = {
  name: string;
  description: string | null;
  apiUrl: string;
  tags: string[];
};

const DETAILS_STORAGE_PREFIX = "masumi:network-reg-details:";

export function storeNetworkRegistrationAgentDetails(
  draftId: string | undefined,
  details: NetworkRegistrationAgentDetails,
): void {
  if (typeof window === "undefined") return;
  const key = draftId?.trim()
    ? `${DETAILS_STORAGE_PREFIX}${draftId.trim()}`
    : `${DETAILS_STORAGE_PREFIX}last`;
  try {
    sessionStorage.setItem(key, JSON.stringify(details));
  } catch {
    // Storage may be disabled; success page still shows the agent name.
  }
}

export function readNetworkRegistrationAgentDetails(
  draftId?: string,
): NetworkRegistrationAgentDetails | null {
  if (typeof window === "undefined") return null;
  const keys = [
    ...(draftId?.trim()
      ? [`${DETAILS_STORAGE_PREFIX}${draftId.trim()}`]
      : []),
    `${DETAILS_STORAGE_PREFIX}last`,
  ];
  for (const key of keys) {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as NetworkRegistrationAgentDetails;
      if (
        typeof parsed.name === "string" &&
        typeof parsed.apiUrl === "string" &&
        Array.isArray(parsed.tags)
      ) {
        return {
          name: parsed.name,
          description:
            typeof parsed.description === "string"
              ? parsed.description
              : parsed.description === null
                ? null
                : null,
          apiUrl: parsed.apiUrl,
          tags: parsed.tags.filter((tag) => typeof tag === "string"),
        };
      }
    } catch {
      continue;
    }
  }
  return null;
}

export function clearNetworkRegistrationAgentDetails(draftId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(`${DETAILS_STORAGE_PREFIX}${draftId.trim()}`);
  } catch {
    // ignore
  }
}

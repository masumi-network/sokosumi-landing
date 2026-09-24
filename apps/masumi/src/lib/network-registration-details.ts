export type NetworkRegistrationAgentDetails = {
  name: string;
  description: string | null;
  apiUrl: string;
  tags: string[];
};

const DETAILS_STORAGE_PREFIX = "masumi:network-reg-details:";
const LAST_DETAILS_KEY = `${DETAILS_STORAGE_PREFIX}last`;

function draftDetailsKey(draftId: string): string {
  return `${DETAILS_STORAGE_PREFIX}${draftId.trim()}`;
}

function agentDetailsKey(agentIdentifier: string): string {
  return `${DETAILS_STORAGE_PREFIX}agent:${agentIdentifier.trim()}`;
}

function writeNetworkRegistrationAgentDetails(
  key: string,
  details: NetworkRegistrationAgentDetails,
): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(details));
  } catch {
    // Storage may be disabled; success page still shows the agent name.
  }
}

function parseStoredDetails(
  raw: string,
): NetworkRegistrationAgentDetails | null {
  try {
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
    // ignore
  }
  return null;
}

export function storeNetworkRegistrationAgentDetails(
  draftId: string | undefined,
  details: NetworkRegistrationAgentDetails,
): void {
  if (typeof window === "undefined") return;
  if (draftId?.trim()) {
    writeNetworkRegistrationAgentDetails(draftDetailsKey(draftId), details);
  }
  writeNetworkRegistrationAgentDetails(LAST_DETAILS_KEY, details);
}

/** Persist details for reload/share after the success URL drops draftId. */
export function storeNetworkRegistrationAgentDetailsForAgent(
  agentIdentifier: string,
  details: NetworkRegistrationAgentDetails,
): void {
  if (typeof window === "undefined") return;
  const trimmed = agentIdentifier.trim();
  if (!trimmed) return;
  writeNetworkRegistrationAgentDetails(agentDetailsKey(trimmed), details);
  writeNetworkRegistrationAgentDetails(LAST_DETAILS_KEY, details);
}

export type ReadNetworkRegistrationAgentDetailsParams = {
  draftId?: string;
  agentIdentifier?: string;
};

export function readNetworkRegistrationAgentDetails(
  params?: ReadNetworkRegistrationAgentDetailsParams | string,
): NetworkRegistrationAgentDetails | null {
  if (typeof window === "undefined") return null;

  const draftId =
    typeof params === "string"
      ? params
      : params?.draftId?.trim() || undefined;
  const agentIdentifier =
    typeof params === "string"
      ? undefined
      : params?.agentIdentifier?.trim() || undefined;

  const keys: string[] = [];
  if (draftId) keys.push(draftDetailsKey(draftId));
  if (agentIdentifier) keys.push(agentDetailsKey(agentIdentifier));
  keys.push(LAST_DETAILS_KEY);

  for (const key of keys) {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) continue;
      const parsed = parseStoredDetails(raw);
      if (parsed) return parsed;
    } catch {
      continue;
    }
  }
  return null;
}

export function clearNetworkRegistrationAgentDetails(draftId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(draftDetailsKey(draftId));
  } catch {
    // ignore
  }
}

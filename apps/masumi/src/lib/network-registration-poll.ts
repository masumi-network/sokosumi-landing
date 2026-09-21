const POLL_STORAGE_PREFIX = "masumi:network-reg-poll:";

export function storeNetworkRegistrationPollToken(
  draftId: string,
  pollToken: string,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    `${POLL_STORAGE_PREFIX}${draftId.trim()}`,
    pollToken.trim(),
  );
}

export function readNetworkRegistrationPollToken(draftId: string): string {
  if (typeof window === "undefined") return "";
  try {
    return (
      sessionStorage.getItem(`${POLL_STORAGE_PREFIX}${draftId.trim()}`)?.trim() ??
      ""
    );
  } catch {
    return "";
  }
}

export function clearNetworkRegistrationPollToken(draftId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(`${POLL_STORAGE_PREFIX}${draftId.trim()}`);
  } catch {
    // Storage may be disabled; successful registration must still be displayed.
  }
}

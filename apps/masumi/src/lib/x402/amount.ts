const HUMAN_AMOUNT = /^\d+(\.\d+)?$/;

export function parseHumanAmountToBaseUnits(
  humanAmount: string,
  decimals: number,
): string | null {
  const normalized = humanAmount.trim();
  if (!normalized || !HUMAN_AMOUNT.test(normalized)) return null;

  const [wholeRaw, fractionRaw = ""] = normalized.split(".");
  const whole = wholeRaw.replace(/^0+(?=\d)/, "") || "0";
  if (fractionRaw.length > decimals) return null;

  const fraction = fractionRaw.padEnd(decimals, "0");
  const combined = `${whole}${fraction}`.replace(/^0+(?=\d)/, "");
  if (!combined || combined === "0") return null;
  return combined;
}

export function formatBaseUnitsToHuman(
  baseUnits: string,
  decimals: number,
): string {
  const trimmed = baseUnits.trim();
  if (!/^\d+$/.test(trimmed) || decimals <= 0) return trimmed;

  const padded = trimmed.padStart(decimals + 1, "0");
  const whole = padded.slice(0, -decimals) || "0";
  const fraction = padded.slice(-decimals).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}

export function shortenEvmAddress(address: string, chars = 6): string {
  const trimmed = address.trim();
  if (trimmed.length <= 2 + chars * 2) return trimmed;
  return `${trimmed.slice(0, 2 + chars)}…${trimmed.slice(-chars)}`;
}

export function shortenBech32Address(
  address: string,
  head = 14,
  tail = 8,
): string {
  const trimmed = address.trim();
  if (trimmed.length <= head + tail + 1) return trimmed;
  return `${trimmed.slice(0, head)}…${trimmed.slice(-tail)}`;
}

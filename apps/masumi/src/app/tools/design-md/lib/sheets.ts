import * as crypto from "node:crypto";

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

let cachedToken: { token: string; expiresAt: number } | null = null;

function loadServiceAccount(): ServiceAccount | null {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  if (!b64) return null;
  try {
    const json = Buffer.from(b64, "base64").toString("utf-8");
    const parsed = JSON.parse(json);
    if (!parsed.client_email || !parsed.private_key) return null;
    return parsed as ServiceAccount;
  } catch {
    return null;
  }
}

async function getAccessToken(sa: ServiceAccount, scope: string): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }
  const now = Math.floor(Date.now() / 1000);
  const tokenUri = sa.token_uri ?? "https://oauth2.googleapis.com/token";
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    scope,
    aud: tokenUri,
    exp: now + 3600,
    iat: now,
  };
  const b64url = (o: object) =>
    Buffer.from(JSON.stringify(o)).toString("base64url");
  const toSign = `${b64url(header)}.${b64url(payload)}`;
  const sig = crypto
    .sign("RSA-SHA256", Buffer.from(toSign), sa.private_key)
    .toString("base64url");
  const jwt = `${toSign}.${sig}`;

  const res = await fetch(tokenUri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`Google token fetch failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

async function getValues(
  token: string,
  sheetId: string,
  range: string,
): Promise<string[][] | null> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { values?: string[][] };
  return data.values ?? null;
}

async function append(
  token: string,
  sheetId: string,
  range: string,
  values: string[][],
): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ values }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(
      `Sheet append failed: ${res.status} ${await res.text().catch(() => "")}`,
    );
  }
}

export type LeadRow = {
  timestamp: string;
  email: string;
  websiteUrl: string;
  source: string;
  ip: string;
  userAgent: string;
  referer: string;
};

const HEADERS = [
  "Timestamp",
  "Email",
  "Website",
  "Source",
  "IP",
  "User-Agent",
  "Referer",
];

/**
 * Append a lead row to the configured Google Sheet tab. Returns true on
 * success, false on misconfiguration (no env vars), throws on API failure.
 */
export async function appendLead(row: LeadRow): Promise<boolean> {
  const sa = loadServiceAccount();
  const sheetId = process.env.SIGNUPS_SHEET_ID;
  const tabName = process.env.SIGNUPS_SHEET_TAB_NAME;

  if (!sa || !sheetId || !tabName) return false;

  const token = await getAccessToken(
    sa,
    "https://www.googleapis.com/auth/spreadsheets",
  );

  // Bootstrap headers if the tab is empty
  const existing = await getValues(token, sheetId, `${tabName}!A1:G1`);
  if (!existing || existing.length === 0) {
    await append(token, sheetId, `${tabName}!A1`, [HEADERS]);
  }

  await append(token, sheetId, `${tabName}!A:G`, [
    [
      row.timestamp,
      row.email,
      row.websiteUrl,
      row.source,
      row.ip,
      row.userAgent,
      row.referer,
    ],
  ]);

  return true;
}

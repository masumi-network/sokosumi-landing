export type NoriPaymentStatus =
  | 'payment_created'
  | 'purchase_created'
  | 'funds_locking'
  | 'funds_locked'
  | 'result_submitted'
  | 'failed'
  | 'configuration_missing';

export interface MasumiPaymentPayload {
  id?: string;
  blockchainIdentifier?: string;
  agentIdentifier?: string;
  sellerVkey?: string;
  payByTime?: string | number;
  submitResultTime?: string | number;
  unlockTime?: string | number;
  externalDisputeUnlockTime?: string | number;
  inputHash?: string;
  identifierFromPurchaser?: string;
  Amounts?: unknown;
  PaymentSource?: {
    network?: string;
    smartContractAddress?: string;
    policyId?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface NoriPaymentSession {
  sessionId: string;
  taskId?: string;
  eventId?: string;
  paymentId?: string;
  purchaseId?: string;
  blockchainIdentifier: string;
  agentIdentifier?: string;
  network: string;
  status: NoriPaymentStatus;
  createdAt: string;
  updatedAt: string;
  masumiPayment: MasumiPaymentPayload;
  agentRegistry?: NoriAgentRegistryStatus;
  explorerLinks?: NoriExplorerLinks;
  smartContractAddress?: string;
  policyId?: string;
  purchase?: unknown;
  onChainState?: string;
  requestedAction?: string;
  errorType?: string;
  errorNote?: string;
  txHash?: string;
  resultHash?: string;
}

export interface NoriAgentRegistryStatus {
  verified: boolean;
  source: 'payment-service-registry';
  name?: string;
  status?: string;
  apiBaseUrl?: string;
  agentIdentifier?: string;
  error?: string;
}

export interface NoriExplorerLinks {
  masumiExplorer: string;
  transaction?: string;
  agentAsset?: string;
  contractAddress?: string;
}

export class NoriPaymentError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 500, details?: unknown) {
    super(message);
    this.name = 'NoriPaymentError';
    this.status = status;
    this.details = details;
  }
}

interface CompletePaymentInput {
  taskId?: string;
  eventId?: string;
  masumiPayment: MasumiPaymentPayload;
}

interface PaymentConfig {
  apiUrl: string;
  apiKey: string;
  network: string;
  requestTimeoutMs: number;
}

const REGISTRY_LOOKUP_MAX_PAGES = 100;
const DEFAULT_PAYMENT_REQUEST_TIMEOUT_MS = 20_000;
const MAX_PAYMENT_REQUEST_TIMEOUT_MS = 120_000;

const globalForNoriPayments = globalThis as typeof globalThis & {
  __masumiDocsNoriPaymentSessions?: Map<string, NoriPaymentSession>;
  __masumiDocsNoriPaymentCompletions?: Map<string, Promise<NoriPaymentSession>>;
};

function sessionStore() {
  globalForNoriPayments.__masumiDocsNoriPaymentSessions ??= new Map<string, NoriPaymentSession>();
  return globalForNoriPayments.__masumiDocsNoriPaymentSessions;
}

function completionStore() {
  globalForNoriPayments.__masumiDocsNoriPaymentCompletions ??= new Map<string, Promise<NoriPaymentSession>>();
  return globalForNoriPayments.__masumiDocsNoriPaymentCompletions;
}

function now() {
  return new Date().toISOString();
}

function stringValue(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function requireString(value: unknown, label: string) {
  const text = stringValue(value);
  if (!text) throw new NoriPaymentError(`Nori payment request is missing ${label}.`, 400);
  return text;
}

function normalizeApiUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/api/v1')) return trimmed;
  if (trimmed.endsWith('/api')) return `${trimmed}/v1`;
  return `${trimmed}/api/v1`;
}

function paymentRequestTimeoutMs() {
  const configured = Number.parseInt(process.env.MASUMI_PAYMENT_REQUEST_TIMEOUT_MS ?? '', 10);
  if (!Number.isFinite(configured) || configured <= 0) return DEFAULT_PAYMENT_REQUEST_TIMEOUT_MS;
  return Math.min(configured, MAX_PAYMENT_REQUEST_TIMEOUT_MS);
}

function getPaymentConfig(): PaymentConfig {
  const apiUrl = process.env.MASUMI_PAYMENT_API_URL;
  const apiKey = process.env.MASUMI_PAYMENT_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new NoriPaymentError(
      'Masumi payment completion is not configured. Set MASUMI_PAYMENT_API_URL and MASUMI_PAYMENT_API_KEY.',
      503,
    );
  }

  return {
    apiUrl: normalizeApiUrl(apiUrl),
    apiKey,
    network: process.env.MASUMI_NETWORK || 'Preprod',
    requestTimeoutMs: paymentRequestTimeoutMs(),
  };
}

function cardanoExplorerBase(network: string) {
  return network.toLowerCase() === 'mainnet' ? 'https://cexplorer.io' : 'https://preprod.cexplorer.io';
}

function buildExplorerLinks(input: {
  network: string;
  txHash?: string;
  agentIdentifier?: string;
  smartContractAddress?: string;
}): NoriExplorerLinks {
  const base = cardanoExplorerBase(input.network);
  return {
    masumiExplorer: 'https://www.masumi.network/explorer',
    ...(input.txHash ? { transaction: `${base}/tx/${encodeURIComponent(input.txHash)}` } : {}),
    ...(input.agentIdentifier ? { agentAsset: `${base}/asset/${encodeURIComponent(input.agentIdentifier)}` } : {}),
    ...(input.smartContractAddress ? { contractAddress: `${base}/address/${encodeURIComponent(input.smartContractAddress)}` } : {}),
  };
}

async function parsePaymentResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function unwrapPayload(payload: unknown) {
  if (!payload || typeof payload !== 'object') return payload;
  const record = payload as Record<string, unknown>;
  return record.data ?? payload;
}

async function paymentRequest(path: string, init: { method?: string; body?: unknown }) {
  const config = getPaymentConfig();
  let response: Response;

  try {
    response = await fetch(`${config.apiUrl}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        token: config.apiKey,
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: 'no-store',
      signal: AbortSignal.timeout(config.requestTimeoutMs),
    });
  } catch (error) {
    const timedOut =
      error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
    throw new NoriPaymentError(
      timedOut
        ? `Masumi payment service timed out after ${config.requestTimeoutMs}ms.`
        : 'Masumi payment service could not be reached.',
      timedOut ? 504 : 502,
      error instanceof Error ? { name: error.name, message: error.message } : undefined,
    );
  }

  const payload = await parsePaymentResponse(response);

  if (!response.ok) {
    const detail =
      typeof payload === 'string'
        ? payload
        : payload && typeof payload === 'object'
          ? JSON.stringify(payload).slice(0, 500)
          : '';
    throw new NoriPaymentError(
      `Masumi payment service returned ${response.status}${detail ? `: ${detail}` : ''}`,
      response.status,
      payload,
    );
  }

  return unwrapPayload(payload);
}

async function findRegistryAsset(input: {
  network: string;
  smartContractAddress?: string;
  matches: (asset: Record<string, unknown>) => boolean;
}) {
  const seenCursors = new Set<string>();
  let cursorId = '';

  for (let page = 0; page < REGISTRY_LOOKUP_MAX_PAGES; page += 1) {
    const params = new URLSearchParams({ network: input.network });
    if (input.smartContractAddress) {
      params.set('filterSmartContractAddress', input.smartContractAddress);
    }
    if (cursorId) params.set('cursorId', cursorId);

    const payload = await paymentRequest(`/registry/?${params.toString()}`, { method: 'GET' });
    const data = recordFromUnknown(payload);
    const assets = (Array.isArray(data.Assets) ? data.Assets : []).map((asset) => recordFromUnknown(asset));
    const match = assets.find(input.matches);
    if (match) return match;
    if (assets.length === 0) return undefined;

    const nextCursor = stringValue(assets.at(-1)?.id);
    if (!nextCursor) {
      throw new NoriPaymentError('Masumi registry returned a non-empty page without a cursor.', 502);
    }
    if (seenCursors.has(nextCursor)) {
      throw new NoriPaymentError(`Masumi registry repeated cursor ${nextCursor}.`, 502);
    }
    seenCursors.add(nextCursor);
    cursorId = nextCursor;
  }

  throw new NoriPaymentError(
    `Masumi registry lookup exceeded ${REGISTRY_LOOKUP_MAX_PAGES} pages before reaching the end.`,
    502,
  );
}

async function verifyAgentRegistration(input: {
  agentIdentifier: string;
  network: string;
  smartContractAddress?: string;
}): Promise<NoriAgentRegistryStatus> {
  try {
    const match = await findRegistryAsset({
      network: input.network,
      smartContractAddress: input.smartContractAddress,
      matches: (asset) => stringValue(asset.agentIdentifier) === input.agentIdentifier,
    });

    if (!match) {
      return {
        verified: false,
        source: 'payment-service-registry',
        error: 'Agent identifier was not found in the payment service registry response.',
      };
    }

    return {
      verified: true,
      source: 'payment-service-registry',
      name: stringValue(match.name) || undefined,
      status: stringValue(match.status) || stringValue(match.state) || undefined,
      apiBaseUrl: stringValue(match.apiBaseUrl) || undefined,
      agentIdentifier: stringValue(match.agentIdentifier) || undefined,
    };
  } catch (error) {
    if (error instanceof NoriPaymentError) throw error;
    return {
      verified: false,
      source: 'payment-service-registry',
      error: error instanceof Error ? error.message : 'Agent registry lookup failed.',
    };
  }
}

function recordFromUnknown(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export interface NoriAgentIdentity {
  verified: boolean;
  agentIdentifier?: string;
  name?: string;
  status?: string;
  apiBaseUrl?: string;
  policyId?: string;
  smartContractAddress?: string;
  network: string;
  explorerLinks?: NoriExplorerLinks;
  error?: string;
}

let identityCache: { value: NoriAgentIdentity; expiresAt: number } | null = null;

function urlHost(value: string) {
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Looks Nori up in the live Masumi payment-service registry so the docs can
 * present her verified on-chain identity before any task is started.
 * The registry asset is matched by the NORI_AGENT_URL host, falling back to
 * the agent name.
 */
export async function lookupNoriAgentIdentity(): Promise<NoriAgentIdentity> {
  if (identityCache && identityCache.expiresAt > Date.now()) return identityCache.value;

  const config = getPaymentConfig();
  const configuredAgentIdentifier = stringValue(
    process.env.NORI_AGENT_IDENTIFIER || process.env.MASUMI_AGENT_IDENTIFIER,
  );
  const noriHost = urlHost(process.env.NORI_AGENT_URL ?? '');
  const matchesNori = configuredAgentIdentifier
    ? (asset: Record<string, unknown>) =>
        stringValue(asset.agentIdentifier) === configuredAgentIdentifier
    : noriHost
      ? (asset: Record<string, unknown>) => urlHost(stringValue(asset.apiBaseUrl)) === noriHost
      : (asset: Record<string, unknown>) => stringValue(asset.name).toLowerCase().includes('nori');
  const match = await findRegistryAsset({
    network: config.network,
    matches: matchesNori,
  });

  let identity: NoriAgentIdentity;
  if (!match) {
    identity = {
      verified: false,
      network: config.network,
      error: 'Nori was not found in the Masumi payment-service registry.',
    };
  } else {
    const agentIdentifier = stringValue(match.agentIdentifier) || undefined;
    const paymentSource = recordFromUnknown(match.PaymentSource);
    const smartContractAddress =
      stringValue(match.smartContractAddress) || stringValue(paymentSource.smartContractAddress) || undefined;
    identity = {
      verified: true,
      agentIdentifier,
      name: stringValue(match.name) || undefined,
      status: stringValue(match.status) || stringValue(match.state) || undefined,
      apiBaseUrl: stringValue(match.apiBaseUrl) || undefined,
      policyId: stringValue(match.agentPolicyId) || stringValue(match.policyId) || stringValue(paymentSource.policyId) || undefined,
      smartContractAddress,
      network: config.network,
      explorerLinks: buildExplorerLinks({
        network: config.network,
        agentIdentifier,
        smartContractAddress,
      }),
    };
  }

  identityCache = {
    value: identity,
    expiresAt: Date.now() + (identity.verified ? 5 * 60 * 1000 : 30 * 1000),
  };
  return identity;
}

function findStoredSession(input: { sessionId?: string; taskId?: string; blockchainIdentifier?: string }) {
  const store = sessionStore();

  if (input.sessionId) {
    const direct = store.get(input.sessionId);
    if (direct) return direct;
  }

  if (input.blockchainIdentifier) {
    for (const session of store.values()) {
      if (session.blockchainIdentifier === input.blockchainIdentifier) return session;
    }
    return null;
  }

  if (input.taskId) {
    for (const session of store.values()) {
      if (session.taskId === input.taskId) return session;
    }
  }

  return null;
}

function mapPurchaseStatus(purchase: Record<string, unknown>): NoriPaymentStatus {
  const nextAction = recordFromUnknown(purchase.NextAction);
  const currentTransaction = recordFromUnknown(purchase.CurrentTransaction);
  const onChainState = stringValue(purchase.onChainState);
  const requestedAction = stringValue(nextAction.requestedAction);
  const errorType = stringValue(nextAction.errorType);
  const transactionStatus = stringValue(currentTransaction.status);

  if (errorType) return 'failed';
  if (onChainState === 'FundsOrDatumInvalid') return 'failed';
  if (['RefundRequested', 'Disputed', 'RefundWithdrawn', 'DisputedWithdrawn'].includes(onChainState)) return 'failed';
  if (transactionStatus === 'FailedViaTimeout' || transactionStatus === 'RolledBack') return 'failed';
  if (onChainState === 'ResultSubmitted') return 'result_submitted';
  if (onChainState === 'Withdrawn') return 'result_submitted';
  if (onChainState === 'FundsLocked') return 'funds_locked';
  if (requestedAction.includes('FundsLocking')) return 'funds_locking';
  return 'purchase_created';
}

function purchaseFailureNote(purchase: Record<string, unknown>) {
  const nextAction = recordFromUnknown(purchase.NextAction);
  const currentTransaction = recordFromUnknown(purchase.CurrentTransaction);
  const errorType = stringValue(nextAction.errorType);
  const errorNote = stringValue(nextAction.errorNote);
  const onChainState = stringValue(purchase.onChainState);
  const transactionStatus = stringValue(currentTransaction.status);

  if (errorNote) return errorNote;
  if (errorType === 'InsufficientFunds') {
    return 'The Nori purchasing wallet has insufficient funds for this payment. Top up its Preprod ADA and requested token balance before retrying.';
  }
  if (errorType) return `Masumi payment service reported ${errorType}.`;
  if (onChainState === 'FundsOrDatumInvalid') {
    return 'The funds or payment datum did not match the requested purchase.';
  }
  if (transactionStatus === 'FailedViaTimeout' || transactionStatus === 'RolledBack') {
    return `The Cardano transaction ended with status ${transactionStatus}.`;
  }
  if (['RefundRequested', 'Disputed', 'RefundWithdrawn', 'DisputedWithdrawn'].includes(onChainState)) {
    return `The purchase entered terminal state ${onChainState}.`;
  }
  return '';
}

function applyPurchaseToSession(session: NoriPaymentSession, purchaseValue: unknown): NoriPaymentSession {
  const purchase = recordFromUnknown(purchaseValue);
  const nextAction = recordFromUnknown(purchase.NextAction);
  const currentTransaction = recordFromUnknown(purchase.CurrentTransaction);
  const status = mapPurchaseStatus(purchase);
  const txHash = stringValue(currentTransaction.txHash) || stringValue(currentTransaction.hash) || session.txHash;
  const resultHash = stringValue(purchase.resultHash) || stringValue(nextAction.resultHash) || session.resultHash;
  const updated: NoriPaymentSession = {
    ...session,
    purchase: purchaseValue,
    purchaseId: stringValue(purchase.id) || stringValue(purchase.purchaseId) || session.purchaseId,
    status,
    onChainState: stringValue(purchase.onChainState) || session.onChainState,
    requestedAction: stringValue(nextAction.requestedAction) || session.requestedAction,
    errorType: status === 'failed' ? stringValue(nextAction.errorType) || session.errorType : undefined,
    errorNote: status === 'failed' ? purchaseFailureNote(purchase) || session.errorNote : undefined,
    txHash,
    resultHash,
    explorerLinks: buildExplorerLinks({
      network: session.network,
      txHash,
      agentIdentifier: session.agentIdentifier,
      smartContractAddress: session.smartContractAddress,
    }),
    updatedAt: now(),
  };

  sessionStore().set(updated.sessionId, updated);
  return updated;
}

async function completeNoriPaymentOnce(input: CompletePaymentInput, blockchainIdentifier: string) {
  const payment = input.masumiPayment;
  const config = getPaymentConfig();
  const network = stringValue(payment.PaymentSource?.network) || config.network;
  const agentIdentifier = requireString(payment.agentIdentifier, 'agentIdentifier');
  const smartContractAddress = stringValue(payment.PaymentSource?.smartContractAddress) || undefined;
  const policyId = stringValue(payment.PaymentSource?.policyId) || undefined;

  const existing = findStoredSession({ taskId: input.taskId, blockchainIdentifier });
  if (existing?.purchaseId) return existing;

  const agentRegistry = await verifyAgentRegistration({
    agentIdentifier,
    network,
    smartContractAddress,
  });
  if (!agentRegistry.verified) {
    throw new NoriPaymentError(
      `Nori agent is not registered on Masumi ${network}.`,
      502,
      agentRegistry,
    );
  }

  const body = {
    agentIdentifier,
    inputHash: requireString(payment.inputHash, 'inputHash'),
    blockchainIdentifier,
    network,
    sellerVkey: requireString(payment.sellerVkey, 'sellerVkey'),
    identifierFromPurchaser: requireString(payment.identifierFromPurchaser, 'identifierFromPurchaser'),
    payByTime: requireString(payment.payByTime, 'payByTime'),
    externalDisputeUnlockTime: requireString(payment.externalDisputeUnlockTime ?? payment.unlockTime, 'externalDisputeUnlockTime'),
    submitResultTime: requireString(payment.submitResultTime, 'submitResultTime'),
    unlockTime: requireString(payment.unlockTime, 'unlockTime'),
    metadata: JSON.stringify({
      source: 'masumi-docs',
      taskId: input.taskId,
      eventId: input.eventId,
      masumiPaymentId: payment.id,
    }),
  };

  let purchase: unknown;
  try {
    purchase = await paymentRequest('/purchase/resolve-blockchain-identifier', {
      method: 'POST',
      body: { blockchainIdentifier, network },
    });
  } catch (error) {
    if (!(error instanceof NoriPaymentError) || error.status !== 404) throw error;
    purchase = await paymentRequest('/purchase/', {
      method: 'POST',
      body,
    });
  }

  const createdAt = now();
  const session: NoriPaymentSession = {
    sessionId: crypto.randomUUID(),
    taskId: input.taskId,
    eventId: input.eventId,
    paymentId: stringValue(payment.id) || undefined,
    blockchainIdentifier,
    agentIdentifier,
    network,
    status: 'purchase_created',
    createdAt,
    updatedAt: createdAt,
    masumiPayment: payment,
    agentRegistry,
    smartContractAddress,
    policyId,
    explorerLinks: buildExplorerLinks({
      network,
      agentIdentifier,
      smartContractAddress,
    }),
  };

  sessionStore().set(session.sessionId, session);
  return applyPurchaseToSession(session, purchase);
}

export function completeNoriPayment(input: CompletePaymentInput): Promise<NoriPaymentSession> {
  const blockchainIdentifier = requireString(input.masumiPayment.blockchainIdentifier, 'blockchainIdentifier');
  const existing = findStoredSession({ blockchainIdentifier });
  if (existing?.purchaseId) return Promise.resolve(existing);

  const inFlight = completionStore().get(blockchainIdentifier);
  if (inFlight) return inFlight;

  const completion = completeNoriPaymentOnce(input, blockchainIdentifier).finally(() => {
    if (completionStore().get(blockchainIdentifier) === completion) {
      completionStore().delete(blockchainIdentifier);
    }
  });
  completionStore().set(blockchainIdentifier, completion);
  return completion;
}

export async function submitNoriPaymentResult(input: {
  sessionId?: string;
  taskId?: string;
  blockchainIdentifier?: string;
  resultHash: string;
}) {
  const session = findStoredSession(input);
  if (!session) {
    throw new NoriPaymentError('Nori payment session was not found.', 404);
  }

  const resultHash = requireString(input.resultHash, 'resultHash');
  const purchase = await paymentRequest('/payment/submit-result', {
    method: 'POST',
    body: {
      network: session.network,
      blockchainIdentifier: session.blockchainIdentifier,
      submitResultHash: resultHash,
    },
  });

  return applyPurchaseToSession({ ...session, resultHash }, purchase);
}

export async function refreshNoriPaymentSession(input: {
  sessionId?: string;
  taskId?: string;
  blockchainIdentifier?: string;
}) {
  const session = findStoredSession(input);
  if (!session) {
    throw new NoriPaymentError('Nori payment session was not found.', 404);
  }

  const purchase = await paymentRequest('/purchase/resolve-blockchain-identifier', {
    method: 'POST',
    body: {
      blockchainIdentifier: session.blockchainIdentifier,
      network: session.network,
    },
  });

  return applyPurchaseToSession(session, purchase);
}

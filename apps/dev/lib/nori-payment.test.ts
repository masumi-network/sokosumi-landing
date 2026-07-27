import assert from 'node:assert/strict';
import test from 'node:test';
import {
  completeNoriPayment,
  NoriPaymentError,
  type MasumiPaymentPayload,
} from './nori-payment';

const originalEnvironment = {
  apiUrl: process.env.MASUMI_PAYMENT_API_URL,
  apiKey: process.env.MASUMI_PAYMENT_API_KEY,
  network: process.env.MASUMI_NETWORK,
  timeout: process.env.MASUMI_PAYMENT_REQUEST_TIMEOUT_MS,
};

test.after(() => {
  restoreEnvironment();
});

function configurePaymentService(timeoutMs = 1_000) {
  process.env.MASUMI_PAYMENT_API_URL = 'https://payments.test';
  process.env.MASUMI_PAYMENT_API_KEY = 'test-api-key';
  process.env.MASUMI_NETWORK = 'Preprod';
  process.env.MASUMI_PAYMENT_REQUEST_TIMEOUT_MS = String(timeoutMs);
}

function restoreEnvironment() {
  setEnvironment('MASUMI_PAYMENT_API_URL', originalEnvironment.apiUrl);
  setEnvironment('MASUMI_PAYMENT_API_KEY', originalEnvironment.apiKey);
  setEnvironment('MASUMI_NETWORK', originalEnvironment.network);
  setEnvironment('MASUMI_PAYMENT_REQUEST_TIMEOUT_MS', originalEnvironment.timeout);
}

function setEnvironment(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

function payment(blockchainIdentifier: string): MasumiPaymentPayload {
  return {
    id: `payment-${blockchainIdentifier}`,
    blockchainIdentifier,
    agentIdentifier: 'agent-1',
    sellerVkey: 'seller-vkey',
    inputHash: 'input-hash',
    identifierFromPurchaser: 'purchaser-identifier',
    payByTime: '2000000000',
    submitResultTime: '2000000100',
    unlockTime: '2000000200',
    externalDisputeUnlockTime: '2000000300',
    PaymentSource: {
      network: 'Preprod',
      smartContractAddress: 'contract-address',
      policyId: 'policy-id',
    },
  };
}

function registryResponse() {
  return jsonResponse({
    data: {
      Assets: [
        {
          id: 'registry-entry-1',
          agentIdentifier: 'agent-1',
          name: 'Nori',
          status: 'RegistrationConfirmed',
        },
      ],
    },
  });
}

function jsonResponse(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function installFetch(
  handler: (url: string, init: RequestInit | undefined) => Promise<Response> | Response,
) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((input: string | URL | Request, init?: RequestInit) =>
    handler(String(input), init)) as typeof fetch;
  return () => {
    globalThis.fetch = originalFetch;
  };
}

test('creates only one purchase for concurrent completion requests', async () => {
  configurePaymentService();
  let registryCalls = 0;
  let purchaseCalls = 0;
  let resolveCalls = 0;
  const restoreFetch = installFetch(async (url) => {
    if (url.includes('/registry/')) {
      registryCalls += 1;
      return registryResponse();
    }
    if (url.endsWith('/purchase/resolve-blockchain-identifier')) {
      resolveCalls += 1;
      return jsonResponse({ error: 'not found' }, 404);
    }
    if (url.endsWith('/purchase/')) {
      purchaseCalls += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return jsonResponse({
        data: {
          id: 'purchase-1',
          blockchainIdentifier: 'concurrent-payment',
          onChainState: null,
          NextAction: {
            requestedAction: 'FundsLockingRequested',
            errorType: null,
            errorNote: null,
          },
          CurrentTransaction: null,
        },
      });
    }
    return jsonResponse({ error: `unexpected request: ${url}` }, 500);
  });

  try {
    const input = {
      taskId: 'task-concurrent',
      eventId: 'event-concurrent',
      masumiPayment: payment('concurrent-payment'),
    };
    const [first, duplicate] = await Promise.all([
      completeNoriPayment(input),
      completeNoriPayment(input),
    ]);

    assert.equal(first.sessionId, duplicate.sessionId);
    assert.equal(first.status, 'funds_locking');
    assert.equal(registryCalls, 1);
    assert.equal(resolveCalls, 1);
    assert.equal(purchaseCalls, 1);
  } finally {
    restoreFetch();
  }
});

test('reuses an already-created purchase instead of submitting a duplicate transaction', async () => {
  configurePaymentService();
  let purchaseCalls = 0;
  const restoreFetch = installFetch((url) => {
    if (url.includes('/registry/')) return registryResponse();
    if (url.endsWith('/purchase/resolve-blockchain-identifier')) {
      return jsonResponse({
        data: {
          id: 'existing-purchase',
          blockchainIdentifier: 'existing-payment',
          onChainState: 'FundsLocked',
          NextAction: {
            requestedAction: 'None',
            errorType: null,
            errorNote: null,
          },
          CurrentTransaction: {
            txHash: 'existing-transaction-hash',
            status: 'Confirmed',
          },
        },
      });
    }
    if (url.endsWith('/purchase/')) purchaseCalls += 1;
    return jsonResponse({ error: `unexpected request: ${url}` }, 500);
  });

  try {
    const session = await completeNoriPayment({
      taskId: 'task-existing',
      masumiPayment: payment('existing-payment'),
    });

    assert.equal(session.purchaseId, 'existing-purchase');
    assert.equal(session.status, 'funds_locked');
    assert.equal(session.txHash, 'existing-transaction-hash');
    assert.equal(purchaseCalls, 0);
  } finally {
    restoreFetch();
  }
});

test('turns insufficient treasury funds into a visible terminal session', async () => {
  configurePaymentService();
  const restoreFetch = installFetch((url) => {
    if (url.includes('/registry/')) return registryResponse();
    if (url.endsWith('/purchase/resolve-blockchain-identifier')) {
      return jsonResponse({ error: 'not found' }, 404);
    }
    if (url.endsWith('/purchase/')) {
      return jsonResponse({
        data: {
          id: 'purchase-without-funds',
          blockchainIdentifier: 'insufficient-payment',
          onChainState: null,
          NextAction: {
            requestedAction: 'FundsLockingRequested',
            errorType: 'InsufficientFunds',
            errorNote: null,
          },
          CurrentTransaction: null,
        },
      });
    }
    return jsonResponse({ error: `unexpected request: ${url}` }, 500);
  });

  try {
    const session = await completeNoriPayment({
      taskId: 'task-insufficient',
      masumiPayment: payment('insufficient-payment'),
    });

    assert.equal(session.status, 'failed');
    assert.equal(session.errorType, 'InsufficientFunds');
    assert.match(session.errorNote ?? '', /purchasing wallet has insufficient funds/i);
  } finally {
    restoreFetch();
  }
});

test('bounds a stalled payment-service request with a gateway timeout', async () => {
  configurePaymentService(10);
  const restoreFetch = installFetch((_url, init) => {
    return new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      if (!signal) return;
      if (signal.aborted) {
        reject(signal.reason);
        return;
      }
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
  });

  try {
    await assert.rejects(
      completeNoriPayment({
        taskId: 'task-timeout',
        masumiPayment: payment('timeout-payment'),
      }),
      (error) =>
        error instanceof NoriPaymentError &&
        error.status === 504 &&
        /timed out/i.test(error.message),
    );
  } finally {
    restoreFetch();
  }
});

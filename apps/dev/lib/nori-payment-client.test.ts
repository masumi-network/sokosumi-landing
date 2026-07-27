import assert from 'node:assert/strict';
import test from 'node:test';
import {
  NoriPaymentCompletionGuard,
  paymentEventFromData,
  type NoriPaymentEvent,
} from './nori-payment-client';

function paymentEvent(blockchainIdentifier = 'payment-blockchain-id'): NoriPaymentEvent {
  return {
    taskId: 'task-1',
    eventId: 'event-1',
    masumiPayment: {
      id: 'payment-1',
      blockchainIdentifier,
      agentIdentifier: 'agent-1',
      sellerVkey: 'seller-vkey',
      inputHash: 'input-hash',
    },
  };
}

test('extracts the Nori payment event from a Vercel data event', () => {
  const event = paymentEventFromData({
    type: 'data-payment',
    data: paymentEvent(),
  });

  assert.equal(event?.taskId, 'task-1');
  assert.equal(event?.masumiPayment.blockchainIdentifier, 'payment-blockchain-id');
});

test('starts payment completion immediately and de-duplicates a repeated stream event', async () => {
  const guard = new NoriPaymentCompletionGuard();
  const event = paymentEvent();
  let calls = 0;
  let release!: (succeeded: boolean) => void;
  const pending = new Promise<boolean>((resolve) => {
    release = resolve;
  });
  const complete = async () => {
    calls += 1;
    return pending;
  };

  const first = guard.start(event, complete);
  const duplicate = guard.start(event, complete);

  assert.equal(first.started, true);
  assert.equal(duplicate.started, false);
  assert.equal(calls, 1, 'completion must start in the same turn as the payment event');

  release(true);
  assert.equal(await first.completion, true);
  assert.equal(await duplicate.completion, true);

  const afterCompletion = guard.start(event, complete);
  assert.equal(afterCompletion.started, false);
  assert.equal(calls, 1);
});

test('allows a payment completion retry after a failed attempt', async () => {
  const guard = new NoriPaymentCompletionGuard();
  const event = paymentEvent('retryable-payment');
  let calls = 0;
  const complete = async () => {
    calls += 1;
    return calls > 1;
  };

  assert.equal(await guard.start(event, complete).completion, false);
  assert.equal(await guard.start(event, complete).completion, true);
  assert.equal(calls, 2);
});

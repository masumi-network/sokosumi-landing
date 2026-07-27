export interface NoriPaymentEvent {
  taskId?: string;
  eventId?: string;
  masumiPayment: Record<string, unknown>;
}

function objectRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function stringValue(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function isMasumiPayment(value: unknown) {
  const record = objectRecord(value);
  return Boolean(
    record &&
      typeof record.blockchainIdentifier === 'string' &&
      typeof record.agentIdentifier === 'string' &&
      typeof record.sellerVkey === 'string' &&
      typeof record.inputHash === 'string',
  );
}

export function paymentEventFromData(data: unknown, eventName?: string): NoriPaymentEvent | null {
  const record = objectRecord(data);
  if (!record) return null;

  if (record.type === 'data-payment' && record.data) return paymentEventFromData(record.data, 'data-payment');
  if (record.paymentEvent) return paymentEventFromData(record.paymentEvent, 'payment');

  if (isMasumiPayment(record)) {
    return {
      taskId: stringValue(record.taskId) || undefined,
      eventId: stringValue(record.eventId) || undefined,
      masumiPayment: record,
    };
  }

  const directPayment = record.masumiPayment ?? record.payment;
  const directPaymentRecord = objectRecord(directPayment);
  const shouldTreatAsPayment =
    eventName === 'payment' ||
    eventName === 'payment_created' ||
    eventName === 'masumi_payment' ||
    record.type === 'payment' ||
    record.type === 'payment_created';

  if (directPaymentRecord && isMasumiPayment(directPaymentRecord)) {
    return {
      taskId: stringValue(record.taskId) || stringValue(record.id) || undefined,
      eventId: stringValue(record.eventId) || undefined,
      masumiPayment: directPaymentRecord,
    };
  }

  if (shouldTreatAsPayment && record.data) return paymentEventFromData(record.data, eventName);

  return null;
}

function paymentEventKey(event: NoriPaymentEvent) {
  return (
    stringValue(event.masumiPayment.blockchainIdentifier) ||
    stringValue(event.masumiPayment.id) ||
    `${event.taskId ?? ''}:${event.eventId ?? ''}:${stringValue(event.masumiPayment.inputHash)}`
  );
}

/**
 * Starts payment completion in the same turn that receives the payment event
 * and de-duplicates repeated SSE/JSON representations of that event.
 */
export class NoriPaymentCompletionGuard {
  private active = new Map<string, Promise<boolean>>();
  private completed = new Set<string>();

  start(
    event: NoriPaymentEvent,
    complete: (paymentEvent: NoriPaymentEvent) => Promise<boolean>,
  ): { started: boolean; completion: Promise<boolean> } {
    const key = paymentEventKey(event);
    const existing = this.active.get(key);
    if (existing) return { started: false, completion: existing };
    if (this.completed.has(key)) return { started: false, completion: Promise.resolve(true) };

    let completion: Promise<boolean>;
    try {
      // Calling complete before returning is intentional: Nori may pause its
      // response stream until the corresponding purchase begins.
      completion = Promise.resolve(complete(event));
    } catch (error) {
      completion = Promise.reject(error);
    }

    const guardedCompletion = completion
      .then((succeeded) => {
        if (succeeded) this.completed.add(key);
        return succeeded;
      })
      .finally(() => {
        this.active.delete(key);
      });

    this.active.set(key, guardedCompletion);
    return { started: true, completion: guardedCompletion };
  }
}

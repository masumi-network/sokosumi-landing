'use client';

import { FormEvent, ReactNode, memo, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUp,
  Bot,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Copy,
  ExternalLink,
  Loader2,
  ReceiptText,
  ShieldCheck,
  WalletCards,
  XCircle,
} from 'lucide-react';
import { NoriIdentityCard, NoriIdentityRail } from '@/components/nori/nori-identity';
import { canonicalDocsUrl, withBasePath } from '@/lib/base-path';

export interface NoriPageContext {
  path: string;
  title?: string;
  markdownUrl?: string;
}

interface Citation {
  title?: string;
  section?: string;
  url?: string;
  path?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  error?: string;
}

type TaskPhase = 'quote' | 'created' | 'claimed' | 'usage' | 'locked' | 'running' | 'completed' | 'settled' | 'failed';
type TraceStatus = 'pending' | 'active' | 'done' | 'error';

type MarkdownBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3 | 4; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'code'; language?: string; code: string }
  | { type: 'ul' | 'ol'; items: string[] };

interface NoriTaskDetails {
  taskId: string;
  eventId: string;
  usageKey: string;
  blockchainIdentifier: string;
  resultHash: string;
  paymentId?: string;
  purchaseId?: string;
  paymentSessionId?: string;
  paymentStatus?: string;
  txHash?: string;
  errorNote?: string;
  agentName?: string;
  agentIdentifier?: string;
  agentStatus?: string;
  agentRegistryVerified?: boolean;
  agentApiBaseUrl?: string;
  smartContractAddress?: string;
  policyId?: string;
  explorerLinks?: NoriExplorerLinks;
}

interface NoriPaymentEvent {
  taskId?: string;
  eventId?: string;
  masumiPayment: Record<string, unknown>;
}

interface NoriPaymentSession {
  sessionId?: string;
  taskId?: string;
  eventId?: string;
  paymentId?: string;
  purchaseId?: string;
  blockchainIdentifier?: string;
  agentIdentifier?: string;
  status?: string;
  txHash?: string;
  resultHash?: string;
  errorType?: string;
  errorNote?: string;
  smartContractAddress?: string;
  policyId?: string;
  agentRegistry?: NoriAgentRegistryStatus;
  explorerLinks?: NoriExplorerLinks;
}

interface NoriAgentRegistryStatus {
  verified?: boolean;
  name?: string;
  status?: string;
  apiBaseUrl?: string;
  error?: string;
}

interface NoriExplorerLinks {
  masumiExplorer?: string;
  transaction?: string;
  agentAsset?: string;
  contractAddress?: string;
}

const prompts = [
  {
    label: 'Register an agent',
    prompt: 'How do I register an agent on Masumi?',
    icon: ShieldCheck,
  },
  {
    label: 'Escrow payments',
    prompt: 'Explain the Masumi escrow payment lifecycle.',
    icon: WalletCards,
  },
  {
    label: 'Agent collaboration',
    prompt: 'How do I enable agent-to-agent collaboration?',
    icon: Bot,
  },
  {
    label: 'API reference',
    prompt: 'Which API endpoints should I use to create and monitor a purchase?',
    icon: BookOpen,
  },
];

const phaseRank: Record<TaskPhase, number> = {
  quote: 0,
  created: 1,
  claimed: 2,
  usage: 3,
  locked: 4,
  running: 5,
  completed: 6,
  settled: 7,
  failed: 5,
};

const PAYMENT_POLL_MAX_ATTEMPTS = 80;
const PAYMENT_POLL_FIRST_DELAY_MS = 1200;
const PAYMENT_POLL_INTERVAL_MS = 5000;
const STREAM_FLUSH_INTERVAL_MS = 80;

type TracePhase = Exclude<TaskPhase, 'quote' | 'failed'>;
type ExplorerLinkItem = {
  href: string;
  label: string;
  detail: string;
  identifier: string;
  icon: typeof ExternalLink;
};

const traceEvents: Array<{
  phase: TracePhase;
  label: string;
  description: string;
  meta: (task: NoriTaskDetails | null) => string;
}> = [
  {
    phase: 'created',
    label: 'Task sent to Nori',
    description: 'Your question is dispatched to the Nori runtime as a paid docs task.',
    meta: (task) => task?.taskId ?? '/api/nori/chat',
  },
  {
    phase: 'claimed',
    label: 'Payment requested',
    description: 'Nori quotes the job and returns a Masumi payment request.',
    meta: (task) => task?.paymentId ?? 'Awaiting payment event',
  },
  {
    phase: 'running',
    label: 'Nori is working',
    description: 'The answer streams optimistically while payment settlement continues.',
    meta: () => '/api/nori/chat',
  },
  {
    phase: 'locked',
    label: 'Funds locked in escrow',
    description: 'The docs treasury funds the purchase, held by the Masumi smart contract on Cardano preprod.',
    meta: (task) => task?.paymentStatus ?? task?.blockchainIdentifier ?? 'Cardano preprod',
  },
  {
    phase: 'completed',
    label: 'Escrow confirmed',
    description: 'The payment service reports funds locked for this exact purchase.',
    meta: (task) => task?.purchaseId ?? task?.eventId ?? 'task event',
  },
  {
    phase: 'settled',
    label: 'Result committed on-chain',
    description: 'A sha-256 hash of the answer is submitted to settle the job.',
    meta: (task) => task?.txHash ?? task?.resultHash ?? 'sha256(completion)',
  },
];

function parseData(data: string) {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

function deltaFromData(data: unknown) {
  if (data === '[DONE]') return '';
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (record.type && record.type !== 'text-delta') return '';
    return String(record.delta ?? record.text ?? record.answer ?? record.content ?? '');
  }
  return '';
}

function citationFromData(data: unknown): Citation | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  if (record.type === 'data-citation' && record.data && typeof record.data === 'object') {
    return record.data as Citation;
  }
  return record as Citation;
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

function paymentEventFromData(data: unknown, eventName?: string): NoriPaymentEvent | null {
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

function formatPaymentStatus(status?: string) {
  if (!status) return 'Awaiting Nori';
  return status
    .split('_')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function safeTaskText(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}

function explorerIdentifier(href: string) {
  try {
    const url = new URL(href);
    const value = decodeURIComponent(url.pathname.split('/').filter(Boolean).at(-1) ?? '');
    return value || href;
  } catch {
    return href;
  }
}

function eventBlocks(buffer: string) {
  const blocks = buffer.split(/\n\n/);
  return {
    complete: blocks.slice(0, -1),
    rest: blocks.at(-1) ?? '',
  };
}

function parseMarkdownBlocks(content: string): MarkdownBlock[] {
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];
  let inCode = false;
  let codeLanguage = '';
  let codeLines: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join('\n').trim();
    if (text) blocks.push({ type: 'paragraph', text });
    paragraph = [];
  };

  const flushList = () => {
    if (listType && listItems.length) {
      blocks.push({ type: listType, items: listItems });
    }
    listType = null;
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, '');
    const fence = line.match(/^```([a-zA-Z0-9_-]+)?\s*$/);

    if (fence) {
      if (inCode) {
        blocks.push({ type: 'code', language: codeLanguage || undefined, code: codeLines.join('\n') });
        inCode = false;
        codeLanguage = '';
        codeLines = [];
      } else {
        flushParagraph();
        flushList();
        inCode = true;
        codeLanguage = fence[1] ?? '';
      }
      continue;
    }

    if (inCode) {
      codeLines.push(rawLine);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading', level: Math.min(heading[1].length, 4) as 2 | 3 | 4, text: heading[2].trim() });
      continue;
    }

    const quote = line.match(/^>\s?(.+)$/);
    if (quote) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'blockquote', text: quote[1].trim() });
      continue;
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? 'ul' : 'ol';
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((unordered?.[1] ?? ordered?.[1] ?? '').trim());
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  if (inCode) blocks.push({ type: 'code', language: codeLanguage || undefined, code: codeLines.join('\n') });

  return blocks;
}

function safeHref(value: string) {
  const href = canonicalDocsUrl(value.trim());
  if (/^(https?:\/\/|\/|#)/.test(href)) return href;
  return '#';
}

function isLlmsFallbackCitation(citation: Citation) {
  const href = canonicalDocsUrl(citation.url || citation.path || '');
  return /\/llms(?:-full)?\.txt(?:$|[?#])/.test(href);
}

function renderTextWithBreaks(text: string, keyPrefix: string): ReactNode[] {
  return text.split('\n').flatMap((part, index) => {
    const nodeKey = `${keyPrefix}-text-${index}`;
    return index === 0 ? [part] : [<br key={`${nodeKey}-br`} />, part];
  });
}

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)]+)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const token = match[0];
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push(...renderTextWithBreaks(text.slice(lastIndex, index), `${keyPrefix}-${matchIndex}-plain`));
    }

    const key = `${keyPrefix}-${matchIndex}`;
    if (token.startsWith('`')) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{renderInlineMarkdown(token.slice(2, -2), `${key}-strong`)}</strong>);
    } else if (token.startsWith('[')) {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const href = safeHref(link?.[2] ?? '#');
      const label = link?.[1] ?? href;
      nodes.push(
        href.startsWith('/') ? (
          <Link key={key} href={href}>
            {label}
          </Link>
        ) : (
          <a key={key} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>
            {label}
          </a>
        ),
      );
    } else {
      const href = safeHref(token);
      nodes.push(
        <a key={key} href={href} target="_blank" rel="noreferrer">
          {token}
        </a>,
      );
    }

    lastIndex = index + token.length;
    matchIndex += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(...renderTextWithBreaks(text.slice(lastIndex), `${keyPrefix}-tail`));
  }

  return nodes;
}

function renderMarkdown(content: string) {
  return parseMarkdownBlocks(content).map((block, index) => {
    const key = `md-${index}`;

    switch (block.type) {
      case 'heading': {
        const Tag = `h${block.level}` as 'h2' | 'h3' | 'h4';
        return <Tag key={key}>{renderInlineMarkdown(block.text, key)}</Tag>;
      }
      case 'blockquote':
        return <blockquote key={key}>{renderInlineMarkdown(block.text, key)}</blockquote>;
      case 'code':
        return (
          <pre key={key} data-language={block.language}>
            <code>{block.code}</code>
          </pre>
        );
      case 'ul':
        return (
          <ul key={key}>
            {block.items.map((item, itemIndex) => (
              <li key={`${key}-${itemIndex}`}>{renderInlineMarkdown(item, `${key}-${itemIndex}`)}</li>
            ))}
          </ul>
        );
      case 'ol':
        return (
          <ol key={key}>
            {block.items.map((item, itemIndex) => (
              <li key={`${key}-${itemIndex}`}>{renderInlineMarkdown(item, `${key}-${itemIndex}`)}</li>
            ))}
          </ol>
        );
      case 'paragraph':
        return <p key={key}>{renderInlineMarkdown(block.text, key)}</p>;
    }
  });
}

// Memoized so finished messages don't re-parse their markdown on every
// streaming update — only the growing message re-renders.
const MessageBody = memo(function MessageBody({ content }: { content: string }) {
  return <>{renderMarkdown(content)}</>;
});

const NoriPaymentTrace = memo(function NoriPaymentTrace({
  taskPhase,
  taskDetails,
  hasAnswerStarted,
  isStreaming,
  hasLastMessageError,
}: {
  taskPhase: TaskPhase;
  taskDetails: NoriTaskDetails | null;
  hasAnswerStarted: boolean;
  isStreaming: boolean;
  hasLastMessageError: boolean;
}) {
  const tracePhaseOrder: TracePhase[] = ['created', 'claimed', 'running', 'locked', 'completed', 'settled'];
  const hasPaymentRequest = Boolean(taskDetails?.paymentId || taskDetails?.blockchainIdentifier);

  const traceStepDone = (phase: TracePhase): boolean => {
    const rank = phaseRank[taskPhase];
    switch (phase) {
      case 'created':
        return taskPhase !== 'quote';
      case 'claimed':
        return hasPaymentRequest;
      case 'usage':
        return (
          taskDetails?.agentRegistryVerified === true ||
          (rank >= phaseRank.completed && taskPhase !== 'failed' && taskDetails?.agentRegistryVerified !== false)
        );
      case 'locked':
        return rank >= phaseRank.locked && taskPhase !== 'failed';
      case 'running':
        return hasAnswerStarted && !isStreaming && !hasLastMessageError;
      case 'completed':
        return rank >= phaseRank.completed && taskPhase !== 'failed';
      case 'settled':
        return taskPhase === 'settled';
    }
  };

  const getTraceStatus = (phase: TracePhase): TraceStatus => {
    if (traceStepDone(phase)) return 'done';

    if (taskPhase === 'failed') {
      const firstIncomplete = tracePhaseOrder.find((candidate) => !traceStepDone(candidate));
      return phase === firstIncomplete ? 'error' : 'pending';
    }

    switch (phase) {
      case 'claimed':
        return taskPhase !== 'quote' && !hasPaymentRequest ? 'active' : 'pending';
      case 'running':
        return isStreaming && !hasLastMessageError ? 'active' : 'pending';
      case 'locked':
        return hasPaymentRequest && !isStreaming && phaseRank[taskPhase] >= phaseRank.claimed ? 'active' : 'pending';
      case 'settled':
        return phaseRank[taskPhase] >= phaseRank.completed ? 'active' : 'pending';
      default:
        return 'pending';
    }
  };

  const taskStatusLabel =
    taskPhase === 'failed' ? 'Unavailable' : taskPhase === 'quote' ? 'Ready' : taskPhase === 'settled' ? 'Settled' : 'In progress';

  const explorerLinkItems = {
    masumiExplorer: taskDetails?.explorerLinks?.masumiExplorer
      ? {
          href: taskDetails.explorerLinks.masumiExplorer,
          label: 'Masumi Explorer',
          detail: 'Payment-service state',
          identifier: 'Open explorer',
          icon: ExternalLink,
        }
      : null,
    transaction: taskDetails?.explorerLinks?.transaction
      ? {
          href: taskDetails.explorerLinks.transaction,
          label: 'Cardano transaction',
          detail: taskPhase === 'settled' ? 'Result submission transaction' : 'Payment transaction',
          identifier: taskDetails.txHash || explorerIdentifier(taskDetails.explorerLinks.transaction),
          icon: ReceiptText,
        }
      : null,
    agentAsset: taskDetails?.explorerLinks?.agentAsset
      ? {
          href: taskDetails.explorerLinks.agentAsset,
          label: 'Cardano agent asset',
          detail: 'Registered Nori agent asset',
          identifier: explorerIdentifier(taskDetails.explorerLinks.agentAsset),
          icon: ShieldCheck,
        }
      : null,
    contractAddress: taskDetails?.explorerLinks?.contractAddress
      ? {
          href: taskDetails.explorerLinks.contractAddress,
          label: 'Cardano escrow contract',
          detail: 'Payment script address',
          identifier: explorerIdentifier(taskDetails.explorerLinks.contractAddress),
          icon: WalletCards,
        }
      : null,
  } satisfies Record<string, ExplorerLinkItem | null>;

  const traceExplorerLinks = (phase: TracePhase): ExplorerLinkItem[] => {
    const paymentStatus = taskDetails?.paymentStatus?.toLowerCase() ?? '';
    const isResultSubmitted = taskPhase === 'settled' || paymentStatus === 'result submitted';

    switch (phase) {
      case 'locked':
        return [
          explorerLinkItems.contractAddress,
          !isResultSubmitted ? explorerLinkItems.transaction : null,
        ].filter((item): item is ExplorerLinkItem => Boolean(item));
      case 'completed':
        return explorerLinkItems.masumiExplorer ? [explorerLinkItems.masumiExplorer] : [];
      case 'settled':
        return explorerLinkItems.transaction && isResultSubmitted ? [explorerLinkItems.transaction] : [];
      default:
        return [];
    }
  };

  return (
    <aside className="nori-trace-rail" aria-label="Masumi payment trace">
      <div className="nori-session-panel">
        <div className="nori-session-header">
          <span className="nori-session-title">Payment trace</span>
          <span className="nori-task-status" data-phase={taskPhase}>
            <Clock3 aria-hidden="true" />
            {taskStatusLabel}
          </span>
        </div>

        {taskDetails?.errorNote && <p className="nori-payment-error">{taskDetails.errorNote}</p>}

        <ol className="nori-trace-list" aria-live="polite">
          {traceEvents.map((event) => {
            const status = getTraceStatus(event.phase);
            const links = traceExplorerLinks(event.phase);
            const meta = event.meta(taskDetails).trim();
            return (
              <li key={event.phase} className="nori-trace-item" data-status={status}>
                <span className="nori-trace-marker" aria-hidden="true">
                  {status === 'done' ? <Check /> : status === 'error' ? <XCircle /> : status === 'active' ? <Loader2 /> : <Circle />}
                </span>
                <span className="nori-trace-copy">
                  <strong>{event.label}</strong>
                  <span>{event.description}</span>
                  {meta && <code>{meta}</code>}
                  {links.length > 0 && (
                    <span className="nori-trace-links" aria-label={`${event.label} explorer links`}>
                      {links.map((item) => {
                        const Icon = item.icon;
                        return (
                          <a key={item.href} href={item.href} target="_blank" rel="noreferrer" title={item.href}>
                            <Icon aria-hidden="true" />
                            <span className="nori-explorer-link-copy">
                              <strong>{item.label}</strong>
                              <span>{item.detail}</span>
                              <code>{item.href}</code>
                              <small>{item.identifier}</small>
                            </span>
                          </a>
                        );
                      })}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>

        <p className="nori-session-footnote">
          Nori quotes each job, the docs treasury locks the funds in escrow, and the result hash settles
          on-chain &mdash; the same lifecycle every Masumi agent uses in production.
        </p>
      </div>
    </aside>
  );
});

export function NoriChat({
  initialPrompt = '',
  initialPage,
}: {
  initialPrompt?: string;
  initialPage?: NoriPageContext;
}) {
  const [input, setInput] = useState(initialPrompt);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [taskPhase, setTaskPhase] = useState<TaskPhase>('quote');
  const [taskDetails, setTaskDetails] = useState<NoriTaskDetails | null>(null);
  const [hireStamping, setHireStamping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const taskTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const paymentPollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activePaymentSessionRef = useRef<string | null>(null);
  const hasLivePaymentRef = useRef(false);
  const pendingPaymentEventRef = useRef<NoriPaymentEvent | null>(null);
  const streamErrorRef = useRef(false);
  const latestAssistantContentRef = useRef('');
  const submittedResultSessionsRef = useRef<Set<string>>(new Set());
  const pendingDeltaRef = useRef('');
  const deltaFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const history = useMemo(
    () =>
      messages
        .filter((message) => message.content.trim() && !message.error)
        .map(({ role, content }) => ({ role, content })),
    [messages],
  );

  const clearTaskTimers = () => {
    taskTimersRef.current.forEach((timer) => clearTimeout(timer));
    taskTimersRef.current = [];
  };

  const clearPaymentPoll = () => {
    if (paymentPollTimerRef.current) {
      clearTimeout(paymentPollTimerRef.current);
      paymentPollTimerRef.current = null;
    }
  };

  useEffect(
    () => () => {
      clearTaskTimers();
      clearPaymentPoll();
      if (deltaFlushTimerRef.current !== null) {
        clearTimeout(deltaFlushTimerRef.current);
        deltaFlushTimerRef.current = null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (messages.length > 0) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length]);

  const appendAssistant = (updater: (message: Message) => Message) => {
    setMessages((current) => {
      const next = [...current];
      const index = next.length - 1;
      if (index >= 0 && next[index].role === 'assistant') {
        next[index] = updater(next[index]);
      }
      return next;
    });
  };

  const flushPendingDelta = () => {
    if (deltaFlushTimerRef.current !== null) {
      clearTimeout(deltaFlushTimerRef.current);
      deltaFlushTimerRef.current = null;
    }
    const chunk = pendingDeltaRef.current;
    pendingDeltaRef.current = '';
    if (chunk) {
      appendAssistant((message) => ({ ...message, content: `${message.content}${chunk}` }));
    }
  };

  const queueAssistantDelta = (delta: string) => {
    pendingDeltaRef.current += delta;
    if (deltaFlushTimerRef.current !== null) return;
    deltaFlushTimerRef.current = setTimeout(() => {
      deltaFlushTimerRef.current = null;
      flushPendingDelta();
    }, STREAM_FLUSH_INTERVAL_MS);
  };

  const copyAnswer = async (message: Message, index: number) => {
    await navigator.clipboard.writeText(message.content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const buildPendingTask = (): NoriTaskDetails => {
    return {
      taskId: '',
      eventId: '',
      usageKey: '',
      blockchainIdentifier: '',
      resultHash: '',
      paymentStatus: 'Awaiting Nori',
    };
  };

  const startTaskTrace = () => {
    clearTaskTimers();
    clearPaymentPoll();
    streamErrorRef.current = false;
    hasLivePaymentRef.current = false;
    pendingPaymentEventRef.current = null;
    activePaymentSessionRef.current = null;
    latestAssistantContentRef.current = '';
    submittedResultSessionsRef.current.clear();
    setTaskDetails(buildPendingTask());
    setTaskPhase('created');
  };

  const sha256Hex = async (value: string) => {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  };

  const maybeSubmitPaymentResult = async (session: NoriPaymentSession) => {
    const sessionId = session.sessionId;
    const answer = latestAssistantContentRef.current.trim();
    if (session.status !== 'funds_locked' || !sessionId || !answer || submittedResultSessionsRef.current.has(sessionId)) {
      return;
    }

    submittedResultSessionsRef.current.add(sessionId);

    try {
      const resultHash = await sha256Hex(answer);
      setTaskDetails((current) => ({
        ...(current ?? buildPendingTask()),
        resultHash,
        paymentStatus: 'Submitting result',
      }));

      const response = await fetch(withBasePath('/api/nori/payment/submit-result'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          taskId: session.taskId,
          blockchainIdentifier: session.blockchainIdentifier,
          resultHash,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; session?: NoriPaymentSession; error?: string };

      if (!response.ok || !payload.ok || !payload.session) {
        throw new Error(payload.error || `Payment result submission failed with status ${response.status}`);
      }

      applyPaymentSession(payload.session);
    } catch (error) {
      submittedResultSessionsRef.current.delete(sessionId);
      const message = error instanceof Error ? error.message : 'Payment result submission failed.';
      setTaskDetails((current) => ({
        ...(current ?? buildPendingTask()),
        paymentStatus: 'Result submit failed',
        errorNote: message,
      }));
    }
  };

  const applyPaymentSession = (session: NoriPaymentSession) => {
    const status = session.status || 'purchase_created';
    activePaymentSessionRef.current = session.sessionId ?? activePaymentSessionRef.current;

    setTaskDetails((current) => ({
      ...(current ?? buildPendingTask()),
      taskId: session.taskId ?? current?.taskId ?? 'task_nori_live',
      eventId: session.eventId ?? current?.eventId ?? 'evt_live',
      blockchainIdentifier: session.blockchainIdentifier ?? current?.blockchainIdentifier ?? '',
      paymentId: session.paymentId ?? current?.paymentId,
      purchaseId: session.purchaseId ?? current?.purchaseId,
      paymentSessionId: session.sessionId ?? current?.paymentSessionId,
      paymentStatus: formatPaymentStatus(status),
      txHash: session.txHash ?? current?.txHash,
      resultHash: session.resultHash ?? current?.resultHash ?? '',
      errorNote: session.errorNote ?? session.errorType ?? current?.errorNote,
      agentName: session.agentRegistry?.name ?? current?.agentName,
      agentIdentifier: session.agentIdentifier ?? current?.agentIdentifier,
      agentStatus: session.agentRegistry?.status ?? current?.agentStatus,
      agentRegistryVerified: session.agentRegistry?.verified ?? current?.agentRegistryVerified,
      agentApiBaseUrl: session.agentRegistry?.apiBaseUrl ?? current?.agentApiBaseUrl,
      smartContractAddress: session.smartContractAddress ?? current?.smartContractAddress,
      policyId: session.policyId ?? current?.policyId,
      explorerLinks: session.explorerLinks ?? current?.explorerLinks,
    }));

    if (status === 'failed' || status === 'configuration_missing') {
      setTaskPhase('failed');
      return;
    }

    if (status === 'result_submitted') {
      setTaskPhase('settled');
      return;
    }

    if (status === 'funds_locked') {
      setTaskPhase((current) => (phaseRank[current] < phaseRank.completed ? 'completed' : current));
      void maybeSubmitPaymentResult(session);
      return;
    }

    setTaskPhase((current) => (phaseRank[current] < phaseRank.claimed ? 'claimed' : current));
  };

  const pollPaymentStatus = async (sessionId: string, attempt = 0): Promise<void> => {
    if (attempt >= PAYMENT_POLL_MAX_ATTEMPTS) return;

    clearPaymentPoll();
    paymentPollTimerRef.current = setTimeout(
      async () => {
        try {
          const params = new URLSearchParams({ sessionId });
          const response = await fetch(withBasePath(`/api/nori/payment/status?${params.toString()}`), {
            cache: 'no-store',
          });
          const payload = (await response.json()) as { ok?: boolean; session?: NoriPaymentSession; error?: string };

          if (!response.ok || !payload.ok || !payload.session) {
            throw new Error(payload.error || `Payment status failed with status ${response.status}`);
          }

          applyPaymentSession(payload.session);

          if (payload.session.status !== 'result_submitted' && payload.session.status !== 'failed') {
            await pollPaymentStatus(sessionId, attempt + 1);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Payment status lookup failed.';
          setTaskDetails((current) => ({
            ...(current ?? buildPendingTask()),
            paymentStatus: 'Status unavailable',
            errorNote: message,
          }));
        }
      },
      attempt === 0 ? PAYMENT_POLL_FIRST_DELAY_MS : PAYMENT_POLL_INTERVAL_MS,
    );
  };

  const recordPaymentRequest = (paymentEvent: NoriPaymentEvent) => {
    hasLivePaymentRef.current = true;
    pendingPaymentEventRef.current = paymentEvent;

    const paymentId = stringValue(paymentEvent.masumiPayment.id) || undefined;
    const blockchainIdentifier = stringValue(paymentEvent.masumiPayment.blockchainIdentifier);

    setTaskDetails((current) => ({
      ...(current ?? buildPendingTask()),
      taskId: paymentEvent.taskId ?? current?.taskId ?? 'task_nori_live',
      eventId: paymentEvent.eventId ?? current?.eventId ?? 'evt_live',
      blockchainIdentifier: blockchainIdentifier || current?.blockchainIdentifier || '',
      paymentId: paymentId ?? current?.paymentId,
      agentIdentifier: stringValue(paymentEvent.masumiPayment.agentIdentifier) || current?.agentIdentifier,
      paymentStatus: 'Payment requested',
    }));
    setTaskPhase((current) => (phaseRank[current] < phaseRank.claimed ? 'claimed' : current));
  };

  const completeNoriPayment = async (paymentEvent: NoriPaymentEvent) => {
    hasLivePaymentRef.current = true;
    pendingPaymentEventRef.current = null;
    clearTaskTimers();

    const paymentId = stringValue(paymentEvent.masumiPayment.id) || undefined;
    const blockchainIdentifier = stringValue(paymentEvent.masumiPayment.blockchainIdentifier);

    setTaskDetails((current) => ({
      ...(current ?? buildPendingTask()),
      taskId: paymentEvent.taskId ?? current?.taskId ?? 'task_nori_live',
      eventId: paymentEvent.eventId ?? current?.eventId ?? 'evt_live',
      blockchainIdentifier: blockchainIdentifier || current?.blockchainIdentifier || '',
      paymentId: paymentId ?? current?.paymentId,
      agentIdentifier: stringValue(paymentEvent.masumiPayment.agentIdentifier) || current?.agentIdentifier,
      paymentStatus: 'Payment created',
    }));
    setTaskPhase((current) => (phaseRank[current] < phaseRank.claimed ? 'claimed' : current));

    try {
      const response = await fetch(withBasePath('/api/nori/payment/complete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentEvent),
      });
      const payload = (await response.json()) as { ok?: boolean; session?: NoriPaymentSession; error?: string };

      if (!response.ok || !payload.ok || !payload.session) {
        throw new Error(payload.error || `Payment completion failed with status ${response.status}`);
      }

      applyPaymentSession(payload.session);

      if (payload.session.sessionId) {
        await pollPaymentStatus(payload.session.sessionId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment completion failed.';
      setTaskDetails((current) => ({
        ...(current ?? buildPendingTask()),
        paymentStatus: 'Completion failed',
        errorNote: message,
      }));
      setTaskPhase('failed');
    }
  };

  const handleSseBlock = (block: string) => {
    const lines = block.split(/\n/);
    const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim() ?? 'message';
    const dataText = lines
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n');
    const data = parseData(dataText);

    if (data === '[DONE]') return true;

    const paymentEvent = paymentEventFromData(data, event);
    if (paymentEvent) {
      recordPaymentRequest(paymentEvent);
      return false;
    }

    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;

      if (record.type === 'finish' || record.type === 'text-start' || record.type === 'text-end' || record.type === 'data-reasoning') {
        return record.type === 'finish';
      }

      if (record.type === 'data-citation') {
        const citation = citationFromData(record);
        if (citation) {
          appendAssistant((message) => ({
            ...message,
            citations: [...(message.citations ?? []), citation],
          }));
        }
        return false;
      }

      if (record.type === 'error') {
        const error = String(record.errorText ?? record.error ?? record.message ?? 'Nori is unavailable.');
        streamErrorRef.current = true;
        flushPendingDelta();
        appendAssistant((message) => ({
          ...message,
          error,
          content: message.content || error,
        }));
        return true;
      }
    }

    if (event === 'answer_delta' || event === 'message') {
      const delta = deltaFromData(data);
      if (delta) {
        latestAssistantContentRef.current += delta;
        queueAssistantDelta(delta);
      }
      return false;
    }

    if (event === 'citation') {
      const citation = citationFromData(data);
      if (citation) {
        appendAssistant((message) => ({
          ...message,
          citations: [...(message.citations ?? []), citation],
        }));
      }
      return false;
    }

    if (event === 'error') {
      const error = typeof data === 'string' ? data : String((data as Record<string, unknown>)?.message ?? 'Nori is unavailable.');
      streamErrorRef.current = true;
      flushPendingDelta();
      appendAssistant((message) => ({
        ...message,
        error,
        content: message.content || error,
      }));
      return true;
    }

    return false;
  };

  const lastMessage = messages.at(-1);
  const hasAnswerStarted = lastMessage?.role === 'assistant' && lastMessage.content.length > 0;
  const hasLastMessageError = Boolean(lastMessage?.error);

  // Tool descent + ink + lift-off takes ~1.05s (0.15s delay + 0.9s animation);
  // switch views just as the tool fades out.
  const STAMP_CEREMONY_MS = 1000;

  const submitPrompt = async (prompt: string) => {
    const message = prompt.trim();
    if (!message || isStreaming || hireStamping) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    // First question: stamp the hero card while it's still center stage, and
    // only move to the console once the tool has lifted away.
    if (messages.length === 0 && !reducedMotion) {
      setHireStamping(true);
      await new Promise((resolve) => setTimeout(resolve, STAMP_CEREMONY_MS));
      setHireStamping(false);
    }

    const beginConversation = () => {
      setInput('');
      setIsStreaming(true);
      startTaskTrace();
      setMessages((current) => [
        ...current,
        { role: 'user', content: message },
        { role: 'assistant', content: '', citations: [] },
      ]);
    };

    beginConversation();

    try {
      const response = await fetch(withBasePath('/api/nori/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history,
          page: initialPage,
        }),
      });

      const contentType = response.headers.get('content-type') ?? '';
      if (!response.ok && !contentType.includes('text/event-stream')) {
        const text = await response.text();
        throw new Error(text || `Nori request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Nori returned an empty response.');
      }

      if (!contentType.includes('text/event-stream')) {
        const data = await response.json();
        const content = String(data.answer ?? data.reply ?? data.message ?? '');
        latestAssistantContentRef.current = content;
        appendAssistant((assistant) => ({
          ...assistant,
          content,
          citations: Array.isArray(data.citations) ? data.citations : [],
        }));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = eventBlocks(buffer);
        for (const block of blocks.complete) {
          streamDone = handleSseBlock(block);
          if (streamDone) break;
        }
        buffer = blocks.rest;
      }

      buffer += decoder.decode();
      if (buffer.trim() && !streamDone) handleSseBlock(buffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nori is unavailable.';
      flushPendingDelta();
      appendAssistant((assistant) => ({
        ...assistant,
        error: message,
        content: assistant.content || message,
      }));
      streamErrorRef.current = true;
    } finally {
      flushPendingDelta();
      clearTaskTimers();
      const pendingPaymentEvent = pendingPaymentEventRef.current;
      if (streamErrorRef.current) {
        setTaskPhase('failed');
      } else if (!hasLivePaymentRef.current) {
        setTaskDetails((current) => ({
          ...(current ?? buildPendingTask()),
          paymentStatus: 'Awaiting payment event',
        }));
      }
      setIsStreaming(false);
      inputRef.current?.focus();

      if (!streamErrorRef.current && pendingPaymentEvent) {
        window.setTimeout(() => void completeNoriPayment(pendingPaymentEvent), 0);
      }
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submitPrompt(input);
  };

  const isActive = messages.length > 0;

  const composer = (variant: 'hire' | 'thread') => (
    <form
      className={`nori-composer nori-composer-${variant}`}
      data-busy={isStreaming || hireStamping ? 'true' : 'false'}
      onSubmit={handleSubmit}
    >
      <textarea
        ref={inputRef}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void submitPrompt(input);
          }
        }}
        placeholder={variant === 'hire' ? 'Ask Nori anything about Masumi...' : 'Ask a follow-up...'}
        rows={1}
        disabled={isStreaming || hireStamping}
        aria-label="Message Nori"
      />
      <button type="submit" disabled={!input.trim() || isStreaming || hireStamping} aria-label="Send message">
        {isStreaming || hireStamping ? <Loader2 aria-hidden="true" /> : <ArrowUp aria-hidden="true" />}
      </button>
    </form>
  );

  return (
    <section className="nori-stage fd-page" data-state={isActive ? 'active' : 'hire'} aria-label="Ask Nori">
      {!isActive ? (
        <div className="nori-hire">
          <p className="nori-hire-kicker">Masumi Docs · Live agent hire</p>
          <h1 className="nori-hire-title">Hire Nori</h1>
          <p className="nori-hire-sub">
            Ask anything about Masumi. Every question hires Nori through a real escrowed transaction on Cardano
            preprod &mdash; subsidized by the docs, so you pay nothing.
          </p>

          <div className="nori-hire-card">
            <NoriIdentityCard variant="boot" stamped={hireStamping} />
          </div>

          {composer('hire')}

          <div className="nori-hire-prompts">
            {prompts.map((prompt) => {
              const Icon = prompt.icon;
              return (
                <button key={prompt.prompt} type="button" onClick={() => void submitPrompt(prompt.prompt)}>
                  <Icon aria-hidden="true" />
                  <span>{prompt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="nori-console">
          <NoriIdentityRail initialPage={initialPage} />

          <main className="nori-thread-col" aria-label="Conversation with Nori">
            <div className="nori-thread" aria-live="polite">
              {messages.map((message, index) => (
                <article key={index} className="nori-msg" data-role={message.role} data-error={message.error ? 'true' : 'false'}>
                  {message.role === 'assistant' && (
                    <p className="nori-msg-label">
                      Nori
                      <span aria-hidden="true">·</span>
                      <small>{message.error ? 'error' : isStreaming && index === messages.length - 1 ? 'answering' : 'answered'}</small>
                    </p>
                  )}

                  {message.content ? (
                    <div className="nori-message-text">
                      {message.role === 'assistant' ? <MessageBody content={message.content} /> : <p>{message.content}</p>}
                    </div>
                  ) : (
                    <div className="nori-typing">
                      <Loader2 aria-hidden="true" />
                      <span>Nori is reading the docs</span>
                    </div>
                  )}

                  {message.citations && message.citations.filter((citation) => !isLlmsFallbackCitation(citation)).length > 0 && (
                    <div className="nori-citations">
                      <span>Sources</span>
                      <div>
                        {message.citations.filter((citation) => !isLlmsFallbackCitation(citation)).map((citation, citationIndex) => {
                          const href = safeHref(citation.url || citation.path || '#');
                          return (
                            <Link
                              key={`${href}-${citationIndex}`}
                              href={href}
                              className="nori-citation"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <BookOpen aria-hidden="true" />
                              <span>
                                <strong>{citation.title || citation.path || 'Documentation'}</strong>
                                {citation.section && <small>{citation.section}</small>}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {message.role === 'assistant' && message.content && !message.error && (
                    <button className="nori-copy-answer" type="button" onClick={() => void copyAnswer(message, index)}>
                      {copiedIndex === index ? <CheckCircle2 aria-hidden="true" /> : <Copy aria-hidden="true" />}
                      {copiedIndex === index ? 'Copied' : 'Copy answer'}
                    </button>
                  )}
                </article>
              ))}
              <div ref={threadEndRef} aria-hidden="true" />
            </div>

            {composer('thread')}
          </main>

          <NoriPaymentTrace
            taskPhase={taskPhase}
            taskDetails={taskDetails}
            hasAnswerStarted={Boolean(hasAnswerStarted)}
            isStreaming={isStreaming}
            hasLastMessageError={hasLastMessageError}
          />
        </div>
      )}
    </section>
  );
}

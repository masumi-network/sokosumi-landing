'use client';

import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Boxes,
  Braces,
  Brain,
  ChevronDown,
  Cloud,
  CreditCard,
  FileText,
  Handshake,
  Network,
  Rocket,
  Server,
  Sparkles,
  Split,
  SquareTerminal,
  WalletCards,
  Workflow,
  Zap,
} from 'lucide-react';
import {
  Background,
  BackgroundVariant,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import { AgentIdCard, type AgentIdCardData, type AgentIdCardTiltMode } from '@/components/nori/agent-id-card';

type RoadmapTone = 'sokosumi' | 'masumi' | 'agents' | 'utility';
type RoadmapNodeKind = 'roadmap' | 'nori' | 'decision' | 'default';
type RoadmapLayout = 'desktop' | 'compact' | 'mobile';
type SectionKey = 'market' | 'protocol' | 'agent' | 'learn' | 'build' | 'pay' | 'host';

interface RoadmapNodeData extends Record<string, unknown> {
  title: string;
  href: string;
  eyebrow: string;
  indexLabel?: string;
  description?: string;
  icon?: LucideIcon;
  tone: RoadmapTone;
  parent?: boolean;
  decision?: boolean;
  sectionKey?: SectionKey;
  expanded?: boolean;
  onToggle?: () => void;
  tiltMode?: AgentIdCardTiltMode;
}

type RoadmapFlowNode = Node<RoadmapNodeData, RoadmapNodeKind>;

const noriRoadmapCard: AgentIdCardData = {
  name: 'Nori',
  signature: 'Nori DevRel Agent',
  role: 'Developer Relations Agent',
  agentIdentifier: '7e8bdaf2b2b919a3a4b94002cafb50086c0c845fe535d07a77ab7f77',
  policyId: '7e8bdaf2b2b919a3a4b94002cafb50086c0c845fe535d07a77ab7f77',
  network: 'Cardano / Preprod',
  registryState: 'verified',
};

const roadmapNodeData: RoadmapNodeData[] = [
  {
    title: 'Sokosumi docs',
    href: '/sokosumi/documentation',
    eyebrow: 'Marketplace',
    description: 'Agent hiring, coworkers, tasks, jobs, and organizations.',
    icon: Workflow,
    tone: 'sokosumi',
    parent: true,
  },
  {
    title: 'Coworkers',
    href: '/sokosumi/documentation/coworkers',
    eyebrow: 'Key page',
    description: 'Register humans or agents as coworkers.',
    icon: Handshake,
    tone: 'sokosumi',
  },
  {
    title: 'Pi Sokosumi',
    href: '/sokosumi/documentation/pysokosumi',
    eyebrow: 'Key page',
    description: 'Coworker package, task events, and payment metadata.',
    icon: Boxes,
    tone: 'sokosumi',
  },
  {
    title: 'Sokosumi MCP',
    href: '/sokosumi/mcp',
    eyebrow: 'Agent tool',
    description: 'List agents, create jobs, and monitor execution.',
    icon: Network,
    tone: 'sokosumi',
  },
  {
    title: 'Masumi docs',
    href: '/masumi/documentation',
    eyebrow: 'Protocol',
    description: 'Identity, registry, wallets, payments, and APIs.',
    icon: CreditCard,
    tone: 'masumi',
    parent: true,
  },
  {
    title: 'Learn',
    href: '/masumi/core-concepts',
    eyebrow: 'Decision',
    indexLabel: 'A',
    icon: Split,
    tone: 'masumi',
    decision: true,
    sectionKey: 'learn',
  },
  {
    title: 'Core concepts',
    href: '/masumi/core-concepts',
    eyebrow: 'Theory',
    description: 'Escrow, identity, registry, wallets, and tokens explained.',
    icon: Brain,
    tone: 'masumi',
  },
  {
    title: 'Build',
    href: '/masumi/documentation/how-to-guides/_quickstart',
    eyebrow: 'Decision',
    indexLabel: 'B',
    icon: Split,
    tone: 'masumi',
    decision: true,
    sectionKey: 'build',
  },
  {
    title: 'Build an agent',
    href: '/masumi/documentation/how-to-guides/_quickstart',
    eyebrow: 'Hands-on',
    description: 'Quickstart: create and deploy a Masumi agent in minutes.',
    icon: Rocket,
    tone: 'masumi',
  },
  {
    title: 'With or without refunds?',
    href: '/masumi/core-concepts/payments',
    eyebrow: 'Decision',
    indexLabel: 'C',
    icon: Split,
    tone: 'masumi',
    decision: true,
    sectionKey: 'pay',
  },
  {
    title: 'MIP-003 payments',
    href: '/masumi/mips/_mip-003',
    eyebrow: 'With refunds',
    description: 'Masumi payment protocol: escrow, refunds, and disputes.',
    icon: CreditCard,
    tone: 'masumi',
  },
  {
    title: 'x402 payments',
    href: '/masumi/core-concepts/x402',
    eyebrow: 'No refunds',
    description: 'Direct HTTP 402 payments — instant and final.',
    icon: Zap,
    tone: 'masumi',
  },
  {
    title: 'How do you run Masumi?',
    href: '/masumi/documentation/get-started/installation',
    eyebrow: 'Decision',
    indexLabel: 'D',
    icon: Split,
    tone: 'masumi',
    decision: true,
    sectionKey: 'host',
  },
  {
    title: 'Self-host the node',
    href: '/masumi/documentation/get-started/install-masumi-node',
    eyebrow: 'Full control',
    description: 'Run the Masumi Payment Service on your own infrastructure.',
    icon: Server,
    tone: 'masumi',
  },
  {
    title: 'Masumi as a Service',
    href: '/masumi/documentation/get-started/masumi-as-a-service',
    eyebrow: 'Fully managed',
    description: 'Hosted Masumi at app.masumi.network — no ops required.',
    icon: Cloud,
    tone: 'masumi',
  },
  {
    title: 'Register agent',
    href: '/masumi/documentation/get-started/register-agent',
    eyebrow: 'Next step',
    description: 'Identity, wallets, and registry metadata.',
    icon: BadgeCheck,
    tone: 'masumi',
  },
  {
    title: 'Agents hub',
    href: '/agents',
    eyebrow: 'Machine-readable',
    description: 'LLM indexes, Markdown, OpenAPI, skills, and MCP.',
    icon: Bot,
    tone: 'agents',
    parent: true,
  },
  {
    title: 'Skills and MCP',
    href: '/masumi/documentation/integrations/masumi-skills',
    eyebrow: 'Agent setup',
    description: 'Install skills and connect live tools.',
    icon: Sparkles,
    tone: 'agents',
  },
  {
    title: 'llms.txt',
    href: '/llms.txt',
    eyebrow: 'Context',
    description: 'Small structured docs context.',
    icon: FileText,
    tone: 'agents',
  },
  {
    title: 'API references',
    href: '/masumi/api-reference',
    eyebrow: 'Reference',
    description: 'Payment, registry, and marketplace endpoints.',
    icon: Braces,
    tone: 'utility',
  },
  {
    title: 'CLI docs',
    href: '/sokosumi/cli_docs',
    eyebrow: 'Reference',
    description: 'Terminal workflows for agent work.',
    icon: SquareTerminal,
    tone: 'utility',
  },
  {
    title: 'Wallet setup',
    href: '/masumi/documentation/how-to-guides/top-up-your-wallets',
    eyebrow: 'Reference',
    description: 'Fund and operate payment wallets.',
    icon: WalletCards,
    tone: 'utility',
  },
  {
    title: 'Payment flow',
    href: '/masumi/core-concepts/payments',
    eyebrow: 'Reference',
    description: 'Purchase requests, escrow, settlement, and disputes.',
    icon: CreditCard,
    tone: 'utility',
  },
];

const nodeIds = [
  'sokosumi',
  'coworkers',
  'pi-sokosumi',
  'sokosumi-mcp',
  'masumi',
  'learn-choice',
  'core-concepts',
  'build-choice',
  'build-agent',
  'pay-choice',
  'mip003',
  'x402',
  'host-choice',
  'self-host',
  'maas',
  'register-agent',
  'agents',
  'skills',
  'llms',
  'api-reference',
  'cli',
  'wallets',
  'payment-flow',
] as const;

function RoadmapHandles() {
  return (
    <>
      <Handle type="target" id="t-target" position={Position.Top} className="dev-flow-handle" isConnectable={false} />
      <Handle type="target" id="r-target" position={Position.Right} className="dev-flow-handle" isConnectable={false} />
      <Handle type="target" id="b-target" position={Position.Bottom} className="dev-flow-handle" isConnectable={false} />
      <Handle type="target" id="l-target" position={Position.Left} className="dev-flow-handle" isConnectable={false} />
      <Handle type="source" id="t-source" position={Position.Top} className="dev-flow-handle" isConnectable={false} />
      <Handle type="source" id="r-source" position={Position.Right} className="dev-flow-handle" isConnectable={false} />
      <Handle type="source" id="b-source" position={Position.Bottom} className="dev-flow-handle" isConnectable={false} />
      <Handle type="source" id="l-source" position={Position.Left} className="dev-flow-handle" isConnectable={false} />
    </>
  );
}

function stopTouchGraphGesture(event: ReactTouchEvent<HTMLElement>) {
  event.stopPropagation();
}

function stopPointerGraphGesture(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType === 'touch') {
    event.stopPropagation();
  }
}

function RoadmapNode({ data }: NodeProps<RoadmapFlowNode>) {
  const Icon = data.icon ?? FileText;

  return (
    <Link
      href={data.href}
      className="dev-flow-node nodrag nopan"
      data-tone={data.tone}
      data-parent={data.parent ? 'true' : 'false'}
      draggable={false}
      onPointerDownCapture={stopPointerGraphGesture}
      onPointerMoveCapture={stopPointerGraphGesture}
      onTouchStartCapture={stopTouchGraphGesture}
      onTouchMoveCapture={stopTouchGraphGesture}
    >
      <RoadmapHandles />
      <span className="dev-flow-node-top">
        <span className="dev-flow-node-index">{data.indexLabel}</span>
        <span className="dev-flow-node-dot" />
      </span>
      <span className="dev-flow-node-copy">
        <small>{data.eyebrow}</small>
        <strong>{data.title}</strong>
        {data.description && <span>{data.description}</span>}
      </span>
      <span className="dev-flow-node-mini" aria-hidden="true">
        <span className="dev-flow-node-mini-icon">
          <Icon />
        </span>
        <span className="dev-flow-node-mini-track">
          <span />
          <span />
          <span />
        </span>
        <span className="dev-flow-node-mini-action">
          <ArrowRight />
        </span>
      </span>
    </Link>
  );
}

function DecisionNode({ data }: NodeProps<RoadmapFlowNode>) {
  const Icon = data.icon ?? Split;
  const toggleable = typeof data.onToggle === 'function';

  const content = (
    <>
      <RoadmapHandles />
      <span className="dev-flow-decision-badge" aria-hidden="true">
        <Icon />
      </span>
      <span className="dev-flow-node-index">{data.indexLabel}</span>
      <strong>{data.title}</strong>
      {toggleable && (
        <span className="dev-flow-decision-chevron" data-expanded={data.expanded ? 'true' : 'false'} aria-hidden="true">
          <ChevronDown />
        </span>
      )}
    </>
  );

  if (!toggleable) {
    return (
      <span
        className="dev-flow-decision-node nodrag nopan"
        data-tone={data.tone}
        onPointerDownCapture={stopPointerGraphGesture}
        onPointerMoveCapture={stopPointerGraphGesture}
        onTouchStartCapture={stopTouchGraphGesture}
        onTouchMoveCapture={stopTouchGraphGesture}
      >
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      className="dev-flow-decision-node dev-flow-decision-toggle nodrag nopan"
      data-tone={data.tone}
      data-expanded={data.expanded ? 'true' : 'false'}
      aria-expanded={data.expanded}
      onClick={data.onToggle}
      onPointerDownCapture={stopPointerGraphGesture}
      onPointerMoveCapture={stopPointerGraphGesture}
      onTouchStartCapture={stopTouchGraphGesture}
      onTouchMoveCapture={stopTouchGraphGesture}
    >
      {content}
    </button>
  );
}

function NoriNode({ data }: NodeProps<RoadmapFlowNode>) {
  return (
    <Link
      href="/ask"
      className="dev-flow-nori-node nodrag nopan"
      draggable={false}
      onPointerDownCapture={stopPointerGraphGesture}
      onPointerMoveCapture={stopPointerGraphGesture}
      onTouchStartCapture={stopTouchGraphGesture}
      onTouchMoveCapture={stopTouchGraphGesture}
    >
      <RoadmapHandles />
      <span className="dev-flow-node-top">
        <span className="dev-flow-node-index">NORI</span>
        <span className="dev-flow-node-dot" />
      </span>
      <span className="dev-flow-nori-card">
        <AgentIdCard
          data={noriRoadmapCard}
          variant="boot"
          stamped
          stampAnimated={false}
          registrySheen={false}
          interactiveTilt={data.tiltMode}
        />
      </span>
    </Link>
  );
}

const nodeTypes = {
  roadmap: RoadmapNode,
  nori: NoriNode,
  decision: DecisionNode,
};

type BranchEdgeData = { sectionKey?: SectionKey };

function nativeBranchLabel(
  label: string,
  color: string,
  sectionKey: SectionKey,
  expanded: boolean,
  onToggle: () => void,
): Partial<Edge<BranchEdgeData>> {
  return {
    label: `↗  ${label}  ${expanded ? '▴' : '▾'}`,
    labelStyle: {
      fill: '#111111',
      fontSize: 11.5,
      fontWeight: 600,
    },
    labelBgStyle: {
      fill: `color-mix(in srgb, ${color} 5%, #ffffff)`,
      stroke: color,
      strokeOpacity: 0.48,
      strokeWidth: 1,
      strokeDasharray: '4 4',
    },
    labelBgPadding: [13, 9],
    labelBgBorderRadius: 999,
    interactionWidth: 28,
    focusable: true,
    ariaRole: 'button',
    ariaLabel: `${expanded ? 'Collapse' : 'Expand'} ${label.toLowerCase()} branch`,
    data: { sectionKey },
    domAttributes: {
      onKeyDown: (event: ReactKeyboardEvent<SVGGElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggle();
        }
      },
    },
  };
}

const desktopPositions: Record<string, { x: number; y: number }> = {
  nori: { x: 346, y: 0 },
  sokosumi: { x: 28, y: 360 },
  coworkers: { x: 76, y: 570 },
  'pi-sokosumi': { x: 76, y: 760 },
  'sokosumi-mcp': { x: 76, y: 950 },
  masumi: { x: 696, y: 360 },
  'learn-choice': { x: 636, y: 585 },
  'core-concepts': { x: 596, y: 680 },
  'build-choice': { x: 856, y: 585 },
  'build-agent': { x: 816, y: 680 },
  'pay-choice': { x: 694, y: 905 },
  mip003: { x: 596, y: 1000 },
  x402: { x: 816, y: 1000 },
  'host-choice': { x: 694, y: 1225 },
  'self-host': { x: 596, y: 1320 },
  maas: { x: 816, y: 1320 },
  'register-agent': { x: 706, y: 1545 },
  agents: { x: 360, y: 360 },
  skills: { x: 190, y: 1165 },
  llms: { x: 410, y: 1165 },
  'api-reference': { x: 28, y: 1750 },
  cli: { x: 250, y: 1750 },
  wallets: { x: 472, y: 1750 },
  'payment-flow': { x: 694, y: 1750 },
};

const linearNodeIds = ['nori', ...nodeIds];

const decisionNodeIds = new Set<string>(nodeIds.filter((_, index) => roadmapNodeData[index].decision));

const sectionNodes: Record<SectionKey, string[]> = {
  market: ['coworkers', 'pi-sokosumi', 'sokosumi-mcp'],
  protocol: ['learn-choice', 'build-choice'],
  agent: ['skills', 'llms', 'api-reference', 'cli', 'wallets', 'payment-flow'],
  learn: ['core-concepts'],
  build: ['build-agent', 'pay-choice'],
  pay: ['mip003', 'x402', 'host-choice'],
  host: ['self-host', 'maas', 'register-agent'],
};

function visibleNodeIds(expanded: Record<SectionKey, boolean>): Set<string> {
  const visible = new Set<string>(['nori', 'sokosumi', 'masumi', 'agents']);
  const market = expanded.market;
  const protocol = expanded.protocol;
  const agent = expanded.agent;

  if (market) sectionNodes.market.forEach((id) => visible.add(id));
  if (agent) sectionNodes.agent.forEach((id) => visible.add(id));
  if (protocol) {
    sectionNodes.protocol.forEach((id) => visible.add(id));
    if (expanded.learn) sectionNodes.learn.forEach((id) => visible.add(id));
    if (expanded.build) sectionNodes.build.forEach((id) => visible.add(id));
    if (expanded.build && expanded.pay) sectionNodes.pay.forEach((id) => visible.add(id));
    if (expanded.build && expanded.pay && expanded.host) sectionNodes.host.forEach((id) => visible.add(id));
  }

  return visible;
}

function makeDesktopPositions(expanded: Record<SectionKey, boolean>) {
  const positions = { ...desktopPositions };
  let y = expanded.protocol ? 629 : 510;

  if (expanded.protocol) {
    if (expanded.learn) {
      positions['core-concepts'] = { x: 596, y: 680 };
      y = Math.max(y, 800);
    }
    if (expanded.build) {
      positions['build-agent'] = { x: 816, y: 680 };
      positions['pay-choice'] = { x: 804, y: 905 };
      y = Math.max(y, 949);
    }
    if (expanded.build && expanded.pay) {
      positions.mip003 = { x: 596, y: 1000 };
      positions.x402 = { x: 816, y: 1000 };
      positions['host-choice'] = { x: 694, y: 1225 };
      y = 1269;
      if (expanded.host) {
        positions['self-host'] = { x: 596, y: 1320 };
        positions.maas = { x: 816, y: 1320 };
        positions['register-agent'] = { x: 706, y: 1545 };
        y = 1695;
      }
    }
  }

  const agentsY = 360;
  positions.agents = { ...positions.agents, y: agentsY };
  positions.skills = { ...positions.skills, y: agentsY + 295 };
  positions.llms = { ...positions.llms, y: agentsY + 295 };

  const utilityY = Math.max(agentsY + 575, y + 85);
  for (const id of ['api-reference', 'cli', 'wallets', 'payment-flow']) {
    positions[id] = { ...positions[id], y: utilityY };
  }

  return positions;
}

function makeLinearPositions(layout: Extract<RoadmapLayout, 'compact' | 'mobile'>, ids: string[]) {
  const noriGap = layout === 'mobile' ? 296 : 350;
  const firstNodeGap = 110;
  const nodeGap = layout === 'mobile' ? 184 : 172;
  const decisionGap = 92;

  let y = 0;
  return Object.fromEntries(
    ids.map((id, index) => {
      const position = { x: 0, y };
      y += index === 0 ? noriGap : index === 1 ? firstNodeGap : decisionNodeIds.has(id) ? decisionGap : nodeGap;
      return [id, position];
    }),
  );
}

function useRoadmapLayout() {
  const [layout, setLayout] = useState<RoadmapLayout>('desktop');

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setLayout(width <= 560 ? 'mobile' : width <= 980 ? 'compact' : 'desktop');
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return layout;
}

function makeNode(
  id: string,
  type: RoadmapNodeKind,
  position: { x: number; y: number },
  data: RoadmapNodeData,
  width: number,
): RoadmapFlowNode {
  return {
    id,
    type,
    position,
    data,
    draggable: false,
    selectable: false,
    className: 'dev-flow-rf-node nodrag nopan',
    style: { width },
  };
}

function makeDesktopEdges(expanded: Record<SectionKey, boolean>, onToggle: (key: SectionKey) => void): Edge[] {
  const main = { stroke: '#FA008C', strokeWidth: 2.2 };
  const branch = { stroke: 'rgba(70, 10, 35, 0.24)', strokeWidth: 1.6 };
  const choice = { stroke: '#FA008C', strokeWidth: 1.8, strokeDasharray: '4 6' };
  const utility = { stroke: 'rgba(0, 0, 0, 0.18)', strokeWidth: 1.4, strokeDasharray: '6 7' };

  return [
    { id: 'nori-sokosumi', source: 'nori', sourceHandle: 'l-source', target: 'sokosumi', targetHandle: 't-target', style: main, ...nativeBranchLabel('Marketplace', '#6400ff', 'market', expanded.market, () => onToggle('market')), animated: true },
    { id: 'nori-masumi', source: 'nori', sourceHandle: 'r-source', target: 'masumi', targetHandle: 't-target', style: main, ...nativeBranchLabel('Protocol', '#fa008c', 'protocol', expanded.protocol, () => onToggle('protocol')), animated: true },
    { id: 'nori-agents', source: 'nori', sourceHandle: 'b-source', target: 'agents', targetHandle: 't-target', style: main, ...nativeBranchLabel('Your agent', '#ff6400', 'agent', expanded.agent, () => onToggle('agent')), animated: true },
    { id: 'sokosumi-coworkers', source: 'sokosumi', sourceHandle: 'b-source', target: 'coworkers', targetHandle: 'l-target', style: branch },
    { id: 'sokosumi-pi', source: 'sokosumi', sourceHandle: 'b-source', target: 'pi-sokosumi', targetHandle: 'l-target', style: branch },
    { id: 'sokosumi-mcp', source: 'sokosumi', sourceHandle: 'b-source', target: 'sokosumi-mcp', targetHandle: 'l-target', style: branch },
    { id: 'masumi-learn-choice', source: 'masumi', sourceHandle: 'b-source', target: 'learn-choice', style: branch, ...nativeBranchLabel('Learn', '#fa008c', 'learn', expanded.learn, () => onToggle('learn')) },
    { id: 'masumi-build-choice', source: 'masumi', sourceHandle: 'b-source', target: 'build-choice', style: branch, ...nativeBranchLabel('Build', '#fa008c', 'build', expanded.build, () => onToggle('build')) },
    { id: 'learn-choice-concepts', source: 'learn-choice', target: 'core-concepts', targetHandle: 't-target', style: choice },
    { id: 'build-choice-agent', source: 'build-choice', target: 'build-agent', targetHandle: 't-target', style: choice },
    { id: 'build-agent-pay-choice', source: 'build-agent', sourceHandle: 'b-source', target: 'pay-choice', targetHandle: 't-target', style: branch },
    { id: 'pay-choice-mip003', source: 'pay-choice', sourceHandle: 'l-source', target: 'mip003', targetHandle: 't-target', style: choice },
    { id: 'pay-choice-x402', source: 'pay-choice', sourceHandle: 'r-source', target: 'x402', targetHandle: 't-target', style: choice },
    { id: 'mip003-host-choice', source: 'mip003', sourceHandle: 'b-source', target: 'host-choice', targetHandle: 'l-target', style: branch },
    { id: 'x402-host-choice', source: 'x402', sourceHandle: 'b-source', target: 'host-choice', targetHandle: 'r-target', style: branch },
    { id: 'host-choice-self-host', source: 'host-choice', sourceHandle: 'l-source', target: 'self-host', targetHandle: 't-target', style: choice },
    { id: 'host-choice-maas', source: 'host-choice', sourceHandle: 'r-source', target: 'maas', targetHandle: 't-target', style: choice },
    { id: 'self-host-register', source: 'self-host', sourceHandle: 'b-source', target: 'register-agent', targetHandle: 'l-target', style: branch },
    { id: 'maas-register', source: 'maas', sourceHandle: 'b-source', target: 'register-agent', targetHandle: 'r-target', style: branch },
    { id: 'agents-skills', source: 'agents', sourceHandle: 'l-source', target: 'skills', targetHandle: 'r-target', style: branch },
    { id: 'agents-llms', source: 'agents', sourceHandle: 'r-source', target: 'llms', targetHandle: 'l-target', style: branch },
    { id: 'agents-api', source: 'agents', sourceHandle: 'b-source', target: 'api-reference', targetHandle: 't-target', style: utility },
    { id: 'agents-cli', source: 'agents', sourceHandle: 'b-source', target: 'cli', targetHandle: 't-target', style: utility },
    { id: 'agents-wallets', source: 'agents', sourceHandle: 'b-source', target: 'wallets', targetHandle: 't-target', style: utility },
    { id: 'agents-payment-flow', source: 'agents', sourceHandle: 'b-source', target: 'payment-flow', targetHandle: 't-target', style: utility },
  ].map((edge) => ({
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: edge.style.stroke },
    ...edge,
  }));
}

function makeCompactEdges(
  visible: Set<string>,
  expanded: Record<SectionKey, boolean>,
  onToggle: (key: SectionKey) => void,
): Edge[] {
  const main = { stroke: '#FA008C', strokeWidth: 2 };
  const branch = { stroke: 'rgba(70, 10, 35, 0.2)', strokeWidth: 1.5 };
  const rootEdges: Edge[] = [
    { id: 'nori-sokosumi', source: 'nori', sourceHandle: 'l-source', target: 'sokosumi', targetHandle: 'l-target', ...nativeBranchLabel('Marketplace', '#6400ff', 'market', expanded.market, () => onToggle('market')) },
    { id: 'nori-masumi', source: 'nori', sourceHandle: 'r-source', target: 'masumi', targetHandle: 'r-target', ...nativeBranchLabel('Protocol', '#fa008c', 'protocol', expanded.protocol, () => onToggle('protocol')) },
    { id: 'nori-agents', source: 'nori', sourceHandle: 'b-source', target: 'agents', targetHandle: 't-target', ...nativeBranchLabel('Your agent', '#ff6400', 'agent', expanded.agent, () => onToggle('agent')) },
  ].map((edge) => ({
    ...edge,
    style: main,
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: main.stroke },
  }));
  const protocolChoiceEdges: Edge[] = visible.has('learn-choice') && visible.has('build-choice')
    ? [
        { id: 'masumi-learn-choice', source: 'masumi', sourceHandle: 'b-source', target: 'learn-choice', ...nativeBranchLabel('Learn', '#fa008c', 'learn', expanded.learn, () => onToggle('learn')) },
        { id: 'masumi-build-choice', source: 'masumi', sourceHandle: 'b-source', target: 'build-choice', ...nativeBranchLabel('Build', '#fa008c', 'build', expanded.build, () => onToggle('build')) },
      ].map((edge) => ({
        ...edge,
        style: branch,
        markerEnd: { type: MarkerType.ArrowClosed, color: branch.stroke },
      }))
    : [];
  const groups = [
    ['sokosumi', 'coworkers', 'pi-sokosumi', 'sokosumi-mcp'],
    ['learn-choice', 'core-concepts'],
    ['build-choice', 'build-agent', 'pay-choice', 'mip003', 'x402', 'host-choice', 'self-host', 'maas', 'register-agent'],
    ['agents', 'skills', 'llms', 'api-reference', 'cli', 'wallets', 'payment-flow'],
  ];
  const branchEdges = groups.flatMap((group) => {
    const ids = group.filter((id) => visible.has(id));
    return ids.slice(0, -1).map((source, index) => ({
      id: `${source}-${ids[index + 1]}`,
      source,
      sourceHandle: source === 'learn-choice' || source === 'build-choice' ? undefined : 'b-source',
      target: ids[index + 1],
      targetHandle: 't-target',
      type: 'smoothstep',
      style: branch,
      markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(70, 10, 35, 0.28)' },
    }));
  });

  return [...rootEdges, ...protocolChoiceEdges, ...branchEdges];
}

export function DevRoadmapFlow() {
  const layout = useRoadmapLayout();
  const compact = layout !== 'desktop';
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
    market: false,
    protocol: false,
    agent: false,
    learn: false,
    build: false,
    pay: false,
    host: false,
  });
  const toggleSection = useCallback(
    (key: SectionKey) => setExpanded((state) => ({ ...state, [key]: !state[key] })),
    [],
  );
  const handleEdgeClick = useCallback(
    (_event: ReactMouseEvent, edge: Edge<BranchEdgeData>) => {
      const sectionKey = edge.data?.sectionKey;
      if (sectionKey) toggleSection(sectionKey);
    },
    [toggleSection],
  );
  const visible = useMemo(() => visibleNodeIds(expanded), [expanded]);
  const visibleLinear = useMemo(() => linearNodeIds.filter((id) => visible.has(id)), [visible]);
  const positions = useMemo(
    () => (layout === 'desktop' ? makeDesktopPositions(expanded) : makeLinearPositions(layout, visibleLinear)),
    [layout, expanded, visibleLinear],
  );
  const shellHeight = Math.max(...visibleLinear.map((id) => positions[id].y)) + 250;
  const width = layout === 'mobile' ? 264 : compact ? 420 : 200;
  const decisionWidth = compact ? Math.min(width, 260) : 224;

  const nodes = useMemo<RoadmapFlowNode[]>(() => {
    let ordinal = 0;
    const standardNodes = nodeIds.flatMap((id, index) => {
      const data = roadmapNodeData[index];
      if (!data.decision) ordinal += 1;
      if (!visible.has(id)) return [];
      if (id === 'learn-choice' || id === 'build-choice') {
        const anchorPosition = compact
          ? { x: positions[id].x + width / 2, y: positions[id].y }
          : positions[id];
        const anchorNode: RoadmapFlowNode = {
          id,
          type: 'default' as const,
          position: anchorPosition,
          data,
          draggable: false,
          selectable: false,
          focusable: false,
          style: {
            width: 1,
            height: 1,
            minWidth: 0,
            minHeight: 0,
            padding: 0,
            border: 0,
            background: 'transparent',
            opacity: 0,
            pointerEvents: 'none',
          },
        };
        return [anchorNode];
      }
      const indexLabel = data.indexLabel ?? String(ordinal).padStart(2, '0');
      const parentWidth = compact ? width : 220;
      const utilityWidth = compact ? width : 200;
      const nodeWidth = data.decision ? decisionWidth : data.parent ? parentWidth : data.tone === 'utility' ? utilityWidth : width;
      const position = data.decision && compact
        ? { x: positions[id].x + (width - decisionWidth) / 2, y: positions[id].y }
        : positions[id];
      const sectionKey = data.sectionKey;
      const toggleData = sectionKey
        ? {
            expanded: expanded[sectionKey],
            onToggle: () => setExpanded((state) => ({ ...state, [sectionKey]: !state[sectionKey] })),
          }
        : {};
      return [makeNode(id, data.decision ? 'decision' : 'roadmap', position, { ...data, indexLabel, ...toggleData }, nodeWidth)];
    });

    return [
      makeNode('nori', 'nori', positions.nori, {
        title: 'Ask Nori',
        href: '/ask',
        eyebrow: 'Ask Nori',
        indexLabel: 'NORI',
        tone: 'masumi',
        tiltMode: false,
      }, compact ? width : 330),
      ...standardNodes,
    ];
  }, [compact, decisionWidth, expanded, positions, visible, width]);

  const edges = useMemo(
    () =>
      compact
        ? makeCompactEdges(visible, expanded, toggleSection)
        : makeDesktopEdges(expanded, toggleSection).filter(
            (edge) => visible.has(edge.source) && visible.has(edge.target),
          ),
    [compact, expanded, toggleSection, visible, visibleLinear],
  );

  return (
    <section className="dev-flow-shell" data-layout={layout} style={{ height: shellHeight }} aria-label="Developer hub map graph">
      <ReactFlow
        key={layout}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onEdgeClick={handleEdgeClick}
        fitView={!compact}
        fitViewOptions={{ padding: 0.08 }}
        defaultViewport={compact ? { x: layout === 'mobile' ? 24 : 52, y: 24, zoom: layout === 'mobile' ? 0.94 : 0.92 } : undefined}
        minZoom={0.45}
        maxZoom={1}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        zoomOnScroll={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        className="dev-flow"
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1.2} color="rgba(0, 0, 0, 0.12)" />
      </ReactFlow>
    </section>
  );
}

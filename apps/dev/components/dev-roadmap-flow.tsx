'use client';

import {
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
  ArrowUpRight,
  BadgeCheck,
  Bot,
  Boxes,
  Brain,
  ChevronDown,
  Cloud,
  CreditCard,
  FileText,
  GraduationCap,
  Handshake,
  Network,
  Rocket,
  Server,
  Sparkles,
  Split,
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
type RoadmapNodeKind = 'roadmap' | 'nori' | 'decision' | 'reveal' | 'default';
type RoadmapLayout = 'desktop' | 'compact' | 'mobile';
type SectionKey = 'market' | 'academy' | 'protocol' | 'agent' | 'pay' | 'host';

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
    title: 'Masumi Learn',
    href: 'https://www.masumi.network/learn',
    eyebrow: 'Learning portal',
    description: 'Take practical courses, pass assessments, and earn a verifiable certificate.',
    icon: GraduationCap,
    tone: 'masumi',
    parent: true,
  },
  {
    title: 'Fundamentals course',
    href: 'https://www.masumi.network/learn/course',
    eyebrow: 'Four units · ~65 min',
    description: 'Learn the agent economy, Masumi, blockchain basics, trust, and payments.',
    icon: Brain,
    tone: 'masumi',
  },
  {
    title: 'Earn a certificate',
    href: 'https://www.masumi.network/learn/course',
    eyebrow: 'Verifiable credential',
    description: 'Pass the quizzes and final assessment to earn your certificate.',
    icon: BadgeCheck,
    tone: 'masumi',
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
    indexLabel: 'A',
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
    indexLabel: 'B',
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
];

const nodeIds = [
  'sokosumi',
  'coworkers',
  'pi-sokosumi',
  'sokosumi-mcp',
  'learning',
  'fundamentals-course',
  'learning-certificate',
  'masumi',
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
] as const;

function RoadmapHandles({ splitBottomSource = false }: { splitBottomSource?: boolean }) {
  return (
    <>
      <Handle type="target" id="t-target" position={Position.Top} className="dev-flow-handle" isConnectable={false} />
      <Handle type="target" id="r-target" position={Position.Right} className="dev-flow-handle" isConnectable={false} />
      {!splitBottomSource && (
        <Handle type="target" id="b-target" position={Position.Bottom} className="dev-flow-handle" isConnectable={false} />
      )}
      <Handle type="target" id="l-target" position={Position.Left} className="dev-flow-handle" isConnectable={false} />
      <Handle type="source" id="t-source" position={Position.Top} className="dev-flow-handle" isConnectable={false} />
      <Handle type="source" id="r-source" position={Position.Right} className="dev-flow-handle" isConnectable={false} />
      {splitBottomSource ? (
        <>
          <Handle
            type="source"
            id="b-left-source"
            position={Position.Bottom}
            className="dev-flow-handle"
            style={{ left: '42%' }}
            isConnectable={false}
          />
          <Handle
            type="source"
            id="b-right-source"
            position={Position.Bottom}
            className="dev-flow-handle"
            style={{ left: '58%' }}
            isConnectable={false}
          />
        </>
      ) : (
        <Handle type="source" id="b-source" position={Position.Bottom} className="dev-flow-handle" isConnectable={false} />
      )}
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

function RevealNode({ data }: NodeProps<RoadmapFlowNode>) {
  return (
    <button
      type="button"
      className="dev-flow-reveal-node nodrag nopan"
      data-tone={data.tone}
      data-expanded={data.expanded ? 'true' : 'false'}
      aria-expanded={data.expanded}
      aria-label={`${data.expanded ? 'Collapse' : 'Expand'} ${data.title.toLowerCase()} section`}
      onClick={data.onToggle}
      onPointerDownCapture={stopPointerGraphGesture}
      onPointerMoveCapture={stopPointerGraphGesture}
      onTouchStartCapture={stopTouchGraphGesture}
      onTouchMoveCapture={stopTouchGraphGesture}
    >
      <RoadmapHandles />
      <span className="dev-flow-reveal-icon" aria-hidden="true">
        <ArrowUpRight />
      </span>
      <span>{data.title}</span>
      <span className="dev-flow-reveal-chevron" aria-hidden="true">
        <ChevronDown />
      </span>
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
      <RoadmapHandles splitBottomSource />
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
  reveal: RevealNode,
};

const desktopPositions: Record<string, { x: number; y: number }> = {
  nori: { x: 346, y: 0 },
  sokosumi: { x: 56, y: 360 },
  coworkers: { x: 66, y: 570 },
  'pi-sokosumi': { x: 66, y: 760 },
  'sokosumi-mcp': { x: 66, y: 950 },
  learning: { x: 286, y: 360 },
  'fundamentals-course': { x: 296, y: 570 },
  'learning-certificate': { x: 296, y: 760 },
  masumi: { x: 746, y: 360 },
  'build-agent': { x: 756, y: 570 },
  'pay-choice': { x: 761, y: 760 },
  mip003: { x: 646, y: 850 },
  x402: { x: 866, y: 850 },
  'host-choice': { x: 761, y: 1040 },
  'self-host': { x: 646, y: 1130 },
  maas: { x: 866, y: 1130 },
  'register-agent': { x: 756, y: 1320 },
  agents: { x: 516, y: 360 },
  skills: { x: 526, y: 570 },
  llms: { x: 526, y: 760 },
};

const linearNodeIds = ['nori', ...nodeIds];

const rootRevealNodes = [
  { id: 'market-reveal', title: 'Marketplace', tone: 'sokosumi', sectionKey: 'market', target: 'sokosumi' },
  { id: 'academy-reveal', title: 'Learning', tone: 'masumi', sectionKey: 'academy', target: 'learning' },
  { id: 'protocol-reveal', title: 'Protocol', tone: 'masumi', sectionKey: 'protocol', target: 'masumi' },
  { id: 'agent-reveal', title: 'Your agent', tone: 'agents', sectionKey: 'agent', target: 'agents' },
] as const;
const rootRevealNodeIds = new Set<string>(rootRevealNodes.map(({ id }) => id));

const decisionNodeIds = new Set<string>(nodeIds.filter((_, index) => roadmapNodeData[index].decision));

const sectionNodes: Record<SectionKey, string[]> = {
  market: ['coworkers', 'pi-sokosumi', 'sokosumi-mcp'],
  academy: ['fundamentals-course', 'learning-certificate'],
  protocol: ['build-agent', 'pay-choice'],
  agent: ['skills', 'llms'],
  pay: ['mip003', 'x402', 'host-choice'],
  host: ['self-host', 'maas', 'register-agent'],
};

function visibleNodeIds(expanded: Record<SectionKey, boolean>): Set<string> {
  const visible = new Set<string>(['nori', 'sokosumi', 'learning', 'masumi', 'agents', ...rootRevealNodeIds]);
  const market = expanded.market;
  const protocol = expanded.protocol;
  const agent = expanded.agent;

  if (market) sectionNodes.market.forEach((id) => visible.add(id));
  if (expanded.academy) sectionNodes.academy.forEach((id) => visible.add(id));
  if (agent) sectionNodes.agent.forEach((id) => visible.add(id));
  if (protocol) {
    sectionNodes.protocol.forEach((id) => visible.add(id));
    if (expanded.pay) sectionNodes.pay.forEach((id) => visible.add(id));
    if (expanded.pay && expanded.host) sectionNodes.host.forEach((id) => visible.add(id));
  }

  return visible;
}

function makeDesktopPositions(expanded: Record<SectionKey, boolean>) {
  const positions = { ...desktopPositions };

  if (expanded.protocol) {
    let nextY = 570;
    positions['build-agent'] = { x: 756, y: nextY };
    positions['pay-choice'] = { x: 761, y: nextY + 190 };
    nextY += 280;

    if (expanded.pay) {
      positions.mip003 = { x: 646, y: nextY };
      positions.x402 = { x: 866, y: nextY };
      positions['host-choice'] = { x: 761, y: nextY + 190 };
      nextY += 280;

      if (expanded.host) {
        positions['self-host'] = { x: 646, y: nextY };
        positions.maas = { x: 866, y: nextY };
        positions['register-agent'] = { x: 756, y: nextY + 190 };
      }
    }

  }

  const agentsY = 360;
  positions.agents = { ...positions.agents, y: agentsY };
  positions.skills = { ...positions.skills, y: agentsY + 210 };
  positions.llms = { ...positions.llms, y: agentsY + 400 };

  return positions;
}

function makeLinearPositions(layout: Extract<RoadmapLayout, 'compact' | 'mobile'>, ids: string[]) {
  const noriGap = layout === 'mobile' ? 286 : 340;
  const firstNodeGap = 110;
  const nodeGap = layout === 'mobile' ? 200 : 184;
  const decisionGap = 92;
  const revealGap = 72;

  let y = 0;
  return Object.fromEntries(
    ids.map((id, index) => {
      const position = { x: 0, y };
      y += index === 0 ? noriGap : rootRevealNodeIds.has(id) ? revealGap : index === 1 ? firstNodeGap : decisionNodeIds.has(id) ? decisionGap : nodeGap;
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

function makeDesktopEdges(): Edge[] {
  const main = { stroke: '#FA008C', strokeWidth: 2.2 };
  const branch = { stroke: 'rgba(70, 10, 35, 0.24)', strokeWidth: 1.6 };
  const choice = { stroke: '#FA008C', strokeWidth: 1.8, strokeDasharray: '4 6' };

  return [
    { id: 'nori-market-reveal', source: 'nori', sourceHandle: 'l-source', target: 'market-reveal', targetHandle: 't-target', style: main, animated: true },
    { id: 'market-reveal-sokosumi', source: 'market-reveal', sourceHandle: 'b-source', target: 'sokosumi', targetHandle: 't-target', style: main, animated: true },
    { id: 'nori-academy-reveal', source: 'nori', sourceHandle: 'b-left-source', target: 'academy-reveal', targetHandle: 't-target', style: main, animated: true },
    { id: 'academy-reveal-learning', source: 'academy-reveal', sourceHandle: 'b-source', target: 'learning', targetHandle: 't-target', style: main, animated: true },
    { id: 'nori-protocol-reveal', source: 'nori', sourceHandle: 'r-source', target: 'protocol-reveal', targetHandle: 't-target', style: main, animated: true },
    { id: 'protocol-reveal-masumi', source: 'protocol-reveal', sourceHandle: 'b-source', target: 'masumi', targetHandle: 't-target', style: main, animated: true },
    { id: 'nori-agent-reveal', source: 'nori', sourceHandle: 'b-right-source', target: 'agent-reveal', targetHandle: 't-target', style: main, animated: true },
    { id: 'agent-reveal-agents', source: 'agent-reveal', sourceHandle: 'b-source', target: 'agents', targetHandle: 't-target', style: main, animated: true },
    { id: 'sokosumi-coworkers', source: 'sokosumi', sourceHandle: 'b-source', target: 'coworkers', targetHandle: 'l-target', style: branch },
    { id: 'sokosumi-pi', source: 'sokosumi', sourceHandle: 'b-source', target: 'pi-sokosumi', targetHandle: 'l-target', style: branch },
    { id: 'sokosumi-mcp', source: 'sokosumi', sourceHandle: 'b-source', target: 'sokosumi-mcp', targetHandle: 'l-target', style: branch },
    { id: 'learning-course', source: 'learning', sourceHandle: 'b-source', target: 'fundamentals-course', targetHandle: 't-target', style: branch },
    { id: 'learning-certificate', source: 'fundamentals-course', sourceHandle: 'b-source', target: 'learning-certificate', targetHandle: 't-target', style: branch },
    { id: 'masumi-build-agent', source: 'masumi', sourceHandle: 'b-source', target: 'build-agent', targetHandle: 't-target', style: branch },
    { id: 'build-agent-pay-choice', source: 'build-agent', sourceHandle: 'b-source', target: 'pay-choice', targetHandle: 't-target', style: branch },
    { id: 'pay-choice-mip003', source: 'pay-choice', sourceHandle: 'l-source', target: 'mip003', targetHandle: 't-target', style: choice },
    { id: 'pay-choice-x402', source: 'pay-choice', sourceHandle: 'r-source', target: 'x402', targetHandle: 't-target', style: choice },
    { id: 'mip003-host-choice', source: 'mip003', sourceHandle: 'b-source', target: 'host-choice', targetHandle: 'l-target', style: branch },
    { id: 'x402-host-choice', source: 'x402', sourceHandle: 'b-source', target: 'host-choice', targetHandle: 'r-target', style: branch },
    { id: 'host-choice-self-host', source: 'host-choice', sourceHandle: 'l-source', target: 'self-host', targetHandle: 't-target', style: choice },
    { id: 'host-choice-maas', source: 'host-choice', sourceHandle: 'r-source', target: 'maas', targetHandle: 't-target', style: choice },
    { id: 'self-host-register', source: 'self-host', sourceHandle: 'b-source', target: 'register-agent', targetHandle: 'l-target', style: branch },
    { id: 'maas-register', source: 'maas', sourceHandle: 'b-source', target: 'register-agent', targetHandle: 'r-target', style: branch },
    { id: 'agents-skills', source: 'agents', sourceHandle: 'b-source', target: 'skills', targetHandle: 't-target', style: branch },
    { id: 'skills-llms', source: 'skills', sourceHandle: 'b-source', target: 'llms', targetHandle: 't-target', style: branch },
  ].map((edge) => ({
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: edge.style.stroke },
    ...edge,
  }));
}

function makeCompactEdges(visible: Set<string>): Edge[] {
  const main = { stroke: '#FA008C', strokeWidth: 2 };
  const branch = { stroke: 'rgba(70, 10, 35, 0.2)', strokeWidth: 1.5 };
  const rootEdges: Edge[] = [
    { id: 'nori-market-reveal', source: 'nori', sourceHandle: 'b-left-source', target: 'market-reveal', targetHandle: 't-target' },
    { id: 'market-reveal-sokosumi', source: 'market-reveal', sourceHandle: 'b-source', target: 'sokosumi', targetHandle: 't-target' },
    { id: 'sokosumi-academy-reveal', source: 'sokosumi', sourceHandle: 'b-source', target: 'academy-reveal', targetHandle: 't-target' },
    { id: 'academy-reveal-learning', source: 'academy-reveal', sourceHandle: 'b-source', target: 'learning', targetHandle: 't-target' },
    { id: 'learning-protocol-reveal', source: 'learning', sourceHandle: 'b-source', target: 'protocol-reveal', targetHandle: 't-target' },
    { id: 'protocol-reveal-masumi', source: 'protocol-reveal', sourceHandle: 'b-source', target: 'masumi', targetHandle: 't-target' },
    { id: 'masumi-agent-reveal', source: 'masumi', sourceHandle: 'b-source', target: 'agent-reveal', targetHandle: 't-target' },
    { id: 'agent-reveal-agents', source: 'agent-reveal', sourceHandle: 'b-source', target: 'agents', targetHandle: 't-target' },
  ].map((edge) => ({
    ...edge,
    style: main,
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: main.stroke },
  }));
  const protocolChoiceEdges: Edge[] = visible.has('build-agent')
    ? [
        { id: 'masumi-build-agent', source: 'masumi', sourceHandle: 'b-source', target: 'build-agent', targetHandle: 't-target' },
      ].map((edge) => ({
        ...edge,
        style: branch,
        markerEnd: { type: MarkerType.ArrowClosed, color: branch.stroke },
      }))
    : [];
  const groups = [
    ['sokosumi', 'coworkers', 'pi-sokosumi', 'sokosumi-mcp'],
    ['learning', 'fundamentals-course', 'learning-certificate'],
    ['build-agent', 'pay-choice', 'mip003', 'x402', 'host-choice', 'self-host', 'maas', 'register-agent'],
    ['agents', 'skills', 'llms'],
  ];
  const branchEdges = groups.flatMap((group) => {
    const ids = group.filter((id) => visible.has(id));
    return ids.slice(0, -1).map((source, index) => ({
      id: `${source}-${ids[index + 1]}`,
      source,
      sourceHandle: 'b-source',
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
    academy: false,
    protocol: false,
    agent: false,
    pay: false,
    host: false,
  });
  const toggleSection = useCallback(
    (key: SectionKey) => setExpanded((state) => ({ ...state, [key]: !state[key] })),
    [],
  );
  const visible = useMemo(() => visibleNodeIds(expanded), [expanded]);
  const visibleLinear = useMemo(
    () => {
      const ids = linearNodeIds.filter((id) => visible.has(id));
      if (layout === 'desktop') return ids;
      return ids.flatMap((id) => {
        const reveal = rootRevealNodes.find(({ target }) => target === id);
        return reveal ? [reveal.id, id] : [id];
      });
    },
    [layout, visible],
  );
  const positions = useMemo(
    () => (layout === 'desktop' ? makeDesktopPositions(expanded) : makeLinearPositions(layout, visibleLinear)),
    [layout, expanded, visibleLinear],
  );
  const shellHeight = Math.max(...visibleLinear.map((id) => positions[id].y)) + 250;
  const width = layout === 'mobile' ? 264 : compact ? 420 : 200;
  const decisionWidth = compact ? Math.min(width, 260) : 190;

  const nodes = useMemo<RoadmapFlowNode[]>(() => {
    let ordinal = 0;
    const revealWidth = compact ? Math.min(width, 176) : 150;
    const desktopRevealPositions: Record<string, { x: number; y: number }> = {
      'market-reveal': { x: 91, y: 280 },
      'academy-reveal': { x: 321, y: 280 },
      'agent-reveal': { x: 551, y: 280 },
      'protocol-reveal': { x: 781, y: 280 },
    };
    const revealNodes = rootRevealNodes.map(({ id, title, tone, sectionKey }) => {
      const position = compact
        ? { x: positions[id].x + (width - revealWidth) / 2, y: positions[id].y }
        : desktopRevealPositions[id];
      return makeNode(id, 'reveal', position, {
        title,
        href: '#',
        eyebrow: 'Reveal section',
        tone,
        sectionKey,
        expanded: expanded[sectionKey],
        onToggle: () => toggleSection(sectionKey),
      }, revealWidth);
    });
    const standardNodes = nodeIds.flatMap((id, index) => {
      const data = roadmapNodeData[index];
      if (!data.decision) ordinal += 1;
      if (!visible.has(id)) return [];
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
      ...revealNodes,
      ...standardNodes,
    ];
  }, [compact, decisionWidth, expanded, positions, toggleSection, visible, width]);

  const edges = useMemo(
    () =>
      compact
        ? makeCompactEdges(visible)
        : makeDesktopEdges().filter(
            (edge) => visible.has(edge.source) && visible.has(edge.target),
          ),
    [compact, expanded, visible, visibleLinear],
  );

  return (
    <section className="dev-flow-shell" data-layout={layout} style={{ height: shellHeight }} aria-label="Developer hub map graph">
      <ReactFlow
        key={layout}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
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

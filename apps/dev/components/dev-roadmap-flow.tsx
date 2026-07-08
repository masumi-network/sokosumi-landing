'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Boxes,
  Braces,
  Code2,
  CreditCard,
  FileText,
  Handshake,
  Network,
  Sparkles,
  SquareTerminal,
  WalletCards,
  Workflow,
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
type RoadmapNodeKind = 'roadmap' | 'nori' | 'core';
type RoadmapLayout = 'desktop' | 'compact' | 'mobile';

interface RoadmapNodeData extends Record<string, unknown> {
  title: string;
  href: string;
  eyebrow: string;
  indexLabel?: string;
  description?: string;
  icon?: LucideIcon;
  tone: RoadmapTone;
  parent?: boolean;
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
    title: 'MaaS',
    href: '/masumi/documentation/get-started/masumi-as-a-service',
    eyebrow: 'Key page',
    description: 'Hosted Masumi infrastructure.',
    icon: Boxes,
    tone: 'masumi',
  },
  {
    title: 'Payment flow',
    href: '/masumi/core-concepts/payments',
    eyebrow: 'Key page',
    description: 'Purchase requests, escrow, settlement, and disputes.',
    icon: CreditCard,
    tone: 'masumi',
  },
  {
    title: 'Register agent',
    href: '/masumi/documentation/get-started/register-agent',
    eyebrow: 'Key page',
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
];

const nodeIds = [
  'sokosumi',
  'coworkers',
  'pi-sokosumi',
  'sokosumi-mcp',
  'masumi',
  'maas',
  'payment-flow',
  'register-agent',
  'agents',
  'skills',
  'llms',
  'api-reference',
  'cli',
  'wallets',
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

function RoadmapNode({ data }: NodeProps<RoadmapFlowNode>) {
  const Icon = data.icon ?? FileText;

  return (
    <Link
      href={data.href}
      className="dev-flow-node"
      data-tone={data.tone}
      data-parent={data.parent ? 'true' : 'false'}
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

function NoriNode({ data }: NodeProps<RoadmapFlowNode>) {
  return (
    <Link href="/ask" className="dev-flow-nori-node">
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

function CoreNode({ data }: NodeProps<RoadmapFlowNode>) {
  return (
    <Link href={data.href} className="dev-flow-core-node" aria-current="page">
      <RoadmapHandles />
      <span className="dev-flow-node-top">
        <span className="dev-flow-node-index">00</span>
        <span className="dev-flow-node-dot" />
      </span>
      <span className="dev-flow-core-copy">
        <small>{data.eyebrow}</small>
        <strong>{data.title}</strong>
      </span>
      <span className="dev-flow-core-mini" aria-hidden="true">
        <span><Code2 /> docs</span>
        <span><CreditCard /> pay</span>
        <span><Bot /> agents</span>
      </span>
    </Link>
  );
}

const nodeTypes = {
  roadmap: RoadmapNode,
  nori: NoriNode,
  core: CoreNode,
};

const desktopPositions: Record<string, { x: number; y: number }> = {
  nori: { x: 372, y: 0 },
  core: { x: 428, y: 348 },
  sokosumi: { x: 28, y: 430 },
  coworkers: { x: 86, y: 690 },
  'pi-sokosumi': { x: 86, y: 925 },
  'sokosumi-mcp': { x: 86, y: 1160 },
  masumi: { x: 790, y: 430 },
  maas: { x: 806, y: 690 },
  'payment-flow': { x: 806, y: 925 },
  'register-agent': { x: 806, y: 1160 },
  agents: { x: 428, y: 1060 },
  skills: { x: 290, y: 1395 },
  llms: { x: 566, y: 1395 },
  'api-reference': { x: 28, y: 1635 },
  cli: { x: 428, y: 1635 },
  wallets: { x: 790, y: 1635 },
};

const linearNodeIds = ['nori', 'core', ...nodeIds];

function makeLinearPositions(layout: Extract<RoadmapLayout, 'compact' | 'mobile'>) {
  const noriGap = layout === 'mobile' ? 336 : 424;
  const firstNodeGap = layout === 'mobile' ? 262 : 258;
  const nodeGap = layout === 'mobile' ? 232 : 216;

  return Object.fromEntries(
    linearNodeIds.map((id, index) => {
      if (index === 0) return [id, { x: 0, y: 0 }];
      if (index === 1) return [id, { x: 0, y: noriGap }];
      return [id, { x: 0, y: noriGap + firstNodeGap + (index - 2) * nodeGap }];
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
    style: { width },
  };
}

function makeDesktopEdges(): Edge[] {
  const main = { stroke: '#FA008C', strokeWidth: 2.2 };
  const branch = { stroke: 'rgba(70, 10, 35, 0.24)', strokeWidth: 1.6 };
  const utility = { stroke: 'rgba(0, 0, 0, 0.18)', strokeWidth: 1.4, strokeDasharray: '6 7' };

  return [
    { id: 'nori-core', source: 'nori', sourceHandle: 'b-source', target: 'core', targetHandle: 't-target', style: main, animated: true },
    { id: 'core-sokosumi', source: 'core', sourceHandle: 'l-source', target: 'sokosumi', targetHandle: 'r-target', style: main },
    { id: 'core-masumi', source: 'core', sourceHandle: 'r-source', target: 'masumi', targetHandle: 'l-target', style: main },
    { id: 'core-agents', source: 'core', sourceHandle: 'b-source', target: 'agents', targetHandle: 't-target', style: main },
    { id: 'sokosumi-coworkers', source: 'sokosumi', sourceHandle: 'b-source', target: 'coworkers', targetHandle: 'l-target', style: branch },
    { id: 'sokosumi-pi', source: 'sokosumi', sourceHandle: 'b-source', target: 'pi-sokosumi', targetHandle: 'l-target', style: branch },
    { id: 'sokosumi-mcp', source: 'sokosumi', sourceHandle: 'b-source', target: 'sokosumi-mcp', targetHandle: 'l-target', style: branch },
    { id: 'masumi-maas', source: 'masumi', sourceHandle: 'b-source', target: 'maas', targetHandle: 'r-target', style: branch },
    { id: 'masumi-payment', source: 'masumi', sourceHandle: 'b-source', target: 'payment-flow', targetHandle: 'r-target', style: branch },
    { id: 'masumi-register', source: 'masumi', sourceHandle: 'b-source', target: 'register-agent', targetHandle: 'r-target', style: branch },
    { id: 'agents-skills', source: 'agents', sourceHandle: 'l-source', target: 'skills', targetHandle: 'r-target', style: branch },
    { id: 'agents-llms', source: 'agents', sourceHandle: 'r-source', target: 'llms', targetHandle: 'l-target', style: branch },
    { id: 'agents-api', source: 'agents', sourceHandle: 'b-source', target: 'api-reference', targetHandle: 't-target', style: utility },
    { id: 'agents-cli', source: 'agents', sourceHandle: 'b-source', target: 'cli', targetHandle: 't-target', style: utility },
    { id: 'agents-wallets', source: 'agents', sourceHandle: 'b-source', target: 'wallets', targetHandle: 't-target', style: utility },
  ].map((edge) => ({
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: edge.style.stroke },
    ...edge,
  }));
}

function makeCompactEdges(): Edge[] {
  return linearNodeIds.slice(0, -1).map((source, index) => ({
    id: `${source}-${linearNodeIds[index + 1]}`,
    source,
    sourceHandle: 'b-source',
    target: linearNodeIds[index + 1],
    targetHandle: 't-target',
    type: 'smoothstep',
    style: { stroke: index < 2 ? '#FA008C' : 'rgba(70, 10, 35, 0.2)', strokeWidth: index < 2 ? 2 : 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: index < 2 ? '#FA008C' : 'rgba(70, 10, 35, 0.28)' },
  }));
}

export function DevRoadmapFlow() {
  const layout = useRoadmapLayout();
  const compact = layout !== 'desktop';
  const shellHeight = layout === 'desktop' ? 1880 : 3920;
  const positions = useMemo(
    () => (layout === 'desktop' ? desktopPositions : makeLinearPositions(layout)),
    [layout],
  );
  const width = layout === 'mobile' ? 304 : compact ? 520 : 246;

  const nodes = useMemo<RoadmapFlowNode[]>(() => {
    const standardNodes = nodeIds.map((id, index) => {
      const data = roadmapNodeData[index];
      const indexLabel = data.indexLabel ?? String(index + 1).padStart(2, '0');
      const parentWidth = compact ? width : 286;
      const utilityWidth = compact ? width : id === 'cli' ? 260 : 246;
      const nodeWidth = data.parent ? parentWidth : data.tone === 'utility' ? utilityWidth : width;
      return makeNode(id, 'roadmap', positions[id], { ...data, indexLabel }, nodeWidth);
    });

    return [
      makeNode('nori', 'nori', positions.nori, {
        title: 'Ask Nori',
        href: '/ask',
        eyebrow: 'Ask Nori',
        indexLabel: 'NORI',
        tone: 'masumi',
        tiltMode: compact ? 'device' : 'pointer',
      }, compact ? width : 380),
      makeNode('core', 'core', positions.core, {
        title: 'Build, pay, hire, verify.',
        href: '/map',
        eyebrow: 'Start here',
        indexLabel: '00',
        tone: 'masumi',
      }, compact ? width : 276),
      ...standardNodes,
    ];
  }, [compact, positions, width]);

  const edges = useMemo(() => (compact ? makeCompactEdges() : makeDesktopEdges()), [compact]);

  return (
    <section className="dev-flow-shell" data-layout={layout} style={{ height: shellHeight }} aria-label="Developer hub map graph">
      <ReactFlow
        key={layout}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView={!compact}
        fitViewOptions={{ padding: 0.08 }}
        defaultViewport={compact ? { x: layout === 'mobile' ? 14 : 42, y: 24, zoom: layout === 'mobile' ? 0.94 : 0.92 } : undefined}
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

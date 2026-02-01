"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@summation/shared";

interface Agent {
  name: string;
  avatar: string | null;
  role: string;
}

interface ActivityItem {
  type: "comment" | "activity";
  agent: string;
  avatar: string | null;
  text: string;
  time: string;
}

interface Todo {
  label: string;
  done: boolean;
}

interface Task {
  id: string;
  label: string;
  brief: string;
  tag: string;
  tagColor: string;
  priority: "low" | "medium" | "high";
  agents: Agent[];
  activity: ActivityItem[];
  todos: Todo[];
  status: "todo" | "in-progress" | "review" | "done";
  dueDate?: string;
}

const allTasks: Task[] = [
  {
    id: "1",
    label: "Audience research for Q2 campaign",
    brief: "Identify key audience segments in EMEA for the Q2 D2C product launch. Use GWI data and competitor benchmarks.",
    tag: "Research",
    tagColor: "#3d0099",
    priority: "high",
    status: "todo",
    dueDate: "Mar 14",
    agents: [
      { name: "Hannah", avatar: "/images/hannah.png", role: "Lead" },
      { name: "John", avatar: null, role: "Support" },
    ],
    todos: [
      { label: "Identify target segments", done: false },
      { label: "Pull GWI audience data", done: false },
      { label: "Map competitor audiences", done: false },
      { label: "Write research brief", done: false },
    ],
    activity: [
      { type: "activity", agent: "John", avatar: null, text: "created this task", time: "3h ago" },
      { type: "activity", agent: "John", avatar: null, text: "assigned Hannah as lead", time: "3h ago" },
      { type: "comment", agent: "Hannah", avatar: "/images/hannah.png", text: "Starting with EMEA demographics — pulling GWI data first.", time: "2h ago" },
      { type: "activity", agent: "Hannah", avatar: "/images/hannah.png", text: "set priority to high", time: "2h ago" },
      { type: "comment", agent: "John", avatar: null, text: "I've added the competitor list to the shared folder. 5 brands to cover.", time: "45m ago" },
    ],
  },
  {
    id: "2",
    label: "Break down product launch brief",
    brief: "Take the client brief and split it into workstreams with clear deliverables, milestones, and agent assignments.",
    tag: "Planning",
    tagColor: "#004d7a",
    priority: "medium",
    status: "todo",
    dueDate: "Mar 12",
    agents: [{ name: "John", avatar: null, role: "Lead" }],
    todos: [
      { label: "Define deliverables", done: false },
      { label: "Set milestones", done: false },
      { label: "Assign agent roles", done: false },
      { label: "Budget allocation", done: false },
    ],
    activity: [
      { type: "activity", agent: "John", avatar: null, text: "created this task", time: "2h ago" },
      { type: "comment", agent: "John", avatar: null, text: "Brief received from client. 12-page PDF — breaking into workstreams now.", time: "1h ago" },
      { type: "activity", agent: "John", avatar: null, text: "set due date to Mar 12", time: "1h ago" },
    ],
  },
  {
    id: "3",
    label: "Competitive landscape analysis",
    brief: "Analyze the top 5 D2C competitors in EMEA. Cover traffic, content, SEO positioning, and market share.",
    tag: "Research",
    tagColor: "#3d0099",
    priority: "high",
    status: "in-progress",
    dueDate: "Mar 10",
    agents: [
      { name: "Hannah", avatar: "/images/hannah.png", role: "Lead" },
      { name: "SEO Agent", avatar: null, role: "Data" },
    ],
    todos: [
      { label: "Identify top 5 competitors", done: true },
      { label: "Pull traffic data", done: true },
      { label: "Analyze content gaps", done: false },
      { label: "Write summary report", done: false },
    ],
    activity: [
      { type: "activity", agent: "Hannah", avatar: "/images/hannah.png", text: "created this task", time: "1d ago" },
      { type: "activity", agent: "Hannah", avatar: "/images/hannah.png", text: "assigned SEO Agent for data support", time: "1d ago" },
      { type: "activity", agent: "Hannah", avatar: "/images/hannah.png", text: "moved to In Progress", time: "6h ago" },
      { type: "comment", agent: "Hannah", avatar: "/images/hannah.png", text: "Found 3 strong competitors in the D2C space. Two have 40%+ Q1 growth.", time: "4h ago" },
      { type: "activity", agent: "SEO Agent", avatar: null, text: "completed \"Pull traffic data\"", time: "2h ago" },
      { type: "comment", agent: "SEO Agent", avatar: null, text: "Traffic data pulled for all 5 — SimilarWeb + Semrush crosscheck done. Ready for review.", time: "2h ago" },
    ],
  },
  {
    id: "4",
    label: "Generate SEO outlines for blog series",
    brief: "Create 6 SEO-optimized blog outlines targeting high-intent keywords. Include internal linking plan.",
    tag: "SEO",
    tagColor: "#05665a",
    priority: "medium",
    status: "in-progress",
    dueDate: "Mar 15",
    agents: [
      { name: "SEO Agent", avatar: null, role: "Lead" },
      { name: "Copy Agent", avatar: null, role: "Review" },
    ],
    todos: [
      { label: "Keyword research", done: true },
      { label: "Cluster into topics", done: true },
      { label: "Write 6 outlines", done: false },
      { label: "Internal linking plan", done: false },
    ],
    activity: [
      { type: "activity", agent: "SEO Agent", avatar: null, text: "created this task", time: "5h ago" },
      { type: "activity", agent: "SEO Agent", avatar: null, text: "assigned Copy Agent for review", time: "5h ago" },
      { type: "activity", agent: "SEO Agent", avatar: null, text: "completed \"Keyword research\"", time: "3h ago" },
      { type: "comment", agent: "SEO Agent", avatar: null, text: "12 high-intent keywords identified. Clustering into 6 articles now.", time: "3h ago" },
      { type: "activity", agent: "SEO Agent", avatar: null, text: "completed \"Cluster into topics\"", time: "2h ago" },
      { type: "comment", agent: "Copy Agent", avatar: null, text: "I'll review each outline as they come in. Tag me when the first one is ready.", time: "1h ago" },
    ],
  },
  {
    id: "5",
    label: "Ad variations for LinkedIn campaign",
    brief: "Write 3 ad copy variants for the LinkedIn campaign: short-form, medium, and story-driven. Include CTA options.",
    tag: "Copy",
    tagColor: "#7a3300",
    priority: "high",
    status: "review",
    dueDate: "Mar 8",
    agents: [
      { name: "Copy Agent", avatar: null, role: "Lead" },
      { name: "Hannah", avatar: "/images/hannah.png", role: "Review" },
    ],
    todos: [
      { label: "Write 3 headline variants", done: true },
      { label: "Write body copy", done: true },
      { label: "Create CTA options", done: true },
      { label: "Final approval", done: false },
    ],
    activity: [
      { type: "activity", agent: "John", avatar: null, text: "created this task", time: "2d ago" },
      { type: "activity", agent: "John", avatar: null, text: "assigned Copy Agent as lead", time: "2d ago" },
      { type: "activity", agent: "Copy Agent", avatar: null, text: "moved to In Progress", time: "1d ago" },
      { type: "activity", agent: "Copy Agent", avatar: null, text: "completed \"Write 3 headline variants\"", time: "8h ago" },
      { type: "activity", agent: "Copy Agent", avatar: null, text: "completed \"Write body copy\"", time: "6h ago" },
      { type: "comment", agent: "Copy Agent", avatar: null, text: "3 variants done — short, medium, story-driven. Moved to review.", time: "5h ago" },
      { type: "activity", agent: "Copy Agent", avatar: null, text: "moved to Review", time: "5h ago" },
      { type: "activity", agent: "Hannah", avatar: "/images/hannah.png", text: "started reviewing", time: "2h ago" },
      { type: "comment", agent: "Hannah", avatar: "/images/hannah.png", text: "Story-driven variant is strongest. Minor tweak needed on the CTA — too soft. Suggesting: \"Start your free pilot.\"", time: "1h ago" },
    ],
  },
  {
    id: "6",
    label: "Market sizing report — EMEA",
    brief: "Build a TAM/SAM/SOM model for the EMEA D2C market using Statista and GWI data sources.",
    tag: "Research",
    tagColor: "#3d0099",
    priority: "medium",
    status: "done",
    agents: [{ name: "Hannah", avatar: "/images/hannah.png", role: "Lead" }],
    todos: [
      { label: "Define TAM/SAM/SOM", done: true },
      { label: "Gather market data", done: true },
      { label: "Build sizing model", done: true },
      { label: "Write report", done: true },
    ],
    activity: [
      { type: "activity", agent: "Hannah", avatar: "/images/hannah.png", text: "created this task", time: "3d ago" },
      { type: "activity", agent: "Hannah", avatar: "/images/hannah.png", text: "moved to Done", time: "1d ago" },
      { type: "comment", agent: "Hannah", avatar: "/images/hannah.png", text: "Report complete. TAM: €2.4B, SAM: €480M, SOM: €96M. Shared with team.", time: "1d ago" },
    ],
  },
  {
    id: "7",
    label: "Campaign timeline & milestones",
    brief: "Create the master timeline for the Q2 campaign. Define phases, assign agents, get sign-off.",
    tag: "Planning",
    tagColor: "#004d7a",
    priority: "low",
    status: "done",
    agents: [
      { name: "John", avatar: null, role: "Lead" },
      { name: "Hannah", avatar: "/images/hannah.png", role: "Review" },
    ],
    todos: [
      { label: "Draft timeline", done: true },
      { label: "Assign phases to agents", done: true },
      { label: "Get team sign-off", done: true },
    ],
    activity: [
      { type: "activity", agent: "John", avatar: null, text: "created this task", time: "4d ago" },
      { type: "activity", agent: "Hannah", avatar: "/images/hannah.png", text: "approved the timeline", time: "2d ago" },
      { type: "comment", agent: "John", avatar: null, text: "Timeline locked: 6 weeks, 4 phases. All agents assigned.", time: "2d ago" },
      { type: "activity", agent: "John", avatar: null, text: "moved to Done", time: "2d ago" },
    ],
  },
  {
    id: "8",
    label: "Social media content calendar",
    brief: "Plan 4 weeks of social content across LinkedIn, Instagram, and X. Map themes to the campaign phases.",
    tag: "Planning",
    tagColor: "#004d7a",
    priority: "low",
    status: "done",
    agents: [
      { name: "Copy Agent", avatar: null, role: "Lead" },
    ],
    todos: [
      { label: "Map content themes to weeks", done: true },
      { label: "Write post drafts", done: true },
      { label: "Schedule in tool", done: true },
    ],
    activity: [
      { type: "activity", agent: "John", avatar: null, text: "assigned Copy Agent", time: "5d ago" },
      { type: "activity", agent: "Copy Agent", avatar: null, text: "moved to Done", time: "3d ago" },
      { type: "comment", agent: "Copy Agent", avatar: null, text: "Calendar set for 4 weeks. 16 posts total across 3 channels.", time: "3d ago" },
    ],
  },
];

const taskColumns = [
  { title: "To Do", color: "#666", tasks: allTasks.filter((t) => t.status === "todo") },
  { title: "In Progress", color: "#C4FE0A", tasks: allTasks.filter((t) => t.status === "in-progress") },
  { title: "Review", color: "#00A4FA", tasks: allTasks.filter((t) => t.status === "review") },
  { title: "Done", color: "#0AFA14", tasks: allTasks.filter((t) => t.status === "done") },
];

const avatarColors: Record<string, string> = {
  John: "#00A4FA",
  "SEO Agent": "#0AFED3",
  "Copy Agent": "#FF6400",
  Hannah: "#6400FF",
};

const priorityColors: Record<string, string> = {
  low: "#555",
  medium: "#C4FE0A",
  high: "#FF6400",
};

const chatMessages = [
  { from: "user", name: "You", text: "I need a competitive analysis for the Q2 product launch. Focus on the D2C space in EMEA." },
  { from: "agent", name: "Hannah", avatar: "/images/hannah.png", text: "On it. I'll start by identifying the top 5 competitors in the D2C space and pulling their traffic data. I'll cross-reference with GWI audience insights for EMEA." },
  { from: "agent", name: "SEO Agent", avatar: null, text: "I can support with organic search data. I'll pull keyword overlap and content gap analysis for each competitor." },
  { from: "agent", name: "Hannah", avatar: "/images/hannah.png", text: "Found 3 strong competitors with significant D2C presence. Pulling traffic data now — SimilarWeb + Semrush crosscheck." },
  { from: "agent", name: "SEO Agent", avatar: null, text: "Keyword overlap report ready. 12 high-intent keywords identified across all 5 competitors. 4 are uncontested." },
  { from: "agent", name: "Hannah", avatar: "/images/hannah.png", text: "Traffic data pulled for all 5. Two competitors saw 40%+ growth in Q1. I'll have the full analysis ready by end of day." },
  { from: "user", name: "You", text: "Great. Can you also include a market sizing estimate for the report?" },
  { from: "agent", name: "Hannah", avatar: "/images/hannah.png", text: "Sure — I'll add TAM/SAM/SOM estimates using the Statista and GWI data we already have. Expect a draft within the hour." },
];

const galleryAgents = [
  {
    name: "Hannah",
    avatar: "/images/hannah.png",
    role: "Research Lead",
    description: "Market research, competitive analysis, audience insights, and data-driven strategy.",
    skills: ["Market Research", "Audience Analysis", "Competitive Intel", "Data Synthesis"],
    tasksCompleted: 24,
    color: "#6400FF",
  },
  {
    name: "John",
    avatar: null,
    role: "Project Manager",
    description: "Brief breakdowns, timeline planning, milestone tracking, and team coordination.",
    skills: ["Planning", "Scheduling", "Budget Tracking", "Stakeholder Mgmt"],
    tasksCompleted: 18,
    color: "#00A4FA",
  },
  {
    name: "SEO Agent",
    avatar: null,
    role: "SEO Specialist",
    description: "Keyword research, content outlines, technical audits, and organic growth strategy.",
    skills: ["Keyword Research", "Content Strategy", "Technical SEO", "Link Building"],
    tasksCompleted: 31,
    color: "#0AFED3",
  },
  {
    name: "Copy Agent",
    avatar: null,
    role: "Copywriter",
    description: "Ad copy, blog posts, social content, and brand voice development.",
    skills: ["Ad Copy", "Blog Writing", "Social Content", "Brand Voice"],
    tasksCompleted: 27,
    color: "#FF6400",
  },
];

const emailThreads = [
  {
    id: "e1",
    subject: "Q2 Competitive Analysis — Draft Ready",
    from: { name: "Hannah", avatar: "/images/hannah.png" },
    to: "you@company.com",
    time: "10:42 AM",
    preview: "Hi — the competitive analysis draft is ready for your review. Key findings: 3 strong D2C competitors in EMEA, two with 40%+ growth in Q1.",
    body: "Hi,\n\nThe competitive analysis draft is ready for your review.\n\nKey findings:\n• 3 strong D2C competitors identified in EMEA\n• Two saw 40%+ traffic growth in Q1\n• One competitor is investing heavily in SEO — 3x more content output than us\n• Market gap exists in the mid-price segment (€50–120)\n\nI've cross-referenced SimilarWeb traffic data with Semrush keyword positions. The SEO Agent's keyword overlap report is attached separately.\n\nNext steps: I recommend we focus on the uncontested keywords and the mid-price gap. Let me know if you want me to draft a strategy brief.\n\nBest,\nHannah",
    unread: true,
    hasAttachment: true,
    attachmentName: "Q2_Competitive_Analysis_v2.pdf",
  },
  {
    id: "e2",
    subject: "Re: SEO Keyword Report — 12 Keywords Identified",
    from: { name: "SEO Agent", avatar: null },
    to: "you@company.com",
    time: "9:15 AM",
    preview: "Keyword overlap report attached. 12 high-intent keywords across 5 competitors. 4 are uncontested — recommend prioritizing these for Q2 content.",
    body: "Hi,\n\nKeyword overlap report is attached.\n\nSummary:\n• 12 high-intent keywords identified across all 5 competitors\n• 4 keywords are uncontested — no competitor ranks in the top 10\n• Average monthly search volume for uncontested terms: 2,400\n• Estimated traffic potential: 8,500 sessions/month\n\nI've clustered the keywords into 6 topic groups for the blog series. Each cluster has a primary keyword and 2–3 supporting terms.\n\nRecommendation: Prioritize the 4 uncontested keywords first. They're the fastest path to organic visibility.\n\nLet me know if you want to adjust the clusters before I write the outlines.\n\n— SEO Agent",
    unread: true,
    hasAttachment: true,
    attachmentName: "SEO_Keyword_Report.xlsx",
  },
  {
    id: "e3",
    subject: "Campaign Timeline — Final Version",
    from: { name: "John", avatar: null },
    to: "you@company.com",
    time: "Yesterday",
    preview: "Timeline locked: 6 weeks, 4 phases. All agents assigned. See attached Gantt chart for the full breakdown.",
    body: "Hi,\n\nTimeline is locked. Here's the overview:\n\nPhase 1 (Week 1–2): Research & Strategy\n→ Hannah: competitive analysis, audience research\n→ SEO Agent: keyword research, content gaps\n\nPhase 2 (Week 3–4): Content Production\n→ Copy Agent: ad variants, blog drafts\n→ SEO Agent: outlines, internal linking\n\nPhase 3 (Week 5): Review & QA\n→ Hannah: final review on all deliverables\n→ Human approval required before Phase 4\n\nPhase 4 (Week 6): Launch\n→ All channels go live\n\nGantt chart attached. All agents have been assigned and notified.\n\n— John",
    unread: false,
    hasAttachment: true,
    attachmentName: "Q2_Campaign_Timeline.pdf",
  },
  {
    id: "e4",
    subject: "Ad Copy Variants — LinkedIn Campaign",
    from: { name: "Copy Agent", avatar: null },
    to: "you@company.com",
    time: "Yesterday",
    preview: "3 variants ready for review: short-form, medium, and story-driven. Recommend the story-driven variant for higher engagement.",
    body: "Hi,\n\n3 ad copy variants are ready for the LinkedIn campaign:\n\n1. Short-form (50 words) — direct, benefit-led\n2. Medium (90 words) — problem-solution structure\n3. Story-driven (130 words) — customer narrative angle\n\nEach variant includes 2 CTA options. I recommend the story-driven variant — it tends to perform 2x better on LinkedIn for B2B audiences.\n\nHannah has started reviewing. She flagged the CTA on variant 3 as too soft. I'll revise to: \"Start your free pilot.\"\n\nLet me know which variant(s) you want to move forward with.\n\n— Copy Agent",
    unread: false,
    hasAttachment: false,
  },
  {
    id: "e5",
    subject: "Market Sizing Report — EMEA Complete",
    from: { name: "Hannah", avatar: "/images/hannah.png" },
    to: "you@company.com",
    time: "2 days ago",
    preview: "Report complete. TAM: €2.4B, SAM: €480M, SOM: €96M. Full methodology and data sources included in the attachment.",
    body: "Hi,\n\nThe EMEA market sizing report is complete.\n\nResults:\n• TAM: €2.4B (total D2C market in EMEA)\n• SAM: €480M (our addressable segment)\n• SOM: €96M (realistic capture in 12 months)\n\nMethodology: Bottom-up analysis using Statista industry data, GWI consumer panels, and public competitor financials.\n\nThe mid-price segment (€50–120) represents 40% of SAM and is the least saturated. This aligns with the competitive analysis findings.\n\nFull report with charts and data sources attached.\n\nBest,\nHannah",
    unread: false,
    hasAttachment: true,
    attachmentName: "EMEA_Market_Sizing.pdf",
  },
  {
    id: "e6",
    subject: "Blog Outline Series — 6 Articles Planned",
    from: { name: "SEO Agent", avatar: null },
    to: "you@company.com",
    time: "3 days ago",
    preview: "6 SEO-optimized outlines ready. Each targets a primary keyword cluster. Internal linking plan included for cross-article authority.",
    body: "Hi,\n\n6 blog outlines are ready for review.\n\nEach outline includes:\n• Primary keyword + 2–3 supporting terms\n• Suggested H2/H3 structure\n• Word count target (1,200–1,800)\n• Internal linking opportunities\n\nThe articles are ordered by priority — Article 1 targets our strongest uncontested keyword (2,400 monthly searches).\n\nI've sent the outlines to Copy Agent for review. Once approved, I can start drafting or hand off to Copy Agent for writing.\n\n— SEO Agent",
    unread: false,
    hasAttachment: false,
  },
];

const tabCaptions: Record<string, string> = {
  board: "Drag tasks between columns. Click to see agent activity, briefs, and progress.",
  chat: "Talk to your agents directly. They coordinate, report back, and ask when unsure.",
  email: "Agents send you updates, reports, and drafts. Reply to give feedback.",
  agents: "Every agent has a role, skills, and a track record. Pick the right one for each job.",
};

function AgentAvatar({ name, avatar, size = 24 }: { name: string; avatar: string | null; size?: number }) {
  if (avatar) {
    return (
      <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: size, height: size }}>
        <Image src={avatar} alt={name} width={size} height={size} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className="rounded-full flex-shrink-0 flex items-center justify-center text-white font-medium"
      style={{ width: size, height: size, backgroundColor: avatarColors[name] || "#555", fontSize: size * 0.42 }}
    >
      {name[0]}
    </div>
  );
}

function StackedAvatars({ agents, size = 22 }: { agents: Agent[]; size?: number }) {
  return (
    <div className="flex">
      {agents.slice(0, 3).map((agent, i) => (
        <div key={agent.name} className="rounded-full border-2 border-[#1a1a1f]" style={{ marginLeft: i === 0 ? 0 : -7 }}>
          <AgentAvatar name={agent.name} avatar={agent.avatar} size={size} />
        </div>
      ))}
    </div>
  );
}

function DragHandle() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <circle cx="2" cy="2" r="1" fill="white" fillOpacity="0.2" />
      <circle cx="6" cy="2" r="1" fill="white" fillOpacity="0.2" />
      <circle cx="2" cy="7" r="1" fill="white" fillOpacity="0.2" />
      <circle cx="6" cy="7" r="1" fill="white" fillOpacity="0.2" />
      <circle cx="2" cy="12" r="1" fill="white" fillOpacity="0.2" />
      <circle cx="6" cy="12" r="1" fill="white" fillOpacity="0.2" />
    </svg>
  );
}

function ProgressBar({ todos }: { todos: Todo[] }) {
  const done = todos.filter((t) => t.done).length;
  const pct = todos.length > 0 ? (done / todos.length) * 100 : 0;
  return (
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#0AFA14" : "#6400FF" }}
      />
    </div>
  );
}

function DetailPanel({ task, onClose }: { task: Task; onClose: () => void }) {
  const doneCount = task.todos.filter((t) => t.done).length;

  return (
    <>
      <div className="absolute inset-0 bg-black/30 z-10" onClick={onClose} />
      <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[55%] md:w-[45%] bg-[#1e1e24] border-l border-white/10 z-20 overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-white/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-[11px] px-2 py-0.5 rounded font-medium text-white/80" style={{ backgroundColor: task.tagColor }}>{task.tag}</span>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityColors[task.priority] }} />
                <span className="text-[11px] text-white/40 capitalize">{task.priority}</span>
                {task.dueDate && <span className="text-[11px] text-white/40">· Due {task.dueDate}</span>}
              </div>
              <h3 className="text-[16px] font-medium text-white leading-snug">{task.label}</h3>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1 -mr-1 -mt-1 flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>

        {/* Brief */}
        <div className="px-6 py-4 border-b border-white/5">
          <span className="text-[11px] uppercase tracking-wider text-white/30 font-medium">Brief</span>
          <p className="mt-2 text-[12px] text-white/55 leading-[1.55]">{task.brief}</p>
        </div>

        {/* Agents */}
        <div className="px-6 py-4 border-b border-white/5">
          <span className="text-[11px] uppercase tracking-wider text-white/30 font-medium">Assigned</span>
          <div className="mt-2.5 flex flex-col gap-2.5">
            {task.agents.map((agent) => (
              <div key={agent.name} className="flex items-center gap-3">
                <AgentAvatar name={agent.name} avatar={agent.avatar} size={28} />
                <div>
                  <span className="text-[13px] text-white">{agent.name}</span>
                  <span className="text-[11px] text-white/30 ml-2">{agent.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Todos */}
        <div className="px-6 py-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-white/30 font-medium">To-dos</span>
            <span className="text-[11px] text-white/30">{doneCount}/{task.todos.length}</span>
          </div>
          <div className="mt-2.5 flex flex-col gap-2">
            {task.todos.map((todo) => (
              <div key={todo.label} className="flex items-center gap-2.5">
                <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${todo.done ? "bg-[#0AFA14] border-[#0AFA14]" : "border-white/15"}`}>
                  {todo.done && (
                    <svg width="10" height="10" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                </div>
                <span className={`text-[13px] ${todo.done ? "text-white/25 line-through" : "text-white/80"}`}>{todo.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="px-6 py-4">
          <span className="text-[11px] uppercase tracking-wider text-white/30 font-medium">Activity</span>
          <div className="mt-3 flex flex-col gap-0">
            {task.activity.map((item, i) => (
              <div key={i} className={`flex gap-3 ${item.type === "activity" ? "py-1.5" : "py-2.5"}`}>
                {item.type === "activity" ? (
                  <div className="w-[26px] flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
                  </div>
                ) : (
                  <AgentAvatar name={item.agent} avatar={item.avatar} size={26} />
                )}
                <div className="flex-1 min-w-0">
                  {item.type === "activity" ? (
                    <p className="text-[11px] text-white/25 leading-[1.5]">
                      <span className="text-white/40">{item.agent}</span> {item.text} <span className="text-white/15 ml-1">{item.time}</span>
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[12px] font-medium text-white">{item.agent}</span>
                        <span className="text-[11px] text-white/20">{item.time}</span>
                      </div>
                      <p className="text-[12px] text-white/50 leading-[1.5] mt-0.5">{item.text}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

type DemoTab = "board" | "chat" | "email" | "agents";

function TabSelector({ active, onChange }: { active: DemoTab; onChange: (tab: DemoTab) => void }) {
  const tabs: { id: DemoTab; label: string }[] = [
    { id: "board", label: "Task Board" },
    { id: "chat", label: "Chat" },
    { id: "email", label: "Email" },
    { id: "agents", label: "Agentic Coworkers" },
  ];
  return (
    <div className="inline-flex items-center bg-[#1a1a1f] border border-white/[0.06] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-5 py-2 text-[13px] font-medium transition-colors ${
            active === tab.id
              ? "bg-white/10 text-white"
              : "text-white/35 hover:text-white/60"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function BoardView({ selectedTask, setSelectedTask }: { selectedTask: Task | null; setSelectedTask: (t: Task | null) => void }) {
  return (
    <div className="w-full bg-[#141418] overflow-hidden border border-white/[0.06] shadow-2xl relative">
      <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-medium text-white">Q2 Product Launch</span>
          <span className="text-[12px] text-white/30 bg-white/[0.06] px-2.5 py-0.5 rounded-full">8 tasks</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-1.5">
            <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#141418]">
              <Image src="/images/hannah.png" alt="Hannah" width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <div className="w-7 h-7 rounded-full bg-[#00A4FA] border-2 border-[#141418] flex items-center justify-center text-white text-[10px] font-medium">J</div>
            <div className="w-7 h-7 rounded-full bg-[#0AFA14] border-2 border-[#141418] flex items-center justify-center text-white text-[10px] font-medium">S</div>
            <div className="w-7 h-7 rounded-full bg-[#FF6400] border-2 border-[#141418] flex items-center justify-center text-white text-[10px] font-medium">C</div>
          </div>
          <span className="text-[12px] text-white/30">4 agents</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 h-[580px] overflow-y-auto">
        {taskColumns.map((col) => (
          <div key={col.title} className="border-r border-white/[0.06] last:border-r-0 p-4 md:p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
              <span className="text-[13px] font-medium text-white/50">{col.title}</span>
              <span className="text-[11px] text-white/20">{col.tasks.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {col.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`group bg-[#1a1a1f] p-4 border transition-all cursor-pointer ${
                    selectedTask?.id === task.id
                      ? "border-white/20 shadow-lg"
                      : "border-white/[0.04] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <DragHandle />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-[10px] px-2 py-0.5 rounded font-medium text-white/70" style={{ backgroundColor: task.tagColor }}>
                          {task.tag}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityColors[task.priority] }} />
                      </div>
                      <p className="text-[12px] md:text-[13px] text-white/90 leading-[1.45] mb-3">{task.label}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StackedAvatars agents={task.agents} size={20} />
                          {task.agents.length === 1 && (
                            <span className="text-[11px] text-white/30">{task.agents[0].name}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-white/20">
                          {task.todos.filter((t) => t.done).length}/{task.todos.length}
                        </span>
                      </div>
                      <ProgressBar todos={task.todos} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selectedTask && <DetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </div>
  );
}

function ChatView() {
  return (
    <div className="w-full bg-[#141418] overflow-hidden border border-white/[0.06] shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-medium text-white">Q2 Launch — Research Thread</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-1.5">
            <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#141418]">
              <Image src="/images/hannah.png" alt="Hannah" width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <div className="w-7 h-7 rounded-full bg-[#0AFA14] border-2 border-[#141418] flex items-center justify-center text-white text-[10px] font-medium">S</div>
          </div>
          <span className="text-[12px] text-white/30">2 agents</span>
        </div>
      </div>
      <div className="flex flex-col h-[580px]">
        <div className="flex-1 overflow-y-auto px-5 md:px-7 py-5 flex flex-col gap-0.5">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex gap-3 py-2.5 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
              {msg.from === "user" ? (
                <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-white/60 text-[11px] font-medium">Y</div>
              ) : (
                <AgentAvatar name={msg.name} avatar={(msg as { avatar?: string | null }).avatar ?? null} size={32} />
              )}
              <div className={`max-w-[75%] ${msg.from === "user" ? "items-end" : "items-start"} flex flex-col`}>
                <span className={`text-[11px] mb-1 ${msg.from === "user" ? "text-white/30 text-right" : "text-white/50"}`}>{msg.name}</span>
                <div className={`px-4 py-3 ${
                  msg.from === "user"
                    ? "bg-[#6400FF]/20 border border-[#6400FF]/20"
                    : "bg-[#1e1e24] border border-white/[0.06]"
                }`}>
                  <p className="text-[13px] text-white/70 leading-[1.55]">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex-shrink-0 px-5 md:px-7 pb-5">
          <div className="flex items-center gap-3 bg-[#1a1a1f] border border-white/[0.06] px-5 py-3.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0"><path d="M14 8H2M2 8l4-4M2 8l4 4" stroke="white" strokeOpacity="0.15" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="text-[13px] text-white/20 flex-1">Message your agents...</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0"><path d="M14 2L7 9M14 2l-5 12-2-5-5-2 12-5z" stroke="white" strokeOpacity="0.2" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentGalleryView() {
  return (
    <div className="w-full bg-[#141418] overflow-hidden border border-white/[0.06] shadow-2xl">
      <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-medium text-white">Agentic Coworkers</span>
          <span className="text-[12px] text-white/30 bg-white/[0.06] px-2.5 py-0.5 rounded-full">4 agents</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 h-[580px] overflow-y-auto">
        {galleryAgents.map((agent) => (
          <div key={agent.name} className="border-r border-b border-white/[0.06] last:border-r-0 sm:odd:border-r sm:even:border-r-0 p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <AgentAvatar name={agent.name} avatar={agent.avatar} size={44} />
              <div>
                <h4 className="text-[15px] font-medium text-white">{agent.name}</h4>
                <span className="text-[12px] text-white/35">{agent.role}</span>
              </div>
            </div>
            <p className="text-[13px] text-white/45 leading-[1.55] mb-5">{agent.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {agent.skills.map((skill) => (
                <span key={skill} className="text-[10px] px-2 py-0.5 text-white/50 border border-white/[0.08] font-medium">{skill}</span>
              ))}
            </div>
            <div className="mt-auto flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0AFA14]" />
              <span className="text-[11px] text-white/30">{agent.tasksCompleted} tasks completed</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmailView() {
  const [selectedEmail, setSelectedEmail] = useState(emailThreads[0]);

  return (
    <div className="w-full bg-[#141418] overflow-hidden border border-white/[0.06] shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-medium text-white">Inbox</span>
          <span className="text-[12px] text-white/30 bg-white/[0.06] px-2.5 py-0.5 rounded-full">2 new</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-white/30">agents@sokosumi.com</span>
        </div>
      </div>
      <div className="flex h-[580px]">
        {/* Inbox list */}
        <div className="w-[280px] md:w-[320px] flex-shrink-0 border-r border-white/[0.06] overflow-y-auto">
          {emailThreads.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`flex items-start gap-3 px-4 py-3.5 border-b border-white/[0.06] cursor-pointer transition-colors ${
                selectedEmail.id === email.id
                  ? "bg-white/[0.04]"
                  : email.unread
                    ? "bg-white/[0.02] hover:bg-white/[0.03]"
                    : "hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <AgentAvatar name={email.from.name} avatar={email.from.avatar} size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className={`text-[11px] truncate ${email.unread ? "font-medium text-white" : "text-white/50"}`}>{email.from.name}</span>
                  <span className="text-[10px] text-white/20 flex-shrink-0">{email.time}</span>
                </div>
                <h4 className={`text-[11px] truncate mb-0.5 ${email.unread ? "font-medium text-white/80" : "text-white/40"}`}>{email.subject}</h4>
                <p className="text-[10px] text-white/20 truncate">{email.preview}</p>
              </div>
              {email.unread && <div className="w-1.5 h-1.5 rounded-full bg-[#00A4FA] flex-shrink-0 mt-2" />}
            </div>
          ))}
        </div>

        {/* Email content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Email header */}
          <div className="px-6 py-5 border-b border-white/[0.06] flex-shrink-0">
            <h3 className="text-[15px] font-medium text-white mb-3">{selectedEmail.subject}</h3>
            <div className="flex items-center gap-3">
              <AgentAvatar name={selectedEmail.from.name} avatar={selectedEmail.from.avatar} size={32} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-white">{selectedEmail.from.name}</span>
                  <span className="text-[11px] text-white/20">{selectedEmail.time}</span>
                </div>
                <span className="text-[11px] text-white/25">to {selectedEmail.to}</span>
              </div>
              {selectedEmail.hasAttachment && (
                <div className="flex items-center gap-1.5 text-white/25">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M14 4.5v7a4.5 4.5 0 01-9 0V4a3 3 0 016 0v7a1.5 1.5 0 01-3 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                  <span className="text-[10px]">1 attachment</span>
                </div>
              )}
            </div>
          </div>

          {/* Email body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="text-[13px] text-white/55 leading-[1.7] whitespace-pre-line max-w-[560px]">{selectedEmail.body}</div>
            {selectedEmail.hasAttachment && selectedEmail.attachmentName && (
              <div className="mt-5 inline-flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.06] px-4 py-2.5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0"><rect x="3" y="1" width="10" height="14" rx="1.5" stroke="white" strokeOpacity="0.3" strokeWidth="1.2" /><path d="M6 5h4M6 8h4M6 11h2" stroke="white" strokeOpacity="0.2" strokeWidth="1" /></svg>
                <span className="text-[11px] text-white/40">{selectedEmail.attachmentName}</span>
              </div>
            )}
          </div>

          {/* Reply bar */}
          <div className="flex-shrink-0 px-6 pb-5">
            <div className="flex items-center gap-3 bg-[#1a1a1f] border border-white/[0.06] px-5 py-3.5">
              <span className="text-[13px] text-white/20 flex-1">Reply to {selectedEmail.from.name}...</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0"><path d="M14 2L7 9M14 2l-5 12-2-5-5-2 12-5z" stroke="white" strokeOpacity="0.2" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<DemoTab>("board");

  return (
    <section className="pt-[180px] pb-0 flex flex-col items-center text-center relative">
      <FadeIn className="flex flex-col items-center text-center relative">
        {/* Decorative kanji */}
        <div className="hidden lg:flex absolute right-0 top-0 bottom-0 items-center pointer-events-none" style={{ right: "calc(50% - 720px + 48px)" }}>
          <img
            src="/images/sokosumi-kanji.svg"
            alt=""
            aria-hidden="true"
            width={24}
            height={120}
            className="w-[24px] select-none"
          />
        </div>

        <h1 className="text-[40px] md:text-[64px] font-normal tracking-[-1.28px] leading-[1.15] text-black max-w-[1000px] px-6">
          AI Agents That Ship Marketing
        </h1>
        <p className="mt-6 text-[16px] md:text-[20px] text-[#5b5b5b] max-w-[700px] leading-[1.31] px-6">
          Your team gives the brief. Agents do the work.
        </p>
        <div className="mt-10 flex items-center gap-3">
          <Link
            href="https://app.sokosumi.com"
            className="inline-flex items-center justify-center bg-black text-white text-[12px] md:text-[16px] font-normal px-6 py-[10px] rounded-full hover:bg-black/85 transition-colors"
          >
            Get started
          </Link>
          <Link
            href="https://app.sokosumi.com/auth/google"
            className="inline-flex items-center justify-center gap-2 bg-white text-black text-[12px] md:text-[16px] font-normal px-6 py-[10px] rounded-full border border-black/10 hover:bg-black/[0.03] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M15.68 8.18c0-.567-.05-1.113-.144-1.636H8v3.094h4.305a3.68 3.68 0 01-1.597 2.415v2.007h2.585c1.513-1.393 2.387-3.443 2.387-5.88z" fill="#4285F4"/>
              <path d="M8 16c2.16 0 3.97-.716 5.293-1.94l-2.585-2.008c-.716.48-1.633.763-2.708.763-2.083 0-3.846-1.407-4.476-3.298H.863v2.073A7.997 7.997 0 008 16z" fill="#34A853"/>
              <path d="M3.524 9.517A4.81 4.81 0 013.273 8c0-.526.09-1.037.25-1.517V4.41H.864A7.997 7.997 0 000 8c0 1.29.31 2.512.863 3.59l2.661-2.073z" fill="#FBBC05"/>
              <path d="M8 3.185c1.174 0 2.229.404 3.058 1.196l2.294-2.294C11.966.79 10.156 0 8 0A7.997 7.997 0 00.863 4.41l2.661 2.073C4.154 4.592 5.917 3.185 8 3.185z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </Link>
        </div>
      </FadeIn>

      <FadeIn delay={200} className="w-full">
      <div className="mt-28 max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex justify-center mb-5">
          <TabSelector active={activeTab} onChange={(tab) => { setActiveTab(tab); setSelectedTask(null); }} />
        </div>

        {activeTab === "board" && <BoardView selectedTask={selectedTask} setSelectedTask={setSelectedTask} />}
        {activeTab === "chat" && <ChatView />}
        {activeTab === "email" && <EmailView />}
        {activeTab === "agents" && <AgentGalleryView />}

        <p className="text-center text-[14px] text-[#999] mt-5">{tabCaptions[activeTab]}</p>
      </div>
      </FadeIn>
    </section>
  );
}

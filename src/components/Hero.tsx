import Link from "next/link";
import Image from "next/image";

const taskColumns = [
  {
    title: "To Do",
    color: "#e8e8e8",
    tasks: [
      { agent: "Hannah", avatar: "/images/hannah.png", label: "Audience research for Q2 campaign", tag: "Research", tagColor: "#e8d5f5" },
      { agent: "John", avatar: null, label: "Break down product launch brief", tag: "Planning", tagColor: "#d5e8f5" },
    ],
  },
  {
    title: "In Progress",
    color: "#ffeeba",
    tasks: [
      { agent: "Hannah", avatar: "/images/hannah.png", label: "Competitive landscape analysis", tag: "Research", tagColor: "#e8d5f5" },
      { agent: "SEO Agent", avatar: null, label: "Generate SEO outlines for blog series", tag: "SEO", tagColor: "#d5f5e8" },
    ],
  },
  {
    title: "Review",
    color: "#b8daff",
    tasks: [
      { agent: "Copy Agent", avatar: null, label: "Ad variations for LinkedIn campaign", tag: "Copy", tagColor: "#f5e8d5" },
    ],
  },
  {
    title: "Done",
    color: "#c3e6cb",
    tasks: [
      { agent: "Hannah", avatar: "/images/hannah.png", label: "Market sizing report — EMEA", tag: "Research", tagColor: "#e8d5f5" },
      { agent: "John", avatar: null, label: "Campaign timeline & milestones", tag: "Planning", tagColor: "#d5e8f5" },
    ],
  },
];

function AgentAvatar({ name, avatar }: { name: string; avatar: string | null }) {
  if (avatar) {
    return (
      <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
        <Image src={avatar} alt={name} width={20} height={20} className="w-full h-full object-cover" />
      </div>
    );
  }
  const colors: Record<string, string> = {
    John: "#4a7cff",
    "SEO Agent": "#2cb67d",
    "Copy Agent": "#e87b35",
  };
  return (
    <div
      className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-medium"
      style={{ backgroundColor: colors[name] || "#999" }}
    >
      {name[0]}
    </div>
  );
}

const logos = [
  { name: "Serviceplan", width: "w-[110px]" },
  { name: "GWI", width: "w-[50px]" },
  { name: "Statista", width: "w-[80px]" },
  { name: "HubSpot", width: "w-[80px]" },
  { name: "Salesforce", width: "w-[90px]" },
];

export default function Hero() {
  return (
    <section className="pt-[180px] pb-0 flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 bg-white border border-black/10 rounded-full px-4 py-1.5 mb-8">
        <div className="w-2 h-2 rounded-full bg-[#2cb67d]" />
        <span className="text-[13px] text-[#666]">Now in Early Access</span>
      </div>

      <h1 className="text-[40px] md:text-[64px] font-normal tracking-[-1.28px] leading-[1.15] text-black max-w-[1000px] px-6">
        AI Marketing Agents for Teams That Need Output
      </h1>
      <p className="mt-6 text-[16px] md:text-[20px] text-[#5b5b5b] max-w-[700px] leading-[1.31] px-6">
        Sokosumi lets marketing teams work with specialized AI agents&mdash;so
        real work gets done faster.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/get-started"
          className="inline-flex items-center justify-center bg-black text-white text-[12px] md:text-[16px] font-normal px-6 py-[10px] rounded-full hover:bg-black/85 transition-colors"
        >
          Get started
        </Link>
        <Link
          href="/product"
          className="inline-flex items-center justify-center text-[12px] md:text-[16px] font-normal px-6 py-[10px] rounded-full border border-black/15 text-black hover:bg-black/[0.03] transition-colors"
        >
          See how it works
        </Link>
      </div>

      {/* Task Board mockup */}
      <div className="mt-20 w-full max-w-[1440px] px-4 md:px-8 lg:px-12">
        <div className="w-full bg-white rounded-[20px] overflow-hidden border border-black/5 shadow-sm">
          {/* Board header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
            <div className="flex items-center gap-3">
              <span className="text-[14px] font-medium text-black">Q2 Product Launch</span>
              <span className="text-[11px] text-[#999] bg-[#f4f4f4] px-2 py-0.5 rounded-full">8 tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-white">
                  <Image src="/images/hannah.png" alt="Hannah" width={24} height={24} className="w-full h-full object-cover" />
                </div>
                <div className="w-6 h-6 rounded-full bg-[#4a7cff] border-2 border-white flex items-center justify-center text-white text-[9px] font-medium">J</div>
                <div className="w-6 h-6 rounded-full bg-[#2cb67d] border-2 border-white flex items-center justify-center text-white text-[9px] font-medium">S</div>
                <div className="w-6 h-6 rounded-full bg-[#e87b35] border-2 border-white flex items-center justify-center text-white text-[9px] font-medium">C</div>
              </div>
              <span className="text-[11px] text-[#999]">4 agents</span>
            </div>
          </div>

          {/* Board columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 min-h-[340px]">
            {taskColumns.map((col) => (
              <div key={col.title} className="border-r border-black/5 last:border-r-0 p-3 md:p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-[12px] font-medium text-[#666]">{col.title}</span>
                  <span className="text-[10px] text-[#aaa]">{col.tasks.length}</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {col.tasks.map((task) => (
                    <div key={task.label} className="bg-[#fafafa] rounded-lg p-3 border border-black/[0.03] hover:border-black/10 transition-colors">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: task.tagColor }}>
                          {task.tag}
                        </span>
                      </div>
                      <p className="text-[11px] md:text-[12px] text-black leading-[1.4] mb-2.5">{task.label}</p>
                      <div className="flex items-center gap-1.5">
                        <AgentAvatar name={task.agent} avatar={task.avatar} />
                        <span className="text-[10px] text-[#888]">{task.agent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="mt-16 mb-4 flex flex-col items-center gap-6">
          <p className="text-[13px] text-[#999] tracking-wide uppercase">Developed with and trusted by</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {logos.map((logo) => (
              <div key={logo.name} className={`${logo.width} h-6 flex items-center justify-center`}>
                <span className="text-[14px] font-medium text-[#c0c0c0] tracking-tight">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

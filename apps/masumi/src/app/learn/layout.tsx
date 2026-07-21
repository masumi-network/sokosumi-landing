import { Footer, Header } from "@summation/shared";
import { LearnSubnav } from "./learn-subnav";
import { SessionHeartbeat } from "./session-heartbeat";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#F5F5F5]"><SessionHeartbeat /><Header product="masumi" /><LearnSubnav /><main className="px-5 pb-24 pt-[198px] sm:px-8"><div className="mx-auto max-w-6xl">{children}</div></main><Footer product="masumi" /></div>;
}

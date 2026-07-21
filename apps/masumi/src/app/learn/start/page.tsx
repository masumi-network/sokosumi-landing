import { PathFinder } from "../path-finder";

export const metadata = { title: "Choose a Learn path" };

export default function LearnStartPage() {
  return <><header className="mb-10 max-w-3xl"><p className="text-xs uppercase tracking-[0.18em] text-[#A50045]">Unit 0 · Welcome</p><h1 className="mt-3 text-5xl font-medium tracking-tight sm:text-7xl">Choose the path you need.</h1><p className="mt-5 text-lg leading-8 text-black/60">Fundamentals takes about 65 minutes. Builders can continue into a Preprod project; product learners and auditors can use the public library without assessment pressure.</p></header><PathFinder /></>;
}

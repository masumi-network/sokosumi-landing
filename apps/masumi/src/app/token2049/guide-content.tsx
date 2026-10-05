import { Fragment } from "react";
import Command from "./command";
import { parseGuide, parseGuideInline } from "./guide-format";

function Inline({ text }: { text: string }) {
  return parseGuideInline(text).map((part, index) => {
    if (part.kind === "code") return <code key={index} className="break-words rounded bg-[#F7E5EE] px-1.5 py-0.5 text-sm text-[#171717]">{part.text}</code>;
    if (part.kind === "strong") return <strong key={index} className="font-medium text-[#171717]">{part.text}</strong>;
    if (part.kind === "link") return <a key={index} href={part.text} className="break-words text-[#171717] underline underline-offset-4 hover:text-[#B90065]">{part.text}</a>;
    return <Fragment key={index}>{part.text}</Fragment>;
  });
}

export default function GuideContent({ markdown }: { markdown: string }) {
  return <article className="min-w-0 space-y-5 text-base leading-7 text-[#454545]">
    {parseGuide(markdown).map((block, index) => {
      if (block.kind === "heading" && block.level === 3) return <h3 key={index} id={`guide-${index}`} className="scroll-mt-28 pt-6 text-xl font-medium leading-snug text-[#171717]">{block.text}</h3>;
      if (block.kind === "heading") return <h2 key={index} id={`guide-${index}`} className="scroll-mt-28 border-t border-[#171717]/15 pb-1 pt-9 text-2xl font-medium leading-tight tracking-tight text-[#171717]">{block.text}</h2>;
      if (block.kind === "code") return <Command key={index} configuration={block.configuration}>{block.text}</Command>;
      if (block.kind === "list") return <ul key={index} className="list-disc space-y-2 ps-5">{block.text.split("\n").map((item, itemIndex) => <li key={itemIndex}><Inline text={item} /></li>)}</ul>;
      return <p key={index}><Inline text={block.text} /></p>;
    })}
  </article>;
}

import { Fragment } from "react";
import Command from "./command";
import { parseGuide } from "./guide-format";

function Inline({ text }: { text: string }) {
  return text.split(/(`[^`]+`|https:\/\/[^\s]+)/g).map((part, index) => {
    if (part.startsWith("`")) return <code key={index} className="break-words rounded bg-[#F7E5EE] px-1.5 py-0.5 text-sm text-[#460A23]">{part.slice(1, -1)}</code>;
    if (part.startsWith("https://")) {
      const url = part.replace(/[.,]$/, "");
      return <Fragment key={index}><a href={url} className="break-words text-[#460A23] underline underline-offset-4 hover:text-[#B90065]">{url}</a>{part.slice(url.length)}</Fragment>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export default function GuideContent({ markdown }: { markdown: string }) {
  return <article className="min-w-0 space-y-5 text-base leading-7 text-[#454545]">
    {parseGuide(markdown).map((block, index) => {
      if (block.kind === "heading") return <h2 key={index} id={`guide-${index}`} className="scroll-mt-28 border-t border-[#460A23]/15 pb-1 pt-9 text-2xl font-medium leading-tight tracking-tight text-[#241B20]">{block.text}</h2>;
      if (block.kind === "code") return <Command key={index}>{block.text}</Command>;
      if (block.kind === "list") return <ul key={index} className="list-disc space-y-2 pl-5">{block.text.split("\n").map((item, itemIndex) => <li key={itemIndex}><Inline text={item} /></li>)}</ul>;
      return <p key={index}><Inline text={block.text} /></p>;
    })}
  </article>;
}

import { draftMode } from "next/headers";

// Slim fixed bar shown only while Next.js draft mode is enabled, so editors
// always know they are looking at unpublished CMS content.
export default async function DraftBanner() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] flex items-center justify-center gap-3 bg-[#111] px-4 py-2 text-[12px] text-white/80">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FA008C]" />
      <span>Draft preview</span>
      <a
        href="/api/exit-preview"
        className="font-medium text-white underline underline-offset-2 hover:text-white/70"
      >
        Exit preview
      </a>
    </div>
  );
}

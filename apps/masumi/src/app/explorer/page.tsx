import { redirect } from "next/navigation";

// The standalone /explorer page has been superseded by the combined
// /agent-explorer page (agent registry + on-chain explorer). The original
// implementation is preserved as a draft at src/app/_drafts/explorer-page.tsx.
export default function ExplorerPage() {
  redirect("/agent-explorer");
}

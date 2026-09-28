import { ExplorerPageView, buildMetadata } from "../../explorer/view";

export const metadata = buildMetadata("de");

export default function Page() {
  return <ExplorerPageView locale="de" />;
}

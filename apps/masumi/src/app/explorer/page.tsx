import { ExplorerPageView, buildMetadata } from "./view";

export const metadata = buildMetadata("en");

export default function Page() {
  return <ExplorerPageView locale="en" />;
}

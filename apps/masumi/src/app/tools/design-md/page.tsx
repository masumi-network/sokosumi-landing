import { DesignMdView, buildMetadata } from "./view";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata("en");

export default function Page() {
  return <DesignMdView locale="en" />;
}

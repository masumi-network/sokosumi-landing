import { GlossaryIndexView, buildMetadata } from "./view";

export const metadata = buildMetadata("en");

export default function Page() {
  return <GlossaryIndexView locale="en" />;
}

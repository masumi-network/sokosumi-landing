import { GlossaryIndexView, buildMetadata } from "../../glossary/view";

export const metadata = buildMetadata("de");

export default function Page() {
  return <GlossaryIndexView locale="de" />;
}

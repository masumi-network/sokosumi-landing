import { DesignMdView, buildMetadata } from "../../../tools/design-md/view";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata("de");

export default function Page() {
  return <DesignMdView locale="de" />;
}

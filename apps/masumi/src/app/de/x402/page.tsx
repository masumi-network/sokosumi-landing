import { X402View, buildMetadata } from "../../x402/view";

export const metadata = buildMetadata("de");

export default function Page() {
  return <X402View locale="de" />;
}

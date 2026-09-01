import { X402ProtocolView, buildMetadata } from "../../x402-protocol/view";

export const metadata = buildMetadata("de");

export default function Page() {
  return <X402ProtocolView locale="de" />;
}

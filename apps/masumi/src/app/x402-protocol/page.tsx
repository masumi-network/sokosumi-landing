import { X402ProtocolView, buildMetadata } from "./view";

export const metadata = buildMetadata("en");

export default function Page() {
  return <X402ProtocolView locale="en" />;
}

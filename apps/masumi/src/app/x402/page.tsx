import { X402View, buildMetadata } from "./view";

export const metadata = buildMetadata("en");

export default function Page() {
  return <X402View locale="en" />;
}

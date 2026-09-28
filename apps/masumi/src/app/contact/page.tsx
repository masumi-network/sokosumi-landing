import { ContactPageView, buildMetadata } from "./view";

export const metadata = buildMetadata("en");

export default function Page() {
  return <ContactPageView locale="en" />;
}

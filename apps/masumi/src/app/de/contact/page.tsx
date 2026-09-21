import { ContactPageView, buildMetadata } from "../../contact/view";

export const metadata = buildMetadata("de");

export default function Page() {
  return <ContactPageView locale="de" />;
}

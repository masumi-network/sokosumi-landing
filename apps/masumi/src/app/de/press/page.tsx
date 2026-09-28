import { PressPageView, buildMetadata } from "../../press/view";

export const revalidate = 3600;

export const metadata = buildMetadata("de");

export default function Page() {
  return <PressPageView locale="de" />;
}

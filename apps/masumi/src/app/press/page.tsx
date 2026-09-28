import { PressPageView, buildMetadata } from "./view";

export const revalidate = 3600;

export const metadata = buildMetadata("en");

export default function Page() {
  return <PressPageView locale="en" />;
}

import { HomeView, buildMetadata } from "./view";

export const metadata = buildMetadata("en");

export default function Page() {
  return <HomeView locale="en" />;
}

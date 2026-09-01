import { HomeView, buildMetadata } from "../view";

export const metadata = buildMetadata("de");

export default function Page() {
  return <HomeView locale="de" />;
}

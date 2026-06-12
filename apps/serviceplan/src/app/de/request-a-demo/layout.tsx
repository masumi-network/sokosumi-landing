import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo anfragen",
};

export default function DeRequestADemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

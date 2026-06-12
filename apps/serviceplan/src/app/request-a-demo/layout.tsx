import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a Demo",
};

export default function RequestADemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
